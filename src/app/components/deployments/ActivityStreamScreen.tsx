import { useState } from "react";
import { useNavigate } from "react-router";
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
} from "../../../imports/UIComponents";
import { SmartphoneAuth } from "./SmartphoneAuth";
import { YamlConfirmationModal } from "./YamlConfirmationModal";

interface ActivityStreamScreenProps {
  onCreateClick: () => void;
  executionPolicy?: {
    runAs: string;
    requireManualConfirmation: boolean;
  } | null;
}

type ActivityStatus =
  | "stopped"
  | "running"
  | "soaking"
  | "active"
  | "completed"
  | "waiting";

type Activity = {
  id: string;
  action: string;
  status: ActivityStatus;
  statusColor: string;
  resource: string;
  actionTargets?: string; // e.g., "OCP 4.17 → 4.18"
  progressType: "canary" | "simple";
  canaryProgress?: {
    p1: {
      current: number;
      total: number;
      status: "complete" | "failed" | "pending" | "active";
      failedCount?: number;
    };
    soak: {
      status: "active" | "pending" | "complete" | "cancelled";
      remaining?: string;
    };
    p2: {
      current: number;
      total: number;
      status: "active" | "pending" | "complete" | "cancelled";
    };
  };
  simpleProgress?: {
    current: number;
    total: number;
    unit: string;
  };
  note?: string;
  created: string;
  drilldownAvailable?: boolean;
  labels?: string[];
};

// Suggested filter options based on table data
const suggestedFilters = [
  { label: "label:canary", count: 1 },
  { label: "region:us-north", count: 1 },
  { label: "region:eu-west", count: 1 },
  { label: "env=prod", count: 1 },
  { label: "OpenShift cluster update", count: 1 },
  { label: "Security Policy", count: 1 },
  { label: "VM Migration", count: 1 },
  { label: "Failed", count: 1 },
];

export function ActivityStreamScreen({
  onCreateClick,
  executionPolicy,
}: ActivityStreamScreenProps) {
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState("Production");
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<
    string[]
  >([]);
  const [selectedRows, setSelectedRows] = useState<string[]>(
    [],
  );
  const [showSmartphoneAuth, setShowSmartphoneAuth] = useState(false);
  const [showYamlConfirmation, setShowYamlConfirmation] = useState(false);
  const [hasAuthorized, setHasAuthorized] = useState(false);

  // New deployment data - always starts as "waiting"
  const newDeploymentData: Activity = {
    id: "fleet-upgrade-new",
    action: "OpenShift cluster update",
    status: "waiting",
    statusColor: "#3E8635", // Green - nothing wrong, waiting as expected
    resource: "env=prod (40)",
    actionTargets: "OCP 4.17 → 4.18",
    progressType: "canary",
    canaryProgress: {
      p1: { current: 0, total: 10, status: "pending" },
      soak: { status: "pending" },
      p2: { current: 0, total: 30, status: "pending" },
    },
    note: "Waiting on scheduled execution window",
    created: "Mar 27, 2026 10:15",
    drilldownAvailable: false,
    labels: ["env=prod", "OpenShift cluster update"],
  };

  const [activities, setActivities] = useState<Activity[]>([
    ...(executionPolicy ? [newDeploymentData] : []),
    {
      id: "fleet-upgrade-001",
      action: "OpenShift cluster update",
      status: "stopped",
      statusColor: "#C9190B",
      resource: "label:canary (40)",
      actionTargets: "OCP 4.16 → 4.17",
      progressType: "canary",
      canaryProgress: {
        p1: {
          current: 10,
          total: 10,
          status: "failed",
          failedCount: 6,
        },
        soak: { status: "cancelled" },
        p2: { current: 0, total: 30, status: "cancelled" },
      },
      note: "Ingress timeout",
      created: "Mar 26, 2026 22:00",
      drilldownAvailable: true,
      labels: [
        "label:canary",
        "OpenShift cluster update",
        "Failed",
      ],
    },
    {
      id: "security-policy-002",
      action: "Security Policy",
      status: "running",
      statusColor: "#3E8635", // Green - active/in-progress
      resource: "region:us-north (50)",
      actionTargets: "PCI-DSS v3.2 → v4.0",
      progressType: "simple",
      simpleProgress: {
        current: 10,
        total: 50,
        unit: "compliant",
      },
      created: "Mar 25, 2026 18:30",
      labels: ["region:us-north", "Security Policy"],
    },
    {
      id: "vm-migration-003",
      action: "VM Migration",
      status: "soaking",
      statusColor: "#3E8635", // Green - nothing wrong, soaking as expected
      resource: "region:eu-west (25)",
      actionTargets: "ESXi 7.0 → 8.0",
      progressType: "canary",
      canaryProgress: {
        p1: { current: 5, total: 5, status: "complete" },
        soak: { status: "active", remaining: "4h" },
        p2: { current: 0, total: 20, status: "pending" },
      },
      created: "Mar 25, 2026 14:00",
      labels: ["region:eu-west", "VM Migration"],
    },
    {
      id: "fleet-patch-004",
      action: "Fleet Patch",
      status: "active",
      statusColor: "#3E8635",
      resource: "env=prod (100)",
      actionTargets: "CVE-2026-1234 fix",
      progressType: "simple",
      simpleProgress: { current: 15, total: 100, unit: "done" },
      created: "Mar 24, 2026 20:00",
      labels: ["env=prod", "Fleet Patch"],
    },
  ]);

  const workspaces = [
    "Production",
    "Staging",
    "Development",
    "QA",
  ];

  const handleRowClick = (activity: Activity) => {
    if (activity.drilldownAvailable) {
      navigate(`/deployments/${activity.id}`, {
        state: { executionPolicy },
      });
    }
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter],
    );
  };

  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id)
        ? prev.filter((rowId) => rowId !== id)
        : [...prev, id],
    );
  };

  const getStatusLabel = (status: ActivityStatus): string => {
    switch (status) {
      case "stopped":
        return "Failed";
      case "completed":
        return "Complete";
      case "running":
      case "soaking":
      case "active":
      case "waiting":
        return "In Progress";
      default:
        return status;
    }
  };

  // Sort priority: errors/stopped first, then by status urgency
  const getStatusPriority = (status: ActivityStatus): number => {
    switch (status) {
      case "stopped":
        return 0; // Errors at top
      case "running":
        return 1;
      case "active":
        return 2;
      case "soaking":
        return 3;
      case "waiting":
        return 4;
      case "completed":
        return 5;
      default:
        return 6;
    }
  };

  // Sorted activities - errors first
  const sortedActivities = [...activities].sort(
    (a, b) => getStatusPriority(a.status) - getStatusPriority(b.status),
  );

  const getStatusVariant = (
    status: ActivityStatus,
  ): "danger" | "info" | "warning" | "success" => {
    switch (status) {
      case "stopped":
        return "danger"; // Red - failed/error state
      case "running":
      case "soaking":
      case "active":
      case "completed":
      case "waiting":
        return "success"; // Green - all active/in-progress states
      default:
        return "success";
    }
  };

  const handleFastForward = () => {
    // Check if execution policy requires personal authorization
    if (executionPolicy?.runAs === "Personal (Adi Cluster Admin)" && !hasAuthorized) {
      setShowSmartphoneAuth(true);
    } else if (executionPolicy?.requireManualConfirmation) {
      // If manual confirmation is required but no personal auth needed, show YAML modal directly
      setShowYamlConfirmation(true);
    } else {
      // No auth or confirmation needed - just start the deployment
      startDeployment();
    }
  };

  const handleAuthorize = () => {
    setHasAuthorized(true);
    setShowSmartphoneAuth(false);
    // Check if manual confirmation is required
    if (executionPolicy?.requireManualConfirmation) {
      setShowYamlConfirmation(true);
    } else {
      startDeployment();
    }
  };

  const handleYamlAccept = () => {
    setShowYamlConfirmation(false);
    startDeployment();
  };

  const handleYamlDecline = () => {
    setShowYamlConfirmation(false);
    // Mark deployment as failed due to declining changes
    setActivities(prevActivities => {
      const updated = [...prevActivities];
      if (updated[0] && updated[0].id === "fleet-upgrade-new") {
        updated[0] = {
          ...updated[0],
          status: "stopped",
          statusColor: "#C9190B",
          note: "Changes not confirmed",
          canaryProgress: {
            p1: { current: 0, total: 10, status: "failed", failedCount: 0 },
            soak: { status: "pending" },
            p2: { current: 0, total: 30, status: "pending" },
          },
        };
      }
      return updated;
    });
  };

  const startDeployment = () => {
    // Update the first activity to running status with P1 in progress
    setActivities(prevActivities => {
      const updated = [...prevActivities];
      if (updated[0] && updated[0].id === "fleet-upgrade-new") {
        updated[0] = {
          ...updated[0],
          status: "running",
          statusColor: "#3E8635", // Green - active/in-progress
          note: undefined,
          canaryProgress: {
            p1: { current: 2, total: 10, status: "active" },
            soak: { status: "pending" },
            p2: { current: 0, total: 30, status: "pending" },
          },
        };
      }
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div
        className="border rounded-lg p-4"
        style={{
          borderColor: "var(--border)",
          borderRadius: "var(--radius)",
          backgroundColor: "var(--background)",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 20 20"
                style={{ color: "var(--muted-foreground)" }}
              >
                <path
                  d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4.35-4.35"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search and filter by any label or keyword"
              className="w-full pl-10 pr-4 py-2.5 border rounded"
              style={{
                borderRadius: "var(--radius)",
                borderColor: "var(--border)",
                fontFamily: "var(--font-family-text)",
                fontSize: "var(--text-sm)",
                color: "var(--foreground)",
                backgroundColor: "var(--background)",
              }}
            />

            {/* Suggested Filters Dropdown */}
            {isSearchFocused && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsSearchFocused(false)}
                />
                <div
                  className="absolute top-full left-0 right-0 mt-2 border rounded-lg overflow-hidden z-20"
                  style={{
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                    backgroundColor: "var(--card)",
                    boxShadow:
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  }}
                >
                  <div
                    className="px-4 py-2"
                    style={{
                      backgroundColor: "var(--secondary)",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <TinyText
                      style={{
                        fontWeight: "var(--font-weight-medium)",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      Suggested filters
                    </TinyText>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {suggestedFilters.map((filter) => (
                      <button
                        key={filter.label}
                        onClick={() => {
                          toggleFilter(filter.label);
                        }}
                        className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-secondary transition-colors"
                        style={{
                          borderBottom:
                            "1px solid var(--border)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="size-4 border rounded flex items-center justify-center"
                            style={{
                              borderColor:
                                selectedFilters.includes(
                                  filter.label,
                                )
                                  ? "var(--primary)"
                                  : "var(--border)",
                              backgroundColor:
                                selectedFilters.includes(
                                  filter.label,
                                )
                                  ? "var(--primary)"
                                  : "transparent",
                              borderRadius:
                                "calc(var(--radius) - 2px)",
                            }}
                          >
                            {selectedFilters.includes(
                              filter.label,
                            ) && (
                              <svg
                                className="size-3"
                                fill="none"
                                viewBox="0 0 12 12"
                                style={{
                                  color:
                                    "var(--primary-foreground)",
                                }}
                              >
                                <path
                                  d="M10 3L4.5 8.5L2 6"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                          <SmallText
                            style={{
                              fontWeight:
                                "var(--font-weight-medium)",
                            }}
                          >
                            {filter.label}
                          </SmallText>
                        </div>
                        <div
                          className="px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: "var(--secondary)",
                            borderRadius:
                              "calc(var(--radius) - 2px)",
                          }}
                        >
                          <TinyText muted>
                            {filter.count}
                          </TinyText>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Workspace Dropdown */}
          <div className="relative">
            <button
              onClick={() =>
                setIsWorkspaceOpen(!isWorkspaceOpen)
              }
              className="flex items-center gap-2 px-4 py-2.5 border rounded hover:bg-secondary transition-colors"
              style={{
                borderRadius: "var(--radius)",
                borderColor: "var(--border)",
                backgroundColor: "var(--background)",
              }}
            >
              <SmallText
                style={{
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                Workspace:
              </SmallText>
              <SmallText>{workspace}</SmallText>
              <svg
                className="size-4 transition-transform"
                fill="none"
                viewBox="0 0 16 16"
                style={{
                  transform: isWorkspaceOpen
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  color: "var(--muted-foreground)",
                }}
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {isWorkspaceOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsWorkspaceOpen(false)}
                />
                <div
                  className="absolute top-full right-0 mt-2 w-48 border rounded-lg overflow-hidden z-20"
                  style={{
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                    backgroundColor: "var(--card)",
                    boxShadow:
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  }}
                >
                  {workspaces.map((ws) => (
                    <button
                      key={ws}
                      onClick={() => {
                        setWorkspace(ws);
                        setIsWorkspaceOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-secondary transition-colors"
                      style={{
                        backgroundColor:
                          workspace === ws
                            ? "var(--secondary)"
                            : "transparent",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <SmallText
                        style={{
                          fontWeight:
                            workspace === ws
                              ? "var(--font-weight-medium)"
                              : "var(--font-weight-normal)",
                        }}
                      >
                        {ws}
                      </SmallText>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Create Button */}
          <PrimaryButton onClick={onCreateClick}>
            Create deployment
          </PrimaryButton>
        </div>

        {/* Active Filters */}
        {selectedFilters.length > 0 && (
          <div
            className="flex items-center gap-2 mt-3 pt-3"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <TinyText muted>Active filters:</TinyText>
            {selectedFilters.map((filter) => (
              <div
                key={filter}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded"
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
                  {filter}
                </TinyText>
                <button
                  onClick={() => toggleFilter(filter)}
                  className="hover:bg-muted rounded p-0.5"
                  style={{
                    borderRadius: "calc(var(--radius) - 4px)",
                  }}
                >
                  <svg
                    className="size-3"
                    fill="none"
                    viewBox="0 0 12 12"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <path
                      d="M9 3L3 9M3 3L9 9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={() => setSelectedFilters([])}
              className="ml-2"
              style={{
                fontFamily: "var(--font-family-text)",
                fontSize: "var(--text-xs)",
                color: "var(--primary)",
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Fleet Insights Panel */}
      <div className="grid grid-cols-6 gap-4">
        {/* Fleet Health */}
        <div
          className="border rounded-lg p-4"
          style={{
            borderColor: "var(--border)",
            borderRadius: "var(--radius)",
            backgroundColor: "var(--card)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="size-8 rounded flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: "rgba(62, 134, 53, 0.1)",
                borderRadius: "calc(var(--radius) - 2px)",
              }}
            >
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 20 20"
                style={{ color: "#3E8635" }}
              >
                <path
                  d="M16.5 10C16.5 13.5899 13.5899 16.5 10 16.5C6.41015 16.5 3.5 13.5899 3.5 10C3.5 6.41015 6.41015 3.5 10 3.5C13.5899 3.5 16.5 6.41015 16.5 10Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M7 10L9 12L13 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div className="mb-1">
            <div
              style={{
                fontFamily: "var(--font-family-display)",
                fontSize: "var(--text-2xl)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--foreground)",
              }}
            >
              98.2%
            </div>
          </div>
          <TinyText style={{ color: "var(--foreground)" }}>
            Fleet health
          </TinyText>
          <div
            className="mt-2 pt-2"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <TinyText
              style={{
                color: "var(--foreground)",
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              245/250 healthy
            </TinyText>
          </div>
        </div>

        {/* Active Rollouts */}
        <div
          className="border rounded-lg p-4"
          style={{
            borderColor: "var(--border)",
            borderRadius: "var(--radius)",
            backgroundColor: "var(--card)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="size-8 rounded flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: "rgba(62, 134, 53, 0.1)",
                borderRadius: "calc(var(--radius) - 2px)",
              }}
            >
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 20 20"
                style={{ color: "#3E8635" }}
              >
                <path
                  d="M10 3V10L14 14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="10"
                  cy="10"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>
          <div className="mb-1">
            <div
              style={{
                fontFamily: "var(--font-family-display)",
                fontSize: "var(--text-2xl)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--foreground)",
              }}
            >
              4
            </div>
          </div>
          <TinyText style={{ color: "var(--foreground)" }}>
            Active rollouts
          </TinyText>
          <div
            className="mt-2 pt-2"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <TinyText
              style={{
                color: "var(--foreground)",
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              2 in P1, 1 soaking
            </TinyText>
          </div>
        </div>

        {/* VM Migrations */}
        <div
          className="border rounded-lg p-4"
          style={{
            borderColor: "var(--border)",
            borderRadius: "var(--radius)",
            backgroundColor: "var(--card)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="size-8 rounded flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: "rgba(62, 134, 53, 0.1)",
                borderRadius: "calc(var(--radius) - 2px)",
              }}
            >
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 20 20"
                style={{ color: "#3E8635" }}
              >
                <path
                  d="M3.5 10H16.5M16.5 10L12.5 6M16.5 10L12.5 14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div className="mb-1">
            <div
              style={{
                fontFamily: "var(--font-family-display)",
                fontSize: "var(--text-2xl)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--foreground)",
              }}
            >
              5/25
            </div>
          </div>
          <TinyText style={{ color: "var(--foreground)" }}>
            VM migrations
          </TinyText>
          <div
            className="mt-2 pt-2"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <TinyText
              style={{
                color: "var(--foreground)",
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              20% complete
            </TinyText>
          </div>
        </div>

        {/* GitOps Sync */}
        <div
          className="border rounded-lg p-4"
          style={{
            borderColor: "var(--border)",
            borderRadius: "var(--radius)",
            backgroundColor: "var(--card)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="size-8 rounded flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: "rgba(62, 134, 53, 0.1)",
                borderRadius: "calc(var(--radius) - 2px)",
              }}
            >
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 20 20"
                style={{ color: "#3E8635" }}
              >
                <path
                  d="M16.5 6.5L8.5 14.5L4.5 10.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div className="mb-1">
            <div
              style={{
                fontFamily: "var(--font-family-display)",
                fontSize: "var(--text-2xl)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--foreground)",
              }}
            >
              Synced
            </div>
          </div>
          <TinyText style={{ color: "var(--foreground)" }}>
            GitOps status
          </TinyText>
          <div
            className="mt-2 pt-2"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <TinyText
              style={{
                color: "var(--foreground)",
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              All repos in sync
            </TinyText>
          </div>
        </div>

        {/* Compliance Drift */}
        <div
          className="border rounded-lg p-4"
          style={{
            borderColor: "var(--border)",
            borderRadius: "var(--radius)",
            backgroundColor: "var(--card)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="size-8 rounded flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: "rgba(201, 25, 11, 0.1)",
                borderRadius: "calc(var(--radius) - 2px)",
              }}
            >
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 20 20"
                style={{ color: "#C9190B" }}
              >
                <path
                  d="M10 6V11M10 14V14.01"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 3.5L16.5 16.5H3.5L10 3.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div className="mb-1">
            <div
              style={{
                fontFamily: "var(--font-family-display)",
                fontSize: "var(--text-2xl)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--foreground)",
              }}
            >
              12
            </div>
          </div>
          <TinyText style={{ color: "var(--foreground)" }}>
            Compliance drift
          </TinyText>
          <div
            className="mt-2 pt-2"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <TinyText
              style={{
                color: "var(--foreground)",
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              Action required
            </TinyText>
          </div>
        </div>

        {/* Add-ons */}
        <div
          className="border rounded-lg p-4"
          style={{
            borderColor: "var(--border)",
            borderRadius: "var(--radius)",
            backgroundColor: "var(--card)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="size-8 rounded flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: "rgba(138, 141, 144, 0.1)",
                borderRadius: "calc(var(--radius) - 2px)",
              }}
            >
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 20 20"
                style={{ color: "#8A8D90" }}
              >
                <rect
                  x="3.5"
                  y="3.5"
                  width="6"
                  height="6"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <rect
                  x="10.5"
                  y="3.5"
                  width="6"
                  height="6"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <rect
                  x="3.5"
                  y="10.5"
                  width="6"
                  height="6"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <rect
                  x="10.5"
                  y="10.5"
                  width="6"
                  height="6"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>
          <div className="mb-1">
            <div
              style={{
                fontFamily: "var(--font-family-display)",
                fontSize: "var(--text-2xl)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--foreground)",
              }}
            >
              18/20
            </div>
          </div>
          <TinyText style={{ color: "var(--foreground)" }}>
            Add-ons ready
          </TinyText>
          <div
            className="mt-2 pt-2"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <TinyText
              style={{
                color: "var(--foreground)",
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              2 updating
            </TinyText>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {selectedRows.length > 0 && (
        <div
          className="flex items-center gap-3 p-4 border rounded-lg"
          style={{
            borderColor: "var(--border)",
            borderRadius: "var(--radius)",
            backgroundColor: "var(--secondary)",
          }}
        >
          <SmallText
            style={{ fontWeight: "var(--font-weight-medium)" }}
          >
            {selectedRows.length} selected
          </SmallText>
          <div className="flex items-center gap-2 ml-auto">
            <SecondaryButton
              onClick={() => console.log("Stop")}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 16 16"
                >
                  <rect
                    x="4"
                    y="4"
                    width="8"
                    height="8"
                    rx="1"
                    fill="currentColor"
                  />
                </svg>
                <span>Stop</span>
              </div>
            </SecondaryButton>
            <SecondaryButton
              onClick={() => console.log("Restart")}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8C14 11.3137 11.3137 14 8 14C6.13623 14 4.5 13.0932 3.5 11.7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M3.5 14V11.5H6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Restart</span>
              </div>
            </SecondaryButton>
            <SecondaryButton
              onClick={() => console.log("Delete")}
            >
              <div
                className="flex items-center gap-2"
                style={{ color: "var(--destructive)" }}
              >
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M2 4H14M6 4V2.5C6 2.22386 6.22386 2 6.5 2H9.5C9.77614 2 10 2.22386 10 2.5V4M12.5 4V13.5C12.5 13.7761 12.2761 14 12 14H4C3.72386 14 3.5 13.7761 3.5 13.5V4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Delete</span>
              </div>
            </SecondaryButton>
          </div>
        </div>
      )}

      {/* Activity Table */}
      <div
        className="border rounded-lg overflow-hidden"
        style={{
          borderColor: "var(--border)",
          borderRadius: "var(--radius)",
        }}
      >
        <table className="w-full">
          <thead
            style={{ backgroundColor: "var(--secondary)" }}
          >
            <tr>
              <th
                className="text-left px-4 py-3 w-12"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <input
                  type="checkbox"
                  checked={
                    selectedRows.length === activities.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRows(
                        activities.map((a) => a.id),
                      );
                    } else {
                      setSelectedRows([]);
                    }
                  }}
                  className="size-4"
                  style={{ cursor: "pointer" }}
                />
              </th>
              <th
                className="text-left px-4 py-3"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <SmallText
                  style={{
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  Action
                </SmallText>
              </th>
              <th
                className="text-left px-4 py-3"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <SmallText
                  style={{
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  Action Targets
                </SmallText>
              </th>
              <th
                className="text-left px-4 py-3"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <SmallText
                  style={{
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  Status
                </SmallText>
              </th>
              <th
                className="text-left px-4 py-3"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <SmallText
                  style={{
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  Resource
                </SmallText>
              </th>
              <th
                className="text-left px-4 py-3"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <SmallText
                  style={{
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  Progress
                </SmallText>
              </th>
              <th
                className="text-left px-4 py-3"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <SmallText
                  style={{
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  Note
                </SmallText>
              </th>
              <th
                className="text-left px-4 py-3"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <SmallText
                  style={{
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  Created
                </SmallText>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedActivities.map((activity) => (
              <tr
                key={activity.id}
                onClick={() => handleRowClick(activity)}
                className={`border-t transition-colors ${activity.drilldownAvailable ? "cursor-pointer hover:bg-secondary" : ""}`}
                style={{ borderColor: "var(--border)" }}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(activity.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleRowSelection(activity.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="size-4"
                    style={{ cursor: "pointer" }}
                  />
                </td>
                <td className="px-4 py-3">
                  <SmallText
                    style={{
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    {activity.action}
                  </SmallText>
                </td>
                <td className="px-4 py-3">
                  <SmallText
                    className="font-mono"
                    style={{
                      color: "var(--muted-foreground)",
                      fontSize: "var(--text-xs)",
                    }}
                  >
                    {activity.actionTargets || "—"}
                  </SmallText>
                </td>
                <td className="px-4 py-3">
                  <StatusLabel
                    status={activity.status}
                    variant={getStatusVariant(activity.status)}
                  >
                    {getStatusLabel(activity.status)}
                  </StatusLabel>
                </td>
                <td className="px-4 py-3">
                  <SmallText>{activity.resource}</SmallText>
                </td>
                <td className="px-4 py-3">
                  {activity.progressType === "canary" &&
                  activity.canaryProgress ? (
                    <CanaryProgressStepper
                      progress={activity.canaryProgress}
                    />
                  ) : activity.progressType === "simple" &&
                    activity.simpleProgress ? (
                    <SmallText>
                      {activity.simpleProgress.current}/
                      {activity.simpleProgress.total}{" "}
                      {activity.simpleProgress.unit}
                    </SmallText>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  {activity.note && (
                    <div className="flex items-center gap-2">
                      <SmallText>{activity.note}</SmallText>
                      {activity.drilldownAvailable && (
                        <button
                          className="hover:underline"
                          style={{
                            fontFamily:
                              "var(--font-family-text)",
                            fontSize: "var(--text-sm)",
                            fontWeight:
                              "var(--font-weight-medium)",
                            color: "var(--primary)",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/deployments/${activity.id}`,
                            );
                          }}
                        >
                          [View drilldown]
                        </button>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <SmallText muted>
                    {activity.created}
                  </SmallText>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fast Forward Button - Only show if there's a waiting deployment */}
      {executionPolicy && activities.length > 0 && activities[0].status === "waiting" && (
        <div className="mt-4 flex justify-start">
          <button
            onClick={handleFastForward}
            className="px-4 py-2 rounded inline-flex items-center gap-2 transition-all hover:shadow-md"
            style={{
              backgroundColor: '#E7F1FA',
              color: '#0066CC',
              fontFamily: 'var(--font-family-text)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              borderRadius: 'var(--radius)',
              border: '1px solid #0066CC',
              cursor: 'pointer',
            }}
          >
            <svg className="size-4" fill="none" viewBox="0 0 16 16" style={{ color: '#0066CC' }}>
              <path
                d="M2 4L8 8L2 12V4Z"
                fill="currentColor"
              />
              <path
                d="M8 4L14 8L8 12V4Z"
                fill="currentColor"
              />
            </svg>
            Fast forward to execution window
          </button>
        </div>
      )}

      {/* Smartphone Authorization Modal */}
      {showSmartphoneAuth && (
        <SmartphoneAuth onAuthorize={handleAuthorize} />
      )}

      {/* Yaml Confirmation Modal */}
      {showYamlConfirmation && (
        <YamlConfirmationModal
          onAccept={handleYamlAccept}
          onDecline={handleYamlDecline}
          clusterCount={40}
        />
      )}
    </div>
  );
}

// PatternFly-style status label with outline
function StatusLabel({
  status,
  variant,
  children,
}: {
  status: ActivityStatus;
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

// Compact canary rollout progress stepper
function CanaryProgressStepper({
  progress,
}: {
  progress: {
    p1: {
      current: number;
      total: number;
      status: "complete" | "failed" | "pending" | "active";
      failedCount?: number;
    };
    soak: {
      status: "active" | "pending" | "complete" | "cancelled";
      remaining?: string;
    };
    p2: {
      current: number;
      total: number;
      status: "active" | "pending" | "complete" | "cancelled";
    };
  };
}) {
  const getStepColor = (status: string, isFailed?: boolean, isCancelled?: boolean) => {
    if (isFailed) return "#C9190B"; // Red - failed
    if (isCancelled) return "var(--muted-foreground)"; // Grey - cancelled
    if (status === "complete") return "#3E8635"; // Green
    if (status === "active") return "#3E8635"; // Green - active is also green
    if (status === "cancelled") return "var(--muted-foreground)"; // Grey - cancelled
    return "var(--muted-foreground)"; // Pending
  };

  const p1Failed = progress.p1.status === "failed";

  return (
    <div>
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-2">
        {/* P1 */}
        <div className="flex items-center gap-1.5">
          <div
            className="size-5 rounded-full border-2 flex items-center justify-center"
            style={{
              borderColor: getStepColor(
                progress.p1.status,
                p1Failed,
              ),
              backgroundColor:
                progress.p1.status !== "pending"
                  ? getStepColor(progress.p1.status, p1Failed)
                  : "transparent",
            }}
          >
            {progress.p1.status === "complete" ? (
              <svg
                className="size-3"
                fill="none"
                viewBox="0 0 12 12"
                style={{ color: "white" }}
              >
                <path
                  d="M10 3L4.5 8.5L2 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : progress.p1.status === "failed" ? (
              <svg
                className="size-3"
                fill="none"
                viewBox="0 0 12 12"
                style={{ color: "white" }}
              >
                <path
                  d="M9 3L3 9M3 3L9 9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : progress.p1.status === "active" ? (
              <div
                className="size-2 rounded-full"
                style={{ backgroundColor: "white" }}
              />
            ) : null}
          </div>
          <TinyText
            style={{
              fontWeight: "var(--font-weight-medium)",
              color: getStepColor(progress.p1.status, p1Failed),
            }}
          >
            P1
          </TinyText>
        </div>

        {/* Connector */}
        <div
          className="w-4 h-0.5"
          style={{
            backgroundColor:
              progress.p1.status === "complete"
                ? "#3E8635"
                : "var(--border)",
          }}
        />

        {/* Soak */}
        <div className="flex items-center gap-1.5">
          <div
            className="size-5 rounded-full border-2 flex items-center justify-center"
            style={{
              borderColor: getStepColor(progress.soak.status),
              backgroundColor:
                progress.soak.status !== "pending" && progress.soak.status !== "cancelled"
                  ? getStepColor(progress.soak.status)
                  : "transparent",
            }}
          >
            {progress.soak.status === "complete" && (
              <svg
                className="size-3"
                fill="none"
                viewBox="0 0 12 12"
                style={{ color: "white" }}
              >
                <path
                  d="M10 3L4.5 8.5L2 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {progress.soak.status === "active" && (
              <div
                className="size-2 rounded-full"
                style={{ backgroundColor: "white" }}
              />
            )}
            {progress.soak.status === "cancelled" && (
              <svg
                className="size-3"
                fill="none"
                viewBox="0 0 12 12"
                style={{ color: "var(--muted-foreground)" }}
              >
                <path
                  d="M9 3L3 9M3 3L9 9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <TinyText
            style={{
              fontWeight: "var(--font-weight-medium)",
              color: getStepColor(progress.soak.status),
            }}
          >
            {progress.soak.status === "cancelled" ? "Cancelled" : "Soak"}
          </TinyText>
        </div>

        {/* Connector */}
        <div
          className="w-4 h-0.5"
          style={{
            backgroundColor:
              progress.soak.status === "complete"
                ? "#3E8635"
                : "var(--border)",
          }}
        />

        {/* P2 */}
        <div className="flex items-center gap-1.5">
          <div
            className="size-5 rounded-full border-2 flex items-center justify-center"
            style={{
              borderColor: getStepColor(progress.p2.status),
              backgroundColor:
                progress.p2.status !== "pending" && progress.p2.status !== "cancelled"
                  ? getStepColor(progress.p2.status)
                  : "transparent",
            }}
          >
            {progress.p2.status === "complete" && (
              <svg
                className="size-3"
                fill="none"
                viewBox="0 0 12 12"
                style={{ color: "white" }}
              >
                <path
                  d="M10 3L4.5 8.5L2 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {progress.p2.status === "active" && (
              <div
                className="size-2 rounded-full"
                style={{ backgroundColor: "white" }}
              />
            )}
            {progress.p2.status === "cancelled" && (
              <svg
                className="size-3"
                fill="none"
                viewBox="0 0 12 12"
                style={{ color: "var(--muted-foreground)" }}
              >
                <path
                  d="M9 3L3 9M3 3L9 9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <TinyText
            style={{
              fontWeight: "var(--font-weight-medium)",
              color: getStepColor(progress.p2.status),
            }}
          >
            {progress.p2.status === "cancelled" ? "Cancelled" : "P2"}
          </TinyText>
        </div>
      </div>

      {/* Status Messages */}
      <div>
        <TinyText muted>
          {p1Failed &&
            `Canary: ${progress.p1.failedCount}/${progress.p1.total} Failed`}
          {progress.p1.status === "complete" &&
            !p1Failed &&
            `Canary: Complete`}
          {progress.p1.status === "active" &&
            `Canary: ${progress.p1.current}/${progress.p1.total}`}
          {progress.soak.status === "active" &&
            progress.soak.remaining &&
            `, Soak: ${progress.soak.remaining} remaining`}
          {progress.soak.status === "pending" &&
            ", Soak: Pending"}
          {progress.soak.status === "cancelled" &&
            " → Soak: Cancelled"}
          {progress.p2.status === "pending" && ", Fleet: Pending"}
          {progress.p2.status === "active" &&
            `, Fleet: ${progress.p2.current}/${progress.p2.total}`}
          {progress.p2.status === "cancelled" &&
            " → Fleet: Cancelled"}
        </TinyText>
      </div>
    </div>
  );
}