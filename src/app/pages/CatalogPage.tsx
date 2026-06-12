import { PageTitle, BodyText, Container } from "../../imports/UIComponents";

export function CatalogPage() {
  return (
    <Container className="p-8">
      <div className="mb-8">
        <PageTitle>Catalog</PageTitle>
        <BodyText muted>
          Browse and install add-ons for your OpenShift fleet
        </BodyText>
      </div>
    </Container>
  );
}
