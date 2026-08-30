import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus, Search, Loader2, Handshake, Clock, MessageCircle, FileSpreadsheet } from "lucide-react";
import { useAllies } from "@/lib/allies-api";
import { useMyPermissions, canEditDirection } from "@/lib/permissions-api";
import { AllyDialog } from "@/components/AllyDialog";
import { AllyCard } from "@/components/AllyCard";
import { exportAlliesToDrive } from "@/lib/drive-export.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  type AllyStatus,
  type AllyCategory,
  type AllyDirection,
  type TrafficLight,
  STATUS_LABEL,
  CATEGORY_LABEL,
  TRAFFIC_META,
  DIRECTION_LABEL,
} from "@/lib/allies-types";

interface Props {
  direction: AllyDirection;
  cardBasePath: string;
  showExport?: boolean;
}

export function AlliesListPage({ direction, cardBasePath, showExport = true }: Props) {
  const { data: allies = [], isLoading } = useAllies(direction);
  const { data: perms } = useMyPermissions();
  const isAdmin = !!perms?.isAdmin;
  const canEdit = canEditDirection(perms, direction);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportFn = useServerFn(exportAlliesToDrive);
  const [defaultStatus, setDefaultStatus] = useState<AllyStatus>("active");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<AllyStatus>("active");
  const [trafficFilter, setTrafficFilter] = useState<TrafficLight | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<AllyCategory | "all">("all");
  const [ownershipFilter, setOwnershipFilter] = useState<"all" | "own" | "shared">("all");

  const counts = useMemo(() => {
    const c = { conversation: 0, pending: 0, active: 0 } as Record<AllyStatus, number>;
    allies.forEach((a) => (c[a.status] += 1));
    return c;
  }, [allies]);

  const filtered = useMemo(() => {
    return allies.filter((a) => {
      if (a.status !== tab) return false;
      if (trafficFilter !== "all" && a.traffic_light !== trafficFilter) return false;
      if (tab === "active" && categoryFilter !== "all" && a.category !== categoryFilter) return false;
      if (search && !`${a.name} ${a.sector ?? ""} ${a.contact_name ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (ownershipFilter === "own" && a.direction !== direction) return false;
      if (ownershipFilter === "shared" && a.direction === direction) return false;
      return true;
    });
  }, [allies, tab, trafficFilter, categoryFilter, search, ownershipFilter, direction]);

  const trafficCounts = useMemo(() => {
    const c: Record<TrafficLight, number> = { green: 0, yellow: 0, red: 0 };
    allies.filter((a) => a.status === tab).forEach((a) => (c[a.traffic_light] += 1));
    return c;
  }, [allies, tab]);

  const openNew = (status: AllyStatus) => {
    setDefaultStatus(status);
    setDialogOpen(true);
  };

  const tabMeta: Record<AllyStatus, { icon: React.ReactNode; help: string }> = {
    active: {
      icon: <Handshake className="w-4 h-4" />,
      help: "Aliados con convenio firmado y vigente. Clasifícalos por categoría y por semáforo según el trabajo conjunto.",
    },
    pending: {
      icon: <Clock className="w-4 h-4" />,
      help: "Convenios cargados o en proceso. Verde = firmado pendiente de aprobación, Amarillo = emergente, Rojo = sin oportunidad.",
    },
    conversation: {
      icon: <MessageCircle className="w-4 h-4" />,
      help: "Conversaciones iniciales. Cuando avancen, pásalos a Pendiente desde el detalle del aliado.",
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Aliados</h1>
          <p className="text-sm text-muted-foreground">
            Dirección de {DIRECTION_LABEL[direction]}. Conversaciones, pendientes y aliados activos.
          </p>
        </div>
        {(isAdmin || canEdit) && (
          <div className="flex flex-wrap gap-2">
            {isAdmin && showExport && (
              <Button
                variant="outline"
                disabled={exporting}
                onClick={async () => {
                  setExporting(true);
                  try {
                    const r = await exportFn();
                    const download = (name: string, csv: string) => {
                      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = name;
                      a.click();
                      URL.revokeObjectURL(url);
                    };
                    download(r.alliesFileName, r.alliesCsv);
                    if (r.activitiesCsv) download(r.activitiesFileName, r.activitiesCsv);
                    toast.success("Exportado en CSV");
                  } catch (e: unknown) {
                    toast.error(e instanceof Error ? e.message : "No se pudo exportar");
                  } finally {
                    setExporting(false);
                  }
                }}
              >
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                Exportar a CSV
              </Button>

            )}
            {canEdit && (
              <Button onClick={() => openNew(tab)}>
                <Plus className="w-4 h-4" /> Nuevo aliado
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(["green", "yellow", "red"] as TrafficLight[]).map((t) => (
          <Card key={t} className={`p-3 ${TRAFFIC_META[t].bg} border ${TRAFFIC_META[t].border}`}>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${TRAFFIC_META[t].dot}`} />
              <span className="text-xs font-medium">{TRAFFIC_META[t].label}</span>
            </div>
            <div className="text-2xl font-bold mt-1">{trafficCounts[t]}</div>
            <div className="text-xs text-muted-foreground">en {STATUS_LABEL[tab]}</div>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as AllyStatus)}>
        <TabsList className="grid grid-cols-3 w-full sm:w-auto sm:inline-grid">
          {(["active", "pending", "conversation"] as AllyStatus[]).map((s) => (
            <TabsTrigger key={s} value={s} className="gap-2">
              {tabMeta[s].icon}
              <span>{STATUS_LABEL[s]}</span>
              <span className="ml-1 rounded-full bg-muted text-muted-foreground px-1.5 text-xs">{counts[s]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {(["active", "pending", "conversation"] as AllyStatus[]).map((s) => (
          <TabsContent key={s} value={s} className="space-y-4 mt-4">
            <Card className="p-3 bg-muted/30 text-xs text-muted-foreground">{tabMeta[s].help}</Card>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="Buscar por nombre, sector o contacto" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={ownershipFilter} onValueChange={(v) => setOwnershipFilter(v as "all" | "own" | "shared")}>
                <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Propiedad" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Propios y compartidos</SelectItem>
                  <SelectItem value="own">Solo propios</SelectItem>
                  <SelectItem value="shared">Solo compartidos</SelectItem>
                </SelectContent>
              </Select>
              <Select value={trafficFilter} onValueChange={(v) => setTrafficFilter(v as TrafficLight | "all")}>
                <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Semáforo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los colores</SelectItem>
                  {(["green", "yellow", "red"] as TrafficLight[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${TRAFFIC_META[t].dot}`} /> {TRAFFIC_META[t].label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {s === "active" && (
                <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as AllyCategory | "all")}>
                  <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Categoría" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {(Object.keys(CATEGORY_LABEL) as AllyCategory[]).map((c) => (
                      <SelectItem key={c} value={c}>{CATEGORY_LABEL[c]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {isLoading ? (
              <div className="grid place-items-center py-16 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <Card className="p-10 text-center text-muted-foreground">
                <p>No hay aliados en esta vista todavía.</p>
                {canEdit && (
                  <Button variant="outline" className="mt-3" onClick={() => openNew(s)}>
                    <Plus className="w-4 h-4" /> Agregar el primero
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map((a) => <AllyCard key={a.id} ally={a} basePath={cardBasePath} currentDirection={direction} />)}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <AllyDialog open={dialogOpen} onOpenChange={setDialogOpen} defaultStatus={defaultStatus} direction={direction} />
    </div>
  );
}
