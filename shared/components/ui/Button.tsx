import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-interactive-accent text-white hover:bg-interactive-accent-hover shadow-[0_1px_2px_rgba(255,107,0,0.2)]',
  secondary: 'border border-border bg-surface-secondary text-text-secondary hover:text-text-primary hover:bg-surface-tertiary',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-tertiary',
  danger: 'bg-status-error/10 text-status-error hover:bg-status-error/20',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-8 px-3 text-caption gap-1.5',
  md: 'h-10 px-4 text-body-sm gap-2',
  lg: 'h-12 px-6 text-body gap-2.5',
};

export function Button({
  variant = 'primary', size = 'md', loading = false, icon, fullWidth = false,
  className = '', disabled, children, ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center rounded-sm font-semibold select-none whitespace-nowrap cursor-pointer transition-all duration-base ease-out active:scale-[0.97]',
        'focus-visible:ring-2 focus-visible:ring-interactive-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
        'disabled:opacity-[var(--interactive-disabled)] disabled:cursor-not-allowed disabled:active:scale-100',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        loading ? 'relative pointer-events-none' : '',
        className,
      ].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
        </span>
      )}
      {!loading && icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span className={loading ? 'invisible' : ''}>{children}</span>
    </button>
  );
}

Button.displayName = 'Button';
export type { ButtonProps, Variant, Size };
