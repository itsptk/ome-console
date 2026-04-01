import { CardTitle, SmallText, TinyText, LabelText, Badge, IconButton, SecondaryButton, Divider } from '../../imports/UIComponents';

type Alert = {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  category: string;
  resource?: string;
  actionable?: boolean;
};

type AlertsPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AlertsPanel({ isOpen, onClose }: AlertsPanelProps) {
  const alerts: Alert[] = [
    {
      id: '1',
      severity: 'critical',
      title: 'Pod Security Policy Violation',
      description: 'Container running as root in production namespace. This violates security policy SEC-001.',
      timestamp: '5 minutes ago',
      category: 'Security',
      resource: 'virt-prod-01/default/webapp-deployment',
      actionable: true
    },
    {
      id: '2',
      severity: 'warning',
      title: 'Resource Quota Exceeded',
      description: 'Memory usage at 95% of allocated quota. Consider scaling or optimizing workloads.',
      timestamp: '12 minutes ago',
      category: 'Resource Management',
      resource: 'virt-prod-01',
      actionable: true
    },
    {
      id: '3',
      severity: 'warning',
      title: 'Network Policy Not Applied',
      description: 'Default namespace lacks network policy. Traffic is not restricted between pods.',
      timestamp: '1 hour ago',
      category: 'Security',
      resource: 'virt-prod-01/default',
      actionable: true
    },
    {
      id: '4',
      severity: 'info',
      title: 'Certificate Expiring Soon',
      description: 'TLS certificate for ingress controller expires in 30 days.',
      timestamp: '2 hours ago',
      category: 'Infrastructure',
      resource: 'virt-prod-01/ingress-nginx',
      actionable: false
    },
    {
      id: '5',
      severity: 'info',
      title: 'Cluster Update Available',
      description: 'OpenShift 4.15.3 is available. Current version: 4.15.2.',
      timestamp: '3 hours ago',
      category: 'Updates',
      resource: 'virt-prod-01',
      actionable: true
    },
    {
      id: '6',
      severity: 'warning',
      title: 'High CPU Usage Detected',
      description: 'Node cpu-usage sustained above 80% for the last 15 minutes.',
      timestamp: '4 hours ago',
      category: 'Performance',
      resource: 'virt-prod-01/node-1',
      actionable: false
    }
  ];

  const severityConfig = {
    critical: {
      color: '#C9190B',
      bgColor: 'rgba(201, 25, 11, 0.1)',
      label: 'Critical',
      icon: (
        <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 4V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="8" cy="11" r="0.5" fill="currentColor" />
        </svg>
      )
    },
    warning: {
      color: '#F0AB00',
      bgColor: 'rgba(240, 171, 0, 0.1)',
      label: 'Warning',
      icon: (
        <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
          <path d="M8 2L14 13H2L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 6V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="8" cy="11" r="0.5" fill="currentColor" />
        </svg>
      )
    },
    info: {
      color: '#0066CC',
      bgColor: 'rgba(0, 102, 204, 0.1)',
      label: 'Info',
      icon: (
        <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 8V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="8" cy="5.5" r="0.5" fill="currentColor" />
        </svg>
      )
    }
  };

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;
  const infoCount = alerts.filter(a => a.severity === 'info').length;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[480px] bg-card border-l z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <CardTitle className="mb-2">Alerts & Notifications</CardTitle>
                <SmallText muted>
                  {alerts.length} active alert{alerts.length !== 1 ? 's' : ''} requiring attention
                </SmallText>
              </div>
              <IconButton aria-label="Close" onClick={onClose}>
                <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                </svg>
              </IconButton>
            </div>

            {/* Summary Stats */}
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div style={{ color: severityConfig.critical.color }}>
                    {severityConfig.critical.icon}
                  </div>
                  <TinyText style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {criticalCount} Critical
                  </TinyText>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div style={{ color: severityConfig.warning.color }}>
                    {severityConfig.warning.icon}
                  </div>
                  <TinyText style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {warningCount} Warning
                  </TinyText>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div style={{ color: severityConfig.info.color }}>
                    {severityConfig.info.icon}
                  </div>
                  <TinyText style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {infoCount} Info
                  </TinyText>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts List */}
          <div className="flex-1 overflow-y-auto">
            {alerts.map((alert, index) => {
              const config = severityConfig[alert.severity];
              return (
                <div key={alert.id}>
                  <div className="p-6 hover:bg-secondary transition-colors">
                    {/* Alert Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="p-2 rounded"
                        style={{
                          backgroundColor: config.bgColor,
                          color: config.color,
                          borderRadius: 'var(--radius)'
                        }}
                      >
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <SmallText style={{ fontWeight: 'var(--font-weight-medium)' }}>
                            {alert.title}
                          </SmallText>
                          <TinyText muted className="whitespace-nowrap">
                            {alert.timestamp}
                          </TinyText>
                        </div>
                        <TinyText muted className="mb-2">
                          {alert.description}
                        </TinyText>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge variant="default">{alert.category}</Badge>
                          {alert.resource && (
                            <TinyText
                              muted
                              style={{ fontFamily: 'var(--font-family-mono)' }}
                              className="truncate"
                            >
                              {alert.resource}
                            </TinyText>
                          )}
                        </div>

                        {/* Actions */}
                        {alert.actionable && (
                          <div className="flex gap-2">
                            <SecondaryButton className="text-xs px-3 py-1.5">
                              View Details
                            </SecondaryButton>
                            <SecondaryButton className="text-xs px-3 py-1.5">
                              Resolve
                            </SecondaryButton>
                            <button
                              className="text-xs px-3 py-1.5 hover:bg-secondary transition-colors"
                              style={{
                                fontFamily: 'var(--font-family-text)',
                                fontSize: 'var(--text-xs)',
                                fontWeight: 'var(--font-weight-medium)',
                                borderRadius: 'var(--radius)',
                                color: 'var(--muted-foreground)'
                              }}
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {index < alerts.length - 1 && <Divider />}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
            <SecondaryButton className="w-full">
              View All Alerts History
            </SecondaryButton>
          </div>
        </div>
      </div>
    </>
  );
}
