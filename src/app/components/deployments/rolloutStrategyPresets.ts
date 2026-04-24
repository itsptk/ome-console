/**
 * Preset application for saved / AI pre-built rollout strategies.
 * Single source of truth for {@link applyRolloutStrategyPreset} and merged-field previews in AI plans.
 */

import { rolloutMethodLabel, scheduleTypeLabel } from "./deploymentPrototypeCopy";

export type AIBuiltInRolloutStrategyPreset =
  | "balanced-canary"
  | "weekend-push"
  | "gitops-aligned";

export function getTomorrowISODate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

/** Same logic as the Rollout step: re-seed strategy fields when a preset is chosen. */
export function applyRolloutStrategyPreset(
  prev: Record<string, any>,
  preset: string,
): Record<string, any> {
  const base: Record<string, any> = { ...prev, rolloutStrategyPreset: preset };
  switch (preset as AIBuiltInRolloutStrategyPreset) {
    case "balanced-canary":
      return {
        ...base,
        rolloutMethod: "canary",
        scheduleType: "immediate",
        phase1Count: "10",
        phase1Batch: "2",
        phase1Soak: "24h",
        phase1MaxParallel: "5",
        phase1Priority: "label:canary",
        canarySelector: prev.canarySelector || "region=us-east-1,tier=web",
        pacingBatchSize: "5",
        pacingSoakTime: "24h",
      };
    case "weekend-push":
      return {
        ...base,
        rolloutMethod: "rolling",
        scheduleType: "window",
        scheduleWindow: "weekends",
        scheduleStartTime: "20:00",
        scheduleEndTime: "04:00",
        phase1Count: "20",
        phase1Batch: "4",
        phase1Soak: "12h",
        pacingBatchSize: "6",
        pacingSoakTime: "12h",
      };
    case "gitops-aligned":
      return {
        ...base,
        rolloutMethod: "canary",
        scheduleType: "delayed",
        scheduledDate: prev.scheduledDate || getTomorrowISODate(),
        scheduledTime: prev.scheduledTime || "02:00",
        phase1Count: "8",
        phase1Batch: "2",
        phase1Soak: "24h",
        phase1MaxParallel: "4",
        canarySelector: prev.canarySelector || "region=us-east-1,tier=web",
        pacingBatchSize: "4",
        pacingSoakTime: "24h",
      };
    default:
      return base;
  }
}

export type AIPrebuiltPlanRolloutInput = {
  suggestedLabelSelector: string;
  rollout: {
    strategyPreset: AIBuiltInRolloutStrategyPreset;
    canaryPhaseLabel?: string;
    overrides?: Record<string, unknown>;
  };
};

/**
 * Merge preset + optional overrides the same way the wizard does when a plan is applied
 * (Placement + canary label narrowing + overrides).
 */
export function mergeAIPrebuiltPlanRolloutSlice(
  prev: Record<string, any>,
  plan: AIPrebuiltPlanRolloutInput,
): Record<string, any> {
  const ro = plan.rollout;
  const prevForPreset = {
    ...prev,
    canarySelector: ro.canaryPhaseLabel ?? plan.suggestedLabelSelector,
  };
  const afterPreset = applyRolloutStrategyPreset(
    prevForPreset,
    ro.strategyPreset,
  );
  return {
    ...afterPreset,
    ...(ro.overrides || {}),
    canarySelector: ro.canaryPhaseLabel ?? afterPreset.canarySelector,
  };
}

function capitalizeScheduleWindow(value: string | undefined): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Mirrors the review step "Schedule" line in DeploymentWizard.
 */
export function formatScheduleValueLikeWizardReview(
  fd: Record<string, any>,
): string {
  if (fd.scheduleType === "immediate") return "Now";
  if (fd.scheduleType === "delayed") {
    return `${fd.scheduledDate || "Date"} at ${fd.scheduledTime || "Time"}`;
  }
  return `${capitalizeScheduleWindow(fd.scheduleWindow)} ${fd.scheduleStartTime || ""}-${
    fd.scheduleEndTime || ""
  }`.trim();
}

/**
 * “Method · schedule label” (catalog labels) for compact plan cards.
 */
export function formatRolloutMethodAndScheduleLabels(
  fd: Record<string, any>,
): string {
  const m = rolloutMethodLabel(fd.rolloutMethod);
  const s = scheduleTypeLabel(fd.scheduleType);
  if (!m && !s) return "";
  if (!m) return s;
  if (!s) return m;
  return `${m} · ${s}`;
}

/** “Method · {schedule value}” to mirror review (Now / date at time / window times). */
export function formatRolloutMethodAndScheduleValues(
  fd: Record<string, any>,
): string {
  const m = rolloutMethodLabel(fd.rolloutMethod);
  const sched = formatScheduleValueLikeWizardReview(fd);
  if (!m) return sched;
  return `${m} · ${sched}`;
}

export function buildAIPrebuiltPlanMaintenanceTiles(fd: Record<string, any>): {
  window: string;
  duration: string;
  strategy: string;
} {
  /** Same string as the Review step “Schedule” line. */
  const window = formatScheduleValueLikeWizardReview(fd);

  const phase1Soak =
    fd.phase1Soak && fd.phase1Soak !== "0" ? (fd.phase1Soak as string) : "None (immediate)";
  const pacingSoak =
    fd.pacingSoakTime && fd.pacingSoakTime !== "0" ? (fd.pacingSoakTime as string) : "None (continuous)";

  let duration: string;
  if (fd.rolloutMethod === "rolling") {
    duration = `Phase-1 soak: ${phase1Soak} · Wave soak: ${pacingSoak}`;
  } else {
    duration = `Phase-1 soak: ${phase1Soak} · Pacing between steps: ${pacingSoak}`;
  }

  let strategy: string;
  if (fd.rolloutMethod === "rolling") {
    strategy = `Clusters per wave: ${fd.pacingBatchSize || "?"}, soak: ${pacingSoak}, phase-1: up to ${fd.phase1Count} in ${fd.phase1Batch}-cluster batches.`;
  } else {
    const sel = (fd.canarySelector || "").toString().trim();
    strategy = `Phase-1: up to ${fd.phase1Count} cluster(s), ${fd.phase1Batch} per batch. Labels: ${sel || "—"}. Pacing: ${fd.pacingBatchSize} per step, ${fd.pacingSoakTime} between steps.`;
  }
  if (fd.requireApproval === true) {
    strategy = `${strategy} Requires approval.`;
  }
  if ((fd.phase2Batch || "").toString().trim()) {
    strategy = `${strategy} Later waves: ${fd.phase2Batch} per batch.`;
  }

  return { window, duration, strategy };
}

/**
 * Replaces static “how it runs” copy: describes the same fields the wizard will show after apply.
 */
export function formatAIPrebuiltPlanHowItRunsBody(fd: Record<string, any>): string {
  const scheduleLine = formatScheduleValueLikeWizardReview(fd);
  const method = rolloutMethodLabel(fd.rolloutMethod);
  const open: string[] = [
    `Rollout: ${method}. Schedule: ${scheduleLine}.`,
  ];

  if (fd.rolloutMethod === "rolling") {
    open.push(
      `Waves: ${fd.pacingBatchSize || "?"} cluster(s) per wave, ${fd.pacingSoakTime && fd.pacingSoakTime !== "0" ? fd.pacingSoakTime : "no"} soak between waves. Phase-1: up to ${fd.phase1Count} cluster(s) in ${fd.phase1Batch}-cluster batches, ${fd.phase1Soak} phase soak.`,
    );
  } else {
    open.push(
      `Phase-1: up to ${fd.phase1Count} cluster(s), ${fd.phase1Batch} per batch, ${fd.phase1Soak} soak. Labels (canary / phase-1): ${(fd.canarySelector || "").toString().trim() || "—"}. Pacing: ${fd.pacingBatchSize} per step, ${fd.pacingSoakTime} between steps.`,
    );
  }
  if (fd.requireApproval === true) {
    open.push("Approval is required before continuing the rollout sequence.");
  }
  return open.join(" ");
}
