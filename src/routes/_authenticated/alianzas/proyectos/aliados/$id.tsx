import { createFileRoute } from "@tanstack/react-router";
import { AllyDetailPage } from "@/components/pages/AllyDetailPage";

export const Route = createFileRoute("/_authenticated/alianzas/proyectos/aliados/$id")({
  head: () => ({ meta: [{ title: "Aliado · Proyectos · UAM" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return (
    <AllyDetailPage
      id={id}
      direction="alianzas_proyectos"
      listPath="/alianzas/proyectos/aliados"
      showDiscounts
    />
  );
}
