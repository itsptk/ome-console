import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PrimaryButton } from "../../../imports/UIComponents";
import { CreateDeploymentNarrowDialog } from "./CreateDeploymentNarrowDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  DEPLOYMENT_TAB_ORDER,
  type DeploymentTabId,
  type WizardEntryMode,
} from "./deploymentTabPresets";
import { deploymentCopy } from "./deploymentPrototypeCopy";

/** Options passed to Deployments `openWizard` (same contract as the page). */
export type OpenDeploymentWizardOptions = {
  tab: DeploymentTabId;
  mode?: WizardEntryMode;
  initialLabelSelector?: string;
};

type CreateDeploymentMenuContentProps = {
  onPick: (opts: OpenDeploymentWizardOptions) => void;
};

export function CreateDeploymentMenuContent({
  onPick,
}: CreateDeploymentMenuContentProps) {
  return (
    <>
      <DropdownMenuLabel className="px-2 py-1.5 text-xs font-normal text-muted-foreground">
        {deploymentCopy.wizard.narrowMenuActionFirstSection}
      </DropdownMenuLabel>
      {DEPLOYMENT_TAB_ORDER.map((t) => (
        <DropdownMenuItem
          key={`af-${t.id}`}
          onSelect={() => onPick({ tab: t.id, mode: "action-first" })}
        >
          {t.label}
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuLabel className="px-2 py-1.5 text-xs font-normal text-muted-foreground">
        {deploymentCopy.wizard.narrowMenuPlacementFirstSection}
      </DropdownMenuLabel>
      {DEPLOYMENT_TAB_ORDER.map((t) => (
        <DropdownMenuItem
          key={`pf-${t.id}`}
          onSelect={() => onPick({ tab: t.id, mode: "placement-first" })}
        >
          {t.label}
        </DropdownMenuItem>
      ))}
    </>
  );
}

type CreateDeploymentSplitButtonProps = {
  /** List area (All, Platform, Workloads, VM) for defaults when opening the narrow dialog. */
  areaTab: DeploymentTabId;
  onCreate: (opts: OpenDeploymentWizardOptions) => void;
  primaryLabel?: string;
  /** Full width for empty state layout. */
  layout?: "default" | "full";
};

export function CreateDeploymentSplitButton({
  areaTab,
  onCreate,
  primaryLabel = deploymentCopy.wizard.createButton,
  layout = "default",
}: CreateDeploymentSplitButtonProps) {
  const [narrowOpen, setNarrowOpen] = useState(false);

  return (
    <div
      className={
        layout === "full"
          ? "flex w-full max-w-md items-stretch"
          : "inline-flex max-w-full items-stretch"
      }
    >
      <CreateDeploymentNarrowDialog
        open={narrowOpen}
        onClose={() => setNarrowOpen(false)}
        onChoose={(opts) => {
          onCreate(opts);
          setNarrowOpen(false);
        }}
        areaTab={areaTab}
      />
      <PrimaryButton
        type="button"
        className={
          layout === "full"
            ? "min-w-0 flex-1 !rounded-r-none !py-2.5"
            : "!rounded-r-none !py-2.5"
        }
        style={{
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }}
        onClick={() => setNarrowOpen(true)}
      >
        {primaryLabel}
      </PrimaryButton>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex min-w-9 items-center justify-center border-l border-primary-foreground/20 px-2.5 py-2.5 text-primary-foreground transition-opacity outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              backgroundColor: "var(--primary)",
              borderTopRightRadius: "var(--radius)",
              borderBottomRightRadius: "var(--radius)",
              fontFamily: "var(--font-family-text)",
            }}
            aria-label={deploymentCopy.wizard.narrowSplitChevronAria}
          >
            <ChevronDown className="size-4 opacity-90" aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="z-[200] max-h-72 w-56 overflow-y-auto"
        >
          <CreateDeploymentMenuContent onPick={onCreate} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
