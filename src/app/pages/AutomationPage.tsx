import { PageTitle, BodyText, Container } from '../../imports/UIComponents';

export function AutomationPage() {
  return (
    <Container className="p-8">
      <div className="mb-8">
        <PageTitle>Automation</PageTitle>
        <BodyText muted>
          Automate cluster operations and workflows
        </BodyText>
      </div>
    </Container>
  );
}
