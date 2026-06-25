import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, CalendarDays, Mail, Phone } from "lucide-react";
import {
  type Ally,
  CATEGORY_LABEL,
  STATUS_LABEL,
  TRAFFIC_META,
} from "@/lib/allies-types";

export function AllyCard({ ally }: { ally: Ally }) {
  const tl = TRAFFIC_META[ally.traffic_light];
  return (
    <Link
      to="/aliados/$id"
      params={{ id: ally.id }}
      className="block group"
    >
      <Card className={`p-4 border-l-4 ${tl.border} hover:shadow-md transition-shadow h-full`}>
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
          {ally.contact_name && <div className="truncate">👤 {ally.contact_name}</div>}
          {ally.contact_email && (
            <div className="flex items-center gap-1.5 truncate">
              <Mail className="w-3 h-3" /> {ally.contact_email}
            </div>
          )}
          {ally.contact_phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3" /> {ally.contact_phone}
            </div>
          )}
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
