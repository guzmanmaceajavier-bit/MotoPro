import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({ variant = "primary", size = "md", loading, children, className = "", disabled, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-md font-semibold select-none whitespace-nowrap transition-all duration-base ease-out active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-interactive-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary disabled:opacity-[var(--interactive-disabled)] disabled:cursor-not-allowed disabled:active:scale-100";
  const variants = {
    primary: "bg-interactive-accent text-white hover:bg-interactive-accent-hover shadow-[0_1px_2px_rgba(255,107,0,0.2)]",
    secondary: "border border-border bg-surface-secondary text-text-secondary hover:text-text-primary hover:bg-surface-tertiary",
    ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-tertiary",
  };
  const sizes = {
    sm: "h-8 px-3 text-caption gap-1.5",
    md: "h-10 px-4 text-body-sm gap-2",
    lg: "h-12 px-6 text-body gap-2.5",
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${loading ? "relative pointer-events-none" : ""} ${className}`} disabled={disabled || loading} {...props}>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
        </span>
      )}
      <span className={loading ? "invisible" : "inline-flex items-center gap-2"}>{children}</span>
    </button>
  );
}
