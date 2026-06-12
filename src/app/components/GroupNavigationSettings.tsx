import "@patternfly/react-core/dist/styles/base-no-reset.css";
import "@patternfly/react-styles/css/components/Label/label.css";
import { Checkbox, Label } from "@patternfly/react-core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  PrimaryButton,
  SecondaryButton,
} from "../../imports/UIComponents";
import { useAppToast } from "../contexts/AppToastContext";
import { useInstalledAddons } from "../addons/installedAddons";
import {
  cloneNavAdminPolicy,
  getAdminCustomizableNavItems,
  isShownToAllUsers,
  type CustomizableNavItem,
  type NavAdminPolicy,
} from "../navigation/navigationPreferences";
import {
  getNavAddonStatusLabel,
  type NavAddonStatusLabel,
} from "../navigation/navAddonIcons";
import {
  groupNavPoliciesEqual,
  readGroupNavPolicy,
  writeGroupNavPolicy,
} from "../navigation/groupNavPolicy";
import type { TenantGroupId } from "../userManagement/userManagementData";
import {
  PfTable,
  PfTbody,
  PfTd,
  PfTh,
  PfThead,
  PfTr,
} from "./patternfly-table";

function NavAddonStatusBadge({ status }: { status: NavAddonStatusLabel }) {
  if (status === "enable") {
    return (
      <Label color="blue" isCompact>
        Enable
      </Label>
    );
  }

  return (
    <Label variant="outline" isCompact>
      Upgrade
    </Label>
  );
}

function GroupNavigationShowList({
  groupId,
  items,
  isShown,
  setShown,
}: {
  groupId: TenantGroupId;
  items: CustomizableNavItem[];
  isShown: (label: string) => boolean;
  setShown: (label: string, shown: boolean) => void;
}) {
  const installedAddons = useInstalledAddons();

  return (
    <PfTable
      aria-label={`Navigation visibility for ${groupId}`}
      modifiers={["borderRow", "fixed"]}
      className="w-full"
    >
      <PfThead>
        <PfTr>
          <PfTh wrap width="width40">
            Navigation item
          </PfTh>
          <PfTh width="width20" wrap>
            Show
          </PfTh>
        </PfTr>
      </PfThead>
      <PfTbody>
        {items.map((item) => {
          const rowId = `${groupId}-${item.label}`.replace(/\s+/g, "-").toLowerCase();
          const addonStatus = getNavAddonStatusLabel(
            item.label,
            installedAddons,
          );

          return (
            <PfTr key={item.label}>
              <PfTd wrap width="width40">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={item.path}
                    className="text-primary hover:underline"
                    style={{
                      fontFamily: "var(--font-family-text)",
                      fontSize: "var(--text-sm)",
                    }}
                  >
                    {item.label}
                  </Link>
                  {addonStatus ? (
                    <NavAddonStatusBadge status={addonStatus} />
                  ) : null}
                </div>
              </PfTd>
              <PfTd width="width20">
                <div className="flex justify-start">
                  <Checkbox
                    id={`group-nav-show-${rowId}`}
                    isChecked={isShown(item.label)}
                    aria-label={`Show ${item.label} for this group`}
                    onChange={(_event, checked) => {
                      setShown(item.label, checked);
                    }}
                  />
                </div>
              </PfTd>
            </PfTr>
          );
        })}
      </PfTbody>
    </PfTable>
  );
}

export function GroupNavigationSettings({
  groupId,
  groupName,
  embedded = false,
}: {
  groupId: TenantGroupId;
  groupName: string;
  embedded?: boolean;
}) {
  const { showSuccessToast } = useAppToast();
  const navItems = useMemo(() => getAdminCustomizableNavItems(), []);
  const [appliedPolicy, setAppliedPolicy] = useState<NavAdminPolicy>(() =>
    readGroupNavPolicy(groupId),
  );
  const [draftPolicy, setDraftPolicy] = useState<NavAdminPolicy>(() =>
    readGroupNavPolicy(groupId),
  );

  useEffect(() => {
    const policy = readGroupNavPolicy(groupId);
    setAppliedPolicy(policy);
    setDraftPolicy(cloneNavAdminPolicy(policy));
  }, [groupId]);

  const draftIsShown = useCallback(
    (label: string) => isShownToAllUsers(label, draftPolicy),
    [draftPolicy],
  );

  const setDraftShown = useCallback((label: string, shown: boolean) => {
    setDraftPolicy((prev) => {
      const next = cloneNavAdminPolicy(prev);
      if (shown) {
        next.hiddenFromAllUsers.delete(label);
      } else {
        next.hiddenFromAllUsers.add(label);
      }
      return next;
    });
  }, []);

  const hasChanges = useMemo(
    () => !groupNavPoliciesEqual(appliedPolicy, draftPolicy),
    [appliedPolicy, draftPolicy],
  );

  const handleSave = () => {
    const next = cloneNavAdminPolicy(draftPolicy);
    writeGroupNavPolicy(groupId, next);
    setAppliedPolicy(next);
    showSuccessToast(`Navigation settings saved for ${groupName}`);
  };

  const handleReset = () => {
    setDraftPolicy(cloneNavAdminPolicy(appliedPolicy));
  };

  const content = (
    <>
      {!embedded ? (
        <h4
          className="mb-2"
          style={{
            fontFamily: "var(--font-family-display)",
            fontSize: "var(--text-base)",
            fontWeight: "var(--font-weight-medium)",
          }}
        >
          Navigation settings
        </h4>
      ) : null}
      <p
        className="mb-4 text-muted-foreground"
        style={{
          fontFamily: "var(--font-family-text)",
          fontSize: "var(--text-sm)",
        }}
      >
        Uncheck an item to hide it from the navigation for members of{" "}
        {groupName}. Changes apply when you click Save.
      </p>
      <GroupNavigationShowList
        groupId={groupId}
        items={navItems}
        isShown={draftIsShown}
        setShown={setDraftShown}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <PrimaryButton onClick={handleSave} disabled={!hasChanges}>
          Save
        </PrimaryButton>
        <SecondaryButton onClick={handleReset} disabled={!hasChanges}>
          Reset
        </SecondaryButton>
      </div>
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="mt-4 rounded-lg border p-4" style={{ borderColor: "var(--border)" }}>
      {content}
    </div>
  );
}
