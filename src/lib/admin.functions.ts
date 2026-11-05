import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ROLES = ["socio_fundador", "socio", "gerente", "diretor", "funcionario", "vendedor"] as const;

async function assertDirecao(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const ok = (data ?? []).some((r: any) => ["socio_fundador", "gerente"].includes(r.role));
  if (!ok) throw new Error("Apenas o Sócio Fundador ou Gerente pode gerir utilizadores");
}

export const inviteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ email: z.string().email(), fullName: z.string().min(2).max(120), role: z.enum(ROLES), redirectTo: z.string().url() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertDirecao(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: inv, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      data: { full_name: data.fullName },
      redirectTo: data.redirectTo,
    });
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("user_roles").upsert({ user_id: inv.user.id, role: data.role }, { onConflict: "user_id,role" });
    return { ok: true };
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(), role: z.enum(ROLES), add: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertDirecao(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.add) await supabaseAdmin.from("user_roles").upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
    else await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId).eq("role", data.role);
    return { ok: true };
  });
