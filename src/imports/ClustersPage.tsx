import { CardTitle, SmallText, TinyText, Badge, SecondaryButton, PrimaryButton, IconButton } from './UIComponents';
import { Link, useSearchParams } from 'react-router';
import { useState, useEffect } from 'react';
import {
  CreateClusterWizard,
  RUN_AS_PLATFORM_VALUE,
  RUN_AS_YOU_VALUE,
} from './CreateClusterWizard';
import { PlatformSigningFlow } from '../app/components/deployments/PlatformSigningFlow';
import { SmartphoneAuth } from '../app/components/deployments/SmartphoneAuth';
import { YamlConfirmationModal } from '../app/components/deployments/YamlConfirmationModal';

export function ClustersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [showSmartphoneAuth, setShowSmartphoneAuth] = useState(false);
  const [showYamlConfirmation, setShowYamlConfirmation] = useState(false);
  const [showPlatformSigning, setShowPlatformSigning] = useState(false);
  const [hasAuthorized, setHasAuthorized] = useState(false);
  const [fastForwardStage, setFastForwardStage] = useState(0); // 0 = initial, 1 = after first FF, 2 = after auth, 3 = completed
  const [pendingClusterData, setPendingClusterData] = useState<any>(null);
  const [requiresManualConfirmation, setRequiresManualConfirmation] = useState(false);

  const [clusters, setClusters] = useState([
    {
      id: '1',
      name: 'virt-prod-01',
      type: 'Virtualization',
      status: 'Healthy',
      version: 'OpenShift 4.15.2',
      nodes: 12,
      cpu: 156,
      memory: '1.2 TB',
      location: 'US East',
      region: 'us-east-1',
      namespace: 'default',
      ipAddress: '10.128.3.10',
      created: 'Mar 10, 2026',
    },
    {
      id: '2',
      name: 'app-prod-us-east',
      type: 'Application',
      status: 'Healthy',
      version: 'OpenShift 4.15.3',
      nodes: 24,
      cpu: 384,
      memory: '2.8 TB',
      location: 'US East (N. Virginia)',
      region: 'us-east-1',
      namespace: 'default',
      ipAddress: '10.131.0.87',
      created: 'Feb 15, 2026',
    },
    {
      id: '3',
      name: 'ml-gpu-cluster',
      type: 'Machine Learning',
      status: 'Healthy',
      version: 'OpenShift 4.15.1',
      nodes: 8,
      cpu: 128,
      memory: '1.5 TB',
      location: 'US West (Oregon)',
      region: 'us-west-2',
      namespace: 'default',
      ipAddress: '10.128.3.100',
      created: 'Mar 05, 2026',
    },
    {
      id: '4',
      name: 'app-prod-eu',
      type: 'Application',
      status: 'Critical',
      version: 'OpenShift 4.14.8',
      nodes: 16,
      cpu: 256,
      memory: '1.8 TB',
      location: 'EU (Ireland)',
      region: 'eu-west-1',
      namespace: 'default',
      ipAddress: '10.131.1.7',
      created: 'Jan 22, 2026',
    },
    {
      id: '5',
      name: 'data-eu-west',
      type: 'Data Processing',
      status: 'Healthy',
      version: 'OpenShift 4.15.2',
      nodes: 20,
      cpu: 320,
      memory: '2.4 TB',
      location: 'EU (Ireland)',
      region: 'eu-west-1',
      namespace: 'default',
      ipAddress: '10.131.1.50',
      created: 'Feb 28, 2026',
    },
    {
      id: '6',
      name: 'app-prod-apac',
      type: 'Application',
      status: 'Healthy',
      version: 'OpenShift 4.15.3',
      nodes: 18,
      cpu: 288,
      memory: '2.0 TB',
      location: 'Asia Pacific (Tokyo)',
      region: 'ap-northeast-1',
      namespace: 'default',
      ipAddress: '10.132.0.10',
      created: 'Mar 01, 2026',
    },
    {
      id: '7',
      name: 'web-prod-sg',
      type: 'Web Services',
      status: 'Healthy',
      version: 'OpenShift 4.15.2',
      nodes: 14,
      cpu: 224,
      memory: '1.6 TB',
      location: 'Asia Pacific (Singapore)',
      region: 'ap-southeast-1',
      namespace: 'default',
      ipAddress: '10.132.1.20',
      created: 'Feb 20, 2026',
    },
    {
      id: '8',
      name: 'api-prod-sg',
      type: 'API Gateway',
      status: 'Healthy',
      version: 'OpenShift 4.15.3',
      nodes: 10,
      cpu: 160,
      memory: '1.2 TB',
      location: 'Asia Pacific (Singapore)',
      region: 'ap-southeast-1',
      namespace: 'default',
      ipAddress: '10.132.1.30',
      created: 'Mar 12, 2026',
    },
    {
      id: '9',
      name: 'app-prod-sa',
      type: 'Application',
      status: 'Healthy',
      version: 'OpenShift 4.15.1',
      nodes: 12,
      cpu: 192,
      memory: '1.4 TB',
      location: 'South America (São Paulo)',
      region: 'sa-east-1',
      namespace: 'default',
      ipAddress: '10.133.0.10',
      created: 'Feb 10, 2026',
    },
  ]);

  // Filter clusters based on region
  const filteredClusters = clusters.filter(cluster => {
    if (regionFilter && cluster.region !== regionFilter) {
      return false;
    }
    if (searchQuery && !cluster.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy':
        return '#3E8635';
      case 'Warning':
        return '#F0AB00';
      case 'Critical':
        return '#C9190B';
      case 'Provisioning':
        return '#0066CC';
      default:
        return 'var(--muted-foreground)';
    }
  };

  const handleClusterSelection = (id: string) => {
    if (selectedClusters.includes(id)) {
      setSelectedClusters(selectedClusters.filter((c) => c !== id));
    } else {
      setSelectedClusters([...selectedClusters, id]);
    }
  };

  const handleClusterCreation = (formData: any) => {
    setShowWizard(false);

    if (formData.runAs === RUN_AS_PLATFORM_VALUE) {
      setPendingClusterData(formData);
      setShowPlatformSigning(true);
      return;
    }

    if (formData.requireManualConfirmation) {
      setPendingClusterData(formData);
      setRequiresManualConfirmation(true);
      setShowYamlConfirmation(true);
    } else {
      createCluster(formData);
    }
  };

  const handlePlatformSigningComplete = () => {
    setShowPlatformSigning(false);
    const data = pendingClusterData;
    if (!data) return;

    if (data.requireManualConfirmation) {
      setRequiresManualConfirmation(true);
      setShowYamlConfirmation(true);
    } else {
      createCluster(data);
      setPendingClusterData(null);
    }
  };

  const handlePlatformSigningCancel = () => {
    setShowPlatformSigning(false);
    setPendingClusterData(null);
  };

  const createCluster = (formData: any) => {
    // Create a new cluster object
    const newCluster = {
      id: String(clusters.length + 1),
      name: formData.clusterName,
      type: 'Virtualization',
      status: 'Provisioning',
      version: 'Pending',
      nodes: 0,
      cpu: 0,
      memory: '-',
      location: 'Pending',
      region: '',
      namespace: 'default',
      ipAddress: 'Pending',
      created: 'Just now',
      /** Identity & Approval choice; drives phone auth demo only for run-as-you. */
      runAs: formData.runAs as string,
    };

    // Add new cluster to the beginning of the list
    setClusters([newCluster, ...clusters]);
    setFastForwardStage(0); // Reset fast forward stage
  };

  const handleYamlAccept = () => {
    setShowYamlConfirmation(false);
    if (pendingClusterData) {
      createCluster(pendingClusterData);
      setPendingClusterData(null);
    }
  };

  const handleYamlDecline = () => {
    setShowYamlConfirmation(false);
    setPendingClusterData(null);
    setRequiresManualConfirmation(false);
  };

  const handleFastForward = () => {
    const top = clusters[0];
    if (!top) return;
    const needsPhoneAuthorization = top.runAs === RUN_AS_YOU_VALUE;

    if (fastForwardStage === 0) {
      if (top.status !== 'Provisioning') return;

      // Run as you: time advances until the cluster waits for out-of-band approval (phone).
      if (needsPhoneAuthorization) {
        setClusters((prevClusters) => {
          const updated = [...prevClusters];
          if (updated[0] && updated[0].status === 'Provisioning') {
            updated[0] = {
              ...updated[0],
              status: 'Paused - pending authorization',
            };
          }
          return updated;
        });
        setFastForwardStage(1);
        return;
      }

      // Run as platform (or service account): user already satisfied auth; skip phone pause.
      setClusters((prevClusters) => {
        const updated = [...prevClusters];
        if (updated[0] && updated[0].status === 'Provisioning') {
          updated[0] = {
            ...updated[0],
            status: 'Healthy',
            version: 'OpenShift 4.16.0',
            nodes: 3,
            cpu: 48,
            memory: '384 GB',
            location: 'US East',
            region: 'us-east-1',
            ipAddress: '10.128.5.20',
          };
        }
        return updated;
      });
      setFastForwardStage(3);
      setRequiresManualConfirmation(false);
    } else if (fastForwardStage === 2) {
      // After phone approval: provisioning completes.
      setClusters((prevClusters) => {
        const updated = [...prevClusters];
        if (updated[0] && updated[0].status === 'Provisioning') {
          updated[0] = {
            ...updated[0],
            status: 'Healthy',
            version: 'OpenShift 4.16.0',
            nodes: 3,
            cpu: 48,
            memory: '384 GB',
            location: 'US East',
            region: 'us-east-1',
            ipAddress: '10.128.5.20',
          };
        }
        return updated;
      });
      setFastForwardStage(3);
      setRequiresManualConfirmation(false);
    }
  };

  const handleCheckPhone = () => {
    setShowSmartphoneAuth(true);
  };

  const handleAuthorize = () => {
    setHasAuthorized(true);
    setShowSmartphoneAuth(false);
    // Change back to "Provisioning" status
    setClusters(prevClusters => {
      const updated = [...prevClusters];
      if (updated[0] && updated[0].status === 'Paused - pending authorization') {
        updated[0] = { ...updated[0], status: 'Provisioning' };
      }
      return updated;
    });
    setFastForwardStage(2);
  };

  // Check if we should show fast forward button
  const hasProvisioningCluster = clusters.some(c => c.status === 'Provisioning' || c.status === 'Paused - pending authorization');
  const showFastForwardButton = hasProvisioningCluster && fastForwardStage !== 3;
  const showCheckPhoneButton =
    fastForwardStage === 1 &&
    clusters[0]?.status === 'Paused - pending authorization' &&
    clusters[0]?.runAs === RUN_AS_YOU_VALUE;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="mb-2" style={{ fontFamily: 'var(--font-family-display)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-medium)' }}>
              Clusters
            </h1>
            <SmallText muted>
              Manage and monitor all your OpenShift clusters across regions
            </SmallText>
          </div>
          <PrimaryButton
            onClick={() => setShowWizard(true)}
          >
            Create Cluster
          </PrimaryButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-[var(--radius)]" style={{ border: '1px solid var(--border)' }}>
            <TinyText muted className="mb-1">Total Clusters</TinyText>
            <div className="flex items-baseline gap-2">
              <span style={{ fontFamily: 'var(--font-family-display)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-medium)' }}>
                {clusters.length}
              </span>
            </div>
          </div>
          <div className="bg-card p-4 rounded-[var(--radius)]" style={{ border: '1px solid var(--border)' }}>
            <TinyText muted className="mb-1">Total Nodes</TinyText>
            <div className="flex items-baseline gap-2">
              <span style={{ fontFamily: 'var(--font-family-display)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-medium)' }}>
                {clusters.reduce((sum, c) => sum + c.nodes, 0)}
              </span>
            </div>
          </div>
          <div className="bg-card p-4 rounded-[var(--radius)]" style={{ border: '1px solid var(--border)' }}>
            <TinyText muted className="mb-1">Healthy</TinyText>
            <div className="flex items-baseline gap-2">
              <span style={{ fontFamily: 'var(--font-family-display)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-medium)', color: '#3E8635' }}>
                {clusters.filter(c => c.status === 'Healthy').length}
              </span>
            </div>
          </div>
          <div className="bg-card p-4 rounded-[var(--radius)]" style={{ border: '1px solid var(--border)' }}>
            <TinyText muted className="mb-1">Needs Attention</TinyText>
            <div className="flex items-baseline gap-2">
              <span style={{ fontFamily: 'var(--font-family-display)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-medium)', color: '#F0AB00' }}>
                {clusters.filter(c => c.status !== 'Healthy').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Clusters List */}
      <div className="space-y-4">
        {/* Top Search Bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 size-[16px]" 
              fill="none" 
              viewBox="0 0 16 16"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search clusters"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 h-10 bg-card"
              style={{
                fontFamily: 'var(--font-family-text)',
                fontSize: 'var(--text-sm)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                outline: 'none',
              }}
            />
          </div>
          <IconButton aria-label="Toggle filters">
            <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
              <path d="M3 3H17V5L11 12V17L9 18V12L3 5V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </IconButton>
          <SecondaryButton>Save search</SecondaryButton>
          <button
            className="flex items-center gap-2 px-3 h-10 bg-secondary hover:bg-secondary/80 transition-colors"
            style={{
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-family-text)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            Saved searches
            <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Filter Row */}
        <div className="flex items-center gap-3 mb-4">
          {/* Region Filter Badge (if active) */}
          {regionFilter && (
            <div 
              className="flex items-center gap-2 px-3 h-9 bg-primary/10"
              style={{
                border: '1px solid var(--primary)',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--font-family-text)',
                fontSize: 'var(--text-sm)',
              }}
            >
              <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--primary)' }}>
                Region: {regionFilter}
              </span>
              <button
                onClick={() => {
                  setRegionFilter('');
                  setSearchParams({});
                }}
                className="hover:opacity-70"
                aria-label="Clear region filter"
              >
                <svg className="size-[14px]" fill="none" viewBox="0 0 16 16">
                  <path d="M4 4L12 12M12 4L4 12" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Type Filter */}
          <button
            className="flex items-center gap-2 px-3 h-9 bg-card hover:bg-secondary transition-colors"
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-family-text)',
              fontSize: 'var(--text-sm)',
            }}
          >
            <span style={{ color: 'var(--muted-foreground)' }}>Type</span>
            <span style={{ fontWeight: 'var(--font-weight-medium)' }}>All</span>
            <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Location Filter */}
          <button
            className="flex items-center gap-2 px-3 h-9 bg-card hover:bg-secondary transition-colors"
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-family-text)',
              fontSize: 'var(--text-sm)',
            }}
          >
            <span style={{ color: 'var(--muted-foreground)' }}>Location</span>
            <span style={{ fontWeight: 'var(--font-weight-medium)' }}>All</span>
            <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Status Filter */}
          <button
            className="flex items-center gap-2 px-3 h-9 bg-card hover:bg-secondary transition-colors"
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-family-text)',
              fontSize: 'var(--text-sm)',
            }}
          >
            <span style={{ color: 'var(--muted-foreground)' }}>Status</span>
            <span style={{ fontWeight: 'var(--font-weight-medium)' }}>All</span>
            <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Version Filter */}
          <button
            className="flex items-center gap-2 px-3 h-9 bg-card hover:bg-secondary transition-colors"
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-family-text)',
              fontSize: 'var(--text-sm)',
            }}
          >
            <span style={{ color: 'var(--muted-foreground)' }}>Version</span>
            <span style={{ fontWeight: 'var(--font-weight-medium)' }}>All</span>
            <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Search by name */}
          <div className="flex-1 relative">
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 size-[14px]" 
              fill="none" 
              viewBox="0 0 16 16"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search by name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-full pl-9 pr-3 h-9 bg-card"
              style={{
                fontFamily: 'var(--font-family-text)',
                fontSize: 'var(--text-sm)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Table Actions Bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {selectedClusters.length > 0 ? (
              <>
                <button
                  className="flex items-center gap-2 px-3 h-9 bg-primary text-primary-foreground"
                  style={{
                    borderRadius: 'var(--radius)',
                    fontFamily: 'var(--font-family-text)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                  }}
                >
                  {selectedClusters.length} selected
                  <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  className="flex items-center gap-2 px-3 h-9 bg-secondary hover:bg-secondary/80 transition-colors"
                  style={{
                    borderRadius: 'var(--radius)',
                    fontFamily: 'var(--font-family-text)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                  }}
                >
                  Actions
                  <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            ) : (
              <span style={{ fontFamily: 'var(--font-family-text)', fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                0 selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex items-center" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
              <button
                className="p-2 hover:bg-secondary transition-colors"
                style={{ borderRadius: 'var(--radius) 0 0 var(--radius)' }}
                aria-label="List view"
              >
                <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
                  <rect x="2" y="3" width="12" height="2" fill="currentColor" />
                  <rect x="2" y="7" width="12" height="2" fill="currentColor" />
                  <rect x="2" y="11" width="12" height="2" fill="currentColor" />
                </svg>
              </button>
              <button
                className="p-2 hover:bg-secondary transition-colors"
                style={{ borderRadius: '0 var(--radius) var(--radius) 0' }}
                aria-label="Grid view"
              >
                <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
                  <rect x="2" y="2" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="9" y="2" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="2" y="9" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="9" y="9" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: 'var(--font-family-text)', fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                1 - {clusters.length} of {clusters.length}
              </span>
              <button
                className="p-1.5 hover:bg-secondary transition-colors"
                style={{ borderRadius: 'var(--radius)' }}
                aria-label="Previous page"
                disabled
              >
                <svg className="size-[16px]" fill="none" viewBox="0 0 16 16" style={{ opacity: 0.5 }}>
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span style={{ fontFamily: 'var(--font-family-text)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                1
              </span>
              <span style={{ fontFamily: 'var(--font-family-text)', fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                of 1
              </span>
              <button
                className="p-1.5 hover:bg-secondary transition-colors"
                style={{ borderRadius: 'var(--radius)' }}
                aria-label="Next page"
                disabled
              >
                <svg className="size-[16px]" fill="none" viewBox="0 0 16 16" style={{ opacity: 0.5 }}>
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                className="p-1.5 hover:bg-secondary transition-colors"
                style={{ borderRadius: 'var(--radius)' }}
                aria-label="Last page"
                disabled
              >
                <svg className="size-[16px]" fill="none" viewBox="0 0 16 16" style={{ opacity: 0.5 }}>
                  <path d="M6 4L10 8L6 12M10 4L14 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div 
          className="bg-card overflow-hidden"
          style={{ 
            border: '1px solid var(--border)', 
            borderRadius: 'var(--radius)' 
          }}
        >
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--secondary)' }}>
              <tr>
                <th className="text-left p-3" style={{ width: '40px' }}>
                  <button
                    className="size-4 border-2 flex items-center justify-center transition-colors hover:border-primary"
                    style={{
                      borderRadius: 'var(--radius-sm)',
                      borderColor: 'var(--border)',
                      backgroundColor: 'transparent',
                    }}
                    aria-label="Select all"
                  />
                </th>
                <th 
                  className="text-left p-3"
                  style={{ 
                    fontFamily: 'var(--font-family-text)', 
                    fontSize: 'var(--text-sm)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--foreground)'
                  }}
                >
                  <button className="flex items-center gap-1 hover:text-primary">
                    Name
                    <svg className="size-[12px]" fill="none" viewBox="0 0 12 12">
                      <path d="M6 3V9M3 6L6 9L9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </th>
                <th 
                  className="text-left p-3"
                  style={{ 
                    fontFamily: 'var(--font-family-text)', 
                    fontSize: 'var(--text-sm)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--foreground)'
                  }}
                >
                  <button className="flex items-center gap-1 hover:text-primary">
                    Type
                    <svg className="size-[12px]" fill="none" viewBox="0 0 12 12">
                      <path d="M6 3V9M3 6L6 9L9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </th>
                <th 
                  className="text-left p-3"
                  style={{ 
                    fontFamily: 'var(--font-family-text)', 
                    fontSize: 'var(--text-sm)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--foreground)'
                  }}
                >
                  <button className="flex items-center gap-1 hover:text-primary">
                    Namespace
                    <svg className="size-[12px]" fill="none" viewBox="0 0 12 12">
                      <path d="M6 3V9M3 6L6 9L9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </th>
                <th 
                  className="text-left p-3"
                  style={{ 
                    fontFamily: 'var(--font-family-text)', 
                    fontSize: 'var(--text-sm)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--foreground)'
                  }}
                >
                  <button className="flex items-center gap-1 hover:text-primary">
                    Status
                    <svg className="size-[12px]" fill="none" viewBox="0 0 12 12">
                      <path d="M6 3V9M3 6L6 9L9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </th>
                <th 
                  className="text-left p-3"
                  style={{ 
                    fontFamily: 'var(--font-family-text)', 
                    fontSize: 'var(--text-sm)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--foreground)'
                  }}
                >
                  Location
                </th>
                <th 
                  className="text-left p-3"
                  style={{ 
                    fontFamily: 'var(--font-family-text)', 
                    fontSize: 'var(--text-sm)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--foreground)'
                  }}
                >
                  <button className="flex items-center gap-1 hover:text-primary">
                    Nodes
                    <svg className="size-[12px]" fill="none" viewBox="0 0 12 12">
                      <path d="M6 3V9M3 6L6 9L9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </th>
                <th 
                  className="text-left p-3"
                  style={{ 
                    fontFamily: 'var(--font-family-text)', 
                    fontSize: 'var(--text-sm)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--foreground)'
                  }}
                >
                  IP Address
                </th>
                <th className="text-left p-3" style={{ width: '40px' }} />
              </tr>
            </thead>
            <tbody>
              {filteredClusters.map((cluster, index) => (
                <tr 
                  key={cluster.id}
                  className="hover:bg-secondary/50 transition-colors"
                  style={{ 
                    borderTop: index > 0 ? '1px solid var(--border)' : 'none'
                  }}
                >
                  <td className="p-3">
                    <button
                      onClick={() => handleClusterSelection(cluster.id)}
                      className="size-4 border-2 flex items-center justify-center transition-colors hover:border-primary"
                      style={{
                        borderRadius: 'var(--radius-sm)',
                        borderColor: selectedClusters.includes(cluster.id) ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: selectedClusters.includes(cluster.id) ? 'var(--primary)' : 'transparent',
                      }}
                      aria-label={`Select ${cluster.name}`}
                    >
                      {selectedClusters.includes(cluster.id) && (
                        <svg className="size-2.5" fill="none" viewBox="0 0 12 12">
                          <path 
                            d="M2 6L5 9L10 3" 
                            stroke="var(--primary-foreground)" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                          />
                        </svg>
                      )}
                    </button>
                  </td>
                  <td className="p-3">
                    <Link 
                      to={`/clusters/${cluster.id}`}
                      style={{
                        fontFamily: 'var(--font-family-text)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--primary)',
                        textDecoration: 'none'
                      }}
                      className="hover:underline"
                    >
                      {cluster.name}
                    </Link>
                  </td>
                  <td className="p-3">
                    <Badge variant="secondary">{cluster.type}</Badge>
                  </td>
                  <td className="p-3">
                    <Link 
                      to={`/namespaces/${cluster.namespace}`}
                      style={{
                        fontFamily: 'var(--font-family-text)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--primary)',
                        textDecoration: 'none'
                      }}
                      className="hover:underline"
                    >
                      {cluster.namespace}
                    </Link>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="size-2 rounded-full"
                        style={{ backgroundColor: getStatusColor(cluster.status) }}
                      />
                      <span 
                        style={{ 
                          fontFamily: 'var(--font-family-text)', 
                          fontSize: 'var(--text-sm)',
                          color: getStatusColor(cluster.status), 
                          fontWeight: 'var(--font-weight-medium)' 
                        }}
                      >
                        {cluster.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span style={{ fontFamily: 'var(--font-family-text)', fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                      {cluster.location}
                    </span>
                  </td>
                  <td className="p-3">
                    <span style={{ fontFamily: 'var(--font-family-text)', fontSize: 'var(--text-sm)' }}>
                      {cluster.nodes}
                    </span>
                  </td>
                  <td className="p-3">
                    <span style={{ fontFamily: 'var(--font-family-text)', fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                      {cluster.ipAddress}
                    </span>
                  </td>
                  <td className="p-3">
                    <IconButton aria-label="More options">
                      <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
                        <circle cx="8" cy="3" r="1.5" fill="currentColor" />
                        <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                        <circle cx="8" cy="13" r="1.5" fill="currentColor" />
                      </svg>
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fast Forward / Check Phone Button */}
      {(showFastForwardButton || showCheckPhoneButton) && (
        <div className="mt-6 flex justify-center">
          {showCheckPhoneButton ? (
            <button
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              style={{
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--font-family-text)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
              }}
              onClick={handleCheckPhone}
            >
              <svg className="size-[20px]" fill="none" viewBox="0 0 24 24">
                <rect x="6" y="2" width="12" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Check phone
            </button>
          ) : (
            <button
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              style={{
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--font-family-text)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
              }}
              onClick={handleFastForward}
            >
              <svg className="size-[20px]" fill="none" viewBox="0 0 24 24">
                <path d="M13 5L20 12L13 19M4 5L11 12L4 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Fast forward 30 minutes
            </button>
          )}
        </div>
      )}

      {/* Create Cluster Wizard */}
      {showWizard && (
        <CreateClusterWizard
          onComplete={handleClusterCreation}
          onCancel={() => setShowWizard(false)}
        />
      )}

      {showPlatformSigning && pendingClusterData && (
        <PlatformSigningFlow
          clusterName={pendingClusterData.clusterName ?? 'cluster'}
          onComplete={handlePlatformSigningComplete}
          onCancel={handlePlatformSigningCancel}
        />
      )}

      {/* Smartphone Auth */}
      {showSmartphoneAuth && (
        <SmartphoneAuth
          onAuthorize={handleAuthorize}
        />
      )}

      {/* YAML Confirmation Modal */}
      {showYamlConfirmation && (
        <YamlConfirmationModal
          onAccept={handleYamlAccept}
          onDecline={handleYamlDecline}
          clusterCount={1}
        />
      )}
    </div>
  );
}