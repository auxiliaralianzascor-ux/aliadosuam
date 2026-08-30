import { createFileRoute } from "@tanstack/react-router";
import { CargarIndicadoresPage } from "@/components/pages/CargarIndicadoresPage";

export const Route = createFileRoute(
  "/_authenticated/relaciones-internacionales/indicadores/cargar",
)({
  head: () => ({ meta: [{ title: "Cargar indicadores · Relaciones Internacionales · UAM" }] }),
  component: () => (
    <CargarIndicadoresPage
      direction="relaciones_internacionales"
      dashboardPath="/relaciones-internacionales/indicadores"
    />
  ),
});
