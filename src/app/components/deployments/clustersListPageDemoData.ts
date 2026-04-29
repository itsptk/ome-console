import { FLEET_MOCK_CLUSTERS } from "./deploymentFleetInventory";

/**
 * Clusters list page uses the same cluster **names** as the deployment fleet mock so
 * “Create cluster upgrade plan” can open the fleet wizard with searchable placement.
 */
export type ClustersListPageRow = {
  id: string;
  name: string;
  type: string;
  status: string;
  version: string;
  nodes: number;
  cpu: number;
  memory: string;
  location: string;
  region: string;
  namespace: string;
  ipAddress: string;
  created: string;
  /** Set when the row was created via the Create Cluster wizard (fast-forward demo). */
  runAs?: string;
};

const REGION_LABEL: Record<string, string> = {
  "us-east-1": "US East (N. Virginia)",
  "us-west-2": "US West (Oregon)",
  "eu-west-1": "EU (Ireland)",
  "ap-south-1": "Asia Pacific (Mumbai)",
  "ap-southeast-1": "Asia Pacific (Singapore)",
  "ap-northeast-1": "Asia Pacific (Tokyo)",
  "sa-east-1": "South America (São Paulo)",
};

function typeForName(name: string): string {
  if (name.startsWith("virt-")) return "Virtualization";
  if (name.startsWith("data-")) return "Data Processing";
  if (name.startsWith("canary-")) return "Application";
  return "Application";
}

function locationForRegion(region: string): string {
  return REGION_LABEL[region] || region;
}

/**
 * First nine fleet-mock rows — stable ids 1..9 for `/clusters/:id` links.
 */
export const CLUSTERS_LIST_PAGE_INITIAL: ClustersListPageRow[] =
  FLEET_MOCK_CLUSTERS.slice(0, 9).map((c, i) => ({
    id: String(i + 1),
    name: c.name,
    type: typeForName(c.name),
    status: "Healthy",
    version: `OpenShift ${c.ocpCurrent}`,
    nodes: 10 + (i % 5) * 2,
    cpu: 128 + i * 16,
    memory: "1.2 TB",
    location: locationForRegion(c.region),
    region: c.region,
    namespace: "default",
    ipAddress: `10.128.${i + 1}.10`,
    created: "Mar 10, 2026",
  }));
