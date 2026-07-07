import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useSaveAlly } from "@/lib/allies-api";
import {
  type Ally,
  type AllyCategory,
  type AllyContact,
  type AllyDirection,
  type AllyStatus,
  type TrafficLight,
  DECANATURAS,
  STATUS_LABEL,
  CATEGORY_LABEL,
  TRAFFIC_META,
  TRAFFIC_HELP,
  getAllyContacts,
} from "@/lib/allies-types";
import { toast } from "sonner";

const emptyContact = (): AllyContact => ({ name: "", position: "", email: "", phone: "" });

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ally?: Ally | null;
  defaultStatus?: AllyStatus;
  direction?: AllyDirection;
}

export function AllyDialog({ open, onOpenChange, ally, defaultStatus, direction = "alianzas" }: Props) {
  const save = useSaveAlly();
  const activeDirection: AllyDirection = ally?.direction ?? direction;
  const buildInitial = () => {
    const initialContacts = ally ? getAllyContacts(ally) : [];
    return {
      name: ally?.name ?? "",
      sector: ally?.sector ?? "",
      decanatura: ally?.decanatura ?? "",
      status: (ally?.status ?? defaultStatus ?? "conversation") as AllyStatus,
      category: (ally?.category ?? "activo") as AllyCategory,
      traffic_light: (ally?.traffic_light ?? "yellow") as TrafficLight,
      contacts: initialContacts.length > 0 ? initialContacts : [emptyContact()],
      valid_from: ally?.valid_from ?? "",
      valid_until: ally?.valid_until ?? "",
      notes: ally?.notes ?? "",
    };
  };
  const [form, setForm] = useState(buildInitial);

  useEffect(() => {
    if (open) setForm(buildInitial());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ally?.id, defaultStatus]);

  const updateContact = (idx: number, patch: Partial<AllyContact>) => {
    setForm((f) => ({
      ...f,
      contacts: f.contacts.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    }));
  };
  const addContact = () =>
    setForm((f) => ({ ...f, contacts: [...f.contacts, emptyContact()] }));
  const removeContact = (idx: number) =>
    setForm((f) => ({
      ...f,
      contacts: f.contacts.length > 1 ? f.contacts.filter((_, i) => i !== idx) : f.contacts,
    }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (save.isPending) return;
    const name = form.name.trim();
    if (!name) return toast.error("El nombre es obligatorio");
    const cleanContacts = form.contacts
      .map((c) => ({
        name: c.name.trim(),
        position: c.position.trim(),
        email: c.email.trim(),
        phone: c.phone.trim(),
      }))
      .filter((c) => c.name || c.position || c.email || c.phone);
    const primary = cleanContacts[0];
    try {
      // Duplicate name check (case-insensitive) within same direction
      const { supabase } = await import("@/integrations/supabase/client");
      let dupQuery = supabase.from("allies").select("id,name").ilike("name", name).eq("direction", ally?.direction ?? direction);
      if (ally?.id) dupQuery = dupQuery.neq("id", ally.id);
      const { data: dupes, error: dupErr } = await dupQuery;
      if (dupErr) throw dupErr;
      if (dupes && dupes.length > 0) {
        return toast.error("Ya existe un aliado con este nombre en esta dirección");
      }
      await save.mutateAsync({
        id: ally?.id,
        name: form.name.trim(),
        sector: form.sector || null,
        status: form.status,
        direction: ally?.direction ?? direction,
        category: form.status === "active" ? form.category : null,
        traffic_light: form.traffic_light,
        contact_name: primary?.name || null,
        contact_email: primary?.email || null,
        contact_phone: primary?.phone || null,
        contacts: cleanContacts,
        valid_from: form.valid_from || null,
        valid_until: form.valid_until || null,
        notes: form.notes || null,
      });
      toast.success(ally ? "Aliado actualizado" : "Aliado creado");
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ally ? "Editar aliado" : "Nuevo aliado"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Nombre del aliado *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <Label>Sector / Industria</Label>
              <Input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} placeholder="Ej. Salud, Tecnología" />
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as AllyStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABEL) as AllyStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.status === "active" && (
              <div>
                <Label>Categoría</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as AllyCategory })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CATEGORY_LABEL) as AllyCategory[]).map((c) => (
                      <SelectItem key={c} value={c}>{CATEGORY_LABEL[c]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className={form.status === "active" ? "" : "sm:col-span-2"}>
              <Label>Semáforo</Label>
              <Select value={form.traffic_light} onValueChange={(v) => setForm({ ...form, traffic_light: v as TrafficLight })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["green", "yellow", "red"] as TrafficLight[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      <span className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${TRAFFIC_META[t].dot}`} />
                        {TRAFFIC_META[t].label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">{TRAFFIC_HELP[form.status][form.traffic_light]}</p>
            </div>
            <div className="sm:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <Label>Contactos</Label>
                <Button type="button" variant="outline" size="sm" onClick={addContact}>
                  <Plus className="w-3.5 h-3.5" /> Añadir contacto
                </Button>
              </div>
              {form.contacts.map((c, idx) => (
                <div key={idx} className="rounded-md border p-3 bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Contacto {idx + 1}</span>
                    {form.contacts.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeContact(idx)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Nombre</Label>
                      <Input value={c.name} onChange={(e) => updateContact(idx, { name: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Cargo</Label>
                      <Input value={c.position} onChange={(e) => updateContact(idx, { position: e.target.value })} placeholder="Ej. Gerente de RRHH" />
                    </div>
                    <div>
                      <Label className="text-xs">Correo</Label>
                      <Input type="email" value={c.email} onChange={(e) => updateContact(idx, { email: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Teléfono</Label>
                      <Input value={c.phone} onChange={(e) => updateContact(idx, { phone: e.target.value })} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <Label>Vigencia desde</Label>
              <Input type="date" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} />
            </div>
            <div>
              <Label>Vigencia hasta</Label>
              <Input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Notas generales</Label>
              <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={save.isPending}>{ally ? "Guardar cambios" : "Crear aliado"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
