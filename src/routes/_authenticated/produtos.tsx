import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NoAccess, PageTitle } from "@/components/page";
import { useMe } from "@/lib/use-roles";

export const Route = createFileRoute("/_authenticated/produtos")({
  head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },{ title: "Preços e Produtos — Agro-Nutrição Trigo" }, { name: "description", content: "Tabela de preços e tetos de desconto." }, { property: "og:title", content: "Preços — Agro-Nutrição Trigo" }, { property: "og:description", content: "Tabela de preços." }] }),
  component: Produtos,
});

function Produtos() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({ queryKey: ["products-all"], queryFn: async () => (await supabase.from("products").select("*").order("category").order("name")).data ?? [] });
  const [n, setN] = useState({ name: "", category: "horticolas", unit: "kg", price_retail: "", price_wholesale: "", max_discount_pct: "0" });
  if (me && !me.isDirecao) return <NoAccess />;

  async function save(id: string, patch: any) {
    const { error } = await supabase.from("products").update(patch).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Atualizado"); qc.invalidateQueries(); }
  }
  async function add() {
    if (!n.name) return;
    const { error } = await supabase.from("products").insert({ ...n, price_retail: Number(n.price_retail), price_wholesale: Number(n.price_wholesale), max_discount_pct: Number(n.max_discount_pct) });
    if (error) return toast.error(error.message);
    setN({ ...n, name: "", price_retail: "", price_wholesale: "" }); qc.invalidateQueries();
  }
  return (
    <>
      <PageTitle title="Preços e Produtos" subtitle="Só a direção altera preços de tabela e o teto de desconto" />
      <Card><CardContent className="overflow-x-auto pt-4">
        <Table>
          <TableHeader><TableRow><TableHead>Produto</TableHead><TableHead>Categoria</TableHead><TableHead>Unid.</TableHead><TableHead>Retalho (MT)</TableHead><TableHead>Grosso (MT)</TableHead><TableHead>Desc. máx. %</TableHead><TableHead>Ativo</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell><TableCell>{r.category}</TableCell><TableCell>{r.unit}</TableCell>
                {(["price_retail", "price_wholesale", "max_discount_pct"] as const).map((f) => (
                  <TableCell key={f}><Input className="h-8 w-24" type="number" defaultValue={Number(r[f])} onBlur={(e) => Number(e.target.value) !== Number(r[f]) && save(r.id, { [f]: Number(e.target.value) })} /></TableCell>
                ))}
                <TableCell><Switch checked={r.active} onCheckedChange={(v) => save(r.id, { active: v })} /></TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell><Input className="h-8" placeholder="Novo produto" value={n.name} onChange={(e) => setN({ ...n, name: e.target.value })} /></TableCell>
              <TableCell><select className="h-8 rounded-md border bg-background px-2 text-sm" value={n.category} onChange={(e) => setN({ ...n, category: e.target.value })}><option value="horticolas">Hortícolas</option><option value="frangos">Frangos</option><option value="ovos">Ovos</option></select></TableCell>
              <TableCell><Input className="h-8 w-20" value={n.unit} onChange={(e) => setN({ ...n, unit: e.target.value })} /></TableCell>
              <TableCell><Input className="h-8 w-24" type="number" value={n.price_retail} onChange={(e) => setN({ ...n, price_retail: e.target.value })} /></TableCell>
              <TableCell><Input className="h-8 w-24" type="number" value={n.price_wholesale} onChange={(e) => setN({ ...n, price_wholesale: e.target.value })} /></TableCell>
              <TableCell><Input className="h-8 w-20" type="number" value={n.max_discount_pct} onChange={(e) => setN({ ...n, max_discount_pct: e.target.value })} /></TableCell>
              <TableCell><Button size="sm" onClick={add}>Adicionar</Button></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent></Card>
    </>
  );
}
