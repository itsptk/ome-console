import { PageTitle, BodyText, Container } from '../../imports/UIComponents';

export function SettingsPage() {
  return (
    <Container className="p-8">
      <div className="mb-8">
        <PageTitle>Settings</PageTitle>
        <BodyText muted>
          Configure system preferences and options
        </BodyText>
      </div>
    </Container>
  );
}
