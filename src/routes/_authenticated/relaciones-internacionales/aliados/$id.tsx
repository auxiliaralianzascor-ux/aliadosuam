import { createFileRoute } from "@tanstack/react-router";
import { AllyDetailPage } from "@/components/pages/AllyDetailPage";

export const Route = createFileRoute("/_authenticated/relaciones-internacionales/aliados/$id")({
  head: () => ({ meta: [{ title: "Aliado · Relaciones Internacionales · UAM" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return (
    <AllyDetailPage
      id={id}
      direction="relaciones_internacionales"
      listPath="/relaciones-internacionales/aliados"
      showDiscounts={false}
    />
  );
}
