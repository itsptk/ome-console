import { useNavigate } from "react-router";
import { DayOneConfigurationScreen } from "../../components/day-one/DayOneConfigurationScreen";
import {
  DAY_ONE_CONSOLE_CONFIG_CHANGE,
  DAY_ONE_CONSOLE_CONFIG_KEY,
  type DayOneConsoleConfig,
} from "./dayOneConsoleConfig";
import { DAY_ONE_BASE } from "./paths";

export function DayOneConfigurationPage() {
  const navigate = useNavigate();

  const handleComplete = (config: DayOneConsoleConfig) => {
    sessionStorage.setItem(
      DAY_ONE_CONSOLE_CONFIG_KEY,
      JSON.stringify(config),
    );
    sessionStorage.setItem("dayOneAuthProvider", config.authProvider);
    window.dispatchEvent(new CustomEvent(DAY_ONE_CONSOLE_CONFIG_CHANGE));
    navigate(`${DAY_ONE_BASE}/restart`);
  };

  return <DayOneConfigurationScreen onComplete={handleComplete} />;
}
