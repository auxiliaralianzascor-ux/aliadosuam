import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Loader2, Percent } from "lucide-react";
import { useAllies } from "@/lib/allies-api";
import { useAllDiscounts, DISCOUNT_CATEGORIES, type DiscountCategory } from "@/lib/discounts-api";

export const Route = createFileRoute("/_authenticated/alianzas/descuentos")({
  head: () => ({ meta: [{ title: "Descuentos · UAM" }] }),
  component: DiscountsPage,
});

function DiscountsPage() {
  const { data: allies = [], isLoading: la } = useAllies("alianzas");
  const { data: discounts = [], isLoading: ld } = useAllDiscounts();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<DiscountCategory>("pregrado");

  const rows = useMemo(() => {
    const allyMap = new Map(allies.map((a) => [a.id, a]));
    return discounts
      .map((d) => ({ discount: d, ally: allyMap.get(d.ally_id) }))
      .filter((r) => r.ally)
      .sort((a, b) => a.ally!.name.localeCompare(b.ally!.name));
  }, [allies, discounts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const value = r.discount[tab];
      if (!value || !value.trim()) return false;
      if (!q) return true;
      return (
        r.ally!.name.toLowerCase().includes(q) ||
        (r.ally!.sector ?? "").toLowerCase().includes(q) ||
        value.toLowerCase().includes(q)
      );
    });
  }, [rows, search, tab]);

  const counts = useMemo(() => {
    const c: Record<DiscountCategory, number> = { pregrado: 0, posgrado: 0, econti: 0, ingles: 0 };
    rows.forEach((r) => {
      DISCOUNT_CATEGORIES.forEach(({ key }) => {
        if (r.discount[key] && r.discount[key]!.trim()) c[key] += 1;
      });
    });
    return c;
  }, [rows]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Percent className="w-6 h-6" /> Descuentos por aliado
        </h1>
        <p className="text-sm text-muted-foreground">
          Consulta los descuentos vigentes por categoría: Pregrado, Posgrado, Econti e Inglés.
        </p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar por aliado, sector o texto del descuento"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as DiscountCategory)}>
        <TabsList className="grid grid-cols-4 w-full sm:w-auto sm:inline-grid">
          {DISCOUNT_CATEGORIES.map((c) => (
            <TabsTrigger key={c.key} value={c.key} className="gap-2">
              <span>{c.label}</span>
              <span className="ml-1 rounded-full bg-muted text-muted-foreground px-1.5 text-xs">
                {counts[c.key]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {DISCOUNT_CATEGORIES.map((c) => (
          <TabsContent key={c.key} value={c.key} className="space-y-3 mt-4">
            {la || ld ? (
              <div className="grid place-items-center py-16 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <Card className="p-10 text-center text-muted-foreground text-sm">
                No hay descuentos de {c.label} que coincidan con la búsqueda.
              </Card>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {filtered.map((r) => (
                  <Card key={r.discount.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          to="/alianzas/aliados/$id"
                          params={{ id: r.ally!.id }}
                          className="font-semibold hover:underline block truncate"
                        >
                          {r.ally!.name}
                        </Link>
                        {r.ally!.sector && (
                          <div className="text-xs text-muted-foreground truncate">{r.ally!.sector}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm whitespace-pre-wrap rounded-md bg-muted/40 p-3">
                      {r.discount[c.key]}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
