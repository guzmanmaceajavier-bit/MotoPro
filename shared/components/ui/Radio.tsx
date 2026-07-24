import React from 'react';

interface RadioProps {
  name: string;
  value: string;
  label?: string;
  checked?: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function Radio({ name, value, label, checked = false, onChange, disabled = false, className = '' }: RadioProps) {
  return (
    <label className={`inline-flex items-center gap-2.5 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
      <span className="relative flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={() => onChange?.(value)}
          className="peer absolute inset-0 cursor-pointer opacity-0"
        />
        <span className="absolute inset-0 rounded-full border border-border bg-transparent transition-colors duration-base peer-focus-visible:ring-2 peer-focus-visible:ring-interactive-focus peer-checked:border-interactive-accent" />
        {checked && (
          <span className="relative z-10 h-2 w-2 rounded-full bg-interactive-accent" />
        )}
      </span>
      {label && <span className="text-body-sm text-text-primary">{label}</span>}
    </label>
  );
}

Radio.displayName = 'Radio';
export type { RadioProps };