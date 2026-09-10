import { Card } from "@/components/ui/card";
import { CATEGORY_META, CATEGORY_ORDER, CURRENT_SMMLV, IVC_WEIGHTS, type AllyCategoryKey } from "@/lib/ally-classification";
import type { Ally } from "@/lib/allies-types";

interface Props {
  allies: Ally[];
}

const money = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

export function AllyGarden({ allies }: Props) {
  const counts = CATEGORY_ORDER.reduce((acc, key) => {
    acc[key] = allies.filter((a) => a.category === key).length;
    return acc;
  }, {} as Record<AllyCategoryKey, number>);
  const total = CATEGORY_ORDER.reduce((sum, k) => sum + counts[k], 0);

  return (
    <Card className="p-4 space-y-3">
      <div>
        <h2 className="text-sm font-semibold">Jardín de Aliados UAM</h2>
        <p className="text-xs text-muted-foreground">
          Distribución de aliados activos por categoría de la Matriz de Valor Compartido (IVC_total) y su orquídea representativa.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORY_ORDER.map((key) => {
          const meta = CATEGORY_META[key];
          const pct = total > 0 ? Math.round((counts[key] / total) * 100) : 0;
          return (
            <div key={key} className={`rounded-lg border p-3 ${meta.ring} ${meta.text}`}>
              <div className="text-xs font-semibold">{meta.label}</div>
              <div className="text-2xl font-bold leading-tight">{counts[key]}</div>
              <div className="text-[11px] opacity-90">{pct}% del total · {meta.range}</div>
              <div className="text-[11px] mt-1 italic opacity-90">
                {meta.orchidScientific} ({meta.orchid})
              </div>
              <div className="text-[11px] mt-1 opacity-90">{meta.state}</div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground">
        Parámetros de la matriz: SMMLV vigente {money.format(CURRENT_SMMLV)} · Pesos C1 {IVC_WEIGHTS.economicContribution * 100}% ·
        C2 {IVC_WEIGHTS.serviceDiversity * 100}% · C3 {IVC_WEIGHTS.trustAndProjection * 100}% · C4 {IVC_WEIGHTS.coCreatedImpact * 100}% ·
        C5 {IVC_WEIGHTS.strategicCoherence * 100}%.
      </p>
    </Card>
  );
}
