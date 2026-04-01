import { PageTitle, BodyText, SectionTitle } from '../../imports/UIComponents';
import { ClusterMetrics } from './ClusterMetrics';
import { AlertsPanel } from './AlertsPanel';
import { GlobalMapView } from './GlobalMapView';
import { ActivityStream } from './ActivityStream';
import { GettingStartedChecklist } from './GettingStartedChecklist';

export function ClusterOverview() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <PageTitle>Overview</PageTitle>
        <BodyText muted>
          Monitor and manage your OpenShift fleet
        </BodyText>
      </div>

      {/* Getting Started Checklist */}
      <div className="mb-8">
        <GettingStartedChecklist />
      </div>

      {/* Metrics Grid */}
      <div className="mb-8">
        <ClusterMetrics />
      </div>

      {/* Global Map */}
      <div className="mb-8">
        <SectionTitle className="mb-4">Global Overview</SectionTitle>
        <GlobalMapView />
      </div>

      {/* Activity Stream */}
      <div>
        <SectionTitle className="mb-4">Recent Activity</SectionTitle>
        <ActivityStream />
      </div>
    </div>
  );
}
