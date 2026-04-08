import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DAY_ONE_CONSOLE_CONFIG_CHANGE,
  deriveReadOnlyMode,
  externalRegistryDisplayName,
  readDayOneConsoleConfig,
  type DayOneConsoleConfig,
} from "../pages/day-one/dayOneConsoleConfig";

export type ConsoleCapabilities = {
  config: DayOneConsoleConfig | undefined;
  isReadOnlyMode: boolean;
  externalProviderLabel: string;
};

function computeCapabilities(): ConsoleCapabilities {
  const config = readDayOneConsoleConfig();
  const isReadOnlyMode = deriveReadOnlyMode(config);
  const externalProviderLabel = externalRegistryDisplayName(
    config?.externalRegistryProvider,
  );
  return { config, isReadOnlyMode, externalProviderLabel };
}

const ConsoleCapabilitiesContext = createContext<ConsoleCapabilities | null>(
  null,
);

export function ConsoleCapabilitiesProvider({ children }: { children: ReactNode }) {
  const [caps, setCaps] = useState<ConsoleCapabilities>(computeCapabilities);

  useEffect(() => {
    const sync = () => setCaps(computeCapabilities());
    window.addEventListener("storage", sync);
    window.addEventListener(DAY_ONE_CONSOLE_CONFIG_CHANGE, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(DAY_ONE_CONSOLE_CONFIG_CHANGE, sync);
    };
  }, []);

  return (
    <ConsoleCapabilitiesContext.Provider value={caps}>
      {children}
    </ConsoleCapabilitiesContext.Provider>
  );
}

export function useConsoleCapabilities(): ConsoleCapabilities {
  const ctx = useContext(ConsoleCapabilitiesContext);
  if (!ctx) {
    throw new Error(
      "useConsoleCapabilities must be used within ConsoleCapabilitiesProvider",
    );
  }
  return ctx;
}
