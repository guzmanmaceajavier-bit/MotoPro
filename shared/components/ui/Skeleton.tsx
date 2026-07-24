import React from 'react';

type SkeletonVariant = 'text' | 'title' | 'avatar' | 'image' | 'button' | 'card' | 'table-row';

interface SkeletonProps {
  variant?: SkeletonVariant;
  count?: number;
  className?: string;
  width?: string;
  height?: string;
  style?: React.CSSProperties;
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: 'h-3.5 w-3/5',
  title: 'h-5 w-2/5',
  avatar: 'h-10 w-10 rounded-full',
  image: 'aspect-video w-full',
  button: 'h-10 w-[100px]',
  card: 'h-48 w-full rounded-lg',
  'table-row': 'h-[52px] w-full',
};

export function Skeleton({ variant = 'text', count = 1, className = '', width, height, style }: SkeletonProps) {
  const baseClass = variantStyles[variant];
  return (
    <span className="flex flex-col gap-2" role="status" aria-label="Cargando">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`animate-pulse rounded-sm bg-surface-tertiary ${variant !== 'avatar' ? 'rounded-sm' : ''} ${baseClass} ${className}`}
          style={{ width, height, ...style }} aria-hidden="true" />
      ))}
    </span>
  );
}

Skeleton.displayName = 'Skeleton';
export type { SkeletonProps, SkeletonVariant };
