import { type ReactNode } from "react";
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from "lucide-react";

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  children: ReactNode;
  variant?: AlertVariant;
  title?: string;
  className?: string;
  onClose?: () => void;
}

const variantStyles: Record<AlertVariant, { container: string; icon: string; title: string; text: string }> = {
  info: {
    container: "bg-blue-500/5 border-blue-500/20",
    icon: "text-blue-400",
    title: "text-blue-400",
    text: "text-text-secondary",
  },
  success: {
    container: "bg-green-500/5 border-green-500/20",
    icon: "text-green-400",
    title: "text-green-400",
    text: "text-text-secondary",
  },
  warning: {
    container: "bg-amber-500/5 border-amber-500/20",
    icon: "text-amber-400",
    title: "text-amber-400",
    text: "text-text-secondary",
  },
  error: {
    container: "bg-red-500/5 border-red-500/20",
    icon: "text-red-400",
    title: "text-red-400",
    text: "text-text-secondary",
  },
};

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

export function Alert({ children, variant = "info", title, className = "", onClose }: AlertProps) {
  const Icon = icons[variant];
  const styles = variantStyles[variant];
  return (
    <div className={`relative flex items-start gap-3 rounded-xl border p-4 ${styles.container} ${className}`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${styles.icon}`} />
      <div className="flex-1 min-w-0">
        {title && <p className={`text-sm font-bold ${styles.title}`}>{title}</p>}
        <div className={`text-sm ${title ? "mt-1" : ""} ${styles.text}`}>{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="shrink-0 p-1 text-text-tertiary hover:text-text-primary transition-colors">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
