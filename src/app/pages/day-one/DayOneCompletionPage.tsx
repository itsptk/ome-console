import { useNavigate } from 'react-router';
import { ClusterSuccessModal } from '../../components/day-one/ClusterSuccessModal';
import dashboardImage from '@/assets/54bfee5b803880f41084eb4d180f0e23146fb47b.png';

export function DayOneCompletionPage() {
  const navigate = useNavigate();

  const goToConsole = () => {
    navigate('/overview');
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${dashboardImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(12px)',
          transform: 'scale(1.1)',
        }}
      />

      <ClusterSuccessModal
        onClose={goToConsole}
        onImportClusters={goToConsole}
        onCreateAnother={goToConsole}
        onExploreCapabilities={goToConsole}
      />
    </div>
  );
}
