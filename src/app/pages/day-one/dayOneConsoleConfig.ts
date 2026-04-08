export type SigningKeyRegistry = "platform" | "external";

export type ExternalRegistryProvider = "github" | "gitlab" | "other";

export type ClaimMappingMode = "default" | "custom";

/** Persisted day-one console choices (prototype; no backend). */
export interface DayOneConsoleConfig {
  backingStore: string;
  authProvider: string;
  authConfigType: "manual" | "automated";
  issuerUrl: string;
  clientId: string;
  signingKeyRegistry: SigningKeyRegistry;
  externalRegistryProvider?: ExternalRegistryProvider;
  externalRegistryRef?: string;
  claimMappingMode: ClaimMappingMode;
  /** When mode is custom: OIDC token claim name used for console username (e.g. sub). */
  claimMappingCustom?: string;
  /** Prototype: user attests key is published at external provider; ignored for platform registry. */
  signingKeyPublished?: boolean;
}

export const DAY_ONE_CONSOLE_CONFIG_KEY = "dayOneConsoleConfig";

/** Dispatched on same-tab updates (storage event only covers other tabs). */
export const DAY_ONE_CONSOLE_CONFIG_CHANGE = "ome-dayOneConsoleConfig-change";

export function readDayOneConsoleConfig(): DayOneConsoleConfig | undefined {
  try {
    const raw = sessionStorage.getItem(DAY_ONE_CONSOLE_CONFIG_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as DayOneConsoleConfig;
    if (!parsed || typeof parsed !== "object") return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

export function writeDayOneConsoleConfig(
  patch: Partial<DayOneConsoleConfig>,
): boolean {
  const current = readDayOneConsoleConfig();
  if (!current) return false;
  const next = { ...current, ...patch };
  sessionStorage.setItem(DAY_ONE_CONSOLE_CONFIG_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(DAY_ONE_CONSOLE_CONFIG_CHANGE));
  return true;
}

/** Read-only mode: external registry and key not yet marked published. */
export function deriveReadOnlyMode(
  config: DayOneConsoleConfig | undefined,
): boolean {
  if (!config) return false;
  return (
    config.signingKeyRegistry === "external" &&
    config.signingKeyPublished !== true
  );
}

export function externalRegistryDisplayName(
  provider: ExternalRegistryProvider | undefined,
): string {
  switch (provider) {
    case "github":
      return "GitHub";
    case "gitlab":
      return "GitLab";
    case "other":
      return "your configured registry";
    default:
      return "your configured registry";
  }
}
