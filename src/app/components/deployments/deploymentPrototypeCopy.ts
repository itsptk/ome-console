/**
 * Deployment wizard + related prototype — **single source of truth for user-facing copy**.
 *
 * - Prefer importing from here for new UI in `deployments/` (wizard, create flow, AI plans).
 * - Keep tone: fleet / multi-cluster, OpenShift-flavored, concise.
 * - Do not duplicate these strings inline; extend this module when you add surfaces.
 *
 * **Rollout / schedule vocabulary** (see `.cursor/rules/deployments-prototype-copy.mdc`):
 * - Canary path section headings: **Phase 1: Canary rollout** then **Phase 2: Full rollout** (matches progress / activity table wording).
 * - Methods: **Canary**, **Rolling**, **Immediate** (form: canary / rolling / immediate).
 * - Schedule: **Now**, **Delayed**, **Maintenance window** (form: immediate / delayed / window).
 */

export const deploymentCopy = {
  actionCatalog: {
    parametersTitle: "Action parameters",
    areaFilteredHintPrefix: "Catalog is scoped to",
    areaFilteredHintSuffix:
      ". Open Create from the “All” tab to browse the full catalog.",
    /** Step 1 before an action / plan / explicit placement seed: do not imply placement is chosen. */
    riskStripTitlePending: "Scope & risk (preview)",
    riskStripPendingBody:
      "Placement and cluster scope are not set on this screen until you choose an action or an AI plan. Rollout fields below are prototype defaults for step 3 only.",
    riskStripTitleLive: "Scope & risk (from your draft)",
    riskInScope: "Clusters in scope (demo)",
    riskInScopePending: "Clusters in scope",
    riskPlacement: "Placement preview",
    riskPlacementPending: "Placement",
    riskPlacementPendingValue: "Not set yet — define in Placement (next step)",
    riskClustersPendingValue: "—",
    riskRollout: "Rollout method",
    riskSchedule: "Schedule",
    riskRunAs: "Run as",
    riskNone: "—",
    step1PickActionTitle: "Pick an action first",
    step1PickActionBody:
      "Use search (⌘K / Ctrl+K) or Recommendations below. That locks in the catalog entry and lets you tune placement and targets afterward. Need verbs and filters? Expand “Show all actions & filters”.",
    step1SearchHint:
      "Results are limited to this step’s catalog. Choosing one selects that action as your primary.",
    omniboxPlaceholder:
      "Search actions by name, description, or id… (⌘K / Ctrl+K)",
    omniboxShortcutHint: "Focus search",
    omniboxNoMatches:
      "No matching actions in this catalog for your search.",
    /** Step 1 omnibox: shown when the field is focused and empty (scoped to launch tab). */
    omniboxAreaPicksHeading: (areaLabel: string) => `Suggested for ${areaLabel}`,
    omniboxAreaPicksHint:
      "Same starters as Recommended below — pick one or type to search this tab’s catalog.",
    omniboxAreaPicksEmpty:
      "No suggested actions for this area in the prototype catalog.",
    omniboxEmptyPlacementNoClusters:
      "Set Placement labels (or search-pick clusters) so recommendations can be scoped to that fleet.",
    recommendedEmptyPlacementFirst:
      "No default recommendations fit this placement’s sample inventory. Use search or the full catalog to pick an action for your selected clusters.",
    /** OpenShift fleet update: target z-stream only; “from” comes from placement/inventory in a live product */
    openshiftTargetVersionLabel: "Target OpenShift z-stream",
    reviewUpdateToOpenshiftPrefix: "Update to OpenShift ",
    reviewOpenshiftPlacementBaseline:
      "Per-cluster starting level comes from inventory for clusters in your placement; the editor shows example values here.",
    recommendedTitle: "Recommended for this area",
    recommendedHint:
      "Popular actions for this tab. Select one as your primary, or use search and the full catalog for more choices.",
    recommendedHintPlacementFirst:
      "Actions below are filtered to what the prototype catalog can run on the clusters in your Placement. Pick one, or use search and the full catalog.",
    showAdvancedCatalog: "Show all actions & filters",
    hideAdvancedCatalog: "Hide full catalog",
    quickTemplateOcp: "OCP z-stream (fast channel)",
    quickTemplateOcpHint: "Selects the fleet OCP update and sets fast-4.18.",
    quickTemplateNet: "Harden ingress (NetworkPolicy)",
    quickTemplateNetHint: "Selects deny-external and label-scoped namespaces.",
    quickTemplateVm: "VM migration (live)",
    quickTemplateVmHint: "Selects hypervisor rollover with live migration.",
    /** Step 1: selected primary action details (manual path, or after a manual pick). */
    manualActionSectionTitle: "Primary action",
    /** Step 1: when Source is plan-based, only extra catalog rows (e.g. dependents) need a card — the primary is implied by the catalog + plan. */
    step1AdditionalActionsTitle: "Additional actions",
    /** vs Manual: templates, presets, org libraries, or AI-generated — anything that starts from a suggested plan, not only model output. */
    step1PathAiTitle: "Plan-based",
    step1PathManualTitle: "Manual",
    /** Shown after a primary catalog action is selected. */
    step1PathSwitchLabel: "Source",
  },

  /** Fleet plan terminology (Apr 24 prototype — “plan” as first-class object) */
  fleetPlan: {
    pageTitle: "Fleet plans",
    navLabel: "Fleet plans",
  },

  /** Clusters list — bulk selection → fleet plan wizard */
  clustersListPage: {
    createClusterUpgradePlan: "Create cluster upgrade plan",
    createClusterUpgradePlanTitle:
      "Create a fleet plan to upgrade the selected OpenShift clusters",
  },

  /**
   * Hot-pink “?” (`GuidingTooltip`) — in-product help **or** design/commentary that must not
   * read as shipped console copy. Snippets, placeholders, and samples live here, not in body text.
   */
  prototypeGuiding: {
    reviewEntryOrder:
      "You can start with an action or with cluster placement; only the order of the steps changes. Both paths end in the same kind of fleet plan.",
    /** Left column = diff / change preview (not the same as “readiness” on the right) */
    preflightChangePreview:
      "A diff-style preview of the changes this plan would apply: versions, channels, and related resources. Different from the readiness check beside it.",
    preflightReadiness:
      "Health, policy, and risk signals for a go/no-go: separate from the change list on the left, which is only what would differ on disk or in the API.",
    outsideConsoleChannels:
      "Export uses this draft’s values. Point host, API group, and version at your management API before running outside the console.",
    reviewConfidenceIllustrative:
      "How we roll up health and policy into a single confidence readout — use your platform’s real signals when integrated.",
  },

  wizard: {
    /** Primary entry (split button, empty state, wizard chrome) */
    createButton: "Create fleet plan",
    title: "Create fleet plan",
    subtitle: "",
    startDifferently: "Start differently",
    next: "Next",
    back: "Back",
    cancel: "Cancel",
    createDeploymentSubmit: "Save plan",
    narrowSectionEntry: "Wizard entry",
    narrowSectionArea: "Area",
    narrowToggleActionFirst: "Action first",
    narrowTogglePlacementFirst: "Placement first",
    narrowMenuActionFirstSection: "Action first",
    narrowMenuPlacementFirstSection: "Placement first",
    /** Split-button chevron trigger */
    narrowSplitChevronAria:
      "More create paths — every area for Action first and Placement first (same as dialog)",
  },

  steps: {
    action: "Action",
    placement: "Placement",
    rollout: "Rollout",
    executionPolicy: "Execution policy",
    reviewCreate: "Review plan",
    hints: {
      action:
        "Choose an action: Update, Install, Apply, Delete, or Create",
      placement: "Select clusters to include in this plan",
      rollout: "Choose how the plan is sequenced across the fleet",
      execution:
        "Choose execution permissions and confirmation settings",
      review:
        "Pre-flight checks: change preview, readiness, and plan summary before you save",
      placementFirstStep1:
        "Define scope first — suggested actions in the next step reflect inventory and risk signals for this placement",
    },
  },

  placement: {
    clusterSelection: "Cluster selection",
    placementStepIntro:
      "Choose label or list mode, define your scope, then confirm the preview below.",
    clusterSelectionHelpTooltip:
      "Define which clusters this deployment applies to",
    matchesAsOfPrefix: "Matches as of",
    refreshMatchingTargetsAria: "Refresh matching targets",
    refreshMatchingTargetsTitle:
      "Refresh when inventory or labels may have changed",
    placementLabelStep2: "Placement label (step 2)",
    canaryRolloutLimitedToDeploymentScope:
      "Canary rollout is always limited to this deployment scope.",
    manualClusterListNote: "Manual cluster list (see step 2)",
    placementEmpty: "—",
    placementQuickPicksTitle: "Quick picks",
    placementQuickPicksIntro: "Demo inventory vs this update.",
    placementQuickPickColScope: "Scope",
    placementQuickPickColSelector: "Selector",
    placementQuickPickColMatches: "Matches",
    placementQuickPickColReady: "OK",
    placementLabelHintManual:
      "Comma-separated terms; try env=prod, env=staging, tier=web, or region=us-east-1.",
    placementPreviewSubtitle:
      "Reflects the scope you set above and the snapshot time on the right.",
    placementSuggestionMatched: (n: number) => String(n),
    placementSuggestionReady: (ready: number, total: number) =>
      `${ready}/${total}`,
    placementReadinessCol: "Readiness",
    placementReadinessOk: "Likely OK",
    placementReadinessAboveTarget: "At/past target",
    placementReadinessBelowBaseline: "Below baseline",
    placementReadinessUnknown: "—",
    placementListReadinessHint:
      "OK = current z-stream in demo vs step 1 source/target.",
    placementInsightSomeIneligible: (n: number) =>
      `${n} cluster${n === 1 ? "" : "s"} in this slice look out of range for the step 1 source/target (demo inventory).`,
  },

  /** Rollout method cards (form values: canary | rolling | immediate) */
  rolloutMethods: {
    canary: "Canary",
    rolling: "Rolling",
    immediate: "Immediate",
  },

  /** Schedule segment (form values: immediate | delayed | window) */
  schedule: {
    sectionTitle: "Schedule",
    now: "Now",
    delayed: "Delayed",
    maintenanceWindow: "Maintenance window",
  },

  rollout: {
    /** Canary-style deployment: first wave (aligns with table / activity “Phase 1”). */
    canaryRolloutSectionTitle: "Phase 1: Canary rollout",
    /** Second wave after canary soak (aligns with “Phase 2” / Full rollout in progress UI). */
    fullRolloutSectionTitle: "Phase 2: Full rollout",

    canaryRolloutPlacementReadonlyTitle: "Deployment scope",
    canaryRolloutPlacementReadonlyHint:
      "Copied from Placement. The first wave only includes clusters inside this scope.",
    canaryRolloutNarrowingLabel: "Canary label selector",
    canaryRolloutNarrowingPlaceholder:
      "e.g. env=stage, region=us-east-1",
    canaryRolloutNarrowingHelp: (placementScopeCount: number) =>
      `Add labels so the first wave is a smaller slice than the whole scope (${placementScopeCount} cluster${
        placementScopeCount === 1 ? "" : "s"
      } match the scope above). Use commas; every label must match the same cluster.`,
    canaryInScopeHeading: "Clusters in the first wave",
    canaryInScopeCountTemplate: (canary: number, placement: number) =>
      `${canary} / ${placement}`,
    alertCanarySameSizeTitle: "Canary rollout matches full Placement",
    alertCanarySameSizeBody:
      "Canary rollout currently includes everyone in scope. Add more specific terms (for example region=, tier=, or a pool label) so the first wave is a true canary slice.",
    alertNoCanaryInScopeTitle: "No canary rollout targets in scope",
    alertNoCanaryInScopeBody: (rawCount: number) =>
      `These Canary rollout terms match ${rawCount} cluster${
        rawCount === 1 ? "" : "s"
      } in the demo catalog, but none overlap the current deployment scope. Adjust the narrowing field or widen Placement on step 2.`,
    emptyCanaryWithSelector:
      "No clusters match all of those labels inside your scope. Check spelling or remove one label.",
    emptyCanaryNoSelector:
      "Add labels above so the first wave is smaller than the full scope.",
    emptyCanaryPlacementNotSet:
      "Set Placement first (step 2), then you will see clusters listed here.",
    emptyCanaryPlacementNoMatches:
      "Your scope from step 2 does not match any demo clusters, so this list is empty. Edit Placement or use labels like env=prod or region=us-east-1.",

    canaryThenFullSoakBlurb:
      "These clusters run in the first wave; after a pause, Full rollout covers the rest of the scope.",
    requireApprovalBeforeFullRollout: "Require approval before Full rollout",
    requiredBeforeFullRollout: "Required before Full rollout",
    durationSummaryAfterCanaryRollout: (soak: string) =>
      `This deployment will take approximately 5-7 days including soak times (${soak} after Canary rollout, during the configured schedule).`,
    observationAfterCanaryBeforeFullRollout:
      "Observation time after Canary rollout before proceeding to Full rollout.",
    haltCanaryRolloutOnErrorThresholdHelp:
      "Halt Canary rollout if cumulative failure rate exceeds this threshold.",
  },

  emptyState: {
    title: "Start by creating a fleet plan",
    description:
      "Monitor and manage fleet-wide plans — upgrades, rollouts, and related change.",
  },

  /** Review step: labels and `GuidingTooltip` where needed */
  planReview: {
    planCardTitle: "Fleet plan",
    planIdDemo: (suffix: string) => `fp-demo-${suffix}`,
    quickShare: "Share",
    quickRequestReview: "Request review",
    reviewShellTitle: "Plan summary",
    /**
     * Mockup / talk-track: one line each — where a live product would back the block.
     * Shown as small muted “Source · …” under the relevant heading.
     */
    mockupSourcePlan: "Source · OME plan object (this draft, persisted after save)",
    preflightSectionLabel: "Pre-flight checks",
    preflightChangeTitle: "What would change",
    /** Diff-style preview of material changes */
    mockupSourceChange: "Source · management hub (dry-run / plan diff vs. spoke inventory & CRs)",
    preflightReadinessTitle: "Readiness & risk",
    /** Health / policy / risk — confidence is a roll-up in the same pipeline */
    mockupSourceReadiness:
      "Source · health & metrics · policy/allow-lists · optional risk (confidence = roll-up)",
    mockupSourcePastContext:
      "Source · change + incident/ITSM · last upgrade/apply history · window overlap",
    /** Snippets: already labeled in outsideConsoleChannels tooltip; short line for the band */
    mockupSourceExport: "Source · same plan object, serialized",
    confidenceLabel: "Confidence",
    confidenceValue: "Medium — 12/14 clusters green; 2 need credential refresh",
    pastContextTitle: "Recent fleet context",
    /** What the Recent fleet context section represents */
    pastContextIntro:
      "Pulled in from change, ITSM, and run history for clusters in this plan’s scope.",
    pastContextPoints: [
      "Cluster prod-east-2 — 30d: two failed attempts at z-stream 4.17.4 → 4.17.9; the network ClusterOperator never reached Available (change CHG-20418).",
      "Cluster prod-west-1 — last week: same z-stream completed without incident.",
      "Change windows — no overlap between your planned Saturday 02:00–06:00 window and active blackouts for this plan’s placement.",
    ],
    pastContextTooltipMeta:
      "How recent attempts, incidents, and maintenance windows line up with this plan’s scope.",
    /** `buildPlanChannelSnippets` fills the code blocks; meta → `GuidingTooltip` (outsideConsoleChannels) */
    channelsTitle: "Create or apply outside the console",
    /** In-product: one line only; commentary in pink ? tooltip */
    channelsIntroProduct: "Same spec for the API, oc/kubectl, or Git.",
    /** `aria-label` on the expand control (announces with title) */
    channelsCollapseHint: "Expand or collapse API, CLI, and Git examples",
    channelsApiLabel: "Request body (JSON)",
    channelsCliLabel: "Command line",
    channelsGitopsLabel: "Git manifest",
    channelsCopySuccess: "Copied to clipboard",
    channelsCopyFailed: "Couldn’t copy to clipboard",
    channelsCopyAria: "Copy code to clipboard",
    /** Placeholder toasts when Share / Request review are clicked (prototype) */
    toastShareTitle: "Share (prototype)",
    toastShareDescription:
      "A read-only plan link or export would be created for reviewers. Nothing was sent or stored.",
    toastReviewTitle: "Request review (prototype)",
    toastReviewDescription:
      "Approvers would get a task, email, or ticket handoff. No approval workflow was started.",
  },

  /** Rollout step: how the user chose pacing (saved template vs manual). */
  rolloutStrategy: {
    sectionTitle: "Rollout strategy",
    sourcePrompt: "How do you want to set up rollout?",
    useSaved: "Use a saved strategy",
    useSavedHint:
      "Pick a template or a strategy you saved earlier. Changing the selection reapplies its recommended values.",
    configureManual: "Configure manually",
    configureManualHint:
      "Tune rollout method, schedule, and pacing yourself. Nothing is reapplied unless you switch back to a saved strategy.",
    savedPickerLabel: "Saved strategy",
    builtinGroup: "Templates",
    userSavedGroup: "Your saved strategies",
    saveForReuseLabel: "Save this rollout strategy for reuse",
    saveForReuseHint:
      "When you create this deployment, we add it to your saved list so you can pick it again on a future run.",
    saveStrategyNameLabel: "Strategy name",
    saveStrategyNamePlaceholder: "e.g. Prod canary — Q2 patch train",
    reviewSource: "Strategy source",
    reviewSavedName: "Strategy",
    reviewWillSave: "After create",
    reviewWillSaveNo: "Do not save",
    presetBalancedCanary: "Balanced canary (template)",
    presetWeekendPush: "Aggressive weekend window (template)",
    presetGitopsAligned: "GitOps-aligned pacing (template)",
    customStrategy: "Custom configuration",
  },

  aiPlans: {
    /** Shown on plan cards / detail instead of “4.x → 4.y” */
    updateToOpenshift: "Update to OpenShift",
    planUpgradeTooltip:
      "Target z-stream for this change. Each cluster’s current level is determined from inventory for clusters in your placement (demo content uses sample numbers).",
    /** Shown inside the expandable disclosure instead of repeating the full panel header */
    embeddedPanelHint:
      "Set the target z-stream, regenerate demo plans, then pick a card below.",
    panelTitle: "Suggested update plans",
    /** One-line disclosure before the full panel is expanded */
    collapsedDisclosureTitle: "Suggested update plans",
    collapsedManualHint:
      "Prefer the catalog? Use search, Recommended above, or “Show all actions & filters” and pick an update — or use suggested plans here.",
    /** Disclosure subtitle on Workloads / Virtualization (no OpenShift fleet sample in panel). */
    collapsedManualHintNonOcpTab:
      "Preview only on this tab — no OpenShift fleet samples here. Skip and use search, Recommended, or the full catalog.",
    collapsedToggleShow: "Show",
    collapsedToggleHide: "Hide",
    panelIntro:
      "OpenShift z-stream options for a fleet. Change the target → Regenerate → pick a plan; tune labels on Placement.",
    exampleChannelPrefix: "Example: channel",
    targetVersion: "Target version",
    regeneratePlans: "Regenerate plans",
    newTargetRegenerate: "New target — regenerate to refresh the five plans.",
    suggestedPlans: "Suggested plans",
    /** Shown when no plan’s full detail is open — cards stay visible; detail expands on demand. */
    selectPlanToExpandHint:
      "Select a plan card to expand: matched clusters, risk, then apply to pre-fill the wizard.",
    /** When the catalog selection is not an OpenShift z-stream update action */
    nonOpenshiftCatalogHint:
      "Sample plan text, channels, and apply only apply to OpenShift z-stream fleet updates. Choose an OpenShift update in the catalog to load the demo.",
    /** OpenShift z-stream action other than the 4.18 demo (e.g. 4.17) — same skeleton treatment as non-OCP. */
    ocpOtherZstreamSkeletonHint:
      "Sample plan copy in this prototype is written for Update OpenShift 4.18; here you see layout placeholders only.",
    ocpOtherZstreamExpandHint:
      "Expand a card for a layout preview — full demo text is not wired to this z-stream action.",
    ocpOtherZstreamExpandedFootnote:
      "Fill wizard from plan is only enabled when demo content matches Update OpenShift 4.18.",
    /** Embedded / panel when launch tab is Workloads or Virtualization */
    launchTabNoOcpDemoHint:
      "OpenShift fleet sample plans are for Platform or All on this prototype. Here you only get layout placeholders.",
    nonOpenshiftCatalogExpandHint:
      "Expand a card for a layout-only preview — no demo plan content for this catalog action.",
    nonOpenshiftExpandHintLaunchTab:
      "Expand a card for a layout preview — OpenShift fleet samples are hidden on Workloads and Virtualization.",
    nonOpenshiftExpandedFootnote:
      "Fill wizard from plan is available after you pick an OpenShift update action.",
    nonOpenshiftExpandedAriaLabel: "Plan layout preview (no demo content for this catalog action)",
    hidePlanDetails: "Hide details",
    matchedClustersSectionTitle: "Clusters matching the proposed placement (demo)",
    matchedClustersSectionHelp:
      "Example inventory for the suggested labels. Current z-stream is illustrative; live mode uses your CMDB.",
    matchedClustersEmpty:
      "No demo clusters matched this selector. Try env=prod, env=staging, or region=us-east-1 with comma-separated terms.",
    matchedClustersNoPlacementInventory:
      "Cluster samples use your current Placement. No sample clusters are in scope — adjust labels or pick clusters (search) first.",
    /** Shown above Suggested plans when the user has a non-empty Placement label (OpenShift AI demo). */
    aiPlanPlacementContext: (label: string) =>
      `Cluster samples in plan details follow your current Placement, then each plan’s label. Placement: ${label}`,
    matchedClustersNoPlanOverlap:
      "None of the sample clusters in your current Placement also match this plan’s suggested label proposal. Widen Placement or choose a plan that fits the same fleet.",
    matchedClusterColCluster: "Cluster",
    matchedClusterColEnv: "Env",
    matchedClusterColRegion: "Region",
    matchedClusterColVersion: "Current z-stream",
    matchedClusterColRisk: "Risk note",
    planRiskSectionTitle: "Plan risk",
    applyPlanButton: "Fill wizard from plan",
    applyPlanButtonTitle:
      "Pre-fills action, placement label, rollout pacing, and channel fields for the next wizard steps.",
  },
} as const;

/** Map persisted `rolloutMethod` to UI label (Canary | Rolling | Immediate). */
export function rolloutMethodLabel(method: string | undefined): string {
  const m = deploymentCopy.rolloutMethods;
  if (method === "canary") return m.canary;
  if (method === "rolling") return m.rolling;
  if (method === "immediate") return m.immediate;
  return method ?? "";
}

/** Map persisted `scheduleType` to UI label (Now | Delayed | Maintenance window). */
export function scheduleTypeLabel(scheduleType: string | undefined): string {
  const s = deploymentCopy.schedule;
  if (scheduleType === "immediate") return s.now;
  if (scheduleType === "delayed") return s.delayed;
  if (scheduleType === "window") return s.maintenanceWindow;
  return scheduleType ?? "";
}

export type PlanChannelSnippetsInput = {
  planId: string;
  planTitle: string;
  primaryActionId: string;
  labelSelector: string;
  rolloutMethod: string;
  scheduleType: string;
};

/**
 * Review step: copy-paste scaffolds for API / CLI / GitOps so teams can implement
 * the same plan from automation. Names are illustrative (e.g. `fleet.example.com`).
 */
export function buildPlanChannelSnippets(
  p: PlanChannelSnippetsInput,
): { apiEndpointLine: string; apiJson: string; cli: string; gitopsYaml: string } {
  const safeName = p.planId.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const spec = {
    displayName: p.planTitle,
    primaryCatalogAction: p.primaryActionId,
    placement: { labelSelector: p.labelSelector || "env=prod" },
    rollout: { method: p.rolloutMethod || "canary" },
    schedule: { type: p.scheduleType || "immediate" },
  };
  const body = {
    apiVersion: "fleet.example.com/v1",
    kind: "FleetPlan",
    metadata: {
      name: safeName,
      labels: { "console.example.com/plan-id": p.planId },
    },
    spec,
  };
  const apiJson = JSON.stringify(body, null, 2);

  const postPath =
    "/apis/fleet.example.com/v1/namespaces/openshift-ome/fleetplans";
  const apiEndpointLine = `POST https://api.<cluster>:6443${postPath}`;
  const cli = [
    "# Save the JSON above as fleetplan.json, then:",
    `curl -sS -X POST "https://api.<cluster>:6443${postPath}" \\`,
    `  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \\`,
    `  --data-binary @fleetplan.json`,
    "",
    "# Or after the object exists in the cluster:",
    `oc get fleetplan ${safeName} -n openshift-ome -o yaml`,
    `oc describe fleetplan ${safeName} -n openshift-ome`,
  ].join("\n");

  const gitopsYaml = [
    "# Commit under your GitOps path (e.g. mgmt/fleet/fleetplan.yaml) so Argo CD / Flux can sync it.",
    `apiVersion: fleet.example.com/v1`,
    `kind: FleetPlan`,
    `metadata:`,
    `  name: ${safeName}`,
    `  namespace: openshift-ome`,
    `  labels:`,
    `    console.example.com/plan-id: ${JSON.stringify(p.planId)}`,
    `spec:`,
    `  displayName: ${yamlScalar(p.planTitle)}`,
    `  primaryCatalogAction: ${JSON.stringify(p.primaryActionId)}`,
    `  placement:`,
    `    labelSelector: ${JSON.stringify(p.labelSelector || "env=prod")}`,
    `  rollout:`,
    `    method: ${JSON.stringify(p.rolloutMethod || "canary")}`,
    `  schedule:`,
    `    type: ${JSON.stringify(p.scheduleType || "immediate")}`,
  ].join("\n");

  return { apiEndpointLine, apiJson, cli, gitopsYaml };
}

function yamlScalar(s: string): string {
  if (/[:#[\]{}%&*]/.test(s) || s.includes("\n") || s.trim() !== s) {
    return JSON.stringify(s);
  }
  return s;
}

/** Optional: forbidden alternates when editing copy (for humans + AI). */
export const deploymentCopyDoNotUse = [
  "Refresh target list", // use icon + "Matches as of" pattern instead
  "Shuffle plans",
] as const;
