import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAllyDiscount, useSaveDiscount, DISCOUNT_CATEGORIES } from "@/lib/discounts-api";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  allyId: string;
  allyName?: string;
}

export function DiscountDialog({ open, onOpenChange, allyId, allyName }: Props) {
  const { data: existing } = useAllyDiscount(open ? allyId : undefined);
  const save = useSaveDiscount();
  const [form, setForm] = useState({ pregrado: "", posgrado: "", econti: "", ingles: "" });

  useEffect(() => {
    if (open) {
      setForm({
        pregrado: existing?.pregrado ?? "",
        posgrado: existing?.posgrado ?? "",
        econti: existing?.econti ?? "",
        ingles: existing?.ingles ?? "",
      });
    }
  }, [open, existing?.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await save.mutateAsync({
        ally_id: allyId,
        pregrado: form.pregrado.trim() || null,
        posgrado: form.posgrado.trim() || null,
        ingles: form.ingles.trim() || null,
        econti: form.econti.trim() || null,
      });
      toast.success("Descuentos guardados");
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Descuentos {allyName ? `· ${allyName}` : ""}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {DISCOUNT_CATEGORIES.map((c) => (
            <div key={c.key}>
              <Label>{c.label}</Label>
              <Textarea
                rows={4}
                value={form[c.key]}
                onChange={(e) => setForm({ ...form, [c.key]: e.target.value })}
                placeholder={`Descuentos aplicables a ${c.label}. Déjalo vacío si no aplica.`}
              />
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={save.isPending}>Guardar descuentos</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
