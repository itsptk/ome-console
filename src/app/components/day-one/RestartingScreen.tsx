import { useState, useEffect } from 'react';
import { ConceptualLabel } from '../../../imports/ConceptualLabel-1';

interface RestartingScreenProps {
  onComplete: () => void;
}

export function RestartingScreen({ onComplete }: RestartingScreenProps) {
  const [lines, setLines] = useState<string[]>([
    'Stopping console service...',
    'Applying configuration changes...',
  ]);

  useEffect(() => {
    const timings = [
      { delay: 800, text: 'Updating backing store configuration...' },
      { delay: 1400, text: 'Configuring authentication provider...' },
      { delay: 2000, text: 'Restarting console service...' },
      { delay: 2800, text: 'Console is starting on http://localhost:3000' },
      { delay: 3400, text: 'Ready.' },
    ];

    timings.forEach(({ delay, text }) => {
      setTimeout(() => {
        setLines(prev => [...prev, text]);
      }, delay);
    });

    // Transition to login screen
    setTimeout(() => {
      onComplete();
    }, 4200);
  }, [onComplete]);

  return (
    <div 
      className="min-h-screen p-8 flex items-center justify-center"
      style={{ backgroundColor: '#1a1a1a' }}
    >
      <div 
        className="w-full max-w-4xl p-6 border"
        style={{ 
          backgroundColor: '#0d0d0d',
          borderColor: '#333',
          borderRadius: 'var(--radius)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Terminal Header */}
        <div className="flex items-center gap-2 pb-3 mb-4 border-b" style={{ borderColor: '#333' }}>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          </div>
          <span 
            className="ml-3"
            style={{ 
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#666'
            }}
          >
            terminal
          </span>
        </div>

        {/* Terminal Content */}
        <div className="space-y-1">
          {lines.map((line, index) => (
            <div 
              key={index}
              style={{ 
                fontFamily: 'monospace',
                fontSize: '14px',
                color: line.includes('Ready') ? '#4af626' : '#c7c7c7',
                lineHeight: '1.6'
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
      
      <ConceptualLabel />
    </div>
  );
}