import React, { useMemo, useState } from 'react';
import { Pagination } from './Pagination';

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  numeric?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string;
  hiddenOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  emptyAction?: React.ReactNode;
  error?: string;
  onRetry?: () => void;
  pageSize?: number;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns, data, keyExtractor,
  selectable = false, selectedIds = [], onSelectionChange,
  loading = false,
  emptyMessage = 'Sin datos', emptyIcon, emptyAction,
  error, onRetry, pageSize = 10, className = '',
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / pageSize);
  const paged = useMemo(() => data.slice((page - 1) * pageSize, page * pageSize), [data, page, pageSize]);

  const allSelected = data.length > 0 && data.every(d => selectedIds.includes(keyExtractor(d)));
  const someSelected = !allSelected && data.some(d => selectedIds.includes(keyExtractor(d)));

  const toggleAll = () => {
    if (allSelected) onSelectionChange?.([]);
    else onSelectionChange?.(data.map(d => keyExtractor(d)));
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) onSelectionChange?.(selectedIds.filter(x => x !== id));
    else onSelectionChange?.([...selectedIds, id]);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[var(--density-row-height)] animate-pulse rounded-sm bg-surface-tertiary" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-status-error"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
        <div><p className="text-body-sm font-medium text-text-primary">Error al cargar</p><p className="text-tiny text-text-tertiary mt-0.5">{error}</p></div>
        {onRetry && <button onClick={onRetry} className="px-4 py-2 rounded-lg border border-border bg-surface-secondary text-sm font-semibold text-text-primary hover:border-border-accent transition-colors">Reintentar</button>}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        {emptyIcon && <span className="text-text-tertiary [&>svg]:w-10 [&>svg]:h-10">{emptyIcon}</span>}
        <p className="text-body-sm font-medium text-text-primary">{emptyMessage}</p>
        {emptyAction}
      </div>
    );
  }

  const mobileCols = columns.filter(c => !c.hiddenOnMobile);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="hidden sm:block overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="h-11 bg-surface-tertiary text-caption font-semibold text-text-secondary">
              {selectable && (
                <th className="w-12 px-4 text-left">
                  <input type="checkbox" checked={allSelected} ref={el => { if (el) el.indeterminate = someSelected; }}
                    onChange={toggleAll} className="cursor-pointer accent-interactive-accent rounded-sm" />
                </th>
              )}
              {columns.map(col => (
                <th key={col.key}
                  className={`px-4 text-left ${col.sortable ? 'cursor-pointer select-none hover:text-text-primary transition-colors' : ''} ${col.numeric ? 'text-right' : ''}`}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && setPage(1)}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-text-tertiary">
                        <polyline points="18 15 12 9 6 15" />
                      </svg>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map(item => {
              const id = keyExtractor(item);
              const isSelected = selectedIds.includes(id);
              return (
                <tr key={id}
                  className={`h-[var(--density-row-height)] border-b border-border-subtle transition-colors duration-fast hover:bg-surface-tertiary ${isSelected ? 'bg-[rgba(255,107,0,0.06)]' : ''}`}
                >
                  {selectable && (
                    <td className="px-4">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleOne(id)}
                        className="cursor-pointer accent-interactive-accent rounded-sm" />
                    </td>
                  )}
                  {columns.map(col => (
                    <td key={col.key} className={`px-4 text-body-sm text-text-primary ${col.numeric ? 'text-right font-mono tabular-nums' : ''}`}>
                      {col.render ? col.render(item) : item[col.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden space-y-2">
        {paged.map(item => {
          const id = keyExtractor(item);
          const isSelected = selectedIds.includes(id);
          return (
            <div key={id} className={`rounded-lg border border-border bg-surface-secondary p-4 transition-colors ${isSelected ? 'ring-1 ring-interactive-accent' : ''}`}>
              {selectable && (
                <div className="flex items-center gap-2 mb-3">
                  <input type="checkbox" checked={isSelected} onChange={() => toggleOne(id)}
                    className="cursor-pointer accent-interactive-accent rounded-sm" />
                  <span className="text-tiny text-text-tertiary">Seleccionar</span>
                </div>
              )}
              <div className="space-y-2">
                {mobileCols.map(col => (
                  <div key={col.key} className="flex items-center justify-between gap-2">
                    <span className="text-tiny font-medium text-text-tertiary shrink-0">{col.label}</span>
                    <span className={`text-body-sm text-text-primary text-right ${col.numeric ? 'font-mono tabular-nums' : ''}`}>
                      {col.render ? col.render(item) : item[col.key] ?? '-'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {data.length > pageSize && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <span className="text-tiny text-text-tertiary">{data.length} registro(s) — Pág. {page} de {totalPages}</span>
          <Pagination page={page} perPage={pageSize} total={data.length} onChange={setPage} />
        </div>
      )}
    </div>
  );
}

DataTable.displayName = 'DataTable';
export type { DataTableProps, Column };
