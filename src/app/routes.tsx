import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { OverviewPage } from "./pages/OverviewPage";
import { ClustersPage } from "./pages/ClustersPage";
import { ClusterDetailPage } from "./pages/ClusterDetailPage";
import { ApplicationsPage } from "./pages/ApplicationsPage";
import { VirtualMachinesPage } from "./pages/VirtualMachinesPage";
import { PoliciesPage } from "./pages/PoliciesPage";
import { SecurityPage } from "./pages/SecurityPage";
import { ObservabilityPage } from "./pages/ObservabilityPage";
import { AutomationPage } from "./pages/AutomationPage";
import { SettingsPage } from "./pages/SettingsPage";
import { DocumentationPage } from "./pages/DocumentationPage";
import { DeploymentsPage } from "./pages/DeploymentsPage";
import { DeploymentDrilldownPage } from "./pages/DeploymentDrilldownPage";
import { ActivityDetailPage } from "./pages/ActivityDetailPage";
import { NotFoundPage } from "./pages/NotFoundPage";

const basename =
  import.meta.env.BASE_URL === "/"
    ? undefined
    : import.meta.env.BASE_URL.replace(/\/$/, "");

const routeTree = [
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: OverviewPage },
      { path: "deployments", Component: DeploymentsPage },
      { path: "deployments/:deploymentId", Component: DeploymentDrilldownPage },
      { path: "clusters", Component: ClustersPage },
      { path: "clusters/:clusterId", Component: ClusterDetailPage },
      { path: "applications", Component: ApplicationsPage },
      { path: "virtual-machines", Component: VirtualMachinesPage },
      { path: "policies", Component: PoliciesPage },
      { path: "security", Component: SecurityPage },
      { path: "observability", Component: ObservabilityPage },
      { path: "automation", Component: AutomationPage },
      { path: "settings", Component: SettingsPage },
      { path: "documentation", Component: DocumentationPage },
      { path: "activity/:activityId", Component: ActivityDetailPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
] as const;

export const router = basename
  ? createBrowserRouter(routeTree, { basename })
  : createBrowserRouter(routeTree);