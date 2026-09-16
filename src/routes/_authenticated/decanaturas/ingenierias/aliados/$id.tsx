import { createFileRoute } from "@tanstack/react-router";
import { AllyDetailPage } from "@/components/pages/AllyDetailPage";

export const Route = createFileRoute("/_authenticated/decanaturas/ingenierias/aliados/$id")({
  head: () => ({ meta: [{ title: "Aliado · Facultad de Ingenierías · UAM" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return (
    <AllyDetailPage
      id={id}
      direction="decanatura_ingenierias"
      listPath="/decanaturas/ingenierias/aliados"
      showDiscounts={false}
    />
  );
}
