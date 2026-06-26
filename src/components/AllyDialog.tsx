import { useState } from "react";
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
  type AllyStatus,
  type TrafficLight,
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
}

export function AllyDialog({ open, onOpenChange, ally, defaultStatus }: Props) {
  const save = useSaveAlly();
  const [form, setForm] = useState(() => ({
    name: ally?.name ?? "",
    sector: ally?.sector ?? "",
    status: (ally?.status ?? defaultStatus ?? "conversation") as AllyStatus,
    category: (ally?.category ?? "activo") as AllyCategory,
    traffic_light: (ally?.traffic_light ?? "yellow") as TrafficLight,
    contact_name: ally?.contact_name ?? "",
    contact_email: ally?.contact_email ?? "",
    contact_phone: ally?.contact_phone ?? "",
    valid_from: ally?.valid_from ?? "",
    valid_until: ally?.valid_until ?? "",
    notes: ally?.notes ?? "",
  }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("El nombre es obligatorio");
    try {
      await save.mutateAsync({
        id: ally?.id,
        name: form.name.trim(),
        sector: form.sector || null,
        status: form.status,
        category: form.status === "active" ? form.category : null,
        traffic_light: form.traffic_light,
        contact_name: form.contact_name || null,
        contact_email: form.contact_email || null,
        contact_phone: form.contact_phone || null,
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
            <div>
              <Label>Contacto</Label>
              <Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
            </div>
            <div>
              <Label>Correo de contacto</Label>
              <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
            </div>
            <div />
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
