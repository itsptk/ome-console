import RhStandardInstallIcon from "@patternfly/react-icons/dist/esm/icons/rh-standard-install-icon";
import { createElement, type ReactNode } from "react";
import { CORE_ADDONS, type CoreAddonId } from "../addons/coreAddons";

export type NavAddonStatusLabel = "enable" | "upgrade";

export const NAV_LABEL_ADDON_IDS: Partial<Record<string, CoreAddonId>> = {
  Configuration: "configuration",
  Virtualization: "virtualization",
  Governance: "governance",
  Security: "security",
  Observability: "observability",
};

export function getNavDisplayIcon(
  label: string,
  defaultIcon: ReactNode,
  installedAddons: Set<CoreAddonId>,
  isActive = false,
): ReactNode {
  const addonId = NAV_LABEL_ADDON_IDS[label];
  if (addonId && !installedAddons.has(addonId)) {
    return createElement(RhStandardInstallIcon, {
      style: {
        width: "1.25rem",
        height: "1.25rem",
        color: isActive ? "var(--primary-foreground)" : "var(--foreground)",
      },
      "aria-hidden": true,
    });
  }
  return defaultIcon;
}

export function getNavAddonStatusLabel(
  label: string,
  installedAddons: Set<CoreAddonId>,
): NavAddonStatusLabel | null {
  const addonId = NAV_LABEL_ADDON_IDS[label];
  if (!addonId || installedAddons.has(addonId)) {
    return null;
  }

  if (CORE_ADDONS[addonId].upgradeMessage) {
    return "upgrade";
  }

  return "enable";
}
