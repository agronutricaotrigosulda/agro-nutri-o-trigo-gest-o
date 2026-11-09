import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Money } from "@/lib/format";
import { NoAccess, PageTitle } from "@/components/page";
import { useMe } from "@/lib/use-roles";
import { budgetAlert, distribuirLucro } from "@/lib/rules";
import { cn } from "@/lib/utils";
import { Payroll } from "@/components/payroll";

export const Route = createFileRoute("/_authenticated/financas")({
  head: () => ({ meta: [{ title: "Finanças — Agro-Nutrição Trigo" }, { name: "description", content: "Orçamento anual e reservas estatutárias." }, { property: "og:title", content: "Finanças — Agro-Nutrição Trigo" }, { property: "og:description", content: "Orçamento e reservas." }] }),
  component: Financas,
});

const COLOR = { verde: "bg-success/15 border-success text-success", amarelo: "bg-warning/20 border-warning text-foreground", vermelho: "bg-destructive/15 border-destructive text-destructive" };

function Financas() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const year = new Date().getFullYear();
  const { data: budgets = [] } = useQuery({ queryKey: ["budgets", year], queryFn: async () => (await supabase.from("budgets").select("*").eq("year", year).order("category")).data ?? [] });
  const { data: totals } = useQuery({
    queryKey: ["fin-totals", year],
    queryFn: async () => {
      const [s, p] = await Promise.all([
        supabase.from("sales").select("total").gte("created_at", `${year}-01-01`),
        supabase.from("projects").select("revenue, expenses"),
      ]);
      const vendas = (s.data ?? []).reduce((a, x) => a + Number(x.total), 0);
      const rec = (p.data ?? []).reduce((a, x) => a + Number(x.revenue), 0);
      const exp = (p.data ?? []).reduce((a, x) => a + Number(x.expenses), 0);
      return { faturamento: vendas + rec, saidas: exp };
    },
  });
  const [n, setN] = useState({ category: "", planned: "" });
  if (me && !me.canFinance) return <NoAccess />;
  const gastoOrc = budgets.reduce((a, b) => a + Number(b.spent), 0);
  const saidas = (totals?.saidas ?? 0) + gastoOrc;
  const lucro = (totals?.faturamento ?? 0) - saidas;
  const dist = distribuirLucro(lucro);

  async function add() {
    if (!n.category) return;
    const { error } = await supabase.from("budgets").insert({ year, category: n.category, planned: Number(n.planned) });
    if (error) return toast.error(error.message);
    setN({ category: "", planned: "" }); qc.invalidateQueries({ queryKey: ["budgets"] });
  }
  async function spend(id: string, current: number, v: string) {
    const add = Number(v); if (!add) return;
    await supabase.from("budgets").update({ spent: current + add }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["budgets"] });
  }

  return (
    <>
      <PageTitle title="Finanças" subtitle={`Exercício ${year} · valores em Meticais`} />
      <section className="mb-8 border-b pb-6"><h2 className="mb-4 text-xl">Pagamento de salários</h2><Payroll finance /></section>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="pt-5"><div className="text-xs uppercase text-muted-foreground">Faturamento total</div><Money value={totals?.faturamento} className="text-2xl font-bold" /></CardContent></Card>
        <Card><CardContent className="pt-5"><div className="text-xs uppercase text-muted-foreground">Saída total</div><Money value={saidas} className="text-2xl font-bold" /></CardContent></Card>
        <Card><CardContent className="pt-5"><div className="text-xs uppercase text-muted-foreground">Lucro</div><Money value={lucro} className={cn("text-2xl font-bold", lucro < 0 ? "text-destructive" : "text-primary")} /></CardContent></Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-lg">Orçamento anual</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {budgets.map((b) => {
            const a = budgetAlert(Number(b.planned), Number(b.spent));
            const pct = Number(b.planned) ? Math.min(100, (Number(b.spent) / Number(b.planned)) * 100) : 0;
            return (
              <div key={b.id} className={cn("rounded-lg border-l-4 p-3", COLOR[a])}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{b.category}</span>
                  <span className="text-sm"><Money value={b.spent} /> de <Money value={b.planned} /> · resta <Money value={Number(b.planned) - Number(b.spent)} /></span>
                </div>
                <Progress value={pct} className="mt-2 h-2" />
                <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); const i = (e.currentTarget.elements.namedItem("v") as HTMLInputElement); spend(b.id, Number(b.spent), i.value); i.value = ""; }}>
                  <Input name="v" type="number" placeholder="Lançar despesa" className="h-8 max-w-[180px] bg-background" /><Button size="sm" variant="outline">Lançar</Button>
                </form>
              </div>
            );
          })}
          <div className="flex flex-wrap gap-2 border-t pt-3">
            <Input placeholder="Rubrica" value={n.category} onChange={(e) => setN({ ...n, category: e.target.value })} className="max-w-xs" />
            <Input placeholder="Valor previsto" type="number" value={n.planned} onChange={(e) => setN({ ...n, planned: e.target.value })} className="max-w-[180px]" />
            <Button onClick={add}>Adicionar rubrica</Button>
          </div>
          <p className="text-xs text-muted-foreground">Verde: saldo positivo · Amarelo: resta ≤ 20% · Vermelho: resta ≤ 10%</p>
        </CardContent>
      </Card>

      {me?.isSocio && <Card className="mt-6">
        <CardHeader><CardTitle className="text-lg">Distribuição estatutária do lucro</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4">
          {[["Reserva legal (25%)", dist.legal], ["Reinvestimento (20%)", dist.reinvestimento], ["Distribuição a sócios (50%)", dist.socios], ["Ação social (5%)", dist.social]].map(([l, v]) => (
            <div key={l as string} className="rounded-lg bg-accent p-3"><div className="text-xs text-accent-foreground">{l}</div><Money value={v as number} className="text-lg font-bold" /></div>
          ))}
        </CardContent>
      </Card>}
    </>
  );
}
