import { useNavigate } from 'react-router';
import { RestartingScreen } from '../../components/day-one/RestartingScreen';
import { DAY_ONE_BASE } from './paths';

export function DayOneRestartPage() {
  const navigate = useNavigate();

  return (
    <RestartingScreen
      onComplete={() => navigate(`${DAY_ONE_BASE}/login`)}
    />
  );
}
