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
    /** OpenShift fleet update: target z-stream only; “from” comes from placement/inventory in a live product */
    openshiftTargetVersionLabel: "Target OpenShift z-stream",
    reviewUpdateToOpenshiftPrefix: "Update to OpenShift ",
    reviewOpenshiftPlacementBaseline:
      "Per-cluster starting level comes from inventory for clusters in your placement; the editor shows example values here.",
    recommendedTitle: "Recommended for this area",
    recommendedHint:
      "Popular actions for this tab. Select one as your primary, or use search and the full catalog for more choices.",
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
    /** Step 1: when Source is AI-assisted, only extra catalog rows (e.g. dependents) need a card — the primary is implied by the catalog + plan. */
    step1AdditionalActionsTitle: "Additional actions",
    step1PathAiTitle: "AI-assisted",
    step1PathManualTitle: "Manual",
    /** Shown after a primary catalog action is selected. */
    step1PathSwitchLabel: "Source",
  },

  wizard: {
    /** Primary entry (split button, empty state, wizard chrome) */
    createButton: "Create deployment",
    title: "Create deployment",
    subtitle: "Configure your fleet-wide deployment strategy",
    startDifferently: "Start differently",
    next: "Next",
    back: "Back",
    cancel: "Cancel",
    createDeploymentSubmit: "Create deployment",
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
    reviewCreate: "Review & create",
    hints: {
      action:
        "Choose an action: Update, Install, Apply, Delete, or Create",
      placement: "Select clusters to include in this deployment",
      rollout: "Choose how the deployment is sequenced",
      execution:
        "Choose execution permissions and confirmation settings",
      review:
        "Review your deployment configuration before creating it",
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
    title: "Start by creating a deployment",
    description: "Monitor and manage fleet-wide changes.",
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
    panelTitle: "AI-assisted update plans",
    /** One-line disclosure before the full panel is expanded */
    collapsedDisclosureTitle: "AI-assisted plans (optional, demo)",
    collapsedManualHint:
      "You can skip this entirely. To choose manually, use search, Recommended above, or expand “Show all actions & filters” and pick a catalog update.",
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
      "Sample AI plan copy in this prototype is written for Update OpenShift 4.18; here you see layout placeholders only.",
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

/** Optional: forbidden alternates when editing copy (for humans + AI). */
export const deploymentCopyDoNotUse = [
  "Refresh target list", // use icon + "Matches as of" pattern instead
  "Shuffle plans",
] as const;
