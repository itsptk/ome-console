import "@patternfly/react-core/dist/styles/base-no-reset.css";
import "@patternfly/react-styles/css/components/Label/label.css";
import { Checkbox, Label } from "@patternfly/react-core";
import { Link } from "react-router";
import {
  PrimaryButton,
  SecondaryButton,
} from "../../imports/UIComponents";
import { useAppToast } from "../contexts/AppToastContext";
import { useNavigationPreferences } from "../contexts/NavigationPreferencesContext";
import { useInstalledAddons } from "../addons/installedAddons";
import type { CustomizableNavItem } from "../navigation/navigationPreferences";
import {
  getNavAddonStatusLabel,
  type NavAddonStatusLabel,
} from "../navigation/navAddonIcons";
import {
  PfTable,
  PfTbody,
  PfTd,
  PfTh,
  PfThead,
  PfTr,
} from "./patternfly-table";

const sectionHeadingStyle = {
  fontFamily: "var(--font-family-display)",
  fontSize: "var(--text-xl)",
  fontWeight: "var(--font-weight-medium)",
} as const;

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

function NavItemTableLink({ label, path }: { label: string; path: string }) {
  return (
    <Link
      to={path}
      className="text-primary hover:underline"
      style={{
        fontFamily: "var(--font-family-text)",
        fontSize: "var(--text-sm)",
      }}
    >
      {label}
    </Link>
  );
}

function AdminGlobalSettingsShowList({
  items,
  isShown,
  setShown,
}: {
  items: CustomizableNavItem[];
  isShown: (label: string) => boolean;
  setShown: (label: string, shown: boolean) => void;
}) {
  const installedAddons = useInstalledAddons();

  return (
    <div className="w-full max-w-full">
      <PfTable
        aria-label="Workspace navigation visibility"
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
            const rowId = item.label.replace(/\s+/g, "-").toLowerCase();
            const addonStatus = getNavAddonStatusLabel(
              item.label,
              installedAddons,
            );

            return (
              <PfTr key={item.label}>
                <PfTd wrap width="width40">
                  <div className="flex flex-wrap items-center gap-2">
                    <NavItemTableLink label={item.label} path={item.path} />
                    {addonStatus ? (
                      <NavAddonStatusBadge status={addonStatus} />
                    ) : null}
                  </div>
                </PfTd>
                <PfTd width="width20">
                  <div className="flex justify-start">
                    <Checkbox
                      id={`nav-show-${rowId}`}
                      isChecked={isShown(item.label)}
                      aria-label={`Show ${item.label} in navigation`}
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
    </div>
  );
}

export function NavigationGlobalSettingsSection() {
  const { showSuccessToast } = useAppToast();
  const {
    isClusterAdmin,
    adminNavItems,
    draftIsShownToAllUsers,
    setDraftShownToAllUsers,
    hasUnappliedAdminPolicyChanges,
    applyAdminPolicy,
    resetAdminPolicy,
  } = useNavigationPreferences();

  const handleSave = () => {
    applyAdminPolicy();
    showSuccessToast("Navigation settings saved");
  };

  if (!isClusterAdmin) {
    return null;
  }

  return (
    <section
      className="mb-8 max-w-2xl rounded-lg border p-6"
      style={{ borderColor: "var(--border)" }}
    >
      <h2 className="mb-4" style={sectionHeadingStyle}>
        Global navigation
      </h2>

      <div>
        <p
          className="mb-4 text-muted-foreground"
          style={{
            fontFamily: "var(--font-family-text)",
            fontSize: "var(--text-sm)",
          }}
        >
          Uncheck an item to hide it from the navigation for all users. Changes
          apply when you click Save.
        </p>
        <AdminGlobalSettingsShowList
          items={adminNavItems}
          isShown={draftIsShownToAllUsers}
          setShown={setDraftShownToAllUsers}
        />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <PrimaryButton
            onClick={handleSave}
            disabled={!hasUnappliedAdminPolicyChanges}
          >
            Save
          </PrimaryButton>
          <SecondaryButton
            onClick={resetAdminPolicy}
            disabled={!hasUnappliedAdminPolicyChanges}
          >
            Reset
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
}
