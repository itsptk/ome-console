import {
  ModalOverlay,
  ModalContent,
  CardTitle,
  SmallText,
  TinyText,
  SecondaryButton,
} from "../../../imports/UIComponents";
import {
  DEPLOYMENT_TAB_ORDER,
  PLACEMENT_FIRST_WIZARD_OPTS,
  type DeploymentTabId,
} from "./deploymentTabPresets";
import type { OpenDeploymentWizardOptions } from "./CreateDeploymentSplitButton";

type CreateDeploymentNarrowDialogProps = {
  open: boolean;
  onClose: () => void;
  onChoose: (opts: OpenDeploymentWizardOptions) => void;
  scopeTab: DeploymentTabId;
  showCorridorOption: boolean;
};

type IntentItem = {
  id: string;
  title: string;
  hint: string;
  opts: OpenDeploymentWizardOptions;
};

function IntentCard({
  it,
  onChoose,
}: {
  it: IntentItem;
  onChoose: (opts: OpenDeploymentWizardOptions) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onChoose(it.opts)}
        className="flex h-full w-full min-h-[4.5rem] flex-col items-start gap-1 rounded border border-border bg-card p-3.5 text-left transition-colors hover:bg-secondary"
        style={{ borderRadius: "var(--radius)" }}
      >
        <SmallText style={{ fontWeight: "var(--font-weight-medium)" }}>
          {it.title}
        </SmallText>
        <TinyText muted className="leading-snug">
          {it.hint}
        </TinyText>
      </button>
    </li>
  );
}

/**
 * Broad row: current tab vs placement-first wizard seed (list scoping uses filters).
 * Focused row: platform → workloads → virtualization → corridor when on Clusters.
 */
export function CreateDeploymentNarrowDialog({
  open,
  onClose,
  onChoose,
  scopeTab,
  showCorridorOption,
}: CreateDeploymentNarrowDialogProps) {
  if (!open) return null;

  const currentMeta = DEPLOYMENT_TAB_ORDER.find((t) => t.id === scopeTab);

  const broadItems: IntentItem[] = [
    {
      id: "current",
      title:
        scopeTab === "all"
          ? "All activity (entire workspace)"
          : `This list: ${currentMeta?.label ?? "current view"}`,
      hint:
        scopeTab === "all"
          ? "No scope filter—best for triage or when you have not picked platform vs workload yet."
          : (currentMeta?.description ??
            "Keep the same scope as the list you are viewing now."),
      opts: { tab: scopeTab },
    },
    {
      id: "placement-first",
      title: "Placement-first (fleet scope)",
      hint: "Start with labels or regions, then pick actions. Use the Placement-scoped filter on the list to see only placement-style rollouts.",
      opts: { ...PLACEMENT_FIRST_WIZARD_OPTS },
    },
  ];

  const focusedItems: IntentItem[] = [
    {
      id: "clusters",
      title: "Platform (cluster-scoped)",
      hint: "Upgrades, etcd, operators, and fleet-wide infra you own as cluster admin.",
      opts: { tab: "clusters", mode: "action-first" },
    },
    {
      id: "applications",
      title: "Workloads & GitOps",
      hint: "Namespace rollouts, charts, and sync-driven app change.",
      opts: { tab: "applications", mode: "action-first" },
    },
    {
      id: "vm",
      title: "Virtualization",
      hint: "KubeVirt, migration, and hypervisor-class fleet steps.",
      opts: { tab: "virtual-machines", mode: "action-first" },
    },
  ];

  if (showCorridorOption) {
    focusedItems.push({
      id: "corridor",
      title: "Multicluster upgrade corridor",
      hint: "Narrow, coordinated platform upgrades—use when that is the explicit program.",
      opts: {
        tab: "clusters",
        mode: "action-first",
        upgradeCorridor: true,
      },
    });
  }

  return (
    <ModalOverlay onClose={onClose}>
      <ModalContent maxWidth="lg" className="!p-6">
        <div className="mb-1 flex items-start justify-between gap-3">
          <div>
            <CardTitle className="!mb-1">What are you trying to do?</CardTitle>
            <TinyText muted>
              Pick a path; the wizard opens with matching defaults. The{" "}
              <span className="whitespace-nowrap">▼</span> next to Create lists
              exact action-first and placement-first options per tab.
            </TinyText>
          </div>
        </div>

        <div className="mt-4 space-y-5">
          <section aria-labelledby="create-narrow-broad">
            <TinyText
              id="create-narrow-broad"
              className="mb-2 block"
              style={{ fontWeight: "var(--font-weight-medium)" }}
            >
              Broad scope
            </TinyText>
            <TinyText muted className="mb-2 block leading-relaxed">
              Use when you want the fewest assumptions: full list context, or
              define where the change applies before what runs.
            </TinyText>
            <ul
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              role="list"
            >
              {broadItems.map((it) => (
                <IntentCard key={it.id} it={it} onChoose={onChoose} />
              ))}
            </ul>
          </section>

          <section aria-labelledby="create-narrow-focus">
            <TinyText
              id="create-narrow-focus"
              className="mb-2 block"
              style={{ fontWeight: "var(--font-weight-medium)" }}
            >
              By area (typical ownership)
            </TinyText>
            <TinyText muted className="mb-2 block leading-relaxed">
              Platform and workloads are the day-to-day split; virtualization is
              a narrower lane; the corridor is only when you are running a
              coordinated multicluster upgrade program.
            </TinyText>
            <ul
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              role="list"
            >
              {focusedItems.map((it) => (
                <IntentCard key={it.id} it={it} onChoose={onChoose} />
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
          <TinyText muted>
            Prefer not to choose? The chevron next to Create lists every tab
            and entry order explicitly.
          </TinyText>
          <SecondaryButton type="button" onClick={onClose}>
            Cancel
          </SecondaryButton>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
}
