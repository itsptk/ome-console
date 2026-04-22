import { useState } from 'react';
import { PageTitle, BodyText, Container } from '../../imports/UIComponents';
import { EmptyStateScreen } from '../components/deployments/EmptyStateScreen';
import { CreateDeploymentSplitButton } from '../components/deployments/CreateDeploymentSplitButton';
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
  const [wizardSessionId, setWizardSessionId] = useState(0);
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

  const applyWizardLaunch = (
    { tab, mode, initialLabelSelector, upgradeCorridor }: OpenWizardOptions,
    alsoOpen: boolean,
  ) => {
    const preset = getWizardPresetForTab(tab);
    setWizardLaunchTab(tab);
    setWizardEntryMode(mode ?? preset.entryMode);
    setWizardInitialLabel(initialLabelSelector);
    setWizardUpgradeCorridor(!!upgradeCorridor);
    setWizardSessionId((n) => n + 1);
    if (alsoOpen) {
      setIsWizardOpen(true);
    }
  };

  const openWizard = (opts: OpenWizardOptions) => {
    applyWizardLaunch(opts, true);
  };

  const reconfigureWizard = (opts: OpenWizardOptions) => {
    applyWizardLaunch(opts, false);
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
          <div className="flex flex-col items-end gap-3 min-[400px]:flex-row min-[400px]:items-start min-[400px]:justify-between min-[400px]:gap-4">
            <div className="min-w-0 w-full min-[400px]:w-auto self-start min-[400px]:self-auto text-left">
              <PageTitle className="!mb-0">Deployments</PageTitle>
              <BodyText muted className="mt-1">
                Monitor and manage fleet-wide changes
              </BodyText>
            </div>
            <div className="shrink-0 min-[400px]:pt-0.5">
              <CreateDeploymentSplitButton
                scopeTab="all"
                onCreate={openWizard}
                showCorridorOption
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {!hasDeployments ? (
        <EmptyStateScreen
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
          key={`w-${wizardSessionId}-${wizardLaunchTab}-${wizardEntryMode}-${wizardInitialLabel ?? ''}-${wizardUpgradeCorridor ? 'c' : ''}`}
          entryMode={wizardEntryMode}
          launchTab={wizardLaunchTab}
          initialLabelSelector={wizardInitialLabel}
          upgradeCorridor={wizardUpgradeCorridor}
          onReconfigure={reconfigureWizard}
          onComplete={handleWizardComplete}
          onCancel={handleWizardCancel}
        />
      )}
    </Container>
  );
}