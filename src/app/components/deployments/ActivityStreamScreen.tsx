import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { Tooltip } from "@patternfly/react-core";
import "@patternfly/react-core/dist/styles/base-no-reset.css";
import {
  PageTitle,
  SectionTitle,
  BodyText,
  SmallText,
  TinyText,
  Container,
  SecondaryButton,
  Badge,
  Card,
} from "../../../imports/UIComponents";
import { SmartphoneAuth } from "./SmartphoneAuth";
import { YamlConfirmationModal } from "./YamlConfirmationModal";
import {
  DEPLOYMENT_TAB_ORDER,
  filterDeploymentsByTab,
  type DeploymentResourceCategory,
  type DeploymentTabId,
} from "./deploymentTabPresets";
import {
  CreateDeploymentSplitButton,
  type OpenDeploymentWizardOptions,
} from "./CreateDeploymentSplitButton";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

/** Stops tab / button activation so the help icon only opens the tooltip. */
function stopActivation(e: React.SyntheticEvent) {
  e.stopPropagation();
}

function AreaTabScopeHelpTip({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <Tooltip
      content={
        <div className="max-w-sm text-left text-xs leading-snug">{description}</div>
      }
      position="top"
    >
      <span
        className="inline-flex cursor-default align-middle"
        tabIndex={-1}
        role="img"
        aria-label={`How deployments are categorized: ${label}`}
        onPointerDown={stopActivation}
        onClick={stopActivation}
      >
        <HelpCircle
          className="size-3.5 shrink-0 opacity-60"
          style={{ color: "var(--muted-foreground)" }}
          aria-hidden
        />
      </span>
    </Tooltip>
  );
}

interface ActivityStreamScreenProps {
  onCreateDeployment: (opts: OpenDeploymentWizardOptions) => void;
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
  /** Which Deployments tab lists this row */
  resourceCategory: DeploymentResourceCategory;
  /** Historical / completed rows — shown in Archive view */
  archived?: boolean;
  /** Sort key for “last updated” (prototype) */
  updatedAtMs: number;
  /** How the rollout was initiated — GitOps vs console wizard */
  gitopsSource?: "wizard" | "gitops-sync";
};

type SourceFilter = "all" | "console" | "gitops" | "governance";

function matchesSourceFilter(
  a: Activity,
  f: SourceFilter,
): boolean {
  if (f === "all") return true;
  if (f === "gitops") return a.gitopsSource === "gitops-sync";
  if (f === "governance")
    return a.resourceCategory === "governance";
  if (f === "console") {
    return (
      a.gitopsSource === "wizard" && a.resourceCategory !== "governance"
    );
  }
  return true;
}

function parseClusterScope(resource: string): number | null {
  const m = resource.match(/\((\d+)\)/);
  return m ? parseInt(m[1], 10) : null;
}

/** Human-readable progress for an in-flight deployment (prototype). */
function summarizeRolloutProgress(a: Activity): string {
  if (a.progressType === "simple" && a.simpleProgress) {
    const { current, total, unit } = a.simpleProgress;
    return `${current}/${total} ${unit}`;
  }
  if (a.canaryProgress) {
    const cp = a.canaryProgress;
    if (cp.p1.status === "active") {
      return `Canary phase ${cp.p1.current}/${cp.p1.total} clusters`;
    }
    if (cp.soak.status === "active") {
      return cp.soak.remaining
        ? `Soak · ${cp.soak.remaining} left`
        : "Soak in progress";
    }
    if (cp.p2.status === "active") {
      return `Full rollout ${cp.p2.current}/${cp.p2.total} clusters`;
    }
    if (cp.p1.status === "complete" && cp.soak.status === "pending") {
      return "Canary complete · soak next";
    }
  }
  return "In progress";
}

type GitOpsRepoRow = {
  name: string;
  branch: string;
  revision: string;
  status: "synced" | "out_of_sync" | "progressing";
  age: string;
  detail?: string;
};

/** Static GitOps detail for the prototype (one repo intentionally needs attention). */
const GITOPS_REPO_DETAIL: GitOpsRepoRow[] = [
  {
    name: "fleet-gitops",
    branch: "main",
    revision: "a1b2c3d",
    status: "synced",
    age: "3m ago",
  },
  {
    name: "cluster-apps",
    branch: "main",
    revision: "e4f5a6b",
    status: "synced",
    age: "3m ago",
  },
  {
    name: "policy-baselines",
    branch: "release-4.17",
    revision: "9aa12ff",
    status: "synced",
    age: "12m ago",
  },
  {
    name: "observability",
    branch: "main",
    revision: "77d9012",
    status: "out_of_sync",
    age: "1h ago",
    detail: "1 manifest diff vs cluster",
  },
];

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

/** How many items to show in Summary detail lists before +more */
const SNAPSHOT_LIST_CAP = 3;

export function ActivityStreamScreen({
  onCreateDeployment,
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
  const [deploymentOverviewExpanded, setDeploymentOverviewExpanded] =
    useState(false);
  const [activeTab, setActiveTab] =
    useState<DeploymentTabId>("all");
  const [listScope, setListScope] = useState<"active" | "archive">(
    "active",
  );
  const [quickFilter, setQuickFilter] = useState<
    | null
    | "failed"
    | "in_progress"
    | "soaking"
    | "waiting"
    | "gitops"
    | "phased"
  >(null);
  const [sortMode, setSortMode] = useState<"priority" | "recent">(
    "priority",
  );
  /** How the run is driven: console wizard vs GitOps vs policy/governance (ACM) */
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

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
    resourceCategory: "cluster",
    archived: false,
    updatedAtMs: Date.parse("2026-03-27T10:15:00"),
    gitopsSource: "wizard",
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
      resourceCategory: "cluster",
      archived: false,
      updatedAtMs: Date.parse("2026-03-26T22:00:00"),
      gitopsSource: "wizard",
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
      resourceCategory: "governance",
      archived: false,
      updatedAtMs: Date.parse("2026-03-25T18:30:00"),
      gitopsSource: "wizard",
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
      resourceCategory: "virtual_machine",
      archived: false,
      updatedAtMs: Date.parse("2026-03-25T14:00:00"),
      gitopsSource: "wizard",
    },
    {
      id: "fleet-patch-004",
      action: "Fleet Patch",
      status: "completed",
      statusColor: "#3E8635",
      resource: "env=prod (100)",
      actionTargets: "CVE-2026-1234 fix",
      progressType: "simple",
      simpleProgress: { current: 100, total: 100, unit: "done" },
      created: "Mar 24, 2026 20:00",
      labels: ["env=prod", "Fleet Patch"],
      resourceCategory: "cluster",
      archived: true,
      updatedAtMs: Date.parse("2026-03-24T20:00:00"),
      gitopsSource: "wizard",
    },
    {
      id: "argocd-app-rollout-005",
      action: "Argo CD application sync",
      status: "running",
      statusColor: "#3E8635",
      resource: "app=storefront (8)",
      actionTargets: "chart 2.4.1 → 2.5.0",
      progressType: "simple",
      simpleProgress: {
        current: 5,
        total: 8,
        unit: "synced",
      },
      created: "Mar 27, 2026 09:00",
      labels: ["app=storefront", "Argo CD", "GitOps"],
      resourceCategory: "application",
      archived: false,
      updatedAtMs: Date.parse("2026-03-27T09:00:00"),
      gitopsSource: "gitops-sync",
    },
    {
      id: "placement-canary-006",
      action: "Regional placement expansion",
      status: "waiting",
      statusColor: "#3E8635",
      resource: "region:eu-central (12)",
      actionTargets: "Add AZ-b nodes to placement",
      progressType: "canary",
      canaryProgress: {
        p1: { current: 0, total: 3, status: "pending" },
        soak: { status: "pending" },
        p2: { current: 0, total: 9, status: "pending" },
      },
      note: "Waiting for maintenance window",
      created: "Mar 27, 2026 08:00",
      labels: ["region:eu-central", "Placement"],
      drilldownAvailable: false,
      resourceCategory: "placement",
      archived: false,
      updatedAtMs: Date.parse("2026-03-27T08:00:00"),
      gitopsSource: "wizard",
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

  const openActivityIfDrilldown = (id: string) => {
    const a = activities.find((x) => x.id === id);
    if (a) {
      handleRowClick(a);
    }
  };

  const scrollToActivityTable = () => {
    document
      .getElementById("deployments-activity-table")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  const tabFilteredActivities = useMemo(() => {
    let rows = filterDeploymentsByTab(activities, activeTab);
    if (sourceFilter !== "all") {
      rows = rows.filter((a) => matchesSourceFilter(a, sourceFilter));
    }
    return rows;
  }, [activities, activeTab, sourceFilter]);

  const tableFilteredActivities = useMemo(() => {
    let rows = tabFilteredActivities.filter((a) =>
      listScope === "active" ? !a.archived : !!a.archived,
    );
    if (selectedFilters.length > 0) {
      rows = rows.filter((a) =>
        selectedFilters.every((f) => {
          const hay = [
            a.action,
            a.resource,
            a.note ?? "",
            ...(a.labels ?? []),
          ]
            .join(" ")
            .toLowerCase();
          return hay.includes(f.toLowerCase());
        }),
      );
    }
    if (quickFilter === "failed") {
      rows = rows.filter((a) => a.status === "stopped");
    } else if (quickFilter === "in_progress") {
      rows = rows.filter((a) =>
        ["running", "active", "soaking"].includes(a.status),
      );
    } else if (quickFilter === "soaking") {
      rows = rows.filter((a) => a.status === "soaking");
    } else if (quickFilter === "waiting") {
      rows = rows.filter((a) => a.status === "waiting");
    } else if (quickFilter === "gitops") {
      rows = rows.filter(
        (a) =>
          a.gitopsSource === "gitops-sync" ||
          a.labels?.some((l) => l.toLowerCase().includes("gitops")),
      );
    } else if (quickFilter === "phased") {
      rows = rows.filter((a) => a.progressType === "canary");
    }
    return rows;
  }, [
    tabFilteredActivities,
    listScope,
    selectedFilters,
    quickFilter,
  ]);

  const sortedActivities = useMemo(() => {
    const copy = [...tableFilteredActivities];
    if (sortMode === "recent") {
      copy.sort(
        (a, b) => b.updatedAtMs - a.updatedAtMs,
      );
    } else {
      copy.sort(
        (a, b) =>
          getStatusPriority(a.status) - getStatusPriority(b.status),
      );
    }
    return copy;
  }, [tableFilteredActivities, sortMode]);

  const deploymentInsights = useMemo(() => {
    const scope = tabFilteredActivities.filter((a) => !a.archived);
    const activeDeployments = scope.filter((a) =>
      ["running", "soaking", "active"].includes(a.status),
    );
    const active = activeDeployments.length;
    const waiting = scope.filter((a) => a.status === "waiting").length;
    const failed = scope.filter((a) => a.status === "stopped").length;

    let clusterScopeTotal = 0;
    let clusterScopeKnown = false;
    for (const a of activeDeployments) {
      const n = parseClusterScope(a.resource);
      if (n != null) {
        clusterScopeTotal += n;
        clusterScopeKnown = true;
      }
    }

    let inCanary = 0;
    let inSoak = 0;
    let inFullOrSimple = 0;
    for (const a of activeDeployments) {
      if (a.progressType === "simple") {
        inFullOrSimple++;
        continue;
      }
      if (a.canaryProgress) {
        const cp = a.canaryProgress;
        if (cp.p1.status === "active") inCanary++;
        else if (cp.soak.status === "active") inSoak++;
        else inFullOrSimple++;
      } else {
        inFullOrSimple++;
      }
    }

    const activeRolloutLines = activeDeployments
      .slice(0, 5)
      .map((a) => ({
        id: a.id,
        action: a.action,
        phaseLine: summarizeRolloutProgress(a),
        scopeLabel: a.resource,
        target: a.actionTargets ?? "",
        drilldownAvailable: a.drilldownAvailable === true,
      }));

    const failedItems = scope
      .filter((a) => a.status === "stopped")
      .map((a) => ({
        id: a.id,
        action: a.action,
        note: a.note ?? "Stopped",
        drilldownAvailable: a.drilldownAvailable === true,
      }));

    const waitingItems = scope
      .filter((a) => a.status === "waiting")
      .map((a) => ({
        id: a.id,
        action: a.action,
        note: a.note ?? "Pending",
        drilldownAvailable: a.drilldownAvailable === true,
      }));

    const gitOpsSynced = GITOPS_REPO_DETAIL.filter(
      (r) => r.status === "synced",
    ).length;
    const gitOpsAttention = GITOPS_REPO_DETAIL.some(
      (r) => r.status !== "synced",
    );

    return {
      active,
      waiting,
      failed,
      inFlight: active + waiting,
      clusterScopeTotal: clusterScopeKnown ? clusterScopeTotal : null,
      phaseDistribution: { inCanary, inSoak, inFullOrSimple },
      activeRolloutLines,
      failedItems,
      waitingItems,
      gitOps: {
        repos: GITOPS_REPO_DETAIL,
        syncedRepoCount: gitOpsSynced,
        totalRepos: GITOPS_REPO_DETAIL.length,
        anyAttention: gitOpsAttention,
        argoHealthy: 11,
        argoDegraded: 1,
        lastControllerReconcile: "3m ago",
      },
    };
  }, [tabFilteredActivities]);

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
      {/* Page header + scope navigation (same band as title — no floating card) */}
      <header className="pb-2">
        <div className="flex flex-col items-end gap-3 min-[400px]:flex-row min-[400px]:items-start min-[400px]:justify-between min-[400px]:gap-4">
          <div className="min-w-0 w-full min-[400px]:w-auto self-start min-[400px]:self-auto text-left">
            <PageTitle className="!mb-0">Deployments</PageTitle>
            <BodyText muted className="mt-1 mb-0">
              Monitor and manage fleet-wide changes
            </BodyText>
          </div>
          <div className="shrink-0 min-[400px]:pt-0.5">
            <CreateDeploymentSplitButton
              areaTab={activeTab}
              onCreate={onCreateDeployment}
            />
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) =>
            setActiveTab(v as DeploymentTabId)
          }
          className="mt-5 gap-0"
        >
          <TabsList
            className="flex h-auto w-full min-h-0 flex-wrap items-stretch justify-start gap-0 rounded-none border-0 border-b border-[var(--border)] bg-transparent p-0"
          >
            {DEPLOYMENT_TAB_ORDER.map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className="inline-flex shrink-0 items-center gap-1 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 py-2.5 text-sm font-medium text-[var(--muted-foreground)] shadow-none transition-colors hover:text-[var(--foreground)] data-[state=active]:border-[var(--primary)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--foreground)] data-[state=active]:shadow-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
              >
                {t.label}
                <AreaTabScopeHelpTip label={t.label} description={t.description} />
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </header>

      {/* Search and Filter Bar */}
      <div
        className="border rounded-lg p-4"
        style={{
          borderColor: "var(--border)",
          borderRadius: "var(--radius)",
          backgroundColor: "var(--background)",
        }}
      >
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 min-w-[200px] relative">
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

          <button
            type="button"
            disabled={!searchQuery.trim()}
            title={
              searchQuery.trim()
                ? "Open create flow with this text as a label selector"
                : "Type a label or selector in search first"
            }
            onClick={() =>
              onCreateDeployment({
                tab: activeTab,
                mode: "placement-first",
                initialLabelSelector: searchQuery.trim(),
              })
            }
            className="inline-flex px-3 py-2 rounded border text-sm shrink-0 disabled:opacity-40 disabled:pointer-events-none hover:bg-secondary transition-colors"
            style={{
              borderColor: "var(--border)",
              fontFamily: "var(--font-family-text)",
              color: "var(--foreground)",
              backgroundColor: "var(--background)",
            }}
          >
            Use search as placement
          </button>

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

        <div
          className="mt-2.5 pt-2.5 flex flex-col gap-1.5"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {/** Area = All / Platform / Workloads / VM. Source = drive channel. Deployment status = table. */}
          <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1.5 text-[11px] leading-none">
            <span
              className="shrink-0 pl-0.5"
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "var(--muted-foreground)",
              }}
            >
              Area
            </span>
            <div className="flex flex-wrap items-center gap-1 min-w-0">
              {DEPLOYMENT_TAB_ORDER.map((t) => (
                <div
                  key={t.id}
                  className="inline-flex items-center gap-0.5"
                >
                  <button
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className="h-7 min-h-7 rounded px-2 text-xs transition-colors"
                    style={{
                      borderRadius: "var(--radius)",
                      backgroundColor:
                        activeTab === t.id
                          ? "var(--primary)"
                          : "var(--secondary)",
                      color:
                        activeTab === t.id
                          ? "var(--primary-foreground)"
                          : "var(--muted-foreground)",
                      fontWeight: activeTab === t.id ? 600 : 400,
                    }}
                  >
                    {t.label}
                  </button>
                  <AreaTabScopeHelpTip
                    label={t.label}
                    description={t.description}
                  />
                </div>
              ))}
            </div>
            <div
              className="h-3.5 w-px shrink-0 self-center"
              style={{ backgroundColor: "var(--border)" }}
              aria-hidden
            />
            <span
              className="shrink-0"
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "var(--muted-foreground)",
              }}
            >
              List
            </span>
            <div className="flex flex-wrap items-center gap-1 min-w-0">
              <button
                type="button"
                title="Non-archived rows: in queue, running, or failed (day-to-day queue)."
                onClick={() => setListScope("active")}
                className="h-7 min-h-7 px-2 rounded text-xs transition-colors"
                style={{
                  borderRadius: "var(--radius)",
                  backgroundColor:
                    listScope === "active"
                      ? "var(--primary)"
                      : "var(--secondary)",
                  color:
                    listScope === "active"
                      ? "var(--primary-foreground)"
                      : "var(--muted-foreground)",
                  fontWeight: listScope === "active" ? 600 : 400,
                }}
              >
                Active
              </button>
              <button
                type="button"
                title="Completed / historical rows for audit."
                onClick={() => setListScope("archive")}
                className="h-7 min-h-7 px-2 rounded text-xs transition-colors"
                style={{
                  borderRadius: "var(--radius)",
                  backgroundColor:
                    listScope === "archive"
                      ? "var(--primary)"
                      : "var(--secondary)",
                  color:
                    listScope === "archive"
                      ? "var(--primary-foreground)"
                      : "var(--muted-foreground)",
                  fontWeight: listScope === "archive" ? 600 : 400,
                }}
              >
                Archive
              </button>
            </div>
            <div
              className="h-3.5 w-px shrink-0 self-center"
              style={{ backgroundColor: "var(--border)" }}
              aria-hidden
            />
            <span
              className="shrink-0"
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "var(--muted-foreground)",
              }}
            >
              Sort
            </span>
            <div className="flex flex-wrap items-center gap-1 min-w-0">
              <button
                type="button"
                title="Sort by risk: failures and active work first (incidents, standup)."
                onClick={() => setSortMode("priority")}
                className="h-7 min-h-7 px-2 rounded text-xs transition-colors"
                style={{
                  borderRadius: "var(--radius)",
                  backgroundColor:
                    sortMode === "priority"
                      ? "var(--primary)"
                      : "var(--secondary)",
                  color:
                    sortMode === "priority"
                      ? "var(--primary-foreground)"
                      : "var(--muted-foreground)",
                  fontWeight: sortMode === "priority" ? 600 : 400,
                }}
              >
                Risk
              </button>
              <button
                type="button"
                title="Newest change first (correlate with alerts)."
                onClick={() => setSortMode("recent")}
                className="h-7 min-h-7 px-2 rounded text-xs transition-colors"
                style={{
                  borderRadius: "var(--radius)",
                  backgroundColor:
                    sortMode === "recent"
                      ? "var(--primary)"
                      : "var(--secondary)",
                  color:
                    sortMode === "recent"
                      ? "var(--primary-foreground)"
                      : "var(--muted-foreground)",
                  fontWeight: sortMode === "recent" ? 600 : 400,
                }}
              >
                Recent
              </button>
            </div>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1.5 text-[11px] leading-none">
            <span
              className="shrink-0 pl-0.5"
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "var(--muted-foreground)",
              }}
            >
              Source
            </span>
            <div className="flex flex-wrap items-center gap-1 min-w-0">
              {(
                [
                  {
                    id: "all" as const,
                    label: "All",
                    title:
                      "All run channels: console, GitOps, and policy/governance.",
                  },
                  {
                    id: "console" as const,
                    label: "Console",
                    title:
                      "Started from this console (wizard) — not policy-governance program rows.",
                  },
                  {
                    id: "gitops" as const,
                    label: "GitOps",
                    title: "Reconciled from Git (Argo CD / OpenShift GitOps).",
                  },
                  {
                    id: "governance" as const,
                    label: "Governance",
                    title:
                      "Policy / config / compliance (e.g. ACM). This is the run channel, not an area.",
                  },
                ] as const
              ).map(({ id, label, title }) => (
                <button
                  key={id}
                  type="button"
                  title={title}
                  onClick={() =>
                    setSourceFilter((prev) => (prev === id ? "all" : id))
                  }
                  className="h-7 min-h-7 rounded px-2 text-xs transition-colors"
                  style={{
                    borderRadius: "var(--radius)",
                    backgroundColor:
                      sourceFilter === id
                        ? "var(--primary)"
                        : "var(--secondary)",
                    color:
                      sourceFilter === id
                        ? "var(--primary-foreground)"
                        : "var(--muted-foreground)",
                    fontWeight: sourceFilter === id ? 600 : 400,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1.5 text-[11px] leading-none">
            <span
              className="shrink-0 pl-0.5"
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                color: "var(--muted-foreground)",
              }}
              title="Narrow the list the same way as the table Status column (one chip at a time; GitOps / Phased = extra slices)."
            >
              Deployment status
            </span>
            <div className="flex min-w-0 flex-wrap items-center gap-1">
              {(
                [
                  {
                    id: "failed" as const,
                    label: "Failed",
                    title:
                      "Stop-the-line: batches or clusters in error. Open row for details when available.",
                  },
                  {
                    id: "waiting" as const,
                    label: "Queued",
                    title:
                      "Not started: window, approval, or dependency.",
                  },
                  {
                    id: "in_progress" as const,
                    label: "Running",
                    title: "Actively applying (incl. soak as current step).",
                  },
                  {
                    id: "soaking" as const,
                    label: "Soak",
                    title: "Soak / burn-in phase only.",
                  },
                  {
                    id: "phased" as const,
                    label: "Phased",
                    title: "Canary or multi-step rollout path.",
                  },
                  {
                    id: "gitops" as const,
                    label: "GitOps",
                    title: "From Git (Argo CD / Flux) or GitOps-tagged rows.",
                  },
                ] as const
              ).map(({ id, label, title }) => (
                <button
                  key={id}
                  type="button"
                  title={title}
                  onClick={() =>
                    setQuickFilter((prev) => (prev === id ? null : id))
                  }
                  className="h-7 min-h-7 rounded-full px-2.5 text-xs transition-colors"
                  style={{
                    backgroundColor:
                      quickFilter === id
                        ? "var(--primary)"
                        : "var(--secondary)",
                    color:
                      quickFilter === id
                        ? "var(--primary-foreground)"
                        : "var(--muted-foreground)",
                    fontWeight: quickFilter === id ? 600 : 400,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary: at-a-glance; metrics sync with Deployment status filters in the list */}
      <div
        className="border rounded-md overflow-hidden max-w-full"
        style={{
          borderColor: "var(--border)",
          borderRadius: "var(--radius)",
          backgroundColor: "var(--card)",
        }}
      >
        <div className="flex flex-col gap-1 px-2 sm:px-3 pt-2 pb-1.5">
          <div className="flex items-start justify-between gap-2 min-w-0">
            <div
              className="min-w-0 flex-1"
              style={{ fontFamily: "var(--font-family-text)" }}
            >
              <div
                className="flex flex-wrap items-center gap-x-2 sm:gap-x-2.5 gap-y-1 min-w-0 text-[11px] sm:text-xs leading-snug"
                role="status"
                aria-label="Deployment list summary for current scope"
              >
                <span
                  className="text-muted-foreground uppercase tracking-wide shrink-0"
                  style={{ fontSize: "10px" }}
                >
                  Summary
                </span>
                <button
                  type="button"
                  title="Filter the table to in-progress rollouts (Same as Deployment status: Running.)"
                  onClick={() =>
                    setQuickFilter((f) =>
                      f === "in_progress" ? null : "in_progress",
                    )
                  }
                  className="rounded px-0.5 max-sm:min-h-9 max-sm:py-0.5 text-left"
                  style={{
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--foreground)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    boxShadow:
                      quickFilter === "in_progress"
                        ? "0 0 0 1.5px var(--ring)"
                        : "none",
                    borderRadius: 4,
                  }}
                >
                  {deploymentInsights.active} active
                </button>
                <span className="text-muted-foreground" aria-hidden>
                  ·
                </span>
                <button
                  type="button"
                  title="Filter the table to failed (Stopped) rows"
                  onClick={() =>
                    setQuickFilter((f) =>
                      f === "failed" ? null : "failed",
                    )
                  }
                  className="rounded px-0.5 text-left"
                  style={{
                    fontWeight: "var(--font-weight-semibold)",
                    color:
                      deploymentInsights.failed > 0
                        ? "#C9190B"
                        : "var(--foreground)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    boxShadow:
                      quickFilter === "failed"
                        ? "0 0 0 1.5px var(--ring)"
                        : "none",
                    borderRadius: 4,
                  }}
                >
                  {deploymentInsights.failed} failed
                </button>
                <span className="text-muted-foreground" aria-hidden>
                  ·
                </span>
                <button
                  type="button"
                  title="Filter the table to queued (waiting) rows"
                  onClick={() =>
                    setQuickFilter((f) =>
                      f === "waiting" ? null : "waiting",
                    )
                  }
                  className="rounded px-0.5 text-left"
                  style={{
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--foreground)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    boxShadow:
                      quickFilter === "waiting"
                        ? "0 0 0 1.5px var(--ring)"
                        : "none",
                    borderRadius: 4,
                  }}
                >
                  {deploymentInsights.waiting} waiting
                </button>
                <span className="text-muted-foreground" aria-hidden>
                  ·
                </span>
                <button
                  type="button"
                  title="Filter the table to GitOps-related rows"
                  onClick={() =>
                    setQuickFilter((f) =>
                      f === "gitops" ? null : "gitops",
                    )
                  }
                  className="rounded px-0.5 text-left"
                  style={{
                    fontWeight: "var(--font-weight-medium)",
                    color: deploymentInsights.gitOps.anyAttention
                      ? "#C46100"
                      : "var(--foreground)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    boxShadow:
                      quickFilter === "gitops"
                        ? "0 0 0 1.5px var(--ring)"
                        : "none",
                    borderRadius: 4,
                  }}
                >
                  {deploymentInsights.gitOps.anyAttention
                    ? `GitOps ${deploymentInsights.gitOps.totalRepos - deploymentInsights.gitOps.syncedRepoCount} need attention`
                    : "GitOps all synced"}
                </button>
              </div>
              <TinyText
                muted
                className="text-[10px] leading-snug mt-1 pl-0.5 max-w-3xl"
              >
                Same list as the table. Click a metric to filter; click
                again to clear. Open Details for a short triage panel.
              </TinyText>
            </div>
            <button
              type="button"
              onClick={() =>
                setDeploymentOverviewExpanded((open) => !open)
              }
              className="flex items-center gap-0.5 shrink-0 rounded px-1.5 py-0.5 hover:bg-secondary text-primary"
              style={{
                fontFamily: "var(--font-family-text)",
                fontSize: "var(--text-xs)",
                fontWeight: "var(--font-weight-medium)",
              }}
              aria-expanded={deploymentOverviewExpanded}
            >
              {deploymentOverviewExpanded ? "Hide" : "Details"}
              {deploymentOverviewExpanded ? (
                <ChevronUp className="size-3.5" aria-hidden />
              ) : (
                <ChevronDown className="size-3.5" aria-hidden />
              )}
            </button>
          </div>
        </div>
        {deploymentOverviewExpanded && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border-t"
            style={{
              borderColor: "var(--border)",
              maxHeight: "min(60vh, 560px)",
              overflowY: "auto",
            }}
          >
            {/* Attention: failed and queued first */}
            {/* Failed — names + last known reason */}
            <div
              className="rounded border p-3 flex flex-col gap-2"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--background)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="size-7 rounded flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor:
                        deploymentInsights.failed > 0
                          ? "rgba(201, 25, 11, 0.1)"
                          : "rgba(62, 134, 53, 0.1)",
                      borderRadius: "calc(var(--radius) - 2px)",
                    }}
                  >
                    <svg
                      className="size-4"
                      fill="none"
                      viewBox="0 0 20 20"
                      style={{
                        color:
                          deploymentInsights.failed > 0
                            ? "#C9190B"
                            : "#3E8635",
                      }}
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
                  <div className="min-w-0">
                    <TinyText
                      style={{
                        color: "var(--foreground)",
                        fontWeight: "var(--font-weight-semibold)",
                      }}
                    >
                      Failed or stopped
                    </TinyText>
                    <TinyText
                      className="block"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Safety brakes, thresholds, or user abort
                    </TinyText>
                  </div>
                </div>
                <div
                  className="shrink-0 text-right"
                  style={{
                    fontFamily: "var(--font-family-display)",
                    fontSize: "var(--text-xl)",
                    fontWeight: "var(--font-weight-semibold)",
                    color:
                      deploymentInsights.failed > 0
                        ? "#C9190B"
                        : "var(--foreground)",
                  }}
                >
                  {deploymentInsights.failed}
                </div>
              </div>
              <ul
                className="space-y-2 list-none pl-0 m-0 border-t pt-2 min-h-[3rem]"
                style={{ borderColor: "var(--border)" }}
              >
                {deploymentInsights.failedItems.length === 0 ? (
                  <TinyText style={{ color: "var(--muted-foreground)" }}>
                    No failed deployments — fleet changes are within policy.
                  </TinyText>
                ) : (
                  <>
                    {deploymentInsights.failedItems
                      .slice(0, SNAPSHOT_LIST_CAP)
                      .map((f) => (
                        <li key={f.id}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div
                                style={{
                                  fontSize: "var(--text-xs)",
                                  fontWeight: "var(--font-weight-medium)",
                                  color: "var(--foreground)",
                                }}
                                className="truncate"
                                title={f.action}
                              >
                                {f.action}
                              </div>
                              <TinyText
                                className="block leading-snug"
                                style={{ color: "#C9190B" }}
                              >
                                {f.note}
                              </TinyText>
                            </div>
                            {f.drilldownAvailable && (
                              <button
                                type="button"
                                onClick={() =>
                                  openActivityIfDrilldown(f.id)
                                }
                                className="shrink-0 text-[10px] font-medium px-1 py-0.5 rounded hover:underline"
                                style={{
                                  color: "var(--primary)",
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                }}
                              >
                                Open
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    {deploymentInsights.failedItems.length >
                      SNAPSHOT_LIST_CAP && (
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setQuickFilter("failed");
                            scrollToActivityTable();
                          }}
                          className="text-left text-xs font-medium hover:underline"
                          style={{ color: "var(--primary)" }}
                        >
                          +
                          {deploymentInsights.failedItems.length -
                            SNAPSHOT_LIST_CAP}{" "}
                          more in table
                        </button>
                      </li>
                    )}
                  </>
                )}
              </ul>
            </div>

            {/* Waiting — queue + blocking reason */}
            <div
              className="rounded border p-3 flex flex-col gap-2"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--background)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="size-7 rounded flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: "rgba(0, 102, 204, 0.1)",
                      borderRadius: "calc(var(--radius) - 2px)",
                    }}
                  >
                    <svg
                      className="size-4"
                      fill="none"
                      viewBox="0 0 20 20"
                      style={{ color: "#0066CC" }}
                    >
                      <path
                        d="M10 4V10L13 13"
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
                  <div className="min-w-0">
                    <TinyText
                      style={{
                        color: "var(--foreground)",
                        fontWeight: "var(--font-weight-semibold)",
                      }}
                    >
                      Waiting to run
                    </TinyText>
                    <TinyText
                      className="block"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Not yet executing (window, approval, prerequisite)
                    </TinyText>
                  </div>
                </div>
                <div
                  className="shrink-0 text-right"
                  style={{
                    fontFamily: "var(--font-family-display)",
                    fontSize: "var(--text-xl)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--foreground)",
                  }}
                >
                  {deploymentInsights.waiting}
                </div>
              </div>
              <ul
                className="space-y-2 list-none pl-0 m-0 border-t pt-2 min-h-[3rem]"
                style={{ borderColor: "var(--border)" }}
              >
                {deploymentInsights.waitingItems.length === 0 ? (
                  <TinyText style={{ color: "var(--muted-foreground)" }}>
                    Nothing queued — create a deployment or change policy to
                    enqueue work.
                  </TinyText>
                ) : (
                  <>
                    {deploymentInsights.waitingItems
                      .slice(0, SNAPSHOT_LIST_CAP)
                      .map((w) => (
                        <li key={w.id}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div
                                style={{
                                  fontSize: "var(--text-xs)",
                                  fontWeight: "var(--font-weight-medium)",
                                  color: "var(--foreground)",
                                }}
                                className="truncate"
                                title={w.action}
                              >
                                {w.action}
                              </div>
                              <TinyText
                                className="block leading-snug"
                                style={{ color: "var(--muted-foreground)" }}
                              >
                                {w.note}
                              </TinyText>
                            </div>
                            {w.drilldownAvailable && (
                              <button
                                type="button"
                                onClick={() =>
                                  openActivityIfDrilldown(w.id)
                                }
                                className="shrink-0 text-[10px] font-medium px-1 py-0.5 rounded hover:underline"
                                style={{
                                  color: "var(--primary)",
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                }}
                              >
                                Open
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    {deploymentInsights.waitingItems.length >
                      SNAPSHOT_LIST_CAP && (
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setQuickFilter("waiting");
                            scrollToActivityTable();
                          }}
                          className="text-left text-xs font-medium hover:underline"
                          style={{ color: "var(--primary)" }}
                        >
                          +
                          {deploymentInsights.waitingItems.length -
                            SNAPSHOT_LIST_CAP}{" "}
                          more in table
                        </button>
                      </li>
                    )}
                  </>
                )}
              </ul>
            </div>

            <div
              className="rounded border p-3 flex flex-col gap-2 min-h-0 md:col-span-2"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--background)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="size-7 rounded flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: "rgba(62, 134, 53, 0.1)",
                      borderRadius: "calc(var(--radius) - 2px)",
                    }}
                  >
                    <svg
                      className="size-4"
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
                  <div className="min-w-0">
                    <TinyText
                      style={{
                        color: "var(--foreground)",
                        fontWeight: "var(--font-weight-semibold)",
                      }}
                    >
                      Active rollouts
                    </TinyText>
                    <TinyText
                      className="block"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      In flight now (table Status = in progress)
                    </TinyText>
                  </div>
                </div>
                <div
                  className="shrink-0 text-right"
                  style={{
                    fontFamily: "var(--font-family-display)",
                    fontSize: "var(--text-xl)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--foreground)",
                  }}
                >
                  {deploymentInsights.active}
                </div>
              </div>
              {deploymentInsights.clusterScopeTotal != null && (
                <div
                  className="flex flex-wrap gap-1.5 items-center"
                  style={{ fontSize: "var(--text-xs)" }}
                >
                  <span
                    title="Sum of numbers parsed from row scope strings. Approximate — use table or API for enforcement."
                  >
                    <Badge variant="info">
                      Est. ~
                      {deploymentInsights.clusterScopeTotal.toLocaleString()}{" "}
                      in scope
                    </Badge>
                  </span>
                </div>
              )}
              <div
                className="flex flex-wrap gap-1"
                style={{ fontSize: "10px" }}
              >
                {deploymentInsights.phaseDistribution.inCanary > 0 && (
                  <span
                    className="px-1.5 py-0.5 rounded border"
                    style={{ borderColor: "var(--border)" }}
                  >
                    Canary: {deploymentInsights.phaseDistribution.inCanary}
                  </span>
                )}
                {deploymentInsights.phaseDistribution.inSoak > 0 && (
                  <span
                    className="px-1.5 py-0.5 rounded border"
                    style={{ borderColor: "var(--border)" }}
                  >
                    Soak: {deploymentInsights.phaseDistribution.inSoak}
                  </span>
                )}
                {deploymentInsights.phaseDistribution.inFullOrSimple > 0 && (
                  <span
                    className="px-1.5 py-0.5 rounded border"
                    style={{ borderColor: "var(--border)" }}
                  >
                    Full / batch:{" "}
                    {deploymentInsights.phaseDistribution.inFullOrSimple}
                  </span>
                )}
              </div>
              <ul
                className="space-y-2 mt-1 pl-0 list-none border-t pt-2"
                style={{ borderColor: "var(--border)" }}
              >
                {deploymentInsights.activeRolloutLines.length === 0 ? (
                  <TinyText style={{ color: "var(--muted-foreground)" }}>
                    No active rollouts in this workspace.
                  </TinyText>
                ) : (
                  <>
                    {deploymentInsights.activeRolloutLines
                      .slice(0, SNAPSHOT_LIST_CAP)
                      .map((line) => (
                        <li key={line.id}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div
                                style={{
                                  fontWeight: "var(--font-weight-medium)",
                                  fontSize: "var(--text-xs)",
                                  color: "var(--foreground)",
                                }}
                                className="truncate"
                                title={line.action}
                              >
                                {line.action}
                              </div>
                              <TinyText
                                className="block leading-snug"
                                style={{ color: "var(--muted-foreground)" }}
                              >
                                {line.phaseLine}
                                {line.target ? ` · ${line.target}` : ""}
                              </TinyText>
                              <TinyText
                                className="block"
                                style={{
                                  color: "var(--muted-foreground)",
                                  fontSize: "10px",
                                }}
                              >
                                {line.scopeLabel}
                              </TinyText>
                            </div>
                            {line.drilldownAvailable && (
                              <button
                                type="button"
                                onClick={() =>
                                  openActivityIfDrilldown(line.id)
                                }
                                className="shrink-0 text-[10px] font-medium px-1 py-0.5 rounded hover:underline"
                                style={{
                                  color: "var(--primary)",
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                }}
                              >
                                Open
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    {deploymentInsights.activeRolloutLines.length >
                      SNAPSHOT_LIST_CAP && (
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setQuickFilter("in_progress");
                            scrollToActivityTable();
                          }}
                          className="text-left text-xs font-medium hover:underline"
                          style={{ color: "var(--primary)" }}
                        >
                          +
                          {deploymentInsights.activeRolloutLines.length -
                            SNAPSHOT_LIST_CAP}{" "}
                          more in table
                        </button>
                      </li>
                    )}
                  </>
                )}
              </ul>
            </div>

            <details
              className="rounded border overflow-hidden md:col-span-2 [&>summary]:list-none [&>summary::-webkit-details-marker]:hidden"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--background)",
              }}
            >
              <summary
                className="flex cursor-pointer flex-wrap items-center justify-between gap-2 border-b px-3 py-2.5"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <TinyText
                    style={{ fontWeight: "var(--font-weight-semibold)" }}
                  >
                    GitOps & sync
                  </TinyText>
                  <Badge variant="default" className="text-[9px] px-1.5 py-0">
                    Demo
                  </Badge>
                  <TinyText muted className="text-[10px] max-w-sm">
                    Illustrative data — Argo & repos wire up separately.
                  </TinyText>
                </div>
                <Badge
                  variant={
                    deploymentInsights.gitOps.anyAttention
                      ? "warning"
                      : "success"
                  }
                >
                  {deploymentInsights.gitOps.syncedRepoCount}/
                  {deploymentInsights.gitOps.totalRepos} synced
                </Badge>
              </summary>
              <div className="flex flex-col gap-2 p-3">
                <TinyText style={{ color: "var(--muted-foreground)" }}>
                  Argo CD applications:{" "}
                  <span style={{ color: "var(--foreground)" }}>
                    {deploymentInsights.gitOps.argoHealthy} healthy
                  </span>
                  {" · "}
                  <span
                    style={{
                      color:
                        deploymentInsights.gitOps.argoDegraded > 0
                          ? "#C46100"
                          : "var(--muted-foreground)",
                    }}
                  >
                    {deploymentInsights.gitOps.argoDegraded} degraded
                  </span>
                  {" · controller "}
                  {deploymentInsights.gitOps.lastControllerReconcile}
                </TinyText>
                <ul
                  className="space-y-1.5 list-none pl-0 m-0 border-t pt-2"
                  style={{ borderColor: "var(--border)" }}
                >
                  {deploymentInsights.gitOps.repos.map((repo) => (
                    <li
                      key={repo.name}
                      className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5"
                    >
                      <span
                        style={{
                          fontSize: "var(--text-xs)",
                          fontWeight: "var(--font-weight-medium)",
                          color: "var(--foreground)",
                        }}
                      >
                        {repo.name}
                      </span>
                      <Badge
                        variant={
                          repo.status === "synced"
                            ? "success"
                            : repo.status === "out_of_sync"
                              ? "warning"
                              : "info"
                        }
                        className="text-[10px] px-1.5 py-0"
                      >
                        {repo.status === "synced"
                          ? "Synced"
                          : repo.status === "out_of_sync"
                            ? "Out of sync"
                            : "Progressing"}
                      </Badge>
                      <TinyText
                        className="w-full"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {repo.branch} @ {repo.revision.slice(0, 7)} ·{" "}
                        {repo.age}
                        {repo.detail ? ` · ${repo.detail}` : ""}
                      </TinyText>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          </div>
        )}
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
        id="deployments-activity-table"
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
                    sortedActivities.length > 0 &&
                    selectedRows.length === sortedActivities.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRows(
                        sortedActivities.map((a) => a.id),
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
                  Source
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
            {sortedActivities.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center">
                  <TinyText muted>
                    No deployments match the current list, filters, and sort.
                  </TinyText>
                </td>
              </tr>
            ) : (
              sortedActivities.map((activity) => (
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
                  {activity.gitopsSource === "gitops-sync" ? (
                    <TinyText muted>GitOps</TinyText>
                  ) : activity.resourceCategory === "governance" ? (
                    <TinyText muted>Governance</TinyText>
                  ) : activity.gitopsSource === "wizard" ? (
                    <TinyText muted>Console</TinyText>
                  ) : (
                    <TinyText muted>—</TinyText>
                  )}
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
            ))
            )}
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
          {progress.p2.status === "pending" && ", Full rollout: Pending"}
          {progress.p2.status === "active" &&
            `, Full rollout: ${progress.p2.current}/${progress.p2.total}`}
          {progress.p2.status === "cancelled" &&
            " → Full rollout: Cancelled"}
        </TinyText>
      </div>
    </div>
  );
}