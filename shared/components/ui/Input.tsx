import React from 'react';

type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize;
  isError?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label?: string;
  helperText?: string;
  errorText?: string;
  containerClassName?: string;
}

const sizeStyles: Record<InputSize, string> = {
  sm: 'h-8 text-caption',
  md: 'h-[var(--density-input-height)] text-body-sm',
  lg: 'h-12 text-body',
};

export function Input({
  inputSize = 'md', isError = false,
  leftIcon, rightIcon, label, helperText, errorText,
  containerClassName = '', className = '', disabled, ...props
}: InputProps) {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-caption font-semibold text-text-secondary tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-tertiary [&>svg]:w-4 [&>svg]:h-4">
            {leftIcon}
          </span>
        )}
        <input
          className={[
            'w-full rounded-sm bg-transparent text-text-primary placeholder:text-text-tertiary outline-none transition-all duration-base ease-out',
            'border border-border bg-surface-secondary hover:border-text-tertiary',
            'focus:border-interactive-focus focus:ring-2 focus:ring-interactive-focus',
            isError ? '!border-status-error !ring-1 !ring-status-error !focus:ring-status-error' : '',
            sizeStyles[inputSize],
            leftIcon ? 'pl-10' : 'px-3.5',
            rightIcon ? 'pr-10' : '',
            disabled ? 'opacity-[var(--interactive-disabled)] cursor-not-allowed' : '',
            className,
          ].filter(Boolean).join(' ')}
          disabled={disabled}
          {...props}
        />
        {rightIcon && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-tertiary [&>svg]:w-4 [&>svg]:h-4">
            {rightIcon}
          </span>
        )}
      </div>
      {errorText && <p className="text-tiny text-status-error">{errorText}</p>}
      {helperText && !errorText && <p className="text-tiny text-text-tertiary">{helperText}</p>}
    </div>
  );
}

Input.displayName = 'Input';
export type { InputProps, InputSize };
