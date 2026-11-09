import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Money } from "@/lib/format";
import { NoAccess, PageTitle, openProof, uploadProof } from "@/components/page";
import { useMe } from "@/lib/use-roles";

export const Route = createFileRoute("/_authenticated/dividas")({
  head: () => ({ meta: [{ title: "Dívidas — Agro-Nutrição Trigo" }, { name: "description", content: "Quem a empresa deve e quem nos deve." }, { property: "og:title", content: "Dívidas — Agro-Nutrição Trigo" }, { property: "og:description", content: "Gestão de dívidas." }] }),
  component: Dividas,
});

function Dividas() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const [dir, setDir] = useState<"pagar" | "receber">("pagar");
  const { data: debts = [] } = useQuery({ queryKey: ["debts"], queryFn: async () => (await supabase.from("debts").select("*, debt_payments(*)").order("created_at", { ascending: false })).data ?? [] });
  const [n, setN] = useState({ party: "", description: "", amount: "", due_date: "" });
  if (me && !me.canFinance) return <NoAccess />;

  async function add() {
    if (!n.party || !Number(n.amount)) return toast.error("Indique a entidade e o valor");
    const { error } = await supabase.from("debts").insert({ direction: dir, party: n.party, description: n.description, amount: Number(n.amount), due_date: n.due_date || null });
    if (error) return toast.error(error.message);
    setN({ party: "", description: "", amount: "", due_date: "" }); qc.invalidateQueries({ queryKey: ["debts"] });
  }
  async function pay(debtId: string, amount: number, file: File | undefined) {
    try {
      if (!file || amount <= 0) throw new Error("Valor positivo e comprovativo obrigatórios");
      const proof = await uploadProof(file, "dividas");
      const { error } = await supabase.from("debt_payments").insert({ debt_id: debtId, amount, proof_path: proof });
      if (error) throw error;
      toast.success("Pagamento registado"); qc.invalidateQueries({ queryKey: ["debts"] });
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <>
      <PageTitle title="Dívidas" />
      <Tabs value={dir} onValueChange={(v) => setDir(v as any)} className="mb-4">
        <TabsList><TabsTrigger value="pagar">Quem a empresa deve</TabsTrigger><TabsTrigger value="receber">Quem nos deve</TabsTrigger></TabsList>
      </Tabs>
      <Card className="mb-4"><CardContent className="flex flex-wrap gap-2 pt-4">
        <Input placeholder={dir === "pagar" ? "Credor" : "Devedor"} value={n.party} onChange={(e) => setN({ ...n, party: e.target.value })} className="max-w-[200px]" />
        <Input placeholder="Descrição" value={n.description} onChange={(e) => setN({ ...n, description: e.target.value })} className="max-w-[240px]" />
        <Input type="number" placeholder="Valor" value={n.amount} onChange={(e) => setN({ ...n, amount: e.target.value })} className="max-w-[140px]" />
        <Input type="date" value={n.due_date} onChange={(e) => setN({ ...n, due_date: e.target.value })} className="max-w-[170px]" />
        <Button onClick={add}>Registar dívida</Button>
      </CardContent></Card>
      <div className="space-y-3">
        {debts.filter((d) => d.direction === dir).map((d: any) => {
          const paid = (d.debt_payments ?? []).reduce((a: number, p: any) => a + Number(p.amount), 0);
          const left = Number(d.amount) - paid;
          return (
            <Card key={d.id}><CardContent className="space-y-2 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><div className="font-semibold">{d.party}</div><div className="text-xs text-muted-foreground">{d.description} {d.due_date && `· vence ${d.due_date}`}</div></div>
                <div className="text-right text-sm">
                  <div>Total <Money value={d.amount} /> · Pago <Money value={paid} /></div>
                  {left <= 0 ? <Badge className="bg-success text-primary-foreground">Liquidada</Badge> : <div className="font-semibold">Em falta <Money value={left} /></div>}
                </div>
              </div>
              {(d.debt_payments ?? []).map((p: any) => (
                <div key={p.id} className="flex justify-between text-xs text-muted-foreground">
                  <span>{p.paid_at} · <Money value={p.amount} /></span>
                  {p.proof_path && <button className="text-primary hover:underline" onClick={() => openProof(p.proof_path)}>Ver comprovativo</button>}
                </div>
              ))}
              {left > 0 && (
                <form className="flex flex-wrap gap-2 border-t pt-2" onSubmit={(e) => {
                  e.preventDefault(); const f = e.currentTarget;
                  const v = Number((f.elements.namedItem("v") as HTMLInputElement).value);
                  const file = (f.elements.namedItem("f") as HTMLInputElement).files?.[0];
                  if (!v || v > left) return toast.error("Valor inválido");
                  pay(d.id, v, file); f.reset();
                }}>
                  <Input name="v" type="number" step="any" placeholder="Valor pago" className="h-8 max-w-[140px]" />
                  <Input name="f" type="file" accept="image/*,application/pdf" className="h-8 max-w-[240px]" />
                  <Button size="sm" variant="outline">Pagamento parcial</Button>
                  <Button size="sm" type="button" onClick={(e) => { const file = ((e.currentTarget.form!.elements.namedItem("f")) as HTMLInputElement).files?.[0]; pay(d.id, left, file); }}>Liquidar total</Button>
                </form>
              )}
            </CardContent></Card>
          );
        })}
      </div>
    </>
  );
}
