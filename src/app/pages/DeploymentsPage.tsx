import { useState } from 'react';
import { PageTitle, BodyText, Container } from '../../imports/UIComponents';
import { EmptyStateScreen } from '../components/deployments/EmptyStateScreen';
import {
  DeploymentWizard,
  type DeploymentTabId,
  type WizardEntryMode,
} from '../components/deployments/DeploymentWizard';
import { getWizardPresetForTab } from '../components/deployments/deploymentTabPresets';
import { ActivityStreamScreen } from '../components/deployments/ActivityStreamScreen';

export function DeploymentsPage() {
  const [hasDeployments, setHasDeployments] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardEntryMode, setWizardEntryMode] =
    useState<WizardEntryMode>('action-first');
  const [wizardLaunchTab, setWizardLaunchTab] =
    useState<DeploymentTabId>('all');
  const [wizardInitialLabel, setWizardInitialLabel] = useState<
    string | undefined
  >();
  const [wizardUpgradeCorridor, setWizardUpgradeCorridor] =
    useState(false);
  const [executionPolicy, setExecutionPolicy] = useState<{
    runAs: string;
    requireManualConfirmation: boolean;
  } | null>(null);

  type OpenWizardOptions = {
    tab: DeploymentTabId;
    mode?: WizardEntryMode;
    /** Overrides tab preset label (e.g. “Use search as placement”). */
    initialLabelSelector?: string;
    upgradeCorridor?: boolean;
  };

  const openWizard = ({
    tab,
    mode,
    initialLabelSelector,
    upgradeCorridor,
  }: OpenWizardOptions) => {
    const preset = getWizardPresetForTab(tab);
    setWizardLaunchTab(tab);
    setWizardEntryMode(mode ?? preset.entryMode);
    setWizardInitialLabel(initialLabelSelector);
    setWizardUpgradeCorridor(!!upgradeCorridor);
    setIsWizardOpen(true);
  };

  const handleWizardComplete = (wizardFormData?: any) => {
    setIsWizardOpen(false);
    setWizardInitialLabel(undefined);
    setWizardUpgradeCorridor(false);
    setWizardLaunchTab('all');
    setHasDeployments(true);
    if (wizardFormData) {
      setExecutionPolicy({
        runAs: wizardFormData.runAs,
        requireManualConfirmation: wizardFormData.requireManualConfirmation,
      });
    }
  };

  const handleWizardCancel = () => {
    setIsWizardOpen(false);
    setWizardInitialLabel(undefined);
    setWizardUpgradeCorridor(false);
    setWizardLaunchTab('all');
  };

  const handleFastForwardToDeployments = () => {
    setHasDeployments(true);
  };

  return (
    <Container className="p-8">
      {/* Page title only when empty — populated view owns title + scope tabs */}
      {!hasDeployments && (
        <div className="mb-8">
          <PageTitle>Deployments</PageTitle>
          <BodyText muted>
            Monitor and manage fleet-wide changes
          </BodyText>
        </div>
      )}

      {/* Content */}
      {!hasDeployments ? (
        <EmptyStateScreen
          onCreateFromPlacement={() =>
            openWizard({ tab: 'placements' })
          }
          onCreateFromAction={() =>
            openWizard({ tab: 'clusters' })
          }
          onFastForwardToDeployments={handleFastForwardToDeployments}
        />
      ) : (
        <ActivityStreamScreen
          onCreateDeployment={openWizard}
          executionPolicy={executionPolicy}
        />
      )}

      {/* Wizard Modal */}
      {isWizardOpen && (
        <DeploymentWizard
          key={`${wizardLaunchTab}-${wizardEntryMode}-${wizardInitialLabel ?? ''}-${wizardUpgradeCorridor ? 'c' : ''}`}
          entryMode={wizardEntryMode}
          launchTab={wizardLaunchTab}
          initialLabelSelector={wizardInitialLabel}
          upgradeCorridor={wizardUpgradeCorridor}
          onComplete={handleWizardComplete}
          onCancel={handleWizardCancel}
        />
      )}
    </Container>
  );
}