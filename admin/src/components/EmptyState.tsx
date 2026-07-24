import { LucideIcon, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { ReactNode } from "react";

interface Action {
  label: string;
  to?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  variant?: "primary" | "secondary";
}

interface Props {
  icon: LucideIcon | ReactNode;
  title: string;
  description?: string;
  message?: string;
  actions?: Action[];
  className?: string;
}

export default function EmptyState({ icon: Icon, title, description, message, actions, className = "" }: Props) {
  const iconContent = typeof Icon === "function" && "prototype" in Icon
    ? <Icon size={24} strokeWidth={1.5} />
    : Icon;

  return (
    <div className={`relative min-h-[300px] flex flex-col items-center justify-center overflow-hidden rounded-lg border border-[var(--mp-border)] bg-[var(--mp-bg-surface)] ${className}`}>
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, var(--mp-text-primary, #f1f5f9) 1px, transparent 0)`,
        backgroundSize: '24px 24px',
      }} />
      <div className="relative z-10 flex flex-col items-center text-center px-6 py-12 max-w-sm mx-auto">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 bg-[rgba(20,184,166,0.1)] text-[var(--mp-accent)]">
          {iconContent}
        </div>
        <h3 className="text-lg font-semibold text-[var(--mp-text-primary)] mb-1.5">{title}</h3>
        <p className="text-sm text-[var(--mp-text-tertiary)] leading-relaxed mb-6">{description || message}</p>
        {actions && actions.length > 0 && (
          <div className="flex items-center gap-3">
            {actions.map((action, idx) => {
              const ActionIcon = action.icon || Plus;
              const btn = (
                <span className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  action.variant === "secondary"
                    ? 'border border-[var(--mp-border)] bg-[var(--mp-bg-surface)] text-[var(--mp-text-secondary)] hover:bg-[var(--mp-bg-hover)]'
                    : 'bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white shadow-sm'
                }`}>
                  <ActionIcon size={14} strokeWidth={2} />
                  {action.label}
                </span>
              );
              if (action.to) return <Link key={idx} to={action.to} onClick={action.onClick}>{btn}</Link>;
              return <button key={idx} onClick={action.onClick} type="button">{btn}</button>;
            })}
          </div>
        )}
      </div>
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full pointer-events-none bg-[rgba(20,184,166,0.04)]" />
    </div>
  );
}
