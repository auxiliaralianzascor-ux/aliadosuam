import { createFileRoute } from "@tanstack/react-router";
import { AllyDetailPage } from "@/components/pages/AllyDetailPage";

export const Route = createFileRoute("/_authenticated/alianzas/graduados/aliados/$id")({
  head: () => ({ meta: [{ title: "Aliado · Unidad de Graduados · UAM" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return (
    <AllyDetailPage
      id={id}
      direction="alianzas_graduados"
      listPath="/alianzas/graduados/aliados"
      showDiscounts
    />
  );
}
