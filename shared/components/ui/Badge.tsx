import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface-tertiary text-text-secondary',
  success: 'bg-[var(--status-success-bg)] text-status-success',
  warning: 'bg-[var(--status-warning-bg)] text-status-warning',
  danger: 'bg-[var(--status-error-bg)] text-status-error',
  info: 'bg-[var(--status-info-bg)] text-status-info',
  accent: 'bg-[rgba(20,184,166,0.12)] text-interactive-accent',
};

export function Badge({ variant = 'default', dot = false, removable = false, onRemove, children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 h-[22px] px-2.5 text-tiny font-semibold rounded-full whitespace-nowrap ${variantStyles[variant]} ${className}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
      {removable && (
        <button onClick={onRemove} className="flex items-center justify-center ml-0.5 hover:opacity-70 transition-opacity" aria-label="Remover">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </span>
  );
}

Badge.displayName = 'Badge';
export type { BadgeProps, BadgeVariant };
