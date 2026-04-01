import { PageTitle, BodyText, Container } from '../../imports/UIComponents';

export function PoliciesPage() {
  return (
    <Container className="p-8">
      <div className="mb-8">
        <PageTitle>Governance</PageTitle>
        <BodyText muted>
          Manage policies and compliance across your fleet
        </BodyText>
      </div>
    </Container>
  );
}
