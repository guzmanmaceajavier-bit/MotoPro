import React from 'react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  dismissible?: boolean;
  onClose?: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  info: 'border-l-status-info bg-[var(--status-info-bg)]/10',
  success: 'border-l-status-success bg-[var(--status-success-bg)]/10',
  warning: 'border-l-status-warning bg-[var(--status-warning-bg)]/10',
  error: 'border-l-status-error bg-[var(--status-error-bg)]/10',
};

const iconMap: Record<AlertVariant, React.ReactNode> = {
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
};

export function Alert({ variant = 'info', dismissible = false, onClose, icon, children, className = '' }: AlertProps) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-2.5 rounded-sm border-l-[3px] px-4 py-3 text-body-sm ${variantStyles[variant]} ${className}`}
    >
      <span className="mt-0.5 shrink-0 text-current">{icon || iconMap[variant]}</span>
      <span className="flex-1 text-text-primary">{children}</span>
      {dismissible && (
        <button
          onClick={onClose}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-text-tertiary hover:text-text-secondary transition-colors"
          aria-label="Cerrar"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}

Alert.displayName = 'Alert';
export type { AlertProps, AlertVariant };