import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, BarChart3, TrendingUp, Target, AlertTriangle, ClipboardList } from "lucide-react";
import { useIndicatorsProgress, type IndicatorProgress } from "@/lib/indicators-api";
import { canLoadIndicators, useMyPermissions } from "@/lib/permissions-api";
import { type AllyDirection, DIRECTION_LABEL } from "@/lib/allies-types";

const UNIT_FORMAT: Record<string, (v: number) => string> = {
  numero: (v) => v.toLocaleString("es-CO"),
  moneda_cop: (v) =>
    v >= 1_000_000_000
      ? `$${(v / 1_000_000_000).toLocaleString("es-CO", { maximumFractionDigits: 1 })} mil M`
      : v >= 1_000_000
        ? `$${(v / 1_000_000).toLocaleString("es-CO", { maximumFractionDigits: 0 })} M`
        : `$${v.toLocaleString("es-CO")}`,
  porcentaje: (v) => `${v}%`,
};

function fmt(unit: string, value: number) {
  return (UNIT_FORMAT[unit] ?? UNIT_FORMAT.numero)(value);
}

interface Props {
  direction: AllyDirection;
  cargarPath?: string;
}

export function IndicatorsDashboardPage({ direction, cargarPath }: Props) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(Math.max(2024, Math.min(currentYear, 2030)));
  const { data: progress = [], isLoading } = useIndicatorsProgress(direction, year);
  const { data: perms } = useMyPermissions();

  const indicators = useMemo(() => {
    return progress.filter((p) => p.direction_hint === direction && p.target_value != null);
  }, [progress, direction]);

  const years = Array.from({ length: 7 }, (_, i) => 2024 + i);

  if (isLoading) {
    return (
      <div className="grid place-items-center py-20 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" /> Indicadores Estratégicos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dirección de {DIRECTION_LABEL[direction]} · OE3 Programa "Aliados UAM"
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-32">
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
          {cargarPath && canLoadIndicators(perms, direction) && (
            <Button asChild size="sm">
              <Link to={cargarPath}>
                <ClipboardList className="w-4 h-4" /> Cargar aporte
              </Link>
            </Button>
          )}
        </div>
      </div>

      {indicators.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          <AlertTriangle className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p>No hay indicadores asignados a esta dirección para {year}.</p>
          <p className="text-xs mt-1">
            Los indicadores se cargan desde la tabla strategic_indicators.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {indicators.map((ind) => (
            <IndicatorCard key={ind.indicator_key} indicator={ind} />
          ))}
        </div>
      )}

      <Card className="p-4 bg-muted/30 text-xs text-muted-foreground space-y-1">
        <p className="font-medium">Fuente de verdad</p>
        <p>
          Las metas se leen directamente de la tabla <code>strategic_indicators</code> y{" "}
          <code>strategic_indicator_yearly_targets</code>, cargadas desde el Direccionamiento
          Estratégico UAM 2024-2030 (pág. 56-58).
        </p>
        <p>
          Los valores reales provienen de la vista <code>v_indicator_progress</code>, que suma los
          aportes registrados en <code>ally_indicator_contributions</code>.
        </p>
      </Card>
    </div>
  );
}

function IndicatorCard({ indicator }: { indicator: IndicatorProgress }) {
  const target = indicator.target_value ?? 0;
  const actual = indicator.actual_value ?? 0;
  const pct = target > 0 ? Math.min((actual / target) * 100, 100) : 0;

  const unit =
    indicator.indicator_key.includes("ingresos") || indicator.indicator_key.includes("aumento")
      ? "moneda_cop"
      : indicator.indicator_key.includes("indice")
        ? "porcentaje"
        : "numero";

  const color = pct >= 75 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-rose-500";

  const statusText =
    pct >= 75 ? "En camino" : pct >= 40 ? "En progreso" : pct > 0 ? "Bajo" : "Sin avance";

  const statusColor =
    pct >= 75
      ? "border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:bg-emerald-950/40"
      : pct >= 40
        ? "border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-900 dark:text-amber-300 dark:bg-amber-950/40"
        : "border-rose-200 text-rose-700 bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:bg-rose-950/40";

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Badge variant="outline" className="text-[10px]">
              {indicator.objetivo}
            </Badge>
            <span className="truncate">{indicator.programa}</span>
          </div>
          <h3 className="text-sm font-semibold leading-snug">{indicator.label}</h3>
        </div>
        <Badge variant="outline" className={`shrink-0 text-[10px] ${statusColor}`}>
          {statusText}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-end justify-between text-xs">
          <span className="text-muted-foreground">Avance {indicator.year}</span>
          <span className="font-mono font-semibold">{pct.toFixed(1)}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md border p-2.5 bg-muted/20">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
            <Target className="w-3 h-3" /> Meta
          </div>
          <div className="text-sm font-semibold">{fmt(unit, target)}</div>
        </div>
        <div className="rounded-md border p-2.5 bg-muted/20">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
            <TrendingUp className="w-3 h-3" /> Real
          </div>
          <div className="text-sm font-semibold">{fmt(unit, actual)}</div>
        </div>
      </div>
    </Card>
  );
}
