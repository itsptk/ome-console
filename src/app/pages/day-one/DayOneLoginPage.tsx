import { useNavigate } from 'react-router';
import { LoginScreen } from '../../components/day-one/LoginScreen';
import { DAY_ONE_BASE } from './paths';

export function DayOneLoginPage() {
  const navigate = useNavigate();

  return (
    <LoginScreen onComplete={() => navigate(`${DAY_ONE_BASE}/welcome`)} />
  );
}
