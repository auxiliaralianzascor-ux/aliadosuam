import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, CalendarDays, Mail, Phone, AlertTriangle } from "lucide-react";
import {
  type Ally,
  CATEGORY_LABEL,
  STATUS_LABEL,
  TRAFFIC_META,
  type AllyDirection,
  DIRECTION_LABEL,
  ACADEMIC_LEVELS,
  getAllyContacts,
} from "@/lib/allies-types";
import { prefetchAlly } from "@/lib/allies-api";

function isExpired(ally: Ally) {
  if (ally.status !== "active" || !ally.valid_until) return false;
  const d = new Date(ally.valid_until);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

export function AllyCard({ ally, basePath, currentDirection }: { ally: Ally; basePath: string; currentDirection?: AllyDirection }) {
  const tl = TRAFFIC_META[ally.traffic_light];
  const expired = isExpired(ally);
  const queryClient = useQueryClient();
  const warm = () => prefetchAlly(queryClient, ally.id);
  return (
    <Link
      to={basePath as never}
      params={{ id: ally.id } as never}
      className="block group"
      onMouseEnter={warm}
      onTouchStart={warm}
      onFocus={warm}
    >
      <Card className={`p-4 border-l-4 ${tl.border} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 h-full ${expired ? "ring-1 ring-rose-300 dark:ring-rose-900" : ""}`}>
        {expired && (
          <div className="mb-2 flex items-center gap-1.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 px-2 py-1 text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5" /> Contrato vencido
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${tl.dot} shrink-0`} aria-label={tl.label} />
              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                {ally.name}
              </h3>
            </div>
            {currentDirection && ally.direction !== currentDirection && (
              <Badge variant="outline" className="mt-1 text-[10px] bg-primary/5 text-primary border-primary/20">
                Compartido por {DIRECTION_LABEL[ally.direction]}
              </Badge>
            )}
            {ally.sector && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <Building2 className="w-3 h-3" />
                {ally.sector}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant="secondary" className="text-xs">{STATUS_LABEL[ally.status]}</Badge>
            {ally.category && (
              <Badge variant="outline" className="text-xs">{CATEGORY_LABEL[ally.category]}</Badge>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          {ally.ivc_total !== null && Number.isFinite(Number(ally.ivc_total)) && (
            <div>IVC_total: {Number(ally.ivc_total).toFixed(4)} · {ally.orchid_type ?? ""}</div>
          )}
          {(() => {
            const contacts = getAllyContacts(ally);
            const primary = contacts[0];
            const extra = contacts.length - 1;
            if (!primary) return null;
            return (
              <>
                {primary.name && (
                  <div className="truncate">
                    👤 {primary.name}{primary.position ? ` · ${primary.position}` : ""}
                  </div>
                )}
                {primary.email && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3" /> {primary.email}
                  </div>
                )}
                {primary.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> {primary.phone}
                  </div>
                )}
                {extra > 0 && (
                  <div className="text-[11px] italic">+{extra} contacto{extra > 1 ? "s" : ""} más</div>
                )}
              </>
            );
          })()}
          {ally.valid_until && (
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-3 h-3" /> Vigencia hasta {ally.valid_until}
            </div>
          )}
          {ally.academic_participation && (() => {
            const selected = ACADEMIC_LEVELS.filter((level) => {
              const employees = ally.academic_participation?.empleados?.[level.key];
              const relatives = ally.academic_participation?.familiares?.[level.key];
              return Boolean(employees || relatives);
            });
            if (selected.length === 0) return null;
            return (
              <div className="mt-2 rounded-md border bg-muted/20 px-2 py-1.5 text-[11px] text-foreground/80">
                <span className="font-medium text-muted-foreground">UAM:</span> {selected.map((level) => level.label).join(", ")}
              </div>
            );
          })()}
        </div>

      </Card>
    </Link>
  );
}
