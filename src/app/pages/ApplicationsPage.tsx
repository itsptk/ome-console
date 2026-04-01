import { PageTitle, BodyText, Container } from '../../imports/UIComponents';

export function ApplicationsPage() {
  return (
    <Container className="p-8">
      <div className="mb-8">
        <PageTitle>Applications</PageTitle>
        <BodyText muted>
          Deploy and manage applications across clusters
        </BodyText>
      </div>
    </Container>
  );
}
