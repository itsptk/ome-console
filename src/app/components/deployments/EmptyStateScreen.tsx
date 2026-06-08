import { PrimaryButton, CardTitle, BodyText, SmallText } from '../../../imports/UIComponents';

interface EmptyStateScreenProps {
  onCreateClick: () => void;
}

export function EmptyStateScreen({ onCreateClick }: EmptyStateScreenProps) {
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
        <BodyText muted className="mb-8">Monitor and manage fleet-wide changes. Learn more about how deployments work</BodyText>

        {/* Action */}
        <PrimaryButton onClick={onCreateClick}>
          Create deployment
        </PrimaryButton>

        {/* Helper text */}
        <SmallText muted className="mt-6"></SmallText>
      </div>
    </div>
  );
}
