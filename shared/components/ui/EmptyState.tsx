import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon, title, message, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center gap-3 py-16 text-center ${className}`}>
      {icon && <span className="text-text-tertiary [&>svg]:w-12 [&>svg]:h-12 mb-1">{icon}</span>}
      <h3 className="text-h6 font-semibold text-text-primary">{title}</h3>
      {message && <p className="text-body-sm text-text-tertiary max-w-sm">{message}</p>}
      {action && (
        <button onClick={action.onClick} className="btn btn-primary btn-sm mt-2">
          {action.label}
        </button>
      )}
    </div>
  );
}

EmptyState.displayName = 'EmptyState';
export type { EmptyStateProps };
