import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ROLE_LABEL } from "@/lib/format";
import { NoAccess, PageTitle } from "@/components/page";
import { useMe, type Role } from "@/lib/use-roles";
import { inviteUser, setUserRole } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/utilizadores")({
  head: () => ({ meta: [{ title: "Utilizadores — Agro-Nutrição Trigo" }, { name: "description", content: "Convidar funcionários e atribuir perfis." }, { property: "og:title", content: "Utilizadores — Agro-Nutrição Trigo" }, { property: "og:description", content: "Gestão de acessos." }] }),
  component: Users,
});

const ROLES = Object.keys(ROLE_LABEL) as Role[];

function Users() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const invite = useServerFn(inviteUser);
  const setRole = useServerFn(setUserRole);
  const { data } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const [p, r] = await Promise.all([supabase.from("profiles").select("*").order("full_name"), supabase.from("user_roles").select("*")]);
      return { p: p.data ?? [], r: r.data ?? [] };
    },
  });
  const [f, setF] = useState({ email: "", fullName: "", role: "funcionario" as Role });
  const [busy, setBusy] = useState(false);
  if (me && !(me.roles.includes("gerente") || me.roles.includes("socio_fundador"))) return <NoAccess />;

  return (
    <>
      <PageTitle title="Utilizadores" subtitle="O funcionário recebe um link de ativação por e-mail e define a sua senha" />
      <Card className="mb-5"><CardHeader><CardTitle className="text-lg">Convidar funcionário</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Input placeholder="Nome completo" value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} className="max-w-[220px]" />
          <Input placeholder="E-mail" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="max-w-[240px]" />
          <select className="rounded-md border bg-background px-2 text-sm" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as Role })}>
            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
          <Button disabled={busy} onClick={async () => {
            setBusy(true);
            try { await invite({ data: { ...f, redirectTo: `${window.location.origin}/reset-password` } }); toast.success("Convite enviado"); setF({ email: "", fullName: "", role: "funcionario" }); qc.invalidateQueries({ queryKey: ["users"] }); }
            catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
          }}>Enviar convite</Button>
        </CardContent>
      </Card>
      <Card><CardContent className="space-y-3 pt-4">
        {(data?.p ?? []).map((u) => {
          const has = (r: Role) => (data?.r ?? []).some((x) => x.user_id === u.id && x.role === r);
          return (
            <div key={u.id} className="rounded-md border p-3">
              <div className="font-semibold">{u.full_name} <span className="text-sm font-normal text-muted-foreground">{u.email}</span></div>
              <div className="mt-2 flex flex-wrap gap-3">
                {ROLES.map((r) => (
                  <label key={r} className="flex items-center gap-1 text-sm">
                    <Checkbox checked={has(r)} onCheckedChange={async (v) => {
                      try { await setRole({ data: { userId: u.id, role: r, add: !!v } }); qc.invalidateQueries(); } catch (e: any) { toast.error(e.message); }
                    }} /> {ROLE_LABEL[r]}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent></Card>
    </>
  );
}
