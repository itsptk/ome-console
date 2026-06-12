import { Container } from "../../imports/UIComponents";
import { CORE_ADDONS } from "../addons/coreAddons";
import { AddonNotInstalledLanding } from "../components/AddonNotInstalledLanding";

export function ApplicationsPage() {
  return (
    <Container className="p-8">
      <AddonNotInstalledLanding addon={CORE_ADDONS.configuration} />
    </Container>
  );
}
