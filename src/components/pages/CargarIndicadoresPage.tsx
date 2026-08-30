import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ClipboardList, Loader2, Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMyPermissions, canLoadIndicators } from "@/lib/permissions-api";
import { useAllies } from "@/lib/allies-api";
import {
  useStrategicIndicators,
  useSaveContribution,
  useAllyContributions,
  useDeleteContribution,
} from "@/lib/indicators-api";
import { DIRECTION_LABEL, type AllyDirection } from "@/lib/allies-types";

const PROJECTS_BY_DIRECTION: Partial<Record<AllyDirection, string[]>> = {
  alianzas: ["Talentos UAM", "Gestión del relacionamiento", "Posicionamiento"],
  investigacion: [
    "Gestión de la ciencia y de la tecnología",
    "Gestión de la innovación",
    "Gestión del emprendimiento",
  ],
  decanaturas: [
    "Trayectorias Vitales de Aprendizaje",
    "Planeación y Gestión Curricular",
    "Campus Extendido",
  ],
  proyeccion: [
    "Nuestra Responsabilidad Social",
    "Prácticas Formativas",
    "Paz y Competitividad",
    "IPS",
    "Unidades de Apoyo Académico",
    "Unidad de Graduados",
    "Voluntariado",
  ],
};

const UNIT_HINT: Record<string, string> = {
  numero: "Valor numérico entero",
  moneda_cop: "Valor en pesos colombianos (COP)",
  porcentaje: "Puntos porcentuales",
};

interface Props {
  direction: AllyDirection;
  dashboardPath: string;
}

export function CargarIndicadoresPage({ direction, dashboardPath }: Props) {
  const { data: perms, isLoading: permsLoading } = useMyPermissions();
  const { data: indicators = [], isLoading: indicatorsLoading } = useStrategicIndicators(direction);
  const { data: allies = [], isLoading: alliesLoading } = useAllies(direction);
  const saveContribution = useSaveContribution();
  const deleteContribution = useDeleteContribution();

  const currentYear = new Date().getFullYear();
  const [allyId, setAllyId] = useState("");
  const [indicatorKey, setIndicatorKey] = useState("");
  const [proyecto, setProyecto] = useState("");
  const [periodYear, setPeriodYear] = useState(String(Math.max(2024, Math.min(currentYear, 2030))));
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");

  const { data: contributions = [], isLoading: contributionsLoading } = useAllyContributions(
    allyId,
    Number(periodYear),
  );

  const ownAllies = useMemo(() => {
    const visible = allies
      .filter((a) => a.direction === direction || a.shared_with_directions?.includes(direction))
      .map((a) => ({ ...a, _isShared: a.direction !== direction }));

    if (visible.length > 0) return visible;

    return allies
      .filter((a) => a.decanatura || a.direction === direction || a.shared_with_directions?.includes(direction))
      .map((a) => ({ ...a, _isShared: a.direction !== direction }));
  }, [allies, direction]);

  const selectedIndicator = indicators.find((i) => i.key === indicatorKey);
  const projectOptions = PROJECTS_BY_DIRECTION[direction] ?? [];
  const years = Array.from({ length: 7 }, (_, i) => 2024 + i);

  if (permsLoading) {
    return (
      <div className="grid place-items-center py-20 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!canLoadIndicators(perms, direction)) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <Link
          to={dashboardPath}
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a Indicadores
        </Link>
        <Card className="p-10 text-center text-muted-foreground">
          <Lock className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p className="font-medium text-foreground">Acceso restringido</p>
          <p className="text-sm mt-1">
            Necesitas el perfil "Cargador" en {DIRECTION_LABEL[direction]} para registrar aportes.
          </p>
        </Card>
      </div>
    );
  }

  const resetForm = () => {
    setAllyId("");
    setIndicatorKey("");
    setProyecto("");
    setValue("");
    setNotes("");
  };

  const handleSubmit = async () => {
    if (!allyId) return toast.error("Selecciona un aliado");
    if (!indicatorKey) return toast.error("Selecciona un indicador");
    const numericValue = Number(value);
    if (!value.trim() || Number.isNaN(numericValue))
      return toast.error("Ingresa un valor numérico válido");

    try {
      await saveContribution.mutateAsync({
        ally_id: allyId,
        indicator_key: indicatorKey,
        proyecto_estrategico: proyecto || undefined,
        period_year: Number(periodYear),
        value: numericValue,
        notes: notes || undefined,
      });
      toast.success("Aporte registrado");
      resetForm();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo registrar el aporte");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteContribution.mutateAsync({ id, ally_id: allyId });
      toast.success("Aporte eliminado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo eliminar el aporte");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          to={dashboardPath}
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a Indicadores
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="w-6 h-6" /> Cargar aporte a indicador
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Dirección de {DIRECTION_LABEL[direction]} · Los aportes se muestran en el dashboard.
        </p>
      </div>

      <Card className="p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Aliado</Label>
            <Select value={allyId} onValueChange={setAllyId} disabled={alliesLoading}>
              <SelectTrigger>
                <SelectValue placeholder={alliesLoading ? "Cargando..." : "Selecciona un aliado"} />
              </SelectTrigger>
              <SelectContent>
                {ownAllies.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    <span className="flex items-center gap-2">
                      {a.name}
                      {a._isShared && (
                        <Badge variant="outline" className="text-[10px] font-normal">
                          Compartido
                        </Badge>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!alliesLoading && ownAllies.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Todavía no hay aliados propios ni compartidos con {DIRECTION_LABEL[direction]}.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Indicador</Label>
            <Select
              value={indicatorKey}
              onValueChange={setIndicatorKey}
              disabled={indicatorsLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={indicatorsLoading ? "Cargando..." : "Selecciona un indicador"}
                />
              </SelectTrigger>
              <SelectContent>
                {indicators.map((i) => (
                  <SelectItem key={i.key} value={i.key}>
                    {i.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>
              Proyecto estratégico{" "}
              {projectOptions.length === 0 && (
                <span className="text-muted-foreground font-normal">(opcional)</span>
              )}
            </Label>
            {projectOptions.length > 0 ? (
              <Select value={proyecto} onValueChange={setProyecto}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un proyecto" />
                </SelectTrigger>
                <SelectContent>
                  {projectOptions.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={proyecto}
                onChange={(e) => setProyecto(e.target.value)}
                placeholder="Nombre del proyecto (opcional)"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Año</Label>
            <Select value={periodYear} onValueChange={setPeriodYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Valor del aporte</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0"
            />
            {selectedIndicator && (
              <p className="text-xs text-muted-foreground">
                {UNIT_HINT[selectedIndicator.unit] ?? "Valor numérico"}
              </p>
            )}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Notas (opcional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contexto del aporte, fuente del dato, etc."
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={saveContribution.isPending}>
            {saveContribution.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Registrar aporte
          </Button>
        </div>
      </Card>

      {allyId && (
        <Card className="p-5 space-y-3">
          <p className="text-sm font-medium">Últimos aportes de este aliado en {periodYear}</p>
          {contributionsLoading ? (
            <div className="py-6 grid place-items-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : contributions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin aportes registrados todavía.</p>
          ) : (
            <div className="space-y-2">
              {contributions.map((c) => {
                const ind = indicators.find((i) => i.key === c.indicator_key);
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 text-sm border rounded-md px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{ind?.label ?? c.indicator_key}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap mt-0.5">
                        <span className="font-mono">{c.value.toLocaleString("es-CO")}</span>
                        {c.proyecto_estrategico && (
                          <Badge variant="outline" className="text-[10px]">
                            {c.proyecto_estrategico}
                          </Badge>
                        )}
                        <span>{new Date(c.created_at).toLocaleDateString("es-CO")}</span>
                      </div>
                    </div>
                    {perms?.isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => handleDelete(c.id)}
                        disabled={deleteContribution.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
