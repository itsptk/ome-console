import { X, Search, Plus, Rocket, ChevronRight } from 'lucide-react';
import successImage from '@/assets/ea4373fd267f1643bf095c4e8063eb9d350ffddb.png';

interface ClusterSuccessModalProps {
  onClose: () => void;
  onImportClusters: () => void;
  onCreateAnother: () => void;
  onExploreCapabilities: () => void;
}

export function ClusterSuccessModal({
  onClose,
  onImportClusters,
  onCreateAnother,
  onExploreCapabilities,
}: ClusterSuccessModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-card border max-w-3xl w-full p-8 relative"
        style={{
          borderRadius: 'var(--radius)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--elevation-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-secondary transition-colors"
          style={{ borderRadius: 'var(--radius)' }}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex gap-8">
          {/* Illustration */}
          <div className="flex-shrink-0">
            <img
              src={successImage}
              alt="Success illustration"
              className="w-40 h-auto"
            />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h2
              className="mb-4"
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-weight-regular)',
              }}
            >
              You successfully created{' '}
              <span style={{ fontWeight: 'var(--font-weight-bold)' }}>
                your first cluster
              </span>
            </h2>

            <p
              className="mb-4 text-muted-foreground"
              style={{
                fontFamily: 'var(--font-family-text)',
                fontSize: 'var(--text-sm)',
              }}
            >
              Now, you can create more clusters or explore additional functionality.
            </p>

            <p
              className="mb-6 text-muted-foreground"
              style={{
                fontFamily: 'var(--font-family-text)',
                fontSize: 'var(--text-sm)',
              }}
            >
              Choose one of the options below to continue building your infrastructure or discover what your clusters can do.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={onImportClusters}
                className="w-full flex items-center justify-between p-4 border bg-muted hover:bg-secondary transition-colors text-left"
                style={{
                  borderRadius: 'var(--radius)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <span
                    style={{
                      fontFamily: 'var(--font-family-text)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                    }}
                  >
                    Import existing clusters
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <button
                onClick={onCreateAnother}
                className="w-full flex items-center justify-between p-4 border bg-muted hover:bg-secondary transition-colors text-left"
                style={{
                  borderRadius: 'var(--radius)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-5 h-5 text-muted-foreground" />
                  <span
                    style={{
                      fontFamily: 'var(--font-family-text)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                    }}
                  >
                    Create another cluster
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <button
                onClick={onExploreCapabilities}
                className="w-full flex items-center justify-between p-4 border bg-muted hover:bg-secondary transition-colors text-left"
                style={{
                  borderRadius: 'var(--radius)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex items-center gap-3">
                  <Rocket className="w-5 h-5 text-muted-foreground" />
                  <span
                    style={{
                      fontFamily: 'var(--font-family-text)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                    }}
                  >
                    Explore more capabilities
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}