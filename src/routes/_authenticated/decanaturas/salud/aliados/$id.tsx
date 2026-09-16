import { createFileRoute } from "@tanstack/react-router";
import { AllyDetailPage } from "@/components/pages/AllyDetailPage";

export const Route = createFileRoute("/_authenticated/decanaturas/salud/aliados/$id")({
  head: () => ({ meta: [{ title: "Aliado · Facultad de Salud · UAM" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return (
    <AllyDetailPage
      id={id}
      direction="decanatura_salud"
      listPath="/decanaturas/salud/aliados"
      showDiscounts={false}
    />
  );
}
