import { FastForward } from "lucide-react";
import { TertiaryButton, CardTitle, BodyText } from "../../../imports/UIComponents";
import { deploymentCopy } from "./deploymentPrototypeCopy";
import {
  CreateDeploymentSplitButton,
  type OpenDeploymentWizardOptions,
} from "./CreateDeploymentSplitButton";

interface EmptyStateScreenProps {
  onCreateDeployment: (opts: OpenDeploymentWizardOptions) => void;
  /** Skip the create wizard and show the populated deployments view (prototype demo). */
  onFastForwardToDeployments?: () => void;
}

export function EmptyStateScreen({
  onCreateDeployment,
  onFastForwardToDeployments,
}: EmptyStateScreenProps) {
  return (
    <div className="flex min-h-[500px] items-center justify-center px-3">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-6">
          <div
            className="p-6 rounded-full"
            style={{ backgroundColor: "var(--secondary)" }}
          >
            <svg
              className="size-16"
              fill="none"
              viewBox="0 0 64 64"
              style={{ color: "var(--muted-foreground)" }}
            >
              <path
                d="M32 8L48 24H40V48H24V24H16L32 8Z"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M12 54H52"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <CardTitle className="mb-3 text-balance">
          {deploymentCopy.emptyState.title}
        </CardTitle>

        <BodyText muted className="mb-6 max-w-sm text-balance">
          {deploymentCopy.emptyState.description}
        </BodyText>

        <div className="mb-6 flex w-full justify-center">
          <CreateDeploymentSplitButton
            areaTab="all"
            onCreate={onCreateDeployment}
          />
        </div>

        {onFastForwardToDeployments && (
          <TertiaryButton
            type="button"
            onClick={onFastForwardToDeployments}
            className="inline-flex max-w-full items-center justify-center gap-2 text-balance"
          >
            <FastForward className="size-4 shrink-0" aria-hidden />
            Fast-forward to deployments list
          </TertiaryButton>
        )}
      </div>
    </div>
  );
}
