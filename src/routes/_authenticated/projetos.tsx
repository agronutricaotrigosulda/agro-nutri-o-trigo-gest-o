import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Money } from "@/lib/format";
import { PageTitle } from "@/components/page";
import { useMe } from "@/lib/use-roles";
import { tarefaUrgente } from "@/lib/rules";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/projetos")({
  head: () => ({ meta: [{ title: "Projetos e Tarefas — Agro-Nutrição Trigo" }, { name: "description", content: "Balanço de projetos e tarefas com prazos." }, { property: "og:title", content: "Projetos — Agro-Nutrição Trigo" }, { property: "og:description", content: "Projetos e tarefas." }] }),
  component: Projetos,
});

function Projetos() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["proj"],
    queryFn: async () => {
      const [p, t] = await Promise.all([supabase.from("projects").select("*").order("name"), supabase.from("tasks").select("*").order("due_date")]);
      return { p: p.data ?? [], t: t.data ?? [] };
    },
  });
  const [np, setNp] = useState({ name: "", revenue: "", expenses: "" });
  const [nt, setNt] = useState({ title: "", due_date: "", project_id: "", assignee: "" });
  const refresh = () => qc.invalidateQueries({ queryKey: ["proj"] });
  const gestao = me?.isGestao;

  return (
    <>
      <PageTitle title="Projetos e Tarefas" />
      {gestao && (
        <Card className="mb-5">
          <CardHeader><CardTitle className="text-lg">Balanço financeiro dos projetos</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(data?.p ?? []).map((p) => {
              const bal = Number(p.revenue) - Number(p.expenses);
              return (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                  <span className="font-semibold">{p.name}</span>
                  <span>Receitas <Money value={p.revenue} /> · Despesas <Money value={p.expenses} /> · <b className={bal < 0 ? "text-destructive" : "text-primary"}>Saldo <Money value={bal} /></b></span>
                </div>
              );
            })}
            <div className="flex flex-wrap gap-2 border-t pt-3">
              <Input placeholder="Projeto" value={np.name} onChange={(e) => setNp({ ...np, name: e.target.value })} className="max-w-[200px]" />
              <Input placeholder="Receitas" type="number" value={np.revenue} onChange={(e) => setNp({ ...np, revenue: e.target.value })} className="max-w-[140px]" />
              <Input placeholder="Despesas" type="number" value={np.expenses} onChange={(e) => setNp({ ...np, expenses: e.target.value })} className="max-w-[140px]" />
              <Button onClick={async () => { if (!np.name) return; const { error } = await supabase.from("projects").insert({ name: np.name, revenue: Number(np.revenue), expenses: Number(np.expenses) }); if (error) return toast.error(error.message); setNp({ name: "", revenue: "", expenses: "" }); refresh(); }}>Adicionar</Button>
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle className="text-lg">Tarefas</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {gestao && (
            <div className="flex flex-wrap gap-2 pb-2">
              <Input placeholder="Tarefa" value={nt.title} onChange={(e) => setNt({ ...nt, title: e.target.value })} className="max-w-xs" />
              <Input type="date" value={nt.due_date} onChange={(e) => setNt({ ...nt, due_date: e.target.value })} className="max-w-[160px]" />
              <Input placeholder="Responsável" value={nt.assignee} onChange={(e) => setNt({ ...nt, assignee: e.target.value })} className="max-w-[160px]" />
              <select className="rounded-md border bg-background px-2 text-sm" value={nt.project_id} onChange={(e) => setNt({ ...nt, project_id: e.target.value })}>
                <option value="">Sem projeto</option>{(data?.p ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <Button onClick={async () => { if (!nt.title) return; await supabase.from("tasks").insert({ ...nt, project_id: nt.project_id || null, due_date: nt.due_date || null }); setNt({ title: "", due_date: "", project_id: "", assignee: "" }); refresh(); }}>Adicionar</Button>
            </div>
          )}
          {(data?.t ?? []).map((t) => {
            const urg = tarefaUrgente(t.due_date, t.done);
            return (
              <div key={t.id} className={cn("flex items-center gap-3 rounded-md border px-3 py-2 text-sm", urg && "border-destructive bg-destructive/10", t.done && "opacity-60")}>
                <Checkbox checked={t.done} disabled={!gestao} onCheckedChange={async (v) => { await supabase.from("tasks").update({ done: !!v }).eq("id", t.id); refresh(); }} />
                <span className={cn("flex-1", t.done && "line-through")}>{t.title}{t.assignee && <span className="text-muted-foreground"> · {t.assignee}</span>}</span>
                {urg && <AlertTriangle className="h-4 w-4 text-destructive" />}
                <span className={cn(urg && "font-semibold text-destructive")}>{t.due_date ?? "—"}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
}
