import { useNavigate } from 'react-router';
import { DayOneConfigurationScreen } from '../../components/day-one/DayOneConfigurationScreen';
import { DAY_ONE_BASE } from './paths';

export function DayOneConfigurationPage() {
  const navigate = useNavigate();

  const handleComplete = (selectedAuthProvider: string) => {
    sessionStorage.setItem('dayOneAuthProvider', selectedAuthProvider);
    navigate(`${DAY_ONE_BASE}/restart`);
  };

  return <DayOneConfigurationScreen onComplete={handleComplete} />;
}
