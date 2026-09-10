import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Ally } from "@/lib/allies-types";

const STATUS_LABEL: Record<string, string> = {
  conversation: "Conversación",
  pending: "Pendiente",
  active: "Activo",
};
const CATEGORY_LABEL: Record<string, string> = {
  latente: "Latente",
  emergente: "Emergente",
  estrategico: "Estratégico",
  activo: "Activo",
};
const TRAFFIC_LABEL: Record<string, string> = { green: "Verde", yellow: "Amarillo", red: "Rojo" };
const DIRECTION_LABEL: Record<string, string> = {
  alianzas: "Alianzas y Relaciones Corporativas",
  investigacion: "Investigación, Innovación y Emprendimiento",
  relaciones_internacionales: "Relaciones Internacionales",
  decanaturas: "Decanaturas",
  proyeccion: "Proyección",
};
const AREA_LABEL: Record<string, string> = {
  direccion: "Dirección",
  econti: "Econti",
  mercadeo: "Mercadeo",
  graduados: "Graduados",
  proyectos: "Proyectos",
  investigacion: "Investigación",
  innovacion: "Innovación",
  emprendimiento: "Emprendimiento",
  general: "General",
};

const academicLabel = (key: string) => {
  const map: Record<string, string> = {
    pregrado: "Pregrado",
    posgrado: "Posgrado",
    maestria: "Maestría",
    doctorado: "Doctorado",
    educacion_continuada: "Educación continuada",
  };
  return map[key] ?? key;
};

function toCsv(rows: Record<string, string>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]!);
  const esc = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.map(esc).join(";")];
  for (const r of rows) lines.push(headers.map((h) => esc(r[h] ?? "")).join(";"));
  return lines.join("\r\n");
}

export const exportAlliesToDrive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: roleRow, error: roleErr } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleErr) throw new Error(roleErr.message);
    if (!roleRow) throw new Error("Solo administradores pueden exportar.");

    const [
      { data: allies, error: ae },
      { data: activities, error: aae },
      { data: discounts, error: de },
    ] = await Promise.all([
      supabase.from("allies").select("*").order("name"),
      supabase.from("ally_activities").select("*").order("activity_date", { ascending: false }),
      supabase.from("ally_discounts").select("*"),
    ]);
    if (ae) throw new Error(ae.message);
    if (aae) throw new Error(aae.message);
    if (de) throw new Error(de.message);

    const allyRows = (allies ?? []) as unknown as Ally[];
    const alliesById = new Map(allyRows.map((a) => [a.id, a]));
    const discountByAlly = new Map((discounts ?? []).map((d) => [d.ally_id, d]));

    const fmtDate = (v: string | null) => (v ? new Date(v).toLocaleDateString("es-CO") : "");

    type Contact = { name?: string; position?: string; email?: string; phone?: string };
    const contactsOf = (a: { contacts: unknown; contact_name: string | null; contact_email: string | null; contact_phone: string | null }): Contact[] => {
      const list = Array.isArray(a.contacts) ? (a.contacts as Contact[]) : [];
      if (list.length > 0) return list;
      if (a.contact_name || a.contact_email || a.contact_phone) {
        return [{ name: a.contact_name ?? "", position: "", email: a.contact_email ?? "", phone: a.contact_phone ?? "" }];
      }
      return [];
    };

    const readAcademicGroup = (value: unknown): Record<string, unknown> => {
      if (!value || typeof value !== "object" || Array.isArray(value)) return {};
      return value as Record<string, unknown>;
    };

    // Una fila por aliado + contacto (normalizado); aliados sin contacto también salen.
    const alliesRows = allyRows.flatMap((a) => {
      const disc = discountByAlly.get(a.id);
      const vencido =
        a.status === "active" && a.valid_until && new Date(a.valid_until) < new Date() ? "Sí" : "No";
      const academic = readAcademicGroup(a.academic_participation);
      const employeesByLevel = readAcademicGroup(academic.empleados);
      const relativesByLevel = readAcademicGroup(academic.familiares);
      const academicObservation = typeof academic.observaciones === "string" ? academic.observaciones : "";
      const academicSummary = Object.fromEntries(
        ["pregrado", "posgrado", "maestria", "doctorado", "educacion_continuada"].flatMap((level) => {
          const employees = Boolean(employeesByLevel[level] === true);
          const relatives = Boolean(relativesByLevel[level] === true);
          return [
            [`Participación UAM - ${academicLabel(level)} - Empleados`, employees ? "Sí" : "No"],
            [`Participación UAM - ${academicLabel(level)} - Familiares`, relatives ? "Sí" : "No"],
          ];
        }),
      );
      const base = {
        "ID aliado": a.id,
        Nombre: a.name,
        "NIT / ID": a.nit ?? "",
        Origen: a.origin ?? "",
        Dirección: DIRECTION_LABEL[a.direction] ?? a.direction ?? "",
        Decanatura: a.decanatura ?? "",
        Estado: STATUS_LABEL[a.status] ?? a.status,
        Categoría: a.category ? CATEGORY_LABEL[a.category] ?? a.category : "",
        Semáforo: TRAFFIC_LABEL[a.traffic_light] ?? a.traffic_light,
        "Recaudo anual consolidado (COP)": String(a.annual_revenue ?? 0),
        "Áreas misionales vinculadas": String(a.mission_areas ?? 0),
        "C3.1 Antigüedad >= 3 años": a.c3_age ? "1" : "0",
        "C3.2 Cumplimiento 100%": a.c3_compliance ? "1" : "0",
        "C3.3 Eventos UAM >= 2/año": a.c3_events ? "1" : "0",
        "C4.1 Estudiantes beneficiados": a.c4_students ? "1" : "0",
        "C4.2 Producto tangible I+D": a.c4_rd_product ? "1" : "0",
        "C4.3 Impacto verificado": a.c4_impact ? "1" : "0",
        "C5.1 Afinidad investigativa": a.c5_research_affinity ? "1" : "0",
        "C5.2 Cumplimiento ético/legal": a.c5_ethical_compliance ? "1" : "0",
        "C5.3 Aporte Plan Estratégico": a.c5_strategic_plan ? "1" : "0",
        "C1: Contribución Económica": String(a.c1_economic ?? ""),
        "C2: Diversidad Servicios": String(a.c2_services ?? ""),
        "C3: Confianza y Proyección": String(a.c3_trust ?? ""),
        "C4: Impacto Co-creado": String(a.c4_cocreated_impact ?? ""),
        "C5: Coherencia Estratégica": String(a.c5_coherence ?? ""),
        IVC_total: String(a.ivc_total ?? ""),
        "Recomendación de Gestión Directiva": a.management_recommendation ?? "",
        "Tipo de Orquídea": a.orchid_type ?? "",
        Sector: a.sector ?? "",
        "Vigencia desde": fmtDate(a.valid_from),
        "Vigencia hasta": fmtDate(a.valid_until),
        "Convenio vencido": vencido,
        "Descuento pregrado": disc?.pregrado ?? "",
        "Descuento posgrado": disc?.posgrado ?? "",
        "Descuento inglés": disc?.ingles ?? "",
        "Descuento Econti": disc?.econti ?? "",
        ...academicSummary,
        "Observaciones participación académica": academicObservation.replace(/\r?\n/g, " "),
        Notas: (a.notes ?? "").replace(/\r?\n/g, " "),
        Creado: fmtDate(a.created_at),
        Actualizado: a.updated_at ? new Date(a.updated_at).toLocaleString("es-CO") : "",
      };
      const contacts = contactsOf(a);
      if (contacts.length === 0) {
        return [{ ...base, "Contacto #": "", "Contacto nombre": "", "Contacto cargo": "", "Contacto correo": "", "Contacto teléfono": "" }];
      }
      return contacts.map((c, i) => ({
        ...base,
        "Contacto #": String(i + 1),
        "Contacto nombre": c.name ?? "",
        "Contacto cargo": c.position ?? "",
        "Contacto correo": c.email ?? "",
        "Contacto teléfono": c.phone ?? "",
      }));
    });

    const activitiesRows = (activities ?? []).map((act) => {
      const ally = alliesById.get(act.ally_id);
      return {
        "ID aliado": act.ally_id,
        Aliado: ally?.name ?? act.ally_id,
        Dirección: ally ? DIRECTION_LABEL[ally.direction] ?? ally.direction : "",
        "Estado aliado": ally ? STATUS_LABEL[ally.status] ?? ally.status : "",
        Área: AREA_LABEL[act.area] ?? act.area,
        Tipo: act.activity_type,
        Fecha: act.activity_date ? new Date(act.activity_date).toLocaleDateString("es-CO") : "",
        Responsable: act.responsible_name,
        Descripción: (act.description ?? "").replace(/\r?\n/g, " "),
        Registrado: act.created_at ? new Date(act.created_at).toLocaleString("es-CO") : "",
      };
    });

    const stamp = new Date().toISOString().slice(0, 10);
    return {
      alliesCsv: toCsv(alliesRows),
      activitiesCsv: toCsv(activitiesRows),
      alliesFileName: `Aliados UAM ${stamp}.csv`,
      activitiesFileName: `Seguimientos UAM ${stamp}.csv`,
    };
  });
