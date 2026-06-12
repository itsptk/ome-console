import { BodyText, PageTitle } from "../../imports/UIComponents";
import type { CoreAddonContent } from "../addons/coreAddons";

export function AddonInstalledView({ addon }: { addon: CoreAddonContent }) {
  return (
    <div className="mb-8">
      <PageTitle>{addon.name}</PageTitle>
      <BodyText muted>{addon.description}</BodyText>
    </div>
  );
}
