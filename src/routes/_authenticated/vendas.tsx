import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Money } from "@/lib/format";
import { NoAccess, PageTitle, uploadProof } from "@/components/page";
import { useMe } from "@/lib/use-roles";
import { validarVenda } from "@/lib/rules";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/vendas")({
  head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },{ title: "Vendas — Agro-Nutrição Trigo" }, { name: "description", content: "Terminal de vendas." }, { property: "og:title", content: "Vendas — Agro-Nutrição Trigo" }, { property: "og:description", content: "Terminal de vendas." }] }),
  component: Vendas,
});

const CATS = [{ id: "horticolas", label: "Hortícolas" }, { id: "frangos", label: "Frangos" }, { id: "ovos", label: "Ovos" }];

function Vendas() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await supabase.from("products").select("*").eq("active", true).order("name")).data ?? [],
  });
  const { data: sales = [] } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => (await supabase.from("sales").select("*, products(name, unit)").order("created_at", { ascending: false }).limit(30)).data ?? [],
  });
  const [cat, setCat] = useState("horticolas");
  const [pid, setPid] = useState<string | null>(null);
  const [mode, setMode] = useState<"retalho" | "grosso">("retalho");
  const [qty, setQty] = useState("1");
  const [disc, setDisc] = useState("0");
  const [exception, setException] = useState(false);
  const [customPrice, setCustomPrice] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [proofFile,setProofFile]=useState<File>();

  const p = products.find((x) => x.id === pid);
  const base = p ? Number(mode === "grosso" ? p.price_wholesale : p.price_retail) : 0;
  const discounted = Math.round(base * (1 - Number(disc || 0) / 100) * 100) / 100;
  const unit = exception ? Number(customPrice || 0) : discounted;
  const total = unit * Number(qty || 0);
  const error = useMemo(() => p ? validarVenda({ basePrice: base, discountPct: Number(disc || 0), maxDiscountPct: Number(p.max_discount_pct), unitPrice: unit, reason }) : null, [p, base, disc, unit, reason]);

  if (me && !me.canSell) return <NoAccess />;

  async function registar() {
    if (!p || !me) return;
    if (error) return toast.error(error);
    if(!proofFile)return toast.error("Anexe o comprovativo do recebimento");
    setBusy(true);
    try {
    const proof=await uploadProof(proofFile,"vendas");
    const { error: e } = await supabase.from("sales").insert({
      product_id: p.id, mode, quantity: Number(qty), unit_price: unit, discount_pct: Number(disc || 0),
      exception_reason: exception ? reason.trim() : null, seller_id: me.user.id, proof_path:proof,
    });
    setBusy(false);
    if (e) return toast.error(e.message);
    toast.success("Venda registada");
    setQty("1"); setDisc("0"); setException(false); setCustomPrice(""); setReason("");
    qc.invalidateQueries({ queryKey: ["sales"] }); qc.invalidateQueries({ queryKey: ["painel"] });
    setProofFile(undefined);
    }catch(e){toast.error(e instanceof Error?e.message:"Não foi possível registar");}finally{setBusy(false);}
  }

  return (
    <>
      <PageTitle title="Terminal de Vendas" subtitle="Preços de tabela definidos pela direção" />
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="mb-3 flex gap-2">
            {CATS.map((c) => <Button key={c.id} variant={cat === c.id ? "default" : "outline"} onClick={() => setCat(c.id)}>{c.label}</Button>)}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {products.filter((x) => x.category === cat).map((x) => (
              <button key={x.id} onClick={() => setPid(x.id)}
                className={cn("rounded-lg border bg-card p-3 text-left transition hover:border-primary", pid === x.id && "border-primary ring-2 ring-primary/30")}>
                <div className="font-semibold">{x.name}</div>
                <div className="text-xs text-muted-foreground">por {x.unit}</div>
                <div className="mt-2 text-sm">Retalho: <Money value={x.price_retail} /></div>
                <div className="text-sm">Grosso: <Money value={x.price_wholesale} /></div>
              </button>
            ))}
          </div>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-lg">{p ? p.name : "Escolha um produto"}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button size="sm" variant={mode === "retalho" ? "default" : "outline"} onClick={() => setMode("retalho")}>Retalho</Button>
              <Button size="sm" variant={mode === "grosso" ? "default" : "outline"} onClick={() => setMode("grosso")}>A grosso</Button>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
              <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> Preço de tabela</span><Money value={base} className="font-semibold" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Quantidade</Label><Input type="number" min="0" step="any" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
              <div><Label>Desconto % (máx. {p ? Number(p.max_discount_pct) : 0})</Label><Input type="number" min="0" max={p?.max_discount_pct ?? 0} value={disc} onChange={(e) => setDisc(e.target.value)} disabled={!p} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={exception} onCheckedChange={setException} disabled={!p} /><Label>Preço de exceção</Label></div>
            {exception && (
              <>
                <div><Label>Preço unitário praticado</Label><Input type="number" min="0" step="any" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} /></div>
                <div><Label>Motivo (obrigatório)</Label><Textarea required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explique a razão do preço diferente" /></div>
              </>
            )}
            <div className="flex items-center justify-between border-t pt-3"><span>Total</span><Money value={total} className="text-2xl font-bold text-primary" /></div>
            {p && error && <p className="text-sm text-destructive">{error}</p>}
            <Label>Comprovativo do recebimento</Label><Input aria-label="Comprovativo do recebimento" type="file" accept="image/*,application/pdf" onChange={e=>setProofFile(e.target.files?.[0])}/>
            <Button className="w-full" size="lg" disabled={!p || busy || !!error || Number(qty) <= 0} onClick={registar}>Registar venda</Button>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader><CardTitle className="text-lg">Últimas vendas</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Produto</TableHead><TableHead>Modo</TableHead><TableHead>Qtd</TableHead><TableHead>Desc.</TableHead><TableHead>Total</TableHead><TableHead>Exceção</TableHead></TableRow></TableHeader>
            <TableBody>
              {sales.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell>{new Date(s.created_at).toLocaleString("pt-MZ")}</TableCell>
                  <TableCell>{s.products?.name}</TableCell><TableCell>{s.mode}</TableCell>
                  <TableCell>{Number(s.quantity)} {s.products?.unit}</TableCell><TableCell>{Number(s.discount_pct)}%</TableCell>
                  <TableCell><Money value={s.total} /></TableCell>
                  <TableCell className="max-w-[200px] truncate text-warning-foreground">{s.exception_reason ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
