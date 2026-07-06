import { createFileRoute } from "@tanstack/react-router";
import { AllyDetailPage } from "@/components/pages/AllyDetailPage";

export const Route = createFileRoute("/_authenticated/investigacion/aliados/$id")({
  head: () => ({ meta: [{ title: "Aliado · Investigación · UAM" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <AllyDetailPage id={id} direction="investigacion" listPath="/investigacion/aliados" showDiscounts={false} />;
}
