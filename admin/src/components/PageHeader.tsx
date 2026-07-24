import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface Crumb { label: string; to?: string; }
interface Tab { key: string; label: string; count?: number; }

interface Props {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  action?: React.ReactNode;
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  icon?: React.ReactNode;
}

export default function PageHeader({ title, description, breadcrumbs, action, tabs, activeTab, onTabChange, icon }: Props) {
  return (
    <div className="mb-6 animate-fade-in">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-xs text-[var(--mp-text-tertiary)] mb-2" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={10} strokeWidth={2} className="text-[var(--mp-text-tertiary)]" />}
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-[var(--mp-text-secondary)] transition-colors">{crumb.label}</Link>
              ) : (
                <span className="text-[var(--mp-text-secondary)]">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(20,184,166,0.1)] text-[var(--mp-accent)] shrink-0">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-[var(--mp-text-primary)] tracking-tight">{title}</h1>
            {description && <p className="text-sm text-[var(--mp-text-tertiary)] mt-0.5">{description}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Tabs */}
      {tabs && tabs.length > 0 && (
        <div className="flex items-center gap-1 mt-5 border-b border-[var(--mp-border)]" role="tablist">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => onTabChange?.(tab.key)}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${
                activeTab === tab.key ? "text-[var(--mp-accent)]" : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-secondary)]"
              }`}
              type="button" role="tab" aria-selected={activeTab === tab.key}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? "bg-[var(--mp-accent-glow)] text-[var(--mp-accent)]" : "bg-[var(--mp-bg-elevated)] text-[var(--mp-text-tertiary)]"
                }`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[var(--mp-accent)]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
