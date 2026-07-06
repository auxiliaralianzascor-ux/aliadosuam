import { createFileRoute } from "@tanstack/react-router";
import { AllyDetailPage } from "@/components/pages/AllyDetailPage";

export const Route = createFileRoute("/_authenticated/alianzas/aliados/$id")({
  head: () => ({ meta: [{ title: "Aliado · Alianzas · UAM" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <AllyDetailPage id={id} direction="alianzas" listPath="/alianzas/aliados" showDiscounts />;
}
