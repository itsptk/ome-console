import { PageTitle, BodyText, Container } from '../../imports/UIComponents';

export function SecurityPage() {
  return (
    <Container className="p-8">
      <div className="mb-8">
        <PageTitle>Security</PageTitle>
        <BodyText muted>
          Monitor security posture and compliance
        </BodyText>
      </div>
    </Container>
  );
}
