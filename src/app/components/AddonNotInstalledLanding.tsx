import "@patternfly/react-core/dist/styles/base-no-reset.css";
import { Button } from "@patternfly/react-core";
import { ErrorState } from "@patternfly/react-component-groups";
import ExternalLinkAltIcon from "@patternfly/react-icons/dist/esm/icons/external-link-alt-icon";
import ServicesIcon from "@patternfly/react-icons/dist/esm/icons/services-icon";
import {
  getAddonLandingView,
  type CoreAddonContent,
} from "../addons/coreAddons";
import {
  installAddon,
  useInstalledAddons,
} from "../addons/installedAddons";
import { useAppToast } from "../contexts/AppToastContext";
import { useNavigationPreferences } from "../contexts/NavigationPreferencesContext";
import { AddonInstalledView } from "./AddonInstalledView";

/** Matches the Deployments empty-state icon (size-16 in a secondary circle). */
function AddonLandingIcon() {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full p-6"
      style={{ backgroundColor: "var(--secondary)" }}
    >
      <ServicesIcon
        style={{
          width: "4rem",
          height: "4rem",
          color: "var(--muted-foreground)",
        }}
        aria-hidden
      />
    </span>
  );
}

function LearnMoreButton({
  url,
  label = "Learn more",
}: {
  url: string;
  label?: string;
}) {
  return (
    <Button
      variant="link"
      component="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      icon={
        <ExternalLinkAltIcon
          style={{ width: "1em", height: "1em", verticalAlign: "-0.125em" }}
        />
      }
      iconPosition="right"
    >
      {label}
    </Button>
  );
}

function AddonLandingBody({
  description,
  secondaryMessage,
  learnMoreUrl,
  learnMoreInline,
}: {
  description: string;
  secondaryMessage?: string;
  learnMoreUrl: string;
  learnMoreInline: boolean;
}) {
  return (
    <>
      {description}
      {learnMoreInline ? (
        <>
          {" "}
          <LearnMoreButton url={learnMoreUrl} />
        </>
      ) : null}
      {secondaryMessage ? (
        <>
          <br />
          <br />
          {secondaryMessage}
        </>
      ) : null}
    </>
  );
}

export function AddonNotInstalledLanding({ addon }: { addon: CoreAddonContent }) {
  const { showSuccessToast } = useAppToast();
  const { isClusterAdmin } = useNavigationPreferences();
  const installedAddons = useInstalledAddons();
  const view = getAddonLandingView(addon, !isClusterAdmin);

  if (installedAddons.has(addon.id)) {
    return <AddonInstalledView addon={addon} />;
  }

  const handleInstall = () => {
    installAddon(addon.id);
    showSuccessToast(`${addon.name} installed`);
  };

  return (
    <div className="flex min-h-[500px] items-center justify-center py-12 [&_.pf-v6-c-empty-state__header]:flex [&_.pf-v6-c-empty-state__header]:flex-col [&_.pf-v6-c-empty-state__header]:items-center [&_.pf-v6-c-empty-state__icon]:flex [&_.pf-v6-c-empty-state__icon]:justify-center">
      <ErrorState
        titleText={view.titleText}
        bodyText={
          <AddonLandingBody
            description={view.description}
            secondaryMessage={view.secondaryMessage}
            learnMoreUrl={view.learnMoreUrl}
            learnMoreInline={view.learnMoreInline}
          />
        }
        headingLevel="h1"
        icon={AddonLandingIcon}
        status="none"
        customFooter={
          view.showCta || !view.learnMoreInline ? (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {view.showCta && view.ctaLabel ? (
                <Button
                  variant="primary"
                  component={view.ctaHref ? "a" : undefined}
                  href={view.ctaHref}
                  target={view.ctaHref ? "_blank" : undefined}
                  rel={view.ctaHref ? "noopener noreferrer" : undefined}
                  onClick={view.ctaHref ? undefined : handleInstall}
                >
                  {view.ctaLabel}
                </Button>
              ) : null}
              {!view.learnMoreInline ? (
                <LearnMoreButton
                  url={view.learnMoreUrl}
                  label={view.learnMoreLabel}
                />
              ) : null}
            </div>
          ) : undefined
        }
        ouiaId={`AddonNotInstalled-${addon.id}`}
      />
    </div>
  );
}
