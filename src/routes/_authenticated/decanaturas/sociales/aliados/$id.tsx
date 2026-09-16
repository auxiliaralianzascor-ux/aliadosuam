import { createFileRoute } from "@tanstack/react-router";
import { AllyDetailPage } from "@/components/pages/AllyDetailPage";

export const Route = createFileRoute("/_authenticated/decanaturas/sociales/aliados/$id")({
  head: () => ({ meta: [{ title: "Aliado · Estudios Sociales y Empresariales · UAM" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return (
    <AllyDetailPage
      id={id}
      direction="decanatura_sociales"
      listPath="/decanaturas/sociales/aliados"
      showDiscounts={false}
    />
  );
}
