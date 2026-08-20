import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";

import { documentQueryOptions, documentVersionQueryOptions } from "@/queries";
import { DocumentRoute, Home, ProjectRoute } from "@/routes";

import { Navbar } from "./components";

const queryClient = new QueryClient({});

const rootRoute = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <main className="flex h-svh w-svw flex-col overflow-hidden">
        <Navbar />
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
    queryClient.ensureQueryData(documentQueryOptions(params.documentId));
    if (params.versionNumber) queryClient.ensureQueryData(documentVersionQueryOptions(params.documentId, params.versionNumber));
  },
  path: "/$projectId/document/$documentId/$versionNumber",
});

const projectRoute = createRoute({
  component: ProjectRoute,
  getParentRoute: () => rootRoute,
  path: "/$projectId",
});

const routeTree = rootRoute.addChildren([indexRoute, documentRoute, projectRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
