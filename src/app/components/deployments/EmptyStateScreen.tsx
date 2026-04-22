import { FastForward } from 'lucide-react';
import { PrimaryButton, TertiaryButton, CardTitle, BodyText } from '../../../imports/UIComponents';

interface EmptyStateScreenProps {
  /** Placement-first: define scope, then actions (suited to ops triage). */
  onCreateFromPlacement: () => void;
  /** Action-first: pick what to run, then where it applies. */
  onCreateFromAction: () => void;
  /** Skip the create wizard and show the populated deployments view (prototype demo). */
  onFastForwardToDeployments?: () => void;
}

export function EmptyStateScreen({
  onCreateFromPlacement,
  onCreateFromAction,
  onFastForwardToDeployments,
}: EmptyStateScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div 
            className="p-6 rounded-full"
            style={{ backgroundColor: 'var(--secondary)' }}
          >
            <svg className="size-16" fill="none" viewBox="0 0 64 64" style={{ color: 'var(--muted-foreground)' }}>
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

        {/* Title */}
        <CardTitle className="mb-3">
          Start by creating a deployment
        </CardTitle>

        {/* Description */}
        <BodyText muted className="mb-4 text-left max-w-md mx-auto">
          Monitor fleet-wide changes. Choose whether to start from{' '}
          <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
            placement
          </span>{' '}
          (scope and suggested work) or from{' '}
          <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
            action
          </span>{' '}
          (a specific change, then targeting).
        </BodyText>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3">
          <PrimaryButton onClick={onCreateFromPlacement} className="w-full max-w-xs">
            Create from placement
          </PrimaryButton>
          <TertiaryButton
            type="button"
            onClick={onCreateFromAction}
            className="w-full max-w-xs"
          >
            Create from action
          </TertiaryButton>
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
    </div>
  );
}
