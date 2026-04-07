import { useNavigate } from 'react-router';
import { WelcomeScreen } from '../../components/day-one/WelcomeScreen';
import { DAY_ONE_BASE } from './paths';

export function DayOneWelcomePage() {
  const navigate = useNavigate();

  const handleCreateCluster = (type: string) => {
    const routeMap: Record<string, string> = {
      virtualization: `${DAY_ONE_BASE}/create-cluster/virtualization`,
      'ai-ml': `${DAY_ONE_BASE}/create-cluster/virtualization`,
      'app-dev': `${DAY_ONE_BASE}/create-cluster/virtualization`,
      'bare-metal': `${DAY_ONE_BASE}/create-cluster/virtualization`,
      'management-cluster': `${DAY_ONE_BASE}/create-cluster/management-cluster`,
    };

    const route =
      routeMap[type] ?? `${DAY_ONE_BASE}/create-cluster/virtualization`;
    navigate(route);
  };

  return (
    <WelcomeScreen
      onSkip={() => navigate('/overview')}
      onCreateCluster={handleCreateCluster}
    />
  );
}
