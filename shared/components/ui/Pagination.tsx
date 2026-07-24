import React from 'react';

interface PaginationProps {
  page: number;
  perPage: number;
  total: number;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, perPage, total, onChange, className = '' }: PaginationProps) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const getPages = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    const delta = 1;
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);
    pages.push(1);
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  const btn = 'flex h-8 w-8 items-center justify-center rounded-sm text-body-sm font-medium transition-colors duration-fast focus-visible:ring-2 focus-visible:ring-interactive-focus';

  return (
    <nav className={`flex items-center gap-0.5 ${className}`} aria-label="Paginación">
      <button
        className={`${btn} ${page <= 1 ? 'text-text-tertiary opacity-30 cursor-not-allowed' : 'text-text-secondary hover:bg-surface-tertiary'}`}
        disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Anterior"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} className="flex h-8 w-8 items-center justify-center text-text-tertiary text-body-sm">...</span>
        ) : (
          <button
            key={p}
            className={`${btn} ${p === page ? 'bg-interactive-accent text-white shadow-sm' : 'text-text-secondary hover:bg-surface-tertiary'}`}
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Página ${p}`}
          >
            {p}
          </button>
        )
      )}
      <button
        className={`${btn} ${page >= totalPages ? 'text-text-tertiary opacity-30 cursor-not-allowed' : 'text-text-secondary hover:bg-surface-tertiary'}`}
        disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Siguiente"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </nav>
  );
}

Pagination.displayName = 'Pagination';
export type { PaginationProps };
