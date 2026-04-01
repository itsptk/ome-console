import { PageTitle, BodyText, Container, SecondaryButton } from '../../imports/UIComponents';
import { useNavigate } from 'react-router';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Container className="p-8">
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center max-w-md">
          <PageTitle className="mb-4">404 - Page Not Found</PageTitle>
          <BodyText muted className="mb-8">
            The page you're looking for doesn't exist or has been moved.
          </BodyText>
          <SecondaryButton onClick={() => navigate('/')}>
            Go to Overview
          </SecondaryButton>
        </div>
      </div>
    </Container>
  );
}
