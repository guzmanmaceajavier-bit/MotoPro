import React from 'react';

interface ProgressBarProps {
  value?: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function ProgressBar({ value = 0, max = 100, label, showValue = false, className = '' }: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const isIndeterminate = value === undefined;
  return (
    <div className={`space-y-1 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-tiny font-medium text-text-secondary">{label}</span>}
          {showValue && <span className="text-tiny text-text-secondary">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="h-1 w-full overflow-hidden rounded-full bg-surface-tertiary">
        <div
          className={`h-full rounded-full bg-interactive-accent transition-all duration-500 ease-out ${isIndeterminate ? 'w-1/2 animate-pulse' : ''}`}
          style={isIndeterminate ? {} : { width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={isIndeterminate ? undefined : value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}

ProgressBar.displayName = 'ProgressBar';
export type { ProgressBarProps };