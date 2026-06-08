import { useEffect, useState } from "react";
import {
  ModalOverlay,
  ModalContent,
  CardTitle,
  SmallText,
  TinyText,
  SecondaryButton,
} from "../../../imports/UIComponents";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import {
  DEPLOYMENT_TAB_ORDER,
  getWizardPresetForTab,
  type DeploymentTabId,
  type WizardEntryMode,
} from "./deploymentTabPresets";
import type { OpenDeploymentWizardOptions } from "./CreateDeploymentSplitButton";
import { deploymentCopy } from "./deploymentPrototypeCopy";

type CreateDeploymentNarrowDialogProps = {
  open: boolean;
  onClose: () => void;
  onChoose: (opts: OpenDeploymentWizardOptions) => void;
  /** Current list area (All, Platform, Workloads, Virtualization) — matching card is highlighted. */
  areaTab: DeploymentTabId;
};

type IntentItem = {
  id: string;
  title: string;
  hint?: string;
  opts: OpenDeploymentWizardOptions;
};

function buildWizardOpts(
  tab: DeploymentTabId,
  entryMode: WizardEntryMode,
): OpenDeploymentWizardOptions {
  if (entryMode === "placement-first") {
    return {
      tab,
      mode: "placement-first",
      initialLabelSelector: getWizardPresetForTab(tab).initialLabelSelector,
    };
  }
  return { tab, mode: "action-first" };
}

function IntentCard({
  it,
  onChoose,
  emphasized,
}: {
  it: IntentItem;
  onChoose: (opts: OpenDeploymentWizardOptions) => void;
  emphasized?: boolean;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onChoose(it.opts)}
        className={[
          "group flex w-full flex-col items-start justify-center gap-0.5 rounded-md border text-left transition-colors",
          "px-3.5 py-2.5",
          emphasized
            ? "min-h-16 border-primary/30 bg-primary/[0.06] hover:bg-primary/10"
            : "min-h-14 border-border/80 bg-card hover:border-border hover:bg-secondary/80",
        ].join(" ")}
        style={{ borderRadius: "var(--radius)" }}
      >
        <SmallText
          className="group-hover:text-foreground/95"
          style={{ fontWeight: "var(--font-weight-medium)" }}
        >
          {it.title}
        </SmallText>
        {it.hint && (
          <TinyText muted className="text-[11px] leading-snug line-clamp-2 text-pretty">
            {it.hint}
          </TinyText>
        )}
      </button>
    </li>
  );
}

const sectionLabelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground/90";

export function CreateDeploymentNarrowDialog({
  open,
  onClose,
  onChoose,
  areaTab,
}: CreateDeploymentNarrowDialogProps) {
  const [entryMode, setEntryMode] = useState<WizardEntryMode>("action-first");
  useEffect(() => {
    if (open) {
      setEntryMode("action-first");
    }
  }, [open]);

  if (!open) return null;

  const areaItems: IntentItem[] = DEPLOYMENT_TAB_ORDER.map((t) => ({
    id: t.id,
    title: t.label,
    hint: t.description,
    opts: buildWizardOpts(t.id, entryMode),
  }));

  return (
    <ModalOverlay onClose={onClose}>
      <ModalContent maxWidth="md" className="!p-5 sm:!p-6">
        <div className="mb-4">
          <CardTitle className="!mb-0">{deploymentCopy.wizard.title}</CardTitle>
        </div>

        <div className="space-y-5">
          <section>
            <span className={sectionLabelClass} id="create-narrow-entry">
              {deploymentCopy.wizard.narrowSectionEntry}
            </span>
            <ToggleGroup
              type="single"
              value={entryMode}
              onValueChange={(v) => {
                if (v) setEntryMode(v as WizardEntryMode);
              }}
              variant="outline"
              className="w-full p-0.5"
              size="sm"
              aria-label={`${deploymentCopy.wizard.narrowToggleActionFirst} or ${deploymentCopy.wizard.narrowTogglePlacementFirst}`}
            >
              <ToggleGroupItem
                value="action-first"
                className="min-w-0 flex-1 data-[state=on]:font-medium"
              >
                {deploymentCopy.wizard.narrowToggleActionFirst}
              </ToggleGroupItem>
              <ToggleGroupItem
                value="placement-first"
                className="min-w-0 flex-1 data-[state=on]:font-medium"
              >
                {deploymentCopy.wizard.narrowTogglePlacementFirst}
              </ToggleGroupItem>
            </ToggleGroup>
          </section>

          <section>
            <span className={sectionLabelClass} id="create-narrow-area">
              {deploymentCopy.wizard.narrowSectionArea}
            </span>
            <ul
              className="grid grid-cols-1 gap-1.5 sm:grid-cols-2"
              role="list"
              aria-labelledby="create-narrow-area"
            >
              {areaItems.map((it) => (
                <IntentCard
                  key={it.id}
                  it={it}
                  onChoose={onChoose}
                  emphasized={it.id === areaTab}
                />
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-5 flex items-center justify-end border-t border-border/80 pt-3.5">
          <SecondaryButton type="button" onClick={onClose}>
            {deploymentCopy.wizard.cancel}
          </SecondaryButton>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
}
