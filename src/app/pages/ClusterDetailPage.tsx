import { SmallText, TinyText, Badge, SecondaryButton, PrimaryButton, IconButton } from '../../imports/UIComponents';
import { Link, useParams } from 'react-router';
import { useState } from 'react';

export function ClusterDetailPage() {
  const { clusterId } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'logs'>('overview');

  // Mock cluster data - in a real app this would come from an API based on clusterId
  const cluster = {
    id: clusterId,
    name: 'my-virtualmachine-cluster',
    type: 'Virtualization',
    status: 'Healthy',
    version: 'OpenShift 4.16.0',
    nodes: 3,
    cpu: 48,
    memory: '384 GB',
    location: 'US East',
    region: 'us-east-1',
    namespace: 'default',
    ipAddress: '10.128.5.20',
    created: 'Just now',
  };

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

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <Link
          to="/clusters"
          style={{
            fontFamily: 'var(--font-family-text)',
            fontSize: 'var(--text-sm)',
            color: 'var(--primary)',
            textDecoration: 'none',
          }}
          className="hover:underline"
        >
          Clusters
        </Link>
        <svg className="size-[16px]" fill="none" viewBox="0 0 16 16" style={{ color: 'var(--muted-foreground)' }}>
          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span
          style={{
            fontFamily: 'var(--font-family-text)',
            fontSize: 'var(--text-sm)',
            color: 'var(--muted-foreground)',
          }}
        >
          {cluster.name}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1
            className="mb-2"
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'var(--text-3xl)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            {cluster.name}
          </h1>
          <div className="flex items-center gap-3">
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
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                {cluster.status}
              </span>
            </div>
            <span style={{ color: 'var(--muted-foreground)' }}>•</span>
            <Badge variant="secondary">{cluster.type}</Badge>
            <span style={{ color: 'var(--muted-foreground)' }}>•</span>
            <SmallText muted>Created {cluster.created}</SmallText>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SecondaryButton>
            <svg className="size-[16px] mr-2" fill="none" viewBox="0 0 16 16">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
            Actions
          </SecondaryButton>
          <IconButton aria-label="More options">
            <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
              <circle cx="8" cy="3" r="1.5" fill="currentColor" />
              <circle cx="8" cy="8" r="1.5" fill="currentColor" />
              <circle cx="8" cy="13" r="1.5" fill="currentColor" />
            </svg>
          </IconButton>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="border-b mb-6"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className="pb-3 relative"
            style={{
              fontFamily: 'var(--font-family-text)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: activeTab === 'overview' ? 'var(--primary)' : 'var(--muted-foreground)',
            }}
          >
            Overview
            {activeTab === 'overview' && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: 'var(--primary)' }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className="pb-3 relative"
            style={{
              fontFamily: 'var(--font-family-text)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: activeTab === 'logs' ? 'var(--primary)' : 'var(--muted-foreground)',
            }}
          >
            Logs
            {activeTab === 'logs' && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: 'var(--primary)' }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div
              className="bg-card p-4"
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
              }}
            >
              <TinyText muted className="mb-1">Version</TinyText>
              <div
                style={{
                  fontFamily: 'var(--font-family-display)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                {cluster.version}
              </div>
            </div>
            <div
              className="bg-card p-4"
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
              }}
            >
              <TinyText muted className="mb-1">Nodes</TinyText>
              <div
                style={{
                  fontFamily: 'var(--font-family-display)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                {cluster.nodes}
              </div>
            </div>
            <div
              className="bg-card p-4"
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
              }}
            >
              <TinyText muted className="mb-1">CPU Cores</TinyText>
              <div
                style={{
                  fontFamily: 'var(--font-family-display)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                {cluster.cpu}
              </div>
            </div>
            <div
              className="bg-card p-4"
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
              }}
            >
              <TinyText muted className="mb-1">Memory</TinyText>
              <div
                style={{
                  fontFamily: 'var(--font-family-display)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                {cluster.memory}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div
            className="bg-card p-6"
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
            }}
          >
            <h2
              className="mb-4"
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              Cluster Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <TinyText muted className="mb-1">Location</TinyText>
                <SmallText style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  {cluster.location}
                </SmallText>
              </div>
              <div>
                <TinyText muted className="mb-1">Region</TinyText>
                <SmallText style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  {cluster.region}
                </SmallText>
              </div>
              <div>
                <TinyText muted className="mb-1">Namespace</TinyText>
                <Link
                  to={`/namespaces/${cluster.namespace}`}
                  style={{
                    fontFamily: 'var(--font-family-text)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--primary)',
                    textDecoration: 'none',
                    fontWeight: 'var(--font-weight-medium)',
                  }}
                  className="hover:underline"
                >
                  {cluster.namespace}
                </Link>
              </div>
              <div>
                <TinyText muted className="mb-1">IP Address</TinyText>
                <SmallText style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  {cluster.ipAddress}
                </SmallText>
              </div>
            </div>
          </div>

          {/* Resource Usage */}
          <div
            className="bg-card p-6"
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
            }}
          >
            <h2
              className="mb-4"
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              Resource Usage
            </h2>
            <div className="space-y-4">
              {/* CPU Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <TinyText>CPU</TinyText>
                  <TinyText muted>65% utilized</TinyText>
                </div>
                <div
                  className="h-2 overflow-hidden"
                  style={{
                    backgroundColor: 'var(--secondary)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <div
                    className="h-full"
                    style={{
                      backgroundColor: 'var(--primary)',
                      width: '65%',
                    }}
                  />
                </div>
              </div>

              {/* Memory Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <TinyText>Memory</TinyText>
                  <TinyText muted>72% utilized</TinyText>
                </div>
                <div
                  className="h-2 overflow-hidden"
                  style={{
                    backgroundColor: 'var(--secondary)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <div
                    className="h-full"
                    style={{
                      backgroundColor: 'var(--primary)',
                      width: '72%',
                    }}
                  />
                </div>
              </div>

              {/* Storage Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <TinyText>Storage</TinyText>
                  <TinyText muted>48% utilized</TinyText>
                </div>
                <div
                  className="h-2 overflow-hidden"
                  style={{
                    backgroundColor: 'var(--secondary)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <div
                    className="h-full"
                    style={{
                      backgroundColor: 'var(--primary)',
                      width: '48%',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Logs Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 px-3 h-9 bg-card hover:bg-secondary transition-colors"
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'var(--font-family-text)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
                  <path d="M2 5L8 11L14 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Last 1 hour
              </button>
              <button
                className="flex items-center gap-2 px-3 h-9 bg-card hover:bg-secondary transition-colors"
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'var(--font-family-text)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
                  <path d="M13 3L3 13M3 3L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Clear filters
              </button>
            </div>
            <div className="flex items-center gap-2">
              <IconButton aria-label="Refresh logs">
                <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
                  <path d="M13.65 2.35C12.2 0.9 10.2 0 8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C11.73 16 14.84 13.45 15.73 10H13.65C12.83 12.33 10.61 14 8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2C9.66 2 11.14 2.69 12.22 3.78L9 7H16V0L13.65 2.35Z" fill="currentColor" />
                </svg>
              </IconButton>
              <IconButton aria-label="Download logs">
                <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
                  <path d="M14 11V14H2V11H0V14C0 15.1 0.9 16 2 16H14C15.1 16 16 15.1 16 14V11H14ZM13 7L11.59 5.59L9 8.17V0H7V8.17L4.41 5.59L3 7L8 12L13 7Z" fill="currentColor" />
                </svg>
              </IconButton>
            </div>
          </div>

          {/* Logs Container */}
          <div
            className="bg-card overflow-hidden"
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
            }}
          >
            {/* Logs Header */}
            <div
              className="flex items-center px-4 py-2 border-b"
              style={{
                backgroundColor: 'var(--secondary)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="w-[180px]">
                <TinyText style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  Timestamp
                </TinyText>
              </div>
              <div className="w-[80px]">
                <TinyText style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  Level
                </TinyText>
              </div>
              <div className="w-[160px]">
                <TinyText style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  User
                </TinyText>
              </div>
              <div className="flex-1">
                <TinyText style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  Message
                </TinyText>
              </div>
            </div>

            {/* Logs Body */}
            <div className="overflow-auto" style={{ maxHeight: '600px' }}>
              {[
                { time: '14:35:50', level: 'INFO', user: 'Adi Cluster Admin', message: 'Cluster is now healthy and ready', service: 'cluster-controller' },
                { time: '14:35:45', level: 'INFO', user: 'system', message: 'All health checks passed', service: 'health-monitor' },
                { time: '14:35:40', level: 'INFO', user: 'system', message: 'Cluster networking configured', service: 'network-operator' },
                { time: '14:35:25', level: 'INFO', user: 'Adi Cluster Admin', message: 'Configuring cluster networking', service: 'network-operator' },
                { time: '14:35:20', level: 'INFO', user: 'system', message: 'OpenShift Virtualization operator installed', service: 'olm' },
                { time: '14:33:50', level: 'INFO', user: 'Adi Cluster Admin', message: 'Installing OpenShift components', service: 'cluster-installer' },
                { time: '14:33:45', level: 'INFO', user: 'system', message: 'Control plane nodes provisioned successfully', service: 'machine-api' },
                { time: '14:32:30', level: 'INFO', user: 'Adi Cluster Admin', message: 'Provisioning control plane nodes (3)', service: 'machine-api' },
                { time: '14:32:25', level: 'INFO', user: 'system', message: 'Network validation successful', service: 'network-validator' },
                { time: '14:32:20', level: 'WARN', user: 'system', message: 'Validating network settings - checking for conflicts', service: 'network-validator' },
                { time: '14:32:15', level: 'INFO', user: 'Adi Cluster Admin', message: 'Loading configuration from cluster-config.yaml', service: 'config-loader' },
                { time: '14:32:10', level: 'INFO', user: 'Adi Cluster Admin', message: 'Cluster initialization started', service: 'cluster-controller' },
              ].map((log, index) => {
                const getLevelColor = (level: string) => {
                  switch (level) {
                    case 'ERROR':
                      return '#C9190B';
                    case 'WARN':
                      return '#F0AB00';
                    case 'INFO':
                      return '#0066CC';
                    case 'DEBUG':
                      return 'var(--muted-foreground)';
                    default:
                      return 'var(--foreground)';
                  }
                };

                const getLevelBg = (level: string) => {
                  switch (level) {
                    case 'ERROR':
                      return 'rgba(201, 25, 11, 0.1)';
                    case 'WARN':
                      return 'rgba(240, 171, 0, 0.1)';
                    case 'INFO':
                      return 'rgba(0, 102, 204, 0.1)';
                    case 'DEBUG':
                      return 'var(--secondary)';
                    default:
                      return 'transparent';
                  }
                };

                return (
                  <div
                    key={index}
                    className="flex items-start px-4 py-2.5 hover:bg-secondary/50 transition-colors border-b"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {/* Timestamp */}
                    <div className="w-[180px] flex-shrink-0">
                      <span
                        style={{
                          fontFamily: "'Courier New', Courier, monospace",
                          fontSize: 'var(--text-xs)',
                          color: 'var(--muted-foreground)',
                        }}
                      >
                        2026-03-31 {log.time}
                      </span>
                    </div>

                    {/* Level */}
                    <div className="w-[80px] flex-shrink-0">
                      <span
                        className="px-2 py-0.5 inline-block"
                        style={{
                          fontFamily: "'Courier New', Courier, monospace",
                          fontSize: 'var(--text-xs)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: getLevelColor(log.level),
                          backgroundColor: getLevelBg(log.level),
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {log.level}
                      </span>
                    </div>

                    {/* User */}
                    <div className="w-[160px] flex-shrink-0">
                      <span
                        style={{
                          fontFamily: 'var(--font-family-text)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--foreground)',
                          fontWeight: 'var(--font-weight-medium)',
                        }}
                      >
                        {log.user}
                      </span>
                    </div>

                    {/* Message */}
                    <div className="flex-1">
                      <div className="flex flex-col gap-1">
                        <span
                          style={{
                            fontFamily: "'Courier New', Courier, monospace",
                            fontSize: 'var(--text-xs)',
                            color: 'var(--foreground)',
                            lineHeight: '1.5',
                          }}
                        >
                          {log.message}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-family-text)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--muted-foreground)',
                          }}
                        >
                          service: {log.service}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Logs Footer */}
            <div
              className="flex items-center justify-between px-4 py-2 border-t"
              style={{
                backgroundColor: 'var(--secondary)',
                borderColor: 'var(--border)',
              }}
            >
              <TinyText muted>
                Showing 12 of 12 log entries
              </TinyText>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 h-7 bg-card hover:bg-secondary/80 transition-colors"
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    fontFamily: 'var(--font-family-text)',
                    fontSize: 'var(--text-xs)',
                  }}
                >
                  Load more
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}