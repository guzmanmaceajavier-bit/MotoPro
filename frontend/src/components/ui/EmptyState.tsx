import { type ReactNode } from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      <div className="w-16 h-16 rounded-full bg-surface-tertiary flex items-center justify-center mb-4">
        {icon || <Inbox className="w-8 h-8 text-text-tertiary" />}
      </div>
      <h3 className="text-base font-bold text-text-primary mb-1">{title}</h3>
      {description && <p className="text-sm text-text-tertiary max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}
