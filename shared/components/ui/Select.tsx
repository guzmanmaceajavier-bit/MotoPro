import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  containerClassName?: string;
}

export function Select({ label, error, options, placeholder, containerClassName = '', className = '', ...props }: SelectProps) {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-caption font-medium text-text-secondary">{label}</label>
      )}
      <div className="relative">
        <select
          className={`h-10 w-full appearance-none rounded-sm border bg-surface-secondary px-3 pr-10 text-body-sm text-text-primary placeholder:text-text-tertiary outline-none transition-all duration-base ease-out focus:border-interactive-focus focus:ring-2 focus:ring-interactive-focus disabled:opacity-40 disabled:cursor-not-allowed ${error ? 'border-status-error ring-1 ring-status-error' : 'border-border'} ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-text-tertiary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
      {error && <p className="text-tiny text-status-error">{error}</p>}
    </div>
  );
}

Select.displayName = 'Select';
export type { SelectProps };