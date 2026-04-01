import { useNavigate } from 'react-router';
import { ImageWithFallback } from './figma/ImageWithFallback';
import worldMapImage from '@/assets/fff4bdd8c4a719baa96ecfa44b52f20dcf1ab94d.png';

type ClusterRegion = {
  id: string;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  clusters: {
    name: string;
    status: 'healthy' | 'warning' | 'critical';
  }[];
};

const regions: ClusterRegion[] = [
  {
    id: 'us-east-1',
    name: 'us-east-1',
    displayName: 'US East (N. Virginia)',
    latitude: 37.5,
    longitude: -77.5,
    clusters: [
      { name: 'virt-prod-01', status: 'healthy' },
      { name: 'app-prod-us-east', status: 'healthy' },
    ]
  },
  {
    id: 'us-west-2',
    name: 'us-west-2',
    displayName: 'US West (Oregon)',
    latitude: 45.5,
    longitude: -122.7,
    clusters: [
      { name: 'ml-gpu-cluster', status: 'healthy' },
    ]
  },
  {
    id: 'eu-west-1',
    name: 'eu-west-1',
    displayName: 'EU (Ireland)',
    latitude: 53.3,
    longitude: -6.3,
    clusters: [
      { name: 'app-prod-eu', status: 'critical' },
      { name: 'data-eu-west', status: 'healthy' },
    ]
  },
  {
    id: 'ap-northeast-1',
    name: 'ap-northeast-1',
    displayName: 'Asia Pacific (Tokyo)',
    latitude: 35.7,
    longitude: 139.7,
    clusters: [
      { name: 'app-prod-apac', status: 'healthy' },
    ]
  },
  {
    id: 'ap-southeast-1',
    name: 'ap-southeast-1',
    displayName: 'Asia Pacific (Singapore)',
    latitude: 1.3,
    longitude: 103.8,
    clusters: [
      { name: 'web-prod-sg', status: 'healthy' },
      { name: 'api-prod-sg', status: 'healthy' },
    ]
  },
  {
    id: 'sa-east-1',
    name: 'sa-east-1',
    displayName: 'South America (São Paulo)',
    latitude: -23.5,
    longitude: -46.6,
    clusters: [
      { name: 'app-prod-sa', status: 'healthy' },
    ]
  },
];

function getRegionStatus(clusters: { status: 'healthy' | 'warning' | 'critical' }[]): 'healthy' | 'warning' | 'critical' {
  if (clusters.some(c => c.status === 'critical')) return 'critical';
  if (clusters.some(c => c.status === 'warning')) return 'warning';
  return 'healthy';
}

function getStatusColor(status: 'healthy' | 'warning' | 'critical'): string {
  switch (status) {
    case 'healthy': return '#3E8635';
    case 'warning': return '#F0AB00';
    case 'critical': return '#C9190B';
  }
}

// Convert lat/long to SVG coordinates
function latLongToXY(lat: number, long: number, width: number, height: number): { x: number; y: number } {
  // Mercator projection (simplified)
  const x = ((long + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
}

export function GlobalMapView() {
  const navigate = useNavigate();

  const mapWidth = 1000;
  const mapHeight = 500;

  const handleRegionClick = (regionName: string) => {
    navigate(`/clusters?region=${regionName}`);
  };

  return (
    <div 
      className="bg-card rounded-[var(--radius)] p-6"
      style={{ border: '1px solid var(--border)' }}
    >
      <div className="mb-4">
        <h2 style={{ 
          fontFamily: 'var(--font-family-display)', 
          fontSize: 'var(--text-xl)', 
          fontWeight: 'var(--font-weight-medium)',
          marginBottom: '4px'
        }}>
          Global Cluster Distribution
        </h2>
        <p style={{ 
          fontFamily: 'var(--font-family-text)', 
          fontSize: 'var(--text-sm)', 
          color: 'var(--muted-foreground)'
        }}>
          Click on a region to view clusters
        </p>
      </div>

      {/* Map Container */}
      <div className="relative w-full rounded-[var(--radius)] overflow-hidden" style={{ 
        aspectRatio: '2 / 1',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        {/* Background world map */}
        <div className="absolute inset-0">
          <img 
            src={worldMapImage}
            alt="World Map" 
            className="w-full h-full object-cover opacity-20"
            style={{ 
              filter: 'grayscale(100%) contrast(0.8)',
            }}
          />
        </div>

        {/* Interactive SVG overlay */}
        <svg 
          viewBox={`0 0 ${mapWidth} ${mapHeight}`} 
          className="w-full h-full relative z-10"
        >
          {/* Region bubbles */}
          {regions.map((region) => {
            const { x, y } = latLongToXY(region.latitude, region.longitude, mapWidth, mapHeight);
            const status = getRegionStatus(region.clusters);
            const color = getStatusColor(status);
            const radius = Math.max(15, region.clusters.length * 8);

            return (
              <g 
                key={region.id}
                onClick={() => handleRegionClick(region.name)}
                style={{ cursor: 'pointer' }}
                className="hover:opacity-80 transition-opacity"
              >
                {/* Outer glow */}
                <circle
                  cx={x}
                  cy={y}
                  r={radius + 8}
                  fill={color}
                  opacity="0.1"
                />
                
                {/* Main bubble */}
                <circle
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={color}
                  opacity="0.3"
                  stroke={color}
                  strokeWidth="2"
                />

                {/* Inner circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={radius * 0.6}
                  fill={color}
                  opacity="0.8"
                />

                {/* Cluster count badge */}
                <circle
                  cx={x}
                  cy={y}
                  r={12}
                  fill="white"
                  stroke={color}
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ 
                    fontFamily: 'var(--font-family-text)',
                    fontSize: '12px',
                    fontWeight: 'var(--font-weight-bold)',
                    fill: color
                  }}
                >
                  {region.clusters.length}
                </text>

                {/* Region label */}
                <text
                  x={x}
                  y={y + radius + 20}
                  textAnchor="middle"
                  style={{ 
                    fontFamily: 'var(--font-family-text)',
                    fontSize: '11px',
                    fontWeight: 'var(--font-weight-medium)',
                    fill: 'var(--foreground)'
                  }}
                >
                  {region.displayName}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        {[
          { status: 'healthy' as const, label: 'All clusters healthy' },
          { status: 'warning' as const, label: 'Warnings detected' },
          { status: 'critical' as const, label: 'Critical issues' },
        ].map((item) => (
          <div key={item.status} className="flex items-center gap-2">
            <div 
              className="size-3 rounded-full" 
              style={{ backgroundColor: getStatusColor(item.status) }}
            />
            <span style={{ 
              fontFamily: 'var(--font-family-text)', 
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-foreground)'
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Region Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {regions.map((region) => {
          const status = getRegionStatus(region.clusters);
          const color = getStatusColor(status);
          
          return (
            <button
              key={region.id}
              onClick={() => handleRegionClick(region.name)}
              className="p-3 rounded-[var(--radius)] hover:bg-secondary transition-colors text-left"
              style={{ border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="size-2 rounded-full" 
                  style={{ backgroundColor: color }}
                />
                <span style={{ 
                  fontFamily: 'var(--font-family-text)', 
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--foreground)'
                }}>
                  {region.name}
                </span>
              </div>
              <div style={{ 
                fontFamily: 'var(--font-family-text)', 
                fontSize: 'var(--text-xs)',
                color: 'var(--muted-foreground)'
              }}>
                {region.clusters.length} cluster{region.clusters.length !== 1 ? 's' : ''}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}