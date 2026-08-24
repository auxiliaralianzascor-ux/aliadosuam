import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

    const alliesById = new Map((allies ?? []).map((a) => [a.id, a]));
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

    // Una fila por aliado + contacto (normalizado); aliados sin contacto también salen.
    const alliesRows = (allies ?? []).flatMap((a) => {
      const disc = discountByAlly.get(a.id);
      const vencido =
        a.status === "active" && a.valid_until && new Date(a.valid_until) < new Date() ? "Sí" : "No";
      const base = {
        "ID aliado": a.id,
        Nombre: a.name,
        Dirección: DIRECTION_LABEL[a.direction] ?? a.direction ?? "",
        Decanatura: a.decanatura ?? "",
        Estado: STATUS_LABEL[a.status] ?? a.status,
        Categoría: a.category ? CATEGORY_LABEL[a.category] ?? a.category : "",
        Semáforo: TRAFFIC_LABEL[a.traffic_light] ?? a.traffic_light,
        Sector: a.sector ?? "",
        "Vigencia desde": fmtDate(a.valid_from),
        "Vigencia hasta": fmtDate(a.valid_until),
        "Convenio vencido": vencido,
        "Descuento pregrado": disc?.pregrado ?? "",
        "Descuento posgrado": disc?.posgrado ?? "",
        "Descuento inglés": disc?.ingles ?? "",
        "Descuento Econti": disc?.econti ?? "",
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
        Aliado: ally?.name ?? act.ally_id,
        Área: AREA_LABEL[act.area] ?? act.area,
        Tipo: act.activity_type,
        Fecha: act.activity_date ? new Date(act.activity_date).toLocaleDateString("es-CO") : "",
        Responsable: act.responsible_name,
        Descripción: act.description,
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
