import React from 'react';

interface CheckboxProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ label, checked = false, onChange, indeterminate = false, disabled = false, className = '' }: CheckboxProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label className={`inline-flex items-center gap-2.5 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
      <span className="relative flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        <input
          ref={inputRef}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={e => onChange?.(e.target.checked)}
          className="peer absolute inset-0 cursor-pointer opacity-0"
          aria-checked={indeterminate ? 'mixed' : checked}
        />
        <span className="absolute inset-0 rounded-[4px] border border-border bg-transparent transition-colors duration-base peer-focus-visible:ring-2 peer-focus-visible:ring-interactive-focus peer-checked:border-interactive-accent peer-checked:bg-interactive-accent" />
        {(checked || indeterminate) && (
          <svg
            className="relative z-10 text-white"
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          >
            {indeterminate ? (
              <line x1="5" y1="12" x2="19" y2="12" />
            ) : (
              <polyline points="20 6 9 17 4 12" />
            )}
          </svg>
        )}
      </span>
      {label && <span className="text-body-sm text-text-primary">{label}</span>}
    </label>
  );
}

Checkbox.displayName = 'Checkbox';
export type { CheckboxProps };