import { createFileRoute } from "@tanstack/react-router";
import { AlliesListPage } from "@/components/pages/AlliesListPage";

export const Route = createFileRoute("/_authenticated/decanaturas/aliados/")({
  head: () => ({ meta: [{ title: "Aliados · Decanaturas · UAM" }] }),
  component: () => (
    <AlliesListPage
      direction="decanaturas"
      cardBasePath="/decanaturas/aliados/$id"
      showExport={false}
    />
  ),
});
