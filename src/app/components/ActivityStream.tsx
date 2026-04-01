import { SmallText, TinyText, StatusDot } from '../../imports/UIComponents';
import { useNavigate } from 'react-router';

type Activity = {
  id: string;
  action: string;
  resource: string;
  status: 'in-progress' | 'success' | 'error' | 'warning';
  timestamp: string;
  progress?: number;
};

export function ActivityStream() {
  const navigate = useNavigate();
  
  const activities: Activity[] = [
    {
      id: '1',
      action: 'Scaling node pool',
      resource: 'virt-prod-01',
      status: 'in-progress',
      timestamp: '2 seconds ago',
      progress: 45
    },
    {
      id: '2',
      action: 'VM migration',
      resource: 'web-server-03',
      status: 'in-progress',
      timestamp: '15 seconds ago',
      progress: 78
    },
    {
      id: '3',
      action: 'Policy evaluation',
      resource: 'virt-prod-01',
      status: 'warning',
      timestamp: '1 minute ago'
    },
    {
      id: '4',
      action: 'Health check',
      resource: 'virt-prod-01',
      status: 'success',
      timestamp: '2 minutes ago'
    },
    {
      id: '5',
      action: 'Network configuration update',
      resource: 'node-pool-01',
      status: 'success',
      timestamp: '3 minutes ago'
    }
  ];

  const statusMap = {
    'in-progress': 'info' as const,
    'success': 'success' as const,
    'error': 'error' as const,
    'warning': 'warning' as const
  };

  return (
    <div className="h-full overflow-y-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-card" style={{ borderBottom: '1px solid var(--border)' }}>
          <tr>
            <th className="text-left py-3 px-4" style={{ fontFamily: 'var(--font-family-text)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--muted-foreground)' }}>
              STATUS
            </th>
            <th className="text-left py-3 px-4" style={{ fontFamily: 'var(--font-family-text)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--muted-foreground)' }}>
              ACTION
            </th>
            <th className="text-left py-3 px-4" style={{ fontFamily: 'var(--font-family-text)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--muted-foreground)' }}>
              RESOURCE
            </th>
            <th className="text-left py-3 px-4" style={{ fontFamily: 'var(--font-family-text)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--muted-foreground)' }}>
              TIME
            </th>
            <th className="text-left py-3 px-4" style={{ fontFamily: 'var(--font-family-text)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--muted-foreground)' }}>
              PROGRESS
            </th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity, index) => (
            <tr
              key={activity.id}
              onClick={() => navigate(`/activity/${activity.id}`)}
              className="hover:bg-secondary transition-colors cursor-pointer"
              style={{
                borderBottom: index !== activities.length - 1 ? '1px solid var(--border)' : 'none'
              }}
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <StatusDot status={statusMap[activity.status]} />
                  <TinyText className="capitalize">
                    {activity.status === 'in-progress' ? 'Running' : activity.status}
                  </TinyText>
                </div>
              </td>
              <td className="py-3 px-4">
                <SmallText>{activity.action}</SmallText>
              </td>
              <td className="py-3 px-4">
                <SmallText style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--primary)' }}>
                  {activity.resource}
                </SmallText>
              </td>
              <td className="py-3 px-4">
                <TinyText muted>{activity.timestamp}</TinyText>
              </td>
              <td className="py-3 px-4">
                {activity.progress !== undefined ? (
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${activity.progress}%` }}
                      />
                    </div>
                    <TinyText muted>{activity.progress}%</TinyText>
                  </div>
                ) : (
                  <span style={{ color: 'var(--muted-foreground)' }}>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}