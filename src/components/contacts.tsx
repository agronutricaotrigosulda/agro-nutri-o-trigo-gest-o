import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
export function UsefulContacts() {
  const { data = [] } = useQuery({ queryKey: ["contacts"], queryFn: async () => { const { data, error } = await supabase.from("company_contacts").select("*"); if (error) throw error; return data; } });
  return <section className="mt-8 border-t pt-4"><h2 className="mb-3 text-lg">Contactos úteis</h2><div className="grid gap-4 sm:grid-cols-3">{data.length === 0 && <p className="text-sm text-muted-foreground">Contactos ainda não definidos pela gestão.</p>}{data.map(c => <div key={c.id} className="text-sm"><p className="font-semibold">{c.position}</p><p>{c.name}</p>{c.contact && <a className="block text-primary" href={`tel:${c.contact}`}>{c.contact}</a>}{c.email && <a className="break-all text-primary" href={`mailto:${c.email}`}>{c.email}</a>}</div>)}</div></section>;
}