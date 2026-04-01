import svgPaths from "../../imports/svg-uh8wdes5mv";
import {
  Card,
  CardTitle,
  SmallText,
  TinyText,
  LabelText,
  IconContainer,
  Badge,
  StatusDot,
  PrimaryButton,
  SecondaryButton,
  IconButton,
  Divider,
  ProgressBar
} from '../../imports/UIComponents';

type ClusterCardProps = {
  name: string;
  type: string;
  status: string;
  statusColor: string;
  tags: string[];
  nodes: number;
  version: string;
  region: string;
  provider: string;
  cpu: { used: number; total: number };
  memory: { used: number; total: number };
};

export function ClusterCard({
  name,
  type,
  status,
  statusColor,
  tags,
  nodes,
  version,
  region,
  provider,
  cpu,
  memory,
}: ClusterCardProps) {
  const cpuPercentage = (cpu.used / cpu.total) * 100;
  const memoryPercentage = (memory.used / memory.total) * 100;

  // Determine status type based on status string
  const statusType = status === 'Ready' ? 'success' : status === 'Error' ? 'error' : 'info';

  return (
    <Card className="p-0 overflow-hidden">
      {/* Header */}
      <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Cluster Icon */}
            <IconContainer bgColor="rgba(0,102,204,0.1)" color="#0066CC">
              <svg className="size-[24px]" fill="none" viewBox="0 0 24 24">
                <path
                  d={svgPaths.paeacc80}
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d={svgPaths.p2bde6700}
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="M1 11V1"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  transform="translate(11, 10.5)"
                />
              </svg>
            </IconContainer>

            {/* Cluster Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <CardTitle className="mb-0">{name}</CardTitle>
                <div className="flex items-center gap-2">
                  <StatusDot status={statusType} />
                  <SmallText style={{ fontWeight: 'var(--font-weight-medium)' }}>{status}</SmallText>
                </div>
              </div>
              <SmallText muted>{type}</SmallText>
              
              {/* Tags */}
              <div className="flex gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="success">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Action Menu */}
          <IconButton aria-label="More options">
            <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
              <circle cx="10" cy="4" r="1.5" fill="currentColor" />
              <circle cx="10" cy="10" r="1.5" fill="currentColor" />
              <circle cx="10" cy="16" r="1.5" fill="currentColor" />
            </svg>
          </IconButton>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <LabelText className="mb-1">Provider</LabelText>
          <SmallText style={{ fontWeight: 'var(--font-weight-medium)' }}>{provider}</SmallText>
        </div>
        <div>
          <LabelText className="mb-1">Region</LabelText>
          <SmallText style={{ fontWeight: 'var(--font-weight-medium)' }}>{region}</SmallText>
        </div>
        <div>
          <LabelText className="mb-1">Version</LabelText>
          <SmallText style={{ fontWeight: 'var(--font-weight-medium)' }}>{version}</SmallText>
        </div>
        <div>
          <LabelText className="mb-1">Nodes</LabelText>
          <SmallText style={{ fontWeight: 'var(--font-weight-medium)' }}>{nodes}</SmallText>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CPU Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <SmallText style={{ fontWeight: 'var(--font-weight-medium)' }}>CPU Usage</SmallText>
              <TinyText muted>
                {cpu.used} / {cpu.total} cores
              </TinyText>
            </div>
            <ProgressBar progress={cpuPercentage} />
            <TinyText muted className="mt-1">
              {cpuPercentage.toFixed(1)}% utilized
            </TinyText>
          </div>

          {/* Memory Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <SmallText style={{ fontWeight: 'var(--font-weight-medium)' }}>Memory Usage</SmallText>
              <TinyText muted>
                {memory.used} GB / {memory.total} GB
              </TinyText>
            </div>
            <div
              className="w-full h-2 bg-muted rounded-full overflow-hidden"
              style={{ borderRadius: 'var(--radius-xl)' }}
            >
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${memoryPercentage}%`,
                  backgroundColor: 'var(--chart-2)'
                }}
              />
            </div>
            <TinyText muted className="mt-1">
              {memoryPercentage.toFixed(1)}% utilized
            </TinyText>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-5 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
          <PrimaryButton className="flex-1">
            Manage Cluster
          </PrimaryButton>
          <SecondaryButton>
            View VMs
          </SecondaryButton>
          <SecondaryButton>
            Logs
          </SecondaryButton>
        </div>
      </div>
    </Card>
  );
}