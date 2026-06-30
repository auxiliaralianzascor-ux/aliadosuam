import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAlly, useActivities, useAddActivity, useDeleteAlly, useDeleteActivity, useSaveAlly } from "@/lib/allies-api";
import { canEditArea, useMyPermissions } from "@/lib/permissions-api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Calendar, Edit2, Loader2, Lock, Mail, Phone, Plus, Trash2, User2, ArrowRightCircle, AlertTriangle } from "lucide-react";
import { AllyDialog } from "@/components/AllyDialog";
import {
  AREA_LABEL, CATEGORY_LABEL, STATUS_LABEL, TRAFFIC_HELP, TRAFFIC_META,
  getAllyContacts,
  type FollowupArea, type AllyStatus,
} from "@/lib/allies-types";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/aliados/$id")({
  head: () => ({ meta: [{ title: "Aliado · UAM" }] }),
  component: AllyDetail,
});

const ACTIVITY_TYPES = ["Observación", "Reunión", "Correo", "Llamada", "Evento", "Visita", "Otro"];

function AllyDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: ally, isLoading } = useAlly(id);
  const { data: perms } = useMyPermissions();
  const isAdmin = !!perms?.isAdmin;
  const [editOpen, setEditOpen] = useState(false);
  const deleteAlly = useDeleteAlly();
  const saveAlly = useSaveAlly();

  if (isLoading || !ally) {
    return <div className="grid place-items-center py-20 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  const tl = TRAFFIC_META[ally.traffic_light];
  const isActive = ally.status === "active";
  const expired = (() => {
    if (!isActive || !ally.valid_until) return false;
    const d = new Date(ally.valid_until);
    if (Number.isNaN(d.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  })();

  const promote = async () => {
    const next: AllyStatus = ally.status === "conversation" ? "pending" : "active";
    try {
      await saveAlly.mutateAsync({ id: ally.id, status: next, category: next === "active" ? (ally.category ?? "activo") : null });
      toast.success(`Movido a ${STATUS_LABEL[next]}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAlly.mutateAsync(ally.id);
      toast.success("Aliado eliminado");
      navigate({ to: "/aliados" });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  return (
    <div className="space-y-5">
      <Link to="/aliados" className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Volver a aliados
      </Link>

      <Card className={`p-5 border-l-4 ${tl.border}`}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`w-3 h-3 rounded-full ${tl.dot}`} />
              <h1 className="text-2xl font-bold">{ally.name}</h1>
              <Badge variant="secondary">{STATUS_LABEL[ally.status]}</Badge>
              {isActive && ally.category && <Badge variant="outline">{CATEGORY_LABEL[ally.category]}</Badge>}
              {expired && (
                <Badge variant="outline" className="border-rose-300 text-rose-700 dark:border-rose-900 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Contrato vencido
                </Badge>
              )}
            </div>
            {ally.sector && <p className="text-sm text-muted-foreground mt-1">{ally.sector}</p>}
            <p className={`text-xs mt-2 ${tl.text}`}>{TRAFFIC_HELP[ally.status][ally.traffic_light]}</p>

            {expired && (
              <div className="mt-3 flex items-center gap-2 rounded-md border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-3 py-2 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Contrato vencido el {ally.valid_until}. Renovar o actualizar la vigencia.</span>
              </div>
            )}

            {(() => {
              const contacts = getAllyContacts(ally);
              if (contacts.length === 0) return null;
              return (
                <div className="mt-4 space-y-3">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contactos</div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {contacts.map((c, i) => (
                      <div key={i} className="rounded-md border p-3 bg-muted/20 space-y-1 text-sm">
                        {c.name && (
                          <div className="flex items-center gap-2 font-medium">
                            <User2 className="w-4 h-4 text-muted-foreground" /> {c.name}
                          </div>
                        )}
                        {c.position && <div className="text-xs text-muted-foreground pl-6">{c.position}</div>}
                        {c.email && <div className="flex items-center gap-2 text-xs"><Mail className="w-3.5 h-3.5 text-muted-foreground" /> {c.email}</div>}
                        {c.phone && <div className="flex items-center gap-2 text-xs"><Phone className="w-3.5 h-3.5 text-muted-foreground" /> {c.phone}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {(ally.valid_from || ally.valid_until) && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Vigencia: {ally.valid_from ?? "—"} → {ally.valid_until ?? "—"}
              </div>
            )}


            {ally.notes && (
              <div className="mt-4 rounded-md bg-muted/40 p-3 text-sm whitespace-pre-wrap">{ally.notes}</div>
            )}
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {isAdmin ? (
              <>
                <Button variant="outline" onClick={() => setEditOpen(true)}><Edit2 className="w-4 h-4" /> Editar</Button>
                {ally.status !== "active" && (
                  <Button variant="secondary" onClick={promote}>
                    <ArrowRightCircle className="w-4 h-4" />
                    Pasar a {ally.status === "conversation" ? "Pendiente" : "Activo"}
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /> Eliminar</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar este aliado?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Se eliminarán también todos los seguimientos asociados. Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 rounded-md border px-3 py-2 bg-muted/40">
                <Lock className="w-3.5 h-3.5" /> Solo administradores editan la ficha
              </div>
            )}
          </div>
        </div>
      </Card>

      <FollowupsSection allyId={ally.id} isActive={isActive} />

      <AllyDialog open={editOpen} onOpenChange={setEditOpen} ally={ally} />
    </div>
  );
}

function FollowupsSection({ allyId, isActive }: { allyId: string; isActive: boolean }) {
  const areas: FollowupArea[] = isActive
    ? ["direccion", "econti", "mercadeo", "graduados", "proyectos"]
    : ["general"];
  const [tab, setTab] = useState<FollowupArea>(areas[0]);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Seguimientos</h2>
      </div>
      <Tabs value={tab} onValueChange={(v) => setTab(v as FollowupArea)}>
        <TabsList className="flex flex-wrap h-auto">
          {areas.map((a) => (
            <TabsTrigger key={a} value={a}>{AREA_LABEL[a]}</TabsTrigger>
          ))}
        </TabsList>
        {areas.map((a) => (
          <TabsContent key={a} value={a} className="space-y-4 mt-4">
            <AreaSection allyId={allyId} area={a} />
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}

function AreaSection({ allyId, area }: { allyId: string; area: FollowupArea }) {
  const { data: perms } = useMyPermissions();
  const canEdit = canEditArea(perms, area);
  return (
    <>
      {canEdit ? (
        <NewActivityForm allyId={allyId} area={area} />
      ) : (
        <div className="rounded-lg border p-3 bg-muted/20 text-xs text-muted-foreground flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" /> Solo lectura · no tienes permisos para registrar en {AREA_LABEL[area]}.
        </div>
      )}
      <ActivityList allyId={allyId} area={area} canEdit={canEdit} />
    </>
  );
}

function NewActivityForm({ allyId, area }: { allyId: string; area: FollowupArea }) {
  const add = useAddActivity();
  const [description, setDescription] = useState("");
  const [activityType, setActivityType] = useState("Observación");
  const [activityDate, setActivityDate] = useState(() => new Date().toISOString().slice(0, 10));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return toast.error("Describe la actividad");
    try {
      await add.mutateAsync({
        ally_id: allyId,
        area,
        activity_type: activityType,
        description: description.trim(),
        activity_date: new Date(activityDate).toISOString(),
      });
      setDescription("");
      toast.success("Seguimiento registrado");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  return (
    <form onSubmit={submit} className="rounded-lg border p-3 space-y-3 bg-muted/20">
      <div className="grid sm:grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">Tipo</Label>
          <Select value={activityType} onValueChange={setActivityType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ACTIVITY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs">Fecha</Label>
          <Input type="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} />
        </div>
      </div>
      <div>
        <Label className="text-xs">Descripción / observación</Label>
        <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="¿Qué se trabajó, acordó o avanzó?" />
      </div>
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={add.isPending}>
          <Plus className="w-4 h-4" /> Registrar
        </Button>
      </div>
    </form>
  );
}

function ActivityList({ allyId, area, canEdit }: { allyId: string; area: FollowupArea; canEdit: boolean }) {
  const { data: all = [], isLoading } = useActivities(allyId);
  const del = useDeleteActivity();
  const items = all.filter((a) => a.area === area);

  if (isLoading) return <div className="text-sm text-muted-foreground">Cargando…</div>;
  if (items.length === 0) return <div className="text-sm text-muted-foreground py-4 text-center">Sin registros aún.</div>;

  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it.id} className="rounded-md border p-3 bg-card">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                <Badge variant="outline">{it.activity_type}</Badge>
                <span>{new Date(it.activity_date).toLocaleDateString()}</span>
                <span>·</span>
                <span>{it.responsible_name}</span>
              </div>
              <p className="text-sm mt-1 whitespace-pre-wrap">{it.description}</p>
            </div>
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => del.mutate({ id: it.id, ally_id: allyId })}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
