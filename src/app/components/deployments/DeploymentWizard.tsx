import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  History,
  ListChecks,
  RefreshCw,
  Share2,
  Sparkles,
  UserCheck,
} from "lucide-react";
import {
  ModalOverlay,
  CardTitle,
  SmallText,
  TinyText,
  LabelText,
  PrimaryButton,
  SecondaryButton,
  IconButton,
  TextInput,
  LinkButton,
  SearchInput,
} from "../../../imports/UIComponents";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { CreateDeploymentMenuContent } from "./CreateDeploymentSplitButton";
import type { OpenDeploymentWizardOptions } from "./CreateDeploymentSplitButton";
import { Alert } from "@patternfly/react-core";
import { AIActionPlansPanel, type AIUpdatePlan } from "./AIActionPlansPanel";
// Use base-no-reset to get PF styling without global CSS resets affecting other elements
import "@patternfly/react-core/dist/styles/base-no-reset.css";
import {
  DEPLOYMENT_TAB_ORDER,
  getWizardPresetForTab,
  type DeploymentTabId,
  type WizardEntryMode,
} from "./deploymentTabPresets";
import {
  buildPlanChannelSnippets,
  deploymentCopy,
} from "./deploymentPrototypeCopy";
import { GuidingTooltip } from "./GuidingTooltip";
import { prototypeInteractionToastClassNames } from "./prototypeChrome";
import {
  applyRolloutStrategyPreset,
  mergeAIPrebuiltPlanRolloutSlice,
} from "./rolloutStrategyPresets";
import {
  FLEET_MOCK_CLUSTERS,
  getClustersMatchingPlacementInput,
  matchClustersByLabelFragment,
  catalogActionFitsInventory,
  inferInventoryCapabilities,
  type FleetClusterRow,
} from "./deploymentFleetInventory";

export type { WizardEntryMode, DeploymentTabId } from "./deploymentTabPresets";

interface DeploymentWizardProps {
  onComplete: (formData?: any) => void;
  onCancel: () => void;
  /** Reorders wizard: placement before action when placement-first. Default action-first. */
  entryMode?: WizardEntryMode;
  /** When opening from list search, seed label selector (e.g. env=prod). */
  initialLabelSelector?: string;
  /** When set, Placement uses searchable mode with these cluster names (fleet inventory). */
  initialSelectedClusterNames?: string[];
  /** Pre-select primary catalog action (e.g. `update-ocp-4.18` for cluster upgrade). */
  initialPrimaryActionId?: string;
  /** Which Deployments tab opened the wizard — drives default actions and labels. */
  launchTab?: DeploymentTabId;
  /** Change launch tab / entry mode without leaving the modal (restarts the wizard). */
  onReconfigure?: (opts: OpenDeploymentWizardOptions) => void;
}

type WizardContentId = 1 | 2 | 3 | 4 | 5;

type WizardStepDef = {
  number: number;
  label: string;
  hint: string;
  contentId: WizardContentId;
};

function buildWizardSteps(
  entryMode: WizardEntryMode,
): WizardStepDef[] {
  const { steps: s } = deploymentCopy;
  const h = s.hints;

  if (entryMode === "placement-first") {
    return [
      {
        number: 1,
        label: s.placement,
        hint: h.placementFirstStep1,
        contentId: 2,
      },
      {
        number: 2,
        label: s.action,
        hint: h.action,
        contentId: 1,
      },
      { number: 3, label: s.rollout, hint: h.rollout, contentId: 3 },
      {
        number: 4,
        label: s.executionPolicy,
        hint: h.execution,
        contentId: 4,
      },
      { number: 5, label: s.reviewCreate, hint: h.review, contentId: 5 },
    ];
  }

  return [
    { number: 1, label: s.action, hint: h.action, contentId: 1 },
    {
      number: 2,
      label: s.placement,
      hint: h.placement,
      contentId: 2,
    },
    { number: 3, label: s.rollout, hint: h.rollout, contentId: 3 },
    {
      number: 4,
      label: s.executionPolicy,
      hint: h.execution,
      contentId: 4,
    },
    { number: 5, label: s.reviewCreate, hint: h.review, contentId: 5 },
  ];
}

type ActionType = "update" | "install" | "apply" | "delete" | "create";

type ActionOption = {
  id: string;
  type: ActionType;
  category: string;
  name: string;
  description: string;
  requiresVersion?: boolean;
  compatibleWith?: string[]; // IDs of actions this is compatible with
  /** When set, this entry appears only on these area tabs (and always on **All**). */
  areas?: DeploymentTabId[];
};

type CatalogDetailField =
  | {
      kind: "select";
      key: string;
      label: string;
      options: { value: string; label: string }[];
    }
  | { kind: "text"; key: string; label: string; placeholder?: string }
  | { kind: "placeholders"; count: number };

/** `${actionId}::${tab}` or `${actionId}::__default` */
const CATALOG_DETAIL_FIELDS: Record<string, CatalogDetailField[]> = {
  "update-ocp-4.18::clusters": [
    {
      kind: "select",
      key: "channel",
      label: "Update channel",
      options: [
        { value: "stable-4.18", label: "stable-4.18" },
        { value: "fast-4.18", label: "fast-4.18" },
        { value: "candidate-4.18", label: "candidate-4.18" },
      ],
    },
    {
      kind: "text",
      key: "maintenanceNote",
      label: "Change coordination",
      placeholder: "e.g. etcd defrag window, critical alerts muted…",
    },
    { kind: "placeholders", count: 2 },
  ],
  "update-ocp-4.18::__default": [
    {
      kind: "select",
      key: "channel",
      label: "Update channel",
      options: [
        { value: "stable-4.18", label: "stable-4.18" },
        { value: "fast-4.18", label: "fast-4.18" },
      ],
    },
    { kind: "placeholders", count: 3 },
  ],
  "update-ocp-4.17::clusters": [
    {
      kind: "select",
      key: "channel",
      label: "Update channel",
      options: [
        { value: "stable-4.17", label: "stable-4.17" },
        { value: "fast-4.17", label: "fast-4.17" },
      ],
    },
    { kind: "placeholders", count: 2 },
  ],
  "update-etcd-3.5.12::clusters": [
    {
      kind: "select",
      key: "defrag",
      label: "Defrag policy",
      options: [
        { value: "before", label: "Defrag before upgrade" },
        { value: "after", label: "Defrag after upgrade" },
      ],
    },
    {
      kind: "text",
      key: "backupRef",
      label: "Backup ticket / ref",
      placeholder: "OPS-1234",
    },
    { kind: "placeholders", count: 2 },
  ],
  "vm-migration-hypervisor::virtual-machines": [
    {
      kind: "select",
      key: "migrationMode",
      label: "Migration mode",
      options: [
        { value: "live", label: "Live migrate (default)" },
        { value: "cold", label: "Cold migrate" },
      ],
    },
    {
      kind: "select",
      key: "maxParallel",
      label: "Max VMs per wave",
      options: [
        { value: "2", label: "2" },
        { value: "4", label: "4" },
        { value: "8", label: "8" },
      ],
    },
    { kind: "text", key: "hypervisorPool", label: "Hypervisor pool label", placeholder: "zone=na-virt-a" },
    { kind: "placeholders", count: 2 },
  ],
  "apply-network-policy::applications": [
    {
      kind: "select",
      key: "scope",
      label: "Policy scope",
      options: [
        { value: "namespace", label: "Single namespace" },
        { value: "label", label: "Label selector (many NS)" },
      ],
    },
    {
      kind: "text",
      key: "namespace",
      label: "Target namespace(s)",
      placeholder: "team-storefront, team-payments",
    },
    { kind: "placeholders", count: 2 },
  ],
  "install-service-mesh::applications": [
    {
      kind: "select",
      key: "revision",
      label: "Istio revision",
      options: [
        { value: "default", label: "default" },
        { value: "stable", label: "stable" },
      ],
    },
    { kind: "placeholders", count: 3 },
  ],
};

function getCatalogDetailFields(
  actionId: string,
  tab: DeploymentTabId,
): CatalogDetailField[] {
  const scoped = CATALOG_DETAIL_FIELDS[`${actionId}::${tab}`];
  if (scoped) return scoped;
  const def = CATALOG_DETAIL_FIELDS[`${actionId}::__default`];
  if (def) return def;
  return [{ kind: "placeholders", count: 4 }];
}

function filterCatalogForTab(
  actions: ActionOption[],
  tab: DeploymentTabId,
): ActionOption[] {
  if (tab === "all") return actions;
  return actions.filter(
    (a) => !a.areas?.length || a.areas.includes(tab),
  );
}

function CatalogPlaceholderBars({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-2" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-2.5 w-full rounded"
          style={{ backgroundColor: "var(--muted)", opacity: 0.35 }}
        />
      ))}
    </div>
  );
}

type SelectedAction = {
  id: string;
  type: ActionType;
  name: string;
  description: string;
  sourceVersion?: string;
  targetVersion?: string;
};

// Action-based configurations with verbs (Update, Install, Apply, Delete, Create).
// `areas` scopes catalog rows to Platform / Workloads / Virtualization; **All** lists everything.
const ALL_CATALOG_ACTIONS: ActionOption[] = [
  {
    id: "update-ocp-4.17",
    type: "update",
    category: "Update",
    name: "Update to OpenShift 4.17",
    description:
      "Target the 4.17 z-stream on your channel; each cluster’s current level comes from placement/inventory in a live product.",
    requiresVersion: false,
    areas: ["clusters"],
    compatibleWith: ["install-cert-manager", "apply-pod-security"],
  },
  {
    id: "update-ocp-4.18",
    type: "update",
    category: "Update",
    name: "Update to OpenShift 4.18",
    description:
      "Target the 4.18 z-stream on your channel; each cluster’s current level comes from placement/inventory in a live product.",
    requiresVersion: false,
    areas: ["clusters"],
  },
  {
    id: "update-etcd-3.5.12",
    type: "update",
    category: "Update",
    name: "Update etcd 3.5.9 → 3.5.12",
    description: "Critical stability and security fixes",
    requiresVersion: false,
    areas: ["clusters"],
  },
  {
    id: "update-machine-config-pool",
    type: "update",
    category: "Update",
    name: "Roll MachineConfigPool — worker (kernel / kubelet)",
    description:
      "Platform-only: coordinated MCO rollout for worker pool with health gates",
    requiresVersion: false,
    areas: ["clusters"],
  },
  {
    id: "vm-migration-hypervisor",
    type: "update",
    category: "Update",
    name: "VM migration — ESXi / hypervisor rollover (fleet)",
    description:
      "Coordinate rolling migration for OpenShift Virtualization worker nodes",
    requiresVersion: false,
    areas: ["virtual-machines"],
  },
  {
    id: "virt-scale-cdi-imports",
    type: "update",
    category: "Update",
    name: "Tune CDI / image import concurrency (fleet)",
    description:
      "Virtualization storage path: cap concurrent imports per node class to avoid saturation",
    requiresVersion: false,
    areas: ["virtual-machines"],
  },
  {
    id: "install-cert-manager",
    type: "install",
    category: "Install",
    name: "Install cert-manager v1.14",
    description: "Automated X.509 certificate management",
    requiresVersion: false,
    areas: ["clusters"],
    compatibleWith: ["update-ocp-4.17"],
  },
  {
    id: "install-logging-operator",
    type: "install",
    category: "Install",
    name: "Install Cluster Logging Operator v5.8",
    description: "Deploy centralized log aggregation",
    requiresVersion: false,
    areas: ["clusters"],
  },
  {
    id: "install-service-mesh",
    type: "install",
    category: "Install",
    name: "Install Service Mesh Operator v2.5",
    description: "Istio-based traffic management and observability",
    requiresVersion: false,
    areas: ["applications"],
  },
  {
    id: "install-gitops-pipeline-operator",
    type: "install",
    category: "Install",
    name: "Install OpenShift Pipelines (Tekton) operator",
    description:
      "Workloads area: CI/CD operator for namespace-scoped pipelines and tasks",
    requiresVersion: false,
    areas: ["applications"],
  },
  {
    id: "update-workload-maxsurge",
    type: "update",
    category: "Update",
    name: "Update Deployment strategy — maxSurge / maxUnavailable",
    description:
      "Workloads: tune rollout parameters for a label-selected set of Deployments",
    requiresVersion: false,
    areas: ["applications"],
  },
  {
    id: "apply-network-policy",
    type: "apply",
    category: "Apply",
    name: "Apply NetworkPolicy: deny-external",
    description: "Block external ingress to non-public namespaces",
    requiresVersion: false,
    areas: ["applications"],
    compatibleWith: ["update-ocp-4.17"],
  },
  {
    id: "apply-pod-security",
    type: "apply",
    category: "Apply",
    name: "Apply PodSecurityPolicy: restricted",
    description: "Enforce restricted security context constraints",
    requiresVersion: false,
    areas: ["clusters", "applications"],
  },
  {
    id: "apply-resource-quota",
    type: "apply",
    category: "Apply",
    name: "Apply ResourceQuota: prod-limits",
    description: "Set CPU/memory limits for production namespaces",
    requiresVersion: false,
    areas: ["applications"],
  },
  {
    id: "apply-mco-kernel-args",
    type: "apply",
    category: "Apply",
    name: "Apply MachineConfig — kernel args (worker)",
    description:
      "Platform: sysctl / kernel argument slice for worker pool via MCO",
    requiresVersion: false,
    areas: ["clusters"],
  },
  {
    id: "apply-kubevirt-migration-policy",
    type: "apply",
    category: "Apply",
    name: "Apply KubeVirt migration policy (bandwidth / auto-migrate)",
    description:
      "Virtualization: tune live-migration bandwidth and eviction behavior",
    requiresVersion: false,
    areas: ["virtual-machines"],
  },
  {
    id: "apply-gitops-sync-window",
    type: "apply",
    category: "Apply",
    name: "Apply Argo CD sync window (allow/deny)",
    description:
      "Workloads: constrain when Application sync is allowed for a label set",
    requiresVersion: false,
    areas: ["applications"],
  },
  {
    id: "delete-deprecated-api",
    type: "delete",
    category: "Delete",
    name: "Delete deprecated v1beta1 APIs",
    description: "Remove deprecated API versions before upgrade",
    requiresVersion: false,
    areas: ["clusters"],
  },
  {
    id: "delete-orphaned-pvcs",
    type: "delete",
    category: "Delete",
    name: "Delete orphaned PersistentVolumeClaims",
    description: "Clean up unbound storage claims",
    requiresVersion: false,
    areas: ["applications"],
  },
  {
    id: "delete-stale-revisions",
    type: "delete",
    category: "Delete",
    name: "Prune stale ReplicaSets / old revisions",
    description:
      "Workloads: reclaim churn from failed rollouts after a safe retention window",
    requiresVersion: false,
    areas: ["applications"],
  },
  {
    id: "create-monitoring-stack",
    type: "create",
    category: "Create",
    name: "Create monitoring stack config",
    description: "Deploy Prometheus, Grafana, and AlertManager",
    requiresVersion: false,
    areas: ["clusters", "applications"],
  },
  {
    id: "create-backup-schedule",
    type: "create",
    category: "Create",
    name: "Create etcd backup schedule",
    description: "Configure daily automated etcd snapshots",
    requiresVersion: false,
    areas: ["clusters"],
  },
  {
    id: "create-vm-snapshot-class",
    type: "create",
    category: "Create",
    name: "Create VolumeSnapshotClass for VM disks",
    description:
      "Virtualization: define snapshot class for CSI backing VM PVCs",
    requiresVersion: false,
    areas: ["virtual-machines"],
  },
];

/** Shown first on Step 1 before expanding the full catalog. */
const RECOMMENDED_ACTION_IDS: Record<DeploymentTabId, string[]> = {
  all: [
    "update-ocp-4.18",
    "apply-network-policy",
    "vm-migration-hypervisor",
    "install-cert-manager",
  ],
  clusters: [
    "update-ocp-4.18",
    "update-etcd-3.5.12",
    "install-cert-manager",
    "create-backup-schedule",
  ],
  applications: [
    "apply-network-policy",
    "install-service-mesh",
    "apply-resource-quota",
    "update-workload-maxsurge",
  ],
  "virtual-machines": [
    "vm-migration-hypervisor",
    "apply-kubevirt-migration-policy",
    "virt-scale-cdi-imports",
    "create-vm-snapshot-class",
  ],
};

type QuickTemplateDef = {
  id: string;
  labelKey: keyof typeof deploymentCopy.actionCatalog;
  hintKey: keyof typeof deploymentCopy.actionCatalog;
  actionId: string;
  catalogFieldPatches?: Record<string, string>;
};

const QUICK_TEMPLATE_DEFS: QuickTemplateDef[] = [
  {
    id: "tpl-ocp-fast",
    labelKey: "quickTemplateOcp",
    hintKey: "quickTemplateOcpHint",
    actionId: "update-ocp-4.18",
    catalogFieldPatches: {
      "update-ocp-4.18::channel": "fast-4.18",
    },
  },
  {
    id: "tpl-net",
    labelKey: "quickTemplateNet",
    hintKey: "quickTemplateNetHint",
    actionId: "apply-network-policy",
    catalogFieldPatches: {
      "apply-network-policy::scope": "label",
      "apply-network-policy::namespace": "app.kubernetes.io/part-of",
    },
  },
  {
    id: "tpl-vm",
    labelKey: "quickTemplateVm",
    hintKey: "quickTemplateVmHint",
    actionId: "vm-migration-hypervisor",
    catalogFieldPatches: {
      "vm-migration-hypervisor::migrationMode": "live",
      "vm-migration-hypervisor::maxParallel": "4",
    },
  },
];

function quickTemplatesForCatalog(
  catalog: ActionOption[],
): (QuickTemplateDef & { label: string; hint: string })[] {
  const ac = deploymentCopy.actionCatalog;
  return QUICK_TEMPLATE_DEFS.filter((t) =>
    catalog.some((a) => a.id === t.actionId),
  ).map((t) => ({
    ...t,
    label: String(ac[t.labelKey]),
    hint: String(ac[t.hintKey]),
  }));
}

const ACTION_TYPE_CHOICES: {
  type: ActionType;
  label: string;
  description: string;
}[] = [
  {
    type: "update",
    label: "Update",
    description: "Bumps, rolls, in-place changes",
  },
  {
    type: "install",
    label: "Install",
    description: "Add operators, components",
  },
  {
    type: "apply",
    label: "Apply",
    description: "Policies, config objects",
  },
  {
    type: "delete",
    label: "Delete",
    description: "Remove workloads or config",
  },
  {
    type: "create",
    label: "Create",
    description: "New resources, schedules",
  },
];

function isOpenshiftCatalogUpdateId(
  actionId: string | undefined,
): actionId is "update-ocp-4.17" | "update-ocp-4.18" {
  return actionId === "update-ocp-4.17" || actionId === "update-ocp-4.18";
}

function buildSelectedFromOption(action: ActionOption): SelectedAction {
  const base: SelectedAction = {
    id: action.id,
    type: action.type,
    name: action.name,
    description: action.description,
  };
  if (action.id.startsWith("update-etcd")) {
    return {
      ...base,
      sourceVersion: "3.5.9",
      targetVersion: "3.5.12",
    };
  }
  if (action.id === "update-ocp-4.17") {
    return {
      ...base,
      sourceVersion: "4.16.2",
      targetVersion: "4.17.12",
    };
  }
  if (action.id === "update-ocp-4.18") {
    return {
      ...base,
      sourceVersion: "4.16.2",
      targetVersion: "4.18.5",
    };
  }
  if (action.requiresVersion) {
    return {
      ...base,
      sourceVersion: "4.15.12",
      targetVersion: "4.16.2",
    };
  }
  return base;
}

function formatTargetsSnapshotAt(iso: string | undefined): string {
  const raw = iso || new Date().toISOString();
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return (
    d.toLocaleString("en-US", {
      timeZone: "America/New_York",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) + " EST"
  );
}

type RolloutStrategyPresetId =
  | "balanced-canary"
  | "weekend-push"
  | "gitops-aligned"
  | "custom";

export type UserRolloutStrategy =
  | {
      id: string;
      name: string;
      kind: "preset";
      presetId: Exclude<RolloutStrategyPresetId, "custom">;
    }
  | {
      id: string;
      name: string;
      kind: "custom";
      snapshot: Record<string, unknown>;
    };

/** Applies an AI plan: action, label placement, and rollout preset + overrides. */
function mergeAIUpdatePlanIntoFormData(
  fd: Record<string, any>,
  plan: AIUpdatePlan,
  newAction: SelectedAction,
): Record<string, any> {
  const mergedRoll = mergeAIPrebuiltPlanRolloutSlice(fd, {
    suggestedLabelSelector: plan.suggestedLabelSelector,
    rollout: {
      strategyPreset: plan.rollout.strategyPreset,
      canaryPhaseLabel: plan.rollout.canaryPhaseLabel,
      overrides: plan.rollout.overrides,
    },
  });
  return {
    ...mergedRoll,
    fleetSelection: "label",
    labelSelector: plan.suggestedLabelSelector,
    selectedClusters: [] as string[],
    selectedActions: [
      newAction,
      ...((fd.selectedActions || []) as SelectedAction[]).slice(1),
    ],
    targetsSnapshotAt: new Date().toISOString(),
    rolloutStrategySource: "saved" as const,
    rolloutUserStrategyId: null,
    saveRolloutStrategyForReuse: false,
    saveRolloutStrategyName: "",
    catalogActionFieldValues: {},
    aiPlanPrefill: {
      planNumber: plan.planNumber,
      planId: plan.id,
      title: plan.title,
    },
  };
}

const ROLLOUT_PRESET_COPY: Record<
  RolloutStrategyPresetId,
  { hint: string; blocks?: "weekend" }
> = {
  "balanced-canary": {
    hint: "Suggests canary pacing, immediate start, and a moderate Canary rollout soak.",
  },
  "weekend-push": {
    hint: "Suggests larger waves and a tight weekend window—review pacing before you continue.",
    blocks: "weekend",
  },
  "gitops-aligned": {
    hint: "Suggests a canary, a scheduled start, and Argo / GitOps style placement labels in the canary path.",
  },
  custom: {
    hint: "You are editing rollout fields directly. Switch to a saved strategy anytime to reapply a template.",
  },
};

const ROLLOUT_SNAPSHOT_KEYS = [
  "rolloutMethod",
  "scheduleType",
  "scheduledDate",
  "scheduledTime",
  "scheduleWindow",
  "scheduleStartTime",
  "scheduleEndTime",
  "phase1Count",
  "phase1Batch",
  "phase1Soak",
  "phase1MaxParallel",
  "phase1Priority",
  "phase1ErrorThreshold",
  "canarySelector",
  "pacingBatchSize",
  "pacingSoakTime",
  "pacingErrorThreshold",
  "phase2Batch",
  "phase2SoakTime",
  "phase2ErrorThreshold",
  "requireApproval",
  "rolloutStrategyPreset",
] as const;

function snapshotRolloutFieldsForSave(
  fd: Record<string, any>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of ROLLOUT_SNAPSHOT_KEYS) {
    if (fd[k] !== undefined) out[k] = fd[k];
  }
  return out;
}

function applyRolloutSnapshot(
  prev: Record<string, any>,
  snap: Record<string, unknown>,
): Record<string, any> {
  const next: Record<string, any> = { ...prev };
  for (const [k, v] of Object.entries(snap)) {
    if (v !== undefined) next[k] = v;
  }
  return next;
}

type InitialFormSeed = {
  initialSelectedClusterNames?: string[];
  initialPrimaryActionId?: string;
};

function buildInitialFormData(
  initialLabelSelector: string | undefined,
  launchTab: DeploymentTabId,
  seed?: InitialFormSeed,
) {
  const preset = getWizardPresetForTab(launchTab);
  const fleetNames = new Set(FLEET_MOCK_CLUSTERS.map((c) => c.name));
  const namesFromSeed = (seed?.initialSelectedClusterNames ?? []).filter((n) =>
    fleetNames.has(n),
  );
  const useSearchable = namesFromSeed.length > 0;
  const label = useSearchable
    ? ""
    : initialLabelSelector?.trim() || preset.initialLabelSelector;

  let selectedActions: SelectedAction[] = [];
  if (seed?.initialPrimaryActionId) {
    const opt = ALL_CATALOG_ACTIONS.find(
      (a) => a.id === seed.initialPrimaryActionId,
    );
    if (opt) {
      selectedActions = [buildSelectedFromOption(opt)];
    }
  }

  return {
    selectedActions,
    fleetSelection: (useSearchable ? "searchable" : "label") as
      | "searchable"
      | "label",
    labelSelector: label,
    selectedClusters: useSearchable ? namesFromSeed : ([] as string[]),
    rolloutMethod: preset.rolloutMethod ?? "canary",
    scheduleType: "immediate",
    scheduledDate: "",
    scheduledTime: "",
    scheduleWindow: "weekends",
    scheduleStartTime: "22:00",
    scheduleEndTime: "02:00",
    phase1Count: "10",
    phase1Batch: "2",
    phase1MaxParallel: "5",
    phase1Priority: "label:canary",
    phase1Soak: "24h",
    phase1RespectSchedule: true,
    phase1SafetyBrake: "50",
    requireApproval: false,
    phase2Batch: "3",
    phase2MaxParallel: "10",
    phase2StopOnFailure: true,
    phase2FailureThreshold: "1",
    phase2Start: "Tue 18:00",
    phase2Soak: "24h",
    schedule: "Global Maint Window",
    runAs: "Personal (Adi Cluster Admin)",
    requireManualConfirmation: false,
    targetsSnapshotAt: new Date().toISOString(),
    rolloutStrategyPreset: "balanced-canary",
    rolloutStrategySource: "saved" as const,
    rolloutUserStrategyId: null as string | null,
    saveRolloutStrategyForReuse: false,
    saveRolloutStrategyName: "",
    /** Canary rollout: AND terms within Placement (region=/env= supported; other terms match cluster labels). */
    canarySelector: "region=us-east-1,tier=web",
    /** Step 1 catalog detail widgets: key `${actionId}::${fieldKey}` → value */
    catalogActionFieldValues: {} as Record<string, string>,
    aiPlanPrefill: null,
  };
}

export function DeploymentWizard({
  onComplete,
  onCancel,
  entryMode: entryModeProp = "action-first",
  initialLabelSelector,
  initialSelectedClusterNames,
  initialPrimaryActionId,
  launchTab: launchTabProp = "all",
  onReconfigure,
}: DeploymentWizardProps) {
  const entryMode = entryModeProp;
  const launchTab = launchTabProp;
  const steps = useMemo(
    () => buildWizardSteps(entryMode),
    [entryMode],
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(() =>
    buildInitialFormData(initialLabelSelector, launchTab, {
      initialSelectedClusterNames,
      initialPrimaryActionId,
    }),
  );
  /** Prototype: user-saved rollout strategies (in-memory for this session). */
  const [userRolloutStrategies, setUserRolloutStrategies] = useState<
    UserRolloutStrategy[]
  >([]);
  /** Controlled so picking an option closes reliably inside the modal overlay. */
  const [startDifferentlyOpen, setStartDifferentlyOpen] = useState(false);
  const wizardBodyRef = useRef<HTMLDivElement>(null);

  const totalSteps = 5;

  const hasPrimaryAction = Boolean(
    formData.selectedActions?.[0]?.id,
  );

  const canGoToStep = useCallback(
    (stepNumber: number) => {
      if (stepNumber < 1 || stepNumber > totalSteps) {
        return false;
      }
      if (hasPrimaryAction) {
        return true;
      }
      if (entryMode === "action-first") {
        return stepNumber === 1;
      }
      // placement-first: Placement (1) and Action (2) reachable before a catalog pick
      return stepNumber <= 2;
    },
    [entryMode, hasPrimaryAction],
  );

  const canAdvanceFromCurrentStep = useMemo(() => {
    if (currentStep >= totalSteps) {
      return true;
    }
    const cur = steps[currentStep - 1];
    if (!cur) {
      return true;
    }
    if (cur.contentId === 1) {
      return hasPrimaryAction;
    }
    return true;
  }, [currentStep, hasPrimaryAction, steps, totalSteps]);

  useEffect(() => {
    setCurrentStep((s) => {
      let next = s;
      while (next > 1 && !canGoToStep(next)) {
        next -= 1;
      }
      return next;
    });
  }, [canGoToStep, hasPrimaryAction]);

  /** Keep the scrollable step pane pinned to the top whenever the active step changes. */
  useEffect(() => {
    queueMicrotask(() => {
      requestAnimationFrame(() => {
        const el = wizardBodyRef.current;
        if (el) {
          el.scrollTop = 0;
        }
      });
    });
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < totalSteps && !canAdvanceFromCurrentStep) {
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    let nextUserRolloutStrategies = userRolloutStrategies;
    const saveName = (formData.saveRolloutStrategyName as string | undefined)
      ?.trim();
    if (formData.saveRolloutStrategyForReuse && saveName) {
      const entry: UserRolloutStrategy = {
        id: `usr-${Date.now()}`,
        name: saveName,
        kind: "custom",
        snapshot: snapshotRolloutFieldsForSave(formData),
      };
      nextUserRolloutStrategies = [...userRolloutStrategies, entry];
      setUserRolloutStrategies(nextUserRolloutStrategies);
    }
    onComplete({
      ...formData,
      wizardEntryMode: entryMode,
      wizardLaunchTab: launchTab,
      userRolloutStrategies: nextUserRolloutStrategies,
    });
  };

  const handleAiPlanApplied = useCallback(() => {
    setCurrentStep((n) => Math.min(n + 1, 5));
  }, []);

  const activeStep = steps[currentStep - 1];

  return (
    <ModalOverlay onClose={onCancel}>
      {/* Custom modal container to avoid ModalContent styling conflicts with PatternFly */}
      <div
        className="w-full max-w-5xl flex rounded-lg overflow-hidden"
        style={{
          minHeight: "600px",
          maxHeight: "85vh",
          borderRadius: "var(--radius)",
          boxShadow: "var(--elevation-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
          {/* Left Sidebar - Steps Navigation */}
          <div
            className="w-64 flex-shrink-0 p-6"
            style={{
              backgroundColor: "var(--secondary)",
              borderRight: "1px solid var(--border)",
            }}
          >
            {/* Wizard Title */}
            <div className="mb-6">
              <CardTitle className="min-w-0 pr-1">
                {deploymentCopy.wizard.title}
              </CardTitle>
            </div>

            {/* Steps List */}
            <nav className="space-y-1">
              {steps.map((step) => {
                const stepAllowed = canGoToStep(step.number);
                return (
                <button
                  key={step.number}
                  type="button"
                  disabled={!stepAllowed}
                  aria-disabled={!stepAllowed}
                  onClick={() => {
                    if (stepAllowed) {
                      setCurrentStep(step.number);
                    }
                  }}
                  className="w-full text-left px-3 py-3 rounded transition-colors flex items-start gap-3"
                  style={{
                    borderRadius: "var(--radius)",
                    opacity: stepAllowed ? 1 : 0.45,
                    cursor: stepAllowed ? "pointer" : "not-allowed",
                    backgroundColor:
                      currentStep === step.number
                        ? "var(--primary)"
                        : "transparent",
                    color:
                      currentStep === step.number
                        ? "var(--primary-foreground)"
                        : "var(--foreground)",
                  }}
                >
                  {/* Step Number */}
                  <div
                    className="flex items-center justify-center size-6 rounded-full border-2 flex-shrink-0"
                    style={{
                      borderColor:
                        currentStep === step.number
                          ? "var(--primary-foreground)"
                          : step.number < currentStep
                            ? "var(--primary)"
                            : "var(--border)",
                      backgroundColor:
                        step.number < currentStep &&
                        currentStep !== step.number
                          ? "var(--primary)"
                          : "transparent",
                      color:
                        step.number < currentStep &&
                        currentStep !== step.number
                          ? "var(--primary-foreground)"
                          : currentStep === step.number
                            ? "var(--primary-foreground)"
                            : "var(--muted-foreground)",
                    }}
                  >
                    {step.number < currentStep ? (
                      <svg
                        className="size-3.5"
                        fill="none"
                        viewBox="0 0 16 16"
                      >
                        <path
                          d="M13 4L6 11L3 8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <TinyText
                        style={{
                          fontWeight:
                            "var(--font-weight-medium)",
                          fontSize: "11px",
                          color: "inherit",
                        }}
                      >
                        {step.number}
                      </TinyText>
                    )}
                  </div>

                  {/* Step Label */}
                  <SmallText
                    style={{
                      fontWeight:
                        currentStep === step.number
                          ? "var(--font-weight-medium)"
                          : "var(--font-weight-normal)",
                      color: "inherit",
                      lineHeight: "1.5",
                    }}
                  >
                    {step.label}
                  </SmallText>
                </button>
              );
              })}
            </nav>
          </div>

          {/* Right Content Area */}
          <div
            className="flex-1 flex flex-col"
            style={{ minHeight: 0, backgroundColor: "var(--card)" }}
          >
            {/* Header with Close Button */}
            <div
              className="px-6 py-4 flex items-start justify-between flex-shrink-0"
              style={{
                backgroundColor: "var(--secondary)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div>
                <h4
                  style={{
                    fontFamily: "var(--font-family-display)",
                    fontSize: "var(--text-lg)",
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--foreground)",
                  }}
                >
                  {activeStep.label}
                </h4>
                <TinyText muted className="mt-1">
                  {activeStep.hint}
                </TinyText>
              </div>

              <div className="flex flex-shrink-0 items-center gap-1">
                {onReconfigure && (
                  <DropdownMenu
                    modal={false}
                    open={startDifferentlyOpen}
                    onOpenChange={setStartDifferentlyOpen}
                  >
                    <DropdownMenuTrigger
                      type="button"
                      className="inline-flex items-center gap-1 rounded px-3 py-2 text-sm font-medium text-primary outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        fontFamily: "var(--font-family-text)",
                        borderRadius: "var(--radius)",
                        backgroundColor: "transparent",
                      }}
                    >
                        {deploymentCopy.wizard.startDifferently}
                      <ChevronDown
                        className="size-4 opacity-80"
                        aria-hidden
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="z-[200] max-h-72 w-56 overflow-y-auto"
                      onCloseAutoFocus={(e) => e.preventDefault()}
                    >
                      <CreateDeploymentMenuContent
                        onPick={(opts) => {
                          setStartDifferentlyOpen(false);
                          onReconfigure(opts);
                        }}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <button
                  onClick={onCancel}
                  className="p-1.5 rounded transition-colors hover:bg-muted"
                  style={{ borderRadius: "var(--radius)" }}
                  aria-label="Close wizard"
                >
                  <svg
                    className="size-5"
                    fill="none"
                    viewBox="0 0 16 16"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <path
                      d="M12 4L4 12M4 4L12 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                </svg>
                </button>
              </div>
            </div>

            {/* Step Content - Scrollable */}
            <div
              ref={wizardBodyRef}
              className="flex-1 overflow-y-auto px-6 py-6"
              style={{ backgroundColor: "var(--background)" }}
            >
              {activeStep.contentId === 1 && (
                <Step1Content
                  formData={formData}
                  setFormData={setFormData}
                  launchTab={launchTab}
                  entryMode={entryMode}
                  onAIPlanApplied={handleAiPlanApplied}
                />
              )}
              {activeStep.contentId === 2 && (
                <Step2Content
                  formData={formData}
                  setFormData={setFormData}
                  entryMode={entryMode}
                />
              )}
              {activeStep.contentId === 3 && (
                <Step3Content
                  formData={formData}
                  setFormData={setFormData}
                  userRolloutStrategies={userRolloutStrategies}
                />
              )}
              {activeStep.contentId === 4 && (
                <Step4Content
                  formData={formData}
                  setFormData={setFormData}
                />
              )}
              {activeStep.contentId === 5 && (
                <Step5Content
                  formData={formData}
                  wizardEntryMode={entryMode}
                  userRolloutStrategies={userRolloutStrategies}
                />
              )}
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 flex items-center justify-between flex-shrink-0"
              style={{
                borderTop: "1px solid var(--border)",
                backgroundColor: "var(--background)",
              }}
            >
              <SecondaryButton onClick={onCancel}>
                {deploymentCopy.wizard.cancel}
              </SecondaryButton>
              <div className="flex items-center gap-3">
                {currentStep > 1 && (
                  <SecondaryButton onClick={handleBack}>
                    {deploymentCopy.wizard.back}
                  </SecondaryButton>
                )}
                {currentStep < totalSteps ? (
                  <PrimaryButton
                    onClick={handleNext}
                    disabled={!canAdvanceFromCurrentStep}
                  >
                    {deploymentCopy.wizard.next}
                  </PrimaryButton>
                ) : (
                  <PrimaryButton onClick={handleSubmit}>
                    {deploymentCopy.wizard.createDeploymentSubmit}
                  </PrimaryButton>
                )}
              </div>
            </div>
          </div>
        </div>
    </ModalOverlay>
  );
}

const CATALOG_GRID_SKELETON_CARDS = 4;

function CatalogGridSkeletonCard({ index }: { index: number }) {
  return (
    <li className="pointer-events-none select-none" aria-hidden>
      <div
        className="flex min-h-24 flex-col justify-between gap-2 rounded-md border p-3"
        style={{
          borderRadius: "var(--radius)",
          borderColor: "var(--border)",
        }}
      >
        <div className="space-y-2">
          <div
            className="h-2 w-12 rounded animate-pulse"
            style={{
              backgroundColor: "var(--muted)",
              opacity: 0.75,
              animationDelay: `${index * 60}ms`,
            }}
          />
          <div
            className="h-4 max-w-[78%] rounded animate-pulse"
            style={{
              backgroundColor: "var(--muted)",
              animationDelay: `${index * 60 + 30}ms`,
            }}
          />
        </div>
        <div className="space-y-1.5">
          <div
            className="h-2.5 w-full rounded animate-pulse"
            style={{
              backgroundColor: "var(--muted)",
              opacity: 0.5,
            }}
          />
          <div
            className="h-2.5 max-w-[72%] rounded animate-pulse"
            style={{
              backgroundColor: "var(--muted)",
              opacity: 0.45,
            }}
          />
        </div>
      </div>
    </li>
  );
}

function Step1Content({
  formData,
  setFormData,
  launchTab = "all",
  entryMode = "action-first",
  onAIPlanApplied,
}: {
  formData: any;
  setFormData: (data: any) => void;
  /** Deployments area tab that opened the wizard — filters catalog + detail fields. */
  launchTab?: DeploymentTabId;
  entryMode?: WizardEntryMode;
  /** Called after “Use this plan” applies action + placement + rollout seed */
  onAIPlanApplied?: () => void;
}) {
  const [showDependentSearch, setShowDependentSearch] =
    useState(false);
  const [dependentSearchQuery, setDependentSearchQuery] =
    useState("");
  const [isDependentDropdownOpen, setIsDependentDropdownOpen] =
    useState(false);

  const [selectedActionType, setSelectedActionType] =
    useState<ActionType | null>(
      formData.selectedActions?.[0]?.type ?? null,
    );
  const [branchQuery, setBranchQuery] = useState("");
  const [catalogOmniboxQuery, setCatalogOmniboxQuery] = useState("");
  const [omniboxFocused, setOmniboxFocused] = useState(false);
  const [showAdvancedCatalog, setShowAdvancedCatalog] = useState(false);
  /**
   * `null` until a primary action exists, then "ai" | "manual".
   * Source (AI vs manual) only appears after a catalog action is selected.
   */
  const [step1PathMode, setStep1PathMode] = useState<
    "ai" | "manual" | null
  >(() => {
    if (!formData.selectedActions?.[0]?.id) {
      return null;
    }
    if (formData.aiPlanPrefill) {
      return "ai";
    }
    return "manual";
  });
  const omniboxRef = useRef<HTMLInputElement>(null);
  const omniboxContainerRef = useRef<HTMLDivElement>(null);
  const dependentActionSectionRef = useRef<HTMLDivElement>(null);
  const dependentSearchInputRef = useRef<HTMLInputElement>(null);

  const actionCatalog = useMemo(
    () => filterCatalogForTab(ALL_CATALOG_ACTIONS, launchTab),
    [launchTab],
  );

  const actionTypeChoicesFiltered = useMemo(
    () =>
      ACTION_TYPE_CHOICES.filter((c) =>
        actionCatalog.some((a) => a.type === c.type),
      ),
    [actionCatalog],
  );

  const placementInventoryForAI = useMemo(() => {
    const inv = getClustersMatchingPlacementInput(formData);
    const hasPlacementInput =
      formData.fleetSelection === "searchable"
        ? (formData.selectedClusters?.length ?? 0) > 0
        : Boolean((formData.labelSelector || "").trim());
    if (!hasPlacementInput) {
      return FLEET_MOCK_CLUSTERS;
    }
    return inv;
  }, [formData.fleetSelection, formData.labelSelector, formData.selectedClusters]);
  const currentPlacementLabel = (formData.labelSelector || "").trim();

  const recommendedActions = useMemo(() => {
    const ids = RECOMMENDED_ACTION_IDS[launchTab] ?? RECOMMENDED_ACTION_IDS.all;
    const map = new Map(actionCatalog.map((a) => [a.id, a]));
    const chain = ids
      .map((id) => map.get(id))
      .filter((a): a is ActionOption => Boolean(a));
    if (entryMode !== "placement-first") {
      return chain;
    }
    const inv = placementInventoryForAI;
    if (inv.length === 0) {
      return [] as ActionOption[];
    }
    const cap = inferInventoryCapabilities(inv);
    return chain.filter((a) => catalogActionFitsInventory(a, cap));
  }, [
    actionCatalog,
    launchTab,
    entryMode,
    placementInventoryForAI,
  ]);

  const omniboxMatches = useMemo(() => {
    const q = catalogOmniboxQuery.trim().toLowerCase();
    if (!q) return [];
    return actionCatalog
      .filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q),
      )
      .slice(0, 10);
  }, [actionCatalog, catalogOmniboxQuery]);

  const launchTabLabel =
    DEPLOYMENT_TAB_ORDER.find((t) => t.id === launchTab)?.label ?? "All";

  const omniboxPanelOpen =
    (omniboxFocused && catalogOmniboxQuery.trim().length === 0) ||
    catalogOmniboxQuery.trim().length > 0;

  const quickTemplateByActionId = useMemo(() => {
    const m = new Map<
      string,
      ReturnType<typeof quickTemplatesForCatalog>[number]
    >();
    for (const t of quickTemplatesForCatalog(actionCatalog)) {
      m.set(t.actionId, t);
    }
    return m;
  }, [actionCatalog]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        omniboxRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const root = omniboxContainerRef.current;
      if (!root || root.contains(e.target as Node)) return;
      setCatalogOmniboxQuery("");
      setOmniboxFocused(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const selectedActions: SelectedAction[] =
    formData.selectedActions || [];

  /** In AI mode, the primary is chosen above + reflected in the plan — hide its duplicate card; still show dependents. */
  const step1VisibleActions = useMemo((): SelectedAction[] => {
    if (step1PathMode === "ai" && selectedActions.length > 0) {
      return selectedActions.slice(1);
    }
    return selectedActions;
  }, [step1PathMode, selectedActions]);

  const aiSeedTargetZStream = (() => {
    const primary = selectedActions[0];
    if (
      !primary?.id ||
      !isOpenshiftCatalogUpdateId(primary.id) ||
      typeof primary.targetVersion !== "string"
    ) {
      return null;
    }
    const z = primary.targetVersion.trim();
    return z.length > 0 ? z : null;
  })();

  useEffect(() => {
    const p = formData.selectedActions?.[0];
    if (p) {
      setSelectedActionType(p.type);
    }
  }, [formData.selectedActions?.[0]?.id]);

  /** If the draft has a primary action but path mode is unset, align with prefill (AI) vs manual. */
  useEffect(() => {
    const id = formData.selectedActions?.[0]?.id;
    if (!id || step1PathMode != null) {
      return;
    }
    setStep1PathMode(formData.aiPlanPrefill ? "ai" : "manual");
  }, [formData.selectedActions?.[0]?.id, formData.aiPlanPrefill, step1PathMode]);

  /** Room for the absolutely positioned dependent-action list inside the wizard scroll pane. */
  useEffect(() => {
    if (!showDependentSearch) return;
    queueMicrotask(() => {
      dependentSearchInputRef.current?.focus();
    });
  }, [showDependentSearch]);

  useEffect(() => {
    if (!showDependentSearch && !isDependentDropdownOpen) return;
    const el = dependentActionSectionRef.current;
    if (!el) return;
    queueMicrotask(() => {
      requestAnimationFrame(() => {
        el.scrollIntoView({
          block: isDependentDropdownOpen ? "end" : "nearest",
          behavior: "smooth",
        });
      });
    });
  }, [showDependentSearch, isDependentDropdownOpen]);

  const handlePickActionType = (t: ActionType) => {
    setBranchQuery("");
    setSelectedActionType(t);
    if (
      selectedActions[0] &&
      selectedActions[0].type !== t
    ) {
      setFormData({
        ...formData,
        selectedActions: selectedActions.slice(1),
      });
    }
  };

  // Filter dependent actions - only show compatible ones
  const filteredDependentActions = actionCatalog.filter(
    (action) => {
      const query = dependentSearchQuery.toLowerCase();
      const matchesQuery =
        action.name.toLowerCase().includes(query) ||
        action.category.toLowerCase().includes(query) ||
        action.description.toLowerCase().includes(query);

      // If we have a primary action selected, filter by compatibility
      if (selectedActions.length > 0 && selectedActions[0].id) {
        const primaryAction = actionCatalog.find(
          (c) => c.id === selectedActions[0].id,
        );
        if (primaryAction?.compatibleWith) {
          return (
            matchesQuery &&
            primaryAction.compatibleWith.includes(action.id)
          );
        }
      }

      return matchesQuery;
    },
  );

  const branchActions = useMemo(
    () =>
      selectedActionType
        ? actionCatalog.filter(
            (a) => a.type === selectedActionType,
          )
        : [],
    [actionCatalog, selectedActionType],
  );

  const filteredBranchActions = useMemo(() => {
    const q = branchQuery.trim().toLowerCase();
    if (!q) {
      return branchActions;
    }
    return branchActions.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q),
    );
  }, [branchActions, branchQuery]);

  const groupedDependentActions =
    filteredDependentActions.reduce(
      (acc, action) => {
        if (!acc[action.category]) {
          acc[action.category] = [];
        }
        acc[action.category].push(action);
        return acc;
      },
      {} as Record<string, ActionOption[]>,
    );

  const handleSelectAction = (action: ActionOption) => {
    const newAction = buildSelectedFromOption(action);
    setFormData({
      ...formData,
      aiPlanPrefill: null,
      selectedActions: [newAction, ...selectedActions.slice(1)],
    });
    setSelectedActionType(action.type);
    setBranchQuery("");
    setCatalogOmniboxQuery("");
    setOmniboxFocused(false);
    setStep1PathMode("manual");
  };

  const applyQuickTemplate = useCallback(
    (tpl: ReturnType<typeof quickTemplatesForCatalog>[number]) => {
      const action = actionCatalog.find((a) => a.id === tpl.actionId);
      if (!action) return;
      const newAction = buildSelectedFromOption(action);
      setFormData((fd) => ({
        ...fd,
        aiPlanPrefill: null,
        selectedActions: [
          newAction,
          ...((fd.selectedActions || []) as SelectedAction[]).slice(1),
        ],
        catalogActionFieldValues: {
          ...(fd.catalogActionFieldValues || {}),
          ...(tpl.catalogFieldPatches || {}),
        },
      }));
      setSelectedActionType(action.type);
      setBranchQuery("");
      setCatalogOmniboxQuery("");
      setOmniboxFocused(false);
      setStep1PathMode("manual");
    },
    [actionCatalog],
  );

  const handleSelectDependentAction = (
    action: ActionOption,
  ) => {
    const newAction: SelectedAction = {
      id: action.id,
      type: action.type,
      name: action.name,
      description: action.description,
    };

    setFormData({
      ...formData,
      selectedActions: [...selectedActions, newAction],
    });
    setIsDependentDropdownOpen(false);
    setDependentSearchQuery("");
    setShowDependentSearch(false);
  };

  const handleRemoveAction = (index: number) => {
    const newActions = selectedActions.filter(
      (_, i) => i !== index,
    );
    setFormData({
      ...formData,
      ...(index === 0 ? { aiPlanPrefill: null } : {}),
      selectedActions: newActions,
    });
    if (index === 0) {
      setShowDependentSearch(false);
    }
    if (index === 0 && newActions.length === 0) {
      setSelectedActionType(null);
      setStep1PathMode(null);
    }
  };

  const updateActionVersion = (
    index: number,
    field: "sourceVersion" | "targetVersion",
    value: string,
  ) => {
    const newActions = [...selectedActions];
    newActions[index] = {
      ...newActions[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      selectedActions: newActions,
    });
  };

  const updateCatalogActionField = (
    actionId: string,
    fieldKey: string,
    value: string,
  ) => {
    const storageKey = `${actionId}::${fieldKey}`;
    setFormData({
      ...formData,
      catalogActionFieldValues: {
        ...(formData.catalogActionFieldValues || {}),
        [storageKey]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <AiPlanPrefillBanner formData={formData} compact />

      {/* Command-style action search — always first; pick a primary before AI / manual source */}
      <div ref={omniboxContainerRef} className="relative space-y-1">
        <SearchInput
          ref={omniboxRef}
          value={catalogOmniboxQuery}
          onChange={(e) => setCatalogOmniboxQuery(e.target.value)}
          onFocus={() => setOmniboxFocused(true)}
          placeholder={deploymentCopy.actionCatalog.omniboxPlaceholder}
          aria-label={deploymentCopy.actionCatalog.omniboxShortcutHint}
          aria-expanded={omniboxPanelOpen}
          aria-controls="step1-catalog-omnibox-listbox"
          aria-autocomplete="list"
        />
        {omniboxPanelOpen && (
          <ul
            id="step1-catalog-omnibox-listbox"
            className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border py-1 shadow-md"
            role="listbox"
            onMouseDown={(e) => e.preventDefault()}
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--popover)",
            }}
          >
            {catalogOmniboxQuery.trim().length > 0 ? (
              <>
                {omniboxMatches.length === 0 && (
                  <li className="px-3 py-2" role="presentation">
                    <TinyText muted>
                      {deploymentCopy.actionCatalog.omniboxNoMatches}
                    </TinyText>
                  </li>
                )}
                {omniboxMatches.map((action) => (
                  <li key={action.id} role="presentation">
                    <button
                      type="button"
                      role="option"
                      className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm transition-colors hover:bg-secondary/80"
                      onClick={() => handleSelectAction(action)}
                    >
                      <span style={{ fontWeight: "var(--font-weight-medium)" }}>
                        {action.name}
                      </span>
                      <TinyText muted className="line-clamp-1">
                        {action.description}
                      </TinyText>
                    </button>
                  </li>
                ))}
              </>
            ) : (
              <>
                <li className="border-b px-3 py-2" role="presentation" style={{ borderColor: "var(--border)" }}>
                  <TinyText style={{ fontWeight: "var(--font-weight-medium)" }}>
                    {deploymentCopy.actionCatalog.omniboxAreaPicksHeading(
                      launchTabLabel,
                    )}
                  </TinyText>
                  <TinyText muted className="mt-0.5 block text-[11px] leading-snug">
                    {deploymentCopy.actionCatalog.omniboxAreaPicksHint}
                  </TinyText>
                </li>
                {recommendedActions.length === 0 ? (
                  <li className="px-3 py-2" role="presentation">
                    <TinyText muted>
                      {entryMode === "placement-first" &&
                      getClustersMatchingPlacementInput(formData).length === 0
                        ? deploymentCopy.actionCatalog.omniboxEmptyPlacementNoClusters
                        : entryMode === "placement-first"
                          ? deploymentCopy.actionCatalog.recommendedEmptyPlacementFirst
                          : deploymentCopy.actionCatalog.omniboxAreaPicksEmpty}
                    </TinyText>
                  </li>
                ) : (
                  recommendedActions.map((action) => {
                    const tpl = quickTemplateByActionId.get(action.id);
                    return (
                      <li key={action.id} role="presentation">
                        <button
                          type="button"
                          role="option"
                          className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm transition-colors hover:bg-secondary/80"
                          onClick={() =>
                            tpl ? applyQuickTemplate(tpl) : handleSelectAction(action)
                          }
                        >
                          <span style={{ fontWeight: "var(--font-weight-medium)" }}>
                            {action.name}
                          </span>
                          <TinyText muted className="line-clamp-1">
                            {action.description}
                          </TinyText>
                        </button>
                      </li>
                    );
                  })
                )}
              </>
            )}
          </ul>
        )}
        {!selectedActions[0]?.id && (
          <TinyText muted className="block leading-snug">
            {deploymentCopy.actionCatalog.step1SearchHint}
          </TinyText>
        )}
      </div>

      {(recommendedActions.length > 0 ||
        (entryMode === "placement-first" &&
          getClustersMatchingPlacementInput(formData).length > 0)) && (
        <div>
          <div className="mb-2 space-y-1">
            <LabelText className="!mb-0">
              {deploymentCopy.actionCatalog.recommendedTitle}
            </LabelText>
            <TinyText muted>
              {entryMode === "placement-first"
                ? deploymentCopy.actionCatalog.recommendedHintPlacementFirst
                : deploymentCopy.actionCatalog.recommendedHint}
            </TinyText>
          </div>
          {recommendedActions.length > 0 ? (
          <ul
            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            role="list"
          >
            {recommendedActions.map((action) => {
              const isChosen =
                selectedActions[0]?.id === action.id &&
                !formData.aiPlanPrefill;
              const tpl = quickTemplateByActionId.get(action.id);
              return (
                <li key={action.id}>
                  <button
                    type="button"
                    onClick={() =>
                      tpl ? applyQuickTemplate(tpl) : handleSelectAction(action)
                    }
                    className="flex w-full flex-col items-stretch gap-1 rounded-md border px-3 py-2.5 text-left transition-colors hover:border-primary/60 hover:bg-secondary/50"
                    style={{
                      borderRadius: "var(--radius)",
                      borderColor: isChosen
                        ? "var(--primary)"
                        : "var(--border)",
                      borderWidth: isChosen ? 2 : 1,
                      backgroundColor: isChosen
                        ? "var(--secondary)"
                        : "transparent",
                    }}
                    title={tpl ? tpl.hint : action.description}
                  >
                    <span
                      className="text-[10px] font-medium uppercase tracking-wide"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {action.category}
                    </span>
                    <SmallText
                      className="!mt-0.5 block"
                      style={{ fontWeight: "var(--font-weight-medium)" }}
                    >
                      {action.name}
                    </SmallText>
                  </button>
                </li>
              );
            })}
          </ul>
          ) : (
            <TinyText muted className="block text-[11px] leading-snug">
              {deploymentCopy.actionCatalog.recommendedEmptyPlacementFirst}
            </TinyText>
          )}
        </div>
      )}

      <div>
        <LinkButton
          type="button"
          onClick={() => setShowAdvancedCatalog((v) => !v)}
        >
          {showAdvancedCatalog
            ? deploymentCopy.actionCatalog.hideAdvancedCatalog
            : deploymentCopy.actionCatalog.showAdvancedCatalog}
        </LinkButton>
      </div>

      {/* 1) Verb — Update / Install / Apply / Delete / Create (advanced) */}
      {showAdvancedCatalog && (
        <div>
          <LabelText className="mb-2">
            What do you want to do?
          </LabelText>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
            {actionTypeChoicesFiltered.map((opt) => {
              const isActive = selectedActionType === opt.type;
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => handlePickActionType(opt.type)}
                  className="flex flex-col items-start gap-0.5 rounded-md border px-2.5 py-2.5 text-left transition-colors"
                  style={{
                    borderRadius: "var(--radius)",
                    borderColor: isActive
                      ? "var(--primary)"
                      : "var(--border)",
                    borderWidth: isActive ? 2 : 1,
                    backgroundColor: isActive
                      ? "var(--secondary)"
                      : "var(--card)",
                  }}
                >
                  <SmallText
                    style={{ fontWeight: "var(--font-weight-medium)" }}
                  >
                    {opt.label}
                  </SmallText>
                  <TinyText
                    muted
                    className="text-[10px] leading-snug line-clamp-2"
                  >
                    {opt.description}
                  </TinyText>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2) Specific actions in that branch (advanced catalog) */}
      {showAdvancedCatalog && selectedActionType && (
        <div>
          <div className="mb-2 flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
            <LabelText className="!mb-0">
              {selectedActionType === "update"
                ? "Or pick a catalog action (manual)"
                : "Choose a specific action"}
            </LabelText>
          </div>
          <TextInput
            className="mb-3"
            value={branchQuery}
            onChange={(e) => setBranchQuery(e.target.value)}
            placeholder="Filter by name, description, or id…"
          />
          {filteredBranchActions.length === 0 ? (
            <div
              className="rounded-md border border-dashed p-5 text-center"
              style={{ borderColor: "var(--border)" }}
            >
              <TinyText muted>
                {branchActions.length === 0
                  ? "No actions of this type are available in the current catalog (try another verb above)."
                  : "No actions match your filter. Clear the field or type something else."}
              </TinyText>
            </div>
          ) : (
            <ul
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              role="list"
            >
              {filteredBranchActions.map((action) => {
                const isChosen =
                  selectedActions[0]?.id === action.id &&
                  !formData.aiPlanPrefill;
                return (
                <li key={action.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectAction(action)}
                    className="flex w-full min-h-24 flex-col items-stretch justify-between gap-1 rounded-md border p-3 text-left transition-colors hover:border-primary/60 hover:bg-secondary/50"
                    style={{
                      borderRadius: "var(--radius)",
                      borderColor: isChosen
                        ? "var(--primary)"
                        : "var(--border)",
                      borderWidth: isChosen ? 2 : 1,
                      backgroundColor: isChosen
                        ? "var(--secondary)"
                        : "transparent",
                    }}
                  >
                    <div>
                      <span
                        className="text-[10px] font-medium uppercase tracking-wide"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {action.category}
                      </span>
                      <SmallText
                        className="!mt-0.5 block"
                        style={{ fontWeight: "var(--font-weight-medium)" }}
                      >
                        {action.name}
                      </SmallText>
                    </div>
                    <TinyText
                      muted
                      className="text-[11px] line-clamp-2 leading-snug"
                    >
                      {action.description}
                    </TinyText>
                  </button>
                </li>
              );
              })}
              {Array.from({ length: CATALOG_GRID_SKELETON_CARDS }, (_, i) => (
                <CatalogGridSkeletonCard
                  key={`catalog-grid-skeleton-${i}`}
                  index={i}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      {selectedActions[0]?.id && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <LabelText className="!mb-0">
            {deploymentCopy.actionCatalog.step1PathSwitchLabel}
          </LabelText>
          <div
            className="inline-flex flex-wrap gap-0.5 rounded-md border p-0.5"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--muted)",
            }}
            role="group"
            aria-label={deploymentCopy.actionCatalog.step1PathSwitchLabel}
          >
            <button
              type="button"
              onClick={() => setStep1PathMode("manual")}
              className="rounded px-3 py-1.5 text-left text-sm transition-colors"
              style={{
                backgroundColor:
                  step1PathMode === "manual" ? "var(--card)" : "transparent",
                boxShadow:
                  step1PathMode === "manual"
                    ? "0 1px 2px rgba(0,0,0,0.06)"
                    : "none",
                color: "var(--foreground)",
                fontWeight:
                  step1PathMode === "manual"
                    ? "var(--font-weight-medium)"
                    : "var(--font-weight-normal)",
              }}
            >
              {deploymentCopy.actionCatalog.step1PathManualTitle}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep1PathMode("ai");
                setSelectedActionType("update");
              }}
              className="rounded px-3 py-1.5 text-left text-sm transition-colors"
              style={{
                backgroundColor:
                  step1PathMode === "ai" ? "var(--card)" : "transparent",
                boxShadow:
                  step1PathMode === "ai"
                    ? "0 1px 2px rgba(0,0,0,0.06)"
                    : "none",
                color: "var(--foreground)",
                fontWeight:
                  step1PathMode === "ai"
                    ? "var(--font-weight-medium)"
                    : "var(--font-weight-normal)",
              }}
            >
              {deploymentCopy.actionCatalog.step1PathAiTitle}
            </button>
          </div>
        </div>
      )}

      {selectedActions[0]?.id && step1PathMode === "ai" && (
        <div
          className="overflow-hidden rounded-lg border"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--card)",
          }}
        >
          <div
            className="border-b px-3 py-2.5 sm:px-4"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <Sparkles
                className="mt-0.5 size-4 shrink-0"
                style={{ color: "var(--primary)" }}
                aria-hidden
              />
              <SmallText style={{ fontWeight: "var(--font-weight-medium)" }}>
                {deploymentCopy.aiPlans.panelTitle}
              </SmallText>
            </div>
            <TinyText muted className="mt-0.5 block text-[11px] leading-snug">
              {deploymentCopy.aiPlans.embeddedPanelHint}
            </TinyText>
          </div>
          <div
            className="px-2 pb-3 pt-1 sm:px-3"
            style={{ backgroundColor: "var(--card)" }}
            role="region"
            aria-label={deploymentCopy.aiPlans.panelTitle}
          >
            <AIActionPlansPanel
              embedded
              wizardEntryMode={entryMode}
              placementScopeRows={placementInventoryForAI}
              currentPlacementLabel={currentPlacementLabel}
              launchTab={launchTab}
              selectedCatalogActionId={selectedActions[0]?.id ?? null}
              initialDetailPlanId={formData.aiPlanPrefill?.planId ?? null}
              seedTargetZStream={aiSeedTargetZStream}
              onApplyPlan={(plan: AIUpdatePlan) => {
                const opt = ALL_CATALOG_ACTIONS.find(
                  (a) => a.id === plan.actionId,
                );
                if (!opt) {
                  return;
                }
                const newAction = buildSelectedFromOption(opt);
                newAction.sourceVersion = plan.fromVersion;
                newAction.targetVersion = plan.toVersion;
                newAction.description = `${plan.title} — ${opt.description}`;
                setFormData((fd) =>
                  mergeAIUpdatePlanIntoFormData(fd, plan, newAction),
                );
                setSelectedActionType("update");
                setBranchQuery("");
                setCatalogOmniboxQuery("");
                setStep1PathMode("ai");
                onAIPlanApplied?.();
              }}
            />
          </div>
        </div>
      )}

      {/* Primary / additional action cards — hidden for AI primary (catalog + plan already define it) */}
      {step1VisibleActions.length > 0 && (
        <div>
          <div className="mb-2">
            <LabelText className="!mb-0">
              {step1PathMode === "ai" && selectedActions.length > 1
                ? deploymentCopy.actionCatalog
                    .step1AdditionalActionsTitle
                : deploymentCopy.actionCatalog.manualActionSectionTitle}
            </LabelText>
          </div>
          <div className="space-y-0">
          {step1VisibleActions.map((action, j) => {
            const index =
              step1PathMode === "ai" && selectedActions.length > 0
                ? j + 1
                : j;
            return (
            <div key={`${action.id}-${index}`}>
              <div
                className="p-4 border rounded relative"
                style={{
                  borderRadius: "var(--radius)",
                  borderColor: "var(--primary)",
                  borderWidth: 2,
                  backgroundColor: "var(--secondary)",
                }}
              >
                {/* Order Badge */}
                {selectedActions.length > 1 && (
                  <div
                    className="absolute -left-3 top-4 size-8 rounded-full border-2 flex items-center justify-center"
                    style={{
                      backgroundColor: "var(--primary)",
                      borderColor: "var(--background)",
                      color: "var(--primary-foreground)",
                    }}
                  >
                    <TinyText
                      style={{
                        fontWeight: "var(--font-weight-bold)",
                        fontSize: "12px",
                        color: "inherit",
                      }}
                    >
                      {index + 1}
                    </TinyText>
                  </div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <SmallText
                      style={{
                        fontWeight: "var(--font-weight-medium)",
                      }}
                    >
                      {action.name}
                    </SmallText>
                  </div>
                  <button
                    onClick={() => handleRemoveAction(index)}
                    className="ml-4 p-1 hover:bg-destructive/10 rounded transition-colors"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    <svg
                      className="size-4"
                      fill="none"
                      viewBox="0 0 16 16"
                      style={{ color: "var(--destructive)" }}
                    >
                      <path
                        d="M12 4L4 12M4 4L12 12"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </button>
                </div>

                {index === 0 && (
                  <div
                    className="space-y-3 pt-3"
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <div>
                      <LabelText className="!mb-0">
                        {deploymentCopy.actionCatalog.parametersTitle}
                      </LabelText>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {getCatalogDetailFields(action.id, launchTab).map(
                        (field, fi) => {
                          if (field.kind === "placeholders") {
                            return (
                              <div
                                key={`placeholder-${fi}`}
                                className="sm:col-span-2"
                              >
                                <CatalogPlaceholderBars count={field.count} />
                              </div>
                            );
                          }
                          const sk = `${action.id}::${field.key}`;
                          const catalogVals =
                            (formData.catalogActionFieldValues ||
                              {}) as Record<string, string>;
                          if (field.kind === "select") {
                            const fallback = field.options[0]?.value ?? "";
                            return (
                              <div key={field.key}>
                                <TinyText muted className="mb-1.5 block">
                                  {field.label}
                                </TinyText>
                                <select
                                  className="w-full px-3 py-2 border rounded"
                                  style={{
                                    borderRadius: "var(--radius)",
                                    borderColor: "var(--border)",
                                    fontFamily: "var(--font-family-text)",
                                    fontSize: "var(--text-sm)",
                                    backgroundColor: "var(--card)",
                                  }}
                                  value={catalogVals[sk] ?? fallback}
                                  onChange={(e) =>
                                    updateCatalogActionField(
                                      action.id,
                                      field.key,
                                      e.target.value,
                                    )
                                  }
                                >
                                  {field.options.map((o) => (
                                    <option key={o.value} value={o.value}>
                                      {o.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            );
                          }
                          return (
                            <div key={field.key} className="sm:col-span-2">
                              <TinyText muted className="mb-1.5 block">
                                {field.label}
                              </TinyText>
                              <TextInput
                                value={catalogVals[sk] ?? ""}
                                onChange={(e) =>
                                  updateCatalogActionField(
                                    action.id,
                                    field.key,
                                    e.target.value,
                                  )
                                }
                                placeholder={field.placeholder}
                              />
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                )}

                {/* Version fields: OpenShift fleet = target z-stream only (baseline from placement in-product) */}
                {action.sourceVersion !== undefined &&
                  action.targetVersion !== undefined &&
                  (isOpenshiftCatalogUpdateId(action.id) ? (
                    <div
                      className="space-y-2 pt-3"
                      style={{
                        borderTop: "1px solid var(--border)",
                      }}
                    >
                      <div>
                        <TinyText muted className="mb-1.5">
                          {
                            deploymentCopy.actionCatalog
                              .openshiftTargetVersionLabel
                          }
                        </TinyText>
                        <select
                          value={action.targetVersion}
                          onChange={(e) =>
                            updateActionVersion(
                              index,
                              "targetVersion",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border rounded"
                          style={{
                            borderRadius: "var(--radius)",
                            borderColor: "var(--border)",
                            fontFamily: "var(--font-family-text)",
                            fontSize: "var(--text-sm)",
                            backgroundColor: "var(--card)",
                          }}
                        >
                          {action.id === "update-ocp-4.17" ? (
                            <>
                              <option value="4.17.8">4.17.8</option>
                              <option value="4.17.10">4.17.10</option>
                              <option value="4.17.12">4.17.12</option>
                            </>
                          ) : (
                            <>
                              <option value="4.18.1">4.18.1</option>
                              <option value="4.18.2">4.18.2</option>
                              <option value="4.18.3">4.18.3</option>
                              <option value="4.18.4">4.18.4</option>
                              <option value="4.18.5">4.18.5</option>
                              <option value="4.18.6">4.18.6</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="grid grid-cols-2 gap-3 pt-3"
                      style={{
                        borderTop: "1px solid var(--border)",
                      }}
                    >
                      <div>
                        <TinyText muted className="mb-1.5">
                          Source version
                        </TinyText>
                        <select
                          value={action.sourceVersion}
                          onChange={(e) =>
                            updateActionVersion(
                              index,
                              "sourceVersion",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border rounded"
                          style={{
                            borderRadius: "var(--radius)",
                            borderColor: "var(--border)",
                            fontFamily:
                              "var(--font-family-text)",
                            fontSize: "var(--text-sm)",
                            backgroundColor: "var(--card)",
                          }}
                        >
                          {action.id?.startsWith("update-etcd") ? (
                            <>
                              <option value="3.5.7">3.5.7</option>
                              <option value="3.5.9">3.5.9</option>
                            </>
                          ) : (
                            <>
                              <option value="4.14.8">4.14.8</option>
                              <option value="4.15.12">4.15.12</option>
                              <option value="4.16.2">4.16.2</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div>
                        <TinyText muted className="mb-1.5">
                          Target version
                        </TinyText>
                        <select
                          value={action.targetVersion}
                          onChange={(e) =>
                            updateActionVersion(
                              index,
                              "targetVersion",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border rounded"
                          style={{
                            borderRadius: "var(--radius)",
                            borderColor: "var(--border)",
                            fontFamily:
                              "var(--font-family-text)",
                            fontSize: "var(--text-sm)",
                            backgroundColor: "var(--card)",
                          }}
                        >
                          {action.id?.startsWith("update-etcd") ? (
                            <>
                              <option value="3.5.11">3.5.11</option>
                              <option value="3.5.12">3.5.12</option>
                            </>
                          ) : (
                            <>
                              <option value="4.16.2">4.16.2</option>
                              <option value="4.16.5">4.16.5</option>
                              <option value="4.17.0">4.17.0</option>
                              <option value="4.17.12">4.17.12</option>
                              <option value="4.18.3">4.18.3</option>
                              <option value="4.18.4">4.18.4</option>
                              <option value="4.18.5">4.18.5</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Arrow Connector between actions */}
              {index < selectedActions.length - 1 && (
                <div className="flex items-center py-3 pl-3">
                  <svg
                    className="size-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <path
                      d="M12 5V19M12 19L8 15M12 19L16 15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <SmallText muted className="ml-2">
                    Executes after step {index + 1} completes
                  </SmallText>
                </div>
              )}
            </div>
          );
          })}
          </div>
        </div>
      )}

      {/* Add Dependent Action — extra bottom space when menu is open so overflow-y-auto can scroll past the absolute dropdown */}
      {selectedActions.length > 0 &&
        selectedActions.length < 3 && (
        <div
          ref={dependentActionSectionRef}
          style={{
            paddingBottom:
              showDependentSearch && isDependentDropdownOpen
                ? "min(28rem, 60vh)"
                : undefined,
            scrollMarginBottom:
              showDependentSearch && isDependentDropdownOpen
                ? "min(28rem, 60vh)"
                : undefined,
          }}
        >
          {!showDependentSearch && (
            <div>
              <LinkButton
                className="flex items-center gap-2"
                onClick={() => setShowDependentSearch(true)}
              >
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M3.33333 8H12.6667"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.33333"
                  />
                  <path
                    d="M8 3.33333V12.6667"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.33333"
                  />
                </svg>
                <span>Add dependent action</span>
              </LinkButton>
            </div>
          )}

          {/* Dependent Action Search */}
          {showDependentSearch && (
            <div>
          <LabelText className="mb-2">
            Add compatible dependent action
          </LabelText>
          <div className="relative">
            <div
              className="relative"
              onFocus={() => setIsDependentDropdownOpen(true)}
            >
              <input
                ref={dependentSearchInputRef}
                type="text"
                value={dependentSearchQuery}
                onChange={(e) => {
                  setDependentSearchQuery(e.target.value);
                  setIsDependentDropdownOpen(true);
                }}
                placeholder="Search compatible actions..."
                className="w-full px-4 py-2.5 border rounded pr-10"
                style={{
                  borderRadius: "var(--radius)",
                  borderColor: "var(--border)",
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-sm)",
                  color: "var(--foreground)",
                  backgroundColor: "var(--background)",
                }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
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
            </div>

            {/* Dropdown */}
            {isDependentDropdownOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() =>
                    setIsDependentDropdownOpen(false)
                  }
                />

                {/* Dropdown content */}
                <div
                  className="absolute top-full left-0 right-0 mt-1 bg-card border z-20 max-h-96 overflow-y-auto"
                  style={{
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                    boxShadow:
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  }}
                >
                  {Object.keys(groupedDependentActions).length >
                  0 ? (
                    <>
                      <div
                        className="px-4 py-2"
                        style={{
                          backgroundColor: "var(--secondary)",
                          borderBottom:
                            "1px solid var(--border)",
                        }}
                      >
                        <TinyText muted>
                          Showing actions compatible with{" "}
                          {selectedActions[0].name}
                        </TinyText>
                      </div>
                      {Object.entries(
                        groupedDependentActions,
                      ).map(([category, actions]) => (
                        <div key={category}>
                          <div
                            className="px-4 py-2"
                            style={{
                              backgroundColor: "var(--muted)",
                              borderBottom:
                                "1px solid var(--border)",
                            }}
                          >
                            <TinyText
                              style={{
                                fontWeight:
                                  "var(--font-weight-medium)",
                                color:
                                  "var(--muted-foreground)",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              {category}
                            </TinyText>
                          </div>
                          {actions.map((action) => (
                            <button
                              key={action.id}
                              onClick={() =>
                                handleSelectDependentAction(
                                  action,
                                )
                              }
                              className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors"
                              style={{
                                borderBottom:
                                  "1px solid var(--border)",
                              }}
                            >
                              <SmallText
                                style={{
                                  fontWeight:
                                    "var(--font-weight-medium)",
                                }}
                              >
                                {action.name}
                              </SmallText>
                              <TinyText muted className="mt-1">
                                {action.description}
                              </TinyText>
                            </button>
                          ))}
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <TinyText muted>
                        {filteredDependentActions.length ===
                          0 && dependentSearchQuery
                          ? `No compatible actions found matching "${dependentSearchQuery}"`
                          : "No compatible actions available"}
                      </TinyText>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const allClusters = FLEET_MOCK_CLUSTERS;
type ClusterInventoryRow = FleetClusterRow;

function cmpOcpVersion(a: string, b: string): number {
  const pa = a.split(".").map((x) => parseInt(x, 10) || 0);
  const pb = b.split(".").map((x) => parseInt(x, 10) || 0);
  const len = Math.max(pa.length, pb.length, 3);
  for (let i = 0; i < len; i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) return da - db;
  }
  return 0;
}

type UpdateReadiness = "ok" | "above_target" | "below_baseline" | "na";

function clusterUpdateReadiness(
  cluster: ClusterInventoryRow,
  primary: SelectedAction | undefined,
): UpdateReadiness {
  if (!primary || primary.type !== "update") return "na";
  if (!isOpenshiftCatalogUpdateId(primary.id)) return "na";
  const cur = cluster.ocpCurrent;
  if (!cur || !primary.targetVersion) return "na";
  const tgt = primary.targetVersion;
  const src = primary.sourceVersion || "0.0.0";
  if (cmpOcpVersion(cur, tgt) >= 0) return "above_target";
  if (cmpOcpVersion(cur, src) < 0) return "below_baseline";
  return "ok";
}

function formatClusterUpdateReadinessLabel(r: UpdateReadiness): string {
  switch (r) {
    case "ok":
      return deploymentCopy.placement.placementReadinessOk;
    case "above_target":
      return deploymentCopy.placement.placementReadinessAboveTarget;
    case "below_baseline":
      return deploymentCopy.placement.placementReadinessBelowBaseline;
    default:
      return deploymentCopy.placement.placementReadinessUnknown;
  }
}

function buildPlacementSuggestionsForUpdate(
  primary: SelectedAction | undefined,
): Array<{
  id: string;
  title: string;
  selector: string;
  matched: number;
  ready: number;
}> {
  if (!primary || primary.type !== "update" || !primary.id) return [];
  const templates: { id: string; title: string; selector: string }[] = [
    { id: "prod", title: "Production", selector: "env=prod" },
    { id: "prod-web", title: "Prod · web tier", selector: "tier=web" },
    { id: "prod-data", title: "Prod · data tier", selector: "tier=data" },
    { id: "canary", title: "Canary", selector: "env=canary" },
    { id: "staging", title: "Staging", selector: "env=staging" },
    { id: "dev", title: "Development", selector: "env=dev" },
    { id: "us-east-1", title: "Region us-east-1", selector: "us-east-1" },
  ];
  return templates
    .map((t) => {
      const matched = matchClustersByLabelFragment(t.selector);
      const ready = matched.filter(
        (c) => clusterUpdateReadiness(c, primary) === "ok",
      ).length;
      return { ...t, matched: matched.length, ready };
    })
    .filter((r) => r.matched > 0)
    .sort((a, b) => b.ready - a.ready || b.matched - a.matched)
    .slice(0, 6);
}

/**
 * Phase-1 canary labels use AND semantics within Placement: every comma term must match.
 * Supports `env=` and `region=` against cluster fields; other terms match name or any label.
 */
function clusterMatchesAllSelectorTerms(
  cluster: ClusterInventoryRow,
  selector: string,
): boolean {
  const parts = selector
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (parts.length === 0) {
    return false;
  }
  return parts.every((part) => {
    if (part.startsWith("env=")) {
      const v = part.slice("env=".length).trim();
      return cluster.env.toLowerCase() === v;
    }
    if (part.startsWith("region=")) {
      const v = part.slice("region=".length).trim();
      return cluster.region.toLowerCase() === v;
    }
    return (
      cluster.labels.some((label) => label.toLowerCase().includes(part)) ||
      cluster.name.toLowerCase().includes(part)
    );
  });
}

function countClustersMatchingAllTerms(selector: string): number {
  if (!selector?.trim()) {
    return 0;
  }
  return allClusters.filter((c) =>
    clusterMatchesAllSelectorTerms(c, selector),
  ).length;
}

function getClustersMatchingPlacement(fd: {
  fleetSelection: string;
  labelSelector?: string;
  selectedClusters?: string[];
}): ClusterInventoryRow[] {
  return getClustersMatchingPlacementInput(fd);
}

/**
 * Canary rollout slice = clusters in Placement that also satisfy every term in the
 * Canary rollout AND selector (typically extra region / pool / tier vs full placement).
 */
function getCanaryClustersInPlacementScope(formData: {
  fleetSelection: string;
  labelSelector?: string;
  selectedClusters?: string[];
  canarySelector?: string;
}): ClusterInventoryRow[] {
  const inScope = getClustersMatchingPlacement(formData);
  const sel = (formData.canarySelector || "").trim();
  if (!sel || inScope.length === 0) {
    return [];
  }
  return inScope.filter((c) => clusterMatchesAllSelectorTerms(c, sel));
}

function AiPlanPrefillBanner({
  formData,
  compact,
}: {
  formData: any;
  /** Shorter line for step 1 so the page doesn’t feel crowded */
  compact?: boolean;
}) {
  const pre = formData.aiPlanPrefill as
    | { planNumber: number; planId: string; title: string }
    | null
    | undefined;
  if (!pre) {
    return null;
  }
  const n = getClustersMatchingPlacement(formData).length;
  return (
    <Alert
      variant="info"
      isInline
      title={`Prefilled from AI plan #${pre.planNumber}`}
    >
      {compact ? (
        <p className="m-0 text-sm leading-snug" style={{ lineHeight: 1.5 }}>
          <span style={{ fontWeight: 600 }}>{pre.title}</span>
          {". "}
          {n > 0 ? (
            <>
              {n} matching cluster{n === 1 ? "" : "s"} in demo inventory
              for the suggested label. Edit the action or label if needed.
            </>
          ) : (
            <>
              Adjust the label selector (Placement) if the demo list shows
              no matches.
            </>
          )}
        </p>
      ) : (
        <p className="m-0 text-sm leading-snug" style={{ lineHeight: 1.5 }}>
          <span style={{ fontWeight: 600 }}>{pre.title}</span>
          {` — the catalog action, label placement, and rollout options below
          are seeded from this plan. `}
          {n > 0 ? (
            <>
              Demo target inventory:{" "}
              <span style={{ fontWeight: 600 }}>
                {n} cluster{n === 1 ? " matches" : "s match"}
              </span>{" "}
              the suggested selector; review and change any field.
            </>
          ) : (
            <>
              No demo clusters match the suggested selector as written; edit
              the label on the Placement step to align with your fleet.
            </>
          )}
        </p>
      )}
    </Alert>
  );
}

/** Concise, selection-driven hints from wizard inventory (prototype — swap for a live agent). */
function buildPlacementInsight(
  formData: {
    fleetSelection: string;
    labelSelector?: string;
    selectedClusters?: string[];
  },
  matchedClusters: ClusterInventoryRow[],
  primaryAction?: SelectedAction,
): { headline: string; insights: string[] } {
  const n = matchedClusters.length;
  if (n === 0) {
    return { headline: "", insights: [] };
  }

  const regions = [...new Set(matchedClusters.map((c) => c.region))].sort();
  const envCounts: Record<string, number> = {};
  for (const c of matchedClusters) {
    envCounts[c.env] = (envCounts[c.env] ?? 0) + 1;
  }
  const envParts = Object.entries(envCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([e, ct]) => `${ct}×${e}`);

  const headline = `${n} cluster${n === 1 ? "" : "s"} · ${regions.join(" & ")} · ${envParts.join(", ")}`;

  const hasCanary = matchedClusters.some(
    (c) =>
      c.env === "canary" ||
      c.name.toLowerCase().includes("canary") ||
      c.labels.some((l) => l.toLowerCase().includes("canary")),
  );

  const insights: string[] = [];

  if (formData.fleetSelection === "label" && formData.labelSelector?.trim()) {
    insights.push(
      `Label selector is dynamic—membership can change when policies reconcile (showing ${n} match${n === 1 ? "" : "es"} now).`,
    );
  } else if (
    formData.fleetSelection === "searchable" &&
    (formData.selectedClusters?.length ?? 0) > 0
  ) {
    insights.push(
      `Hand-picked list: ${formData.selectedClusters?.length} cluster name(s); adjust checkboxes to change scope.`,
    );
  }

  const ineligible = matchedClusters.filter(
    (c) => clusterUpdateReadiness(c, primaryAction) !== "ok",
  ).length;
  if (ineligible > 0 && primaryAction?.type === "update") {
    insights.push(
      deploymentCopy.placement.placementInsightSomeIneligible(ineligible),
    );
  }

  if (envCounts.prod && envCounts.prod > 0) {
    insights.push(
      `${envCounts.prod} production cluster(s)—treat failures as high impact; confirm rollback and signals for this change class.`,
    );
  }
  if (hasCanary) {
    insights.push(
      "Canary in scope: use a soak on this slice before rolling the same change class wider.",
    );
  }
  if (regions.length >= 2) {
    insights.push(
      "Multiple regions: consider staggering waves or aligning windows if dependencies differ by site.",
    );
  }

  return { headline, insights: insights.slice(0, 3) };
}

function Step2Content({
  formData,
  setFormData,
  entryMode = "action-first",
}: {
  formData: any;
  setFormData: (data: any) => void;
  entryMode?: WizardEntryMode;
}) {
  const [clusterSearch, setClusterSearch] = useState("");

  const primaryAction = formData.selectedActions?.[0] as
    | SelectedAction
    | undefined;
  const showPlacementUpdateSmarts =
    entryMode === "action-first" &&
    primaryAction?.type === "update" &&
    Boolean(primaryAction?.id);
  const showOcpReadinessColumn =
    showPlacementUpdateSmarts &&
    Boolean(primaryAction?.id) &&
    isOpenshiftCatalogUpdateId(primaryAction.id);

  // Get selected clusters from formData or default to empty array
  const selectedClusterNames: string[] = formData.selectedClusters || [];

  const matchedClusters = useMemo(
    () => getClustersMatchingPlacement(formData),
    [
      formData.fleetSelection,
      formData.labelSelector,
      formData.selectedClusters,
    ],
  );

  const placementInsight = useMemo(
    () => buildPlacementInsight(formData, matchedClusters, primaryAction),
    [
      formData.fleetSelection,
      formData.labelSelector,
      formData.selectedClusters,
      matchedClusters,
      primaryAction?.id,
      primaryAction?.type,
      primaryAction?.sourceVersion,
      primaryAction?.targetVersion,
    ],
  );

  const placementSuggestions = useMemo(
    () => buildPlacementSuggestionsForUpdate(primaryAction),
    [
      primaryAction?.id,
      primaryAction?.type,
      primaryAction?.sourceVersion,
      primaryAction?.targetVersion,
    ],
  );

  // Filter available clusters for the searchable list
  const filteredClusters = clusterSearch
    ? allClusters.filter((c) =>
        c.name.toLowerCase().includes(clusterSearch.toLowerCase())
      )
    : allClusters;

  const toggleClusterSelection = (clusterName: string) => {
    const current = formData.selectedClusters || [];
    const updated = current.includes(clusterName)
      ? current.filter((n: string) => n !== clusterName)
      : [...current, clusterName];
    setFormData({ ...formData, selectedClusters: updated });
  };

  const quickPickChips =
    showPlacementUpdateSmarts && placementSuggestions.length > 0 ? (
      <div
        className="mt-3 space-y-2 border-t pt-3"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <SmallText style={{ fontWeight: "var(--font-weight-medium)" }}>
            {deploymentCopy.placement.placementQuickPicksTitle}
          </SmallText>
          <TinyText muted className="!text-[10px]">
            {deploymentCopy.placement.placementQuickPicksIntro}
          </TinyText>
        </div>
        <div
          className="overflow-hidden rounded-md border"
          style={{ borderColor: "var(--border)" }}
        >
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr style={{ backgroundColor: "var(--secondary)" }}>
                <th
                  className="px-2 py-1.5 font-medium sm:px-3"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <TinyText style={{ fontWeight: "var(--font-weight-medium)" }}>
                    {deploymentCopy.placement.placementQuickPickColScope}
                  </TinyText>
                </th>
                <th
                  className="hidden px-2 py-1.5 font-medium sm:table-cell sm:px-3"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <TinyText style={{ fontWeight: "var(--font-weight-medium)" }}>
                    {deploymentCopy.placement.placementQuickPickColSelector}
                  </TinyText>
                </th>
                <th
                  className="px-2 py-1.5 text-right font-medium sm:px-3"
                  style={{ borderBottom: "1px solid var(--border)", width: "4rem" }}
                >
                  <TinyText style={{ fontWeight: "var(--font-weight-medium)" }}>
                    {deploymentCopy.placement.placementQuickPickColMatches}
                  </TinyText>
                </th>
                <th
                  className="px-2 py-1.5 text-right font-medium sm:px-3"
                  style={{ borderBottom: "1px solid var(--border)", width: "3.5rem" }}
                >
                  <TinyText style={{ fontWeight: "var(--font-weight-medium)" }}>
                    {deploymentCopy.placement.placementQuickPickColReady}
                  </TinyText>
                </th>
              </tr>
            </thead>
            <tbody>
              {placementSuggestions.map((s, idx) => (
                <tr
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Apply label selector ${s.selector}`}
                  className="cursor-pointer transition-colors hover:bg-secondary"
                  style={{
                    borderBottom:
                      idx < placementSuggestions.length - 1
                        ? "1px solid var(--border)"
                        : undefined,
                    backgroundColor: "var(--card)",
                  }}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      fleetSelection: "label",
                      labelSelector: s.selector,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setFormData({
                        ...formData,
                        fleetSelection: "label",
                        labelSelector: s.selector,
                      });
                    }
                  }}
                >
                  <td className="px-2 py-2 align-middle sm:px-3">
                    <SmallText className="!text-[12px]">{s.title}</SmallText>
                    <code
                      className="mt-0.5 block truncate font-mono text-[10px] sm:hidden"
                      style={{ color: "var(--muted-foreground)" }}
                      title={s.selector}
                    >
                      {s.selector}
                    </code>
                  </td>
                  <td
                    className="hidden max-w-[10rem] truncate px-2 py-2 align-middle font-mono text-[10px] sm:table-cell sm:px-3 sm:max-w-[14rem]"
                    style={{ color: "var(--foreground)" }}
                    title={s.selector}
                  >
                    {s.selector}
                  </td>
                  <td className="px-2 py-2 text-right align-middle tabular-nums sm:px-3">
                    {deploymentCopy.placement.placementSuggestionMatched(s.matched)}
                  </td>
                  <td className="px-2 py-2 text-right align-middle tabular-nums sm:px-3">
                    {deploymentCopy.placement.placementSuggestionReady(
                      s.ready,
                      s.matched,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showOcpReadinessColumn ? (
          <TinyText muted className="!block !text-[10px] leading-snug">
            {deploymentCopy.placement.placementListReadinessHint}
          </TinyText>
        ) : null}
      </div>
    ) : null;

  return (
    <div className="space-y-8">
      <AiPlanPrefillBanner formData={formData} />

      {/* 1 · How you choose scope */}
      <section className="space-y-4">
        <header className="space-y-1.5">
          <div className="flex items-center gap-2">
            <SmallText
              style={{ fontWeight: "var(--font-weight-medium)" }}
            >
              {deploymentCopy.placement.clusterSelection}
            </SmallText>
            <div className="relative group">
              <svg
                className="size-4 cursor-help"
                fill="none"
                viewBox="0 0 16 16"
                style={{ color: "var(--muted-foreground)" }}
              >
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 7V11M8 5V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <div
                className="absolute left-1/2 bottom-full z-10 mb-2 -translate-x-1/2 rounded px-3 py-2 text-xs whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none"
                style={{
                  backgroundColor: "var(--foreground)",
                  color: "var(--background)",
                  borderRadius: "var(--radius)",
                }}
              >
                {deploymentCopy.placement.clusterSelectionHelpTooltip}
              </div>
            </div>
          </div>
          <TinyText muted className="!block max-w-3xl leading-snug">
            {deploymentCopy.placement.placementStepIntro}
          </TinyText>
        </header>

        {/* Radio Group */}
        <div className="space-y-2">
          <label
            className="flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors hover:bg-secondary"
            style={{
              borderRadius: "var(--radius)",
              borderColor:
                formData.fleetSelection === "label"
                  ? "var(--primary)"
                  : "var(--border)",
              backgroundColor:
                formData.fleetSelection === "label"
                  ? "var(--secondary)"
                  : "transparent",
            }}
          >
            <input
              type="radio"
              name="fleetSelection"
              value="label"
              checked={formData.fleetSelection === "label"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fleetSelection: e.target.value,
                })
              }
              className="size-4"
              style={{ accentColor: "var(--primary)" }}
            />
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              Select with label selector
            </SmallText>
          </label>

          <label
            className="flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors hover:bg-secondary"
            style={{
              borderRadius: "var(--radius)",
              borderColor:
                formData.fleetSelection === "searchable"
                  ? "var(--primary)"
                  : "var(--border)",
              backgroundColor:
                formData.fleetSelection === "searchable"
                  ? "var(--secondary)"
                  : "transparent",
            }}
          >
            <input
              type="radio"
              name="fleetSelection"
              value="searchable"
              checked={formData.fleetSelection === "searchable"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fleetSelection: e.target.value,
                })
              }
              className="size-4"
              style={{ accentColor: "var(--primary)" }}
            />
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              Select from cluster list
            </SmallText>
          </label>
        </div>

        {/* Label selector + quick picks */}
        {formData.fleetSelection === "label" && (
          <div
            className="rounded-md border p-3 sm:p-4"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--card)",
            }}
          >
            <LabelText className="!mb-2">Label selector</LabelText>
            <TextInput
              value={formData.labelSelector}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  labelSelector: e.target.value,
                })
              }
              placeholder="e.g., env=prod"
            />
            {quickPickChips}
            <TinyText muted className="mt-2 block leading-snug">
              {deploymentCopy.placement.placementLabelHintManual}
            </TinyText>
          </div>
        )}

        {/* Searchable cluster list */}
        {formData.fleetSelection === "searchable" && (
          <div
            className="rounded-md border p-3 sm:p-4"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--card)",
            }}
          >
            <SearchInput
              placeholder="Search clusters..."
              className="mb-3"
              value={clusterSearch}
              onChange={(e) => setClusterSearch(e.target.value)}
            />
            <div
              className="border rounded overflow-hidden"
              style={{
                borderRadius: "var(--radius)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="bg-secondary px-4 py-2 flex items-center justify-between"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <TinyText
                  style={{
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  Available clusters ({filteredClusters.length})
                </TinyText>
                {selectedClusterNames.length > 0 && (
                  <TinyText style={{ color: "var(--primary)" }}>
                    {selectedClusterNames.length} selected
                  </TinyText>
                )}
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredClusters.map((cluster) => (
                  <label
                    key={cluster.name}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-secondary cursor-pointer"
                    style={{
                      borderBottom: "1px solid var(--border)",
                      backgroundColor: selectedClusterNames.includes(cluster.name)
                        ? "var(--secondary)"
                        : "transparent",
                    }}
                  >
                    <input
                      type="checkbox"
                      className="size-4"
                      style={{ accentColor: "var(--primary)" }}
                      checked={selectedClusterNames.includes(cluster.name)}
                      onChange={() => toggleClusterSelection(cluster.name)}
                    />
                    <div className="flex-1 min-w-0">
                      <SmallText>{cluster.name}</SmallText>
                      <TinyText muted className="ml-2">
                        {cluster.env} · {cluster.region}
                        {showOcpReadinessColumn && cluster.ocpCurrent
                          ? ` · ${cluster.ocpCurrent}`
                          : ""}
                      </TinyText>
                      {showOcpReadinessColumn ? (
                        <TinyText
                          className="!mt-0.5 !block !text-[10px]"
                          style={{
                            color:
                              clusterUpdateReadiness(cluster, primaryAction) ===
                              "ok"
                                ? "var(--primary)"
                                : clusterUpdateReadiness(
                                      cluster,
                                      primaryAction,
                                    ) === "na"
                                  ? "var(--muted-foreground)"
                                  : "hsl(32 80% 32%)",
                          }}
                        >
                          {formatClusterUpdateReadinessLabel(
                            clusterUpdateReadiness(cluster, primaryAction),
                          )}
                        </TinyText>
                      ) : null}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2 · Preview: who matches */}
      <section className="space-y-3">
        <div
          className="flex flex-wrap items-end justify-between gap-3 border-b pb-3"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="min-w-0 space-y-0.5">
            <SmallText style={{ fontWeight: "var(--font-weight-medium)" }}>
              Matched clusters
            </SmallText>
            <TinyText muted className="!block !text-[11px] leading-snug">
              {deploymentCopy.placement.placementPreviewSubtitle}
            </TinyText>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <TinyText muted className="!text-[11px]">
              {matchedClusters.length}{" "}
              {matchedClusters.length === 1 ? "cluster" : "clusters"}
            </TinyText>
            <TinyText muted className="!text-[11px]">
              {deploymentCopy.placement.matchesAsOfPrefix}{" "}
              <span
                style={{
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--foreground)",
                }}
              >
                {formatTargetsSnapshotAt(formData.targetsSnapshotAt)}
              </span>
            </TinyText>
            <IconButton
              type="button"
              aria-label={deploymentCopy.placement.refreshMatchingTargetsAria}
              title={deploymentCopy.placement.refreshMatchingTargetsTitle}
              onClick={() =>
                setFormData({
                  ...formData,
                  targetsSnapshotAt: new Date().toISOString(),
                })
              }
            >
              <RefreshCw className="size-4" aria-hidden />
            </IconButton>
          </div>
        </div>

        {matchedClusters.length > 0 && (
          <div
            className="mb-3 flex gap-2.5 rounded border px-3 py-2.5"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--secondary)",
              borderRadius: "var(--radius)",
            }}
          >
            <Sparkles
              className="mt-0.5 size-4 shrink-0"
              style={{ color: "var(--primary)" }}
              aria-hidden
            />
            <div className="min-w-0 space-y-1.5">
              <SmallText style={{ fontWeight: "var(--font-weight-medium)" }}>
                For this selection
              </SmallText>
              <TinyText
                className="block"
                style={{ color: "var(--foreground)", lineHeight: 1.45 }}
              >
                {placementInsight.headline}
              </TinyText>
              {placementInsight.insights.length > 0 && (
                <ul
                  className="m-0 list-disc space-y-1 pl-4"
                  style={{ fontSize: "var(--text-xs)" }}
                >
                  {placementInsight.insights.map((t, idx) => (
                    <li key={idx}>
                      <TinyText
                        muted
                        className="!text-[11px] leading-relaxed"
                      >
                        {t}
                      </TinyText>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {matchedClusters.length === 0 ? (
          <div
            className="p-6 border rounded text-center"
            style={{
              borderRadius: "var(--radius)",
              borderColor: "var(--border)",
              backgroundColor: "var(--secondary)",
            }}
          >
            <TinyText muted>
              {formData.fleetSelection === "label"
                ? "Enter a label selector to see matching clusters"
                : "Select clusters from the list above"}
            </TinyText>
          </div>
        ) : (
          <div
            className="border rounded overflow-hidden"
            style={{
              borderRadius: "var(--radius)",
              borderColor: "var(--border)",
            }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "var(--secondary)" }}>
                  <th
                    className="px-4 py-2 text-left"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <TinyText style={{ fontWeight: "var(--font-weight-medium)" }}>
                      Cluster name
                    </TinyText>
                  </th>
                  <th
                    className="px-4 py-2 text-left"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <TinyText style={{ fontWeight: "var(--font-weight-medium)" }}>
                      Environment
                    </TinyText>
                  </th>
                  <th
                    className="px-4 py-2 text-left"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <TinyText style={{ fontWeight: "var(--font-weight-medium)" }}>
                      Region
                    </TinyText>
                  </th>
                  {showOcpReadinessColumn ? (
                    <th
                      className="px-4 py-2 text-left"
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      <TinyText
                        style={{ fontWeight: "var(--font-weight-medium)" }}
                      >
                        {deploymentCopy.placement.placementReadinessCol}
                      </TinyText>
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {matchedClusters.map((cluster, idx) => (
                  <tr
                    key={cluster.name}
                    style={{
                      borderBottom:
                        idx < matchedClusters.length - 1
                          ? "1px solid var(--border)"
                          : "none",
                    }}
                  >
                    <td className="px-4 py-2">
                      <SmallText>{cluster.name}</SmallText>
                      {showOcpReadinessColumn && cluster.ocpCurrent ? (
                        <TinyText muted className="!mt-0.5 !block !text-[10px]">
                          Current {cluster.ocpCurrent}
                        </TinyText>
                      ) : null}
                    </td>
                    <td className="px-4 py-2">
                      <TinyText muted>{cluster.env}</TinyText>
                    </td>
                    <td className="px-4 py-2">
                      <TinyText muted>{cluster.region}</TinyText>
                    </td>
                    {showOcpReadinessColumn ? (
                      <td className="px-4 py-2">
                        <TinyText
                          className="!text-[10px]"
                          style={{
                            color:
                              clusterUpdateReadiness(cluster, primaryAction) ===
                              "ok"
                                ? "var(--primary)"
                                : clusterUpdateReadiness(
                                      cluster,
                                      primaryAction,
                                    ) === "na"
                                  ? "var(--muted-foreground)"
                                  : "hsl(32 80% 32%)",
                          }}
                        >
                          {formatClusterUpdateReadinessLabel(
                            clusterUpdateReadiness(cluster, primaryAction),
                          )}
                        </TinyText>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function currentSavedStrategySelectValue(fd: Record<string, any>): string {
  if (fd.rolloutUserStrategyId) {
    return `__user__:${fd.rolloutUserStrategyId}`;
  }
  const raw = fd.rolloutStrategyPreset ?? "balanced-canary";
  const p = raw === "corridor-balanced" ? "balanced-canary" : raw;
  if (p === "custom") return "__builtin__:balanced-canary";
  return `__builtin__:${p}`;
}

function Step3Content({
  formData,
  setFormData,
  userRolloutStrategies,
}: {
  formData: any;
  setFormData: (data: any) => void;
  userRolloutStrategies: UserRolloutStrategy[];
}) {
  const [phase1Expanded, setPhase1Expanded] = useState(true);
  const [phase2Expanded, setPhase2Expanded] = useState(true);
  const [pacingConfigExpanded, setPacingConfigExpanded] = useState(true);

  const rawPreset = formData.rolloutStrategyPreset ?? "balanced-canary";
  const preset = (
    rawPreset === "corridor-balanced" ? "balanced-canary" : rawPreset
  ) as RolloutStrategyPresetId;
  const source = formData.rolloutStrategySource ?? "saved";
  const presetMeta =
    ROLLOUT_PRESET_COPY[preset] ?? ROLLOUT_PRESET_COPY["balanced-canary"];

  const placementScopeCount = useMemo(
    () => getClustersMatchingPlacement(formData).length,
    [
      formData.fleetSelection,
      formData.labelSelector,
      formData.selectedClusters,
    ],
  );

  const canaryInPlacementScope = useMemo(
    () => getCanaryClustersInPlacementScope(formData),
    [
      formData.fleetSelection,
      formData.labelSelector,
      formData.selectedClusters,
      formData.canarySelector,
    ],
  );

  const rawCanaryInventoryCount = useMemo(
    () => countClustersMatchingAllTerms(formData.canarySelector || ""),
    [formData.canarySelector],
  );

  const placementAttempted =
    (formData.fleetSelection === "label" &&
      (formData.labelSelector || "").trim().length > 0) ||
    (formData.fleetSelection === "searchable" &&
      (formData.selectedClusters || []).length > 0);

  return (
    <div className="space-y-6">
      <AiPlanPrefillBanner formData={formData} />
      <div className="space-y-3">
        <SmallText style={{ fontWeight: "var(--font-weight-medium)" }}>
          {deploymentCopy.rolloutStrategy.sectionTitle}
        </SmallText>
        <TinyText muted className="!text-[11px] leading-snug">
          {deploymentCopy.rolloutStrategy.sourcePrompt}
        </TinyText>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setFormData((prev) =>
                applyRolloutStrategyPreset(
                  {
                    ...prev,
                    rolloutStrategySource: "saved",
                    rolloutUserStrategyId: null,
                  },
                  "balanced-canary",
                ),
              );
            }}
            className="flex flex-1 flex-col items-start gap-0.5 rounded-md border px-3 py-2.5 text-left transition-colors"
            style={{
              borderRadius: "var(--radius)",
              borderColor:
                source === "saved" ? "var(--primary)" : "var(--border)",
              borderWidth: source === "saved" ? 2 : 1,
              backgroundColor:
                source === "saved" ? "var(--secondary)" : "var(--card)",
            }}
          >
            <SmallText style={{ fontWeight: "var(--font-weight-medium)" }}>
              {deploymentCopy.rolloutStrategy.useSaved}
            </SmallText>
            <TinyText muted className="!text-[10px] leading-snug">
              {deploymentCopy.rolloutStrategy.useSavedHint}
            </TinyText>
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                rolloutStrategySource: "manual",
                rolloutStrategyPreset: "custom",
                rolloutUserStrategyId: null,
              }));
            }}
            className="flex flex-1 flex-col items-start gap-0.5 rounded-md border px-3 py-2.5 text-left transition-colors"
            style={{
              borderRadius: "var(--radius)",
              borderColor:
                source === "manual" ? "var(--primary)" : "var(--border)",
              borderWidth: source === "manual" ? 2 : 1,
              backgroundColor:
                source === "manual" ? "var(--secondary)" : "var(--card)",
            }}
          >
            <SmallText style={{ fontWeight: "var(--font-weight-medium)" }}>
              {deploymentCopy.rolloutStrategy.configureManual}
            </SmallText>
            <TinyText muted className="!text-[10px] leading-snug">
              {deploymentCopy.rolloutStrategy.configureManualHint}
            </TinyText>
          </button>
        </div>

        {source === "saved" && (
          <div className="space-y-1.5">
            <LabelText className="!mb-0">
              {deploymentCopy.rolloutStrategy.savedPickerLabel}
            </LabelText>
            <select
              className="w-full max-w-md px-3 py-2 border rounded"
              style={{
                borderRadius: "var(--radius)",
                borderColor: "var(--border)",
                fontFamily: "var(--font-family-text)",
                fontSize: "var(--text-sm)",
                color: "var(--foreground)",
                backgroundColor: "var(--background)",
              }}
              value={currentSavedStrategySelectValue(formData)}
              onChange={(e) => {
                const v = e.target.value;
                if (v.startsWith("__builtin__:")) {
                  const id = v.slice("__builtin__:".length);
                  setFormData((prev) =>
                    applyRolloutStrategyPreset(
                      {
                        ...prev,
                        rolloutStrategySource: "saved",
                        rolloutUserStrategyId: null,
                      },
                      id,
                    ),
                  );
                  return;
                }
                if (v.startsWith("__user__:")) {
                  const id = v.slice("__user__:".length);
                  const strat = userRolloutStrategies.find((s) => s.id === id);
                  if (!strat) return;
                  if (strat.kind === "preset") {
                    setFormData((prev) =>
                      applyRolloutStrategyPreset(
                        {
                          ...prev,
                          rolloutStrategySource: "saved",
                          rolloutUserStrategyId: id,
                        },
                        strat.presetId,
                      ),
                    );
                  } else {
                    setFormData((prev) => ({
                      ...applyRolloutSnapshot(
                        {
                          ...prev,
                          rolloutStrategySource: "saved",
                          rolloutUserStrategyId: id,
                        },
                        strat.snapshot,
                      ),
                    }));
                  }
                }
              }}
            >
              <optgroup label={deploymentCopy.rolloutStrategy.builtinGroup}>
                <option value="__builtin__:balanced-canary">
                  {deploymentCopy.rolloutStrategy.presetBalancedCanary}
                </option>
                <option value="__builtin__:weekend-push">
                  {deploymentCopy.rolloutStrategy.presetWeekendPush}
                </option>
                <option value="__builtin__:gitops-aligned">
                  {deploymentCopy.rolloutStrategy.presetGitopsAligned}
                </option>
              </optgroup>
              {userRolloutStrategies.length > 0 && (
                <optgroup label={deploymentCopy.rolloutStrategy.userSavedGroup}>
                  {userRolloutStrategies.map((s) => (
                    <option key={s.id} value={`__user__:${s.id}`}>
                      {s.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <TinyText muted className="!text-[11px] leading-snug">
              {deploymentCopy.rolloutStrategy.useSavedHint}
            </TinyText>
          </div>
        )}

        {(source === "manual" || preset === "custom") && (
          <div
            className="space-y-2 rounded-md border p-3"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--secondary)",
            }}
          >
            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                className="mt-0.5 size-4 shrink-0"
                style={{ accentColor: "var(--primary)" }}
                checked={Boolean(formData.saveRolloutStrategyForReuse)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    saveRolloutStrategyForReuse: e.target.checked,
                  })
                }
              />
              <div>
                <SmallText style={{ fontWeight: "var(--font-weight-medium)" }}>
                  {deploymentCopy.rolloutStrategy.saveForReuseLabel}
                </SmallText>
                <TinyText muted className="!mt-0.5 !text-[11px] leading-snug">
                  {deploymentCopy.rolloutStrategy.saveForReuseHint}
                </TinyText>
              </div>
            </label>
            {formData.saveRolloutStrategyForReuse && (
              <div>
                <LabelText className="!mb-1">
                  {deploymentCopy.rolloutStrategy.saveStrategyNameLabel}
                </LabelText>
                <TextInput
                  value={formData.saveRolloutStrategyName ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      saveRolloutStrategyName: e.target.value,
                    })
                  }
                  placeholder={
                    deploymentCopy.rolloutStrategy.saveStrategyNamePlaceholder
                  }
                  className="max-w-md"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rollout method: canary / rolling / immediate */}
      <div>
        <SmallText
          style={{ fontWeight: "var(--font-weight-medium)" }}
          className="mb-1.5"
        >
          {deploymentCopy.steps.rollout}
        </SmallText>
        <TinyText muted className="mb-3 text-[11px] leading-snug">
          {presetMeta.hint}
        </TinyText>

        <div className="grid grid-cols-3 gap-3">
          {/* Canary - Lowest risk (default) */}
          <button
            onClick={() =>
              setFormData({ ...formData, rolloutMethod: "canary" })
            }
            className="p-4 border rounded text-left transition-colors hover:bg-secondary flex flex-col h-full"
            style={{
              borderRadius: "var(--radius)",
              borderColor:
                formData.rolloutMethod === "canary"
                  ? "var(--primary)"
                  : "var(--border)",
              backgroundColor:
                formData.rolloutMethod === "canary"
                  ? "var(--secondary)"
                  : "transparent",
              borderWidth:
                formData.rolloutMethod === "canary" ? "2px" : "1px",
            }}
          >
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              {deploymentCopy.rolloutMethods.canary}
            </SmallText>
            <TinyText muted className="mt-1">
              Subset first, then rest
            </TinyText>
          </button>

          {/* Rolling - Medium risk */}
          <button
            onClick={() =>
              setFormData({ ...formData, rolloutMethod: "rolling" })
            }
            className="p-4 border rounded text-left transition-colors hover:bg-secondary flex flex-col h-full"
            style={{
              borderRadius: "var(--radius)",
              borderColor:
                formData.rolloutMethod === "rolling"
                  ? "var(--primary)"
                  : "var(--border)",
              backgroundColor:
                formData.rolloutMethod === "rolling"
                  ? "var(--secondary)"
                  : "transparent",
              borderWidth:
                formData.rolloutMethod === "rolling" ? "2px" : "1px",
            }}
          >
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              {deploymentCopy.rolloutMethods.rolling}
            </SmallText>
            <TinyText muted className="mt-1">
              Waves of X clusters
            </TinyText>
          </button>

          {/* Immediate - Highest risk */}
          <button
            onClick={() =>
              setFormData({ ...formData, rolloutMethod: "immediate" })
            }
            className="p-4 border rounded text-left transition-colors hover:bg-secondary flex flex-col h-full"
            style={{
              borderRadius: "var(--radius)",
              borderColor:
                formData.rolloutMethod === "immediate"
                  ? "var(--primary)"
                  : "var(--border)",
              backgroundColor:
                formData.rolloutMethod === "immediate"
                  ? "var(--secondary)"
                  : "transparent",
              borderWidth:
                formData.rolloutMethod === "immediate" ? "2px" : "1px",
            }}
          >
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              {deploymentCopy.rolloutMethods.immediate}
            </SmallText>
            <TinyText muted className="mt-1">
              All at once
            </TinyText>
          </button>
        </div>
      </div>

      {presetMeta.blocks === "weekend" && (
        <>
          <Alert variant="info" isInline title="Weekend window push">
            <p style={{ margin: 0 }}>
              This preset optimizes for a short, high-throughput window. The step
              below uses your weekend maintenance window; confirm wave size and soak
              match your risk tolerance.
            </p>
          </Alert>
          <div
            className="border rounded p-4 space-y-2"
            style={{
              borderRadius: "var(--radius)",
              borderColor: "var(--border)",
              backgroundColor: "var(--card)",
            }}
          >
            <SmallText
              style={{ fontWeight: "var(--font-weight-medium)" }}
            >
              Single weekend plan
            </SmallText>
            <TinyText muted>
              All clusters in scope for this change run in larger waves (see pacing)
              inside the window <code>weekends · 20:00–04:00</code>. No separate
              pre-prod block in this mode—treat that as a filter on placement if
              needed.
            </TinyText>
          </div>
        </>
      )}

      {/* Schedule */}
      <div>
        <SmallText
          style={{ fontWeight: "var(--font-weight-medium)" }}
          className="mb-3"
        >
          {deploymentCopy.schedule.sectionTitle}
        </SmallText>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Now */}
          <button
            onClick={() =>
              setFormData({ ...formData, scheduleType: "immediate" })
            }
            className="p-4 border rounded text-left transition-colors hover:bg-secondary flex flex-col h-full"
            style={{
              borderRadius: "var(--radius)",
              borderColor:
                formData.scheduleType === "immediate"
                  ? "var(--primary)"
                  : "var(--border)",
              backgroundColor:
                formData.scheduleType === "immediate"
                  ? "var(--secondary)"
                  : "transparent",
              borderWidth:
                formData.scheduleType === "immediate" ? "2px" : "1px",
            }}
          >
            <SmallText style={{ fontWeight: "var(--font-weight-medium)" }}>
              {deploymentCopy.schedule.now}
            </SmallText>
            <TinyText muted className="mt-1">
              Start immediately
            </TinyText>
          </button>

          {/* Delayed */}
          <button
            onClick={() => {
              const today = new Date().toISOString().split("T")[0];
              setFormData({
                ...formData,
                scheduleType: "delayed",
                scheduledDate: formData.scheduledDate || today,
              });
            }}
            className="p-4 border rounded text-left transition-colors hover:bg-secondary flex flex-col h-full"
            style={{
              borderRadius: "var(--radius)",
              borderColor:
                formData.scheduleType === "delayed"
                  ? "var(--primary)"
                  : "var(--border)",
              backgroundColor:
                formData.scheduleType === "delayed"
                  ? "var(--secondary)"
                  : "transparent",
              borderWidth:
                formData.scheduleType === "delayed" ? "2px" : "1px",
            }}
          >
            <SmallText style={{ fontWeight: "var(--font-weight-medium)" }}>
              {deploymentCopy.schedule.delayed}
            </SmallText>
            <TinyText muted className="mt-1">
              Start at a specific time
            </TinyText>
          </button>

          {/* Maintenance window */}
          <button
            onClick={() =>
              setFormData({ ...formData, scheduleType: "window" })
            }
            className="p-4 border rounded text-left transition-colors hover:bg-secondary flex flex-col h-full"
            style={{
              borderRadius: "var(--radius)",
              borderColor:
                formData.scheduleType === "window"
                  ? "var(--primary)"
                  : "var(--border)",
              backgroundColor:
                formData.scheduleType === "window"
                  ? "var(--secondary)"
                  : "transparent",
              borderWidth:
                formData.scheduleType === "window" ? "2px" : "1px",
            }}
          >
            <SmallText style={{ fontWeight: "var(--font-weight-medium)" }}>
              {deploymentCopy.schedule.maintenanceWindow}
            </SmallText>
            <TinyText muted className="mt-1">
              During allowed windows
            </TinyText>
          </button>
        </div>

        {/* Delayed settings */}
        {formData.scheduleType === "delayed" && (
          <div
            className="p-4 border rounded space-y-3"
            style={{
              borderRadius: "var(--radius)",
              borderColor: "var(--border)",
              backgroundColor: "var(--secondary)",
            }}
          >
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={formData.scheduledDate || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    scheduledDate: e.target.value,
                  })
                }
                className="px-3 py-2 border rounded"
                style={{
                  borderRadius: "var(--radius)",
                  borderColor: "var(--border)",
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-sm)",
                  backgroundColor: "var(--card)",
                }}
              />
              <input
                type="time"
                value={formData.scheduledTime || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    scheduledTime: e.target.value,
                  })
                }
                className="px-3 py-2 border rounded"
                style={{
                  borderRadius: "var(--radius)",
                  borderColor: "var(--border)",
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-sm)",
                  backgroundColor: "var(--card)",
                }}
              />
            </div>
          </div>
        )}

        {/* Maintenance window settings */}
        {formData.scheduleType === "window" && (
          <div
            className="p-4 border rounded space-y-3"
            style={{
              borderRadius: "var(--radius)",
              borderColor: "var(--border)",
              backgroundColor: "var(--secondary)",
            }}
          >
            <div>
              <TinyText muted className="mb-2">
                Window
              </TinyText>
              <select
                value={formData.scheduleWindow}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    scheduleWindow: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded"
                style={{
                  borderRadius: "var(--radius)",
                  borderColor: "var(--border)",
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-sm)",
                  backgroundColor: "var(--card)",
                }}
              >
                <option value="weekends">Weekends</option>
                <option value="weekdays">Weekdays</option>
                <option value="daily">Daily</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <TinyText muted className="mb-2">
                  Start time
                </TinyText>
                <input
                  type="time"
                  value={formData.scheduleStartTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scheduleStartTime: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded"
                  style={{
                    borderRadius: "var(--radius)",
                    borderColor: "var(--border)",
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-sm)",
                    backgroundColor: "var(--card)",
                  }}
                />
              </div>
              <div>
                <TinyText muted className="mb-2">
                  End time
                </TinyText>
                <input
                  type="time"
                  value={formData.scheduleEndTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scheduleEndTime: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded"
                  style={{
                    borderRadius: "var(--radius)",
                    borderColor: "var(--border)",
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-sm)",
                    backgroundColor: "var(--card)",
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Canary rollout + Full rollout — only when rollout method is Canary */}
      {formData.rolloutMethod === "canary" && (
        <div className="space-y-4">
          {/* Canary rollout */}
          <div
            className="border rounded overflow-hidden"
            style={{
              borderRadius: "var(--radius)",
              borderColor: "var(--border)",
            }}
          >
            <button
              onClick={() => setPhase1Expanded(!phase1Expanded)}
              className="w-full px-4 py-3 flex items-center justify-between bg-card hover:bg-secondary transition-colors"
              style={{
                borderBottom: phase1Expanded
                  ? "1px solid var(--border)"
                  : "none",
              }}
            >
                <SmallText
                style={{
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                {deploymentCopy.rollout.canaryRolloutSectionTitle}
              </SmallText>
              <svg
                className="size-5 transition-transform"
                style={{
                  transform: phase1Expanded
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {phase1Expanded && (
              <div className="p-4 space-y-4">
                {/* Placement + Canary rollout AND narrowing */}
                <div className="space-y-3">
                  <div>
                    <TinyText muted className="mb-2">
                      {deploymentCopy.rollout.canaryRolloutPlacementReadonlyTitle}
                    </TinyText>
                    <div
                      className="rounded border px-3 py-2 font-mono text-xs"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--secondary)",
                        color: "var(--foreground)",
                      }}
                    >
                      {formData.fleetSelection === "label" &&
                      (formData.labelSelector || "").trim()
                        ? (formData.labelSelector as string).trim()
                        : formData.fleetSelection === "searchable"
                          ? deploymentCopy.placement.manualClusterListNote
                          : deploymentCopy.placement.placementEmpty}
                    </div>
                    <TinyText muted className="mt-1">
                      {deploymentCopy.rollout.canaryRolloutPlacementReadonlyHint}
                    </TinyText>
                  </div>
                  <div>
                    <TinyText muted className="mb-2">
                      {deploymentCopy.rollout.canaryRolloutNarrowingLabel}
                    </TinyText>
                    <TextInput
                      value={formData.canarySelector ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          canarySelector: e.target.value,
                        })
                      }
                      placeholder={
                        deploymentCopy.rollout.canaryRolloutNarrowingPlaceholder
                      }
                    />
                    <TinyText muted className="mt-1">
                      {deploymentCopy.rollout.canaryRolloutNarrowingHelp(
                        placementScopeCount,
                      )}
                    </TinyText>
                  </div>
                </div>

                {placementScopeCount > 1 &&
                  canaryInPlacementScope.length > 0 &&
                  canaryInPlacementScope.length >= placementScopeCount && (
                    <Alert
                      variant="warning"
                      isInline
                      title={deploymentCopy.rollout.alertCanarySameSizeTitle}
                    >
                      <p className="m-0 text-sm leading-snug">
                        {deploymentCopy.rollout.alertCanarySameSizeBody}
                      </p>
                    </Alert>
                  )}

                {placementScopeCount > 0 &&
                  rawCanaryInventoryCount > 0 &&
                  canaryInPlacementScope.length === 0 && (
                    <Alert
                      variant="warning"
                      isInline
                      title={deploymentCopy.rollout.alertNoCanaryInScopeTitle}
                    >
                      <p className="m-0 text-sm leading-snug">
                        {deploymentCopy.rollout.alertNoCanaryInScopeBody(
                          rawCanaryInventoryCount,
                        )}
                      </p>
                    </Alert>
                  )}

                {/* Matched clusters: intersection of canary + placement (subset) */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <SmallText style={{ fontWeight: "var(--font-weight-medium)" }}>
                      {deploymentCopy.rollout.canaryInScopeHeading}
                    </SmallText>
                    <TinyText muted>
                      {deploymentCopy.rollout.canaryInScopeCountTemplate(
                        canaryInPlacementScope.length,
                        placementScopeCount,
                      )}
                    </TinyText>
                  </div>

                  {placementScopeCount === 0 ? (
                    <div
                      className="p-6 border rounded text-center"
                      style={{
                        borderRadius: "var(--radius)",
                        borderColor: "var(--border)",
                        backgroundColor: "var(--secondary)",
                      }}
                    >
                      <TinyText muted>
                        {placementAttempted
                          ? deploymentCopy.rollout.emptyCanaryPlacementNoMatches
                          : deploymentCopy.rollout.emptyCanaryPlacementNotSet}
                      </TinyText>
                    </div>
                  ) : canaryInPlacementScope.length === 0 ? (
                    <div
                      className="p-6 border rounded text-center"
                      style={{
                        borderRadius: "var(--radius)",
                        borderColor: "var(--border)",
                        backgroundColor: "var(--secondary)",
                      }}
                    >
                      <TinyText muted>
                        {formData.canarySelector?.trim()
                          ? deploymentCopy.rollout.emptyCanaryWithSelector
                          : deploymentCopy.rollout.emptyCanaryNoSelector}
                      </TinyText>
                    </div>
                  ) : (
                    <div
                      className="border rounded overflow-hidden"
                      style={{
                        borderRadius: "var(--radius)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <table className="w-full">
                        <thead>
                          <tr style={{ backgroundColor: "var(--secondary)" }}>
                            <th
                              className="px-4 py-2 text-left"
                              style={{ borderBottom: "1px solid var(--border)" }}
                            >
                              <TinyText style={{ fontWeight: "var(--font-weight-medium)" }}>
                                Cluster name
                              </TinyText>
                            </th>
                            <th
                              className="px-4 py-2 text-left"
                              style={{ borderBottom: "1px solid var(--border)" }}
                            >
                              <TinyText style={{ fontWeight: "var(--font-weight-medium)" }}>
                                Environment
                              </TinyText>
                            </th>
                            <th
                              className="px-4 py-2 text-left"
                              style={{ borderBottom: "1px solid var(--border)" }}
                            >
                              <TinyText style={{ fontWeight: "var(--font-weight-medium)" }}>
                                Region
                              </TinyText>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {canaryInPlacementScope.map((cluster, idx, arr) => (
                            <tr
                              key={cluster.name}
                              style={{
                                borderBottom:
                                  idx < arr.length - 1
                                    ? "1px solid var(--border)"
                                    : "none",
                              }}
                            >
                              <td className="px-4 py-2">
                                <SmallText>{cluster.name}</SmallText>
                              </td>
                              <td className="px-4 py-2">
                                <TinyText muted>{cluster.env}</TinyText>
                              </td>
                              <td className="px-4 py-2">
                                <TinyText muted>{cluster.region}</TinyText>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <TinyText muted className="mt-2">
                    {deploymentCopy.rollout.canaryThenFullSoakBlurb}
                  </TinyText>
                </div>

                {/* Soak Duration */}
                <div>
                  <TinyText muted className="mb-2">
                    Soak duration
                  </TinyText>
                  <select
                    value={formData.phase1Soak}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phase1Soak: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                    style={{
                      borderRadius: "var(--radius)",
                      borderColor: "var(--border)",
                      fontFamily: "var(--font-family-text)",
                      fontSize: "var(--text-sm)",
                      backgroundColor: "var(--card)",
                    }}
                  >
                    <option value="0">None (proceed immediately)</option>
                    <option value="15m">15 minutes</option>
                    <option value="30m">30 minutes</option>
                    <option value="1h">1 hour</option>
                    <option value="4h">4 hours</option>
                    <option value="12h">12 hours</option>
                    <option value="24h">24 hours (1 day)</option>
                    <option value="48h">48 hours (2 days)</option>
                    <option value="72h">72 hours (3 days)</option>
                    <option value="7d">7 days</option>
                  </select>
                  <TinyText muted className="mt-1">
                    {
                      deploymentCopy.rollout
                        .observationAfterCanaryBeforeFullRollout
                    }
                  </TinyText>
                </div>

                {/* Error Threshold */}
                <div>
                  <TinyText muted className="mb-2">
                    Error threshold
                  </TinyText>
                  <select
                    value={formData.phase1ErrorThreshold || "0"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phase1ErrorThreshold: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                    style={{
                      borderRadius: "var(--radius)",
                      borderColor: "var(--border)",
                      fontFamily: "var(--font-family-text)",
                      fontSize: "var(--text-sm)",
                      backgroundColor: "var(--card)",
                    }}
                  >
                    <option value="0">0% — Stop on any failure</option>
                    <option value="5">5% — Conservative (recommended)</option>
                    <option value="10">10% — Moderate tolerance</option>
                    <option value="25">25% — High tolerance</option>
                    <option value="100">100% — Never stop</option>
                  </select>
                  <TinyText muted className="mt-1">
                    {
                      deploymentCopy.rollout
                        .haltCanaryRolloutOnErrorThresholdHelp
                    }
                  </TinyText>
                </div>

                {/* Require approval */}
                <div>
                  <label
                    className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-secondary"
                    style={{
                      borderRadius: "var(--radius)",
                      borderColor: "var(--border)",
                      backgroundColor:
                        formData.requireApproval
                          ? "var(--secondary)"
                          : "transparent",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.requireApproval === true}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requireApproval: e.target.checked,
                        })
                      }
                      className="size-4"
                      style={{ accentColor: "var(--primary)" }}
                    />
                    <div>
                      <SmallText>
                        {deploymentCopy.rollout.requireApprovalBeforeFullRollout}
                      </SmallText>
                      <TinyText muted className="mt-0.5">
                        Manual approval required after soak period completes
                      </TinyText>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Full rollout */}
          <div
            className="border rounded overflow-hidden"
            style={{
              borderRadius: "var(--radius)",
              borderColor: "var(--border)",
            }}
          >
            <button
              onClick={() => setPhase2Expanded(!phase2Expanded)}
              className="w-full px-4 py-3 flex items-center justify-between bg-card hover:bg-secondary transition-colors"
              style={{
                borderBottom: phase2Expanded
                  ? "1px solid var(--border)"
                  : "none",
              }}
            >
              <SmallText
                style={{
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                {deploymentCopy.rollout.fullRolloutSectionTitle}
              </SmallText>
              <svg
                className="size-5 transition-transform"
                style={{
                  transform: phase2Expanded
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {phase2Expanded && (
              <div className="p-4 space-y-4">
                {/* Clusters per wave */}
                <div>
                  <TinyText muted className="mb-2">
                    Clusters per wave
                  </TinyText>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.phase2Batch || "3"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phase2Batch: e.target.value,
                        })
                      }
                      min="1"
                      className="w-24 px-3 py-2 border rounded"
                      style={{
                        borderRadius: "var(--radius)",
                        borderColor: "var(--border)",
                        fontFamily: "var(--font-family-text)",
                        fontSize: "var(--text-sm)",
                        backgroundColor: "var(--card)",
                      }}
                    />
                    <TinyText>clusters</TinyText>
                  </div>
                  <TinyText muted className="mt-1">
                    Maximum number of clusters to update simultaneously in each wave
                  </TinyText>
                </div>

                {/* Soak between waves */}
                <div>
                  <TinyText muted className="mb-2">
                    Soak time between waves
                  </TinyText>
                  <select
                    value={formData.phase2SoakTime || "0"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phase2SoakTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                    style={{
                      borderRadius: "var(--radius)",
                      borderColor: "var(--border)",
                      fontFamily: "var(--font-family-text)",
                      fontSize: "var(--text-sm)",
                      backgroundColor: "var(--card)",
                    }}
                  >
                    <option value="0">None (continuous waves)</option>
                    <option value="5m">5 minutes</option>
                    <option value="15m">15 minutes</option>
                    <option value="30m">30 minutes</option>
                    <option value="1h">1 hour</option>
                  </select>
                  <TinyText muted className="mt-1">
                    Wait time after each wave completes before starting the next
                  </TinyText>
                </div>

                {/* Error Threshold */}
                <div>
                  <TinyText muted className="mb-2">
                    Error threshold
                  </TinyText>
                  <select
                    value={formData.phase2ErrorThreshold || "5"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phase2ErrorThreshold: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                    style={{
                      borderRadius: "var(--radius)",
                      borderColor: "var(--border)",
                      fontFamily: "var(--font-family-text)",
                      fontSize: "var(--text-sm)",
                      backgroundColor: "var(--card)",
                    }}
                  >
                    <option value="0">0% — Stop on any failure</option>
                    <option value="5">5% — Conservative (recommended)</option>
                    <option value="10">10% — Moderate tolerance</option>
                    <option value="25">25% — High tolerance</option>
                    <option value="100">100% — Never stop</option>
                  </select>
                  <TinyText muted className="mt-1">
                    Halt rollout if cumulative failure rate exceeds this threshold
                  </TinyText>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rolling Configuration - Only show if Rolling is selected */}
      {formData.rolloutMethod === "rolling" && (
        <div
          className="border rounded overflow-hidden"
          style={{
            borderRadius: "var(--radius)",
            borderColor: "var(--border)",
          }}
        >
          <button
            onClick={() => setPacingConfigExpanded(!pacingConfigExpanded)}
            className="w-full px-4 py-3 flex items-center justify-between bg-card hover:bg-secondary transition-colors"
            style={{
              borderBottom: pacingConfigExpanded
                ? "1px solid var(--border)"
                : "none",
            }}
          >
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              Rolling configuration
            </SmallText>
            <svg
              className="size-5 transition-transform"
              style={{
                transform: pacingConfigExpanded
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
              }}
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {pacingConfigExpanded && (
            <div className="p-4 space-y-4">
              {/* Clusters per wave */}
              <div>
                <TinyText muted className="mb-2">
                  Clusters per wave
                </TinyText>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.pacingBatchSize || "5"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pacingBatchSize: e.target.value,
                      })
                    }
                    min="1"
                    className="w-24 px-3 py-2 border rounded"
                    style={{
                      borderRadius: "var(--radius)",
                      borderColor: "var(--border)",
                      fontFamily: "var(--font-family-text)",
                      fontSize: "var(--text-sm)",
                      backgroundColor: "var(--card)",
                    }}
                  />
                  <TinyText>clusters</TinyText>
                </div>
                <TinyText muted className="mt-1">
                  Maximum number of clusters to update simultaneously in each wave
                </TinyText>
              </div>

              {/* Soak time between waves */}
              <div>
                <TinyText muted className="mb-2">
                  Soak time between waves
                </TinyText>
                <select
                  value={formData.pacingSoakTime || "0"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pacingSoakTime: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded"
                  style={{
                    borderRadius: "var(--radius)",
                    borderColor: "var(--border)",
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-sm)",
                    backgroundColor: "var(--card)",
                  }}
                >
                  <option value="0">None (continuous waves)</option>
                  <option value="5m">5 minutes</option>
                  <option value="15m">15 minutes</option>
                  <option value="30m">30 minutes</option>
                  <option value="1h">1 hour</option>
                </select>
                <TinyText muted className="mt-1">
                  Wait time after each wave completes before starting the next
                </TinyText>
              </div>

              {/* Stop on error threshold */}
              <div>
                <TinyText muted className="mb-2">
                  Error threshold
                </TinyText>
                <select
                  value={formData.pacingErrorThreshold || "5"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pacingErrorThreshold: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded"
                  style={{
                    borderRadius: "var(--radius)",
                    borderColor: "var(--border)",
                    fontFamily: "var(--font-family-text)",
                    fontSize: "var(--text-sm)",
                    backgroundColor: "var(--card)",
                  }}
                >
                  <option value="0">0% — Stop on any failure</option>
                  <option value="5">5% — Conservative (recommended)</option>
                  <option value="10">10% — Moderate tolerance</option>
                  <option value="25">25% — High tolerance</option>
                  <option value="100">100% — Never stop</option>
                </select>
                <TinyText muted className="mt-1">
                  Halt deployment if cumulative failure rate exceeds this threshold
                </TinyText>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Immediate confirmation message */}
      {formData.rolloutMethod === "immediate" && (
        <Alert
          variant="warning"
          title="High-risk rollout"
          isInline
        >
          All matched clusters will be updated simultaneously. 
          Consider using Canary or Rolling for production deployments.
        </Alert>
      )}
    </div>
  );
}

function Step4Content({
  formData,
  setFormData,
}: {
  formData: any;
  setFormData: (data: any) => void;
}) {
  const [showRunAsHelp, setShowRunAsHelp] = useState(false);
  const [showConfirmationHelp, setShowConfirmationHelp] = useState(false);

  return (
    <div className="space-y-6">
      <AiPlanPrefillBanner formData={formData} />
      {/* Run As Dropdown */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <LabelText>Run as</LabelText>
          <button
            type="button"
            className="relative"
            onMouseEnter={() => setShowRunAsHelp(true)}
            onMouseLeave={() => setShowRunAsHelp(false)}
            aria-label="Help for Run as"
          >
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 16 16"
              style={{ color: "var(--muted-foreground)" }}
            >
              <circle
                cx="8"
                cy="8"
                r="6"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M8 11.5V11.5M8 8.5C8 8.5 8.75 8.5 8.75 7.75C8.75 7 8 6.5 7.25 6.5C6.5 6.5 6 7 6 7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {showRunAsHelp && (
              <div
                className="absolute left-0 top-full mt-2 w-96 p-4 border z-50"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "var(--radius)",
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                }}
              >
                <SmallText
                  style={{
                    fontWeight: "var(--font-weight-medium)",
                    marginBottom: "8px",
                  }}
                >
                  Choose whether to execute this upgrade using your personal
                  permissions or a managed platform identity.
                </SmallText>
                <div className="space-y-3 mt-3">
                  <div>
                    <TinyText
                      style={{ fontWeight: "var(--font-weight-medium)" }}
                    >
                      Personal:
                    </TinyText>
                    <TinyText muted className="mt-1">
                      Uses your current login. The task may pause if your
                      session expires or you disconnect.
                    </TinyText>
                  </div>
                  <div>
                    <TinyText
                      style={{ fontWeight: "var(--font-weight-medium)" }}
                    >
                      Service Account:
                    </TinyText>
                    <TinyText muted className="mt-1">
                      Select a secure, persistent service account. The task
                      will continue even if you sign out.
                    </TinyText>
                  </div>
                  <div>
                    <TinyText
                      style={{ fontWeight: "var(--font-weight-medium)" }}
                    >
                      Platform:
                    </TinyText>
                    <TinyText muted className="mt-1">
                      Uses a secure, persistent platform service account. The
                      task will continue even if you sign out.
                    </TinyText>
                  </div>
                </div>
              </div>
            )}
          </button>
        </div>
        <select
          value={formData.runAs}
          onChange={(e) =>
            setFormData({ ...formData, runAs: e.target.value })
          }
          className="w-full px-3 py-2.5 border rounded"
          style={{
            borderRadius: "var(--radius)",
            borderColor: "var(--border)",
            fontFamily: "var(--font-family-text)",
            fontSize: "var(--text-sm)",
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
          }}
        >
          <option value="Personal (Adi Cluster Admin)">
            Personal (Adi Cluster Admin)
          </option>
          <option value="Service account: ome-system-manager-sa">
            Service account: ome-system-manager-sa
          </option>
          <option value="Service account: bulk-upgrade-worker-v4">
            Service account: bulk-upgrade-worker-v4
          </option>
          <option value="Platform Service">Platform Service</option>
        </select>
      </div>

      {/* Require Manual Confirmation Checkbox */}
      <div>
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="requireManualConfirmation"
            checked={formData.requireManualConfirmation}
            onChange={(e) =>
              setFormData({
                ...formData,
                requireManualConfirmation: e.target.checked,
              })
            }
            className="mt-1"
            style={{
              accentColor: "var(--primary)",
            }}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <label
                htmlFor="requireManualConfirmation"
                style={{
                  fontFamily: "var(--font-family-text)",
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--foreground)",
                  cursor: "pointer",
                }}
              >
                Require Manual Confirmation
              </label>
              <button
                type="button"
                className="relative"
                onMouseEnter={() => setShowConfirmationHelp(true)}
                onMouseLeave={() => setShowConfirmationHelp(false)}
                aria-label="Help for Require Manual Confirmation"
              >
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 16 16"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 11.5V11.5M8 8.5C8 8.5 8.75 8.5 8.75 7.75C8.75 7 8 6.5 7.25 6.5C6.5 6.5 6 7 6 7.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {showConfirmationHelp && (
                  <div
                    className="absolute left-0 top-full mt-2 w-80 p-4 border z-50"
                    style={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "var(--radius)",
                      boxShadow:
                        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    <SmallText>
                      The upgrade will pause for a final review before applying
                      actions to the clusters.
                    </SmallText>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function rolloutStrategyReviewName(
  fd: Record<string, any>,
  userList: UserRolloutStrategy[],
): string {
  const rs = deploymentCopy.rolloutStrategy;
  if (fd.rolloutUserStrategyId) {
    const u = userList.find((x) => x.id === fd.rolloutUserStrategyId);
    if (u) return u.name;
  }
  const p =
    fd.rolloutStrategyPreset === "corridor-balanced"
      ? "balanced-canary"
      : fd.rolloutStrategyPreset;
  if (p === "weekend-push") return rs.presetWeekendPush;
  if (p === "gitops-aligned") return rs.presetGitopsAligned;
  if (p === "custom") return rs.customStrategy;
  return rs.presetBalancedCanary;
}

const planChannelCodeBlockStyle: CSSProperties = {
  backgroundColor: "var(--background)",
  boxShadow: "inset 0 0 0 1px var(--border)",
};

function PlanChannelPreWithCopy({
  text,
  rD,
  maxHeight,
  copySuccess,
  copyFailed,
  copyAria,
}: {
  text: string;
  rD: string;
  maxHeight: "max-h-32" | "max-h-36" | "max-h-40";
  copySuccess: string;
  copyFailed: string;
  copyAria: string;
}) {
  return (
    <div
      className="relative mt-1 overflow-hidden rounded-md"
      style={planChannelCodeBlockStyle}
    >
      <IconButton
        type="button"
        onClick={async (e) => {
          e.preventDefault();
          try {
            await navigator.clipboard.writeText(text);
            toast.success(copySuccess);
          } catch {
            toast.error(copyFailed);
          }
        }}
        aria-label={copyAria}
        title={copyAria}
        className="absolute right-0.5 top-0.5 z-[1] !h-6 !w-6 !min-h-0 !p-0 hover:bg-secondary/80"
        style={{ color: "var(--muted-foreground)" }}
      >
        <Copy className="size-3" aria-hidden />
      </IconButton>
      <pre
        className={`m-0 max-w-full overflow-auto py-1.5 pl-2 pr-7 text-left font-mono ${maxHeight} ${rD}`}
        style={{ fontFamily: "var(--font-family-mono)" }}
      >
        {text}
      </pre>
    </div>
  );
}

function Step5Content({
  formData,
  wizardEntryMode = "action-first",
  userRolloutStrategies = [],
}: {
  formData: any;
  wizardEntryMode?: WizardEntryMode;
  userRolloutStrategies?: UserRolloutStrategy[];
}) {
  const pr = deploymentCopy.planReview;
  /** Review body / helper / source lines — one size (matches “Source · …”); `!` overrides TinyText/SmallText inline font-size */
  const rD = "!text-[10px] !leading-snug";
  const rDM = `${rD} text-muted-foreground`;
  const selectedActions: SelectedAction[] =
    formData.selectedActions || [];

  // Helper to format labels
  const formatLabel = (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const planTitle =
    selectedActions[0]?.name != null
      ? `${selectedActions[0].name} — ${pr.planCardTitle.toLowerCase()}`
      : pr.planCardTitle;
  const planIdSuffix = (
    (formData.labelSelector as string) ||
    (selectedActions[0]?.id as string) ||
    "draft"
  )
    .toString()
    .replace(/[^a-z0-9]+/gi, "")
    .slice(0, 8) || "draft";
  const planId = pr.planIdDemo(planIdSuffix);
  const channelSnippets = buildPlanChannelSnippets({
    planId,
    planTitle,
    primaryActionId: String(selectedActions[0]?.id ?? "catalog-action"),
    labelSelector: String((formData.labelSelector as string) || "").trim() || "env=prod",
    rolloutMethod: String(formData.rolloutMethod ?? "canary"),
    scheduleType: String(formData.scheduleType ?? "immediate"),
  });
  const pg = deploymentCopy.prototypeGuiding;
  const planHeaderGuiding = [
    pg.reviewEntryOrder,
    wizardEntryMode === "placement-first"
      ? "Placement-first order: scope → action → rollout → you are here (review plan)."
      : "Action-first order: action → scope → rollout → you are here (review plan).",
  ].join("\n\n");

  return (
    <div className="space-y-6">
      <AiPlanPrefillBanner formData={formData} />
      {/* Single review surface: header + divided body (less box-on-box) */}
      <div
        className="overflow-hidden rounded-xl border shadow-sm"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--card)",
        }}
      >
        <div
          className="border-b px-4 py-4 sm:px-5 sm:py-5"
          style={{
            borderColor: "var(--border)",
            background:
              "linear-gradient(180deg, var(--secondary) 0%, var(--card) 100%)",
          }}
        >
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <TinyText
              className="!m-0 uppercase tracking-wide"
              style={{
                fontSize: "10px",
                letterSpacing: "0.08em",
                color: "var(--muted-foreground)",
              }}
            >
              {pr.reviewShellTitle}
            </TinyText>
            <div className="flex flex-wrap gap-1.5 sm:justify-end">
              <SecondaryButton
                type="button"
                className="!inline-flex h-8 items-center gap-1.5 px-2.5 text-sm"
                onClick={() =>
                  toast.success(pr.toastShareTitle, {
                    description: pr.toastShareDescription,
                    classNames: prototypeInteractionToastClassNames,
                    richColors: false,
                    // Sonner defaults to a check icon for `success` — not meaningful for these prototype toasts
                    icon: null,
                  })
                }
              >
                <Share2
                  className="size-3.5 shrink-0 opacity-80"
                  aria-hidden
                />
                {pr.quickShare}
              </SecondaryButton>
              <SecondaryButton
                type="button"
                className="!inline-flex h-8 items-center gap-1.5 px-2.5 text-sm"
                onClick={() =>
                  toast.success(pr.toastReviewTitle, {
                    description: pr.toastReviewDescription,
                    classNames: prototypeInteractionToastClassNames,
                    richColors: false,
                    icon: null,
                  })
                }
              >
                <UserCheck
                  className="size-3.5 shrink-0 opacity-80"
                  aria-hidden
                />
                {pr.quickRequestReview}
              </SecondaryButton>
            </div>
          </div>
          <div className="mt-2 flex flex-col gap-1 min-[480px]:flex-row min-[480px]:items-end min-[480px]:justify-between">
            <div className="min-w-0">
              <div className="flex max-w-full items-center gap-1.5">
                <LabelText className="!mb-0">{pr.planCardTitle}</LabelText>
                <GuidingTooltip
                  text={planHeaderGuiding}
                  topic="Fleet plan"
                />
              </div>
              <CardTitle
                className="!mt-0.5 !p-0 !text-base leading-snug"
                style={{ fontWeight: "var(--font-weight-medium)" }}
              >
                {planTitle}
              </CardTitle>
              <TinyText
                muted
                className={`mt-1 block font-mono ${rDM}`}
              >
                {planId}
              </TinyText>
              <TinyText
                muted
                className={`mt-1.5 block ${rDM}`}
              >
                {pr.mockupSourcePlan}
              </TinyText>
            </div>
          </div>
        </div>

        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          <div className="p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <ListChecks
                className="size-4 shrink-0"
                style={{ color: "var(--primary)" }}
                aria-hidden
              />
              <SmallText
                className="!m-0"
                style={{ fontWeight: "var(--font-weight-medium)" }}
              >
                {pr.preflightSectionLabel}
              </SmallText>
            </div>
            <div className="grid gap-4 min-[900px]:grid-cols-2 min-[900px]:gap-5">
              <div
                className="flex min-h-0 min-w-0 flex-col rounded-lg p-3"
                style={{
                  backgroundColor: "var(--secondary)",
                }}
              >
                <div className="mb-1 flex min-w-0 items-center gap-1.5">
                  <TinyText
                    className={`!m-0 ${rD} text-foreground`}
                    style={{
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    {pr.preflightChangeTitle}
                  </TinyText>
                  <GuidingTooltip
                    text={pg.preflightChangePreview}
                    topic="What would change"
                  />
                </div>
                <TinyText
                  muted
                  className={`mb-2 block ${rDM}`}
                >
                  {pr.mockupSourceChange}
                </TinyText>
                <pre
                  className={`mt-auto max-h-32 flex-1 overflow-auto rounded-md p-3 text-left leading-relaxed font-mono ${rD}`}
                  style={{
                    backgroundColor: "var(--background)",
                    fontFamily: "var(--font-family-mono)",
                    boxShadow: "inset 0 0 0 1px var(--border)",
                  }}
                >{`cluster: prod-east-1
  - clusterversion.spec.desiredUpdate.version: 4.17.4 → 4.17.9
  - machineconfigpool(master): new rendered revision (pending)
cluster: stage-west-1
  - (same) · channel stable-4.17
  … +3 more clusters in scope`}</pre>
              </div>

              <div
                className="flex min-h-0 min-w-0 flex-col rounded-lg p-3"
                style={{
                  backgroundColor: "var(--secondary)",
                }}
              >
                <div className="mb-1 flex min-w-0 items-center gap-1.5">
                  <TinyText
                    className={`!m-0 ${rD} text-foreground`}
                    style={{
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    {pr.preflightReadinessTitle}
                  </TinyText>
                  <GuidingTooltip
                    text={pg.preflightReadiness}
                    topic="Readiness and risk"
                  />
                </div>
                <TinyText
                  muted
                  className={`mb-2 block ${rDM}`}
                >
                  {pr.mockupSourceReadiness}
                </TinyText>
                <div
                  className="flex flex-1 flex-col justify-center gap-1.5 rounded-md p-3"
                  style={{
                    backgroundColor: "var(--background)",
                    boxShadow: "inset 0 0 0 1px var(--border)",
                  }}
                >
                  <div className="inline-flex items-center gap-1.5">
                    <TinyText
                      className={`!m-0 ${rD} text-foreground`}
                      style={{
                        fontWeight: "var(--font-weight-medium)",
                      }}
                    >
                      {pr.confidenceLabel}
                    </TinyText>
                    <GuidingTooltip
                      text={pg.reviewConfidenceIllustrative}
                      topic="Confidence"
                    />
                  </div>
                  <TinyText muted className={`!m-0 leading-relaxed ${rD}`}>
                    {pr.confidenceValue}
                  </TinyText>
                </div>
              </div>
            </div>
          </div>

          <div
            className="p-4 sm:p-5"
            style={{ backgroundColor: "var(--background)" }}
          >
            <div className="mb-2 flex items-center gap-2">
              <History
                className="size-4 shrink-0"
                style={{ color: "var(--muted-foreground)" }}
                aria-hidden
              />
              <SmallText
                className="!m-0"
                style={{ fontWeight: "var(--font-weight-medium)" }}
              >
                {pr.pastContextTitle}
              </SmallText>
              <GuidingTooltip
                text={pr.pastContextTooltipMeta}
                topic="Recent fleet context"
              />
            </div>
            <TinyText
              muted
              className={`!m-0 !mb-3 !max-w-prose pl-6 ${rDM}`}
            >
              {pr.pastContextIntro}
            </TinyText>
            <ul
              className={`m-0 list-disc space-y-1.5 pl-6 ${rD} text-foreground`}
            >
              {pr.pastContextPoints.map((line, i) => (
                <li key={i} className="pl-0.5">
                  {line}
                </li>
              ))}
            </ul>
            <TinyText
              muted
              className={`mt-3 block pl-6 ${rDM}`}
            >
              {pr.mockupSourcePastContext}
            </TinyText>
          </div>

          <Collapsible
            className="group"
            defaultOpen={false}
          >
            <div
              className="px-4 py-3 sm:px-5"
              style={{
                backgroundColor: "var(--secondary)",
              }}
            >
              <div className="flex items-start gap-1.5">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 gap-1.5 rounded text-left text-sm outline-offset-2 transition-colors hover:brightness-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                    style={{ color: "var(--foreground)" }}
                    aria-label={`${pr.channelsTitle}. ${pr.channelsCollapseHint}`}
                  >
                    <ChevronRight
                      className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90"
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <SmallText
                        className="!m-0 !block"
                        style={{
                          fontWeight: "var(--font-weight-medium)",
                          color: "var(--muted-foreground)",
                        }}
                      >
                        {pr.channelsTitle}
                      </SmallText>
                      <TinyText
                        muted
                        className={`!mt-1.5 !block max-w-prose !leading-relaxed ${rDM}`}
                      >
                        {pr.channelsIntroProduct}
                      </TinyText>
                      <TinyText
                        muted
                        className={`!mt-1.5 !block ${rDM}`}
                      >
                        {pr.mockupSourceExport}
                      </TinyText>
                    </span>
                  </button>
                </CollapsibleTrigger>
                <div className="shrink-0 pt-0.5">
                  <GuidingTooltip
                    text={pg.outsideConsoleChannels}
                    topic="Outside the console"
                  />
                </div>
              </div>
              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="mt-3 space-y-4 border-t pt-3" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <TinyText
                      className={`!m-0 block ${rD} text-foreground`}
                      style={{ fontWeight: "var(--font-weight-medium)" }}
                    >
                      {pr.channelsApiLabel}
                    </TinyText>
                    <TinyText
                      muted
                      className={`mt-0.5 block font-mono leading-relaxed ${rDM}`}
                    >
                      {channelSnippets.apiEndpointLine}
                    </TinyText>
                    <PlanChannelPreWithCopy
                      text={channelSnippets.apiJson}
                      rD={rD}
                      maxHeight="max-h-40"
                      copySuccess={pr.channelsCopySuccess}
                      copyFailed={pr.channelsCopyFailed}
                      copyAria={pr.channelsCopyAria}
                    />
                  </div>
                  <div>
                    <TinyText
                      className={`!m-0 block ${rD} text-foreground`}
                      style={{ fontWeight: "var(--font-weight-medium)" }}
                    >
                      {pr.channelsCliLabel}
                    </TinyText>
                    <PlanChannelPreWithCopy
                      text={channelSnippets.cli}
                      rD={rD}
                      maxHeight="max-h-36"
                      copySuccess={pr.channelsCopySuccess}
                      copyFailed={pr.channelsCopyFailed}
                      copyAria={pr.channelsCopyAria}
                    />
                  </div>
                  <div>
                    <TinyText
                      className={`!m-0 block ${rD} text-foreground`}
                      style={{ fontWeight: "var(--font-weight-medium)" }}
                    >
                      {pr.channelsGitopsLabel}
                    </TinyText>
                    <PlanChannelPreWithCopy
                      text={channelSnippets.gitopsYaml}
                      rD={rD}
                      maxHeight="max-h-40"
                      copySuccess={pr.channelsCopySuccess}
                      copyFailed={pr.channelsCopyFailed}
                      copyAria={pr.channelsCopyAria}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>
      </div>
      {/* Action Section */}
      <div
        className="p-6 border rounded"
        style={{
          borderRadius: "var(--radius)",
          borderColor: "var(--border)",
          backgroundColor: "var(--card)",
        }}
      >
        <SmallText
          style={{ fontWeight: "var(--font-weight-medium)" }}
          className="mb-4"
        >
          Action
        </SmallText>

        <div className="space-y-3">
          {selectedActions.length > 0 ? (
            selectedActions.map((action, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div>
                  <SmallText
                    style={{
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    {action.name}
                  </SmallText>
                  {action.sourceVersion &&
                    action.targetVersion &&
                    (isOpenshiftCatalogUpdateId(action.id) ? (
                      <TinyText muted className={`mt-0.5 block leading-snug ${rDM}`}>
                        {deploymentCopy.actionCatalog.reviewUpdateToOpenshiftPrefix}
                        {action.targetVersion}.{" "}
                        {
                          deploymentCopy.actionCatalog
                            .reviewOpenshiftPlacementBaseline
                        }
                      </TinyText>
                    ) : (
                      <TinyText muted className={`mt-0.5 ${rDM}`}>
                        {action.sourceVersion} → {action.targetVersion}
                      </TinyText>
                    ))}
                  {action.description && (
                    <TinyText muted className={`mt-1 ${rDM}`}>
                      {action.description}
                    </TinyText>
                  )}
                </div>
              </div>
            ))
          ) : (
            <TinyText muted className={rDM}>
              No actions selected
            </TinyText>
          )}
        </div>
      </div>

      {/* Placement Section */}
      {(() => {
        // Calculate matched clusters for review
        const reviewMatchedClusters = getClustersMatchingPlacement(formData);
        const previewClusters = reviewMatchedClusters.slice(0, 3);
        const remainingCount = reviewMatchedClusters.length - 3;

        return (
          <div
            className="p-6 border rounded"
            style={{
              borderRadius: "var(--radius)",
              borderColor: "var(--border)",
              backgroundColor: "var(--card)",
            }}
          >
            <div className="mb-3 flex items-center gap-1.5">
              <SmallText
                className="!mb-0"
                style={{ fontWeight: "var(--font-weight-medium)" }}
              >
                Placement
              </SmallText>
            </div>

            <div className="space-y-3">
              <div
                className="flex items-start justify-between py-2"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <TinyText muted className={rDM}>
                  Selection method
                </TinyText>
                <SmallText className={`text-right ${rD}`}>
                  {formData.fleetSelection === "label"
                    ? `Label: ${formData.labelSelector}`
                    : "Manual selection"}
                </SmallText>
              </div>

              <div
                className="flex items-start justify-between py-2"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <TinyText muted className={rDM}>
                  Targets as of
                </TinyText>
                <SmallText className={`text-right ${rD}`}>
                  {formatTargetsSnapshotAt(
                    formData.targetsSnapshotAt,
                  )}
                </SmallText>
              </div>

              <div
                className="flex items-start justify-between py-2"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <TinyText muted className={rDM}>
                  Matched clusters
                </TinyText>
                <SmallText
                  className={`text-right ${rD}`}
                  style={{ fontWeight: "var(--font-weight-medium)" }}
                >
                  {reviewMatchedClusters.length} clusters
                </SmallText>
              </div>

              {/* Cluster list */}
              {reviewMatchedClusters.length > 0 && (
                <div className="pt-2">
                  <div
                    className="border rounded overflow-hidden"
                    style={{
                      borderRadius: "var(--radius)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <table className={`w-full ${rD}`}>
                      <tbody>
                        {previewClusters.map((cluster, idx) => (
                          <tr
                            key={cluster.name}
                            style={{
                              borderBottom:
                                idx < previewClusters.length - 1
                                  ? "1px solid var(--border)"
                                  : "none",
                            }}
                          >
                            <td className="px-3 py-1.5">
                              <TinyText className={rD}>{cluster.name}</TinyText>
                            </td>
                            <td className="px-3 py-1.5">
                              <TinyText muted className={rDM}>
                                {cluster.env}
                              </TinyText>
                            </td>
                            <td className="px-3 py-1.5">
                              <TinyText muted className={rDM}>
                                {cluster.region}
                              </TinyText>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {remainingCount > 0 && (
                      <div
                        className="px-3 py-1.5 text-center"
                        style={{
                          backgroundColor: "var(--secondary)",
                          borderTop: "1px solid var(--border)",
                        }}
                      >
                        <TinyText muted className={rDM}>
                          +{remainingCount} more clusters
                        </TinyText>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Rollout Section */}
      <div
        className="p-6 border rounded"
        style={{
          borderRadius: "var(--radius)",
          borderColor: "var(--border)",
          backgroundColor: "var(--card)",
        }}
      >
        <SmallText
          style={{ fontWeight: "var(--font-weight-medium)" }}
          className="mb-4"
        >
          Rollout
        </SmallText>

        <div className="space-y-3">
          <div
            className="flex items-start justify-between py-2"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <TinyText muted className={rDM}>
              Rollout
            </TinyText>
            <SmallText className={`text-right capitalize ${rD}`}>
              {formData.rolloutMethod}
            </SmallText>
          </div>

          <div
            className="flex items-start justify-between py-2"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <TinyText muted className={rDM}>
              {deploymentCopy.rolloutStrategy.reviewSource}
            </TinyText>
            <SmallText className={`text-right ${rD}`}>
              {formData.rolloutStrategySource === "manual"
                ? deploymentCopy.rolloutStrategy.configureManual
                : deploymentCopy.rolloutStrategy.useSaved}
            </SmallText>
          </div>

          <div
            className="flex items-start justify-between py-2"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <TinyText muted className={rDM}>
              {deploymentCopy.rolloutStrategy.reviewSavedName}
            </TinyText>
            <SmallText className={`text-right ${rD}`}>
              {rolloutStrategyReviewName(
                formData,
                userRolloutStrategies,
              )}
            </SmallText>
          </div>

          <div
            className="flex items-start justify-between py-2"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <TinyText muted className={rDM}>
              {deploymentCopy.rolloutStrategy.reviewWillSave}
            </TinyText>
            <SmallText className={`text-right ${rD}`}>
              {formData.saveRolloutStrategyForReuse &&
              (formData.saveRolloutStrategyName || "").trim()
                ? `Save as "${(formData.saveRolloutStrategyName as string).trim()}" for reuse`
                : deploymentCopy.rolloutStrategy.reviewWillSaveNo}
            </SmallText>
          </div>

          <div
            className="flex items-start justify-between py-2"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <TinyText muted className={rDM}>
              Schedule
            </TinyText>
            <SmallText className={`text-right ${rD}`}>
              {formData.scheduleType === "immediate"
                ? "Now"
                : formData.scheduleType === "delayed"
                  ? `${formData.scheduledDate || "Date"} at ${formData.scheduledTime || "Time"}`
                  : `${formatLabel(formData.scheduleWindow)} ${formData.scheduleStartTime}-${formData.scheduleEndTime}`}
            </SmallText>
          </div>

          {formData.rolloutMethod === "rolling" && (
            <>
              <div
                className="flex items-start justify-between py-2"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <TinyText muted className={rDM}>
                  Clusters per wave
                </TinyText>
                <SmallText className={`text-right ${rD}`}>
                  {formData.pacingBatchSize || "5"} clusters
                </SmallText>
              </div>
              <div
                className="flex items-start justify-between py-2"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <TinyText muted className={rDM}>
                  Soak time
                </TinyText>
                <SmallText className={`text-right ${rD}`}>
                  {formData.pacingSoakTime === "0" || !formData.pacingSoakTime
                    ? "None (continuous)"
                    : formData.pacingSoakTime}
                </SmallText>
              </div>
              <div
                className="flex items-start justify-between py-2"
              >
                <TinyText muted className={rDM}>
                  Error threshold
                </TinyText>
                <SmallText className={`text-right ${rD}`}>
                  {formData.pacingErrorThreshold === "0"
                    ? "Stop on any failure"
                    : formData.pacingErrorThreshold === "100"
                      ? "Never stop"
                      : `${formData.pacingErrorThreshold || "5"}%`}
                </SmallText>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Canary + Full rollout configuration — review step */}
      {formData.rolloutMethod === "canary" && (
        <>
          {/* Canary rollout configuration */}
          <div
            className="p-6 border rounded"
            style={{
              borderRadius: "var(--radius)",
              borderColor: "var(--border)",
              backgroundColor: "var(--card)",
            }}
          >
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
              }}
              className="mb-4"
            >
              {deploymentCopy.rollout.canaryRolloutSectionTitle}
            </SmallText>

            <div className="space-y-3">
              <div
                className="flex items-start justify-between py-2"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <TinyText muted className={rDM}>
                  {deploymentCopy.rollout.canaryRolloutNarrowingLabel}
                </TinyText>
                <SmallText className={`text-right font-mono ${rD}`}>
                  {formData.canarySelector?.trim() ||
                    deploymentCopy.placement.placementEmpty}
                </SmallText>
              </div>

              <div
                className="flex items-start justify-between py-2"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <TinyText muted className={rDM}>
                  {deploymentCopy.rollout.canaryInScopeHeading}
                </TinyText>
                <SmallText
                  className={`text-right ${rD}`}
                  style={{ fontWeight: "var(--font-weight-medium)" }}
                >
                  {(() => {
                    const inScopeN = getClustersMatchingPlacement(formData)
                      .length;
                    return `${getCanaryClustersInPlacementScope(formData).length} of ${inScopeN} ${
                      inScopeN === 1 ? "cluster" : "clusters"
                    }`;
                  })()}
                </SmallText>
              </div>

              {/* Canary cluster list — intersection with Placement */}
              {(() => {
                const canaryClusters = getCanaryClustersInPlacementScope(formData);
                const previewCanaryClusters = canaryClusters.slice(0, 3);
                const remainingCanaryCount = canaryClusters.length - 3;
                
                if (canaryClusters.length === 0) return null;
                
                return (
                  <div className="pt-2 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
                    <div
                      className="border rounded overflow-hidden"
                      style={{
                        borderRadius: "var(--radius)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <table className={`w-full ${rD}`}>
                        <tbody>
                          {previewCanaryClusters.map((cluster, idx) => (
                            <tr
                              key={cluster.name}
                              style={{
                                borderBottom:
                                  idx < previewCanaryClusters.length - 1
                                    ? "1px solid var(--border)"
                                    : "none",
                              }}
                            >
                              <td className="px-3 py-1.5">
                                <TinyText className={rD}>{cluster.name}</TinyText>
                              </td>
                              <td className="px-3 py-1.5">
                                <TinyText muted className={rDM}>
                                  {cluster.env}
                                </TinyText>
                              </td>
                              <td className="px-3 py-1.5">
                                <TinyText muted className={rDM}>
                                  {cluster.region}
                                </TinyText>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {remainingCanaryCount > 0 && (
                        <div
                          className="px-3 py-1.5 text-center"
                          style={{
                            backgroundColor: "var(--secondary)",
                            borderTop: "1px solid var(--border)",
                          }}
                        >
                          <TinyText muted className={rDM}>
                            +{remainingCanaryCount} more clusters
                          </TinyText>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div
                className="flex items-start justify-between py-2"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <TinyText muted className={rDM}>
                  Soak duration
                </TinyText>
                <SmallText className={`text-right ${rD}`}>
                  {formData.phase1Soak === "0" || !formData.phase1Soak
                    ? "None (immediate)"
                    : formData.phase1Soak}
                </SmallText>
              </div>

              <div
                className="flex items-start justify-between py-2"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <TinyText muted className={rDM}>
                  Error threshold
                </TinyText>
                <SmallText className={`text-right ${rD}`}>
                  {formData.phase1ErrorThreshold === "0"
                    ? "Stop on any failure"
                    : formData.phase1ErrorThreshold === "100"
                      ? "Never stop"
                      : `${formData.phase1ErrorThreshold || "0"}%`}
                </SmallText>
              </div>

              <div className="flex items-start justify-between py-2">
                <TinyText muted className={rDM}>
                  Approval
                </TinyText>
                <SmallText className={`text-right ${rD}`}>
                  {formData.requireApproval
                    ? deploymentCopy.rollout.requiredBeforeFullRollout
                    : "Auto-promote after soak"}
                </SmallText>
              </div>
            </div>
          </div>

          {/* Full rollout configuration */}
          <div
            className="p-6 border rounded"
            style={{
              borderRadius: "var(--radius)",
              borderColor: "var(--border)",
              backgroundColor: "var(--card)",
            }}
          >
            <SmallText
              style={{
                fontWeight: "var(--font-weight-medium)",
              }}
              className="mb-4"
            >
              {deploymentCopy.rollout.fullRolloutSectionTitle}
            </SmallText>

            <div className="space-y-3">
              <div
                className="flex items-start justify-between py-2"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <TinyText muted className={rDM}>
                  Clusters per wave
                </TinyText>
                <SmallText className={`text-right ${rD}`}>
                  {formData.phase2Batch || "3"} clusters
                </SmallText>
              </div>

              <div
                className="flex items-start justify-between py-2"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <TinyText muted className={rDM}>
                  Soak time
                </TinyText>
                <SmallText className={`text-right ${rD}`}>
                  {formData.phase2SoakTime === "0" || !formData.phase2SoakTime
                    ? "None (continuous)"
                    : formData.phase2SoakTime}
                </SmallText>
              </div>

              <div className="flex items-start justify-between py-2">
                <TinyText muted className={rDM}>
                  Error threshold
                </TinyText>
                <SmallText className={`text-right ${rD}`}>
                  {formData.phase2ErrorThreshold === "0"
                    ? "Stop on any failure"
                    : formData.phase2ErrorThreshold === "100"
                      ? "Never stop"
                      : `${formData.phase2ErrorThreshold || "5"}%`}
                </SmallText>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Execution Policy Section */}
      <div
        className="p-6 border rounded"
        style={{
          borderRadius: "var(--radius)",
          borderColor: "var(--border)",
          backgroundColor: "var(--card)",
        }}
      >
        <SmallText
          style={{ fontWeight: "var(--font-weight-medium)" }}
          className="mb-4"
        >
          Execution policy
        </SmallText>

        <div className="space-y-3">
          <div
            className="flex items-start justify-between py-2"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <TinyText muted className={rDM}>
              Run as
            </TinyText>
            <SmallText className={`text-right ${rD}`}>
              {formData.runAs || "Personal (Adi Cluster Admin)"}
            </SmallText>
          </div>

          <div className="flex items-start justify-between py-2">
            <TinyText muted className={rDM}>
              Manual confirmation
            </TinyText>
            <SmallText className={`text-right ${rD}`}>
              {formData.requireManualConfirmation
                ? "Required"
                : "Not required"}
            </SmallText>
          </div>
        </div>
      </div>

      {/* Estimated Completion */}
      <div
        className="p-4 rounded flex items-start gap-3"
        style={{
          borderRadius: "var(--radius)",
          backgroundColor: "var(--secondary)",
        }}
      >
        <svg
          className="size-5 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 20 20"
          style={{ color: "var(--primary)" }}
        >
          <circle
            cx="10"
            cy="10"
            r="8"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M10 6V10L13 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div>
          <TinyText
            className={rD}
            style={{ fontWeight: "var(--font-weight-medium)" }}
          >
            Estimated completion
          </TinyText>
          <TinyText muted className={`mt-1 ${rDM}`}>
            {formData.rolloutMethod === "canary"
              ? deploymentCopy.rollout.durationSummaryAfterCanaryRollout(
                  formData.phase1Soak || "24h",
                )
              : formData.rolloutMethod === "rolling"
                ? `This deployment will roll out ${formData.pacingBatchSize || "5"} clusters per wave${formData.pacingSoakTime && formData.pacingSoakTime !== "0" ? ` with ${formData.pacingSoakTime} soak between waves` : ""}.`
                : "This deployment will update all clusters immediately."}
          </TinyText>
        </div>
      </div>
    </div>
  );
}