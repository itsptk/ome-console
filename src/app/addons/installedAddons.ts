import { useEffect, useState } from "react";
import type { CoreAddonId } from "./coreAddons";

export const INSTALLED_ADDONS_STORAGE_KEY = "ome-installed-addons";
export const INSTALLED_ADDONS_CHANGE = "ome-installed-addons-change";

function readInstalledAddonIds(): Set<CoreAddonId> {
  try {
    const raw = localStorage.getItem(INSTALLED_ADDONS_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(
      parsed.filter((id): id is CoreAddonId => typeof id === "string"),
    );
  } catch {
    return new Set();
  }
}

function writeInstalledAddonIds(ids: Set<CoreAddonId>): void {
  localStorage.setItem(
    INSTALLED_ADDONS_STORAGE_KEY,
    JSON.stringify([...ids]),
  );
  window.dispatchEvent(new CustomEvent(INSTALLED_ADDONS_CHANGE));
}

export function isAddonInstalled(addonId: CoreAddonId): boolean {
  return readInstalledAddonIds().has(addonId);
}

export function installAddon(addonId: CoreAddonId): void {
  const next = readInstalledAddonIds();
  next.add(addonId);
  writeInstalledAddonIds(next);
}

export function useInstalledAddons(): Set<CoreAddonId> {
  const [installed, setInstalled] = useState(() => readInstalledAddonIds());

  useEffect(() => {
    const sync = () => setInstalled(readInstalledAddonIds());
    window.addEventListener(INSTALLED_ADDONS_CHANGE, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(INSTALLED_ADDONS_CHANGE, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return installed;
}
