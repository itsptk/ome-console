export function ConceptualLabel() {
  return (
    <div 
      className="fixed bottom-20 right-4 px-3 py-2 bg-background/80 backdrop-blur-sm border z-50"
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
  );
}