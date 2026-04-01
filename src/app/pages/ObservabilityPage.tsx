import { PageTitle, BodyText, Container } from '../../imports/UIComponents';

export function ObservabilityPage() {
  return (
    <Container className="p-8">
      <div className="mb-8">
        <PageTitle>Observability</PageTitle>
        <BodyText muted>
          Monitor and analyze cluster metrics and logs
        </BodyText>
      </div>
    </Container>
  );
}
