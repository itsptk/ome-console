import { SmallText, TinyText, PrimaryButton } from '../../../imports/UIComponents';

interface SmartphoneAuthProps {
  onAuthorize: () => void;
}

export function SmartphoneAuth({ onAuthorize }: SmartphoneAuthProps) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
    >
      <div className="flex flex-col items-center">
        {/* Smartphone Frame */}
        <div
          className="relative border-8 rounded-[3rem] overflow-hidden"
          style={{
            width: '320px',
            height: '640px',
            borderColor: '#1a1a1a',
            backgroundColor: '#000',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Screen */}
          <div
            className="h-full flex flex-col"
            style={{
              backgroundColor: 'var(--background)',
            }}
          >
            {/* Status Bar */}
            <div
              className="px-6 py-3 flex items-center justify-between"
              style={{
                backgroundColor: 'var(--secondary)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <TinyText style={{ fontWeight: 'var(--font-weight-medium)' }}>
                9:41
              </TinyText>
              <div className="flex items-center gap-1">
                {/* Signal bars */}
                <div className="flex items-end gap-0.5">
                  <div className="w-0.5 h-1.5 bg-foreground rounded-full" />
                  <div className="w-0.5 h-2.5 bg-foreground rounded-full" />
                  <div className="w-0.5 h-3.5 bg-foreground rounded-full" />
                  <div className="w-0.5 h-4 bg-foreground rounded-full" />
                </div>
                {/* WiFi icon */}
                <svg className="size-3.5 ml-1" fill="none" viewBox="0 0 16 16" style={{ color: 'var(--foreground)' }}>
                  <path d="M1 7.5C3.5 5 5.5 3.5 8 3.5C10.5 3.5 12.5 5 15 7.5M3.5 10C5 8.5 6.5 7.5 8 7.5C9.5 7.5 11 8.5 12.5 10M6 12.5C6.5 12 7.2 11.5 8 11.5C8.8 11.5 9.5 12 10 12.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                </svg>
                {/* Battery icon */}
                <svg className="size-4 ml-0.5" fill="none" viewBox="0 0 24 24" style={{ color: 'var(--foreground)' }}>
                  <rect x="2" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="4" y="9" width="14" height="6" rx="1" fill="currentColor" />
                  <path d="M20 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 pb-12">
              {/* App Icon */}
              <div
                className="size-20 rounded-2xl mb-6 flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--primary)',
                  borderRadius: 'calc(var(--radius) * 2)',
                }}
              >
                <svg className="size-12" fill="none" viewBox="0 0 48 48" style={{ color: 'var(--primary-foreground)' }}>
                  <path
                    d="M24 4L8 14V30L24 40L40 30V14L24 4Z"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M24 24V40M24 24L8 14M24 24L40 14"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Title */}
              <h2
                className="mb-2 text-center"
                style={{
                  fontFamily: 'var(--font-family-display)',
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--foreground)',
                }}
              >
                Authorize Deployment
              </h2>

              {/* Description */}
              <div className="mb-8 text-center">
                <SmallText muted className="mb-3">
                  Sign in to authorize the deployment:
                </SmallText>
                <SmallText style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  "OpenShift cluster update"
                </SmallText>
                <TinyText muted className="mt-3">
                  This deployment requires your personal authorization to continue.
                </TinyText>
              </div>

              {/* Authorize Button */}
              <button
                onClick={onAuthorize}
                className="w-full py-3 rounded transition-colors"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  fontFamily: 'var(--font-family-text)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                  borderRadius: 'var(--radius)',
                }}
              >
                Authorize with Face ID
              </button>

              {/* Cancel Link */}
              <button
                className="mt-4"
                style={{
                  fontFamily: 'var(--font-family-text)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--primary)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                Cancel
              </button>
            </div>

            {/* Home Indicator */}
            <div className="pb-2 flex justify-center">
              <div
                className="h-1 rounded-full"
                style={{
                  width: '120px',
                  backgroundColor: 'var(--border)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Helper Text Below Phone */}
        <div className="mt-6 text-center">
          <SmallText style={{ color: 'white' }}>
            Tap "Authorize with Face ID" to continue
          </SmallText>
        </div>
      </div>
    </div>
  );
}
