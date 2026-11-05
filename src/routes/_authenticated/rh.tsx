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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Money } from "@/lib/format";
import { NoAccess, PageTitle, openProof, uploadProof } from "@/components/page";
import { useMe } from "@/lib/use-roles";
import { faixaDesempenho, faltaDentroDoPrazo, feriasAcumuladas, folhaSalarial } from "@/lib/rules";

export const Route = createFileRoute("/_authenticated/rh")({
  head: () => ({ meta: [{ title: "Recursos Humanos — Agro-Nutrição Trigo" }, { name: "description", content: "Funcionários, folha, férias, avaliações e faltas." }, { property: "og:title", content: "RH — Agro-Nutrição Trigo" }, { property: "og:description", content: "Recursos humanos." }] }),
  component: RH,
});

function RH() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["rh"],
    queryFn: async () => {
      const [e, ev, ab, va] = await Promise.all([
        supabase.from("employees").select("*").order("full_name"),
        supabase.from("evaluations").select("*").order("created_at", { ascending: false }),
        supabase.from("absences").select("*").order("absence_date", { ascending: false }),
        supabase.from("vacations").select("*"),
      ]);
      return { emp: e.data ?? [], ev: ev.data ?? [], ab: ab.data ?? [], va: va.data ?? [] };
    },
  });
  const [n, setN] = useState({ full_name: "", email: "", doc_type: "BI", doc_number: "", position: "", base_salary: "", hire_date: "", union_member: false });
  if (me && !me.isGestao) return <NoAccess />;
  const emp = data?.emp ?? [];
  const refresh = () => qc.invalidateQueries({ queryKey: ["rh"] });
  const name = (id: string) => emp.find((e) => e.id === id)?.full_name ?? "";

  async function addEmp() {
    if (!n.full_name || !n.doc_number) return toast.error("Nome e documento (BI/DIRE) são obrigatórios");
    const { error } = await supabase.from("employees").insert({ full_name: n.full_name, email: n.email, doc_type: n.doc_type, doc_number: n.doc_number, position: n.position, union_member: n.union_member, base_salary: Number(n.base_salary), hire_date: n.hire_date || new Date().toISOString().slice(0, 10) });
    if (error) return toast.error(error.message);
    setN({ ...n, full_name: "", email: "", doc_number: "", position: "", base_salary: "" }); refresh();
  }

  return (
    <>
      <PageTitle title="Recursos Humanos" subtitle="Segundo a legislação laboral moçambicana" />
      <Tabs defaultValue="func">
        <TabsList className="flex-wrap"><TabsTrigger value="func">Funcionários</TabsTrigger><TabsTrigger value="folha">Folha salarial</TabsTrigger><TabsTrigger value="ferias">Férias</TabsTrigger><TabsTrigger value="aval">Avaliação</TabsTrigger><TabsTrigger value="faltas">Faltas</TabsTrigger></TabsList>

        <TabsContent value="func">
          <Card><CardContent className="space-y-3 pt-4">
            <div className="grid gap-2 sm:grid-cols-4">
              <Input placeholder="Nome completo" value={n.full_name} onChange={(e) => setN({ ...n, full_name: e.target.value })} />
              <Input placeholder="E-mail" value={n.email} onChange={(e) => setN({ ...n, email: e.target.value })} />
              <div className="flex gap-1">
                <select className="rounded-md border bg-background px-2 text-sm" value={n.doc_type} onChange={(e) => setN({ ...n, doc_type: e.target.value })}><option>BI</option><option>DIRE</option></select>
                <Input placeholder="Nº documento" value={n.doc_number} onChange={(e) => setN({ ...n, doc_number: e.target.value })} />
              </div>
              <Input placeholder="Cargo" value={n.position} onChange={(e) => setN({ ...n, position: e.target.value })} />
              <Input placeholder="Salário base" type="number" value={n.base_salary} onChange={(e) => setN({ ...n, base_salary: e.target.value })} />
              <Input type="date" value={n.hire_date} onChange={(e) => setN({ ...n, hire_date: e.target.value })} />
              <label className="flex items-center gap-2 text-sm"><Switch checked={n.union_member} onCheckedChange={(v) => setN({ ...n, union_member: v })} /> Sindicalizado</label>
              <Button onClick={addEmp}>Cadastrar</Button>
            </div>
            <div className="overflow-x-auto"><Table>
              <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Documento</TableHead><TableHead>Cargo</TableHead><TableHead>Admissão</TableHead><TableHead>Salário</TableHead></TableRow></TableHeader>
              <TableBody>{emp.map((e) => <TableRow key={e.id}><TableCell>{e.full_name}</TableCell><TableCell>{e.doc_type} {e.doc_number}</TableCell><TableCell>{e.position}</TableCell><TableCell>{e.hire_date}</TableCell><TableCell><Money value={e.base_salary} /></TableCell></TableRow>)}</TableBody>
            </Table></div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="folha">
          <Card><CardContent className="overflow-x-auto pt-4"><Table>
            <TableHeader><TableRow><TableHead>Funcionário</TableHead><TableHead>Base</TableHead><TableHead>INSS (3%)</TableHead><TableHead>Sindicato</TableHead><TableHead>Líquido</TableHead><TableHead>INSS empresa (4%)</TableHead></TableRow></TableHeader>
            <TableBody>{emp.map((e) => { const f = folhaSalarial(Number(e.base_salary), e.union_member, Number(e.union_pct)); return (
              <TableRow key={e.id}><TableCell>{e.full_name}</TableCell><TableCell><Money value={f.base} /></TableCell><TableCell><Money value={f.inss} /></TableCell><TableCell>{e.union_member ? <Money value={f.sindicato} /> : "—"}</TableCell><TableCell className="font-semibold"><Money value={f.liquido} /></TableCell><TableCell><Money value={f.inssEmpresa} /></TableCell></TableRow>
            ); })}</TableBody>
          </Table></CardContent></Card>
        </TabsContent>

        <TabsContent value="ferias">
          <Card><CardContent className="space-y-2 pt-4">
            <p className="text-xs text-muted-foreground">Cumulativas: 15 dias no 1º ano, 24 no 2º, 30 do 3º em diante.</p>
            {emp.map((e) => {
              const acc = feriasAcumuladas(new Date(e.hire_date));
              const used = (data?.va ?? []).filter((v) => v.employee_id === e.id).reduce((a, v) => a + v.days, 0);
              return (
                <form key={e.id} className="flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-sm" onSubmit={async (ev) => {
                  ev.preventDefault(); const f = ev.currentTarget;
                  const days = Number((f.elements.namedItem("d") as HTMLInputElement).value); const start = (f.elements.namedItem("s") as HTMLInputElement).value;
                  if (!days || !start) return; if (days > acc - used) return toast.error("Dias acima do saldo disponível");
                  await supabase.from("vacations").insert({ employee_id: e.id, days, start_date: start }); f.reset(); refresh();
                }}>
                  <span className="w-44 font-medium">{e.full_name}</span><span>Acumulado {acc} · Gozado {used} · <b>Saldo {acc - used}</b></span>
                  <Input name="s" type="date" className="h-8 max-w-[160px]" /><Input name="d" type="number" placeholder="Dias" className="h-8 max-w-[90px]" /><Button size="sm" variant="outline">Marcar</Button>
                </form>
              );
            })}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="aval">
          <Card><CardContent className="space-y-3 pt-4">
            <form className="flex flex-wrap gap-2" onSubmit={async (ev) => {
              ev.preventDefault(); const f = ev.currentTarget; const g = (k: string) => (f.elements.namedItem(k) as HTMLInputElement).value;
              const score = Number(g("score")); if (!g("emp") || score < 0 || score > 10) return toast.error("Nota de 0 a 10");
              await supabase.from("evaluations").insert({ employee_id: g("emp"), period: g("period"), score, notes: g("notes") }); f.reset(); refresh();
            }}>
              <select name="emp" className="rounded-md border bg-background px-2 text-sm"><option value="">Funcionário</option>{emp.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}</select>
              <Input name="period" placeholder="Período (ex: 2026-T1)" className="max-w-[170px]" required />
              <Input name="score" type="number" step="0.1" min="0" max="10" placeholder="Nota 0–10" className="max-w-[110px]" required />
              <Input name="notes" placeholder="Observações" className="max-w-xs" />
              <Button>Registar</Button>
            </form>
            <p className="text-xs text-muted-foreground">Faixas: 0–4,9 Insuficiente · 5–6,9 Satisfatório · 7–8,4 Bom · 8,5–10 Excelente</p>
            {(data?.ev ?? []).map((v) => <div key={v.id} className="flex justify-between rounded-md bg-muted px-3 py-2 text-sm"><span>{name(v.employee_id)} · {v.period}</span><span><b>{Number(v.score)}</b> <Badge variant="outline">{faixaDesempenho(Number(v.score))}</Badge></span></div>)}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="faltas">
          <Card><CardHeader><CardTitle className="text-base">Justificação de faltas (comprovativo até 48h)</CardTitle></CardHeader><CardContent className="space-y-3">
            <form className="flex flex-wrap gap-2" onSubmit={async (ev) => {
              ev.preventDefault(); const f = ev.currentTarget; const g = (k: string) => (f.elements.namedItem(k) as HTMLInputElement);
              try {
                const proof = await uploadProof(g("file").files?.[0], "faltas");
                const { error } = await supabase.from("absences").insert({ employee_id: g("emp").value, absence_date: g("date").value, reason: g("reason").value, proof_path: proof });
                if (error) throw error; f.reset(); refresh(); toast.success("Falta registada");
              } catch (e: any) { toast.error(e.message); }
            }}>
              <select name="emp" required className="rounded-md border bg-background px-2 text-sm"><option value="">Funcionário</option>{emp.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}</select>
              <Input name="date" type="date" required className="max-w-[160px]" />
              <Input name="reason" placeholder="Motivo" required className="max-w-xs" />
              <Input name="file" type="file" accept="image/*,application/pdf" className="max-w-[240px]" />
              <Button>Registar</Button>
            </form>
            {(data?.ab ?? []).map((a) => {
              const ok = a.proof_path && faltaDentroDoPrazo(new Date(a.absence_date), new Date(a.created_at));
              return (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                  <span>{name(a.employee_id)} · {a.absence_date} · {a.reason}</span>
                  <span className="flex items-center gap-2">
                    {a.proof_path && <button className="text-primary hover:underline" onClick={() => openProof(a.proof_path!)}>Comprovativo</button>}
                    <Badge className={ok ? "bg-success text-primary-foreground" : "bg-destructive text-destructive-foreground"}>{ok ? "Justificada" : "Injustificada"}</Badge>
                  </span>
                </div>
              );
            })}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
