import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: { value: string; positive: boolean };
  icon: React.ReactNode;
  iconColor?: 'teal' | 'blue' | 'orange' | 'red' | 'purple' | 'green';
}

const colorMap = {
  teal: { bg: 'bg-interactive-accent/10', text: 'text-interactive-accent' },
  blue: { bg: 'bg-status-info/10', text: 'text-status-info' },
  orange: { bg: 'bg-status-warning/10', text: 'text-status-warning' },
  red: { bg: 'bg-status-error/10', text: 'text-status-error' },
  purple: { bg: 'bg-[rgba(139,92,246,0.12)]', text: 'text-[#8b5cf6]' },
  green: { bg: 'bg-status-success/10', text: 'text-status-success' },
};

export default function KpiCard({ title, value, change, icon, iconColor = 'teal' }: KpiCardProps) {
  const colors = colorMap[iconColor];

  return (
    <div className="rounded-xl border border-border bg-surface-secondary p-5 hover:border-border-accent transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">{title}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg} ${colors.text}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight text-text-primary">{value}</p>
      {change && (
        <p className={`text-xs mt-1.5 flex items-center gap-1 ${change.positive ? 'text-status-success' : 'text-status-error'}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {change.positive
              ? <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              : <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
            }
          </svg>
          {change.value}
        </p>
      )}
    </div>
  );
}

export type { KpiCardProps };
