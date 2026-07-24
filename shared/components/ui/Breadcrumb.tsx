import React from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-1.5 text-caption text-text-tertiary">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
            {item.current ? (
              <span className="font-semibold text-text-secondary" aria-current="page">
                {item.label}
              </span>
            ) : (
              <a
                href={item.href || '#'}
                className="hover:text-text-secondary transition-colors duration-fast"
              >
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

Breadcrumb.displayName = 'Breadcrumb';
export type { BreadcrumbProps, BreadcrumbItem };