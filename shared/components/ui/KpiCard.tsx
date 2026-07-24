import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: { value: string; positive: boolean };
  icon: React.ReactNode;
  iconColor?: 'teal' | 'blue' | 'orange' | 'red' | 'purple' | 'green';
}

const colorMap = {
  teal: 'bg-[rgba(20,184,166,0.12)] text-[var(--mp-accent)]',
  blue: 'bg-[rgba(59,130,246,0.12)] text-[var(--mp-info)]',
  orange: 'bg-[rgba(245,158,11,0.12)] text-[var(--mp-warning)]',
  red: 'bg-[rgba(239,68,68,0.12)] text-[var(--mp-danger)]',
  purple: 'bg-[rgba(139,92,246,0.12)] text-[#8b5cf6]',
  green: 'bg-[rgba(16,185,129,0.12)] text-[var(--mp-success)]',
};

export default function KpiCard({ title, value, change, icon, iconColor = 'teal' }: KpiCardProps) {
  return (
    <div className="mp-kpi group hover:border-[rgba(20,184,166,0.2)] transition-all duration-150">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-[var(--mp-text-tertiary)] uppercase tracking-wider">{title}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[iconColor]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight text-[var(--mp-text-primary)]">{value}</p>
      {change && (
        <p className={`text-xs mt-1.5 flex items-center gap-1 ${change.positive ? 'text-[var(--mp-success)]' : 'text-[var(--mp-danger)]'}`}>
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
