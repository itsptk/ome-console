import {
  INSTALLED_ADDONS_CHANGE,
  INSTALLED_ADDONS_STORAGE_KEY,
} from "../addons/installedAddons";
import { CLUSTER_RUN_AS_STORAGE_KEY } from "../cluster/clusterRunAsPrototype";
import {
  NAV_FAVORITES_CHANGE,
  NAV_FAVORITES_STORAGE_PREFIX,
} from "../navigation/navFavorites";
import {
  GROUP_NAV_POLICY_STORAGE_PREFIX,
  GROUP_NAV_POLICY_CHANGE,
} from "../navigation/groupNavPolicy";
import {
  NAV_ADMIN_POLICY_STORAGE_KEY,
  NAV_VISIBILITY_CHANGE,
  NAV_VISIBILITY_STORAGE_PREFIX,
} from "../navigation/navigationPreferences";
import { TENANT_GROUPS } from "../userManagement/userManagementData";
import {
  DAY_ONE_CONSOLE_CONFIG_CHANGE,
  DAY_ONE_CONSOLE_CONFIG_KEY,
} from "../pages/day-one/dayOneConsoleConfig";
import {
  GITHUB_SIGNING_PUB_KEY_STORAGE,
  PASSKEY_ENROLLMENT_STORAGE,
} from "../signing/signingPrototypeState";
import { DEFAULT_RUN_AS_STORAGE_KEY } from "../../imports/CreateClusterWizard";

export const PROTOTYPE_USER_IDS = ["adi", "sara"] as const;

const DAY_ONE_AUTH_PROVIDER_KEY = "dayOneAuthProvider";

const SESSION_STORAGE_KEYS = [
  DAY_ONE_CONSOLE_CONFIG_KEY,
  DAY_ONE_AUTH_PROVIDER_KEY,
  DEFAULT_RUN_AS_STORAGE_KEY,
  CLUSTER_RUN_AS_STORAGE_KEY,
  GITHUB_SIGNING_PUB_KEY_STORAGE,
  PASSKEY_ENROLLMENT_STORAGE,
] as const;

/** Clears persisted prototype state for both personas (local + session storage). */
export function resetPrototypeState(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(NAV_ADMIN_POLICY_STORAGE_KEY);
    localStorage.removeItem(INSTALLED_ADDONS_STORAGE_KEY);
    for (const group of TENANT_GROUPS) {
      localStorage.removeItem(`${GROUP_NAV_POLICY_STORAGE_PREFIX}${group.id}`);
    }
    for (const userId of PROTOTYPE_USER_IDS) {
      localStorage.removeItem(`${NAV_FAVORITES_STORAGE_PREFIX}${userId}`);
      localStorage.removeItem(`${NAV_VISIBILITY_STORAGE_PREFIX}${userId}`);
    }

    for (const key of SESSION_STORAGE_KEYS) {
      sessionStorage.removeItem(key);
    }
  } catch {
    /* ignore quota / privacy errors */
  }

  window.dispatchEvent(new CustomEvent(NAV_FAVORITES_CHANGE));
  window.dispatchEvent(
    new CustomEvent(NAV_VISIBILITY_CHANGE, { detail: { scope: "admin" } }),
  );
  for (const userId of PROTOTYPE_USER_IDS) {
    window.dispatchEvent(
      new CustomEvent(NAV_VISIBILITY_CHANGE, { detail: { userId } }),
    );
  }
  window.dispatchEvent(new CustomEvent(DAY_ONE_CONSOLE_CONFIG_CHANGE));
  window.dispatchEvent(new CustomEvent(INSTALLED_ADDONS_CHANGE));
  for (const group of TENANT_GROUPS) {
    window.dispatchEvent(
      new CustomEvent(GROUP_NAV_POLICY_CHANGE, { detail: { groupId: group.id } }),
    );
  }
  window.dispatchEvent(new Event("storage"));
}
