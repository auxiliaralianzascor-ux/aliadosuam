import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, UserCircle2 } from "lucide-react";
import { useAllUsers, useMyPermissions, useSetUserRole, useToggleUserArea } from "@/lib/permissions-api";
import { AREA_LABEL, type FollowupArea } from "@/lib/allies-types";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/usuarios")({
  head: () => ({ meta: [{ title: "Usuarios · UAM" }] }),
  component: UsersPage,
});

const AREAS: FollowupArea[] = ["direccion", "econti", "mercadeo", "graduados", "proyectos", "general"];

function UsersPage() {
  const { data: perms, isLoading: permsLoading } = useMyPermissions();
  const { data: users = [], isLoading } = useAllUsers();
  const setRole = useSetUserRole();
  const toggleArea = useToggleUserArea();

  if (permsLoading) {
    return <div className="grid place-items-center py-20 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }
  if (!perms?.isAdmin) return <Navigate to="/aliados" />;

  const handleRole = async (userId: string, enabled: boolean) => {
    try {
      await setRole.mutateAsync({ userId, role: "admin", enabled });
      toast.success(enabled ? "Ahora es administrador" : "Ya no es administrador");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };
  const handleArea = async (userId: string, area: FollowupArea, enabled: boolean) => {
    try {
      await toggleArea.mutateAsync({ userId, area, enabled });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Usuarios y permisos</h1>
        <p className="text-sm text-muted-foreground">
          Los administradores ven y editan todo. Los usuarios de área solo pueden registrar seguimientos en las áreas que les asignes.
        </p>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-16 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : users.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          Aún no hay otras cuentas. Pídeles que se registren en la app y aparecerán aquí para asignarles rol.
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((u) => {
            const isAdmin = u.roles.includes("admin");
            const isMe = u.id === perms.userId;
            return (
              <Card key={u.id} className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-muted grid place-items-center shrink-0">
                      {isAdmin ? <ShieldCheck className="w-5 h-5 text-primary" /> : <UserCircle2 className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {u.display_name || u.email || u.id}
                        {isMe && <Badge variant="outline" className="ml-2 text-xs">Tú</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm">Administrador</span>
                    <Switch
                      checked={isAdmin}
                      disabled={isMe}
                      onCheckedChange={(v) => handleRole(u.id, v)}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Áreas que puede editar</div>
                  <div className="flex flex-wrap gap-3">
                    {AREAS.map((area) => {
                      const has = u.areas.includes(area);
                      return (
                        <label
                          key={area}
                          className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ${
                            has ? "bg-primary/10 border-primary/30" : "bg-card hover:bg-muted/50"
                          }`}
                        >
                          <Switch
                            checked={has}
                            onCheckedChange={(v) => handleArea(u.id, area, v)}
                          />
                          <span>{AREA_LABEL[area]}</span>
                        </label>
                      );
                    })}
                  </div>
                  {isAdmin && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Como administrador ya puede editar todas las áreas, sin importar estas casillas.
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
