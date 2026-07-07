export type AllyStatus = "conversation" | "pending" | "active";
export type AllyCategory = "latente" | "emergente" | "estrategico" | "activo";
export type TrafficLight = "green" | "yellow" | "red";
export type AllyDirection =
  | "alianzas"
  | "investigacion"
  | "relaciones_internacionales"
  | "decanaturas"
  | "proyeccion";

export const DIRECTION_LABEL: Record<AllyDirection, string> = {
  alianzas: "Alianzas y Relaciones Corporativas",
  investigacion: "Investigación, Innovación y Emprendimiento",
  relaciones_internacionales: "Relaciones Internacionales",
  decanaturas: "Decanaturas",
  proyeccion: "Proyección",
};

export type FollowupArea =
  | "direccion"
  | "econti"
  | "mercadeo"
  | "graduados"
  | "proyectos"
  | "general"
  | "investigacion"
  | "innovacion"
  | "emprendimiento";

// Áreas de seguimiento visibles por dirección según el estado del aliado.
export const AREAS_BY_DIRECTION: Record<AllyDirection, { active: FollowupArea[]; inactive: FollowupArea[] }> = {
  alianzas: {
    active: ["direccion", "econti", "mercadeo", "graduados", "proyectos"],
    inactive: ["general"],
  },
  investigacion: {
    active: ["investigacion", "innovacion", "emprendimiento", "general"],
    inactive: ["general"],
  },
  relaciones_internacionales: {
    active: ["direccion", "econti", "mercadeo", "graduados", "proyectos"],
    inactive: ["general"],
  },
  decanaturas: {
    active: ["direccion", "econti", "mercadeo", "graduados", "proyectos"],
    inactive: ["general"],
  },
  proyeccion: {
    active: ["direccion", "econti", "mercadeo", "graduados", "proyectos"],
    inactive: ["general"],
  },
};

// Decanaturas de la Universidad Autónoma de Manizales.
export const DECANATURAS = [
  "Facultad de Salud",
  "Facultad de Ingenierías",
  "Facultad de Estudios Sociales y Empresariales",
  "Departamento de Ciencias Básicas",
] as const;
export type Decanatura = (typeof DECANATURAS)[number];

export interface AllyContact {
  name: string;
  position: string;
  email: string;
  phone: string;
}

export interface Ally {
  id: string;
  name: string;
  sector: string | null;
  status: AllyStatus;
  direction: AllyDirection;
  category: AllyCategory | null;
  traffic_light: TrafficLight;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contacts: AllyContact[] | null;
  notes: string | null;
  valid_from: string | null;
  valid_until: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function getAllyContacts(ally: Pick<Ally, "contacts" | "contact_name" | "contact_email" | "contact_phone">): AllyContact[] {
  const list = Array.isArray(ally.contacts) ? ally.contacts : [];
  if (list.length > 0) return list;
  if (ally.contact_name || ally.contact_email || ally.contact_phone) {
    return [{
      name: ally.contact_name ?? "",
      position: "",
      email: ally.contact_email ?? "",
      phone: ally.contact_phone ?? "",
    }];
  }
  return [];
}

export interface AllyActivity {
  id: string;
  ally_id: string;
  area: FollowupArea;
  activity_type: string;
  description: string;
  activity_date: string;
  responsible_id: string | null;
  responsible_name: string;
  created_at: string;
}

export const STATUS_LABEL: Record<AllyStatus, string> = {
  conversation: "Conversación",
  pending: "Pendiente",
  active: "Activo",
};

export const CATEGORY_LABEL: Record<AllyCategory, string> = {
  latente: "Latente",
  emergente: "Emergente",
  estrategico: "Estratégico",
  activo: "Activo",
};

export const AREA_LABEL: Record<FollowupArea, string> = {
  direccion: "Dirección",
  econti: "Econti",
  mercadeo: "Mercadeo",
  graduados: "Graduados",
  proyectos: "Proyectos",
  general: "General",
  investigacion: "Investigación",
  innovacion: "Innovación",
  emprendimiento: "Emprendimiento",
};

export const TRAFFIC_META: Record<
  TrafficLight,
  { label: string; dot: string; bg: string; border: string; text: string }
> = {
  green: {
    label: "Verde",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-900",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  yellow: {
    label: "Amarillo",
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-900",
    text: "text-amber-700 dark:text-amber-400",
  },
  red: {
    label: "Rojo",
    dot: "bg-rose-500",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-900",
    text: "text-rose-700 dark:text-rose-400",
  },
};

export const TRAFFIC_HELP: Record<AllyStatus, Record<TrafficLight, string>> = {
  active: {
    green: "Se trabaja constantemente y se registran observaciones recientes.",
    yellow: "Se está comenzando o planeando trabajo con este aliado.",
    red: "No se está trabajando: hay que contactarlo cuanto antes.",
  },
  pending: {
    green: "Convenio cargado y firmado, pendiente de aprobación.",
    yellow: "Aliado emergiendo, con posibilidad real de convenio.",
    red: "No se ven oportunidades; evaluar descarte.",
  },
  conversation: {
    green: "Conversación avanzada, listo para pasar a pendiente.",
    yellow: "Conversaciones iniciales en curso.",
    red: "Conversaciones detenidas o sin avance.",
  },
};
