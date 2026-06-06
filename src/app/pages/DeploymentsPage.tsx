import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { PageTitle, Container } from '../../imports/UIComponents';
import { EmptyStateScreen } from '../components/deployments/EmptyStateScreen';
import {
  DeploymentWizard,
  type DeploymentTabId,
  type WizardEntryMode,
} from '../components/deployments/DeploymentWizard';
import { deploymentCopy } from '../components/deployments/deploymentPrototypeCopy';
import { getWizardPresetForTab } from '../components/deployments/deploymentTabPresets';
import { ActivityStreamScreen } from '../components/deployments/ActivityStreamScreen';
import type { OpenDeploymentWizardOptions } from '../components/deployments/CreateDeploymentSplitButton';

type FleetPlanFromClustersState = {
  initialSelectedClusterNames: string[];
  initialPrimaryActionId?: string;
  tab?: DeploymentTabId;
  mode?: WizardEntryMode;
  initialLabelSelector?: string;
};

export function DeploymentsPage() {
  const location = useLocation();
  const navigate = useNavigate();
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
  const [wizardInitialClusterNames, setWizardInitialClusterNames] = useState<
    string[] | undefined
  >();
  const [wizardInitialActionId, setWizardInitialActionId] = useState<
    string | undefined
  >();
  const [executionPolicy, setExecutionPolicy] = useState<{
    runAs: string;
    requireManualConfirmation: boolean;
  } | null>(null);

  const applyWizardLaunch = (
    {
      tab,
      mode,
      initialLabelSelector,
      initialSelectedClusterNames,
      initialPrimaryActionId,
    }: OpenDeploymentWizardOptions,
    alsoOpen: boolean,
  ) => {
    const preset = getWizardPresetForTab(tab);
    setWizardLaunchTab(tab);
    setWizardEntryMode(mode ?? preset.entryMode);
    setWizardInitialLabel(initialLabelSelector);
    setWizardInitialClusterNames(initialSelectedClusterNames);
    setWizardInitialActionId(initialPrimaryActionId);
    setWizardSessionId((n) => n + 1);
    if (alsoOpen) {
      setIsWizardOpen(true);
    }
  };

  const openWizard = (opts: OpenDeploymentWizardOptions) => {
    applyWizardLaunch(opts, true);
  };

  const reconfigureWizard = (opts: OpenDeploymentWizardOptions) => {
    applyWizardLaunch(opts, false);
  };

  useEffect(() => {
    const st = location.state as
      | { fleetPlanFromClusters?: FleetPlanFromClustersState }
      | null
      | undefined;
    if (!st?.fleetPlanFromClusters) return;
    const p = st.fleetPlanFromClusters;
    const tab = p.tab ?? 'clusters';
    const preset = getWizardPresetForTab(tab);
    setWizardLaunchTab(tab);
    setWizardEntryMode(p.mode ?? preset.entryMode);
    setWizardInitialLabel(p.initialLabelSelector);
    setWizardInitialClusterNames(p.initialSelectedClusterNames);
    setWizardInitialActionId(p.initialPrimaryActionId ?? 'update-ocp-4.18');
    setWizardSessionId((n) => n + 1);
    setIsWizardOpen(true);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location, navigate]);

  const handleWizardComplete = (wizardFormData?: any) => {
    setIsWizardOpen(false);
    setWizardInitialLabel(undefined);
    setWizardInitialClusterNames(undefined);
    setWizardInitialActionId(undefined);
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
    setWizardInitialClusterNames(undefined);
    setWizardInitialActionId(undefined);
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
          <PageTitle className="!mb-0">
            {deploymentCopy.fleetPlan.pageTitle}
          </PageTitle>
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
          key={`w-${wizardSessionId}-${wizardLaunchTab}-${wizardEntryMode}-${wizardInitialLabel ?? ''}-${(wizardInitialClusterNames ?? []).join(',')}-${wizardInitialActionId ?? ''}`}
          entryMode={wizardEntryMode}
          launchTab={wizardLaunchTab}
          initialLabelSelector={wizardInitialLabel}
          initialSelectedClusterNames={wizardInitialClusterNames}
          initialPrimaryActionId={wizardInitialActionId}
          onReconfigure={reconfigureWizard}
          onComplete={handleWizardComplete}
          onCancel={handleWizardCancel}
        />
      )}
    </Container>
  );
}