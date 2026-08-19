import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";

import { DocumentRoute, Home } from "@/routes";
import { documentQueryOptions, documentVersionQueryOptions } from "@/utils/queries";

const queryClient = new QueryClient({});

const rootRoute = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <main className="h-svh w-svw">
        <Outlet />
      </main>
    </QueryClientProvider>
  ),
});

const indexRoute = createRoute({
  component: Home,
  getParentRoute: () => rootRoute,
  path: "/",
});

const documentRoute = createRoute({
  component: DocumentRoute,
  getParentRoute: () => rootRoute,
  loader: ({ params }) => {
    queryClient.ensureQueryData(documentQueryOptions(params.id));
    if (params.versionNumber) queryClient.ensureQueryData(documentVersionQueryOptions(params.id, params.versionNumber));
  },
  path: "/document/$id/$versionNumber",
});

const routeTree = rootRoute.addChildren([indexRoute, documentRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
