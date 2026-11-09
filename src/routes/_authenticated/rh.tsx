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
import { Payroll } from "@/components/payroll";

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
      const [e, ev, ab, va, profiles, requests] = await Promise.all([
        supabase.from("employees").select("*").order("full_name"),
        supabase.from("evaluations").select("*").order("created_at", { ascending: false }),
        supabase.from("absences").select("*").order("absence_date", { ascending: false }),
        supabase.from("vacations").select("*"),
        supabase.from("profiles").select("id,full_name,email"),
        supabase.from("employee_requests").select("*").order("created_at",{ascending:false}),
      ]);
      return { emp: e.data ?? [], ev: ev.data ?? [], ab: ab.data ?? [], va: va.data ?? [], profiles:profiles.data??[], requests:requests.data??[] };
    },
  });
  const [n, setN] = useState({ full_name: "", email: "", doc_type: "BI", doc_number: "", position: "", base_salary: "", hire_date: "", union_member: false });
  if (me && !me.canHR) return <NoAccess />;
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
              <TableBody>{emp.map((e) => <TableRow key={e.id}><TableCell>{e.full_name}<select aria-label={`Conta de ${e.full_name}`} className="mt-1 block max-w-52 rounded-md border bg-background p-1 text-xs" value={e.user_id??""} onChange={async ev=>{const {error}=await supabase.from("employees").update({user_id:ev.target.value||null}).eq("id",e.id);if(error)return toast.error(error.message);refresh();}}><option value="">Associar conta</option>{data?.profiles.map(p=><option key={p.id} value={p.id}>{p.full_name??p.email}</option>)}</select></TableCell><TableCell>{e.doc_type} {e.doc_number}<div className="mt-2 space-y-1"><Input aria-label="Emissão do documento" type="date" defaultValue={e.doc_issued??""} onBlur={async ev=>{await supabase.from("employees").update({doc_issued:ev.target.value||null}).eq("id",e.id);}}/><Input aria-label="Validade do documento" type="date" defaultValue={e.doc_expires??""} onBlur={async ev=>{await supabase.from("employees").update({doc_expires:ev.target.value||null}).eq("id",e.id);refresh();}}/><Input aria-label="Documento PDF ou foto" type="file" accept="image/*,application/pdf" onChange={async ev=>{try{const proof=await uploadProof(ev.target.files?.[0],"documentos");if(!proof)return;const {error}=await supabase.from("employees").update({doc_path:proof}).eq("id",e.id);if(error)throw error;refresh();toast.success("Documento atualizado");}catch(error){toast.error(error instanceof Error?error.message:"Falha no documento");}}}/>{e.doc_expires&&new Date(e.doc_expires).getTime()-Date.now()<=10*86400000&&<span className="text-xs text-destructive">{new Date(e.doc_expires).getTime()<Date.now()?"Documento vencido":"Vence em até 10 dias"}</span>}</div></TableCell><TableCell>{e.position}<Input aria-label="Área do funcionário" placeholder="Área" defaultValue={e.area??""} onBlur={async ev=>{await supabase.from("employees").update({area:ev.target.value}).eq("id",e.id);}}/><select aria-label="Tipo de contrato" className="mt-1 rounded-md border bg-background p-1 text-xs" value={e.contract_type} onChange={async ev=>{await supabase.from("employees").update({contract_type:ev.target.value}).eq("id",e.id);refresh();}}><option value="indeterminado">Indeterminado</option><option value="determinado">Determinado</option></select><Input aria-label="Número de dependentes" type="number" min="0" defaultValue={e.dependents} onBlur={async ev=>{await supabase.from("employees").update({dependents:Number(ev.target.value)}).eq("id",e.id);}}/></TableCell><TableCell>{e.hire_date}</TableCell><TableCell><Money value={e.base_salary} /></TableCell></TableRow>)}</TableBody>
            </Table></div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="folha">
          <Payroll />
          <Card className="hidden"><CardContent className="overflow-x-auto pt-4"><Table>
            <TableHeader><TableRow><TableHead>Funcionário</TableHead><TableHead>Base</TableHead><TableHead>INSS (3%)</TableHead><TableHead>Sindicato</TableHead><TableHead>Líquido</TableHead><TableHead>INSS empresa (4%)</TableHead></TableRow></TableHeader>
            <TableBody>{emp.map((e) => { const f = folhaSalarial(Number(e.base_salary), e.union_member, Number(e.union_pct)); return (
              <TableRow key={e.id}><TableCell>{e.full_name}</TableCell><TableCell><Money value={f.base} /></TableCell><TableCell><Money value={f.inss} /></TableCell><TableCell>{e.union_member ? <Money value={f.sindicato} /> : "—"}</TableCell><TableCell className="font-semibold"><Money value={f.liquido} /></TableCell><TableCell><Money value={f.inssEmpresa} /></TableCell></TableRow>
            ); })}</TableBody>
          </Table></CardContent></Card>
        </TabsContent>

        <TabsContent value="ferias">
          <Card><CardContent className="space-y-2 pt-4">
            <p className="text-xs text-muted-foreground">Contrato indeterminado: 12 dias no primeiro ano e 30 nos seguintes, acumulados mensalmente. Determinado: um dia por mês.</p>
            {emp.map((e) => {
              const acc = feriasAcumuladas(new Date(e.hire_date),new Date(),e.contract_type);
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
                const { error } = await supabase.from("absences").insert({ employee_id: g("emp").value, absence_date: g("date").value.slice(0,10), occurred_at:new Date(g("date").value).toISOString(), reason: g("reason").value, proof_path: proof });
                if (error) throw error; f.reset(); refresh(); toast.success("Falta registada");
              } catch (e: any) { toast.error(e.message); }
            }}>
              <select name="emp" required className="rounded-md border bg-background px-2 text-sm"><option value="">Funcionário</option>{emp.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}</select>
              <Input name="date" aria-label="Data e hora da falta" type="datetime-local" required className="max-w-[230px]" />
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
                    {a.proof_path && <Button size="sm" variant="link" onClick={() => {if(a.proof_path)openProof(a.proof_path);}}>Comprovativo</Button>}
                    <Badge variant="outline">{a.decision==="aprovada"?"Justificada":a.submitted_at?`Justificação ${a.decision}`:"Sem aprovação"}</Badge>
                    {a.submitted_at&&a.decision==="pendente"&&(["aprovada","rejeitada"] as const).map(d=><Button key={d} size="sm" variant="outline" onClick={async()=>{const {error}=await supabase.rpc("decide_absence",{_absence:a.id,_decision:d});if(error)return toast.error(error.message);refresh();}}>{d==="aprovada"?"Aprovar":"Rejeitar"}</Button>)}
                  </span>
                </div>
              );
            })}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
      <section className="mt-6 border-t pt-4"><h2 className="mb-3 text-lg">Pedidos dos colaboradores</h2>{data?.requests.map(r=><div key={r.id} className="mb-2 flex flex-wrap items-center justify-between gap-3 rounded-md border p-3 text-sm"><span>{name(r.employee_id)} · {r.kind} · {r.details} · {r.status}</span>{r.status==="pendente"&&<span className="flex gap-2">{["aprovado","rejeitado"].map(status=><Button key={status} size="sm" variant="outline" onClick={async()=>{const {error}=await supabase.rpc("decide_employee_request",{_id:r.id,_status:status});if(error)return toast.error(error.message);refresh();}}>{status==="aprovado"?"Aprovar":"Rejeitar"}</Button>)}</span>}</div>)}</section>
    </>
  );
}
