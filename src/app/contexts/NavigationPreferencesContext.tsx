import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  canUserHideNavItem,
  cloneNavAdminPolicy,
  CLUSTER_ADMIN_USER_ID,
  getAdminCustomizableNavItems,
  getPersonalCustomizableNavItems,
  isNavItemVisibleForUser,
  isNavLabelAlwaysVisible,
  isShownToAllUsers,
  navVisibilityModeFromPolicy,
  NAV_VISIBILITY_CHANGE,
  navAdminPoliciesEqual,
  readHiddenNavLabels,
  readNavAdminPolicy,
  writeHiddenNavLabels,
  writeNavAdminPolicy,
  type CustomizableNavItem,
  type NavAdminPolicy,
  type NavVisibilityMode,
} from "../navigation/navigationPreferences";
import {
  GROUP_NAV_POLICY_CHANGE,
  isShownToGroupMembers,
  readGroupNavPolicy,
} from "../navigation/groupNavPolicy";
import { getGroupIdForUser } from "../userManagement/userManagementData";

type NavigationPreferencesContextValue = {
  isClusterAdmin: boolean;
  /** Items the current user may show or hide for themselves. */
  personalCustomizableItems: CustomizableNavItem[];
  isNavItemVisible: (label: string) => boolean;
  setNavItemVisible: (label: string, visible: boolean) => void;
  /** Cluster admin: workspace navigation policy (applied). */
  adminNavItems: CustomizableNavItem[];
  isShownToAllUsers: (label: string) => boolean;
  canUsersHideItem: (label: string) => boolean;
  /** Cluster admin: draft workspace policy (settings UI until Save). */
  draftIsShownToAllUsers: (label: string) => boolean;
  draftCanUsersHideItem: (label: string) => boolean;
  setDraftShownToAllUsers: (label: string, shown: boolean) => void;
  setDraftUsersCanHideItem: (label: string, canHide: boolean) => void;
  draftNavVisibilityMode: (label: string) => NavVisibilityMode;
  setDraftNavVisibilityMode: (label: string, mode: NavVisibilityMode) => void;
  hasUnappliedAdminPolicyChanges: boolean;
  applyAdminPolicy: () => void;
  resetAdminPolicy: () => void;
};

const NavigationPreferencesContext =
  createContext<NavigationPreferencesContextValue | null>(null);

export function NavigationPreferencesProvider({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) {
  const isClusterAdmin = userId === CLUSTER_ADMIN_USER_ID;
  const groupId = getGroupIdForUser(userId);
  const [groupNavPolicy, setGroupNavPolicy] = useState(() =>
    groupId ? readGroupNavPolicy(groupId) : null,
  );
  const [userHiddenLabels, setUserHiddenLabels] = useState<Set<string>>(() =>
    readHiddenNavLabels(userId),
  );
  const [adminPolicy, setAdminPolicy] = useState<NavAdminPolicy>(() =>
    readNavAdminPolicy(),
  );
  const [draftAdminPolicy, setDraftAdminPolicy] = useState<NavAdminPolicy>(() =>
    readNavAdminPolicy(),
  );

  useEffect(() => {
    setUserHiddenLabels(readHiddenNavLabels(userId));
    const nextGroupId = getGroupIdForUser(userId);
    setGroupNavPolicy(
      nextGroupId ? readGroupNavPolicy(nextGroupId) : null,
    );
  }, [userId]);

  const isShownForGroup = useCallback(
    (label: string) => {
      if (!groupId || !groupNavPolicy) return true;
      return isShownToGroupMembers(label, groupId, groupNavPolicy);
    },
    [groupId, groupNavPolicy],
  );

  useEffect(() => {
    const sync = () => {
      const policy = readNavAdminPolicy();
      setAdminPolicy(policy);
      setDraftAdminPolicy(cloneNavAdminPolicy(policy));
      setUserHiddenLabels(readHiddenNavLabels(userId));
      const nextGroupId = getGroupIdForUser(userId);
      setGroupNavPolicy(
        nextGroupId ? readGroupNavPolicy(nextGroupId) : null,
      );
    };
    const syncGroupPolicy = (event: Event) => {
      const detail = (event as CustomEvent<{ groupId?: string }>).detail;
      const nextGroupId = getGroupIdForUser(userId);
      if (!nextGroupId) return;
      if (!detail?.groupId || detail.groupId === nextGroupId) {
        setGroupNavPolicy(readGroupNavPolicy(nextGroupId));
      }
    };
    window.addEventListener(NAV_VISIBILITY_CHANGE, sync);
    window.addEventListener(GROUP_NAV_POLICY_CHANGE, syncGroupPolicy);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(NAV_VISIBILITY_CHANGE, sync);
      window.removeEventListener(GROUP_NAV_POLICY_CHANGE, syncGroupPolicy);
      window.removeEventListener("storage", sync);
    };
  }, [userId]);

  const personalCustomizableItems = useMemo(
    () => getPersonalCustomizableNavItems(userId, adminPolicy, isShownForGroup),
    [userId, adminPolicy, isShownForGroup],
  );

  const adminNavItems = useMemo(() => getAdminCustomizableNavItems(), []);

  const isNavItemVisible = useCallback(
    (label: string) =>
      isNavItemVisibleForUser(
        userId,
        label,
        adminPolicy,
        userHiddenLabels,
        isShownForGroup,
      ),
    [userId, adminPolicy, userHiddenLabels, isShownForGroup],
  );

  const setNavItemVisible = useCallback(
    (label: string, visible: boolean) => {
      if (isNavLabelAlwaysVisible(label)) return;
      if (!canUserHideNavItem(label, adminPolicy)) return;
      setUserHiddenLabels((prev) => {
        const next = new Set(prev);
        if (visible) {
          next.delete(label);
        } else {
          next.add(label);
        }
        writeHiddenNavLabels(userId, next);
        return next;
      });
    },
    [userId, adminPolicy],
  );

  const isShownToAllUsersAdmin = useCallback(
    (label: string) => isShownToAllUsers(label, adminPolicy),
    [adminPolicy],
  );

  const canUsersHideItem = useCallback(
    (label: string) => canUserHideNavItem(label, adminPolicy),
    [adminPolicy],
  );

  const draftIsShownToAllUsers = useCallback(
    (label: string) => isShownToAllUsers(label, draftAdminPolicy),
    [draftAdminPolicy],
  );

  const draftCanUsersHideItem = useCallback(
    (label: string) => canUserHideNavItem(label, draftAdminPolicy),
    [draftAdminPolicy],
  );

  const setDraftShownToAllUsers = useCallback((label: string, shown: boolean) => {
    if (isNavLabelAlwaysVisible(label)) return;
    setDraftAdminPolicy((prev) => {
      const next = cloneNavAdminPolicy(prev);
      if (shown) {
        next.hiddenFromAllUsers.delete(label);
      } else {
        next.hiddenFromAllUsers.add(label);
        next.mandatoryForAllUsers.delete(label);
      }
      return next;
    });
  }, []);

  const setDraftUsersCanHideItem = useCallback((label: string, canHide: boolean) => {
    if (isNavLabelAlwaysVisible(label)) return;
    setDraftAdminPolicy((prev) => {
      const next = cloneNavAdminPolicy(prev);
      if (canHide) {
        next.mandatoryForAllUsers.delete(label);
      } else if (!next.hiddenFromAllUsers.has(label)) {
        next.mandatoryForAllUsers.add(label);
      }
      return next;
    });
  }, []);

  const draftNavVisibilityMode = useCallback(
    (label: string) => navVisibilityModeFromPolicy(label, draftAdminPolicy),
    [draftAdminPolicy],
  );

  const setDraftNavVisibilityMode = useCallback(
    (label: string, mode: NavVisibilityMode) => {
      if (isNavLabelAlwaysVisible(label)) return;
      if (mode === "hidden") {
        setDraftAdminPolicy((prev) => {
          const next = cloneNavAdminPolicy(prev);
          next.hiddenFromAllUsers.add(label);
          next.mandatoryForAllUsers.delete(label);
          return next;
        });
      } else if (mode === "mandatory") {
        setDraftAdminPolicy((prev) => {
          const next = cloneNavAdminPolicy(prev);
          next.hiddenFromAllUsers.delete(label);
          next.mandatoryForAllUsers.add(label);
          return next;
        });
      } else {
        setDraftAdminPolicy((prev) => {
          const next = cloneNavAdminPolicy(prev);
          next.hiddenFromAllUsers.delete(label);
          next.mandatoryForAllUsers.delete(label);
          return next;
        });
      }
    },
    [],
  );

  const hasUnappliedAdminPolicyChanges = useMemo(
    () => !navAdminPoliciesEqual(adminPolicy, draftAdminPolicy),
    [adminPolicy, draftAdminPolicy],
  );

  const applyAdminPolicy = useCallback(() => {
    const next = cloneNavAdminPolicy(draftAdminPolicy);
    writeNavAdminPolicy(next);
    setAdminPolicy(next);
  }, [draftAdminPolicy]);

  const resetAdminPolicy = useCallback(() => {
    setDraftAdminPolicy(cloneNavAdminPolicy(adminPolicy));
  }, [adminPolicy]);

  const value = useMemo(
    () => ({
      isClusterAdmin,
      personalCustomizableItems,
      isNavItemVisible,
      setNavItemVisible,
      adminNavItems,
      isShownToAllUsers: isShownToAllUsersAdmin,
      canUsersHideItem,
      draftIsShownToAllUsers,
      draftCanUsersHideItem,
      setDraftShownToAllUsers,
      setDraftUsersCanHideItem,
      draftNavVisibilityMode,
      setDraftNavVisibilityMode,
      hasUnappliedAdminPolicyChanges,
      applyAdminPolicy,
      resetAdminPolicy,
    }),
    [
      isClusterAdmin,
      personalCustomizableItems,
      isNavItemVisible,
      setNavItemVisible,
      adminNavItems,
      isShownToAllUsersAdmin,
      canUsersHideItem,
      draftIsShownToAllUsers,
      draftCanUsersHideItem,
      setDraftShownToAllUsers,
      setDraftUsersCanHideItem,
      draftNavVisibilityMode,
      setDraftNavVisibilityMode,
      hasUnappliedAdminPolicyChanges,
      applyAdminPolicy,
      resetAdminPolicy,
    ],
  );

  return (
    <NavigationPreferencesContext.Provider value={value}>
      {children}
    </NavigationPreferencesContext.Provider>
  );
}

export function useNavigationPreferences(): NavigationPreferencesContextValue {
  const ctx = useContext(NavigationPreferencesContext);
  if (!ctx) {
    throw new Error(
      "useNavigationPreferences must be used within NavigationPreferencesProvider",
    );
  }
  return ctx;
}
