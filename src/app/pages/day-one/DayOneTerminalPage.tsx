import { useNavigate } from 'react-router';
import { TerminalScreen } from '../../components/day-one/TerminalScreen';
import { DAY_ONE_BASE } from './paths';

export function DayOneTerminalPage() {
  const navigate = useNavigate();

  return (
    <TerminalScreen
      onComplete={() => navigate(`${DAY_ONE_BASE}/configuration`)}
    />
  );
}
