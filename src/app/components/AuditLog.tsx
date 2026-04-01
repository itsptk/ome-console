import { SmallText, TinyText, Badge } from '../../imports/UIComponents';

type AuditEntry = {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  resourceType: string;
  outcome: 'success' | 'failed';
  details?: string;
};

export function AuditLog() {
  const auditEntries: AuditEntry[] = [
    {
      id: '1',
      timestamp: '2026-03-17 14:23:15',
      user: 'john.doe@redhat.com',
      action: 'Created',
      resource: 'virt-prod-01',
      resourceType: 'Cluster',
      outcome: 'success',
      details: 'KubeVirt enabled, 3 nodes provisioned'
    },
    {
      id: '2',
      timestamp: '2026-03-17 14:15:42',
      user: 'jane.smith@redhat.com',
      action: 'Updated',
      resource: 'security-policy-01',
      resourceType: 'Policy',
      outcome: 'success',
      details: 'Modified pod security standards'
    },
    {
      id: '3',
      timestamp: '2026-03-17 13:58:03',
      user: 'admin@redhat.com',
      action: 'Deleted',
      resource: 'test-cluster-05',
      resourceType: 'Cluster',
      outcome: 'success',
      details: 'Decommissioned test environment'
    },
    {
      id: '4',
      timestamp: '2026-03-17 13:42:11',
      user: 'john.doe@redhat.com',
      action: 'Created',
      resource: 'webapp-deployment',
      resourceType: 'Application',
      outcome: 'success',
      details: 'Deployed to virt-prod-01'
    },
    {
      id: '5',
      timestamp: '2026-03-17 13:22:47',
      user: 'jane.smith@redhat.com',
      action: 'Updated',
      resource: 'virt-prod-01',
      resourceType: 'Cluster',
      outcome: 'failed',
      details: 'Node scaling failed: insufficient capacity'
    },
    {
      id: '6',
      timestamp: '2026-03-17 12:55:33',
      user: 'admin@redhat.com',
      action: 'Created',
      resource: 'backup-policy-02',
      resourceType: 'Policy',
      outcome: 'success',
      details: 'Scheduled daily backups at 2 AM UTC'
    },
    {
      id: '7',
      timestamp: '2026-03-17 12:31:08',
      user: 'john.doe@redhat.com',
      action: 'Updated',
      resource: 'network-config',
      resourceType: 'Configuration',
      outcome: 'success',
      details: 'Updated firewall rules'
    }
  ];

  return (
    <div className="h-full overflow-y-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-card" style={{ borderBottom: '1px solid var(--border)' }}>
          <tr>
            <th className="text-left py-3 px-4" style={{ fontFamily: 'var(--font-family-text)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--muted-foreground)' }}>
              TIMESTAMP
            </th>
            <th className="text-left py-3 px-4" style={{ fontFamily: 'var(--font-family-text)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--muted-foreground)' }}>
              USER
            </th>
            <th className="text-left py-3 px-4" style={{ fontFamily: 'var(--font-family-text)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--muted-foreground)' }}>
              ACTION
            </th>
            <th className="text-left py-3 px-4" style={{ fontFamily: 'var(--font-family-text)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--muted-foreground)' }}>
              RESOURCE
            </th>
            <th className="text-left py-3 px-4" style={{ fontFamily: 'var(--font-family-text)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--muted-foreground)' }}>
              TYPE
            </th>
            <th className="text-left py-3 px-4" style={{ fontFamily: 'var(--font-family-text)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--muted-foreground)' }}>
              OUTCOME
            </th>
            <th className="text-left py-3 px-4" style={{ fontFamily: 'var(--font-family-text)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--muted-foreground)' }}>
              DETAILS
            </th>
          </tr>
        </thead>
        <tbody>
          {auditEntries.map((entry, index) => (
            <tr
              key={entry.id}
              className="hover:bg-secondary transition-colors"
              style={{
                borderBottom: index !== auditEntries.length - 1 ? '1px solid var(--border)' : 'none'
              }}
            >
              <td className="py-3 px-4">
                <TinyText style={{ fontFamily: 'var(--font-family-mono)' }}>
                  {entry.timestamp}
                </TinyText>
              </td>
              <td className="py-3 px-4">
                <SmallText>{entry.user}</SmallText>
              </td>
              <td className="py-3 px-4">
                <SmallText style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  {entry.action}
                </SmallText>
              </td>
              <td className="py-3 px-4">
                <SmallText style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--primary)' }}>
                  {entry.resource}
                </SmallText>
              </td>
              <td className="py-3 px-4">
                <Badge variant="default">{entry.resourceType}</Badge>
              </td>
              <td className="py-3 px-4">
                <Badge variant={entry.outcome === 'success' ? 'success' : 'destructive'}>
                  {entry.outcome}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <TinyText muted>{entry.details}</TinyText>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
