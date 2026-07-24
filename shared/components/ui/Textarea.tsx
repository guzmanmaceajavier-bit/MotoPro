import React, { forwardRef } from 'react';

type TextareaVariant = 'default' | 'filled';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: TextareaVariant;
  error?: string;
  helperText?: string;
  label?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ variant = 'default', error, helperText, label, containerClassName = '', className = '', ...props }, ref) => {
    return (
      <div className={`space-y-1 ${containerClassName}`}>
        {label && (
          <label className="block text-caption font-medium text-text-secondary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`block w-full rounded-sm border bg-surface-primary px-3 py-2 text-body-sm text-text-primary placeholder:text-text-tertiary transition-all duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-focus focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-surface-tertiary read-only:bg-surface-tertiary ${
            variant === 'filled'
              ? 'border-transparent bg-surface-tertiary'
              : 'border-border'
          } ${
            error
              ? 'border-status-error focus-visible:ring-status-error'
              : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="text-tiny text-status-error">{error}</p>}
        {helperText && !error && <p className="text-tiny text-text-tertiary">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export type { TextareaProps, TextareaVariant };