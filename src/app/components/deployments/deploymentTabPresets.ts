/** Matches DeploymentWizard entry flows */
export type WizardEntryMode = "action-first" | "placement-first";

/**
 * Deployments scope tabs (four). Each is a *resource / layer* lens for platform
 * and cluster admins. Addressing the fleet (labels, regions, pools) lives under
 * **filters** on the list, not a fifth tab.
 */
export type DeploymentTabId =
  | "all"
  | "clusters"
  | "applications"
  | "virtual-machines";

export const DEPLOYMENT_TAB_ORDER: {
  id: DeploymentTabId;
  label: string;
  description: string;
}[] = [
  {
    id: "all",
    label: "All",
    description:
      "Full workspace activity—incident triage, cross-scope search, and anything you have not narrowed yet.",
  },
  {
    id: "clusters",
    label: "Platform",
    description:
      "Infrastructure you run as cluster admin: version paths, etcd, MachineConfig, cluster operators, CNI add-ons—change at the control plane or fleet scope, not tenant manifests.",
  },
  {
    id: "applications",
    label: "Workloads",
    description:
      "What runs in namespaces: charts, GitOps syncs, rollouts, and mesh/logging where app teams share ownership with you.",
  },
  {
    id: "virtual-machines",
    label: "Virtualization",
    description:
      "KubeVirt, migration, and hypervisor-class steps—different blast radius and pacing from controllers and normal workloads.",
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

/**
 * Default wizard args when users choose placement-first without a dedicated tab.
 * List scoping for placement-style work uses the **Placement-scoped only** filter.
 */
export const PLACEMENT_FIRST_WIZARD_OPTS = {
  tab: "all" as DeploymentTabId,
  mode: "placement-first" as WizardEntryMode,
  initialLabelSelector: "region:us-north",
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
    case "clusters":
      return {
        entryMode: "action-first",
        initialLabelSelector: "env=prod,tier=platform",
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
  };
  const cat = map[tab as Exclude<DeploymentTabId, "all">];
  return items.filter((a) => a.resourceCategory === cat);
}
