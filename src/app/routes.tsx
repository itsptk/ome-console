import { createBrowserRouter, createHashRouter, Navigate } from "react-router";
import { ConsoleCapabilitiesProvider } from "./contexts/ConsoleCapabilitiesContext";
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
import { FleetRolloutInProgressPage } from "./pages/fleet-rollout-research/FleetRolloutInProgressPage";
import { FleetRolloutFailurePage } from "./pages/fleet-rollout-research/FleetRolloutFailurePage";
import { FleetRolloutCompletedPage } from "./pages/fleet-rollout-research/FleetRolloutCompletedPage";
import { ActivityDetailPage } from "./pages/ActivityDetailPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { DayOneTerminalPage } from "./pages/day-one/DayOneTerminalPage";
import { DayOneConfigurationPage } from "./pages/day-one/DayOneConfigurationPage";
import { DayOneRestartPage } from "./pages/day-one/DayOneRestartPage";
import { DayOneLoginPage } from "./pages/day-one/DayOneLoginPage";
import { DayOneWelcomePage } from "./pages/day-one/DayOneWelcomePage";
import { DayOneCreateClusterPage } from "./pages/day-one/DayOneCreateClusterPage";
import { DayOneCompletionPage } from "./pages/day-one/DayOneCompletionPage";

function RootLayoutWithCapabilities() {
  return (
    <ConsoleCapabilitiesProvider>
      <RootLayout />
    </ConsoleCapabilitiesProvider>
  );
}

function OmeIndexRedirect() {
  return <Navigate to="/overview" replace />;
}

const basename =
  import.meta.env.BASE_URL === "/"
    ? undefined
    : import.meta.env.BASE_URL.replace(/\/$/, "");

const useHashRouter = import.meta.env.VITE_OME_HASH_ROUTER === "true";
const createRouter = useHashRouter ? createHashRouter : createBrowserRouter;

const routeTree = [
  {
    path: "/",
    Component: RootLayoutWithCapabilities,
    children: [
      { index: true, Component: OmeIndexRedirect },
      { path: "day-one/terminal", Component: DayOneTerminalPage },
      { path: "day-one/configuration", Component: DayOneConfigurationPage },
      { path: "day-one/restart", Component: DayOneRestartPage },
      { path: "day-one/login", Component: DayOneLoginPage },
      { path: "day-one/welcome", Component: DayOneWelcomePage },
      {
        path: "day-one/create-cluster/virtualization",
        Component: DayOneCreateClusterPage,
      },
      {
        path: "day-one/create-cluster/management-cluster",
        Component: DayOneCreateClusterPage,
      },
      { path: "day-one/completion", Component: DayOneCompletionPage },
      { path: "overview", Component: OverviewPage },
      { path: "deployments", Component: DeploymentsPage },
      { path: "deployments/r3/in-progress", Component: FleetRolloutInProgressPage },
      { path: "deployments/r3/failures", Component: FleetRolloutFailurePage },
      { path: "deployments/r3/completed", Component: FleetRolloutCompletedPage },
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

export const router = useHashRouter
  ? createRouter(routeTree)
  : basename
    ? createRouter(routeTree, { basename })
    : createRouter(routeTree);
