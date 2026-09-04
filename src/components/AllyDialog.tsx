import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Percent, X } from "lucide-react";
import { useSaveAlly } from "@/lib/allies-api";
import { useSaveDiscount, DISCOUNT_CATEGORIES, type DiscountCategory } from "@/lib/discounts-api";
import {
  type Ally,
  type AllyCategory,
  type AllyContact,
  type AllyDirection,
  type AllyStatus,
  type AcademicParticipation,
  type TrafficLight,
  DECANATURAS,
  ACADEMIC_LEVELS,
  STATUS_LABEL,
  CATEGORY_LABEL,
  TRAFFIC_META,
  TRAFFIC_HELP,
  DIRECTIONS,
  DIRECTION_LABEL,
  getAllyContacts,
} from "@/lib/allies-types";
import { toast } from "sonner";

const emptyContact = (): AllyContact => ({ name: "", position: "", email: "", phone: "" });

const emptyAcademicParticipation = (): AcademicParticipation => ({
  empleados: {
    pregrado: false,
    posgrado: false,
    maestria: false,
    doctorado: false,
    educacion_continuada: false,
  },
  familiares: {
    pregrado: false,
    posgrado: false,
    maestria: false,
    doctorado: false,
    educacion_continuada: false,
  },
  observaciones: "",
});

const ensureAcademicParticipation = (value: AcademicParticipation | null | undefined): AcademicParticipation => {
  const empty = emptyAcademicParticipation();
  return {
    empleados: { ...empty.empleados, ...(value?.empleados ?? {}) },
    familiares: { ...empty.familiares, ...(value?.familiares ?? {}) },
    observaciones: value?.observaciones ?? "",
  };
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ally?: Ally | null;
  defaultStatus?: AllyStatus;
  direction?: AllyDirection;
}

export function AllyDialog({ open, onOpenChange, ally, defaultStatus, direction = "alianzas" }: Props) {
  const save = useSaveAlly();
  const saveDiscount = useSaveDiscount();
  const activeDirection: AllyDirection = ally?.direction ?? direction;
  const canCreateNewAlly = !ally && activeDirection === "alianzas";
  const canAddDiscounts = canCreateNewAlly;
  const buildInitial = () => {
    const initialContacts = ally ? getAllyContacts(ally) : [];
    return {
      name: ally?.name ?? "",
      sector: ally?.sector ?? "",
      decanatura: ally?.decanatura ?? "",
      academic_participation: ensureAcademicParticipation(ally?.academic_participation),
      status: (ally?.status ?? defaultStatus ?? "conversation") as AllyStatus,
      category: (ally?.category ?? "activo") as AllyCategory,
      traffic_light: (ally?.traffic_light ?? "yellow") as TrafficLight,
      contacts: initialContacts.length > 0 ? initialContacts : [emptyContact()],
      valid_from: ally?.valid_from ?? "",
      valid_until: ally?.valid_until ?? "",
      notes: ally?.notes ?? "",
      shared_with_directions: ally?.shared_with_directions ?? [],
    };
  };
  const [form, setForm] = useState(buildInitial);
  const [discountsOpen, setDiscountsOpen] = useState(false);
  const [discounts, setDiscounts] = useState<Record<DiscountCategory, string>>({
    pregrado: "",
    posgrado: "",
    econti: "",
    ingles: "",
  });

  useEffect(() => {
    if (open) {
      setForm(buildInitial());
      setDiscountsOpen(false);
      setDiscounts({ pregrado: "", posgrado: "", econti: "", ingles: "" });
    }
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
    if (!ally && activeDirection !== "alianzas") {
      return toast.error("Solo la dirección de Alianzas puede crear aliados. El resto solo puede compartirlos.");
    }
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
      let dupQuery = supabase.from("allies").select("id,name").ilike("name", name).eq("direction", activeDirection);
      if (ally?.id) dupQuery = dupQuery.neq("id", ally.id);
      const { data: dupes, error: dupErr } = await dupQuery;
      if (dupErr) throw dupErr;
      if (dupes && dupes.length > 0) {
        return toast.error("Ya existe un aliado con este nombre en esta dirección");
      }
      const saved = await save.mutateAsync({
        id: ally?.id,
        name: form.name.trim(),
        sector: form.sector || null,
        decanatura: activeDirection === "decanaturas" ? (form.decanatura || null) : null,
        academic_participation: form.academic_participation,
        status: form.status,
        direction: activeDirection,
        category: form.status === "active" ? form.category : null,
        traffic_light: form.traffic_light,
        contact_name: primary?.name || null,
        contact_email: primary?.email || null,
        contact_phone: primary?.phone || null,
        contacts: cleanContacts,
        valid_from: form.valid_from || null,
        valid_until: form.valid_until || null,
        notes: form.notes || null,
        shared_with_directions: form.shared_with_directions,
      });
      if (canAddDiscounts && discountsOpen) {
        const anyValue = Object.values(discounts).some((v) => v.trim());
        const newId = (saved as { id?: string } | null)?.id;
        if (anyValue && newId) {
          await saveDiscount.mutateAsync({
            ally_id: newId,
            pregrado: discounts.pregrado.trim() || null,
            posgrado: discounts.posgrado.trim() || null,
            econti: discounts.econti.trim() || null,
            ingles: discounts.ingles.trim() || null,
          });
        }
      }
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
            {activeDirection === "decanaturas" && (
              <div className="sm:col-span-2">
                <Label>Decanatura</Label>
                <Select value={form.decanatura} onValueChange={(v) => setForm({ ...form, decanatura: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecciona una decanatura" /></SelectTrigger>
                  <SelectContent>
                    {DECANATURAS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
            <div className="sm:col-span-2 rounded-md border bg-muted/20 p-3 space-y-3">
              <div>
                <Label>Participación académica UAM</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Registra si el aliado tiene empleados o familiares vinculados a programas de la UAM en los niveles académicos institucionales.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {ACADEMIC_LEVELS.map((level) => (
                  <div key={level.key} className="rounded-md border bg-background p-3">
                    <div className="font-medium text-sm mb-2">{level.label}</div>
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ensureAcademicParticipation(form.academic_participation).empleados[level.key]}
                          onChange={(e) => setForm((f) => ({
                            ...f,
                            academic_participation: {
                              ...ensureAcademicParticipation(f.academic_participation),
                              empleados: {
                                ...ensureAcademicParticipation(f.academic_participation).empleados,
                                [level.key]: e.target.checked,
                              },
                            },
                          }))}
                          className="rounded border-input text-primary focus:ring-primary"
                        />
                        Empleados
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ensureAcademicParticipation(form.academic_participation).familiares[level.key]}
                          onChange={(e) => setForm((f) => ({
                            ...f,
                            academic_participation: {
                              ...ensureAcademicParticipation(f.academic_participation),
                              familiares: {
                                ...ensureAcademicParticipation(f.academic_participation).familiares,
                                [level.key]: e.target.checked,
                              },
                            },
                          }))}
                          className="rounded border-input text-primary focus:ring-primary"
                        />
                        Familiares
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <Label className="text-xs">Observaciones</Label>
                <Textarea
                  rows={2}
                  value={ensureAcademicParticipation(form.academic_participation).observaciones ?? ""}
                  onChange={(e) => setForm((f) => ({
                    ...f,
                    academic_participation: {
                      ...ensureAcademicParticipation(f.academic_participation),
                      observaciones: e.target.value || null,
                    },
                  }))}
                  placeholder="Ej. El aliado aporta estudiantes de pregrado y maestría..."
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label>Compartir con otras direcciones</Label>
              <div className="mt-2 grid sm:grid-cols-2 gap-2">
                {DIRECTIONS.filter(d => d !== activeDirection).map(d => (
                  <label key={d} className="flex items-center gap-2 text-sm cursor-pointer border rounded-md p-2 bg-background hover:bg-muted/50">
                    <input
                      type="checkbox"
                      checked={form.shared_with_directions.includes(d)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm(f => ({ ...f, shared_with_directions: [...f.shared_with_directions, d] }));
                        } else {
                          setForm(f => ({ ...f, shared_with_directions: f.shared_with_directions.filter(x => x !== d) }));
                        }
                      }}
                      className="rounded border-input text-primary focus:ring-primary"
                    />
                    {DIRECTION_LABEL[d]}
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Los usuarios de las direcciones seleccionadas podrán ver este aliado y registrar seguimientos.</p>
            </div>
            {canAddDiscounts && (
              <div className="sm:col-span-2 space-y-2">
                {!discountsOpen ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => setDiscountsOpen(true)}>
                    <Plus className="w-3.5 h-3.5" /> Agregar descuentos
                  </Button>
                ) : (
                  <div className="rounded-md border p-3 bg-muted/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium inline-flex items-center gap-1.5">
                        <Percent className="w-4 h-4" /> Descuentos del aliado
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          setDiscountsOpen(false);
                          setDiscounts({ pregrado: "", posgrado: "", econti: "", ingles: "" });
                        }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {DISCOUNT_CATEGORIES.map((cat) => (
                        <div key={cat.key}>
                          <Label className="text-xs">{cat.label}</Label>
                          <Input
                            value={discounts[cat.key]}
                            onChange={(e) => setDiscounts((d) => ({ ...d, [cat.key]: e.target.value }))}
                            placeholder="Ej. 15%"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Deja en blanco las categorías que no aplican.</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={save.isPending || saveDiscount.isPending}>{ally ? "Guardar cambios" : "Crear aliado"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
