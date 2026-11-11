import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import emblema from "@/assets/emblema-centrado.png.asset.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
      { title: "Entrar — Agro-Nutrição Trigo" },
      { name: "description", content: "Acesso ao sistema de gestão da Agro-Nutrição Trigo." },
      { property: "og:title", content: "Entrar — Agro-Nutrição Trigo" },
      { property: "og:description", content: "Acesso ao sistema de gestão." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.toLowerCase().includes("invalid login")) throw new Error("E-mail ou senha incorretos. Se ainda não tem conta, clique em \"Primeiro registo da empresa\".");
          if (error.message.toLowerCase().includes("not confirmed")) throw new Error("Confirme primeiro o seu e-mail através do link que lhe enviámos.");
          throw error;
        }
        navigate({ to: "/painel" });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password, options: { emailRedirectTo: `${window.location.origin}/painel`, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Verifique o seu e-mail para confirmar a conta.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast.success("Enviámos um link para redefinir a senha.");
        setMode("login");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Erro");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="space-y-5 pt-6">
          <div className="flex flex-col items-center gap-2">
            <img src={emblema.url} alt="" className="h-20 w-20" />
            <h1 className="text-3xl text-primary">Agro-Nutrição Trigo</h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "Entrar no sistema" : mode === "signup" ? "Criar conta da empresa" : "Recuperar senha"}
            </p>
          </div>
          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <div className="space-y-1"><Label>Nome completo</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
            )}
            <div className="space-y-1"><Label>E-mail</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            {mode !== "forgot" && (
              <div className="space-y-1"><Label>Senha</Label><Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            )}
            <Button className="w-full" disabled={busy}>
              {mode === "login" ? "Entrar" : mode === "signup" ? "Criar conta" : "Enviar link"}
            </Button>
          </form>
          <div className="flex flex-col gap-1 text-center text-sm">
            {mode !== "forgot" && <button className="text-primary underline-offset-4 hover:underline" onClick={() => setMode("forgot")}>Esqueci a senha</button>}
            {mode === "login" ? (
              <button className="text-muted-foreground hover:underline" onClick={() => setMode("signup")}>Primeiro registo da empresa</button>
            ) : (
              <button className="text-muted-foreground hover:underline" onClick={() => setMode("login")}>Voltar a entrar</button>
            )}
          </div>
          <p className="text-center text-xs text-muted-foreground">Funcionários recebem um convite por e-mail para definir a sua senha.</p>
        </CardContent>
      </Card>
    </main>
  );
}
