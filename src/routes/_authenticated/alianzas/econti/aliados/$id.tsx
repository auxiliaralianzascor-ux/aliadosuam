import { createFileRoute } from "@tanstack/react-router";
import { AllyDetailPage } from "@/components/pages/AllyDetailPage";

export const Route = createFileRoute("/_authenticated/alianzas/econti/aliados/$id")({
  head: () => ({ meta: [{ title: "Aliado · Educación Continuada · UAM" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return (
    <AllyDetailPage
      id={id}
      direction="alianzas_econti"
      listPath="/alianzas/econti/aliados"
      showDiscounts
    />
  );
}
