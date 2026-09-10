export const CURRENT_SMMLV = 1_750_905;

export const IVC_WEIGHTS = {
  economicContribution: 0.25,
  serviceDiversity: 0.15,
  trustAndProjection: 0.2,
  coCreatedImpact: 0.25,
  strategicCoherence: 0.15,
} as const;

export interface ClassificationInputs {
  annual_revenue: number;
  mission_areas: number;
  c3_age: boolean;
  c3_compliance: boolean;
  c3_events: boolean;
  c4_students: boolean;
  c4_rd_product: boolean;
  c4_impact: boolean;
  c5_research_affinity: boolean;
  c5_ethical_compliance: boolean;
  c5_strategic_plan: boolean;
}

export type AllyCategoryKey = "latente" | "emergente" | "activo" | "estrategico";

// Categorías, rangos y orquídeas representativas tal como están definidas en la
// Matriz de Clasificación de Aliados - Ruta de Valor Compartido UAM (v3).
export const CATEGORY_META: Record<
  AllyCategoryKey,
  { label: string; range: string; min: number; orchid: string; orchidScientific: string; state: string; ring: string; text: string }
> = {
  estrategico: {
    label: "Transformador / Estratégico",
    range: "IVC_total ≥ 0.80",
    min: 0.8,
    orchid: "Orquídea Pensamiento",
    orchidScientific: "Miltoniopsis hibrida",
    state: "Relación madura, de alto impacto y alineación total.",
    ring: "bg-[#15803d]",
    text: "text-white",
  },
  activo: {
    label: "Activo",
    range: "0.50 ≤ IVC_total < 0.80",
    min: 0.5,
    orchid: "Orquídea Josefina",
    orchidScientific: "Miltoniopsis phalaenopsis",
    state: "Relación estable con alto potencial de expansión.",
    ring: "bg-[#4ade80]",
    text: "text-emerald-950",
  },
  emergente: {
    label: "Emergente",
    range: "0.20 ≤ IVC_total < 0.50",
    min: 0.2,
    orchid: "Orquídea Pescatoria",
    orchidScientific: "Pescatoria",
    state: "Relación incipiente o focalizada que requiere fortalecimiento.",
    ring: "bg-[#86efac]",
    text: "text-emerald-950",
  },
  latente: {
    label: "Latente",
    range: "IVC_total < 0.20",
    min: 0,
    orchid: "Orquídea Tigre",
    orchidScientific: "Odontoglossum",
    state: "Relación débil, inactiva o con baja articulación.",
    ring: "bg-[#e8f5e9]",
    text: "text-emerald-950",
  },
};

export const CATEGORY_ORDER: AllyCategoryKey[] = ["estrategico", "activo", "emergente", "latente"];

export interface AllyClassification {
  c1_economic: number;
  c2_services: number;
  c3_trust: number;
  c4_impact: number;
  c5_coherence: number;
  ivc_total: number;
  category: "latente" | "emergente" | "estrategico" | "activo";
  recommendation: string;
  orchid_type: string;
}

export function classifyAlly(input: ClassificationInputs): AllyClassification {
  const c1_economic = input.annual_revenue === 0
    ? 0
    : input.annual_revenue < 10 * CURRENT_SMMLV
      ? 0.25
      : input.annual_revenue < 50 * CURRENT_SMMLV
        ? 0.5
        : input.annual_revenue < 150 * CURRENT_SMMLV
          ? 0.75
          : 1;
  const c2_services = input.mission_areas === 0 ? 0 : input.mission_areas >= 3 ? 1 : input.mission_areas === 2 ? 0.66 : 0.33;
  const c3_trust = (Number(input.c3_age) + Number(input.c3_compliance) + Number(input.c3_events)) / 3;
  const c4_impact = (Number(input.c4_students) + Number(input.c4_rd_product) + Number(input.c4_impact)) / 3;
  const c5_coherence = (Number(input.c5_research_affinity) + Number(input.c5_ethical_compliance) + Number(input.c5_strategic_plan)) / 3;
  const ivc_total =
    c1_economic * IVC_WEIGHTS.economicContribution +
    c2_services * IVC_WEIGHTS.serviceDiversity +
    c3_trust * IVC_WEIGHTS.trustAndProjection +
    c4_impact * IVC_WEIGHTS.coCreatedImpact +
    c5_coherence * IVC_WEIGHTS.strategicCoherence;

  if (ivc_total >= 0.8) {
    return {
      c1_economic, c2_services, c3_trust, c4_impact, c5_coherence, ivc_total,
      category: "estrategico",
      recommendation: "Consolidar y Proteger: Acuerdos marco de largo plazo, proyectos I+D+i a gran escala, visibilidad de alto nivel y participación en comités directivos.",
      orchid_type: "Orquídea Pensamiento",
    };
  }
  if (ivc_total >= 0.5) {
    return {
      c1_economic, c2_services, c3_trust, c4_impact, c5_coherence, ivc_total,
      category: "activo",
      recommendation: "Escalar a Estratégico: Ampliar la diversidad de servicios utilizados, estructurar planes de trabajo bianuales y aumentar la cofinanciación.",
      orchid_type: "Orquídea Josefina",
    };
  }
  if (ivc_total >= 0.2) {
    return {
      c1_economic, c2_services, c3_trust, c4_impact, c5_coherence, ivc_total,
      category: "emergente",
      recommendation: "Fortalecer y Fidelizar: Desarrollar pilotos de co-creación, definir 'quick wins' (logros rápidos) y mantener agenda de seguimiento semestral.",
      orchid_type: "Orquídea Pescatoria",
    };
  }
  return {
    c1_economic, c2_services, c3_trust, c4_impact, c5_coherence, ivc_total,
    category: "latente",
    recommendation: "Activar o Depurar: Presentar oferta básica institucional; si no existe tracción en 1 año, trasladar a estado inactivo para optimizar recursos.",
    orchid_type: "Orquídea Tigre",
  };
}