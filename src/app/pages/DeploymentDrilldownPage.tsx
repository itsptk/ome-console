import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import {
  PageTitle,
  SectionTitle,
  BodyText,
  SmallText,
  TinyText,
  Container,
  PrimaryButton,
  SecondaryButton,
  Badge,
  Card,
  CompactCard,
} from "../../imports/UIComponents";

type EventCategory =
  | "infrastructure"
  | "workload"
  | "network"
  | "storage";

type TimelineEvent = {
  id: string;
  timestamp: Date;
  category: EventCategory;
  severity: "error" | "warning" | "info";
  title: string;
  description: string;
  affectedResources: string[];
  ranAs?: string; // Who the event ran as - from execution policy
};

export function DeploymentDrilldownPage() {
  const { deploymentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Timeline state
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = full view, 2 = 2x zoom, etc.
  const [scrollPosition, setScrollPosition] = useState(0); // 0 to 1
  const [selectedTimeWindow, setSelectedTimeWindow] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<
    EventCategory[]
  >(["infrastructure", "workload", "network", "storage"]);
  const [hoveredEvent, setHoveredEvent] =
    useState<TimelineEvent | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({
    x: 0,
    y: 0,
  });

  const timelineRef = useRef<HTMLDivElement>(null);

  // Get execution policy from location state, default to "Personal (Adi Cluster Admin)" if not provided
  const executionPolicy = (location.state as any)?.executionPolicy;
  const ranAsValue = executionPolicy?.runAs || "Personal (Adi Cluster Admin)";

  // Mock deployment data
  // Timeline: Deployment starts Mar 24 22:00, Phase 1 processes 10 canary clusters
  // 4 succeed, 6 fail over ~2.5 hours, threshold hit at 00:20 on Mar 25
  const deployment = {
    id: "openshift-cluster-update-001",
    action: "OpenShift cluster update",
    actionTargets: "OCP 4.16 → 4.17",
    admin: "user-01",
    created: new Date("2026-03-24T22:00:00Z"),
    affectedClusters: 40,
    selector: "label:canary, env=prod",
    status: "Stopped by error threshold",
    statusColor: "#C9190B",
    // Timeline showing what was planned vs what actually happened
    startTime: new Date("2026-03-24T22:00:00Z"),
    endTime: new Date("2026-03-26T18:00:00Z"), // Full planned timeline
    safetyBrakeTime: new Date("2026-03-25T00:20:00Z"), // When 6th failure triggered threshold
    // Phases
    phase1: {
      start: new Date("2026-03-24T22:05:00Z"),
      end: new Date("2026-03-25T00:20:00Z"), // Ended early due to threshold
      status: "failed",
      successCount: 4,
      failedCount: 6,
      totalCount: 10,
      failureRate: 60,
      failedClusters: [
        { name: "cnfdf19", reason: "Ingress timeout" },
        { name: "cnfdf07", reason: "Connection refused" },
        { name: "cnfdf23", reason: "Pod CrashLoopBackOff" },
        { name: "cnfdf31", reason: "Ingress timeout" },
        { name: "cnfdf42", reason: "Ingress timeout" },
        { name: "cnfdf56", reason: "Network policy conflict" },
      ],
      successfulClusters: ["cnfdf12", "cnfdf28", "cnfdf33", "cnfdf45"],
    },
    soak: {
      start: new Date("2026-03-25T00:20:00Z"), // Would have started after P1
      end: new Date("2026-03-26T00:20:00Z"),   // 24h soak planned
      status: "cancelled",
    },
    phase2: {
      start: new Date("2026-03-26T00:20:00Z"), // Would have started after soak
      end: new Date("2026-03-26T18:00:00Z"),
      status: "cancelled",
      successCount: 0,
      totalCount: 30,
    },
    maintenanceWindow: {
      start: new Date("2026-03-24T22:00:00Z"),
      end: new Date("2026-03-27T02:00:00Z"),
    },
  };

  // Mock timeline events - chronologically ordered
  // Phase 1 processes 10 clusters from 22:05 to 00:20 (when threshold hit)
  // Mixed successes and failures, threshold triggers on 6th failure
  const allEvents: TimelineEvent[] = [
    // Early successes
    {
      id: "evt-1",
      timestamp: new Date("2026-03-24T22:15:00Z"),
      category: "infrastructure",
      severity: "info",
      title: "Cluster cnfdf12 - Upgrade successful",
      description: "Successfully upgraded to OCP 4.17",
      affectedResources: ["cnfdf12"],
      ranAs: ranAsValue,
    },
    {
      id: "evt-2",
      timestamp: new Date("2026-03-24T22:25:00Z"),
      category: "infrastructure",
      severity: "info",
      title: "Cluster cnfdf28 - Upgrade successful",
      description: "Successfully upgraded to OCP 4.17",
      affectedResources: ["cnfdf28"],
      ranAs: ranAsValue,
    },
    // First failure
    {
      id: "evt-3",
      timestamp: new Date("2026-03-24T22:35:00Z"),
      category: "infrastructure",
      severity: "error",
      title: "Cluster cnfdf19 - Ingress timeout",
      description: "Ingress controller failed to respond after 15 minutes",
      affectedResources: ["cnfdf19"],
      ranAs: ranAsValue,
    },
    // Another success
    {
      id: "evt-4",
      timestamp: new Date("2026-03-24T22:50:00Z"),
      category: "infrastructure",
      severity: "info",
      title: "Cluster cnfdf33 - Upgrade successful",
      description: "Successfully upgraded to OCP 4.17",
      affectedResources: ["cnfdf33"],
      ranAs: ranAsValue,
    },
    // Second failure
    {
      id: "evt-5",
      timestamp: new Date("2026-03-24T23:05:00Z"),
      category: "infrastructure",
      severity: "error",
      title: "Cluster cnfdf07 - Connection refused",
      description: "Connection refused on port 443",
      affectedResources: ["cnfdf07"],
      ranAs: ranAsValue,
    },
    // Last success
    {
      id: "evt-6",
      timestamp: new Date("2026-03-24T23:20:00Z"),
      category: "infrastructure",
      severity: "info",
      title: "Cluster cnfdf45 - Upgrade successful",
      description: "Successfully upgraded to OCP 4.17",
      affectedResources: ["cnfdf45"],
      ranAs: ranAsValue,
    },
    // Failures accelerating
    {
      id: "evt-7",
      timestamp: new Date("2026-03-24T23:35:00Z"),
      category: "workload",
      severity: "error",
      title: "Cluster cnfdf23 - Pod CrashLoopBackOff",
      description: "Application pod entering crash loop after upgrade",
      affectedResources: ["cnfdf23"],
      ranAs: ranAsValue,
    },
    {
      id: "evt-8",
      timestamp: new Date("2026-03-24T23:50:00Z"),
      category: "infrastructure",
      severity: "error",
      title: "Cluster cnfdf31 - Ingress timeout",
      description: "Ingress controller timeout during health check",
      affectedResources: ["cnfdf31"],
      ranAs: ranAsValue,
    },
    {
      id: "evt-9",
      timestamp: new Date("2026-03-25T00:05:00Z"),
      category: "infrastructure",
      severity: "error",
      title: "Cluster cnfdf42 - Ingress timeout",
      description: "Ingress controller timeout during health check",
      affectedResources: ["cnfdf42"],
      ranAs: ranAsValue,
    },
    // 6th failure - triggers threshold
    {
      id: "evt-10",
      timestamp: new Date("2026-03-25T00:20:00Z"),
      category: "network",
      severity: "error",
      title: "Cluster cnfdf56 - Network policy conflict",
      description: "Network policy preventing ingress traffic",
      affectedResources: ["cnfdf56"],
      ranAs: ranAsValue,
    },
    // Threshold event - same timestamp as 6th failure
    {
      id: "evt-11",
      timestamp: new Date("2026-03-25T00:20:00Z"),
      category: "infrastructure",
      severity: "error",
      title: "Error Threshold Triggered",
      description:
        "Deployment stopped: 6/10 clusters failed (60%) exceeding 50% threshold",
      affectedResources: ["openshift-cluster-update-001"],
      ranAs: ranAsValue,
    },
  ];

  // Filter events
  const filteredEvents = allEvents.filter((event) => {
    const categoryMatch = selectedCategories.includes(
      event.category,
    );
    const searchMatch =
      searchQuery === "" ||
      event.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      event.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    let timeMatch = true;
    if (selectedTimeWindow) {
      timeMatch =
        event.timestamp >= selectedTimeWindow.start &&
        event.timestamp <= selectedTimeWindow.end;
    }

    return categoryMatch && searchMatch && timeMatch;
  });

  const toggleCategory = (category: EventCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  // Calculate position on timeline (0 to 1)
  const getTimelinePosition = (date: Date) => {
    const total =
      deployment.endTime.getTime() -
      deployment.startTime.getTime();
    const offset =
      date.getTime() - deployment.startTime.getTime();
    return offset / total;
  };

  // Calculate visible window based on zoom and scroll
  const getVisibleTimeWindow = () => {
    const totalDuration =
      deployment.endTime.getTime() -
      deployment.startTime.getTime();
    const visibleDuration = totalDuration / zoomLevel;
    const maxScroll = totalDuration - visibleDuration;
    const scrollOffset = maxScroll * scrollPosition;

    const visibleStart = new Date(
      deployment.startTime.getTime() + scrollOffset,
    );
    const visibleEnd = new Date(
      visibleStart.getTime() + visibleDuration,
    );

    return { start: visibleStart, end: visibleEnd };
  };

  // Calculate position within visible window
  const getVisiblePosition = (date: Date) => {
    const { start, end } = getVisibleTimeWindow();
    const total = end.getTime() - start.getTime();
    const offset = date.getTime() - start.getTime();
    return offset / total;
  };

  // Check if a date is visible in current window
  const isVisible = (date: Date) => {
    const { start, end } = getVisibleTimeWindow();
    return date >= start && date <= end;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDuration = (start: Date, end: Date) => {
    const hours = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60),
    );
    return `${hours}h`;
  };

  return (
    <Container className="p-8">
      {/* Back button */}
      <div className="mb-4">
        <SecondaryButton
          onClick={() => navigate("/deployments")}
          className="flex items-center gap-2"
        >
          <svg
            className="size-4"
            fill="none"
            viewBox="0 0 16 16"
          >
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Back to deployments</span>
        </SecondaryButton>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <PageTitle className="mb-1">
              {deployment.action}
            </PageTitle>
            <SmallText
              className="mb-2 font-mono"
              style={{
                color: "var(--muted-foreground)",
                display: "block",
              }}
            >
              {deployment.actionTargets}
            </SmallText>
            <div className="flex items-center gap-3">
              <StatusLabel variant="danger">
                {deployment.status}
              </StatusLabel>
              {/* Post-failure actions */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => {
                    // Would trigger restart confirmation
                    console.log("Restart deployment");
                  }}
                  className="px-3 py-1.5 text-sm font-medium rounded transition-colors"
                  style={{
                    backgroundColor: "#0066CC",
                    color: "#FFFFFF",
                  }}
                >
                  ↻ Restart
                </button>
                <button
                  onClick={() => {
                    // Would trigger cancel confirmation
                    console.log("Cancel deployment");
                  }}
                  className="px-3 py-1.5 text-sm font-medium rounded transition-colors"
                  style={{
                    backgroundColor: "transparent",
                    color: "#C9190B",
                    border: "1px solid #C9190B",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <TinyText muted className="mb-1">
              Deployment ID
            </TinyText>
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              {deployment.id}
            </SmallText>
          </div>
          <div>
            <TinyText muted className="mb-1">
              Created by
            </TinyText>
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              {deployment.admin}
            </SmallText>
          </div>
          <div>
            <TinyText muted className="mb-1">
              Started
            </TinyText>
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              {formatDate(deployment.startTime)}
            </SmallText>
          </div>
          <div>
            <TinyText muted className="mb-1">
              Affected resources
            </TinyText>
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              {deployment.affectedClusters} clusters
            </SmallText>
          </div>
        </div>
      </div>

      {/* Phase Status Cards - Optimized for Root Cause Analysis */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Phase 1 - Critical Info */}
        <div
          className="border rounded-lg p-4 col-span-2"
          style={{
            borderColor: "#C9190B",
            borderRadius: "var(--radius)",
            backgroundColor: "rgba(201, 25, 11, 0.03)",
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <SmallText
                style={{
                  fontWeight: "var(--font-weight-semibold)",
                  color: "#C9190B",
                }}
              >
                Phase 1: Canary - Failed
              </SmallText>
              <TinyText muted className="mt-0.5">
                {formatDate(deployment.phase1.start)} -{" "}
                {formatDate(deployment.phase1.end)}
              </TinyText>
            </div>
            <StatusLabel variant="danger">Failed</StatusLabel>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <TinyText muted>Success rate</TinyText>
              <SmallText
                style={{
                  fontWeight: "var(--font-weight-semibold)",
                  color: "#C9190B",
                }}
              >
                {100 - deployment.phase1.failureRate}% (
                {deployment.phase1.successCount}/
                {deployment.phase1.totalCount})
              </SmallText>
            </div>
            <div className="flex items-center justify-between">
              <TinyText muted>Failed clusters</TinyText>
              <SmallText
                style={{
                  fontWeight: "var(--font-weight-semibold)",
                  color: "#C9190B",
                }}
              >
                {deployment.phase1.failedCount} (
                {deployment.phase1.failureRate}% failure rate)
              </SmallText>
            </div>
            <div
              className="mt-3 pt-3"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <TinyText
                style={{
                  fontWeight: "var(--font-weight-medium)",
                  color: "#C9190B",
                }}
              >
                ⚠ Exceeded 50% error threshold
              </TinyText>
            </div>

            {/* Failed Clusters List */}
            <div
              className="mt-3 pt-3"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <TinyText
                style={{
                  fontWeight: "var(--font-weight-medium)",
                  marginBottom: "8px",
                  display: "block",
                }}
              >
                Failed clusters
              </TinyText>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {deployment.phase1.failedClusters.map((cluster) => (
                  <div
                    key={cluster.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <span
                      className="font-mono px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: "rgba(201, 25, 11, 0.1)",
                        color: "#C9190B",
                      }}
                    >
                      {cluster.name}
                    </span>
                    <TinyText muted className="truncate ml-2">
                      {cluster.reason}
                    </TinyText>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Soak */}
        <div
          className="border rounded-lg p-4"
          style={{
            borderColor: "var(--border)",
            borderRadius: "var(--radius)",
            backgroundColor: "var(--card)",
            opacity: 0.6,
          }}
        >
          <div className="mb-3">
            <SmallText
              style={{
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--muted-foreground)",
              }}
            >
              Soak Period
            </SmallText>
            <TinyText muted className="mt-0.5">
              {formatDuration(
                deployment.soak.start,
                deployment.soak.end,
              )}{" "}
              scheduled
            </TinyText>
          </div>

          <StatusLabel variant="warning">Cancelled</StatusLabel>

          <div className="mt-3">
            <TinyText muted>Auto-cancelled due to Canary failure</TinyText>
          </div>
        </div>

        {/* Phase 2 */}
        <div
          className="border rounded-lg p-4"
          style={{
            borderColor: "var(--border)",
            borderRadius: "var(--radius)",
            backgroundColor: "var(--card)",
            opacity: 0.6,
          }}
        >
          <div className="mb-3">
            <SmallText
              style={{
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--muted-foreground)",
              }}
            >
              Phase 2: Fleet rollout
            </SmallText>
            <TinyText muted className="mt-0.5">
              {deployment.phase2.totalCount} clusters
            </TinyText>
          </div>

          <StatusLabel variant="warning">Cancelled</StatusLabel>

          <div className="mt-3">
            <TinyText muted>Auto-cancelled due to Canary failure</TinyText>
          </div>

          <div
            className="mt-3 pt-3"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <TinyText
              style={{
                color: "var(--muted-foreground)",
                fontStyle: "italic",
              }}
            >
              0 of {deployment.phase2.totalCount} clusters were affected. Use Restart to
              retry from Phase 1, or Cancel to abort entirely.
            </TinyText>
          </div>
        </div>
      </div>

      {/* Interactive Timeline */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Diagnostic Timeline</SectionTitle>
          <div className="flex items-center gap-2">
            <TinyText muted>Zoom:</TinyText>
            <button
              onClick={() =>
                setZoomLevel(Math.max(1, zoomLevel - 0.5))
              }
              className="p-1.5 border rounded hover:bg-secondary transition-colors"
              style={{
                borderColor: "var(--border)",
                borderRadius: "var(--radius)",
              }}
            >
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 16 16"
              >
                <path
                  d="M4 8H12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
                minWidth: "40px",
                textAlign: "center",
              }}
            >
              {zoomLevel}x
            </SmallText>
            <button
              onClick={() =>
                setZoomLevel(Math.min(4, zoomLevel + 0.5))
              }
              className="p-1.5 border rounded hover:bg-secondary transition-colors"
              style={{
                borderColor: "var(--border)",
                borderRadius: "var(--radius)",
              }}
            >
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 16 16"
              >
                <path
                  d="M8 4V12M4 8H12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Timeline Controls */}
        <div
          className="border rounded-lg p-4 mb-4"
          style={{
            borderColor: "var(--border)",
            borderRadius: "var(--radius)",
            backgroundColor: "var(--background)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 16 16"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <path
                    d="M7 12C9.76142 12 12 9.76142 12 7C12 4.23858 9.76142 2 7 2C4.23858 2 2 4.23858 2 7C2 9.76142 4.23858 12 7 12Z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.33333"
                  />
                  <path
                    d="M14 14L10.5 10.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.33333"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events and logs..."
                className="w-full pl-9 pr-4 py-2 border rounded"
                style={{
                  borderRadius: "var(--radius)",
                  borderColor: "var(--border)",
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-sm)",
                  color: "var(--foreground)",
                  backgroundColor: "var(--background)",
                }}
              />
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-2">
              <TinyText muted>Filter:</TinyText>
              {(
                [
                  "infrastructure",
                  "workload",
                  "network",
                  "storage",
                ] as EventCategory[]
              ).map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className="px-3 py-1.5 border rounded transition-colors"
                  style={{
                    borderRadius: "var(--radius)",
                    borderColor: selectedCategories.includes(
                      category,
                    )
                      ? "var(--primary)"
                      : "var(--border)",
                    backgroundColor:
                      selectedCategories.includes(category)
                        ? "var(--primary)"
                        : "var(--background)",
                    color: selectedCategories.includes(category)
                      ? "var(--primary-foreground)"
                      : "var(--foreground)",
                  }}
                >
                  <TinyText
                    style={{
                      fontWeight: "var(--font-weight-medium)",
                      color: "inherit",
                    }}
                  >
                    {category}
                  </TinyText>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Time Window */}
          {selectedTimeWindow && (
            <div
              className="flex items-center gap-2 pt-3"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <TinyText muted>Selected window:</TinyText>
              <div
                className="px-2.5 py-1 rounded"
                style={{
                  backgroundColor: "var(--secondary)",
                  borderRadius: "calc(var(--radius) - 2px)",
                }}
              >
                <TinyText
                  style={{
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  {formatDate(selectedTimeWindow.start)} -{" "}
                  {formatDate(selectedTimeWindow.end)}
                </TinyText>
              </div>
              <button
                onClick={() => setSelectedTimeWindow(null)}
                className="ml-2"
                style={{
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-xs)",
                  color: "var(--primary)",
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                Clear selection
              </button>
            </div>
          )}
        </div>

        {/* Timeline Visualization */}
        <div
          ref={timelineRef}
          className="border rounded-lg overflow-hidden"
          style={{
            borderColor: "var(--border)",
            borderRadius: "var(--radius)",
            backgroundColor: "var(--card)",
          }}
        >
          <div className="p-6">
            {/* Timeline Header - Time Axis */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <TinyText
                  style={{
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  {formatDate(getVisibleTimeWindow().start)}
                </TinyText>
                <TinyText muted>
                  {zoomLevel > 1
                    ? `Zoomed ${zoomLevel}x`
                    : "Full view (2 days)"}
                </TinyText>
                <TinyText
                  style={{
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  {formatDate(getVisibleTimeWindow().end)}
                </TinyText>
              </div>

              {/* Time ruler */}
              <div
                className="relative h-8"
                style={{
                  borderBottom: "2px solid var(--border)",
                }}
              >
                {/* Day markers - show based on visible window */}
                {[0, 0.25, 0.5, 0.75, 1].map(
                  (position, idx) => {
                    const { start, end } =
                      getVisibleTimeWindow();
                    const visibleDuration =
                      end.getTime() - start.getTime();
                    const time = new Date(
                      start.getTime() +
                        position * visibleDuration,
                    );
                    return (
                      <div
                        key={idx}
                        className="absolute"
                        style={{ left: `${position * 100}%` }}
                      >
                        <div
                          className="w-px h-3"
                          style={{
                            backgroundColor: "var(--border)",
                          }}
                        />
                        <TinyText
                          muted
                          className="absolute -translate-x-1/2 mt-1"
                          style={{ fontSize: "10px" }}
                        >
                          {time.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </TinyText>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            {/* Legend */}
            <div
              className="flex items-center gap-6 mb-4 pb-3"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="size-3 rounded-full"
                  style={{ backgroundColor: "#3E8635" }}
                />
                <TinyText muted>Success</TinyText>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="size-3 rounded-full"
                  style={{ backgroundColor: "#C9190B" }}
                />
                <TinyText muted>Failure</TinyText>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-0.5"
                  style={{ backgroundColor: "#C9190B" }}
                />
                <TinyText muted>Error threshold</TinyText>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-3 rounded-sm"
                  style={{ backgroundColor: "#0066CC" }}
                />
                <TinyText muted>Canary</TinyText>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-3 rounded-sm border border-dashed"
                  style={{
                    borderColor: "#0066CC",
                    backgroundColor: "rgba(0, 102, 204, 0.1)",
                  }}
                />
                <TinyText muted>Soak</TinyText>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-3 rounded-sm"
                  style={{ backgroundColor: "#8A8D90" }}
                />
                <TinyText muted>Fleet</TinyText>
              </div>
            </div>

            {/* Timeline Track - Swimlane Layout */}
            <div
              className="relative"
              style={{ height: "120px", marginLeft: "65px" }}
              onWheel={(e) => {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.5 : 0.5;
                const newZoom = Math.max(1, Math.min(4, zoomLevel + delta));
                if (newZoom !== zoomLevel) {
                  // Adjust scroll position to zoom toward cursor
                  const rect = e.currentTarget.getBoundingClientRect();
                  const cursorX = (e.clientX - rect.left) / rect.width;
                  const oldViewportWidth = 1 / zoomLevel;
                  const newViewportWidth = 1 / newZoom;
                  const oldLeft = scrollPosition * (1 - oldViewportWidth);
                  const cursorPositionInTimeline = oldLeft + cursorX * oldViewportWidth;
                  const newLeft = cursorPositionInTimeline - cursorX * newViewportWidth;
                  const maxNewScroll = 1 - newViewportWidth;
                  const newScrollPosition = maxNewScroll > 0 
                    ? Math.max(0, Math.min(1, newLeft / maxNewScroll))
                    : 0;
                  setZoomLevel(newZoom);
                  setScrollPosition(newScrollPosition);
                }
              }}
            >
              {/* Swimlane Labels */}
              <div
                className="absolute"
                style={{
                  left: "-60px",
                  top: "0",
                  width: "55px",
                  height: "100%",
                }}
              >
                <TinyText
                  muted
                  style={{
                    position: "absolute",
                    top: "6px",
                    right: "0",
                    fontSize: "10px",
                    textAlign: "right",
                  }}
                >
                  Phases
                </TinyText>
                <TinyText
                  muted
                  style={{
                    position: "absolute",
                    top: "46px",
                    right: "0",
                    fontSize: "10px",
                    textAlign: "right",
                  }}
                >
                  Success
                </TinyText>
                <TinyText
                  muted
                  style={{
                    position: "absolute",
                    top: "86px",
                    right: "0",
                    fontSize: "10px",
                    textAlign: "right",
                  }}
                >
                  Failures
                </TinyText>
              </div>

              {/* Swimlane Dividers */}
              <div
                className="absolute w-full"
                style={{
                  top: "32px",
                  height: "1px",
                  backgroundColor: "var(--border)",
                  opacity: 0.5,
                }}
              />
              <div
                className="absolute w-full"
                style={{
                  top: "72px",
                  height: "1px",
                  backgroundColor: "var(--border)",
                  opacity: 0.5,
                }}
              />
              <div
                className="absolute w-full"
                style={{
                  top: "112px",
                  height: "1px",
                  backgroundColor: "var(--border)",
                  opacity: 0.5,
                }}
              />

              {/* Maintenance Window - Light background */}
              {(() => {
                const { start, end } = getVisibleTimeWindow();
                const mwStart =
                  deployment.maintenanceWindow.start;
                const mwEnd = deployment.maintenanceWindow.end;

                // Check if maintenance window overlaps with visible window
                if (mwEnd < start || mwStart > end) return null;

                const visibleStart = Math.max(
                  mwStart.getTime(),
                  start.getTime(),
                );
                const visibleEnd = Math.min(
                  mwEnd.getTime(),
                  end.getTime(),
                );
                const windowDuration =
                  end.getTime() - start.getTime();

                const leftPercent =
                  ((visibleStart - start.getTime()) /
                    windowDuration) *
                  100;
                const widthPercent =
                  ((visibleEnd - visibleStart) /
                    windowDuration) *
                  100;

                return (
                  <div
                    className="absolute rounded"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      top: "0",
                      height: "100%",
                      backgroundColor:
                        "rgba(210, 210, 210, 0.08)",
                      borderRadius: "var(--radius)",
                    }}
                  />
                );
              })()}

              {/* Phase 1 */}
              {(() => {
                const { start, end } = getVisibleTimeWindow();
                const p1Start = deployment.phase1.start;
                const p1End = deployment.phase1.end;

                // Check if phase overlaps with visible window
                if (p1End < start || p1Start > end) return null;

                const visibleStart = Math.max(
                  p1Start.getTime(),
                  start.getTime(),
                );
                const visibleEnd = Math.min(
                  p1End.getTime(),
                  end.getTime(),
                );
                const windowDuration =
                  end.getTime() - start.getTime();

                const leftPercent =
                  ((visibleStart - start.getTime()) /
                    windowDuration) *
                  100;
                const widthPercent =
                  ((visibleEnd - visibleStart) /
                    windowDuration) *
                  100;

                return (
                  <div
                    className="absolute rounded"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      top: "6px",
                      height: "20px",
                      backgroundColor: "#0066CC",
                      borderRadius: "var(--radius)",
                      border: "2px solid #0066CC",
                    }}
                  >
                    <div className="flex items-center justify-center h-full">
                      <TinyText
                        style={{
                          color: "white",
                          fontWeight:
                            "var(--font-weight-semibold)",
                          fontSize: "10px",
                        }}
                      >
                        Canary
                      </TinyText>
                    </div>
                  </div>
                );
              })()}

              {/* Soak - Cancelled */}
              {(() => {
                const { start, end } = getVisibleTimeWindow();
                const soakStart = deployment.soak.start;
                const soakEnd = deployment.soak.end;

                // Check if phase overlaps with visible window
                if (soakEnd < start || soakStart > end)
                  return null;

                const visibleStart = Math.max(
                  soakStart.getTime(),
                  start.getTime(),
                );
                const visibleEnd = Math.min(
                  soakEnd.getTime(),
                  end.getTime(),
                );
                const windowDuration =
                  end.getTime() - start.getTime();

                const leftPercent =
                  ((visibleStart - start.getTime()) /
                    windowDuration) *
                  100;
                const widthPercent =
                  ((visibleEnd - visibleStart) /
                    windowDuration) *
                  100;

                const isCancelled = deployment.soak.status === "cancelled";

                return (
                  <div
                    className="absolute rounded border-2 border-dashed"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      top: "6px",
                      height: "20px",
                      borderColor: isCancelled ? "var(--muted-foreground)" : "#0066CC",
                      backgroundColor: isCancelled ? "rgba(128, 128, 128, 0.1)" : "rgba(0, 102, 204, 0.1)",
                      borderRadius: "var(--radius)",
                      opacity: isCancelled ? 0.5 : 1,
                    }}
                  >
                    <div className="flex items-center justify-center h-full gap-1">
                      {isCancelled && (
                        <svg className="size-2.5" fill="none" viewBox="0 0 12 12" style={{ color: "var(--muted-foreground)" }}>
                          <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      <TinyText
                        style={{
                          color: isCancelled ? "var(--muted-foreground)" : "#0066CC",
                          fontWeight: "var(--font-weight-semibold)",
                          fontSize: "10px",
                          textDecoration: isCancelled ? "line-through" : "none",
                        }}
                      >
                        Soak
                      </TinyText>
                    </div>
                  </div>
                );
              })()}

              {/* Phase 2 - Cancelled */}
              {(() => {
                const { start, end } = getVisibleTimeWindow();
                const p2Start = deployment.phase2.start;
                const p2End = deployment.phase2.end;

                // Check if phase overlaps with visible window
                if (p2End < start || p2Start > end) return null;

                const visibleStart = Math.max(
                  p2Start.getTime(),
                  start.getTime(),
                );
                const visibleEnd = Math.min(
                  p2End.getTime(),
                  end.getTime(),
                );
                const windowDuration =
                  end.getTime() - start.getTime();

                const leftPercent =
                  ((visibleStart - start.getTime()) /
                    windowDuration) *
                  100;
                const widthPercent =
                  ((visibleEnd - visibleStart) /
                    windowDuration) *
                  100;

                const isCancelled = deployment.phase2.status === "cancelled";

                return (
                  <div
                    className="absolute rounded"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      top: "6px",
                      height: "20px",
                      backgroundColor: isCancelled ? "transparent" : "#8A8D90",
                      borderRadius: "var(--radius)",
                      border: isCancelled ? "2px dashed var(--muted-foreground)" : "2px solid #8A8D90",
                      opacity: isCancelled ? 0.5 : 1,
                    }}
                  >
                    <div className="flex items-center justify-center h-full gap-1">
                      {isCancelled && (
                        <svg className="size-2.5" fill="none" viewBox="0 0 12 12" style={{ color: "var(--muted-foreground)" }}>
                          <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      <TinyText
                        style={{
                          color: isCancelled ? "var(--muted-foreground)" : "white",
                          fontWeight: "var(--font-weight-semibold)",
                          fontSize: "10px",
                          textDecoration: isCancelled ? "line-through" : "none",
                        }}
                      >
                        Fleet
                      </TinyText>
                    </div>
                  </div>
                );
              })()}

              {/* Success Events - Green dots (middle swimlane) */}
              {allEvents
                .filter(
                  (e) =>
                    e.severity === "info" &&
                    isVisible(e.timestamp),
                )
                .map((event) => {
                  const position = getVisiblePosition(
                    event.timestamp,
                  );
                  return (
                    <div
                      key={event.id}
                      className="absolute cursor-pointer transition-transform hover:scale-125"
                      style={{
                        left: `${position * 100}%`,
                        top: "48px",
                        transform: "translateX(-50%)",
                      }}
                      onMouseEnter={(e) => {
                        setHoveredEvent(event);
                        const rect =
                          e.currentTarget.getBoundingClientRect();
                        setPopoverPosition({
                          x: rect.left,
                          y: rect.top - 10,
                        });
                      }}
                      onMouseLeave={() => setHoveredEvent(null)}
                      onClick={() => {
                        const windowStart = new Date(
                          event.timestamp.getTime() -
                            7.5 * 60 * 1000,
                        );
                        const windowEnd = new Date(
                          event.timestamp.getTime() +
                            7.5 * 60 * 1000,
                        );
                        setSelectedTimeWindow({
                          start: windowStart,
                          end: windowEnd,
                        });
                      }}
                    >
                      <div
                        className="size-3 rounded-full"
                        style={{ backgroundColor: "#3E8635" }}
                      />
                    </div>
                  );
                })}

              {/* Error Events - Red dots (bottom swimlane) */}
              {allEvents
                .filter(
                  (e) =>
                    e.severity === "error" &&
                    isVisible(e.timestamp),
                )
                .map((event) => {
                  const position = getVisiblePosition(
                    event.timestamp,
                  );
                  return (
                    <div
                      key={event.id}
                      className="absolute cursor-pointer transition-transform hover:scale-125"
                      style={{
                        left: `${position * 100}%`,
                        top: "88px",
                        transform: "translateX(-50%)",
                      }}
                      onMouseEnter={(e) => {
                        setHoveredEvent(event);
                        const rect =
                          e.currentTarget.getBoundingClientRect();
                        setPopoverPosition({
                          x: rect.left,
                          y: rect.top - 10,
                        });
                      }}
                      onMouseLeave={() => setHoveredEvent(null)}
                      onClick={() => {
                        const windowStart = new Date(
                          event.timestamp.getTime() -
                            7.5 * 60 * 1000,
                        );
                        const windowEnd = new Date(
                          event.timestamp.getTime() +
                            7.5 * 60 * 1000,
                        );
                        setSelectedTimeWindow({
                          start: windowStart,
                          end: windowEnd,
                        });
                      }}
                    >
                      <div
                        className="size-3 rounded-full"
                        style={{ backgroundColor: "#C9190B" }}
                      />
                    </div>
                  );
                })}

              {/* Safety Brake Marker */}
              {isVisible(deployment.safetyBrakeTime) && (
                <div
                  className="absolute"
                  style={{
                    left: `${getVisiblePosition(deployment.safetyBrakeTime) * 100}%`,
                    top: "0",
                    height: "100%",
                    transform: "translateX(-50%)",
                  }}
                >
                  <div
                    className="w-0.5 h-full"
                    style={{ backgroundColor: "#C9190B" }}
                  />
                  <div
                    className="absolute -top-8 -left-16 px-2.5 py-1 rounded whitespace-nowrap"
                    style={{
                      backgroundColor: "#C9190B",
                      borderRadius: "var(--radius)",
                    }}
                  >
                    <TinyText
                      style={{
                        color: "white",
                        fontWeight:
                          "var(--font-weight-semibold)",
                        fontSize: "11px",
                      }}
                    >
                      Error Threshold Reached
                    </TinyText>
                  </div>
                </div>
              )}
            </div>

            {/* Mini-map Navigator */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <TinyText muted style={{ fontSize: "10px" }}>
                  Overview — {zoomLevel === 1 ? "showing full timeline" : "drag viewport to navigate"}
                </TinyText>
                <TinyText muted style={{ fontSize: "10px" }}>
                  Click events for details
                </TinyText>
              </div>
              <div
                className="relative border rounded"
                style={{
                  height: "48px",
                  backgroundColor: "var(--secondary)",
                  borderColor: "var(--border)",
                  borderRadius: "var(--radius)",
                  cursor: zoomLevel > 1 ? "pointer" : "default",
                }}
                onClick={(e) => {
                  if (zoomLevel === 1) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = (e.clientX - rect.left) / rect.width;
                  // Center the viewport on click position
                  const viewportWidth = 1 / zoomLevel;
                  const newPosition = Math.max(0, Math.min(1 - viewportWidth, clickX - viewportWidth / 2));
                  const maxScroll = 1 - viewportWidth;
                  setScrollPosition(maxScroll > 0 ? newPosition / maxScroll : 0);
                }}
              >
                {/* Phase bars in mini-map */}
                {(() => {
                  const totalDuration = deployment.endTime.getTime() - deployment.startTime.getTime();
                  const p1Start = (deployment.phase1.start.getTime() - deployment.startTime.getTime()) / totalDuration;
                  const p1Width = (deployment.phase1.end.getTime() - deployment.phase1.start.getTime()) / totalDuration;
                  const soakStart = (deployment.soak.start.getTime() - deployment.startTime.getTime()) / totalDuration;
                  const soakWidth = (deployment.soak.end.getTime() - deployment.soak.start.getTime()) / totalDuration;
                  const p2Start = (deployment.phase2.start.getTime() - deployment.startTime.getTime()) / totalDuration;
                  const p2Width = (deployment.phase2.end.getTime() - deployment.phase2.start.getTime()) / totalDuration;
                  
                  return (
                    <>
                      {/* Phase 1 */}
                      <div
                        className="absolute rounded-sm"
                        style={{
                          left: `${p1Start * 100}%`,
                          width: `${p1Width * 100}%`,
                          top: "8px",
                          height: "8px",
                          backgroundColor: "#0066CC",
                        }}
                      />
                      {/* Soak */}
                      <div
                        className="absolute rounded-sm border border-dashed"
                        style={{
                          left: `${soakStart * 100}%`,
                          width: `${soakWidth * 100}%`,
                          top: "8px",
                          height: "8px",
                          borderColor: deployment.soak.status === "cancelled" ? "var(--muted-foreground)" : "#0066CC",
                          backgroundColor: deployment.soak.status === "cancelled" ? "transparent" : "rgba(0, 102, 204, 0.2)",
                          opacity: deployment.soak.status === "cancelled" ? 0.4 : 1,
                        }}
                      />
                      {/* Phase 2 */}
                      <div
                        className="absolute rounded-sm"
                        style={{
                          left: `${p2Start * 100}%`,
                          width: `${p2Width * 100}%`,
                          top: "8px",
                          height: "8px",
                          backgroundColor: deployment.phase2.status === "cancelled" ? "transparent" : "#8A8D90",
                          border: deployment.phase2.status === "cancelled" ? "1px dashed var(--muted-foreground)" : "none",
                          opacity: deployment.phase2.status === "cancelled" ? 0.4 : 1,
                        }}
                      />
                    </>
                  );
                })()}

                {/* Success events in mini-map */}
                {allEvents
                  .filter((e) => e.severity === "info")
                  .map((event) => {
                    const position = getTimelinePosition(event.timestamp);
                    return (
                      <div
                        key={`mini-${event.id}`}
                        className="absolute"
                        style={{
                          left: `${position * 100}%`,
                          top: "22px",
                          transform: "translateX(-50%)",
                        }}
                      >
                        <div
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: "#3E8635" }}
                        />
                      </div>
                    );
                  })}

                {/* Error events in mini-map */}
                {allEvents
                  .filter((e) => e.severity === "error")
                  .map((event) => {
                    const position = getTimelinePosition(event.timestamp);
                    return (
                      <div
                        key={`mini-${event.id}`}
                        className="absolute"
                        style={{
                          left: `${position * 100}%`,
                          top: "32px",
                          transform: "translateX(-50%)",
                        }}
                      >
                        <div
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: "#C9190B" }}
                        />
                      </div>
                    );
                  })}

                {/* Safety brake line in mini-map */}
                <div
                  className="absolute"
                  style={{
                    left: `${getTimelinePosition(deployment.safetyBrakeTime) * 100}%`,
                    top: "4px",
                    height: "40px",
                    transform: "translateX(-50%)",
                  }}
                >
                  <div
                    className="w-px h-full"
                    style={{ backgroundColor: "#C9190B" }}
                  />
                </div>

                {/* Viewport indicator */}
                {zoomLevel > 1 && (
                  <div
                    className="absolute top-0 h-full border-2 rounded transition-all"
                    style={{
                      left: `${(scrollPosition * (1 - 1 / zoomLevel)) * 100}%`,
                      width: `${(1 / zoomLevel) * 100}%`,
                      borderColor: "var(--primary)",
                      backgroundColor: "rgba(0, 102, 204, 0.1)",
                      borderRadius: "var(--radius)",
                      cursor: "grab",
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      const startX = e.clientX;
                      const startPosition = scrollPosition;
                      const container = e.currentTarget.parentElement;
                      if (!container) return;
                      const containerWidth = container.getBoundingClientRect().width;
                      const viewportWidthRatio = 1 / zoomLevel;
                      const maxScroll = 1 - viewportWidthRatio;

                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        const deltaX = moveEvent.clientX - startX;
                        const deltaRatio = deltaX / containerWidth;
                        const newPosition = Math.max(0, Math.min(1, startPosition + deltaRatio / maxScroll));
                        setScrollPosition(newPosition);
                      };

                      const handleMouseUp = () => {
                        document.removeEventListener("mousemove", handleMouseMove);
                        document.removeEventListener("mouseup", handleMouseUp);
                      };

                      document.addEventListener("mousemove", handleMouseMove);
                      document.addEventListener("mouseup", handleMouseUp);
                    }}
                  >
                    {/* Grip lines */}
                    <div className="absolute inset-0 flex items-center justify-center gap-0.5 opacity-50">
                      <div className="w-px h-3 bg-current" style={{ color: "var(--primary)" }} />
                      <div className="w-px h-3 bg-current" style={{ color: "var(--primary)" }} />
                      <div className="w-px h-3 bg-current" style={{ color: "var(--primary)" }} />
                    </div>
                  </div>
                )}

                {/* Time labels */}
                <div
                  className="absolute bottom-1 left-1"
                  style={{ fontSize: "9px", color: "var(--muted-foreground)" }}
                >
                  {deployment.startTime.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}
                </div>
                <div
                  className="absolute bottom-1 right-1"
                  style={{ fontSize: "9px", color: "var(--muted-foreground)" }}
                >
                  {deployment.endTime.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Popover */}
      {hoveredEvent && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${popoverPosition.x}px`,
            top: `${popoverPosition.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div
            className="border rounded-lg p-3 shadow-lg"
            style={{
              borderColor: "var(--border)",
              borderRadius: "var(--radius)",
              backgroundColor: "var(--card)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              minWidth: "250px",
            }}
          >
            <div className="flex items-start gap-2 mb-2">
              <div
                className="size-2 rounded-full mt-1 flex-shrink-0"
                style={{
                  backgroundColor:
                    hoveredEvent.severity === "error"
                      ? "#C9190B"
                      : "#3E8635",
                }}
              />
              <div className="flex-1">
                <SmallText
                  style={{
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  {hoveredEvent.title}
                </SmallText>
                <TinyText muted className="mt-0.5">
                  {formatDate(hoveredEvent.timestamp)}
                </TinyText>
              </div>
            </div>
            <TinyText className="mb-2">
              {hoveredEvent.description}
            </TinyText>
            <div
              className="pt-2"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <TinyText muted>Affected:</TinyText>
              {hoveredEvent.affectedResources.map(
                (resource, idx) => (
                  <TinyText
                    key={idx}
                    style={{
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    {resource}
                  </TinyText>
                ),
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filtered Events & Logs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Events & Logs</SectionTitle>
          <TinyText muted>
            Showing {filteredEvents.length} of{" "}
            {allEvents.length} events
          </TinyText>
        </div>

        <div
          className="border rounded-lg overflow-hidden"
          style={{
            borderColor: "var(--border)",
            borderRadius: "var(--radius)",
          }}
        >
          <div
            className="divide-y"
            style={{ borderColor: "var(--border)" }}
          >
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="size-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{
                        backgroundColor:
                          event.severity === "error"
                            ? "#C9190B"
                            : event.severity === "warning"
                              ? "#F0AB00"
                              : "#0066CC",
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <SmallText
                          style={{
                            fontWeight:
                              "var(--font-weight-semibold)",
                          }}
                        >
                          {event.title}
                        </SmallText>
                        <TinyText muted>
                          {formatDate(event.timestamp)}
                        </TinyText>
                      </div>
                      <TinyText className="mb-2">
                        {event.description}
                      </TinyText>
                      
                      {/* Ran As field with verification shield */}
                      {event.ranAs && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <TinyText muted>Ran as:</TinyText>
                          <TinyText
                            style={{
                              fontWeight: "var(--font-weight-medium)",
                            }}
                          >
                            {event.ranAs}
                          </TinyText>
                          <VerificationShield ranAs={event.ranAs} />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <div
                          className="px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: "var(--secondary)",
                            borderRadius:
                              "calc(var(--radius) - 2px)",
                          }}
                        >
                          <TinyText
                            style={{
                              fontWeight:
                                "var(--font-weight-medium)",
                            }}
                          >
                            {event.category}
                          </TinyText>
                        </div>
                        {event.affectedResources.map(
                          (resource, idx) => (
                            <TinyText key={idx} muted>
                              {resource}
                            </TinyText>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <TinyText muted>
                  No events found matching your filters
                </TinyText>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}

// PatternFly-style status label
function StatusLabel({
  variant,
  children,
}: {
  variant: "danger" | "info" | "warning" | "success";
  children: React.ReactNode;
}) {
  const variantStyles = {
    danger: {
      color: "#C9190B",
      borderColor: "#C9190B",
      backgroundColor: "rgba(201, 25, 11, 0.05)",
    },
    info: {
      color: "#0066CC",
      borderColor: "#0066CC",
      backgroundColor: "rgba(0, 102, 204, 0.05)",
    },
    warning: {
      color: "#F0AB00",
      borderColor: "#F0AB00",
      backgroundColor: "rgba(240, 171, 0, 0.05)",
    },
    success: {
      color: "#3E8635",
      borderColor: "#3E8635",
      backgroundColor: "rgba(62, 134, 53, 0.05)",
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 border rounded"
      style={{
        borderColor: style.borderColor,
        backgroundColor: style.backgroundColor,
        borderRadius: "calc(var(--radius) - 2px)",
      }}
    >
      <div
        className="size-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: style.color }}
      />
      <TinyText
        style={{
          color: style.color,
          fontWeight: "var(--font-weight-medium)",
        }}
      >
        {children}
      </TinyText>
    </div>
  );
}

// Verification Shield Icon Component
function VerificationShield({ ranAs }: { ranAs: string }) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Determine if it's personal (strongly verified) or platform/service account (session verified)
  const isStronglyVerified = ranAs.toLowerCase().includes("personal");
  
  const tooltipText = isStronglyVerified
    ? "Strongly Verified (MFA/Signed)"
    : "Session Verified (Standard Login)";

  return (
    <div className="relative inline-block">
      <div
        className="cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {isStronglyVerified ? (
          // Filled green shield for personal
          <svg
            className="size-4"
            viewBox="0 0 16 16"
            fill="none"
            style={{ color: "#3E8635" }}
          >
            <path
              d="M8 1.5L3 3.5V7C3 10.5 5.5 13.5 8 14.5C10.5 13.5 13 10.5 13 7V3.5L8 1.5Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6.5 8L7.5 9L9.5 7"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          // Outline green shield for platform/service account
          <svg
            className="size-4"
            viewBox="0 0 16 16"
            fill="none"
            style={{ color: "#3E8635" }}
          >
            <path
              d="M8 1.5L3 3.5V7C3 10.5 5.5 13.5 8 14.5C10.5 13.5 13 10.5 13 7V3.5L8 1.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute z-50 px-2.5 py-1.5 rounded shadow-lg whitespace-nowrap pointer-events-none"
          style={{
            bottom: "calc(100% + 4px)",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "var(--popover)",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          }}
        >
          <TinyText
            style={{
              fontWeight: "var(--font-weight-medium)",
              color: "var(--popover-foreground)",
            }}
          >
            {tooltipText}
          </TinyText>
          {/* Tooltip arrow */}
          <div
            className="absolute"
            style={{
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "4px solid transparent",
              borderRight: "4px solid transparent",
              borderTop: "4px solid var(--border)",
            }}
          />
        </div>
      )}
    </div>
  );
}