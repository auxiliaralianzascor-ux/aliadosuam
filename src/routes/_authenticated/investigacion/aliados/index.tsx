import { createFileRoute } from "@tanstack/react-router";
import { AlliesListPage } from "@/components/pages/AlliesListPage";

export const Route = createFileRoute("/_authenticated/investigacion/aliados/")({
  head: () => ({ meta: [{ title: "Aliados · Investigación · UAM" }] }),
  component: () => (
    <AlliesListPage direction="investigacion" cardBasePath="/investigacion/aliados/$id" showExport={false} />
  ),
});
