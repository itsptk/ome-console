import { CompactCard, TinyText, IconContainer } from '../../imports/UIComponents';

export function ClusterMetrics() {
  const metrics = [
    {
      label: 'Total Clusters',
      value: '1',
      change: '+0%',
      changeType: 'neutral' as const,
      icon: (
        <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
          <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="5" y="5" width="4" height="4" rx="1" fill="currentColor" />
          <rect x="11" y="5" width="4" height="4" rx="1" fill="currentColor" />
          <rect x="5" y="11" width="4" height="4" rx="1" fill="currentColor" />
          <rect x="11" y="11" width="4" height="4" rx="1" fill="currentColor" />
        </svg>
      ),
    },
    {
      label: 'Running VMs',
      value: '12',
      change: '+3 this week',
      changeType: 'positive' as const,
      icon: (
        <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
          <rect x="2" y="4" width="16" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2 7 H18" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="4" cy="5.5" r="0.8" fill="currentColor" />
          <circle cx="6" cy="5.5" r="0.8" fill="currentColor" />
          <circle cx="8" cy="5.5" r="0.8" fill="currentColor" />
          <path d="M6 10 L8 12 L12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: 'Healthy Nodes',
      value: '3/3',
      change: '100%',
      changeType: 'positive' as const,
      icon: (
        <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 10 L9 12 L13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: 'Policy Violations',
      value: '3',
      change: '-2 this week',
      changeType: 'positive' as const,
      icon: (
        <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
          <path
            d="M10 2L3 5v5c0 4.5 3 7 7 8.5 4-1.5 7-4 7-8.5V5l-7-3z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="10" cy="10" r="1.5" fill="currentColor" />
          <path d="M10 7 V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      {metrics.map((metric) => (
        <CompactCard key={metric.label}>
          <div className="flex items-start justify-between mb-3">
            <IconContainer
              size="sm"
              bgColor="rgba(0, 102, 204, 0.1)"
              color="var(--primary)"
            >
              {metric.icon}
            </IconContainer>
            <TinyText
              className={`px-2 py-1 rounded-full ${
                metric.changeType === 'positive'
                  ? 'bg-[#e8f5e9] text-[#2e7d32]'
                  : metric.changeType === 'negative'
                  ? 'bg-[#ffebee] text-[#c62828]'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {metric.change}
            </TinyText>
          </div>
          <div
            className="mb-1"
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            {metric.value}
          </div>
          <TinyText muted>{metric.label}</TinyText>
        </CompactCard>
      ))}
    </div>
  );
}