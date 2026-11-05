import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Money } from "@/lib/format";
import { PageTitle } from "@/components/page";
import { useMe } from "@/lib/use-roles";
import { tarefaUrgente } from "@/lib/rules";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({ meta: [{ title: "Painel — Agro-Nutrição Trigo" }, { name: "description", content: "Resumo da empresa." }, { property: "og:title", content: "Painel — Agro-Nutrição Trigo" }, { property: "og:description", content: "Resumo da empresa." }] }),
  component: Painel,
});

function Painel() {
  const { data: me } = useMe();
  const { data } = useQuery({
    queryKey: ["painel"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [sales, debts, tasks] = await Promise.all([
        supabase.from("sales").select("total, created_at").gte("created_at", today),
        supabase.from("debts").select("direction, amount, debt_payments(amount)"),
        supabase.from("tasks").select("id, title, due_date, done").eq("done", false).order("due_date"),
      ]);
      const saldo = (dir: string) => (debts.data ?? []).filter((d) => d.direction === dir)
        .reduce((s, d: any) => s + Number(d.amount) - (d.debt_payments ?? []).reduce((a: number, p: any) => a + Number(p.amount), 0), 0);
      return {
        vendasHoje: (sales.data ?? []).reduce((s, x) => s + Number(x.total), 0),
        nVendas: sales.data?.length ?? 0,
        pagar: saldo("pagar"), receber: saldo("receber"),
        tasks: tasks.data ?? [],
      };
    },
  });
  const urgentes = (data?.tasks ?? []).filter((t) => tarefaUrgente(t.due_date, t.done));
  return (
    <>
      <PageTitle title="Painel" subtitle={`Bem-vindo(a), ${me?.user.user_metadata?.['full_name'] ?? me?.user.email ?? ""}`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Vendas de hoje" value={<Money value={data?.vendasHoje} />} hint={`${data?.nVendas ?? 0} vendas`} />
        {me?.isGestao && <Stat label="Quem nos deve" value={<Money value={data?.receber} />} />}
        {me?.isGestao && <Stat label="Quem a empresa deve" value={<Money value={data?.pagar} />} />}
        <Stat label="Tarefas urgentes" value={<span className={urgentes.length ? "text-destructive" : ""}>{urgentes.length}</span>} />
      </div>
      <Card className="mt-6">
        <CardHeader><CardTitle className="text-lg">Tarefas próximas do prazo</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {urgentes.length === 0 && <p className="text-sm text-muted-foreground">Sem tarefas urgentes.</p>}
          {urgentes.map((t) => (
            <div key={t.id} className="flex justify-between rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
              <span>{t.title}</span><span className="font-semibold text-destructive">{t.due_date}</span>
            </div>
          ))}
          <Link to="/projetos" className="text-sm text-primary hover:underline">Ver todas as tarefas</Link>
        </CardContent>
      </Card>
    </>
  );
}

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <Card><CardContent className="pt-5">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </CardContent></Card>
  );
}
