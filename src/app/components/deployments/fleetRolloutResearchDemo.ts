/** Static demo data for UXDR-5929 Round 3 fleet rollout research screens. */

export type ClusterRolloutStatus =
  | "complete"
  | "in_progress"
  | "failed"
  | "action_required"
  | "pending";

export type ClusterRow = {
  name: string;
  wave: number;
  status: ClusterRolloutStatus;
  message: string;
  updated: string;
};

export type FailedClusterDetail = {
  name: string;
  wave: number;
  failedAt: string;
  errorSummary: string;
  lastSuccessfulStep: string;
  phase: string;
  correlationId: string;
  externalRef: string;
  events: { time: string; message: string }[];
};

export type MorningAfterCheck = {
  label: string;
  status: "ok" | "warning" | "pending";
  detail: string;
  source: string;
};

export const R3_ROLLOUT = {
  id: "r3-ocp-prod-wave2",
  title: "OCP 4.15 → 4.16 — Production wave 2",
  type: "Cluster upgrade",
  scope: "prod-cluster-set · 40 clusters",
  status: "In progress" as const,
  statusColor: "#F0AB00",
  initiatedBy: "Argo CD",
  sourceApplication: "fleet-ocp-upgrade",
  commit: 'a3f9c2d · "Bump cluster version to 4.16"',
  started: "Jun 21, 2026 9:14 PM",
  initiatorIdentity: "platform-bot (GitOps)",
  externalLinkLabel: "Open in Argo CD",
  overallComplete: 28,
  overallTotal: 40,
  waveIndex: 2,
  waveTotal: 3,
  waveInProgress: 8,
  waveScope: 15,
  failedCount: 2,
  actionRequiredCount: 1,
  elapsed: "2h 14m",
  estimatedRemaining: "~45m",
  waves: [
    {
      id: 1,
      label: "Wave 1 — Canary",
      subtitle: "5 clusters",
      state: "complete" as const,
      completedNote: "Completed Jun 21, 10:30 PM · 0 failures",
    },
    {
      id: 2,
      label: "Wave 2 — Production batch",
      subtitle: "15 clusters",
      state: "active" as const,
    },
    {
      id: 3,
      label: "Wave 3 — Production batch",
      subtitle: "20 clusters",
      state: "pending" as const,
    },
  ],
  clusters: [
    {
      name: "prod-us-east-01",
      wave: 2,
      status: "complete",
      message: "Upgrade successful",
      updated: "11:02 PM",
    },
    {
      name: "prod-us-east-02",
      wave: 2,
      status: "in_progress",
      message: "Updating control plane",
      updated: "11:14 PM",
    },
    {
      name: "prod-eu-west-03",
      wave: 2,
      status: "failed",
      message: "Node drain timeout",
      updated: "11:08 PM",
    },
    {
      name: "prod-ap-01",
      wave: 2,
      status: "action_required",
      message: "Re-authentication needed to continue",
      updated: "11:10 PM",
    },
    {
      name: "prod-us-east-04",
      wave: 3,
      status: "pending",
      message: "Waiting for Wave 2",
      updated: "—",
    },
    {
      name: "prod-us-central-02",
      wave: 2,
      status: "failed",
      message: "Operator cluster-version degraded",
      updated: "11:12 PM",
    },
    {
      name: "prod-eu-north-01",
      wave: 2,
      status: "in_progress",
      message: "Updating worker nodes (2/4)",
      updated: "11:13 PM",
    },
    {
      name: "prod-ap-south-02",
      wave: 2,
      status: "complete",
      message: "Upgrade successful",
      updated: "10:58 PM",
    },
  ] satisfies ClusterRow[],
  listRows: [
    {
      id: "r3-ocp-prod-wave2",
      name: "OCP 4.15 → 4.16 — Production wave 2",
      type: "Cluster upgrade",
      status: "In progress",
      progress: "28 / 40 clusters",
      scope: "prod-cluster-set",
      initiatedBy: "Argo CD · fleet-ocp-upgrade",
      started: "Jun 21, 9:14 PM",
      researchView: "in-progress" as const,
    },
    {
      id: "r3-ocp-prod-completed",
      name: "OCP 4.15 → 4.16 — Production wave 2",
      type: "Cluster upgrade",
      status: "Completed with exceptions",
      progress: "38 / 40 on target",
      scope: "prod-cluster-set",
      initiatedBy: "Argo CD · fleet-ocp-upgrade",
      started: "Jun 21, 9:14 PM",
      researchView: "completed" as const,
    },
    {
      id: "r3-drift-detected",
      name: "New OCP version 4.16.2 available",
      type: "Cluster upgrade",
      status: "Detected",
      progress: "0 / 40 applied",
      scope: "prod-cluster-set",
      initiatedBy: "—",
      started: "Detected 2h ago",
      researchView: "detected" as const,
    },
  ],
} as const;

export const R3_FAILURES: FailedClusterDetail[] = [
  {
    name: "prod-eu-west-03",
    wave: 2,
    failedAt: "11:08 PM",
    errorSummary: "Node drain timeout — 2 nodes did not evacuate within 30 minutes",
    lastSuccessfulStep: "Control plane updated",
    phase: "Worker node update",
    correlationId: "roll-2026-06-21-abc123",
    externalRef: "Argo CD sync: fleet-ocp-upgrade / prod-eu-west-03",
    events: [
      { time: "11:08 PM", message: "Node worker-3 drain timed out" },
      { time: "11:05 PM", message: "Started worker node update" },
      { time: "10:58 PM", message: "Control plane update complete" },
    ],
  },
  {
    name: "prod-us-central-02",
    wave: 2,
    failedAt: "11:12 PM",
    errorSummary: "Operator cluster-version degraded",
    lastSuccessfulStep: "Machine config applied",
    phase: "Operator reconciliation",
    correlationId: "roll-2026-06-21-abc123",
    externalRef: "Argo CD sync: fleet-ocp-upgrade / prod-us-central-02",
    events: [
      { time: "11:12 PM", message: "ClusterVersion operator not available" },
      { time: "11:09 PM", message: "Machine config pools updated" },
      { time: "11:01 PM", message: "Control plane update complete" },
    ],
  },
];

export const R3_COMPLETED = {
  title: R3_ROLLOUT.title,
  status: "Completed with exceptions",
  statusColor: "#F0AB00",
  completedAt: "Jun 22, 2026 1:42 AM",
  duration: "4h 28m",
  onTarget: 38,
  total: 40,
  exceptions: 2,
  changeRecord: "CHG0048123",
  checks: [
    {
      label: "All clusters report target version 4.16",
      status: "warning",
      detail: "38 / 40",
      source: "Cluster API",
    },
    {
      label: "Cluster operators healthy",
      status: "warning",
      detail: "38 / 40",
      source: "MCO / operator status",
    },
    {
      label: "Argo CD applications synced",
      status: "ok",
      detail: "40 / 40",
      source: "Argo CD",
    },
    {
      label: "No critical alerts (24h)",
      status: "ok",
      detail: "No critical alerts",
      source: "Monitoring",
    },
    {
      label: "Change ticket closed",
      status: "pending",
      detail: "Pending approval",
      source: "ServiceNow",
    },
  ] satisfies MorningAfterCheck[],
  exceptionsList: [
    {
      cluster: "prod-eu-west-03",
      note: "Skipped — manual remediation scheduled",
    },
    {
      cluster: "prod-us-central-02",
      note: "Rolled back to 4.15",
    },
  ],
};

export function clusterStatusLabel(status: ClusterRolloutStatus): string {
  switch (status) {
    case "complete":
      return "Complete";
    case "in_progress":
      return "In progress";
    case "failed":
      return "Failed";
    case "action_required":
      return "Action required";
    case "pending":
      return "Pending";
  }
}

export function clusterStatusColor(status: ClusterRolloutStatus): string {
  switch (status) {
    case "complete":
      return "#3E8635";
    case "in_progress":
      return "#0066CC";
    case "failed":
      return "#C9190B";
    case "action_required":
      return "#F0AB00";
    case "pending":
      return "#6A6E73";
  }
}
