import { PageTitle, BodyText, Container } from '../../imports/UIComponents';

export function VirtualMachinesPage() {
  return (
    <Container className="p-8">
      <div className="mb-8">
        <PageTitle>Virtual Machines</PageTitle>
        <BodyText muted>
          Manage virtual machines across your clusters
        </BodyText>
      </div>
    </Container>
  );
}
