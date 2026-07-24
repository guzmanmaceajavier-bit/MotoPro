import React from 'react';

interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked = false, onChange, label, disabled = false, className = '' }: SwitchProps) {
  return (
    <label className={`inline-flex items-center gap-2.5 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors duration-base ease-out focus-visible:ring-2 focus-visible:ring-interactive-focus ${checked ? 'bg-interactive-accent' : 'bg-surface-tertiary'}`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-base ease-out ${checked ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </button>
      {label && <span className="text-body-sm text-text-primary">{label}</span>}
    </label>
  );
}

Switch.displayName = 'Switch';
export type { SwitchProps };