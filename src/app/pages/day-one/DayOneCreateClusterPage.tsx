import { useNavigate, useLocation } from 'react-router';
import { ClusterWizard } from '../../../imports/ClusterWizard';
import { DAY_ONE_BASE } from './paths';

export function DayOneCreateClusterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const clusterType = location.pathname.includes('management-cluster')
    ? 'management-cluster'
    : 'virtualization';

  const handleComplete = () => {
    navigate(`${DAY_ONE_BASE}/completion`);
  };

  const handleCancel = () => {
    navigate(`${DAY_ONE_BASE}/welcome`);
  };

  return (
    <ClusterWizard
      clusterType={clusterType}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  );
}
