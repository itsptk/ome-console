import { useParams, useNavigate } from 'react-router';
import { PageTitle, SectionTitle, BodyText, SmallText, TinyText, StatusDot, Badge } from '../../imports/UIComponents';

type ActivityDetail = {
  id: string;
  action: string;
  resource: string;
  status: 'in-progress' | 'success' | 'error' | 'warning';
  progress?: number;
  initiatedBy: string;
  initiatedAt: string;
  duration?: string;
  affectedClusters: string[];
  description: string;
  timeline: {
    timestamp: string;
    event: string;
    status: 'success' | 'in-progress' | 'error' | 'warning';
    details?: string;
  }[];
};

// Mock data for activity details
const activityData: Record<string, ActivityDetail> = {
  '1': {
    id: '1',
    action: 'Scaling node pool',
    resource: 'virt-prod-01',
    status: 'in-progress',
    progress: 45,
    initiatedBy: 'john.doe@redhat.com',
    initiatedAt: '2026-03-19 14:32:45 UTC',
    affectedClusters: ['virt-prod-01'],
    description: 'Scaling node pool from 3 to 5 nodes to handle increased workload',
    timeline: [
      {
        timestamp: '14:32:45',
        event: 'Operation initiated',
        status: 'success',
        details: 'Started by john.doe@redhat.com'
      },
      {
        timestamp: '14:33:12',
        event: 'Pre-flight checks completed',
        status: 'success',
        details: 'All validation checks passed'
      },
      {
        timestamp: '14:33:45',
        event: 'Provisioning new nodes',
        status: 'in-progress',
        details: 'Creating 2 new compute nodes'
      },
      {
        timestamp: '14:34:20',
        event: 'Node 1 provisioned',
        status: 'success',
        details: 'node-worker-04 is ready'
      },
      {
        timestamp: '14:35:10',
        event: 'Node 2 provisioning',
        status: 'in-progress',
        details: 'node-worker-05 in progress'
      }
    ]
  },
  '2': {
    id: '2',
    action: 'VM migration',
    resource: 'web-server-03',
    status: 'in-progress',
    progress: 78,
    initiatedBy: 'system@redhat.com',
    initiatedAt: '2026-03-19 14:31:00 UTC',
    affectedClusters: ['virt-prod-01', 'virt-prod-02'],
    description: 'Migrating VM web-server-03 from virt-prod-01 to virt-prod-02 for load balancing',
    timeline: [
      {
        timestamp: '14:31:00',
        event: 'Migration initiated',
        status: 'success',
        details: 'Auto-triggered by system scheduler'
      },
      {
        timestamp: '14:31:15',
        event: 'VM snapshot created',
        status: 'success',
        details: 'Created checkpoint on source cluster'
      },
      {
        timestamp: '14:32:00',
        event: 'Data transfer in progress',
        status: 'in-progress',
        details: '78% complete - 22GB transferred'
      },
      {
        timestamp: '14:33:30',
        event: 'Validating target cluster',
        status: 'success',
        details: 'virt-prod-02 has sufficient resources'
      }
    ]
  },
  '3': {
    id: '3',
    action: 'Policy evaluation',
    resource: 'virt-prod-01',
    status: 'warning',
    initiatedBy: 'policy-engine@redhat.com',
    initiatedAt: '2026-03-19 14:30:00 UTC',
    duration: '2 minutes',
    affectedClusters: ['virt-prod-01'],
    description: 'Automated policy compliance check detected configuration warnings',
    timeline: [
      {
        timestamp: '14:30:00',
        event: 'Evaluation started',
        status: 'success',
        details: 'Scheduled policy check initiated'
      },
      {
        timestamp: '14:30:45',
        event: 'Security policies checked',
        status: 'success',
        details: 'All security policies compliant'
      },
      {
        timestamp: '14:31:20',
        event: 'Resource policies checked',
        status: 'warning',
        details: 'CPU utilization above recommended threshold'
      },
      {
        timestamp: '14:32:00',
        event: 'Evaluation completed',
        status: 'warning',
        details: '1 warning found - review recommended'
      }
    ]
  },
  '4': {
    id: '4',
    action: 'Health check',
    resource: 'virt-prod-01',
    status: 'success',
    initiatedBy: 'monitoring@redhat.com',
    initiatedAt: '2026-03-19 14:29:00 UTC',
    duration: '45 seconds',
    affectedClusters: ['virt-prod-01'],
    description: 'Periodic health check of cluster components and services',
    timeline: [
      {
        timestamp: '14:29:00',
        event: 'Health check started',
        status: 'success',
        details: 'Automated health verification'
      },
      {
        timestamp: '14:29:15',
        event: 'Control plane checked',
        status: 'success',
        details: 'All control plane components healthy'
      },
      {
        timestamp: '14:29:30',
        event: 'Worker nodes checked',
        status: 'success',
        details: '3/3 nodes healthy'
      },
      {
        timestamp: '14:29:45',
        event: 'Network connectivity verified',
        status: 'success',
        details: 'All network endpoints reachable'
      },
      {
        timestamp: '14:29:45',
        event: 'Health check completed',
        status: 'success',
        details: 'Cluster is healthy'
      }
    ]
  },
  '5': {
    id: '5',
    action: 'Network configuration update',
    resource: 'node-pool-01',
    status: 'success',
    initiatedBy: 'admin@redhat.com',
    initiatedAt: '2026-03-19 14:28:00 UTC',
    duration: '1 minute 30 seconds',
    affectedClusters: ['virt-prod-01', 'virt-dev-01'],
    description: 'Updated network subnet configuration for node pool',
    timeline: [
      {
        timestamp: '14:28:00',
        event: 'Configuration change initiated',
        status: 'success',
        details: 'Updating subnet configuration'
      },
      {
        timestamp: '14:28:20',
        event: 'Configuration validated',
        status: 'success',
        details: 'New configuration passes validation'
      },
      {
        timestamp: '14:28:45',
        event: 'Applied to virt-prod-01',
        status: 'success',
        details: 'Configuration updated successfully'
      },
      {
        timestamp: '14:29:10',
        event: 'Applied to virt-dev-01',
        status: 'success',
        details: 'Configuration updated successfully'
      },
      {
        timestamp: '14:29:30',
        event: 'Update completed',
        status: 'success',
        details: 'All clusters updated'
      }
    ]
  }
};

export function ActivityDetailPage() {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  
  const activity = activityId ? activityData[activityId] : null;

  if (!activity) {
    return (
      <div className="p-8">
        <BodyText>Activity not found</BodyText>
      </div>
    );
  }

  const statusMap = {
    'in-progress': 'info' as const,
    'success': 'success' as const,
    'error': 'error' as const,
    'warning': 'warning' as const
  };

  return (
    <div className="p-8">
      {/* Header with back button */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-4 hover:opacity-70 transition-opacity"
          style={{
            fontFamily: 'var(--font-family-text)',
            fontSize: 'var(--text-sm)',
            color: 'var(--primary)',
            fontWeight: 'var(--font-weight-medium)'
          }}
        >
          <svg className="size-4" fill="none" viewBox="0 0 16 16">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Activity Stream
        </button>

        <div className="flex items-start justify-between">
          <div>
            <PageTitle>{activity.action}</PageTitle>
            <BodyText muted>{activity.description}</BodyText>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant={statusMap[activity.status]}>
              {activity.status === 'in-progress' ? 'Running' : activity.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Overview card */}
        <div
          className="bg-card border p-6"
          style={{
            borderColor: 'var(--border)',
            borderRadius: 'var(--radius)',
            borderWidth: '1px'
          }}
        >
          <div className="mb-4">
            <TinyText muted style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Overview
            </TinyText>
          </div>
          
          <div className="space-y-4">
            <div>
              <TinyText muted>Resource</TinyText>
              <SmallText
                style={{
                  fontFamily: 'var(--font-family-mono)',
                  color: 'var(--primary)',
                  marginTop: 'var(--spacing-1)'
                }}
              >
                {activity.resource}
              </SmallText>
            </div>

            <div>
              <TinyText muted>Status</TinyText>
              <div className="flex items-center gap-2 mt-1">
                <StatusDot status={statusMap[activity.status]} />
                <SmallText className="capitalize">
                  {activity.status === 'in-progress' ? 'Running' : activity.status}
                </SmallText>
              </div>
            </div>

            {activity.progress !== undefined && (
              <div>
                <TinyText muted>Progress</TinyText>
                <div className="mt-2">
                  <div
                    className="h-2 bg-secondary overflow-hidden mb-2"
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${activity.progress}%` }}
                    />
                  </div>
                  <SmallText>{activity.progress}%</SmallText>
                </div>
              </div>
            )}

            {activity.duration && (
              <div>
                <TinyText muted>Duration</TinyText>
                <SmallText style={{ marginTop: 'var(--spacing-1)' }}>
                  {activity.duration}
                </SmallText>
              </div>
            )}
          </div>
        </div>

        {/* Initiated by card */}
        <div
          className="bg-card border p-6"
          style={{
            borderColor: 'var(--border)',
            borderRadius: 'var(--radius)',
            borderWidth: '1px'
          }}
        >
          <div className="mb-4">
            <TinyText muted style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Initiated By
            </TinyText>
          </div>
          
          <div className="space-y-4">
            <div>
              <TinyText muted>User</TinyText>
              <SmallText style={{ marginTop: 'var(--spacing-1)' }}>
                {activity.initiatedBy}
              </SmallText>
            </div>

            <div>
              <TinyText muted>Timestamp</TinyText>
              <SmallText
                style={{
                  fontFamily: 'var(--font-family-mono)',
                  marginTop: 'var(--spacing-1)'
                }}
              >
                {activity.initiatedAt}
              </SmallText>
            </div>
          </div>
        </div>

        {/* Affected resources card */}
        <div
          className="bg-card border p-6"
          style={{
            borderColor: 'var(--border)',
            borderRadius: 'var(--radius)',
            borderWidth: '1px'
          }}
        >
          <div className="mb-4">
            <TinyText muted style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Affected Clusters
            </TinyText>
          </div>
          
          <div className="space-y-2">
            {activity.affectedClusters.map((cluster) => (
              <div
                key={cluster}
                className="px-3 py-2 bg-secondary"
                style={{ borderRadius: 'var(--radius)' }}
              >
                <SmallText style={{ fontFamily: 'var(--font-family-mono)' }}>
                  {cluster}
                </SmallText>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline section */}
      <div
        className="bg-card border p-6"
        style={{
          borderColor: 'var(--border)',
          borderRadius: 'var(--radius)',
          borderWidth: '1px'
        }}
      >
        <div className="mb-6">
          <SectionTitle>Timeline</SectionTitle>
          <BodyText muted>
            Detailed event history for this operation
          </BodyText>
        </div>

        <div className="space-y-0">
          {activity.timeline.map((event, index) => (
            <div key={index} className="flex gap-4">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div
                  className="size-3 rounded-full"
                  style={{
                    backgroundColor: event.status === 'success' ? 'var(--success)' :
                                   event.status === 'error' ? 'var(--error)' :
                                   event.status === 'warning' ? 'var(--warning)' :
                                   'var(--info)',
                    marginTop: '6px'
                  }}
                />
                {index < activity.timeline.length - 1 && (
                  <div
                    className="w-px flex-1 mt-2 mb-2"
                    style={{
                      backgroundColor: 'var(--border)',
                      minHeight: '40px'
                    }}
                  />
                )}
              </div>

              {/* Event content */}
              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between mb-1">
                  <div
                    style={{
                      fontFamily: 'var(--font-family-text)',
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--foreground)'
                    }}
                  >
                    {event.event}
                  </div>
                  <SmallText
                    muted
                    style={{ fontFamily: 'var(--font-family-mono)' }}
                  >
                    {event.timestamp}
                  </SmallText>
                </div>
                {event.details && (
                  <SmallText muted>{event.details}</SmallText>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
