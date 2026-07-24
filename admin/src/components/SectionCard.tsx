import { ReactNode } from "react";

interface Props {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export default function SectionCard({ title, description, children, className = "" }: Props) {
  return (
    <div className={`rounded-lg border border-border bg-surface-secondary ${className}`}>
      {title && (
        <div className="px-5 py-4 border-b border-border-subtle">
          <h3 className="text-caption font-semibold text-text-primary">{title}</h3>
          {description && <p className="text-tiny text-text-tertiary mt-0.5">{description}</p>}
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}
