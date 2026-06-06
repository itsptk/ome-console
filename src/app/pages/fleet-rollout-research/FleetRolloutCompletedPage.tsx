import {
  SectionTitle,
  SecondaryButton,
  Badge,
  Card,
} from "../../../imports/UIComponents";
import { R3_COMPLETED } from "../../components/deployments/fleetRolloutResearchDemo";
import {
  FleetRolloutResearchChrome,
  SummaryMetric,
} from "../../components/deployments/fleet-rollout-research/FleetRolloutResearchChrome";


function checkStatusLabel(status: "ok" | "warning" | "pending"): string {
  if (status === "ok") return "OK";
  if (status === "warning") return "Needs attention";
  return "Pending";
}

function checkStatusVariant(
  status: "ok" | "warning" | "pending",
): "success" | "warning" | "default" {
  if (status === "ok") return "success";
  if (status === "warning") return "warning";
  return "default";
}

export function FleetRolloutCompletedPage() {
  const d = R3_COMPLETED;

  return (
    <FleetRolloutResearchChrome
      activeTab="completed"
      title={d.title}
      status={d.status}
      statusColor={d.statusColor}
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <SummaryMetric
          label="On target version"
          value={`${d.onTarget} / ${d.total}`}
        />
        <SummaryMetric
          label="Exceptions"
          value={String(d.exceptions)}
          accent="#F0AB00"
        />
        <SummaryMetric label="Completed" value={d.completedAt} />
        <SummaryMetric label="Duration" value={d.duration} />
        <SummaryMetric label="Change record" value={d.changeRecord} />
      </div>

      <Card className="mb-6 p-4">
        <SectionTitle className="mb-4 !text-lg">
          Morning-after confidence checks
        </SectionTitle>
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          What OME aggregates after a big rollout — compare to the three checks
          participants named in the interview.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b">
                {["Check", "Status", "Detail", "Source"].map((h) => (
                  <th key={h} className="px-3 py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.checks.map((check) => (
                <tr key={check.label} className="border-b last:border-b-0">
                  <td className="px-3 py-3">{check.label}</td>
                  <td className="px-3 py-3">
                    <Badge variant={checkStatusVariant(check.status)}>
                      {checkStatusLabel(check.status)}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">{check.detail}</td>
                  <td className="px-3 py-3 text-[var(--muted-foreground)]">
                    {check.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mb-6 overflow-hidden p-0">
        <div className="border-b px-4 py-3">
          <SectionTitle className="!mb-0 !text-lg">Exceptions</SectionTitle>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-[var(--secondary)]">
              <th className="px-4 py-2 font-medium">Cluster</th>
              <th className="px-4 py-2 font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {d.exceptionsList.map((row) => (
              <tr key={row.cluster} className="border-b last:border-b-0">
                <td className="px-4 py-3 font-medium">{row.cluster}</td>
                <td className="px-4 py-3">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <SecondaryButton type="button" disabled>
        Open in ServiceNow
      </SecondaryButton>
    </FleetRolloutResearchChrome>
  );
}
