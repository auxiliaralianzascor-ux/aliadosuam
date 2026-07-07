import { createFileRoute } from "@tanstack/react-router";
import { AllyDetailPage } from "@/components/pages/AllyDetailPage";

export const Route = createFileRoute("/_authenticated/decanaturas/aliados/$id")({
  head: () => ({ meta: [{ title: "Aliado · Decanaturas · UAM" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return (
    <AllyDetailPage
      id={id}
      direction="decanaturas"
      listPath="/decanaturas/aliados"
      showDiscounts={false}
    />
  );
}
