import { useState } from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import { ConceptualLabel } from './ConceptualLabel-1';

interface ClusterWizardProps {
  clusterType: 'virtualization' | 'management-cluster';
  onComplete: () => void;
  onCancel: () => void;
}

type Step = 'cluster-details' | 'networking' | 'host-discovery' | 'settings' | 'review';

const steps: { id: Step; label: string }[] = [
  { id: 'cluster-details', label: 'Cluster details' },
  { id: 'networking', label: 'Networking' },
  { id: 'host-discovery', label: 'Host discovery' },
  { id: 'settings', label: 'Settings' },
  { id: 'review', label: 'Review' },
];

export function ClusterWizard({ clusterType, onComplete, onCancel }: ClusterWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('cluster-details');
  
  // Set default cluster name based on type
  const defaultClusterName = clusterType === 'management-cluster' 
    ? 'multicluster-engine-cluster' 
    : 'my-virtualmachine-cluster';
  
  const [clusterName, setClusterName] = useState(defaultClusterName);
  const [baseDomain, setBaseDomain] = useState('example.com');
  const [cpuArchitecture, setCpuArchitecture] = useState('x86_64');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [showYaml, setShowYaml] = useState(false);

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  
  // Define content based on cluster type
  const getHeaderContent = () => {
    if (clusterType === 'management-cluster') {
      return {
        title: 'Create a cluster for OpenShift Multicluster Engine',
        description: 'Configuring a dedicated cluster to offload management engine operations and add-ons.'
      };
    }
    return {
      title: 'Create Virtualization Cluster',
      description: 'Reviewing recommended settings for VM workloads.'
    };
  };
  
  const getInfoMessage = () => {
    if (clusterType === 'management-cluster') {
      return 'Based on your selection, we have pre-configured this cluster for the OpenShift Multicluster Engine with optimized control plane settings.';
    }
    return 'Based on your selection, we have pre-configured this cluster for high-availability virtualization.';
  };
  
  const getFeatureLabel = () => {
    if (clusterType === 'management-cluster') {
      return 'OpenShift Multicluster Engine';
    }
    return 'OpenShift Virtualization';
  };

  const headerContent = getHeaderContent();

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    } else {
      // Wizard complete
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const generateYaml = () => {
    return `apiVersion: v1
kind: BareMetalCluster
metadata:
  name: ${clusterName}
  namespace: default
spec:
  baseDomain: ${baseDomain}
  compute:
    - name: worker
      replicas: 3
  controlPlane:
    name: master
    replicas: 3
  networking:
    networkType: OVNKubernetes
    clusterNetwork:
      - cidr: 10.128.0.0/14
        hostPrefix: 23
    serviceNetwork:
      - 172.30.0.0/16
  platform:
    baremetal:
      apiVIP: 192.168.111.5
      ingressVIP: 192.168.111.4
      provisioningNetworkCIDR: 172.22.0.0/24
      hosts: []
  pullSecret: ""
  sshKey: |
    ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ...
  cpuArchitecture: ${cpuArchitecture}`;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'cluster-details':
        return (
          <div className="space-y-6">
            <div>
              <label 
                htmlFor="cluster-name"
                className="block mb-2"
                style={{ 
                  fontFamily: 'var(--font-family-text)', 
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)'
                }}
              >
                Cluster name <span className="text-destructive">*</span>
              </label>
              <input
                id="cluster-name"
                type="text"
                value={clusterName}
                onChange={(e) => setClusterName(e.target.value)}
                className="w-full px-3 py-2 border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ 
                  fontFamily: 'var(--font-family-text)',
                  fontSize: 'var(--text-sm)',
                  borderRadius: 'var(--radius)',
                  borderColor: 'var(--border)'
                }}
              />
            </div>

            <div>
              <label 
                htmlFor="base-domain"
                className="block mb-2"
                style={{ 
                  fontFamily: 'var(--font-family-text)', 
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)'
                }}
              >
                Base domain <span className="text-destructive">*</span>
              </label>
              <input
                id="base-domain"
                type="text"
                value={baseDomain}
                onChange={(e) => setBaseDomain(e.target.value)}
                className="w-full px-3 py-2 border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ 
                  fontFamily: 'var(--font-family-text)',
                  fontSize: 'var(--text-sm)',
                  borderRadius: 'var(--radius)',
                  borderColor: 'var(--border)'
                }}
              />
            </div>

            <div>
              <label 
                className="block mb-3"
                style={{ 
                  fontFamily: 'var(--font-family-text)', 
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)'
                }}
              >
                CPU architecture <span className="text-destructive">*</span>
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="cpu-architecture"
                    value="x86_64"
                    checked={cpuArchitecture === 'x86_64'}
                    onChange={(e) => setCpuArchitecture(e.target.value)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span 
                    className="flex items-center gap-2"
                    style={{ 
                      fontFamily: 'var(--font-family-text)', 
                      fontSize: 'var(--text-sm)'
                    }}
                  >
                    x86_64
                    <span 
                      className="px-2 py-0.5 bg-muted border text-muted-foreground"
                      style={{ 
                        fontFamily: 'var(--font-family-text)', 
                        fontSize: 'var(--text-xs)',
                        borderRadius: 'var(--radius)',
                        borderColor: 'var(--border)'
                      }}
                    >
                      Recommended
                    </span>
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="cpu-architecture"
                    value="aarch64"
                    checked={cpuArchitecture === 'aarch64'}
                    onChange={(e) => setCpuArchitecture(e.target.value)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span 
                    style={{ 
                      fontFamily: 'var(--font-family-text)', 
                      fontSize: 'var(--text-sm)'
                    }}
                  >
                    aarch64 (ARM64)
                  </span>
                </label>
              </div>
            </div>

            {/* Features - Only show for virtualization cluster */}
            {clusterType === 'virtualization' && (
              <div>
                <label 
                  className="block mb-3"
                  style={{ 
                    fontFamily: 'var(--font-family-text)', 
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  Features
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 opacity-75 cursor-not-allowed">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled={true}
                      className="w-4 h-4 accent-primary"
                    />
                    <span 
                      style={{ 
                        fontFamily: 'var(--font-family-text)', 
                        fontSize: 'var(--text-sm)'
                      }}
                    >
                      OpenShift Virtualization
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        );

      case 'networking':
        return (
          <div className="space-y-6">
            {/* Placeholder fields */}
            <div className="h-10 bg-muted border" style={{ borderRadius: 'var(--radius)', borderColor: 'var(--border)' }} />
            <div className="h-10 bg-muted border" style={{ borderRadius: 'var(--radius)', borderColor: 'var(--border)' }} />
            <div className="h-10 bg-muted border" style={{ borderRadius: 'var(--radius)', borderColor: 'var(--border)' }} />
          </div>
        );

      case 'host-discovery':
        return (
          <div className="space-y-6">
            {/* Placeholder fields */}
            <div className="h-10 bg-muted border" style={{ borderRadius: 'var(--radius)', borderColor: 'var(--border)' }} />
            <div className="h-20 bg-muted border" style={{ borderRadius: 'var(--radius)', borderColor: 'var(--border)' }} />
            <div className="h-10 bg-muted border" style={{ borderRadius: 'var(--radius)', borderColor: 'var(--border)' }} />
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            {/* Placeholder fields */}
            <div className="h-10 bg-muted border" style={{ borderRadius: 'var(--radius)', borderColor: 'var(--border)' }} />
            <div className="h-24 bg-muted border" style={{ borderRadius: 'var(--radius)', borderColor: 'var(--border)' }} />
            <div className="h-10 bg-muted border" style={{ borderRadius: 'var(--radius)', borderColor: 'var(--border)' }} />
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <h3 
              className="mb-4"
              style={{ 
                fontFamily: 'var(--font-family-display)', 
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              Review your configuration
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <span 
                  className="text-muted-foreground"
                  style={{ 
                    fontFamily: 'var(--font-family-text)', 
                    fontSize: 'var(--text-sm)'
                  }}
                >
                  Cluster name
                </span>
                <span 
                  style={{ 
                    fontFamily: 'var(--font-family-text)', 
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  {clusterName}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <span 
                  className="text-muted-foreground"
                  style={{ 
                    fontFamily: 'var(--font-family-text)', 
                    fontSize: 'var(--text-sm)'
                  }}
                >
                  Base domain
                </span>
                <span 
                  style={{ 
                    fontFamily: 'var(--font-family-text)', 
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  {baseDomain}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <span 
                  className="text-muted-foreground"
                  style={{ 
                    fontFamily: 'var(--font-family-text)', 
                    fontSize: 'var(--text-sm)'
                  }}
                >
                  CPU architecture
                </span>
                <span 
                  style={{ 
                    fontFamily: 'var(--font-family-text)', 
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  {cpuArchitecture}
                </span>
              </div>
            </div>
            
            <div className="flex items-center pt-4 mt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <input
                type="checkbox"
                checked={saveAsTemplate}
                onChange={(e) => setSaveAsTemplate(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <label 
                className="ml-2"
                style={{ 
                  fontFamily: 'var(--font-family-text)', 
                  fontSize: 'var(--text-sm)'
                }}
              >
                Save as cluster template
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Header */}
      <header 
        className="border-b px-6 py-4"
        style={{ 
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-secondary transition-colors"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 
              style={{ 
                fontFamily: 'var(--font-family-display)', 
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >{headerContent.title}</h1>
            <p 
              className="text-muted-foreground"
              style={{ 
                fontFamily: 'var(--font-family-text)', 
                fontSize: 'var(--text-sm)'
              }}
            >
              {headerContent.description}
            </p>
          </div>
        </div>
      </header>

      {/* Stepper */}
      <div 
        className="border-b px-6 py-6"
        style={{ 
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div 
                    className="w-8 h-8 flex items-center justify-center border-2 mb-2"
                    style={{ 
                      borderRadius: '50%',
                      borderColor: index === currentStepIndex ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: index === currentStepIndex ? 'var(--primary)' : 'transparent'
                    }}
                  >
                    {index === currentStepIndex && (
                      <div 
                        className="w-3 h-3"
                        style={{ 
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary-foreground)'
                        }}
                      />
                    )}
                  </div>
                  <span 
                    style={{ 
                      fontFamily: 'var(--font-family-text)', 
                      fontSize: 'var(--text-sm)',
                      fontWeight: index === currentStepIndex ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
                      color: index === currentStepIndex ? 'var(--foreground)' : 'var(--muted-foreground)'
                    }}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className="h-0.5 flex-1 mx-2 mb-8"
                    style={{ backgroundColor: 'var(--border)' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8" style={{ backgroundColor: 'var(--muted)' }}>
        <div className={showYaml ? "mx-auto" : "max-w-3xl mx-auto"}>
          <div className={showYaml ? "grid grid-cols-2 gap-6" : ""}>
            {/* Wizard Form */}
            <div 
              className="p-8 border bg-card"
              style={{ 
                borderRadius: 'var(--radius)',
                borderColor: 'var(--border)',
                marginBottom: '100px'
              }}
            >
              {/* Info Alert - Only show on Cluster details page */}
              {currentStep === 'cluster-details' && (
                <div 
                  className="flex gap-3 p-4 mb-6 border-l-4"
                  style={{
                    backgroundColor: '#E7F1FA',
                    borderLeftColor: '#0066CC',
                    borderRadius: 'var(--radius)'
                  }}
                >
                  <Info 
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: '#0066CC' }}
                  />
                  <p 
                    style={{
                      fontFamily: 'var(--font-family-text)',
                      fontSize: 'var(--text-sm)',
                      color: '#151515'
                    }}
                  >
                    {getInfoMessage()}
                  </p>
                </div>
              )}

              {/* YAML Toggle */}
              <div className="flex items-center justify-end mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <span 
                    style={{ 
                      fontFamily: 'var(--font-family-text)', 
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    YAML
                  </span>
                  <div 
                    onClick={() => setShowYaml(!showYaml)}
                    className="relative inline-flex h-6 w-11 items-center transition-colors"
                    style={{ 
                      borderRadius: '9999px',
                      backgroundColor: showYaml ? 'var(--primary)' : 'var(--border)'
                    }}
                  >
                    <span 
                      className="inline-block h-4 w-4 transform transition-transform bg-white"
                      style={{ 
                        borderRadius: '50%',
                        transform: showYaml ? 'translateX(1.5rem)' : 'translateX(0.25rem)'
                      }}
                    />
                  </div>
                </label>
              </div>

              {renderStepContent()}
            </div>

            {/* YAML Panel */}
            {showYaml && (
              <div 
                className="border bg-card overflow-hidden flex flex-col"
                style={{ 
                  borderRadius: 'var(--radius)',
                  borderColor: 'var(--border)'
                }}
              >
                <div 
                  className="px-4 py-3 border-b"
                  style={{ 
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--muted)'
                  }}
                >
                  <span 
                    style={{ 
                      fontFamily: 'var(--font-family-text)', 
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    Cluster YAML
                  </span>
                </div>
                <div 
                  className="flex-1 overflow-auto p-4"
                  style={{ 
                    fontFamily: 'var(--font-family-mono, monospace)', 
                    fontSize: 'var(--text-xs)',
                    backgroundColor: 'var(--card)'
                  }}
                >
                  <pre className="text-foreground whitespace-pre">
                    {generateYaml().split('\n').map((line, i) => (
                      <div key={i} className="flex">
                        <span 
                          className="inline-block w-10 text-right pr-4 select-none text-muted-foreground"
                          style={{ 
                            fontFamily: 'var(--font-family-mono, monospace)', 
                            fontSize: 'var(--text-xs)'
                          }}
                        >
                          {i + 1}
                        </span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConceptualLabel />

      {/* Footer */}
      <footer 
        className="border-t px-6 py-4"
        style={{ 
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="px-4 py-2 border hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              fontFamily: 'var(--font-family-text)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              borderRadius: 'var(--radius)',
              borderColor: 'var(--border)'
            }}
          >
            Back
          </button>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-primary hover:underline"
              style={{ 
                fontFamily: 'var(--font-family-text)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              style={{ 
                fontFamily: 'var(--font-family-text)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                borderRadius: 'var(--radius)'
              }}
            >
              {currentStepIndex === steps.length - 1 ? 'Create cluster' : 'Next'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}