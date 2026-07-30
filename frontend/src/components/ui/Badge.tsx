import { type ReactNode } from "react";

type BadgeVariant = "default" | "accent" | "success" | "warning" | "error" | "info";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  className?: string;
  dot?: boolean;
  pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-surface-tertiary/50 text-text-secondary border-border",
  accent: "bg-interactive-accent/10 text-interactive-accent border-interactive-accent/20",
  success: "bg-green-500/10 text-green-400 border-green-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  error: "bg-red-500/10 text-red-400 border-red-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const sizeStyles = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
};

export function Badge({ children, variant = "default", size = "sm", className = "", dot = false, pulse = false }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${pulse ? "animate-pulse" : ""} ${
          variant === "accent" ? "bg-interactive-accent" :
          variant === "success" ? "bg-green-400" :
          variant === "warning" ? "bg-amber-400" :
          variant === "error" ? "bg-red-400" :
          variant === "info" ? "bg-blue-400" :
          "bg-text-tertiary"
        }`} />
      )}
      {children}
    </span>
  );
}
