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

/** Options passed to Deployments `openWizard` (same contract as the page). */
export type OpenDeploymentWizardOptions = {
  tab: DeploymentTabId;
  mode?: WizardEntryMode;
  initialLabelSelector?: string;
  upgradeCorridor?: boolean;
};

type CreateDeploymentMenuContentProps = {
  onPick: (opts: OpenDeploymentWizardOptions) => void;
  /** Clusters-scoped multicluster corridor (and optional empty-state access). */
  showCorridorOption: boolean;
};

export function CreateDeploymentMenuContent({
  onPick,
  showCorridorOption,
}: CreateDeploymentMenuContentProps) {
  return (
    <>
      <DropdownMenuLabel className="px-2 py-1.5 text-xs font-normal text-muted-foreground">
        Action first
      </DropdownMenuLabel>
      {DEPLOYMENT_TAB_ORDER.map((t) => (
        <DropdownMenuItem
          key={`af-${t.id}`}
          onClick={() => onPick({ tab: t.id, mode: "action-first" })}
        >
          {t.label}
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuLabel className="px-2 py-1.5 text-xs font-normal text-muted-foreground">
        Placement first
      </DropdownMenuLabel>
      {DEPLOYMENT_TAB_ORDER.map((t) => (
        <DropdownMenuItem
          key={`pf-${t.id}`}
          onClick={() => onPick({ tab: t.id, mode: "placement-first" })}
        >
          {t.label}
        </DropdownMenuItem>
      ))}
      {showCorridorOption && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              onPick({
                tab: "clusters",
                mode: "action-first",
                upgradeCorridor: true,
              })
            }
          >
            Multicluster upgrade corridor
          </DropdownMenuItem>
        </>
      )}
    </>
  );
}

type CreateDeploymentSplitButtonProps = {
  /** Tab used for the primary (left) one-click start. */
  scopeTab: DeploymentTabId;
  onCreate: (opts: OpenDeploymentWizardOptions) => void;
  showCorridorOption: boolean;
  primaryLabel?: string;
  /** Full width for empty state layout. */
  layout?: "default" | "full";
};

export function CreateDeploymentSplitButton({
  scopeTab,
  onCreate,
  showCorridorOption,
  primaryLabel = "Create deployment",
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
        scopeTab={scopeTab}
        showCorridorOption={showCorridorOption}
      />
      <PrimaryButton
        type="button"
        className={
          layout === "full"
            ? "min-w-0 flex-1 !rounded-r-none"
            : "!rounded-r-none"
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
            className="inline-flex min-w-9 items-center justify-center border-l border-primary-foreground/20 px-2.5 text-primary-foreground transition-opacity outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              backgroundColor: "var(--primary)",
              borderTopRightRadius: "var(--radius)",
              borderBottomRightRadius: "var(--radius)",
              fontFamily: "var(--font-family-text)",
            }}
            aria-label="More create options"
          >
            <ChevronDown className="size-4 opacity-90" aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="z-[200] max-h-72 w-56 overflow-y-auto"
        >
          <CreateDeploymentMenuContent
            onPick={onCreate}
            showCorridorOption={showCorridorOption}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
