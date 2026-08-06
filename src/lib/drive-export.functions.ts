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

    const [{ data: allies, error: ae }, { data: activities, error: aae }] = await Promise.all([
      supabase.from("allies").select("*").order("name"),
      supabase.from("ally_activities").select("*").order("activity_date", { ascending: false }),
    ]);
    if (ae) throw new Error(ae.message);
    if (aae) throw new Error(aae.message);

    const alliesById = new Map((allies ?? []).map((a) => [a.id, a]));

    const alliesRows = (allies ?? []).map((a) => ({
      Nombre: a.name,
      Dirección: a.direction ?? "",
      Estado: STATUS_LABEL[a.status] ?? a.status,
      Categoría: a.category ? CATEGORY_LABEL[a.category] ?? a.category : "",
      Semáforo: TRAFFIC_LABEL[a.traffic_light] ?? a.traffic_light,
      Sector: a.sector ?? "",
      Contacto: a.contact_name ?? "",
      Correo: a.contact_email ?? "",
      Teléfono: a.contact_phone ?? "",
      "Vigencia desde": a.valid_from ?? "",
      "Vigencia hasta": a.valid_until ?? "",
      Notas: a.notes ?? "",
      Actualizado: a.updated_at ? new Date(a.updated_at).toLocaleString("es-CO") : "",
    }));

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
