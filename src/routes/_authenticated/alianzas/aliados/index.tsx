import { createFileRoute } from "@tanstack/react-router";
import { AlliesListPage } from "@/components/pages/AlliesListPage";

export const Route = createFileRoute("/_authenticated/alianzas/aliados/")({
  head: () => ({ meta: [{ title: "Aliados · Alianzas · UAM" }] }),
  component: () => <AlliesListPage direction="alianzas" cardBasePath="/alianzas/aliados/$id" />,
});
