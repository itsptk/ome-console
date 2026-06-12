import { Container } from "../../imports/UIComponents";
import { CORE_ADDONS } from "../addons/coreAddons";
import { AddonNotInstalledLanding } from "../components/AddonNotInstalledLanding";

export function VirtualMachinesPage() {
  return (
    <Container className="p-8">
      <AddonNotInstalledLanding addon={CORE_ADDONS.virtualization} />
    </Container>
  );
}
