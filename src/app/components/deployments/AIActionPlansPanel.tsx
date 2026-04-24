import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ChevronRight, HelpCircle, Layers, RefreshCw, Shield, Sparkles } from "lucide-react";
import { Tooltip } from "@patternfly/react-core";
import {
  SmallText,
  TinyText,
  LabelText,
  PrimaryButton,
  TertiaryButton,
} from "../../../imports/UIComponents";
import "@patternfly/react-core/dist/styles/base-no-reset.css";
import { deploymentCopy } from "./deploymentPrototypeCopy";
import type { DeploymentTabId } from "./deploymentTabPresets";
import {
  buildAIPrebuiltPlanMaintenanceTiles,
  formatAIPrebuiltPlanHowItRunsBody,
  formatRolloutMethodAndScheduleValues,
  mergeAIPrebuiltPlanRolloutSlice,
} from "./rolloutStrategyPresets";

function HelpTip({ content, label }: { content: ReactNode; label: string }) {
  return (
    <Tooltip
      content={<div className="max-w-sm text-left text-xs leading-snug">{content}</div>}
      position="top"
    >
      <span className="inline-flex cursor-default align-middle" tabIndex={0} role="img" aria-label={label}>
        <HelpCircle
          className="size-3.5 shrink-0 opacity-65"
          style={{ color: "var(--muted-foreground)" }}
          aria-hidden
        />
      </span>
    </Tooltip>
  );
}

export type AIUpdatePlan = {
  id: string;
  planNumber: number;
  /** Catalog action to seed (e.g. update-ocp-4.18) */
  actionId: string;
  title: string;
  fromVersion: string;
  toVersion: string;
  channel: string;
  generatedAgo: string;
  prerequisites: string;
  preflight: { versionStatus: "FOUND" | "PENDING"; checks: "PASSED" | "PENDING" };
  health: { label: string; detail: string }[];
  /** In-cards + detail headline; pacing/schedule text is derived from `rollout` to match the wizard. */
  fleetRollout: { inScope: string };
  why: string;
  which: string;
  risk: { level: "LOW" | "MEDIUM" | "HIGH"; score: string; note: string };
  /** Pre-fills the Placement step label selector when the user chooses this plan */
  suggestedLabelSelector: string;
  /** Seeds saved rollout strategy + pacing in the wizard (Placement + Rollout steps) */
  rollout: {
    strategyPreset: "balanced-canary" | "weekend-push" | "gitops-aligned";
    /**
     * Phase-1 labels (AND), must narrow within suggestedLabelSelector — typically region,
     * pool, or tier so the first wave is smaller than full placement.
     */
    canaryPhaseLabel?: string;
    /** Merged after the preset is applied */
    overrides?: Record<string, unknown>;
  };
  compatibility: {
    summary: string;
    attention: { name: string; current: string; need: string; state: "ok" | "block" }[];
  };
  /** Extra context (tooltips); keep on-screen fields short */
  tooltips?: {
    prerequisites?: string;
    fleetRollout?: string;
    why?: string;
    which?: string;
    risk?: string;
    compatibility?: string;
  };
};

/** Same demo inventory shape as the wizard; includes illustrative OpenShift z-streams. */
type DemoPlanCluster = {
  name: string;
  env: string;
  region: string;
  ocpVersion: string;
  labels: string[];
};

const DEMO_PLAN_CLUSTERS: DemoPlanCluster[] = [
  {
    name: "virt-prod-01",
    env: "prod",
    region: "us-east-1",
    ocpVersion: "4.17.8",
    labels: ["env=prod", "tier=web", "update-window=weekend", "pilot=ocp-upgrade", "argocd.argoproj.io/managed=platform", "region=na"],
  },
  {
    name: "virt-prod-02",
    env: "prod",
    region: "us-west-2",
    ocpVersion: "4.17.8",
    labels: ["env=prod", "tier=web", "update-window=weekend", "pilot=ocp-upgrade", "argocd.argoproj.io/managed=platform", "region=na"],
  },
  {
    name: "virt-prod-03",
    env: "prod",
    region: "eu-west-1",
    ocpVersion: "4.17.10",
    labels: ["env=prod", "tier=web", "update-window=weekend", "argocd.argoproj.io/managed=platform"],
  },
  {
    name: "virt-prod-04",
    env: "prod",
    region: "ap-south-1",
    ocpVersion: "4.17.8",
    labels: ["env=prod", "tier=web", "argocd.argoproj.io/managed=platform"],
  },
  {
    name: "virt-prod-05",
    env: "prod",
    region: "ap-southeast-1",
    ocpVersion: "4.17.8",
    labels: ["env=prod", "tier=web"],
  },
  {
    name: "data-prod-01",
    env: "prod",
    region: "us-east-1",
    ocpVersion: "4.17.8",
    labels: ["env=prod", "tier=data", "update-window=weekend", "argocd.argoproj.io/managed=platform", "region=na"],
  },
  {
    name: "data-prod-02",
    env: "prod",
    region: "us-west-2",
    ocpVersion: "4.17.10",
    labels: ["env=prod", "tier=data", "update-window=weekend", "argocd.argoproj.io/managed=platform", "region=na"],
  },
  {
    name: "data-prod-03",
    env: "prod",
    region: "eu-west-1",
    ocpVersion: "4.17.8",
    labels: ["env=prod", "tier=data", "argocd.argoproj.io/managed=platform"],
  },
  { name: "canary-us-east-01", env: "canary", region: "us-east-1", ocpVersion: "4.16.5", labels: ["env=canary", "tier=canary", "tier=web"] },
  { name: "canary-us-west-01", env: "canary", region: "us-west-2", ocpVersion: "4.16.5", labels: ["env=canary", "tier=canary", "tier=web"] },
  { name: "canary-eu-west-01", env: "canary", region: "eu-west-1", ocpVersion: "4.16.5", labels: ["env=canary", "tier=canary", "tier=web"] },
  { name: "canary-ap-south-01", env: "canary", region: "ap-south-1", ocpVersion: "4.16.5", labels: ["env=canary", "tier=canary", "tier=web"] },
  {
    name: "virt-staging-01",
    env: "staging",
    region: "us-east-1",
    ocpVersion: "4.16.2",
    labels: ["env=staging", "env=stage", "tier=web"],
  },
  {
    name: "virt-staging-02",
    env: "staging",
    region: "us-west-2",
    ocpVersion: "4.16.2",
    labels: ["env=staging", "env=stage", "tier=web"],
  },
  {
    name: "data-staging-01",
    env: "staging",
    region: "us-east-1",
    ocpVersion: "4.16.2",
    labels: ["env=staging", "env=stage", "tier=data"],
  },
  {
    name: "virt-preprod-01",
    env: "preprod",
    region: "us-east-1",
    ocpVersion: "4.16.5",
    labels: ["env=preprod", "tier=web"],
  },
  {
    name: "virt-preprod-02",
    env: "preprod",
    region: "us-west-2",
    ocpVersion: "4.16.5",
    labels: ["env=preprod", "tier=web"],
  },
  { name: "virt-dev-01", env: "dev", region: "us-east-1", ocpVersion: "4.15.12", labels: ["env=dev", "tier=web"] },
  { name: "virt-dev-02", env: "dev", region: "us-east-1", ocpVersion: "4.15.12", labels: ["env=dev", "tier=web"] },
];

function normalizeSelectorPart(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^\s*then\s+/i, "")
    .trim();
}

/** Comma terms with OR semantics (any term matches), aligned with wizard `matchClustersBySelector` plus env/region/name. */
function partMatchesCluster(part: string, cluster: DemoPlanCluster): boolean {
  if (!part) return false;
  if (part.startsWith("env=")) {
    const v = part.slice("env=".length).trim();
    const env = cluster.env.toLowerCase();
    if (env === v) return true;
    if (v === "stage" && env === "staging") return true;
  }
  if (part.startsWith("region=")) {
    const v = part.slice("region=".length).trim();
    const reg = cluster.region.toLowerCase();
    if (reg === v) return true;
    if (v === "na" && (reg === "us-east-1" || reg === "us-west-2")) return true;
  }
  return (
    cluster.labels.some((label) => label.toLowerCase().includes(part)) ||
    cluster.name.toLowerCase().includes(part)
  );
}

function matchProposalClusters(selector: string): DemoPlanCluster[] {
  if (!selector?.trim()) return [];
  const selectorParts = selector.split(",").map((s) => normalizeSelectorPart(s)).filter(Boolean);
  return DEMO_PLAN_CLUSTERS.filter((cluster) => selectorParts.some((part) => partMatchesCluster(part, cluster)));
}

function demoClusterRiskNote(env: string): string {
  const e = env.toLowerCase();
  if (e === "prod") return "Wider blast radius; watch SLOs.";
  if (e === "staging" || e === "canary") return "Safer slice for early waves.";
  return "Low traffic; good for first checks.";
}

const DEMO_PLANS: AIUpdatePlan[] = [
  {
    id: "plan-1",
    planNumber: 1,
    actionId: "update-ocp-4.18",
    title: "Canary first, then the rest of the group",
    fromVersion: "4.16.2",
    toVersion: "4.18.5",
    channel: "fast-4.18",
    generatedAgo: "2h ago",
    prerequisites: "Optionally update shared add-ons (e.g. cert-manager) before later waves. Skip for a canary-only first wave.",
    preflight: { versionStatus: "FOUND", checks: "PASSED" },
    health: [
      { label: "Clusters selected", detail: "8 prod clusters match the proposed placement labels" },
      { label: "Node capacity", detail: "Headroom for parallel node drains (≥2 clusters per step)" },
    ],
    fleetRollout: {
      inScope: "~8 prod clusters · 3 waves: canary slice → main group → rest",
    },
    why: "Try the new z-stream on a small, representative set first, then the rest in batches (like channel rollouts in OpenShift).",
    which: "Waves and soak times follow common SLOs and the fast-4.18 channel — canary, not a big-bang on day one.",
    risk: {
      level: "LOW",
      score: "3/10",
      note: "Expect staggered node cordons. Sample data shows no CRD blockers for this change.",
    },
    suggestedLabelSelector: "env=prod",
    rollout: {
      strategyPreset: "balanced-canary",
      canaryPhaseLabel: "env=prod,region=us-east-1",
      overrides: { phase1Batch: "2", phase2Batch: "4", phase1Soak: "24h" },
    },
    compatibility: {
      summary: "4/5 built-in operators OK on samples; one add-on gap can block some clusters in later waves.",
      attention: [
        {
          name: "Network operator",
          current: "1.0.0",
          need: "1.0.0",
          state: "ok",
        },
        {
          name: "Storage (CSI) operator",
          current: "2.1.0",
          need: "2.2.0+",
          state: "block",
        },
      ],
    },
    tooltips: {
      prerequisites:
        "Stagger shared add-on bumps if your fleet depends on them. Not required to start a canary-only first wave.",
      fleetRollout:
        "First pass is two canary clusters and time to catch regressions. Later waves ship the same patch to the rest of the label in batches so a bad region or AZ does not all fail together.",
      why: "This mirrors a typical channel rollout: a narrow blast radius before you widen the fleet.",
      which: "Batches and pauses are tuned to your chosen channel, not a single one-size-fits-all schedule.",
      risk: "Live clusters may need cordons/serial drains. Verify CRDs in your org before a wide wave.",
      compatibility: "From sample control-plane data only; check every cluster before you promote a wave.",
    },
  },
  {
    id: "plan-2",
    planNumber: 2,
    actionId: "update-ocp-4.18",
    title: "Weekend windows, a few clusters per slot",
    fromVersion: "4.16.2",
    toVersion: "4.18.4",
    channel: "fast-4.18",
    generatedAgo: "2h ago",
    prerequisites:
      "Pre-update add-ons (e.g. Ingress) on affected clusters before weekend runs. Stagger by site; one version line across the fleet.",
    preflight: { versionStatus: "FOUND", checks: "PASSED" },
    health: [
      { label: "Label match", detail: "16 prod clusters in the NA weekend pool" },
      { label: "etcd backup", detail: "Recent backup OK (verify in prod)" },
    ],
    fleetRollout: {
      inScope: "~16 clusters · 4 weekend windows (Fri night–Sun night)",
    },
    why: "Fits “prod changes on weekends” policy: a few big windows, not many small ad hoc cutovers.",
    which: "Uses the update-window=weekend label; groups of four for your North America slot.",
    risk: {
      level: "MEDIUM",
      score: "5/10",
      note: "Heavier per weekend. Re-validate backups and failback. Four bad nodes matters more than one if you mis-scope the wave.",
    },
    suggestedLabelSelector: "update-window=weekend,env=prod",
    rollout: {
      strategyPreset: "weekend-push",
      canaryPhaseLabel: "env=prod,region=us-east-1",
      overrides: { pacingBatchSize: "4", pacingSoakTime: "12h" },
    },
    compatibility: {
      summary: "3/5 built-in operators in shape on samples; the rest need bumps before those clusters can join a wave.",
      attention: [
        { name: "Egress network operator", current: "3.0.0", need: "3.0.0", state: "ok" },
        { name: "Ingress operator", current: "1.1.0", need: "1.2.0", state: "block" },
      ],
    },
    tooltips: {
      prerequisites: "Get ingress and similar shared bits current before a multi-cluster weekend. You can roll site-by-site under the same label set.",
      fleetRollout: "Gates the next long window on health from the last batch, so you do not stack unknown failures.",
      which: "Selection is by label, not a manual list — you still tune the selector on Placement.",
      risk: "etcd/restore and blast radius: weekend batches move more at once. Dry-run for your org.",
      compatibility: "Table is sample data; reconcile operator versions in your registry before the wave goes wide.",
    },
  },
  {
    id: "plan-3",
    planNumber: 3,
    actionId: "update-ocp-4.17",
    title: "Stage → pre-prod → prod (separate gates)",
    fromVersion: "4.16.2",
    toVersion: "4.17.12",
    channel: "stable-4.17",
    generatedAgo: "3h ago",
    prerequisites: "Do not hit prod until every stage / pre-prod cluster passes the new z-stream and your health or Git checks agree.",
    preflight: { versionStatus: "FOUND", checks: "PASSED" },
    health: [
      { label: "Removed APIs", detail: "No deprecated k8s APIs on samples" },
    ],
    fleetRollout: {
      inScope: "~20 · 6 stage / 4 pre-prod / 10 prod (run each ring separately)",
    },
    why: "If a whole environment regresses, you do not already have the largest ring live.",
    which: "env=stage / preprod / prod labels so GitOps and apps move per environment together.",
    risk: { level: "LOW", score: "2/10", note: "Longer calendar time; each ring is a smaller, safer batch." },
    suggestedLabelSelector: "env=stage,then env=preprod,then env=prod",
    rollout: {
      strategyPreset: "balanced-canary",
      canaryPhaseLabel: "env=stage",
      overrides: { requireApproval: true, phase1Soak: "24h", phase2Batch: "3" },
    },
    compatibility: { summary: "All built-in operators on channel for the samples we checked.", attention: [] },
    tooltips: {
      prerequisites: "Gates: cluster health, optional GitOps/CI signals — you define what “green” means in prod.",
      fleetRollout: "Hard ordering between environment rings, not just smaller batches in one big pool.",
      which: "Labels reflect how you name environments today; the wizard still lets you narrow clusters.",
    },
  },
  {
    id: "plan-4",
    planNumber: 4,
    actionId: "update-ocp-4.18",
    title: "Pilots first, widen the label when ready",
    fromVersion: "4.16.2",
    toVersion: "4.18.3",
    channel: "fast-4.18",
    generatedAgo: "1h ago",
    prerequisites: "Keep the first 1–2 waves on pilot-tagged clusters only. Grow the label or the wave after the team approves.",
    preflight: { versionStatus: "FOUND", checks: "PASSED" },
    health: [
      { label: "Pilot group", detail: "2 pilot clusters ready; 6 more on same label (later)" },
    ],
    fleetRollout: {
      inScope: "8 on label: 2 → 3 → 3 (last wave optional)",
    },
    why: "Diverse, small set before you run the same recipe wide — not a one-day full fleet cutover.",
    which: "Pair (or a bit more) across failure domains so a single bad node is not the whole story.",
    risk: {
      level: "LOW",
      score: "2/10",
      note: "Pilots rarely cover every SKU; schedule another pass for untested regions or hardware after wave 2.",
    },
    suggestedLabelSelector: "pilot=ocp-upgrade,env=prod,region=na",
    rollout: {
      strategyPreset: "balanced-canary",
      canaryPhaseLabel: "env=prod,region=us-east-1,tier=web",
      overrides: { phase1Batch: "2", phase2Batch: "3", phase1Soak: "24h" },
    },
    compatibility: { summary: "Similar operator posture to a larger canary; small waves to limit blast if something is off.", attention: [] },
    tooltips: {
      prerequisites: "Use tags so only the pilot pool gets early traffic; you expand scope in Placement.",
      fleetRollout: "Smaller first waves = less noise in dashboards when you are still validating a z-stream change.",
    },
  },
  {
    id: "plan-5",
    planNumber: 5,
    actionId: "update-ocp-4.18",
    title: "Argo CD Healthy between waves",
    fromVersion: "4.16.2",
    toVersion: "4.18.5",
    channel: "fast-4.18",
    generatedAgo: "2h ago",
    prerequisites: "Every platform Argo CD Application must be Healthy on all clusters in a wave before the next wave starts.",
    preflight: { versionStatus: "FOUND", checks: "PASSED" },
    health: [
      { label: "Argo CD apps", detail: "Healthy on samples; next wave holds if not" },
    ],
    fleetRollout: {
      inScope: "~11 platform-tagged clusters · 3 per wave, pause for Argo between waves",
    },
    why: "Stops a bad mix of z-stream + desired state from spreading before you add more clusters.",
    which: "Reuses the argocd.argoproj.io/managed=platform (or your platform label) to slice clusters into waves.",
    risk: { level: "MEDIUM", score: "4/10", note: "Slower if sync flaps. Best when Git is the SoT for platform state." },
    suggestedLabelSelector: "argocd.argoproj.io/managed=platform,env=prod",
    rollout: {
      strategyPreset: "gitops-aligned",
      canaryPhaseLabel: "env=prod,region=us-east-1,tier=web",
      overrides: { phase2Batch: "3", phase1Soak: "24h" },
    },
    compatibility: {
      summary: "Platform apps green on samples; tenant add-ons can block a host until their chart catches up.",
      attention: [
        { name: "Add-on (example)", current: "1.0", need: "1.1", state: "block" },
      ],
    },
    tooltips: {
      prerequisites: "Tie the gate to applications you own — not every App in the cluster has to be green, only the ones in policy.",
      fleetRollout: "Pacing matches how you already run platform: upgrade node, then reconcile, then next slice.",
      why: "Common failure mode: cluster is “up” but the Git-defined platform is not — this blocks widen.",
      risk: "Add timeouts and on-call for stuck sync, or a stuck wave looks like a pipeline outage.",
    },
  },
];

type AIActionPlansPanelProps = {
  onApplyPlan: (plan: AIUpdatePlan) => void;
  /** Re-open this plan’s detail when returning to step 1 after “Fill wizard from plan” (matches `aiPlanPrefill.planId`). */
  initialDetailPlanId?: string | null;
  /** Seed target z-stream picker from the catalog action after apply (OpenShift updates). */
  seedTargetZStream?: string | null;
  /** When nested in a disclosure, omit outer card border/background to avoid double chrome */
  embedded?: boolean;
  /**
   * Deployments tab that opened the wizard. OpenShift fleet AI samples only apply on **All** and
   * **Platform**; Workloads and Virtualization show skeleton placeholders.
   */
  launchTab?: DeploymentTabId;
  /**
   * Primary catalog action on step 1. Full demo plan bodies match **Update OpenShift 4.18** only;
   * other catalog ids (including `update-ocp-4.17`) use expandable skeleton cards.
   */
  selectedCatalogActionId?: string | null;
};

function isOpenshiftZStreamCatalogAction(id: string | null | undefined): boolean {
  return id === "update-ocp-4.17" || id === "update-ocp-4.18";
}

function launchTabAllowsOcpAiDemo(tab: DeploymentTabId | undefined): boolean {
  return tab === "all" || tab === "clusters";
}

function SkeletonBar({
  className,
  style,
  delayMs = 0,
}: {
  className: string;
  style?: CSSProperties;
  delayMs?: number;
}) {
  return (
    <div
      className={`rounded animate-pulse ${className}`}
      style={{
        backgroundColor: "var(--muted)",
        animationDelay: `${delayMs}ms`,
        ...style,
      }}
      aria-hidden
    />
  );
}

function AIPlanCardSkeleton({ index }: { index: number }) {
  const d = index * 55;
  return (
    <div className="w-full min-w-0 space-y-2" aria-hidden>
      <div className="flex items-start justify-between gap-1">
        <SkeletonBar className="h-2.5 w-10" delayMs={d} />
        <SkeletonBar className="h-4 w-11" style={{ opacity: 0.65 }} delayMs={d + 20} />
      </div>
      <SkeletonBar className="h-3.5 w-[88%]" delayMs={d + 35} />
      <SkeletonBar className="h-3 w-full" style={{ opacity: 0.85 }} delayMs={d + 50} />
      <SkeletonBar className="h-2.5 w-full" style={{ opacity: 0.55 }} delayMs={d + 65} />
      <SkeletonBar className="h-2.5 w-[70%]" style={{ opacity: 0.5 }} delayMs={d + 80} />
      <SkeletonBar className="h-2 w-[42%]" style={{ opacity: 0.45 }} delayMs={d + 95} />
      <div className="flex flex-wrap gap-0.5 pt-0.5">
        <SkeletonBar className="h-5 w-14" style={{ opacity: 0.4 }} delayMs={d + 110} />
        <SkeletonBar className="h-5 w-16" style={{ opacity: 0.4 }} delayMs={d + 125} />
      </div>
      <SkeletonBar className="h-2 w-24" style={{ opacity: 0.35 }} delayMs={d + 140} />
    </div>
  );
}

function AIPlanExpandedSkeleton({
  planId,
  planNumber,
  onClose,
  footnote = deploymentCopy.aiPlans.nonOpenshiftExpandedFootnote,
}: {
  planId: string;
  planNumber: number;
  onClose: () => void;
  /** Shown under the skeleton (defaults to non-OCP footnote). */
  footnote?: string;
}) {
  return (
    <div
      id={`ai-plan-detail-${planId}`}
      role="region"
      aria-label={`${deploymentCopy.aiPlans.nonOpenshiftExpandedAriaLabel} Plan ${planNumber}.`}
      className="mt-1 space-y-3 rounded-md border p-3 sm:p-4"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2" style={{ borderColor: "var(--border)" }}>
        <TinyText muted className="!text-[10px]">
          Full review — Plan #{planNumber}
        </TinyText>
        <TertiaryButton type="button" className="!h-8 !px-2 !text-xs" onClick={onClose}>
          {deploymentCopy.aiPlans.hidePlanDetails}
        </TertiaryButton>
      </div>
      <TinyText muted className="!block !text-[10px] leading-snug">
        {footnote}
      </TinyText>
      <div className="pointer-events-none space-y-3" aria-hidden>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBar className="h-3 w-32" />
            <SkeletonBar className="h-5 max-w-[90%]" style={{ opacity: 0.85 }} delayMs={40} />
            <SkeletonBar className="h-4 max-w-[75%]" style={{ opacity: 0.7 }} delayMs={80} />
          </div>
          <div className="hidden w-full max-w-[14rem] space-y-2 sm:block">
            <SkeletonBar className="h-2.5 w-20" delayMs={20} />
            <SkeletonBar className="h-10 w-full" style={{ opacity: 0.55 }} delayMs={60} />
          </div>
        </div>
        <SkeletonBar className="h-16 w-full rounded-md" style={{ opacity: 0.45 }} delayMs={100} />
        <div className="grid gap-2 sm:grid-cols-2">
          <SkeletonBar className="h-24 w-full rounded-md" style={{ opacity: 0.4 }} delayMs={120} />
          <SkeletonBar className="h-24 w-full rounded-md" style={{ opacity: 0.38 }} delayMs={150} />
        </div>
        <SkeletonBar className="h-28 w-full rounded-md" style={{ opacity: 0.35 }} delayMs={180} />
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonBar key={i} className="h-20 w-full rounded-md" style={{ opacity: 0.33 }} delayMs={200 + i * 40} />
          ))}
        </div>
        <SkeletonBar className="h-14 w-full rounded-md" style={{ opacity: 0.3 }} delayMs={360} />
      </div>
    </div>
  );
}

function StatusBadge({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "success" | "warning" | "neutral";
}) {
  const color =
    variant === "success"
      ? { bg: "var(--secondary)", fg: "var(--primary)" }
      : variant === "warning"
        ? { bg: "hsl(38 100% 95%)", fg: "hsl(32 80% 35%)" }
        : { bg: "var(--secondary)", fg: "var(--muted-foreground)" };
  return (
    <span
      className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium uppercase"
      style={{ backgroundColor: color.bg, color: color.fg }}
    >
      {children}
    </span>
  );
}

/** Demo targets: z-stream → channel + catalog action (only 4.17 / 4.18 update actions exist in the wizard). */
const TARGET_META: Record<string, { channel: string; actionId: string }> = {
  "4.17.8": { channel: "stable-4.17", actionId: "update-ocp-4.17" },
  "4.17.10": { channel: "stable-4.17", actionId: "update-ocp-4.17" },
  "4.17.12": { channel: "stable-4.17", actionId: "update-ocp-4.17" },
  "4.18.1": { channel: "stable-4.18", actionId: "update-ocp-4.18" },
  "4.18.2": { channel: "stable-4.18", actionId: "update-ocp-4.18" },
  "4.18.3": { channel: "fast-4.18", actionId: "update-ocp-4.18" },
  "4.18.4": { channel: "fast-4.18", actionId: "update-ocp-4.18" },
  "4.18.5": { channel: "fast-4.18", actionId: "update-ocp-4.18" },
  "4.18.6": { channel: "candidate-4.18", actionId: "update-ocp-4.18" },
};

const TARGET_VERSION_OPTIONS = (
  [
    ["4.17.8", "4.17.8 (stable-4.17)"],
    ["4.17.10", "4.17.10 (stable-4.17)"],
    ["4.17.12", "4.17.12 (stable-4.17)"],
    ["4.18.1", "4.18.1 (stable-4.18)"],
    ["4.18.2", "4.18.2 (stable-4.18)"],
    ["4.18.3", "4.18.3 (fast-4.18)"],
    ["4.18.4", "4.18.4 (fast-4.18)"],
    ["4.18.5", "4.18.5 (fast-4.18)"],
    ["4.18.6", "4.18.6 (candidate-4.18)"],
  ] as const
).map(([value, label]) => ({ value, label }));

export function AIActionPlansPanel({
  onApplyPlan,
  initialDetailPlanId = null,
  seedTargetZStream = null,
  embedded = false,
  launchTab = "all",
  selectedCatalogActionId = null,
}: AIActionPlansPanelProps) {
  const initialZ = seedTargetZStream?.trim() || "4.18.5";
  const [targetVersion, setTargetVersion] = useState(initialZ);
  const [activeTarget, setActiveTarget] = useState(initialZ);
  /** Full plan review opens only after the user picks a plan; `null` keeps the panel compact. */
  const [detailPlanId, setDetailPlanId] = useState<string | null>(
    () => initialDetailPlanId ?? null,
  );
  const [generatedLabel, setGeneratedLabel] = useState("2h ago (example)");

  useEffect(() => {
    if (seedTargetZStream?.trim()) {
      const z = seedTargetZStream.trim();
      setTargetVersion(z);
      setActiveTarget(z);
    }
  }, [seedTargetZStream]);

  useEffect(() => {
    if (initialDetailPlanId) {
      setDetailPlanId(initialDetailPlanId);
    }
  }, [initialDetailPlanId]);

  const catalogAllowsOcpDemo =
    selectedCatalogActionId !== "update-ocp-4.17" &&
    (selectedCatalogActionId == null ||
      isOpenshiftZStreamCatalogAction(selectedCatalogActionId));
  const showOcpDemoPlans =
    launchTabAllowsOcpAiDemo(launchTab) && catalogAllowsOcpDemo;

  const isOcp417Catalog = selectedCatalogActionId === "update-ocp-4.17";
  const onClustersOrAllTab = launchTabAllowsOcpAiDemo(launchTab);

  const noOcpDemoPlaceholderIntro = !onClustersOrAllTab
    ? deploymentCopy.aiPlans.launchTabNoOcpDemoHint
    : isOcp417Catalog
      ? deploymentCopy.aiPlans.ocpOtherZstreamSkeletonHint
      : deploymentCopy.aiPlans.nonOpenshiftCatalogHint;

  const noOcpDemoExpandHint = !onClustersOrAllTab
    ? deploymentCopy.aiPlans.nonOpenshiftExpandHintLaunchTab
    : isOcp417Catalog
      ? deploymentCopy.aiPlans.ocpOtherZstreamExpandHint
      : deploymentCopy.aiPlans.nonOpenshiftCatalogExpandHint;

  const needsRegen = targetVersion !== activeTarget;

  const visiblePlans = useMemo(() => {
    const meta = TARGET_META[activeTarget] ?? TARGET_META["4.18.5"]!;
    return DEMO_PLANS.map((p) => ({
      ...p,
      toVersion: activeTarget,
      channel: meta.channel,
      actionId: meta.actionId,
      generatedAgo: generatedLabel,
    }));
  }, [activeTarget, generatedLabel]);

  const open = detailPlanId
    ? (visiblePlans.find((p) => p.id === detailPlanId) ?? null)
    : null;

  const matchedClustersForPlan = useMemo(() => {
    if (!showOcpDemoPlans || !open?.suggestedLabelSelector?.trim()) return [];
    return matchProposalClusters(open.suggestedLabelSelector);
  }, [showOcpDemoPlans, open?.suggestedLabelSelector]);

  /** Same merged rollout fields the wizard applies so copy stays aligned with Step 3 + Review. */
  const openMergedRollout = useMemo(() => {
    if (!open) return null;
    return mergeAIPrebuiltPlanRolloutSlice(
      {},
      {
        suggestedLabelSelector: open.suggestedLabelSelector,
        rollout: open.rollout,
      },
    );
  }, [open]);

  const openMaintenanceTiles = useMemo(
    () =>
      openMergedRollout
        ? buildAIPrebuiltPlanMaintenanceTiles(openMergedRollout)
        : null,
    [openMergedRollout],
  );

  const targetVersionControls = (
    <div className="mx-auto flex w-full max-w-[12rem] flex-col gap-1.5 sm:mx-0 sm:ml-auto sm:shrink-0 sm:self-start">
      <div className="mb-0 flex items-center gap-0.5">
        <LabelText className="!mb-0">
          {deploymentCopy.aiPlans.targetVersion}
        </LabelText>
        <HelpTip
          label="Target version"
          content="The z-stream (and its default update channel) you want the catalog action to target. It drives which plan text and which seed action we suggest."
        />
      </div>
      <select
        className="w-full rounded border px-2.5 py-1.5 text-sm"
        style={{ borderColor: "var(--border)" }}
        value={targetVersion}
        onChange={(e) => {
          setTargetVersion(e.target.value);
        }}
        aria-label="Target OpenShift version and update channel"
      >
        {TARGET_VERSION_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {needsRegen && (
        <div className="flex items-start gap-0.5">
          <TinyText
            className="!text-[10px] leading-snug"
            style={{ color: "hsl(32 80% 32%)" }}
          >
            {deploymentCopy.aiPlans.newTargetRegenerate}
          </TinyText>
          <HelpTip
            label="Why regenerate"
            content="Plans, channel, and the catalog action seed all depend on the target z-stream. Regenerating rewrites the set for that choice."
          />
        </div>
      )}
      <Tooltip
        content={
          <span className="text-xs">
            Rebuilds the example template plans for the selected z-stream, channel, and
            recommended catalog action. Live mode would re-query the fleet and policies.
          </span>
        }
        position="top"
      >
        <span className="inline-block w-full">
          <PrimaryButton
            type="button"
            className="!h-9 w-full inline-flex items-center justify-center gap-1.5"
            onClick={() => {
              setActiveTarget(targetVersion);
              setGeneratedLabel("Just now");
            }}
            aria-label="Regenerate suggested plans for the selected target"
          >
            <RefreshCw className="size-3.5 shrink-0" aria-hidden />
            {deploymentCopy.aiPlans.regeneratePlans}
          </PrimaryButton>
        </span>
      </Tooltip>
    </div>
  );

  const targetVersionControlsPlaceholder = (
    <div
      className="mx-auto flex w-full max-w-[12rem] flex-col gap-1.5 sm:mx-0 sm:ml-auto sm:shrink-0 sm:self-start"
      aria-hidden
    >
      <SkeletonBar className="h-4 w-24" />
      <SkeletonBar className="h-9 w-full" style={{ opacity: 0.5 }} delayMs={40} />
      <SkeletonBar className="h-9 w-full" style={{ opacity: 0.4 }} delayMs={80} />
    </div>
  );

  return (
    <div
      className={
        embedded
          ? "space-y-4 px-1 pb-1 pt-0 sm:px-2"
          : "space-y-4 rounded-lg border p-4 sm:p-5"
      }
      style={
        embedded
          ? undefined
          : { borderColor: "var(--border)", backgroundColor: "var(--card)" }
      }
    >
      {embedded ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1 space-y-0.5">
            <TinyText muted className="text-[12px] leading-snug">
              {showOcpDemoPlans
                ? deploymentCopy.aiPlans.embeddedPanelHint
                : noOcpDemoPlaceholderIntro}
            </TinyText>
            {showOcpDemoPlans ? (
              <TinyText muted className="!text-[10px] opacity-80">
                {deploymentCopy.aiPlans.exampleChannelPrefix}{" "}
                {TARGET_META[activeTarget]?.channel ?? "fast-4.18"}
              </TinyText>
            ) : null}
          </div>
          {showOcpDemoPlans ? targetVersionControls : targetVersionControlsPlaceholder}
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-1.5">
            <Sparkles
              className="mt-0.5 size-4 shrink-0"
              style={{ color: "var(--primary)" }}
              aria-hidden
            />
            <div className="min-w-0">
              <SmallText style={{ fontWeight: "var(--font-weight-medium)" }}>
                {deploymentCopy.aiPlans.panelTitle}
              </SmallText>
              <TinyText muted className="!mt-0.5 text-[12px]">
                {showOcpDemoPlans
                  ? deploymentCopy.aiPlans.panelIntro
                  : noOcpDemoPlaceholderIntro}
              </TinyText>
              {showOcpDemoPlans ? (
                <div className="mt-0.5 flex items-center gap-0.5">
                  <TinyText muted className="!text-[10px] opacity-80">
                    {deploymentCopy.aiPlans.exampleChannelPrefix}{" "}
                    {TARGET_META[activeTarget]?.channel ?? "fast-4.18"}
                  </TinyText>
                  <HelpTip
                    label="About example data"
                    content="These plans are mock content. A live assistant would use your cluster inventory, channels, and SLOs."
                  />
                </div>
              ) : null}
            </div>
          </div>
          {showOcpDemoPlans ? targetVersionControls : targetVersionControlsPlaceholder}
        </div>
      )}

      <div className="grid grid-cols-3 gap-1 max-[380px]:grid-cols-1">
        {showOcpDemoPlans ? (
          <>
            <div
              className="flex min-h-0 min-w-0 items-center justify-between gap-1 rounded border px-1.5 py-1"
              style={{ backgroundColor: "var(--background)" }}
            >
              <div className="flex min-w-0 items-center gap-0.5">
                <TinyText muted className="!text-[9px] leading-none">
                  Options
                </TinyText>
                <HelpTip
                  label="Options count"
                  content="The demo always shows five template plans. A live build could vary the count or rank order."
                />
              </div>
              <span
                className="shrink-0 tabular-nums text-[11px] font-medium"
                style={{ color: "var(--foreground)" }}
              >
                5
              </span>
            </div>
            <div
              className="flex min-h-0 min-w-0 items-center justify-between gap-1 rounded border px-1.5 py-1"
              style={{ backgroundColor: "var(--background)" }}
            >
              <div className="flex min-w-0 items-center gap-0.5">
                <TinyText muted className="!text-[9px] leading-none">
                  Fleet
                </TinyText>
                <HelpTip
                  label="Fleet size"
                  content="Example range in this mock. The real number comes from Placement when you set node labels and review matched clusters."
                />
              </div>
              <span
                className="shrink-0 tabular-nums text-[11px] font-medium"
                style={{ color: "var(--foreground)" }}
              >
                8–20
              </span>
            </div>
            <div
              className="flex min-h-0 min-w-0 items-center justify-between gap-1 rounded border px-1.5 py-1"
              style={{ backgroundColor: "var(--background)" }}
            >
              <div className="flex min-w-0 items-center gap-0.5">
                <TinyText muted className="!text-[9px] leading-none">
                  Time/cluster
                </TinyText>
                <HelpTip
                  label="Time per cluster"
                  content="Approximate active upgrade work per cluster. End-to-end fleet duration includes waves, soak, and change windows — often days."
                />
              </div>
              <span
                className="shrink-0 text-right text-[10px] font-medium leading-tight"
                style={{ color: "var(--foreground)" }}
              >
                ~40–60m
              </span>
            </div>
          </>
        ) : (
          <>
            {[0, 1, 2].map((i) => (
              <div
                key={`ai-plan-stat-skel-${i}`}
                className="flex min-h-0 min-w-0 items-center justify-between gap-1 rounded border px-1.5 py-1"
                style={{ backgroundColor: "var(--background)" }}
                aria-hidden
              >
                <SkeletonBar className="h-2.5 w-12" delayMs={i * 50} />
                <SkeletonBar className="h-3 w-8" style={{ opacity: 0.55 }} delayMs={i * 50 + 25} />
              </div>
            ))}
          </>
        )}
      </div>

      <div>
        <LabelText className="!mb-2">
          {deploymentCopy.aiPlans.suggestedPlans}
        </LabelText>
        {!detailPlanId && (
          <TinyText muted className="!mb-2 !block !text-[11px] leading-snug">
            {showOcpDemoPlans
              ? deploymentCopy.aiPlans.selectPlanToExpandHint
              : noOcpDemoExpandHint}
          </TinyText>
        )}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {visiblePlans.map((plan) => {
            const isOpen = detailPlanId === plan.id;
            const planRolloutMerged = mergeAIPrebuiltPlanRolloutSlice(
              {},
              {
                suggestedLabelSelector: plan.suggestedLabelSelector,
                rollout: plan.rollout,
              },
            );
            const planMethodSchedule = formatRolloutMethodAndScheduleValues(
              planRolloutMerged,
            );
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() =>
                  setDetailPlanId((id) => (id === plan.id ? null : plan.id))
                }
                aria-expanded={isOpen}
                aria-controls={isOpen ? `ai-plan-detail-${plan.id}` : undefined}
                aria-label={
                  showOcpDemoPlans
                    ? undefined
                    : `${deploymentCopy.aiPlans.nonOpenshiftExpandedAriaLabel} Plan ${plan.planNumber}.`
                }
                className="flex w-full min-h-[7.5rem] flex-col items-start justify-between gap-1.5 rounded-md border p-2.5 text-left transition"
                style={{
                  borderColor: isOpen ? "var(--primary)" : "var(--border)",
                  borderWidth: isOpen ? 2 : 1,
                  backgroundColor: isOpen ? "var(--secondary)" : "var(--background)",
                }}
              >
                <div className="w-full min-w-0">
                  {showOcpDemoPlans ? (
                    <>
                      <div className="flex items-start justify-between gap-1">
                        <span
                          className="text-[9px] font-medium uppercase"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          Plan #{plan.planNumber}
                        </span>
                        <StatusBadge
                          variant={
                            plan.risk.level === "LOW" ? "success" : "warning"
                          }
                        >
                          {plan.risk.level}
                        </StatusBadge>
                      </div>
                      <SmallText
                        className="!mt-0.5 block !text-[12px] leading-tight"
                        style={{ fontWeight: "var(--font-weight-medium)" }}
                      >
                        {deploymentCopy.aiPlans.updateToOpenshift}{" "}
                        {plan.toVersion}
                      </SmallText>
                      <TinyText
                        muted
                        className="!mt-0.5 !line-clamp-2 !text-[10px] !leading-snug"
                        style={{ fontWeight: "var(--font-weight-medium)" }}
                      >
                        {plan.title}
                      </TinyText>
                      <TinyText
                        muted
                        className="!mt-0.5 !line-clamp-1 !text-[9px] !leading-tight"
                        title={planMethodSchedule}
                      >
                        {planMethodSchedule}
                      </TinyText>
                      <TinyText
                        muted
                        className="!mt-1 !line-clamp-2 !text-[9px] !leading-tight"
                      >
                        {plan.fleetRollout.inScope}
                      </TinyText>
                      <TinyText muted className="!mt-1 !text-[9px]">
                        {plan.channel}
                      </TinyText>
                      <code
                        className="mt-1 block max-w-full truncate rounded px-1 py-0.5 text-left text-[8px] font-mono"
                        style={{
                          backgroundColor: "var(--secondary)",
                          border: "1px solid var(--border)",
                        }}
                        title={plan.suggestedLabelSelector}
                      >
                        {plan.suggestedLabelSelector}
                      </code>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-1">
                        <span
                          className="text-[9px] font-medium uppercase"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          Plan #{plan.planNumber}
                        </span>
                      </div>
                      <AIPlanCardSkeleton index={plan.planNumber - 1} />
                    </>
                  )}
                </div>
                {showOcpDemoPlans ? (
                  <span className="text-[9px] opacity-70">
                    Updated {plan.generatedAgo}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {open && !showOcpDemoPlans && (
        <AIPlanExpandedSkeleton
          planId={open.id}
          planNumber={open.planNumber}
          onClose={() => setDetailPlanId(null)}
          footnote={
            isOcp417Catalog
              ? deploymentCopy.aiPlans.ocpOtherZstreamExpandedFootnote
              : deploymentCopy.aiPlans.nonOpenshiftExpandedFootnote
          }
        />
      )}

      {open && showOcpDemoPlans && (
        <div
          id={`ai-plan-detail-${open.id}`}
          role="region"
          aria-label={`Details for plan ${open.planNumber}`}
          className="mt-1 space-y-3 rounded-md border p-3 sm:p-4"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2" style={{ borderColor: "var(--border)" }}>
            <TinyText muted className="!text-[10px]">
              Full review — Plan #{open.planNumber}
            </TinyText>
            <TertiaryButton
              type="button"
              className="!h-8 !px-2 !text-xs"
              onClick={() => setDetailPlanId(null)}
            >
              {deploymentCopy.aiPlans.hidePlanDetails}
            </TertiaryButton>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-0.5 flex items-center gap-1.5">
                <Shield className="size-3.5" style={{ color: "var(--primary)" }} aria-hidden />
                <span className="text-[10px] font-medium uppercase" style={{ color: "var(--muted-foreground)" }}>
                  {deploymentCopy.aiPlans.updateToOpenshift} {open.toVersion}
                </span>
                <HelpTip
                  label="Proposed upgrade"
                  content={deploymentCopy.aiPlans.planUpgradeTooltip}
                />
              </div>
              <SmallText className="!text-base">{open.title}</SmallText>
            </div>
            <div className="text-right sm:max-w-[15rem]">
              <div className="mb-0.5 flex items-center justify-end gap-0.5">
                <TinyText
                  muted
                  className="!text-[9px] font-medium uppercase"
                >
                  Prerequisites
                </TinyText>
                <HelpTip
                  label="Prerequisites for this plan"
                  content={
                    <span>
                      {open.tooltips?.prerequisites ? (
                        <>{open.tooltips.prerequisites} </>
                      ) : null}
                      Optional prep (add-ons, backups) may land after a canary; hard gates are called out
                      in the one-line text.
                    </span>
                  }
                />
              </div>
              <TinyText className="!text-[10px] leading-tight" style={{ color: "hsl(32 80% 32%)" }}>
                {open.prerequisites}
              </TinyText>
            </div>
          </div>

          <div
            className="rounded border p-3"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="mb-1.5 flex items-start gap-2">
              <Layers
                className="mt-0.5 size-3.5 shrink-0"
                style={{ color: "var(--primary)" }}
                aria-hidden
              />
              <div>
                <div className="flex items-center gap-0.5">
                  <span
                    className="text-[10px] font-medium uppercase"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    How the rollout is split
                  </span>
                  <HelpTip
                    label="Rollout structure"
                    content={
                      open.tooltips?.fleetRollout ?? (
                        <span>
                          Pacing and schedule below match the Rollout step after you use “Fill wizard from
                          plan.” The Placement step still defines which clusters are in each wave.
                        </span>
                      )
                    }
                  />
                </div>
                <SmallText className="!mt-0.5 !text-[12px] font-medium" style={{ fontWeight: 600 }}>
                  {open.fleetRollout.inScope}
                </SmallText>
                {openMergedRollout ? (
                  <TinyText
                    className="!mt-1.5 !text-[11px] leading-relaxed"
                    style={{ color: "var(--foreground)" }}
                  >
                    {formatAIPrebuiltPlanHowItRunsBody(openMergedRollout)}
                  </TinyText>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <div
                className="flex items-start justify-between gap-2 rounded border p-2"
                style={{ backgroundColor: "var(--card)" }}
              >
                <div>
                  <div className="flex items-center gap-0.5">
                    <TinyText muted>Channel {open.channel}</TinyText>
                    <HelpTip
                      label="Update channel"
                      content="OCP z-streams come from a channel (e.g. fast, stable). This card ties the plan to the channel and target the catalog action will use."
                    />
                  </div>
                  <SmallText>
                    z-stream {open.toVersion} for clusters in your placement
                  </SmallText>
                </div>
                <StatusBadge variant="success">{open.preflight.versionStatus}</StatusBadge>
              </div>
              <div
                className="flex items-start justify-between gap-2 rounded border p-2"
                style={{ backgroundColor: "var(--card)" }}
              >
                <div>
                  <div className="flex items-center gap-0.5">
                    <TinyText muted>Pre-checks (sample)</TinyText>
                    <HelpTip
                      label="Pre-checks"
                      content="Demo: representative cluster/operator health. In production, wire this to your CMDB, observability, and preflight jobs."
                    />
                  </div>
                  <SmallText>Cluster health and built-in operators (samples)</SmallText>
                </div>
                <StatusBadge variant="success">{open.preflight.checks}</StatusBadge>
              </div>
            </div>
            <div>
              <div className="mb-0.5 flex items-center gap-0.5">
                <TinyText muted className="!text-[10px]">
                  Label selector (prefills Placement)
                </TinyText>
                <HelpTip
                  label="Suggested label selector"
                  content="Pair-style or comma list that seeds Placement. You still own the final cluster set in the wizard."
                />
              </div>
              <code
                className="block w-fit max-w-full rounded px-1 py-0.5 text-[9px] font-mono"
                style={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                }}
              >
                {open.suggestedLabelSelector}
              </code>
            </div>

            <div className="rounded border p-2" style={{ backgroundColor: "var(--card)" }}>
              <div className="mb-1 flex flex-wrap items-center gap-0.5">
                <SmallText className="!text-[11px]">
                  {deploymentCopy.aiPlans.matchedClustersSectionTitle}
                </SmallText>
                <HelpTip
                  label={deploymentCopy.aiPlans.matchedClustersSectionTitle}
                  content={deploymentCopy.aiPlans.matchedClustersSectionHelp}
                />
              </div>
              {matchedClustersForPlan.length === 0 ? (
                <TinyText muted className="!text-[10px] leading-snug">
                  {deploymentCopy.aiPlans.matchedClustersEmpty}
                </TinyText>
              ) : (
                <div className="overflow-x-auto">
                  <table
                    className="w-full text-left text-[9px] sm:text-[10px]"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        <th className="p-1 font-medium">{deploymentCopy.aiPlans.matchedClusterColCluster}</th>
                        <th className="p-1 font-medium">{deploymentCopy.aiPlans.matchedClusterColEnv}</th>
                        <th className="p-1 font-medium">{deploymentCopy.aiPlans.matchedClusterColRegion}</th>
                        <th className="p-1 font-medium">{deploymentCopy.aiPlans.matchedClusterColVersion}</th>
                        <th className="p-1 font-medium">{deploymentCopy.aiPlans.matchedClusterColRisk}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchedClustersForPlan.map((c) => (
                        <tr key={c.name} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td className="p-1 font-mono">{c.name}</td>
                          <td className="p-1">{c.env}</td>
                          <td className="p-1">{c.region}</td>
                          <td className="p-1 font-mono">{c.ocpVersion}</td>
                          <td className="p-1 leading-snug">{demoClusterRiskNote(c.env)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {open.health.map((h) => (
              <div
                key={h.label}
                className="rounded border p-2"
                style={{ backgroundColor: "var(--card)" }}
              >
                <div className="mb-0.5 flex items-center gap-0.5">
                  <span className="text-emerald-600" aria-hidden>
                    ✓
                  </span>
                  <SmallText className="!text-[12px]">{h.label}</SmallText>
                </div>
                <TinyText muted className="!text-[10px]">
                  {h.detail}
                </TinyText>
              </div>
            ))}
          </div>

          {open.compatibility.attention.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-0.5">
                <SmallText>Cluster operators (sample)</SmallText>
                <HelpTip
                  label="Cluster operators on samples"
                  content={
                    <span>
                      {open.tooltips?.compatibility ? <>{open.tooltips.compatibility} </> : null}
                      From representative clusters only — fix gaps before a wave is promoted in prod.
                    </span>
                  }
                />
              </div>
              <TinyText muted className="!text-[11px] leading-snug">
                {open.compatibility.summary}
              </TinyText>
              <div className="overflow-x-auto">
                <table
                  className="w-full text-left text-[10px] sm:text-[11px]"
                  style={{ borderColor: "var(--border)" }}
                >
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <th className="p-1.5 font-medium">Operator</th>
                      <th className="p-1.5 font-medium">Installed</th>
                      <th className="p-1.5 font-medium">Needed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {open.compatibility.attention.map((o) => (
                      <tr
                        key={o.name}
                        style={{
                          backgroundColor: o.state === "block" ? "hsl(32 100% 96%)" : "transparent",
                        }}
                      >
                        <td className="p-1.5">{o.name}</td>
                        <td className="p-1.5 font-mono">{o.current}</td>
                        <td className="p-1.5 font-mono">{o.need}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-0.5 flex items-center gap-0.5">
                <span className="text-[9px] font-medium uppercase" style={{ color: "var(--muted-foreground)" }}>
                  Why
                </span>
                <HelpTip
                  label="Why this plan"
                  content={
                    open.tooltips?.why ?? (
                      <span>What this plan optimizes for (risk, SLO, change window) in a few words.</span>
                    )
                  }
                />
              </div>
              <TinyText className="!mt-0.5 leading-relaxed" style={{ fontSize: 11 }}>
                {open.why}
              </TinyText>
            </div>
            <div>
              <div className="mb-0.5 flex items-center gap-0.5">
                <span className="text-[9px] font-medium uppercase" style={{ color: "var(--muted-foreground)" }}>
                  How it was chosen
                </span>
                <HelpTip
                  label="How the plan was chosen"
                  content={
                    open.tooltips?.which ?? (
                      <span>What inputs (labels, channel, environment) the template used to build this plan.</span>
                    )
                  }
                />
              </div>
              <TinyText className="!mt-0.5 leading-relaxed" style={{ fontSize: 11 }}>
                {open.which}
              </TinyText>
            </div>
          </div>

          <div
            className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3"
            style={{ fontSize: 10 }}
          >
            <div className="rounded border p-2" style={{ backgroundColor: "var(--card)" }}>
              <div className="mb-0.5 flex items-center gap-0.5">
                <TinyText muted>Change window</TinyText>
                <HelpTip
                  label="Change window"
                  content="Same schedule line as the wizard Review step (now, delayed start, or weekend window and times) after you apply this plan."
                />
              </div>
              <SmallText className="!text-xs">
                {openMaintenanceTiles?.window ?? "—"}
              </SmallText>
            </div>
            <div className="rounded border p-2" style={{ backgroundColor: "var(--card)" }}>
              <div className="mb-0.5 flex items-center gap-0.5">
                <TinyText muted>Duration (rough)</TinyText>
                <HelpTip
                  label="Duration"
                  content="Soak and pacing from the plan’s built-in strategy (phase-1 and between steps), matching the Rollout step."
                />
              </div>
              <SmallText className="!text-xs">
                {openMaintenanceTiles?.duration ?? "—"}
              </SmallText>
            </div>
            <div className="rounded border p-2" style={{ backgroundColor: "var(--card)" }}>
              <div className="mb-0.5 flex items-center gap-0.5">
                <TinyText muted>Batching</TinyText>
                <HelpTip
                  label="Rollout pattern"
                  content="Phase-1 size, canary label slice, and pacing from the same preset the wizard will load when you apply this plan."
                />
              </div>
              <SmallText className="!text-xs">
                {openMaintenanceTiles?.strategy ?? "—"}
              </SmallText>
            </div>
          </div>

          <div
            className="flex items-center justify-between gap-2 rounded border p-2"
            style={{ backgroundColor: "var(--secondary)" }}
          >
            <div>
              <div className="mb-0.5 flex items-center gap-1">
                <span className="text-[9px] font-medium uppercase" style={{ color: "var(--muted-foreground)" }}>
                  {deploymentCopy.aiPlans.planRiskSectionTitle}
                </span>
                <HelpTip
                  label={deploymentCopy.aiPlans.planRiskSectionTitle}
                  content={
                    <span>
                      {open.tooltips?.risk ? <>{open.tooltips.risk} </> : null}
                      Heuristic from scope, operator gaps, and blast radius — not a formal CVSS.
                    </span>
                  }
                />
              </div>
              <div className="mb-0.5 flex items-center gap-1.5">
                <StatusBadge
                  variant={open.risk.level === "LOW" ? "success" : "warning"}
                >
                  {open.risk.level} risk
                </StatusBadge>
                <span className="text-[10px] font-medium" style={{ color: "var(--foreground)" }}>
                  {open.risk.score}
                </span>
              </div>
              <TinyText className="!text-[10px] leading-snug">{open.risk.note}</TinyText>
            </div>
            <TertiaryButton
              type="button"
              className="!shrink-0 gap-1.5"
              title={deploymentCopy.aiPlans.applyPlanButtonTitle}
              onClick={() => onApplyPlan(open)}
            >
              {deploymentCopy.aiPlans.applyPlanButton}
              <ChevronRight className="size-3.5" />
            </TertiaryButton>
          </div>
        </div>
      )}
    </div>
  );
}
