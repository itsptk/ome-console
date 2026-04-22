/** Matches DeploymentWizard entry flows */
export type WizardEntryMode = "action-first" | "placement-first";

/** Tabs on the Deployments page — each scopes the list and seeds the create wizard. */
export type DeploymentTabId =
  | "all"
  | "applications"
  | "virtual-machines"
  | "clusters"
  | "placements";

export const DEPLOYMENT_TAB_ORDER: {
  id: DeploymentTabId;
  label: string;
  description: string;
}[] = [
  {
    id: "all",
    label: "All",
    description: "Every deployment across resource types",
  },
  {
    id: "applications",
    label: "Applications",
    description: "Rollouts tied to workloads and GitOps-driven apps",
  },
  {
    id: "virtual-machines",
    label: "Virtual machines",
    description: "KubeVirt / migration and VM-adjacent changes",
  },
  {
    id: "clusters",
    label: "Clusters",
    description: "Platform, etcd, and cluster-scoped fleet actions",
  },
  {
    id: "placements",
    label: "Placements",
    description: "Changes defined by labels, regions, and placement rules",
  },
];

/** Mock data facet — which tab lists this deployment. */
export type DeploymentResourceCategory =
  | "application"
  | "virtual_machine"
  | "cluster"
  | "placement";

export type WizardTabPreset = {
  entryMode: WizardEntryMode;
  /** Seed label selector on the placement step */
  initialLabelSelector: string;
  /** Pre-select primary action by id (must exist in wizard catalog) */
  primaryActionId?: string;
  /** Optional rollout default */
  rolloutMethod?: "immediate" | "canary" | "rolling";
};

/** Default wizard seeding when opening Create from a given tab (prototype). */
export function getWizardPresetForTab(
  tab: DeploymentTabId,
): WizardTabPreset {
  switch (tab) {
    case "all":
      return {
        entryMode: "action-first",
        initialLabelSelector: "env=prod",
        primaryActionId: "update-ocp-4.18",
        rolloutMethod: "canary",
      };
    case "applications":
      return {
        entryMode: "action-first",
        initialLabelSelector: "app.kubernetes.io/part-of=storefront",
        primaryActionId: "install-service-mesh",
        rolloutMethod: "rolling",
      };
    case "virtual-machines":
      return {
        entryMode: "action-first",
        initialLabelSelector: "kubevirt.io/schedulable=true,workload=vm",
        primaryActionId: "vm-migration-hypervisor",
        rolloutMethod: "canary",
      };
    case "clusters":
      return {
        entryMode: "action-first",
        initialLabelSelector: "env=prod,tier=platform",
        primaryActionId: "update-ocp-4.18",
        rolloutMethod: "canary",
      };
    case "placements":
      return {
        entryMode: "placement-first",
        initialLabelSelector: "region:us-north",
        primaryActionId: undefined,
        rolloutMethod: "canary",
      };
    default:
      return {
        entryMode: "action-first",
        initialLabelSelector: "env=prod",
      };
  }
}

export function filterDeploymentsByTab<
  T extends { resourceCategory: DeploymentResourceCategory },
>(items: T[], tab: DeploymentTabId): T[] {
  if (tab === "all") return items;
  const map: Record<
    Exclude<DeploymentTabId, "all">,
    DeploymentResourceCategory
  > = {
    applications: "application",
    "virtual-machines": "virtual_machine",
    clusters: "cluster",
    placements: "placement",
  };
  const cat = map[tab as Exclude<DeploymentTabId, "all">];
  return items.filter((a) => a.resourceCategory === cat);
}
