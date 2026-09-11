import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  createHashHistory,
  Outlet,
  useParams,
} from "@tanstack/react-router";
import { ProgrammeHome } from "@/components/desk/programme-home";
import { DeskShell } from "@/components/desk/desk-shell";
import "./styles.css";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: ProgrammeHome,
});
function ProgrammeDesk() {
  const { id } = useParams({ from: "/p/$id" });
  return <DeskShell pid={id} />;
}
const deskRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/p/$id",
  component: ProgrammeDesk,
});
const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute, deskRoute]),
  history: createHashHistory(),
});
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
