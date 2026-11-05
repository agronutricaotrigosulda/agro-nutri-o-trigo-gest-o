import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, ShoppingCart, Tags, Wallet, HandCoins, Landmark, Users, FolderKanban, UserCog, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import emblema from "@/assets/emblema-centrado.png.asset.json";
import { useMe } from "@/lib/use-roles";
import { ROLE_LABEL } from "@/lib/format";
import { InstallButton } from "@/components/install-button";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarInset, useSidebar,
} from "@/components/ui/sidebar";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: Shell,
});

type Item = { to: string; label: string; icon: any; show: (m: NonNullable<ReturnType<typeof useMe>["data"]>) => boolean };
const ITEMS: Item[] = [
  { to: "/painel", label: "Painel", icon: LayoutDashboard, show: () => true },
  { to: "/vendas", label: "Vendas", icon: ShoppingCart, show: (m) => m.canSell },
  { to: "/produtos", label: "Preços e Produtos", icon: Tags, show: (m) => m.isDirecao },
  { to: "/financas", label: "Finanças", icon: Wallet, show: (m) => m.isGestao },
  { to: "/dividas", label: "Dívidas", icon: HandCoins, show: (m) => m.isGestao },
  { to: "/governacao", label: "Governação", icon: Landmark, show: (m) => m.isGestao },
  { to: "/rh", label: "Recursos Humanos", icon: Users, show: (m) => m.isGestao },
  { to: "/projetos", label: "Projetos e Tarefas", icon: FolderKanban, show: () => true },
  { to: "/utilizadores", label: "Utilizadores", icon: UserCog, show: (m) => m.roles.includes("gerente") || m.roles.includes("socio_fundador") },
];

function Nav() {
  const { data: me } = useMe();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { setOpenMobile } = useSidebar();
  const qc = useQueryClient();
  const navigate = useNavigate();
  async function logout() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <Sidebar>
      <SidebarHeader className="flex-row items-center gap-2 p-3">
        <img src={emblema.url} alt="" className="h-10 w-10 rounded-full bg-sidebar-foreground p-0.5" />
        <div className="leading-tight">
          <div className="font-display text-xl text-sidebar-primary">Agro-Nutrição</div>
          <div className="text-xs opacity-80">Trigo · Gestão</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {me && ITEMS.filter((i) => i.show(me)).map((i) => (
              <SidebarMenuItem key={i.to}>
                <SidebarMenuButton asChild isActive={path.startsWith(i.to)} onClick={() => setOpenMobile(false)}>
                  <Link to={i.to}><i.icon /> <span>{i.label}</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 text-xs">
        <div className="truncate opacity-90">{me?.user.email}</div>
        <div className="opacity-70">{me?.roles.map((r) => ROLE_LABEL[r]).join(", ") || "Sem perfil atribuído"}</div>
        <button onClick={logout} className="mt-2 flex items-center gap-2 opacity-90 hover:opacity-100"><LogOut className="h-4 w-4" /> Sair</button>
      </SidebarFooter>
    </Sidebar>
  );
}

function Shell() {
  return (
    <SidebarProvider>
      <Nav />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur">
          <SidebarTrigger />
          <img src={emblema.url} alt="" className="h-7 w-7 md:hidden" />
          <span className="font-display text-lg text-primary">Agro-Nutrição Trigo</span>
          <div className="ml-auto"><InstallButton /></div>
        </header>
        <div className="mx-auto w-full max-w-6xl p-4 md:p-6"><Outlet /></div>
      </SidebarInset>
    </SidebarProvider>
  );
}
