import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, rightElement, className = "", ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-caption font-semibold text-text-secondary tracking-wide mb-1.5">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full rounded-md border bg-surface-secondary text-sm text-text-primary placeholder:text-text-tertiary outline-none transition-all duration-base ease-out ${
              error ? "!border-status-error !ring-1 !ring-status-error" : "border-border hover:border-text-tertiary focus:border-interactive-focus focus:ring-2 focus:ring-interactive-focus"
            } ${icon ? "pl-10" : "pl-4"} ${rightElement ? "pr-12" : "pr-4"} py-3 ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-tiny text-status-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
