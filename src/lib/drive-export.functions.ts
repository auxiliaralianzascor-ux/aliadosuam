import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import * as XLSX from "xlsx";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_drive";

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
  general: "General",
};

export const exportAlliesToDrive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Admin only
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

    const alliesSheet = (allies ?? []).map((a) => ({
      Nombre: a.name,
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
      "Actualizado": a.updated_at ? new Date(a.updated_at).toLocaleString("es-CO") : "",
    }));

    const activitiesSheet = (activities ?? []).map((act) => {
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

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(alliesSheet), "Aliados");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(activitiesSheet), "Seguimientos");
    const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;

    const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
    const fileName = `Aliados UAM ${stamp}.xlsx`;

    const lovableKey = process.env.LOVABLE_API_KEY;
    const driveKey = process.env.GOOGLE_DRIVE_API_KEY;
    if (!lovableKey || !driveKey) {
      throw new Error("Google Drive no está configurado. Vuelve a vincular el conector.");
    }

    const metadata = {
      name: fileName,
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };

    const boundary = "-------lovable-uam-" + Math.random().toString(36).slice(2);
    const enc = new TextEncoder();
    const head = enc.encode(
      `--${boundary}\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        JSON.stringify(metadata) +
        `\r\n--${boundary}\r\n` +
        `Content-Type: ${metadata.mimeType}\r\n\r\n`,
    );
    const tail = enc.encode(`\r\n--${boundary}--`);
    const body = new Uint8Array(head.byteLength + buffer.byteLength + tail.byteLength);
    body.set(head, 0);
    body.set(new Uint8Array(buffer), head.byteLength);
    body.set(tail, head.byteLength + buffer.byteLength);

    const res = await fetch(
      `${GATEWAY_URL}/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": driveKey,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body,
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Drive ${res.status}: ${text.slice(0, 300)}`);
    }
    const json = (await res.json()) as { id: string; name: string; webViewLink?: string };
    return { id: json.id, name: json.name, webViewLink: json.webViewLink ?? null };
  });
