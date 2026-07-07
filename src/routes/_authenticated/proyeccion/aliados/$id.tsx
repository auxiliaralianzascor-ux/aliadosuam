import { createFileRoute } from "@tanstack/react-router";
import { AllyDetailPage } from "@/components/pages/AllyDetailPage";

export const Route = createFileRoute("/_authenticated/proyeccion/aliados/$id")({
  head: () => ({ meta: [{ title: "Aliado · Proyección · UAM" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return (
    <AllyDetailPage
      id={id}
      direction="proyeccion"
      listPath="/proyeccion/aliados"
      showDiscounts={false}
    />
  );
}
