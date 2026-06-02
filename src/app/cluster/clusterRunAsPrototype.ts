/** Persist Run as choice per cluster id for prototype cluster detail / logs (no backend). */

export const CLUSTER_RUN_AS_STORAGE_KEY =
  "ome-console-prototype-cluster-run-as";

export type ClusterRunAsIndex = Record<string, string>;

export function persistClusterRunAsIndex(
  clusters: ReadonlyArray<{ id: string; runAs?: string }>,
): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    const map: ClusterRunAsIndex = {};
    for (const c of clusters) {
      if (typeof c.runAs === "string" && c.runAs.length > 0) {
        map[c.id] = c.runAs;
      }
    }
    sessionStorage.setItem(CLUSTER_RUN_AS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function readRunAsForCluster(
  clusterId: string | undefined,
): string | undefined {
  if (!clusterId || typeof sessionStorage === "undefined") return undefined;
  try {
    const raw = sessionStorage.getItem(CLUSTER_RUN_AS_STORAGE_KEY);
    if (!raw) return undefined;
    const map = JSON.parse(raw) as ClusterRunAsIndex;
    return map[clusterId];
  } catch {
    return undefined;
  }
}
