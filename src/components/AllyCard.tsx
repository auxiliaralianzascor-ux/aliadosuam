import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, CalendarDays, Mail, Phone, AlertTriangle } from "lucide-react";
import {
  type Ally,
  CATEGORY_LABEL,
  STATUS_LABEL,
  TRAFFIC_META,
  getAllyContacts,
} from "@/lib/allies-types";

function isExpired(ally: Ally) {
  if (ally.status !== "active" || !ally.valid_until) return false;
  const d = new Date(ally.valid_until);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

export function AllyCard({ ally, basePath }: { ally: Ally; basePath: string }) {
  const tl = TRAFFIC_META[ally.traffic_light];
  const expired = isExpired(ally);
  return (
    <Link
      to={basePath}
      params={{ id: ally.id }}
      className="block group"
    >
      <Card className={`p-4 border-l-4 ${tl.border} hover:shadow-md transition-shadow h-full ${expired ? "ring-1 ring-rose-300 dark:ring-rose-900" : ""}`}>
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
            {ally.sector && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <Building2 className="w-3 h-3" />
                {ally.sector}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant="secondary" className="text-xs">{STATUS_LABEL[ally.status]}</Badge>
            {ally.status === "active" && ally.category && (
              <Badge variant="outline" className="text-xs">{CATEGORY_LABEL[ally.category]}</Badge>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
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
        </div>

      </Card>
    </Link>
  );
}
