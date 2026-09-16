import { createFileRoute } from "@tanstack/react-router";
import { AllyDetailPage } from "@/components/pages/AllyDetailPage";

export const Route = createFileRoute("/_authenticated/alianzas/mercadeo/aliados/$id")({
  head: () => ({ meta: [{ title: "Aliado · Mercadeo Institucional · UAM" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return (
    <AllyDetailPage
      id={id}
      direction="alianzas_mercadeo"
      listPath="/alianzas/mercadeo/aliados"
      showDiscounts
    />
  );
}
