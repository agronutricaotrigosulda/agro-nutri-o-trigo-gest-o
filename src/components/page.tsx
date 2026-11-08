import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl text-primary md:text-4xl">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export async function uploadProof(file: File | null | undefined, folder: string): Promise<string | null> {
  if (!file) return null;
  if (!file.type.startsWith("image/") && file.type !== "application/pdf") throw new Error("Anexe uma foto ou PDF");
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Inicie sessão");
  const path = `${folder}/${auth.user.id}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "_")}`;
  const { error } = await supabase.storage.from("comprovativos").upload(path, file);
  if (error) throw error;
  return path;
}

export async function openProof(path: string) {
  const { data } = await supabase.storage.from("comprovativos").createSignedUrl(path, 300);
  if (data?.signedUrl) window.open(data.signedUrl, "_blank");
}

export function NoAccess() {
  return <p className="text-muted-foreground">Não tem permissão para aceder a esta área.</p>;
}
