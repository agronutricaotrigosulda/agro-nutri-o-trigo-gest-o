import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { permissaoVendas } from "@/lib/rules";

export type Role = "socio_fundador" | "socio" | "gerente" | "diretor" | "funcionario" | "vendedor";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
      const roles = (data ?? []).map((r) => r.role as Role);
      const { data: access, error } = await supabase.from("user_access").select("*").eq("user_id", u.user.id).maybeSingle();
      if (error) throw error;
      const active = access?.status === "ativo";
      const level = access?.access_level;
      const partner = active && level === "socios";
      const manager = active && level === "gerentes";
      return {
        user: u.user,
        roles,
        access,
        isGestao: partner || manager,
        canSell: permissaoVendas(level,access?.sales_enabled??false,access?.status),
        isDirecao: partner || manager,
        isSocio: partner,
        canHR: partner || (active && level === "rh"),
        canFinance: partner || manager || (active && level === "financas"),
        canMarketing: partner || (active && level === "marketing"),
        canManageUsers: partner || manager,
      };
    },
  });
}
