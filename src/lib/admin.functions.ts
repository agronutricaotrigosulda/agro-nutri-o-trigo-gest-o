import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LEVELS = ["socios", "gerentes", "rh", "financas", "marketing", "funcionario"] as const;

async function assertDirecao(supabase: any, userId: string) {
  const { data } = await supabase.from("user_access").select("access_level,status").eq("user_id", userId).maybeSingle();
  const ok = data?.status === "ativo" && ["socios", "gerentes"].includes(data.access_level);
  if (!ok) throw new Error("Apenas o Sócio Fundador ou Gerente pode gerir utilizadores");
  return data.access_level;
}

export const inviteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ email: z.string().email(), fullName: z.string().min(2).max(120), level: z.enum(LEVELS), area: z.string().max(80), position: z.string().max(120), sales: z.boolean(), redirectTo: z.string().url() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const callerLevel = await assertDirecao(context.supabase, context.userId);
    if (data.level === "socios" && callerLevel !== "socios") throw new Error("Apenas sócios podem convidar sócios");
    const { getRequest } = await import("@tanstack/react-start/server");
    const requestUrl = new URL(getRequest().url);
    const origin = getRequest().headers.get("origin") ?? requestUrl.origin;
    const target = new URL(data.redirectTo);
    if (target.origin !== origin || target.pathname !== "/reset-password") throw new Error("Link de ativação inválido");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: inv, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      data: { full_name: data.fullName },
      redirectTo: data.redirectTo,
    });
    if (error) throw new Error(error.message);
    const { error: accessError } = await supabaseAdmin.from("user_access").upsert({ user_id: inv.user.id, access_level: data.level, area: data.area, position: data.position, sales_enabled: data.level === "funcionario" && data.sales });
    if (accessError) throw new Error("Convite enviado, mas acesso não atribuído; reveja o utilizador");
    const { error: legacyError } = await supabaseAdmin.from("user_roles").upsert({ user_id: inv.user.id, role: "funcionario" }, { onConflict: "user_id,role" });
    if (legacyError) throw new Error(legacyError.message);
    return { ok: true };
  });

