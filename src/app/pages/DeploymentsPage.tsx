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
  const [wizardSessionId, setWizardSessionId] = useState(0);
  const [wizardEntryMode, setWizardEntryMode] =
    useState<WizardEntryMode>('action-first');
  const [wizardLaunchTab, setWizardLaunchTab] =
    useState<DeploymentTabId>('all');
  const [wizardInitialLabel, setWizardInitialLabel] = useState<
    string | undefined
  >();
  const [executionPolicy, setExecutionPolicy] = useState<{
    runAs: string;
    requireManualConfirmation: boolean;
  } | null>(null);

  type OpenWizardOptions = {
    tab: DeploymentTabId;
    mode?: WizardEntryMode;
    /** Overrides tab preset label (e.g. “Use search as placement”). */
    initialLabelSelector?: string;
  };

  const applyWizardLaunch = (
    { tab, mode, initialLabelSelector }: OpenWizardOptions,
    alsoOpen: boolean,
  ) => {
    const preset = getWizardPresetForTab(tab);
    setWizardLaunchTab(tab);
    setWizardEntryMode(mode ?? preset.entryMode);
    setWizardInitialLabel(initialLabelSelector);
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
          <PageTitle className="!mb-0">Deployments</PageTitle>
          <BodyText muted className="mt-1">
            Monitor and manage fleet-wide changes
          </BodyText>
        </div>
      )}

      {/* Content */}
      {!hasDeployments ? (
        <EmptyStateScreen
          onCreateDeployment={openWizard}
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
          key={`w-${wizardSessionId}-${wizardLaunchTab}-${wizardEntryMode}-${wizardInitialLabel ?? ''}`}
          entryMode={wizardEntryMode}
          launchTab={wizardLaunchTab}
          initialLabelSelector={wizardInitialLabel}
          onReconfigure={reconfigureWizard}
          onComplete={handleWizardComplete}
          onCancel={handleWizardCancel}
        />
      )}
    </Container>
  );
}