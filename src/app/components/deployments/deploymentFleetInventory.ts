import type { DeploymentTabId } from "./deploymentTabPresets";

/**
 * Prototype inventory shared by Placement, Review, and AI plan “matched clusters” so
 * placement-first flows stay consistent.
 */
export type FleetClusterRow = {
  name: string;
  env: string;
  region: string;
  labels: string[];
  /** Current OCP z-stream in the mock (readiness / table display). */
  ocpCurrent: string;
};

// Mock cluster data (`ocpCurrent` = demo inventory z-stream for OpenShift readiness hints)
export const FLEET_MOCK_CLUSTERS: FleetClusterRow[] = [
  { name: "virt-prod-01", env: "prod", region: "us-east-1", labels: ["env=prod", "tier=web", "update-window=weekend", "pilot=ocp-upgrade", "argocd.argoproj.io/managed=platform", "region=na"], ocpCurrent: "4.17.10" },
  { name: "virt-prod-02", env: "prod", region: "us-west-2", labels: ["env=prod", "tier=web", "update-window=weekend", "pilot=ocp-upgrade", "argocd.argoproj.io/managed=platform", "region=na"], ocpCurrent: "4.17.10" },
  { name: "virt-prod-03", env: "prod", region: "eu-west-1", labels: ["env=prod", "tier=web", "update-window=weekend", "argocd.argoproj.io/managed=platform"], ocpCurrent: "4.17.8" },
  { name: "virt-prod-04", env: "prod", region: "ap-south-1", labels: ["env=prod", "tier=web", "argocd.argoproj.io/managed=platform"], ocpCurrent: "4.17.8" },
  { name: "virt-prod-05", env: "prod", region: "ap-southeast-1", labels: ["env=prod", "tier=web"], ocpCurrent: "4.17.10" },
  { name: "data-prod-01", env: "prod", region: "us-east-1", labels: ["env=prod", "tier=data", "update-window=weekend", "argocd.argoproj.io/managed=platform", "region=na"], ocpCurrent: "4.16.10" },
  { name: "data-prod-02", env: "prod", region: "us-west-2", labels: ["env=prod", "tier=data", "update-window=weekend", "argocd.argoproj.io/managed=platform", "region=na"], ocpCurrent: "4.16.10" },
  { name: "data-prod-03", env: "prod", region: "eu-west-1", labels: ["env=prod", "tier=data", "argocd.argoproj.io/managed=platform"], ocpCurrent: "4.16.10" },
  { name: "canary-us-east-01", env: "canary", region: "us-east-1", labels: ["env=canary", "tier=canary", "tier=web"], ocpCurrent: "4.17.12" },
  { name: "canary-us-west-01", env: "canary", region: "us-west-2", labels: ["env=canary", "tier=canary", "tier=web"], ocpCurrent: "4.17.12" },
  { name: "canary-eu-west-01", env: "canary", region: "eu-west-1", labels: ["env=canary", "tier=canary", "tier=web"], ocpCurrent: "4.17.12" },
  { name: "canary-ap-south-01", env: "canary", region: "ap-south-1", labels: ["env=canary", "tier=canary", "tier=web"], ocpCurrent: "4.17.12" },
  { name: "virt-staging-01", env: "staging", region: "us-east-1", labels: ["env=staging", "env=stage", "tier=web"], ocpCurrent: "4.16.12" },
  { name: "virt-staging-02", env: "staging", region: "us-west-2", labels: ["env=staging", "env=stage", "tier=web"], ocpCurrent: "4.16.12" },
  { name: "data-staging-01", env: "staging", region: "us-east-1", labels: ["env=staging", "env=stage", "tier=data"], ocpCurrent: "4.16.12" },
  { name: "virt-dev-01", env: "dev", region: "us-east-1", labels: ["env=dev", "tier=web"], ocpCurrent: "4.14.12" },
  { name: "virt-dev-02", env: "dev", region: "us-east-1", labels: ["env=dev", "tier=web"], ocpCurrent: "4.18.5" },
  { name: "virt-preprod-01", env: "preprod", region: "us-east-1", labels: ["env=preprod", "tier=web"], ocpCurrent: "4.16.5" },
  { name: "virt-preprod-02", env: "preprod", region: "us-west-2", labels: ["env=preprod", "tier=web"], ocpCurrent: "4.16.5" },
];

function normalizeSelectorPart(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^\s*then\s+/i, "")
    .trim();
}

/** Comma terms with OR semantics, aligned with AI plan proposals + wizard placement search. */
export function clusterMatchesProposalPart(
  part: string,
  cluster: Pick<FleetClusterRow, "name" | "env" | "region" | "labels">,
): boolean {
  if (!part) return false;
  if (part.startsWith("env=")) {
    const v = part.slice("env=".length).trim();
    const env = cluster.env.toLowerCase();
    if (env === v) return true;
    if (v === "stage" && env === "staging") return true;
  }
  if (part.startsWith("region=")) {
    const v = part.slice("region=".length).trim();
    const reg = cluster.region.toLowerCase();
    if (reg === v) return true;
    if (v === "na" && (reg === "us-east-1" || reg === "us-west-2")) return true;
  }
  return (
    cluster.labels.some((label) => label.toLowerCase().includes(part)) ||
    cluster.name.toLowerCase().includes(part)
  );
}

/**
 * Label / keyword filter used for “clusters matching this proposal’s suggested selector”
 * (OR across comma‑separated terms).
 */
export function filterFleetByProposalSelector(
  selector: string,
  pool: FleetClusterRow[],
): FleetClusterRow[] {
  if (!selector?.trim() || pool.length === 0) return [];
  const selectorParts = selector
    .split(",")
    .map((s) => normalizeSelectorPart(s))
    .filter(Boolean);
  return pool.filter((cluster) =>
    selectorParts.some((part) => clusterMatchesProposalPart(part, cluster)),
  );
}

/** Comma OR semantics — same as legacy `matchClustersBySelector` in the wizard. */
export function matchClustersByLabelFragment(selector: string): FleetClusterRow[] {
  if (!selector?.trim()) return [];
  const selectorParts = selector
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return FLEET_MOCK_CLUSTERS.filter((cluster) =>
    selectorParts.some((part) =>
      cluster.labels.some((label) => label.toLowerCase().includes(part)),
    ),
  );
}

export function getClustersMatchingPlacementInput(fd: {
  fleetSelection: string;
  labelSelector?: string;
  selectedClusters?: string[];
}): FleetClusterRow[] {
  if (fd.fleetSelection === "searchable") {
    const names = fd.selectedClusters || [];
    return FLEET_MOCK_CLUSTERS.filter((c) => names.includes(c.name));
  }
  return matchClustersByLabelFragment(fd.labelSelector || "");
}

type ActionAreaHint = { areas?: DeploymentTabId[] };

/**
 * Infers which deployment “area” classes apply to a matched fleet (prototype heuristics).
 */
export function inferInventoryCapabilities(
  clusters: Pick<FleetClusterRow, "name" | "labels">[],
) {
  if (clusters.length === 0) {
    return { platform: false, applications: false, virtualMachines: false };
  }
  const platform = true;
  const applications = clusters.some((c) =>
    /tier=web|tier=data|app\.|pipeline|namespace=|tekton/i.test(
      c.labels.join(" ").toLowerCase(),
    ),
  );
  const virtualMachines = clusters.some((c) => {
    const b = `${c.name} ${c.labels.join(" ")}`.toLowerCase();
    return /^virt-/i.test(c.name) || /kubevirt|workload=vm|kubevirt\.io/.test(b);
  });
  return { platform, applications, virtualMachines };
}

/** True if this catalog action could apply to at least one row in the placement inventory. */
export function catalogActionFitsInventory(
  action: ActionAreaHint,
  cap: ReturnType<typeof inferInventoryCapabilities>,
) {
  if (!action.areas?.length) return true;
  return action.areas.some((area) => {
    if (area === "clusters" || area === "all") return cap.platform;
    if (area === "applications") return cap.applications;
    if (area === "virtual-machines") return cap.virtualMachines;
    return false;
  });
}
