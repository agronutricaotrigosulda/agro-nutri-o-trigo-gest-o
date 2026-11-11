import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
      { title: "Definir senha — Agro-Nutrição Trigo" },
      { name: "description", content: "Defina a sua senha de acesso ao sistema." },
      { property: "og:title", content: "Definir senha — Agro-Nutrição Trigo" },
      { property: "og:description", content: "Ativação de conta e definição de senha." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (p1 !== p2) return toast.error("As senhas não coincidem");
    if (!/(?=.*[A-Za-z])(?=.*\d).{8,}/.test(p1)) return toast.error("Use pelo menos 8 caracteres, com letras e números");
    const { error } = await supabase.auth.updateUser({ password: p1 });
    if (error) return toast.error(error.message);
    toast.success("Senha definida com sucesso");
    navigate({ to: "/painel" });
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="space-y-4 pt-6">
          <h1 className="text-center text-3xl text-primary">Definir a sua senha</h1>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1"><Label>Nova senha</Label><Input type="password" required value={p1} onChange={(e) => setP1(e.target.value)} /></div>
            <div className="space-y-1"><Label>Confirmar senha</Label><Input type="password" required value={p2} onChange={(e) => setP2(e.target.value)} /></div>
            <Button className="w-full">Guardar senha</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
