import { CONCEPTUAL_DESIGN_PINK } from '../app/conceptualDesignPink';

export function ConceptualLabel() {
  return (
    <div 
      className="fixed bottom-20 right-4 px-3 py-2 bg-background/80 backdrop-blur-sm border z-50"
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
  );
}