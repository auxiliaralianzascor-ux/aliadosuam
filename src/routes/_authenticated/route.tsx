import { createFileRoute, Outlet, redirect, Link, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Users, LogOut, GraduationCap, ShieldCheck, Handshake } from "lucide-react";
import { useMyPermissions } from "@/lib/permissions-api";

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <Link to="/aliados" className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground grid place-items-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="leading-tight min-w-0 hidden xs:block sm:block">
              <div className="font-semibold text-sm truncate">UAM · Gestión de Aliados</div>
              <div className="text-xs text-muted-foreground truncate">Universidad Autónoma de Manizales</div>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              to="/aliados"
              activeProps={{ className: "bg-muted text-foreground" }}
              className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 inline-flex items-center gap-1.5"
            >
              <Handshake className="w-4 h-4" /> <span className="hidden sm:inline">Aliados</span>
            </Link>
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
