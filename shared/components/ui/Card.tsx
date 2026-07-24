import React from 'react';

type CardVariant = 'base' | 'interactive' | 'elevated';

interface CardProps {
  variant?: CardVariant;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  base: 'bg-surface-secondary border border-border',
  interactive: 'bg-surface-secondary border border-border hover:border-border-accent hover:-translate-y-0.5 cursor-pointer transition-all duration-base ease-out',
  elevated: 'bg-surface-elevated border border-border shadow-elevation-1',
};

export function Card({ variant = 'base', className = '', onClick, children }: CardProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      className={`rounded-lg p-[var(--density-padding-card)] ${variantStyles[variant]} ${className}`}
      onClick={onClick}
      {...(onClick ? { type: 'button' as const } : {})}
    >
      {children}
    </Tag>
  );
}

Card.displayName = 'Card';
export type { CardProps, CardVariant };
