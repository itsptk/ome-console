import { useNavigate } from "react-router";
import {
  SectionTitle,
  SmallText,
  TinyText,
  PrimaryButton,
  SecondaryButton,
  Card,
} from "../../../imports/UIComponents";
import { R3_FAILURES, R3_ROLLOUT } from "../../components/deployments/fleetRolloutResearchDemo";
import { FleetRolloutResearchChrome } from "../../components/deployments/fleet-rollout-research/FleetRolloutResearchChrome";

export function FleetRolloutFailurePage() {
  const navigate = useNavigate();

  return (
    <FleetRolloutResearchChrome
      activeTab="failures"
      title={R3_ROLLOUT.title}
      status="2 failures in Wave 2"
      statusColor="#C9190B"
    >
      <Card
        className="mb-6 p-4"
        style={{ borderColor: "#C9190B", borderWidth: 1 }}
      >
        <SectionTitle className="mb-2 !text-lg">
          2 clusters failed in Wave 2
        </SectionTitle>
        <SmallText muted className="mb-4 block">
          6 clusters in Wave 2 still in progress or pending · Wave 3 not started
        </SmallText>
        <div className="flex flex-wrap gap-2">
          <PrimaryButton type="button">Pause rollout</PrimaryButton>
          <SecondaryButton type="button">Abort remaining waves</SecondaryButton>
          <SecondaryButton type="button">
            Continue — I&apos;ll handle failures manually
          </SecondaryButton>
        </div>
      </Card>

      <div className="mb-4 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Failed", value: "2" },
          { label: "In progress (Wave 2)", value: "6" },
          { label: "Pending (Wave 2)", value: "5" },
          { label: "Pending (Wave 3)", value: "20" },
        ].map((item) => (
          <Card key={item.label} className="p-4">
            <TinyText muted>{item.label}</TinyText>
            <SectionTitle className="!text-xl">{item.value}</SectionTitle>
          </Card>
        ))}
      </div>

      <Card className="mb-6 overflow-hidden p-0">
        <div className="border-b px-4 py-3">
          <SectionTitle className="!mb-0 !text-lg">Failed clusters</SectionTitle>
        </div>
        <div className="divide-y">
          {R3_FAILURES.map((failure) => (
            <div key={failure.name} className="p-4">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <SectionTitle className="!mb-1 !text-lg">
                    {failure.name}
                  </SectionTitle>
                  <SmallText muted>
                    Wave {failure.wave} · Failed at {failure.failedAt}
                  </SmallText>
                </div>
                <div className="flex flex-wrap gap-2">
                  <SecondaryButton type="button">View events</SecondaryButton>
                  <SecondaryButton type="button">View cluster</SecondaryButton>
                </div>
              </div>

              <dl className="mb-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <TinyText muted>Error</TinyText>
                  <SmallText>{failure.errorSummary}</SmallText>
                </div>
                <div>
                  <TinyText muted>Phase</TinyText>
                  <SmallText>{failure.phase}</SmallText>
                </div>
                <div>
                  <TinyText muted>Last successful step</TinyText>
                  <SmallText>{failure.lastSuccessfulStep}</SmallText>
                </div>
                <div>
                  <TinyText muted>Correlation</TinyText>
                  <SmallText>{failure.correlationId}</SmallText>
                </div>
                <div className="sm:col-span-2">
                  <TinyText muted>External ref</TinyText>
                  <SmallText style={{ color: "var(--primary)" }}>
                    {failure.externalRef}
                  </SmallText>
                </div>
              </dl>

              <div className="rounded-md bg-[var(--secondary)] p-3">
                <TinyText muted className="mb-2 block">
                  Recent events
                </TinyText>
                <ul className="space-y-1">
                  {failure.events.map((event) => (
                    <li key={`${event.time}-${event.message}`}>
                      <SmallText>
                        <span className="text-[var(--muted-foreground)]">
                          {event.time}
                        </span>{" "}
                        {event.message}
                      </SmallText>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <SecondaryButton
        type="button"
        onClick={() => navigate("/deployments/r3/in-progress")}
      >
        Back to in-progress view
      </SecondaryButton>
    </FleetRolloutResearchChrome>
  );
}
