export const NAV_VISIBILITY_STORAGE_PREFIX = "ome-nav-hidden-";
export const NAV_ADMIN_POLICY_STORAGE_KEY = "ome-nav-admin-policy";
export const NAV_VISIBILITY_CHANGE = "ome-nav-visibility-change";

export const CLUSTER_ADMIN_USER_ID = "adi";

export const NAV_ALWAYS_VISIBLE_LABELS = [
  "Overview",
  "Settings",
  "Documentation",
] as const;

/** Migrate stored policy from earlier prototype label names. */
const LEGACY_NAV_LABEL_ALIASES: Record<string, string> = {
  Applications: "Configuration",
  "Virtual Machines": "Virtualization",
};

function normalizeNavLabel(label: string): string {
  return LEGACY_NAV_LABEL_ALIASES[label] ?? label;
}

function normalizeLabelSet(labels: Set<string>): Set<string> {
  const next = new Set<string>();
  for (const label of labels) {
    next.add(normalizeNavLabel(label));
  }
  return next;
}

export const SARA_ALLOWED_NAV_LABELS = [
  "Overview",
  "Configuration",
  "Virtualization",
  "Governance",
  "Security",
  "Observability",
  "Settings",
  "Documentation",
] as const;

export type NavSection = "main" | "settings";

export type CustomizableNavItem = {
  label: string;
  path: string;
  section: NavSection;
};

export const CUSTOMIZABLE_NAV_ITEMS: CustomizableNavItem[] = [
  { label: "Deployments", path: "/deployments", section: "main" },
  { label: "Configuration", path: "/applications", section: "main" },
  { label: "Virtualization", path: "/virtual-machines", section: "main" },
  { label: "Clusters", path: "/clusters", section: "main" },
  { label: "Governance", path: "/governance", section: "main" },
  { label: "Security", path: "/security", section: "main" },
  { label: "Observability", path: "/observability", section: "main" },
  { label: "Automation", path: "/automation", section: "main" },
];

export type NavAdminPolicy = {
  hiddenFromAllUsers: Set<string>;
  /** When shown to all users, labels in this set cannot be hidden by individual users. */
  mandatoryForAllUsers: Set<string>;
};

/** Workspace-wide visibility for a customizable nav item (global settings Option 2). */
export type NavVisibilityMode = "mandatory" | "optional" | "hidden";

export function navVisibilityModeFromPolicy(
  label: string,
  policy: NavAdminPolicy,
): NavVisibilityMode {
  if (!isShownToAllUsers(label, policy)) return "hidden";
  if (!canUserHideNavItem(label, policy)) return "mandatory";
  return "optional";
}

export function cloneNavAdminPolicy(policy: NavAdminPolicy): NavAdminPolicy {
  return {
    hiddenFromAllUsers: new Set(policy.hiddenFromAllUsers),
    mandatoryForAllUsers: new Set(policy.mandatoryForAllUsers),
  };
}

export function navAdminPoliciesEqual(
  a: NavAdminPolicy,
  b: NavAdminPolicy,
): boolean {
  if (a.hiddenFromAllUsers.size !== b.hiddenFromAllUsers.size) return false;
  if (a.mandatoryForAllUsers.size !== b.mandatoryForAllUsers.size) return false;
  for (const label of a.hiddenFromAllUsers) {
    if (!b.hiddenFromAllUsers.has(label)) return false;
  }
  for (const label of a.mandatoryForAllUsers) {
    if (!b.mandatoryForAllUsers.has(label)) return false;
  }
  return true;
}

export function getCustomizableNavItemsForUser(userId: string): CustomizableNavItem[] {
  if (userId === "sara") {
    return CUSTOMIZABLE_NAV_ITEMS.filter((item) =>
      (SARA_ALLOWED_NAV_LABELS as readonly string[]).includes(item.label),
    );
  }
  return CUSTOMIZABLE_NAV_ITEMS;
}

export function getAdminCustomizableNavItems(): CustomizableNavItem[] {
  return CUSTOMIZABLE_NAV_ITEMS;
}

export function isNavLabelAlwaysVisible(label: string): boolean {
  return (NAV_ALWAYS_VISIBLE_LABELS as readonly string[]).includes(label);
}

function withoutAlwaysHidden(hidden: Set<string>): Set<string> {
  const next = new Set(hidden);
  for (const label of NAV_ALWAYS_VISIBLE_LABELS) {
    next.delete(label);
  }
  return next;
}

function storageKey(userId: string): string {
  return `${NAV_VISIBILITY_STORAGE_PREFIX}${userId}`;
}

function parseLabelSet(value: unknown): Set<string> {
  if (!Array.isArray(value)) return new Set();
  return new Set(value.filter((v): v is string => typeof v === "string"));
}

export function readNavAdminPolicy(): NavAdminPolicy {
  if (typeof localStorage === "undefined") {
    return { hiddenFromAllUsers: new Set(), mandatoryForAllUsers: new Set() };
  }
  try {
    const raw = localStorage.getItem(NAV_ADMIN_POLICY_STORAGE_KEY);
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
        normalizeLabelSet(parseLabelSet(record.hiddenFromAllUsers)),
      ),
      mandatoryForAllUsers: withoutAlwaysHidden(
        normalizeLabelSet(parseLabelSet(record.mandatoryForAllUsers)),
      ),
    };
  } catch {
    return { hiddenFromAllUsers: new Set(), mandatoryForAllUsers: new Set() };
  }
}

export function writeNavAdminPolicy(policy: NavAdminPolicy): void {
  try {
    localStorage.setItem(
      NAV_ADMIN_POLICY_STORAGE_KEY,
      JSON.stringify({
        hiddenFromAllUsers: [...withoutAlwaysHidden(policy.hiddenFromAllUsers)],
        mandatoryForAllUsers: [
          ...withoutAlwaysHidden(policy.mandatoryForAllUsers),
        ],
      }),
    );
    window.dispatchEvent(
      new CustomEvent(NAV_VISIBILITY_CHANGE, { detail: { scope: "admin" } }),
    );
  } catch {
    /* ignore */
  }
}

export function readHiddenNavLabels(userId: string): Set<string> {
  if (typeof localStorage === "undefined") {
    return new Set();
  }
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return withoutAlwaysHidden(
      normalizeLabelSet(
        new Set(parsed.filter((v): v is string => typeof v === "string")),
      ),
    );
  } catch {
    return new Set();
  }
}

export function writeHiddenNavLabels(userId: string, hidden: Set<string>): void {
  try {
    localStorage.setItem(
      storageKey(userId),
      JSON.stringify([...withoutAlwaysHidden(hidden)]),
    );
    window.dispatchEvent(
      new CustomEvent(NAV_VISIBILITY_CHANGE, { detail: { userId } }),
    );
  } catch {
    /* ignore */
  }
}

export function isShownToAllUsers(label: string, policy = readNavAdminPolicy()): boolean {
  if (isNavLabelAlwaysVisible(label)) return true;
  return !policy.hiddenFromAllUsers.has(label);
}

export function canUserHideNavItem(label: string, policy = readNavAdminPolicy()): boolean {
  if (isNavLabelAlwaysVisible(label)) return false;
  if (!isShownToAllUsers(label, policy)) return false;
  return !policy.mandatoryForAllUsers.has(label);
}

export function isNavItemVisibleForUser(
  userId: string,
  label: string,
  policy = readNavAdminPolicy(),
  userHidden = readHiddenNavLabels(userId),
  isShownForGroup: (label: string) => boolean = () => true,
): boolean {
  if (isNavLabelAlwaysVisible(label)) return true;
  if (!isShownToAllUsers(label, policy)) return false;
  if (!isShownForGroup(label)) return false;
  if (policy.mandatoryForAllUsers.has(label)) return true;
  return !userHidden.has(label);
}

/** @deprecated Use isNavItemVisibleForUser */
export function isNavLabelVisible(userId: string, label: string): boolean {
  return isNavItemVisibleForUser(userId, label);
}

export function getPersonalCustomizableNavItems(
  userId: string,
  policy = readNavAdminPolicy(),
  isShownForGroup: (label: string) => boolean = () => true,
): CustomizableNavItem[] {
  return getCustomizableNavItemsForUser(userId).filter(
    (item) =>
      isShownToAllUsers(item.label, policy) && isShownForGroup(item.label),
  );
}
