import { createFileRoute, Outlet, redirect, Link, useRouter, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Users, LogOut, GraduationCap, ShieldCheck, Handshake, Percent, ChevronDown, Microscope, Globe2, BookOpen, Rocket } from "lucide-react";
import { useMyPermissions } from "@/lib/permissions-api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth" });
    }
    return { user: data.user };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const router = useRouter();
  const { user } = Route.useRouteContext();
  const { data: perms } = useMyPermissions();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const inAlianzas = pathname.startsWith("/alianzas");
  const inInvestigacion = pathname.startsWith("/investigacion");
  const inRelaciones = pathname.startsWith("/relaciones-internacionales");
  const inDecanaturas = pathname.startsWith("/decanaturas");
  const inProyeccion = pathname.startsWith("/proyeccion");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  };

  const triggerClass = (active: boolean) =>
    `px-3 py-1.5 rounded-md text-sm inline-flex items-center gap-1.5 ${
      active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
    }`;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <Link to="/alianzas/aliados" className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground grid place-items-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="leading-tight min-w-0 hidden xs:block sm:block">
              <div className="font-semibold text-sm truncate">UAM · Gestión de Aliados</div>
              <div className="text-xs text-muted-foreground truncate">Universidad Autónoma de Manizales</div>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger className={triggerClass(inAlianzas)}>
                <Handshake className="w-4 h-4" />
                <span className="hidden md:inline">Alianzas y Relaciones Corporativas</span>
                <span className="md:hidden">Alianzas</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/alianzas/aliados" className="cursor-pointer">
                    <Handshake className="w-4 h-4" /> Aliados
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/alianzas/descuentos" className="cursor-pointer">
                    <Percent className="w-4 h-4" /> Descuentos
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className={triggerClass(inInvestigacion)}>
                <Microscope className="w-4 h-4" />
                <span className="hidden md:inline">Investigación, Innovación y Emprendimiento</span>
                <span className="md:hidden">Investigación</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/investigacion/aliados" className="cursor-pointer">
                    <Handshake className="w-4 h-4" /> Aliados
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {perms?.isAdmin && (
              <Link
                to="/usuarios"
                activeProps={{ className: "bg-muted text-foreground" }}
                className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 inline-flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" /> <span className="hidden sm:inline">Usuarios</span>
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="max-w-[180px] truncate">{user.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
