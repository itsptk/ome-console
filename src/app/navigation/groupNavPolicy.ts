import {
  cloneNavAdminPolicy,
  isNavLabelAlwaysVisible,
  navAdminPoliciesEqual,
  type NavAdminPolicy,
} from "./navigationPreferences";

export const GROUP_NAV_POLICY_STORAGE_PREFIX = "ome-nav-group-policy-";
export const GROUP_NAV_POLICY_CHANGE = "ome-nav-group-policy-change";

function storageKey(groupId: string): string {
  return `${GROUP_NAV_POLICY_STORAGE_PREFIX}${groupId}`;
}

function withoutAlwaysHidden(hidden: Set<string>): Set<string> {
  const next = new Set(hidden);
  for (const label of ["Overview", "Settings", "Documentation"] as const) {
    next.delete(label);
  }
  return next;
}

function parseLabelSet(value: unknown): Set<string> {
  if (!Array.isArray(value)) return new Set();
  return new Set(value.filter((v): v is string => typeof v === "string"));
}

export function readGroupNavPolicy(groupId: string): NavAdminPolicy {
  if (typeof localStorage === "undefined") {
    return { hiddenFromAllUsers: new Set(), mandatoryForAllUsers: new Set() };
  }

  try {
    const raw = localStorage.getItem(storageKey(groupId));
    if (!raw) {
      return { hiddenFromAllUsers: new Set(), mandatoryForAllUsers: new Set() };
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return { hiddenFromAllUsers: new Set(), mandatoryForAllUsers: new Set() };
    }

    const record = parsed as Record<string, unknown>;
    return {
      hiddenFromAllUsers: withoutAlwaysHidden(
        parseLabelSet(record.hiddenFromAllUsers),
      ),
      mandatoryForAllUsers: withoutAlwaysHidden(
        parseLabelSet(record.mandatoryForAllUsers),
      ),
    };
  } catch {
    return { hiddenFromAllUsers: new Set(), mandatoryForAllUsers: new Set() };
  }
}

export function writeGroupNavPolicy(
  groupId: string,
  policy: NavAdminPolicy,
): void {
  try {
    localStorage.setItem(
      storageKey(groupId),
      JSON.stringify({
        hiddenFromAllUsers: [...withoutAlwaysHidden(policy.hiddenFromAllUsers)],
        mandatoryForAllUsers: [
          ...withoutAlwaysHidden(policy.mandatoryForAllUsers),
        ],
      }),
    );
    window.dispatchEvent(
      new CustomEvent(GROUP_NAV_POLICY_CHANGE, { detail: { groupId } }),
    );
  } catch {
    /* ignore */
  }
}

export function isShownToGroupMembers(
  label: string,
  groupId: string,
  policy = readGroupNavPolicy(groupId),
): boolean {
  if (isNavLabelAlwaysVisible(label)) return true;
  return !policy.hiddenFromAllUsers.has(label);
}

export function groupNavPoliciesEqual(
  a: NavAdminPolicy,
  b: NavAdminPolicy,
): boolean {
  return navAdminPoliciesEqual(a, b);
}

export { cloneNavAdminPolicy };
