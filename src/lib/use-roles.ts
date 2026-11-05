import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Role = "socio_fundador" | "socio" | "gerente" | "diretor" | "funcionario" | "vendedor";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
      const roles = (data ?? []).map((r) => r.role as Role);
      const has = (...r: Role[]) => r.some((x) => roles.includes(x));
      return {
        user: u.user,
        roles,
        isGestao: has("socio_fundador", "socio", "gerente", "diretor"),
        canSell: has("vendedor", "gerente", "socio_fundador"),
        isDirecao: has("socio_fundador", "gerente", "diretor"),
        isSocio: has("socio_fundador", "socio"),
      };
    },
  });
}
