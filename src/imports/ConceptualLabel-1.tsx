import { Home } from 'lucide-react';
import { Link } from 'react-router';
import { CONCEPTUAL_DESIGN_PINK } from '../app/conceptualDesignPink';

export function ConceptualLabel() {
  return (
    <div className="fixed bottom-20 right-4 flex items-center gap-2 z-50">
      {/* Home Button — prototype title page */}
      <Link
        to="/"
        className="px-3 py-2 bg-background/80 backdrop-blur-sm border hover:opacity-80 transition-opacity flex items-center justify-center"
        style={{
          borderColor: CONCEPTUAL_DESIGN_PINK,
          borderRadius: 'var(--radius)',
          color: CONCEPTUAL_DESIGN_PINK,
        }}
        aria-label="Return to prototype title page"
      >
        <Home className="w-4 h-4" />
      </Link>

      {/* Conceptual Label */}
      <div 
        className="px-3 py-2 bg-background/80 backdrop-blur-sm border"
        style={{ 
          borderColor: CONCEPTUAL_DESIGN_PINK,
          borderRadius: 'var(--radius)',
          fontFamily: 'var(--font-family-mono)',
          fontSize: 'var(--text-sm)',
          fontWeight: 700,
          color: CONCEPTUAL_DESIGN_PINK
        }}
      >
        Conceptual design - Not for Implementation
      </div>
    </div>
  );
}