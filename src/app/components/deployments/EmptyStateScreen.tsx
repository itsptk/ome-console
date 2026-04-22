import { FastForward } from "lucide-react";
import { TertiaryButton, CardTitle, BodyText } from "../../../imports/UIComponents";

interface EmptyStateScreenProps {
  /** Skip the create wizard and show the populated deployments view (prototype demo). */
  onFastForwardToDeployments?: () => void;
}

export function EmptyStateScreen({
  onFastForwardToDeployments,
}: EmptyStateScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="text-center max-w-md w-full px-2">
        <div className="mb-6 flex justify-center">
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

        <CardTitle className="mb-3">
          Start by creating a deployment
        </CardTitle>

        <BodyText muted className="mb-4 text-left max-w-md mx-auto">
          Use <strong className="font-medium">Create deployment</strong> in the
          top right. It opens a short chooser; the{" "}
          <span className="whitespace-nowrap">▼</span> menu lists exact
          action-first and placement-first options per tab.
        </BodyText>

        {onFastForwardToDeployments && (
          <TertiaryButton
            type="button"
            onClick={onFastForwardToDeployments}
            className="inline-flex items-center justify-center gap-2"
          >
            <FastForward className="size-4 shrink-0" aria-hidden />
            Fast-forward to deployments list
          </TertiaryButton>
        )}
      </div>
    </div>
  );
}
