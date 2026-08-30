import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Antes: sin config -> staleTime 0, así que CADA vez que se
        // visitaba una página (aliados, indicadores, permisos, etc.)
        // se repetía la consulta a Supabase, aunque los datos no
        // hubieran cambiado. Esto es lo que hacía sentir la app lenta
        // al navegar. Con esto, los datos se reusan por 60s y se
        // refrescan en segundo plano sin bloquear la navegación.
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
