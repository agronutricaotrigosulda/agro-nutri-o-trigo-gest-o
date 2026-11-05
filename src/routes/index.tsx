import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/logotipo.png.asset.json";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agro-Nutrição Trigo — Gestão da Empresa" },
      { name: "description", content: "Sistema de gestão da Agro-Nutrição Trigo: vendas, finanças em Meticais, RH, governação e projetos." },
      { property: "og:title", content: "Agro-Nutrição Trigo — Gestão da Empresa" },
      { property: "og:description", content: "Vendas, finanças, recursos humanos, governação e projetos num só lugar." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-6 text-center">
      <img src={logo.url} alt="Agro-Nutrição Trigo" className="w-64 max-w-full sm:w-80" />
      <div className="max-w-md space-y-2">
        <h1 className="text-4xl text-primary">Gestão da Empresa</h1>
        <p className="text-muted-foreground">Vendas, finanças, recursos humanos, governação societária e projetos.</p>
      </div>
      <Button asChild size="lg" className="px-10">
        <Link to="/auth">Entrar</Link>
      </Button>
    </main>
  );
}
