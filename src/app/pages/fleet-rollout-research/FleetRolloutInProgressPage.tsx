import { useNavigate } from "react-router";
import {
  SectionTitle,
  PrimaryButton,
  SecondaryButton,
  Badge,
  Card,
} from "../../../imports/UIComponents";
import type { ClusterRolloutStatus } from "../../components/deployments/fleetRolloutResearchDemo";
import {
  R3_ROLLOUT,
  clusterStatusLabel,
} from "../../components/deployments/fleetRolloutResearchDemo";
import {
  DetailField,
  FleetRolloutResearchChrome,
  SummaryMetric,
  WaveStepper,
} from "../../components/deployments/fleet-rollout-research/FleetRolloutResearchChrome";

function clusterStatusVariant(
  status: ClusterRolloutStatus,
): "success" | "info" | "destructive" | "warning" | "default" {
  switch (status) {
    case "complete":
      return "success";
    case "in_progress":
      return "info";
    case "failed":
      return "destructive";
    case "action_required":
      return "warning";
    case "pending":
      return "default";
  }
}

export function FleetRolloutInProgressPage() {
  const navigate = useNavigate();
  const d = R3_ROLLOUT;

  return (
    <FleetRolloutResearchChrome
      activeTab="in-progress"
      title={d.title}
      status={d.status}
      statusColor={d.statusColor}
    >
      <Card className="mb-6 grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
        <DetailField label="Initiated by" value={d.initiatedBy} />
        <DetailField
          label="Source"
          value={`Application: ${d.sourceApplication}`}
          link
        />
        <DetailField label="Commit" value={d.commit} />
        <DetailField label="Started" value={d.started} />
        <DetailField label="Initiator" value={d.initiatorIdentity} />
        <DetailField label="Scope" value={d.scope} />
        <div className="md:col-span-2 lg:col-span-3">
          <SecondaryButton type="button">{d.externalLinkLabel}</SecondaryButton>
        </div>
      </Card>

      <div className="mb-6 flex flex-wrap gap-3">
        <SummaryMetric
          label="Overall progress"
          value={`${d.overallComplete} / ${d.overallTotal} clusters`}
        />
        <SummaryMetric
          label={`Wave ${d.waveIndex} of ${d.waveTotal}`}
          value={`${d.waveInProgress} / ${d.waveScope} in progress`}
        />
        <SummaryMetric
          label="Failed"
          value={String(d.failedCount)}
          accent="#C9190B"
        />
        <SummaryMetric
          label="Action required"
          value={String(d.actionRequiredCount)}
          accent="#F0AB00"
        />
        <SummaryMetric label="Elapsed" value={d.elapsed} />
        <SummaryMetric label="Est. remaining" value={d.estimatedRemaining} />
      </div>

      <WaveStepper waves={d.waves} />

      <Card className="mb-6 overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <SectionTitle className="!mb-0 !text-lg">Clusters</SectionTitle>
          <div className="flex flex-wrap gap-2">
            <SecondaryButton
              type="button"
              onClick={() => navigate("/deployments/r3/failures")}
            >
              View {d.failedCount} failures
            </SecondaryButton>
            <SecondaryButton type="button">Pause rollout</SecondaryButton>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b bg-[var(--secondary)]">
                {["Cluster", "Wave", "Status", "Message", "Updated"].map(
                  (h) => (
                    <th key={h} className="px-4 py-2 font-medium">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {d.clusters.map((row) => (
                <tr key={row.name} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3">{row.wave}</td>
                  <td className="px-4 py-3">
                    <Badge variant={clusterStatusVariant(row.status)}>
                      {clusterStatusLabel(row.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{row.message}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">
                    {row.updated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        <PrimaryButton type="button" disabled>
          Create rollout (hidden for GitOps-triggered demo)
        </PrimaryButton>
        <SecondaryButton
          type="button"
          onClick={() => navigate("/deployments/r3/completed")}
        >
          Preview morning-after view
        </SecondaryButton>
      </div>
    </FleetRolloutResearchChrome>
  );
}
