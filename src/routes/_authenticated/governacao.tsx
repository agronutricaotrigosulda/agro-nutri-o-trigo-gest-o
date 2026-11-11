import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Money } from "@/lib/format";
import { NoAccess, PageTitle } from "@/components/page";
import { useMe } from "@/lib/use-roles";
import { deliberacao, nivelAprovacao } from "@/lib/rules";

export const Route = createFileRoute("/_authenticated/governacao")({
  head: () => ({ meta: [{ title: "Governação — Agro-Nutrição Trigo" }, { name: "description", content: "Sócios, deliberações e aprovações." }, { property: "og:title", content: "Governação — Agro-Nutrição Trigo" }, { property: "og:description", content: "Governação societária." }] }),
  component: Gov,
});

const LEVEL = { diretor: "Diretor", gerente: "Gerente/CEO", socios: "Sócios" };

function Gov() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["gov"],
    queryFn: async () => {
      const [s, r, a] = await Promise.all([
        supabase.from("shareholders").select("*").order("name"),
        supabase.from("resolutions").select("*, resolution_votes(*)").order("created_at", { ascending: false }),
        supabase.from("approvals").select("*").order("created_at", { ascending: false }),
      ]);
      return { sh: s.data ?? [], res: r.data ?? [], apr: a.data ?? [] };
    },
  });
  const [sh, setSh] = useState({ name: "", capital_pct: "", founder: false });
  const [res, setRes] = useState({ title: "", description: "", qualified_quorum:true });
  const [apr, setApr] = useState({ title: "", amount: "" });
  if (me && !me.isSocio) return <NoAccess />;
  const shs = data?.sh ?? [];
  const totalCap = shs.reduce((a, s) => a + Number(s.capital_pct), 0);
  const refresh = () => qc.invalidateQueries({ queryKey: ["gov"] });

  async function vote(r: any, shId: string, v: "favor" | "contra" | "veto") {
    const { error } = await supabase.rpc("cast_resolution_vote",{_id:r.id,_vote:v});
    if (error) return toast.error(error.message);
    refresh();
  }
  async function decide(id: string, status: "aprovado" | "rejeitado") {
    const {error}=await supabase.rpc("decide_approval",{_id:id,_status:status});if(error)return toast.error(error.message);refresh();
  }
  const canDecide = (level: string) =>
    level === "diretor" ? me?.isGestao : level === "gerente" ? me?.roles.includes("gerente") || me?.isSocio : me?.isSocio;

  return (
    <>
      <PageTitle title="Governação Societária" subtitle="Quórum qualificado de 70% do capital · veto dos Sócios Fundadores" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Sócios ({totalCap}% do capital)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {shs.map((s) => (
              <div key={s.id} className="flex justify-between rounded-md bg-muted px-3 py-2 text-sm">
                <span>{s.name} {s.founder && <Badge className="ml-1 bg-secondary text-secondary-foreground">Fundador · veto</Badge>}</span><span className="font-semibold">{Number(s.capital_pct)}%</span>
              </div>
            ))}
            {me?.isDirecao && (
              <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                <Input placeholder="Nome" value={sh.name} onChange={(e) => setSh({ ...sh, name: e.target.value })} className="max-w-[180px]" />
                <Input placeholder="% capital" type="number" value={sh.capital_pct} onChange={(e) => setSh({ ...sh, capital_pct: e.target.value })} className="max-w-[110px]" />
                <label className="flex items-center gap-1 text-sm"><Switch checked={sh.founder} onCheckedChange={(v) => setSh({ ...sh, founder: v })} /> Fundador</label>
                <Button size="sm" onClick={async () => {
                  if (totalCap + Number(sh.capital_pct) > 100) return toast.error("O capital total não pode exceder 100%");
                  const { error } = await supabase.from("shareholders").insert({ ...sh, capital_pct: Number(sh.capital_pct) });
                  if (error) return toast.error(error.message); setSh({ name: "", capital_pct: "", founder: false }); refresh();
                }}>Adicionar</Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Pedidos de aprovação</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Input placeholder="Pedido" value={apr.title} onChange={(e) => setApr({ ...apr, title: e.target.value })} className="max-w-[200px]" />
              <Input placeholder="Valor" type="number" value={apr.amount} onChange={(e) => setApr({ ...apr, amount: e.target.value })} className="max-w-[130px]" />
              <Button size="sm" onClick={async () => {
                if (!apr.title) return;
                await supabase.from("approvals").insert({ title: apr.title, amount: Number(apr.amount), level: nivelAprovacao(Number(apr.amount)) });
                setApr({ title: "", amount: "" }); refresh();
              }}>Submeter</Button>
            </div>
            <p className="text-xs text-muted-foreground">Até <Money value={50000}/>: Diretor · até <Money value={500000}/>: Gerente/CEO · acima: Sócios</p>
            {(data?.apr ?? []).map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                <span>{a.title} · <Money value={a.amount} /> · <em>{LEVEL[a.level as keyof typeof LEVEL]}</em></span>
                {a.status === "pendente" && canDecide(a.level) ? (
                  <span className="flex gap-1"><Button size="sm" onClick={() => decide(a.id, "aprovado")}>Aprovar</Button><Button size="sm" variant="outline" onClick={() => decide(a.id, "rejeitado")}>Rejeitar</Button></span>
                ) : <Badge variant="outline">{a.status}</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-5">
        <CardHeader><CardTitle className="text-lg">Deliberações</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Input placeholder="Título" value={res.title} onChange={(e) => setRes({ ...res, title: e.target.value })} className="max-w-xs" />
            <Input placeholder="Descrição" value={res.description} onChange={(e) => setRes({ ...res, description: e.target.value })} className="max-w-md" />
            <label className="flex items-center gap-2 text-sm"><Switch checked={res.qualified_quorum} onCheckedChange={v=>setRes({...res,qualified_quorum:v})}/>Exige 70% do capital</label>
            <Button onClick={async () => { if (!res.title) return; const {error}=await supabase.from("resolutions").insert(res);if(error)return toast.error(error.message);setRes({ title: "", description: "",qualified_quorum:true }); refresh(); }}>Abrir deliberação</Button>
          </div>
          {(data?.res ?? []).map((r: any) => {
            const favor = (r.resolution_votes ?? []).filter((v: any) => v.vote === "favor").reduce((a: number, v: any) => a + Number(shs.find((s) => s.id === v.shareholder_id)?.capital_pct ?? 0), 0);
            return (
              <div key={r.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div><div className="font-semibold">{r.title}</div><div className="text-xs text-muted-foreground">{r.description}</div></div>
                  <Badge className={r.status === "aprovada" ? "bg-success text-primary-foreground" : r.status === "rejeitada" ? "bg-destructive text-destructive-foreground" : "bg-warning text-foreground"}>{r.status} · {favor}% a favor</Badge>
                </div>
                {r.status === "aberta" && me?.isSocio && (
                  <div className="mt-2 space-y-1">
                    {shs.filter(s=>s.user_id===me.user.id).map((s) => {
                      const v = (r.resolution_votes ?? []).find((x: any) => x.shareholder_id === s.id)?.vote;
                      return (
                        <div key={s.id} className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="w-40 truncate">{s.name} ({Number(s.capital_pct)}%)</span>
                          {(["favor", "contra"] as const).map((x) => <Button key={x} size="sm" variant={v === x ? "default" : "outline"} onClick={() => vote(r, s.id, x)}>{x === "favor" ? "A favor" : "Contra"}</Button>)}
                          {s.founder && <Button size="sm" variant={v === "veto" ? "destructive" : "outline"} onClick={() => vote(r, s.id, "veto")}>Veto</Button>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
}
