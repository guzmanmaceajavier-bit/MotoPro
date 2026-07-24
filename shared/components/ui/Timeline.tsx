import React from 'react';

interface Step {
  id: string;
  label: string;
  date?: string;
  status: 'completed' | 'active' | 'pending';
}

interface TimelineProps {
  steps: Step[];
  className?: string;
}

const dotStyles: Record<string, string> = {
  completed: 'bg-interactive-accent',
  active: 'border-2 border-interactive-accent bg-transparent animate-pulse',
  pending: 'bg-surface-tertiary',
};

export function Timeline({ steps, className = '' }: TimelineProps) {
  return (
    <div className={`relative pl-8 ${className}`}>
      <div className="absolute left-[15px] top-2 h-[calc(100%-16px)] w-0.5 bg-border" />
      <div className="space-y-6">
        {steps.map(step => (
          <div key={step.id} className="relative">
            <span className={`absolute -left-8 top-1 z-10 h-3 w-3 rounded-full ${dotStyles[step.status]}`} />
            <div className="space-y-0.5">
              <p className={`text-body-sm font-medium ${step.status === 'pending' ? 'text-text-tertiary' : 'text-text-primary'}`}>
                {step.label}
              </p>
              {step.date && <p className="text-tiny text-text-tertiary">{step.date}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Timeline.displayName = 'Timeline';
export type { TimelineProps, Step };