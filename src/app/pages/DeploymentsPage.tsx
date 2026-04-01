import { useState } from 'react';
import { PageTitle, BodyText, Container } from '../../imports/UIComponents';
import { EmptyStateScreen } from '../components/deployments/EmptyStateScreen';
import { DeploymentWizard } from '../components/deployments/DeploymentWizard';
import { ActivityStreamScreen } from '../components/deployments/ActivityStreamScreen';

export function DeploymentsPage() {
  const [hasDeployments, setHasDeployments] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [executionPolicy, setExecutionPolicy] = useState<{
    runAs: string;
    requireManualConfirmation: boolean;
  } | null>(null);

  const handleCreateDeployment = () => {
    setIsWizardOpen(true);
  };

  const handleWizardComplete = (wizardFormData?: any) => {
    setIsWizardOpen(false);
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
  };

  return (
    <Container className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <PageTitle>Deployments</PageTitle>
        <BodyText muted>
          Monitor and manage fleet-wide changes
        </BodyText>
      </div>

      {/* Content */}
      {!hasDeployments ? (
        <EmptyStateScreen onCreateClick={handleCreateDeployment} />
      ) : (
        <ActivityStreamScreen 
          onCreateClick={handleCreateDeployment} 
          executionPolicy={executionPolicy}
        />
      )}

      {/* Wizard Modal */}
      {isWizardOpen && (
        <DeploymentWizard 
          onComplete={handleWizardComplete} 
          onCancel={handleWizardCancel} 
        />
      )}
    </Container>
  );
}