/** Matches DeploymentWizard entry flows */
export type WizardEntryMode = "action-first" | "placement-first";

/**
 * **Area** = where in the stack the change lives: All, Platform, Workloads, or Virtualization.
 * **Source** = how the run is driven (Console, GitOps, Governance)—not the same as area.
 * `resourceCategory: "governance"` = policy / ACM-style work (filter with Source, not a layer tab).
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
      "All areas: triage the full list. The Create flow starts with an action you choose, then placement is scoped from that action (not the other way around).",
  },
  {
    id: "clusters",
    label: "Platform",
    description:
      "Platform area: control plane, etcd, MachineConfig, operators, cluster-wide add-ons (cluster admin).",
  },
  {
    id: "applications",
    label: "Workloads",
    description:
      "Workloads area: what runs in namespaces—charts, GitOps app syncs, app rollouts.",
  },
  {
    id: "virtual-machines",
    label: "Virtualization",
    description:
      "Virtualization area: KubeVirt, VM migration, hypervisor-class change.",
  },
];

/** Mock data facet — which tab lists this deployment. */
export type DeploymentResourceCategory =
  | "application"
  | "virtual_machine"
  | "cluster"
  | "placement"
  | "governance";

export type WizardTabPreset = {
  entryMode: WizardEntryMode;
  /** Seed label selector on the placement step */
  initialLabelSelector: string;
  /** Optional rollout default */
  rolloutMethod?: "immediate" | "canary" | "rolling";
};

/**
 * Default wizard args when users choose placement-first without a dedicated tab.
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
        rolloutMethod: "canary",
      };
    case "clusters":
      return {
        entryMode: "action-first",
        initialLabelSelector: "env=prod,tier=platform",
        rolloutMethod: "canary",
      };
    case "applications":
      return {
        entryMode: "action-first",
        initialLabelSelector: "app.kubernetes.io/part-of=storefront",
        rolloutMethod: "rolling",
      };
    case "virtual-machines":
      return {
        entryMode: "action-first",
        initialLabelSelector: "kubevirt.io/schedulable=true,workload=vm",
        rolloutMethod: "canary",
      };
  }
}

/**
 * Seeding Create when the entry point is Governance / policy (Source channel),
 * not an “area” tab.
 */
export const GOVERNANCE_WIZARD_PRESET: WizardTabPreset = {
  entryMode: "action-first",
  initialLabelSelector: "open-cluster-management.io/governance=enabled",
  rolloutMethod: "canary",
};

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
