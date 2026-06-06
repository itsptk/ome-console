import { ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import {
  PageTitle,
  SectionTitle,
  SmallText,
  TinyText,
  Container,
  SecondaryButton,
  Badge,
  Card,
} from "../../../../imports/UIComponents";
import { deploymentCopy } from "../deploymentPrototypeCopy";
import { PROTOTYPE_PINK } from "../prototypeChrome";

type ResearchTab = "in-progress" | "failures" | "completed";

const RESEARCH_TABS: { id: ResearchTab; label: string; path: string }[] = [
  {
    id: "in-progress",
    label: "In progress",
    path: "/deployments/r3/in-progress",
  },
  {
    id: "failures",
    label: "Failures",
    path: "/deployments/r3/failures",
  },
  {
    id: "completed",
    label: "Morning after",
    path: "/deployments/r3/completed",
  },
];

function statusVariantForLabel(status: string): "success" | "warning" | "destructive" | "info" | "default" {
  if (status.includes("progress")) return "warning";
  if (status.includes("fail") || status.includes("Fail")) return "destructive";
  if (status.includes("Complete")) return "success";
  return "info";
}

export function FleetRolloutResearchChrome({
  activeTab,
  title,
  status,
  statusColor,
  children,
}: {
  activeTab: ResearchTab;
  title: string;
  status: string;
  statusColor: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <Container className="p-8">
      <button
        type="button"
        onClick={() => navigate("/deployments")}
        className="mb-4 inline-flex items-center gap-2 text-sm hover:underline"
        style={{ color: "var(--primary)" }}
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to {deploymentCopy.fleetRollout.pageTitle}
      </button>

      <div
        className="mb-6 rounded-md border px-4 py-3 text-sm"
        style={{
          borderColor: PROTOTYPE_PINK,
          backgroundColor: "#fff5fa",
          color: "var(--foreground)",
        }}
      >
        <strong>R3 research prototype</strong> — Fleet rollout screens for
        UXDR-5929. Conceptual only; not for implementation.
      </div>

      <nav
        className="mb-6 flex flex-wrap gap-2 border-b pb-3"
        aria-label="R3 research views"
      >
        {RESEARCH_TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
              style={{
                backgroundColor: active ? "var(--primary)" : "var(--secondary)",
                color: active ? "var(--primary-foreground)" : "var(--foreground)",
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <PageTitle className="!mb-2">{title}</PageTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusVariantForLabel(status)}>{status}</Badge>
            <SmallText muted>Cluster upgrade</SmallText>
          </div>
        </div>
      </div>

      {children}
    </Container>
  );
}

export function DetailField({
  label,
  value,
  link,
}: {
  label: string;
  value: string;
  link?: boolean;
}) {
  return (
    <div>
      <TinyText muted className="mb-0.5 block uppercase tracking-wide">
        {label}
      </TinyText>
      <SmallText
        className={link ? "cursor-pointer underline" : undefined}
        style={link ? { color: "var(--primary)" } : undefined}
      >
        {value}
      </SmallText>
    </div>
  );
}

export function SummaryMetric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <Card className="min-w-[140px] flex-1 p-4">
      <TinyText muted className="mb-1 block">
        {label}
      </TinyText>
      <SectionTitle
        className="!text-2xl"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </SectionTitle>
    </Card>
  );
}

export function WaveStepper({
  waves,
}: {
  waves: readonly {
    id: number;
    label: string;
    subtitle: string;
    state: "complete" | "active" | "pending";
    completedNote?: string;
  }[];
}) {
  return (
    <Card className="mb-6 p-4">
      <SectionTitle className="mb-4 !text-lg">Rollout waves</SectionTitle>
      <ol className="space-y-4">
        {waves.map((wave) => (
          <li key={wave.id} className="flex gap-3">
            <div
              className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{
                backgroundColor:
                  wave.state === "complete"
                    ? "#3E8635"
                    : wave.state === "active"
                      ? "#0066CC"
                      : "#6A6E73",
              }}
              aria-hidden
            >
              {wave.state === "complete" ? "✓" : wave.id}
            </div>
            <div>
              <SmallText className="font-medium">{wave.label}</SmallText>
              <TinyText muted>{wave.subtitle}</TinyText>
              {wave.completedNote && (
                <TinyText muted className="mt-1 block">
                  {wave.completedNote}
                </TinyText>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
