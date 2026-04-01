import { useState, useEffect } from 'react';
import { ActivityStream } from './ActivityStream';
import { IconButton, SmallText } from '../../imports/UIComponents';

export function BottomPanel() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [height, setHeight] = useState(280);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    const newHeight = window.innerHeight - e.clientY;
    if (newHeight >= 200 && newHeight <= 600) {
      setHeight(newHeight);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  return (
    <div
      className="flex flex-col bg-card border-t"
      style={{
        borderColor: 'var(--border)',
        height: isCollapsed ? 'auto' : `${height}px`,
        minHeight: isCollapsed ? 'auto' : '200px',
        maxHeight: isCollapsed ? 'auto' : '600px'
      }}
    >
      {/* Resize Handle */}
      {!isCollapsed && (
        <div
          className="h-1 cursor-ns-resize hover:bg-primary transition-colors"
          style={{ backgroundColor: isResizing ? 'var(--primary)' : 'transparent' }}
          onMouseDown={handleMouseDown}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-4">
          {/* Title */}
          <div
            style={{
              fontFamily: 'var(--font-family-text)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--foreground)'
            }}
          >
            Activity Stream
          </div>

          {/* Description */}
          <SmallText muted>
            Real-time operations and events
          </SmallText>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <IconButton
            aria-label="Refresh"
            onClick={() => {}}
          >
            <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
              <path
                d="M13.65 2.35C12.2 0.9 10.21 0 8 0C3.58 0 0.01 3.58 0.01 8C0.01 12.42 3.58 16 8 16C11.73 16 14.84 13.45 15.73 10H13.65C12.83 12.33 10.61 14 8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2C9.66 2 11.14 2.69 12.22 3.78L9 7H16V0L13.65 2.35Z"
                fill="currentColor"
              />
            </svg>
          </IconButton>
          
          <IconButton
            aria-label={isCollapsed ? "Expand" : "Collapse"}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
              {isCollapsed ? (
                <path d="M4 10L8 6L12 10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              ) : (
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              )}
            </svg>
          </IconButton>

          <IconButton
            aria-label="Close"
            onClick={() => {}}
          >
            <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </IconButton>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="flex-1 overflow-hidden">
          <ActivityStream />
        </div>
      )}
    </div>
  );
}