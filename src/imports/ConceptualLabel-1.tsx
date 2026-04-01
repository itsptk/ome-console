import { Home } from 'lucide-react';

export function ConceptualLabel() {
  return (
    <div className="fixed bottom-20 right-4 flex items-center gap-2 z-50">
      {/* Home Button */}
      <a
        href="https://drop-shut-45494522.figma.site"
        className="px-3 py-2 bg-background/80 backdrop-blur-sm border hover:opacity-80 transition-opacity flex items-center justify-center"
        style={{ 
          borderColor: '#FF13F0',
          borderRadius: 'var(--radius)',
          color: '#FF13F0',
          cursor: 'pointer',
        }}
        aria-label="Return to home"
      >
        <Home className="w-4 h-4" />
      </a>

      {/* Conceptual Label */}
      <div 
        className="px-3 py-2 bg-background/80 backdrop-blur-sm border"
        style={{ 
          borderColor: '#FF13F0',
          borderRadius: 'var(--radius)',
          fontFamily: 'var(--font-family-mono)',
          fontSize: 'var(--text-sm)',
          fontWeight: 700,
          color: '#FF13F0'
        }}
      >
        Conceptual design - Not for Implementation
      </div>
    </div>
  );
}