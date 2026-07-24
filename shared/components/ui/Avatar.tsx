import React from 'react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeStyles: Record<string, string> = {
  sm: 'h-6 w-6 text-tiny',
  md: 'h-8 w-8 text-body-sm',
  lg: 'h-10 w-10 text-body',
  xl: 'h-16 w-16 text-h5',
};

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`rounded-full object-cover bg-surface-tertiary ${sizeStyles[size]} ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-interactive-primary text-white font-semibold ${sizeStyles[size]} ${className}`}
      aria-label={name || 'Avatar placeholder'}
    >
      {getInitials(name)}
    </span>
  );
}

Avatar.displayName = 'Avatar';
export type { AvatarProps };