import { ReactNode, HTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

/**
 * UI Components Library
 * All components use CSS design system variables from theme.css and tailwind config
 */

// ============================================================================
// TYPOGRAPHY COMPONENTS
// ============================================================================

interface PageTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function PageTitle({ children, className = '', ...props }: PageTitleProps) {
  return (
    <h1
      className={`mb-2 ${className}`}
      style={{
        fontFamily: 'var(--font-family-display)',
        fontSize: 'var(--text-2xl)',
        fontWeight: 'var(--font-weight-bold)'
      }}
      {...props}
    >
      {children}
    </h1>
  );
}

interface SectionTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function SectionTitle({ children, className = '', ...props }: SectionTitleProps) {
  return (
    <h2
      className={className}
      style={{
        fontFamily: 'var(--font-family-display)',
        fontSize: 'var(--text-xl)',
        fontWeight: 'var(--font-weight-medium)'
      }}
      {...props}
    >
      {children}
    </h2>
  );
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function CardTitle({ children, className = '', ...props }: CardTitleProps) {
  return (
    <h3
      className={`mb-1 ${className}`}
      style={{
        fontFamily: 'var(--font-family-display)',
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--font-weight-medium)'
      }}
      {...props}
    >
      {children}
    </h3>
  );
}

interface BodyTextProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
  muted?: boolean;
}

export function BodyText({ children, muted = false, className = '', ...props }: BodyTextProps) {
  return (
    <p
      className={`${muted ? 'text-muted-foreground' : ''} ${className}`}
      style={{
        fontFamily: 'var(--font-family-text)',
        fontSize: 'var(--text-base)'
      }}
      {...props}
    >
      {children}
    </p>
  );
}

interface SmallTextProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
  muted?: boolean;
}

export function SmallText({ children, muted = false, className = '', ...props }: SmallTextProps) {
  return (
    <p
      className={`${muted ? 'text-muted-foreground' : ''} ${className}`}
      style={{
        fontFamily: 'var(--font-family-text)',
        fontSize: 'var(--text-sm)'
      }}
      {...props}
    >
      {children}
    </p>
  );
}

interface TinyTextProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
  muted?: boolean;
}

export function TinyText({ children, muted = false, className = '', ...props }: TinyTextProps) {
  return (
    <p
      className={`${muted ? 'text-muted-foreground' : ''} ${className}`}
      style={{
        fontFamily: 'var(--font-family-text)',
        fontSize: 'var(--text-xs)'
      }}
      {...props}
    >
      {children}
    </p>
  );
}

interface LabelTextProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function LabelText({ children, className = '', ...props }: LabelTextProps) {
  return (
    <p
      className={`text-muted-foreground ${className}`}
      style={{
        fontFamily: 'var(--font-family-text)',
        fontSize: 'var(--text-xs)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}
      {...props}
    >
      {children}
    </p>
  );
}

// ============================================================================
// BUTTON COMPONENTS
// ============================================================================

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function PrimaryButton({ children, className = '', ...props }: PrimaryButtonProps) {
  return (
    <button
      className={`px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        fontFamily: 'var(--font-family-text)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-weight-medium)',
        borderRadius: 'var(--radius)'
      }}
      {...props}
    >
      {children}
    </button>
  );
}

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function SecondaryButton({ children, className = '', ...props }: SecondaryButtonProps) {
  return (
    <button
      className={`px-4 py-2 border hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        fontFamily: 'var(--font-family-text)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-weight-medium)',
        borderRadius: 'var(--radius)',
        borderColor: 'var(--border)'
      }}
      {...props}
    >
      {children}
    </button>
  );
}

interface DangerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function DangerButton({ children, className = '', ...props }: DangerButtonProps) {
  return (
    <button
      className={`px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        fontFamily: 'var(--font-family-text)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-weight-medium)',
        borderRadius: 'var(--radius)'
      }}
      {...props}
    >
      {children}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  'aria-label': string;
}

export function IconButton({ children, className = '', ...props }: IconButtonProps) {
  return (
    <button
      className={`p-2 hover:bg-secondary rounded transition-colors ${className}`}
      style={{ borderRadius: 'var(--radius)' }}
      {...props}
    >
      {children}
    </button>
  );
}

interface LinkButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function LinkButton({ children, className = '', ...props }: LinkButtonProps) {
  return (
    <button
      className={`text-primary hover:underline ${className}`}
      style={{
        fontFamily: 'var(--font-family-text)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-weight-medium)'
      }}
      {...props}
    >
      {children}
    </button>
  );
}

// ============================================================================
// INPUT COMPONENTS
// ============================================================================

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

export function SearchInput({ icon, className = '', ...props }: SearchInputProps) {
  return (
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>}
      <input
        type="text"
        className={`w-full h-10 ${icon ? 'pl-10' : 'pl-4'} pr-4 bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-shadow ${className}`}
        style={{
          fontFamily: 'var(--font-family-text)',
          fontSize: 'var(--text-sm)',
          borderRadius: 'var(--radius)'
        }}
        {...props}
      />
    </div>
  );
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function TextInput({ className = '', ...props }: TextInputProps) {
  return (
    <input
      type="text"
      className={`w-full px-3 py-2 border bg-background focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
      style={{
        fontFamily: 'var(--font-family-text)',
        fontSize: 'var(--text-sm)',
        borderRadius: 'var(--radius)',
        borderColor: 'var(--border)'
      }}
      {...props}
    />
  );
}

// ============================================================================
// BADGE COMPONENTS
// ============================================================================

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'destructive';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantStyles = {
    default: 'bg-muted border text-muted-foreground',
    success: 'bg-[#E7F1FA] text-[#0066CC]',
    warning: 'bg-yellow-100 border text-yellow-800',
    info: 'bg-blue-100 border text-blue-800',
    destructive: 'bg-red-100 border text-red-800'
  };

  return (
    <span
      className={`inline-block px-2 py-1 ${variantStyles[variant]} ${className}`}
      style={{
        fontFamily: 'var(--font-family-text)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-weight-medium)',
        borderRadius: 'var(--radius)',
        borderColor: variant === 'default' ? 'var(--border)' : 'transparent'
      }}
    >
      {children}
    </span>
  );
}

interface StatusDotProps {
  status: 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export function StatusDot({ status, className = '' }: StatusDotProps) {
  const statusColors = {
    success: '#3E8635',
    warning: '#F0AB00',
    error: '#C9190B',
    info: '#0066CC'
  };

  return (
    <div
      className={`w-2 h-2 rounded-full ${className}`}
      style={{ backgroundColor: statusColors[status] }}
    />
  );
}

// ============================================================================
// CARD COMPONENTS
// ============================================================================

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      className={`p-6 border bg-card ${hover ? 'transition-shadow hover:shadow-sm' : ''} ${onClick ? 'text-left w-full cursor-pointer' : ''} ${className}`}
      style={{
        borderRadius: 'var(--radius)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--elevation-sm)'
      }}
    >
      {children}
    </Component>
  );
}

interface CompactCardProps {
  children: ReactNode;
  className?: string;
}

export function CompactCard({ children, className = '' }: CompactCardProps) {
  return (
    <div
      className={`p-5 border bg-card ${className}`}
      style={{
        borderRadius: 'var(--radius)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--elevation-sm)'
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

interface DividerProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function Divider({ className = '', orientation = 'horizontal' }: DividerProps) {
  return (
    <div
      className={orientation === 'horizontal' ? `border-t ${className}` : `border-l ${className}`}
      style={{ borderColor: 'var(--border)' }}
    />
  );
}

interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '5xl' | '7xl';
}

export function Container({ children, className = '', maxWidth = '7xl' }: ContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '5xl': 'max-w-5xl',
    '7xl': 'max-w-7xl'
  };

  return (
    <div className={`${maxWidthClasses[maxWidth]} mx-auto ${className}`}>
      {children}
    </div>
  );
}

// ============================================================================
// MODAL/OVERLAY COMPONENTS
// ============================================================================

interface ModalOverlayProps {
  children: ReactNode;
  onClose: () => void;
}

export function ModalOverlay({ children, onClose }: ModalOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      {children}
    </div>
  );
}

interface ModalContentProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
}

export function ModalContent({ children, className = '', maxWidth = '3xl' }: ModalContentProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl'
  };

  return (
    <div
      className={`bg-card border ${maxWidthClasses[maxWidth]} w-full p-8 relative overflow-y-auto ${className}`}
      style={{
        borderRadius: 'var(--radius)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--elevation-lg)',
        maxHeight: 'calc(100vh - 4rem)'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

// ============================================================================
// PROGRESS COMPONENTS
// ============================================================================

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
}

export function ProgressBar({ progress, className = '' }: ProgressBarProps) {
  return (
    <div
      className={`w-full h-2 bg-muted rounded-full overflow-hidden ${className}`}
      style={{ borderRadius: 'var(--radius-xl)' }}
    >
      <div
        className="h-full bg-primary transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// ============================================================================
// ICON CONTAINER COMPONENTS
// ============================================================================

interface IconContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  bgColor?: string;
  className?: string;
}

export function IconContainer({
  children,
  size = 'md',
  color,
  bgColor,
  className = ''
}: IconContainerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center ${className}`}
      style={{
        borderRadius: 'var(--radius)',
        backgroundColor: bgColor || 'var(--primary-10)',
        color: color || 'var(--primary)'
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// PLACEHOLDER COMPONENTS
// ============================================================================

interface PlaceholderBarProps {
  width?: string;
  height?: string;
  className?: string;
}

export function PlaceholderBar({ width = '100%', height = '10px', className = '' }: PlaceholderBarProps) {
  return (
    <div
      className={`bg-muted ${className}`}
      style={{
        width,
        height,
        borderRadius: 'var(--radius)'
      }}
    />
  );
}

interface PlaceholderBoxProps {
  className?: string;
}

export function PlaceholderBox({ className = '' }: PlaceholderBoxProps) {
  return (
    <div
      className={`h-10 bg-muted ${className}`}
      style={{ borderRadius: 'var(--radius)' }}
    />
  );
}