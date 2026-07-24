import React from 'react';

interface StepItem {
  id: string;
  label: string;
  status: 'completed' | 'active' | 'pending';
}

interface StepperProps {
  steps: StepItem[];
  className?: string;
}

export function Stepper({ steps, className = '' }: StepperProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {steps.map((step, i) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-1.5">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-body-sm font-medium transition-colors duration-base ${
                step.status === 'completed'
                  ? 'bg-interactive-accent text-white'
                  : step.status === 'active'
                    ? 'border-2 border-interactive-accent text-interactive-accent'
                    : 'bg-surface-tertiary text-text-tertiary'
              }`}
            >
              {step.status === 'completed' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                steps.indexOf(step) + 1
              )}
            </span>
            <span className={`text-tiny font-medium ${step.status === 'pending' ? 'text-text-tertiary' : 'text-text-secondary'}`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 ${step.status === 'completed' ? 'bg-interactive-accent' : 'bg-border'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

Stepper.displayName = 'Stepper';
export type { StepperProps, StepItem };