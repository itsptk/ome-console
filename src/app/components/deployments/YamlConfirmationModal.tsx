import { SmallText, TinyText, PrimaryButton, SecondaryButton } from '../../../imports/UIComponents';

interface YamlConfirmationModalProps {
  onAccept: () => void;
  onDecline: () => void;
  clusterCount: number;
}

export function YamlConfirmationModal({ onAccept, onDecline, clusterCount }: YamlConfirmationModalProps) {
  const yamlContent = `apiVersion: config.openshift.io/v1
kind: ClusterVersion
metadata:
  name: version
spec:
  channel: stable-4.16
  desiredUpdate:
    version: 4.16.2
    image: quay.io/openshift-release-dev/ocp-release@sha256:abc123...
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: cluster-config-v1
  namespace: openshift-config
data:
  install-config: |
    apiVersion: v1
    baseDomain: example.com
    compute:
    - hyperthreading: Enabled
      name: worker
      replicas: 3
    controlPlane:
      hyperthreading: Enabled
      name: master
      replicas: 3
    metadata:
      name: production-cluster
    networking:
      clusterNetwork:
      - cidr: 10.128.0.0/14
        hostPrefix: 23
      networkType: OpenShiftSDN
      serviceNetwork:
      - 172.30.0.0/16
    platform:
      aws:
        region: us-east-1
---
apiVersion: operator.openshift.io/v1
kind: Network
metadata:
  name: cluster
spec:
  clusterNetwork:
  - cidr: 10.128.0.0/14
    hostPrefix: 23
  serviceNetwork:
  - 172.30.0.0/16
  defaultNetwork:
    type: OpenShiftSDN
    openshiftSDNConfig:
      mode: NetworkPolicy
      mtu: 1450
      vxlanPort: 4789`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
    >
      <div
        className="border rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2
            className="mb-2"
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--foreground)',
            }}
          >
            Confirm Configuration Changes
          </h2>
          <SmallText muted>
            This file will be applied to {clusterCount} clusters to be updated.
          </SmallText>
        </div>

        {/* YAML Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div
            className="rounded border p-4 overflow-x-auto"
            style={{
              backgroundColor: 'var(--secondary)',
              borderColor: 'var(--border)',
              borderRadius: 'var(--radius)',
            }}
          >
            <pre
              style={{
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: 'var(--text-xs)',
                color: 'var(--foreground)',
                lineHeight: '1.6',
                margin: 0,
                whiteSpace: 'pre',
              }}
            >
              {yamlContent}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between"
          style={{ borderColor: 'var(--border)' }}
        >
          <TinyText muted>
            Review the configuration carefully before proceeding
          </TinyText>
          <div className="flex items-center gap-3">
            <SecondaryButton onClick={onDecline}>
              Decline
            </SecondaryButton>
            <PrimaryButton onClick={onAccept}>
              Accept & Continue
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
