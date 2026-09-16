import { useMemo, useState } from "react";
import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Loader2,
  ShieldCheck,
  UserCircle2,
  Search,
  Settings2,
  Users as UsersIcon,
} from "lucide-react";
import {
  useAllUsers,
  useMyPermissions,
  useSetUserRole,
  useToggleUserArea,
  useToggleUserDirection,
  useToggleUserIndicatorProfile,
  isSuperAdminEmail,
  type ManagedUser,
} from "@/lib/permissions-api";
import {
  AREA_LABEL,
  DIRECTION_LABEL,
  type AllyDirection,
  type FollowupArea,
} from "@/lib/allies-types";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/usuarios")({
  head: () => ({ meta: [{ title: "Usuarios · UAM" }] }),
  beforeLoad: async () => {
    const { data, error } = await import("@/integrations/supabase/client").then(({ supabase }) => supabase.auth.getUser());
    if (error || !data.user) {
      throw new Error("No autorizado");
    }
    if (!isSuperAdminEmail(data.user.email)) {
      throw redirect({ to: "/alianzas/aliados" });
    }
  },
  component: UsersPage,
});

const DIRECTIONS: AllyDirection[] = [
  "alianzas",
  "alianzas_mercadeo",
  "alianzas_econti",
  "alianzas_proyectos",
  "alianzas_graduados",
  "investigacion",
  "relaciones_internacionales",
  "decanaturas",
  "decanatura_salud",
  "decanatura_ingenierias",
  "decanatura_sociales",
  "proyeccion",
];

const AREAS: FollowupArea[] = [
  "direccion",
  "econti",
  "mercadeo",
  "graduados",
  "proyectos",
  "investigacion",
  "innovacion",
  "emprendimiento",
  "general",
];

function UsersPage() {
  const { data: perms, isLoading: permsLoading } = useMyPermissions();
  const { data: users = [], isLoading } = useAllUsers();
  const setRole = useSetUserRole();
  const toggleArea = useToggleUserArea();
  const toggleDirection = useToggleUserDirection();
  const toggleIndicatorProfile = useToggleUserIndicatorProfile();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "admins" | "members">("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const isAdmin = u.roles.includes("admin");
      if (filter === "admins" && !isAdmin) return false;
      if (filter === "members" && isAdmin) return false;
      if (!q) return true;
      return (
        (u.display_name ?? "").toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [users, query, filter]);

  const editing = users.find((u) => u.id === editingId) ?? null;

  if (permsLoading) {
    return (
      <div className="grid place-items-center py-20 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }
  if (!perms?.isAdmin) return <Navigate to="/alianzas/aliados" />;

  const adminCount = users.filter((u) => u.roles.includes("admin")).length;

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
  const handleDirection = async (
    userId: string,
    direction: AllyDirection,
    enabled: boolean,
  ) => {
    try {
      await toggleDirection.mutateAsync({ userId, direction, enabled });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const handleIndicatorProfile = async (
    userId: string,
    direction: AllyDirection,
    profile: "verificador" | "cargador",
    enabled: boolean,
  ) => {
    try {
      await toggleIndicatorProfile.mutateAsync({ userId, direction, profile, enabled });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuarios y permisos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Selecciona un usuario para gestionar su rol, direcciones y áreas.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <div className="rounded-md border bg-card px-3 py-1.5 flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{users.length}</span>
            <span className="text-muted-foreground">total</span>
          </div>
          <div className="rounded-md border bg-card px-3 py-1.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="font-medium">{adminCount}</span>
            <span className="text-muted-foreground">admins</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o correo…"
            className="pl-9"
          />
        </div>
        <div className="inline-flex rounded-md border bg-card p-1 text-sm">
          {(["all", "admins", "members"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "Todos" : f === "admins" ? "Admins" : "Miembros"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-16 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          {users.length === 0
            ? "Aún no hay otras cuentas registradas."
            : "No hay usuarios que coincidan con la búsqueda."}
        </Card>
      ) : (
        <Card className="divide-y overflow-hidden">
          {filtered.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              isMe={u.id === perms.userId}
              onEdit={() => setEditingId(u.id)}
            />
          ))}
        </Card>
      )}

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditingId(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {editing && (
            <PermissionEditor
              user={editing}
              isMe={editing.id === perms.userId}
              onRole={(v) => handleRole(editing.id, v)}
              onDirection={(d, v) => handleDirection(editing.id, d, v)}
              onArea={(a, v) => handleArea(editing.id, a, v)}
              onIndicatorProfile={(d, p, v) => handleIndicatorProfile(editing.id, d, p, v)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function UserRow({
  user,
  isMe,
  onEdit,
}: {
  user: ManagedUser;
  isMe: boolean;
  onEdit: () => void;
}) {
  const isAdmin = user.roles.includes("admin");
  const dirCount = user.directions.length;
  const areaCount = user.areas.length;
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
      <div
        className={`w-9 h-9 rounded-full grid place-items-center shrink-0 ${
          isAdmin ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <UserCircle2 className="w-4 h-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium truncate">
            {user.display_name || user.email || user.id}
          </span>
          {isMe && (
            <Badge variant="outline" className="text-xs shrink-0">
              Tú
            </Badge>
          )}
          {isAdmin && (
            <Badge className="text-xs shrink-0 bg-primary/10 text-primary hover:bg-primary/10 border-primary/20">
              Admin
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {user.email || "Sin correo"}
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground shrink-0">
        <span>
          <span className="font-medium text-foreground">{dirCount}</span> direcciones
        </span>
        <span>
          <span className="font-medium text-foreground">{areaCount}</span> áreas
        </span>
      </div>
      <Button variant="ghost" size="sm" onClick={onEdit} className="shrink-0 gap-1.5">
        <Settings2 className="w-4 h-4" />
        <span className="hidden sm:inline">Gestionar</span>
      </Button>
    </div>
  );
}

function PermissionEditor({
  user,
  isMe,
  onRole,
  onDirection,
  onArea,
  onIndicatorProfile,
}: {
  user: ManagedUser;
  isMe: boolean;
  onRole: (v: boolean) => void;
  onDirection: (d: AllyDirection, v: boolean) => void;
  onArea: (a: FollowupArea, v: boolean) => void;
  onIndicatorProfile: (d: AllyDirection, p: "verificador" | "cargador", v: boolean) => void;
}) {
  const isAdmin = user.roles.includes("admin");
  return (
    <div className="space-y-6">
      <SheetHeader className="space-y-2">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-full grid place-items-center ${
              isAdmin ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <UserCircle2 className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <SheetTitle className="truncate">
              {user.display_name || user.email || "Usuario"}
            </SheetTitle>
            <SheetDescription className="truncate">{user.email}</SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div className="rounded-lg border bg-muted/30 p-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="font-medium text-sm">Administrador</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Acceso total a todas las direcciones y áreas.
          </div>
        </div>
        <Switch checked={isAdmin} disabled={isMe} onCheckedChange={onRole} />
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-sm font-semibold">Direcciones</h3>
          <span className="text-xs text-muted-foreground">Crear y editar aliados</span>
        </div>
        <div className="space-y-1.5">
          {DIRECTIONS.map((dir) => {
            const has = user.directions.includes(dir);
            return (
              <label
                key={dir}
                className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                  has || isAdmin
                    ? "bg-primary/5 border-primary/20"
                    : "bg-card hover:bg-muted/50"
                }`}
              >
                <span className="truncate">{DIRECTION_LABEL[dir]}</span>
                <Switch
                  checked={has || isAdmin}
                  disabled={isAdmin}
                  onCheckedChange={(v) => onDirection(dir, v)}
                />
              </label>
            );
          })}
        </div>
      </div>

      <Separator />

      <div>
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-sm font-semibold">Áreas</h3>
          <span className="text-xs text-muted-foreground">Registrar seguimientos</span>
        </div>
        <div className="space-y-1.5">
          {AREAS.map((area) => {
            const has = user.areas.includes(area);
            return (
              <label
                key={area}
                className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                  has || isAdmin
                    ? "bg-primary/5 border-primary/20"
                    : "bg-card hover:bg-muted/50"
                }`}
              >
                <span className="truncate">{AREA_LABEL[area]}</span>
                <Switch
                  checked={has || isAdmin}
                  disabled={isAdmin}
                  onCheckedChange={(v) => onArea(area, v)}
                />
              </label>
            );
          })}
        </div>
        {isAdmin && (
          <p className="text-xs text-muted-foreground mt-3">
            Como administrador ya tiene acceso a todas las áreas.
          </p>
        )}
      </div>

      <Separator />

      <div>
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-sm font-semibold">Perfiles de Indicadores</h3>
          <span className="text-xs text-muted-foreground">Verificar o cargar metas</span>
        </div>
        <div className="space-y-4">
          {DIRECTIONS.map((dir) => {
            const hasVerificador = user.indicatorProfiles.some(p => p.direction === dir && p.profile === "verificador");
            const hasCargador = user.indicatorProfiles.some(p => p.direction === dir && p.profile === "cargador");
            return (
              <div key={dir} className="rounded-md border p-3 bg-card">
                <div className="text-sm font-medium mb-3 text-muted-foreground">{DIRECTION_LABEL[dir]}</div>
                <div className="space-y-2">
                  <label className="flex items-center justify-between gap-3 text-sm cursor-pointer">
                    <span>Verificador (solo lectura)</span>
                    <Switch
                      checked={hasVerificador || isAdmin}
                      disabled={isAdmin}
                      onCheckedChange={(v) => onIndicatorProfile(dir, "verificador", v)}
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3 text-sm cursor-pointer">
                    <span>Cargador (escritura)</span>
                    <Switch
                      checked={hasCargador || isAdmin}
                      disabled={isAdmin}
                      onCheckedChange={(v) => onIndicatorProfile(dir, "cargador", v)}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
        {isAdmin && (
          <p className="text-xs text-muted-foreground mt-3">
            Como administrador ya tiene acceso a todos los indicadores.
          </p>
        )}
      </div>
    </div>
  );
}
