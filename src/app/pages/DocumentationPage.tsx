import { PageTitle, BodyText, Container } from '../../imports/UIComponents';

export function DocumentationPage() {
  return (
    <Container className="p-8">
      <div className="mb-8">
        <PageTitle>Documentation</PageTitle>
        <BodyText muted>
          Access guides, tutorials, and API documentation
        </BodyText>
      </div>
    </Container>
  );
}
