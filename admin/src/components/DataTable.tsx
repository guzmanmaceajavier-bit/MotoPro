import { useState, useEffect, ReactNode, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Pencil, Trash2, Download, Trash } from "lucide-react";
import { Pagination } from "@shared/components/ui/Pagination";

interface Column {
  key: string;
  label: string;
  render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
}

interface Props {
  columns: Column[];
  data: Record<string, unknown>[];
  onEdit?: (row: Record<string, unknown>) => void;
  onDelete?: (row: Record<string, unknown>) => void;
  onRowClick?: (row: Record<string, unknown>) => void;
  onBatchDelete?: (ids: string[]) => void;
  loading?: boolean;
  searchable?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  selectable?: boolean;
  exportable?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
}

export default function DataTable({
  columns, data, onEdit, onDelete, onRowClick, onBatchDelete,
  loading, searchable = true, pageSize: initialPageSize = 10, pageSizeOptions = [10, 25, 50, 100],
  selectable = false, exportable = false,
  emptyMessage, emptyDescription,
}: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() =>
    data.filter((row) =>
      !search || columns.some((c) => String(row[c.key] ?? "").toLowerCase().includes(search.toLowerCase()))
    ), [data, search, columns]);

  const sorted = useMemo(() =>
    [...filtered].sort((a, b) => {
      if (!sortKey) return 0;
      const av = String(a[sortKey] ?? "");
      const bv = String(b[sortKey] ?? "");
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    }), [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => { setPage(1); }, [pageSize]);
  useEffect(() => { setSelected(new Set()); }, [data]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === paged.length) setSelected(new Set());
    else setSelected(new Set(paged.map((r) => String(r.id || ""))));
  };

  const exportCSV = () => {
    const headers = columns.map((c) => c.label).join(",");
    const rows = sorted.map((row) => columns.map((c) => `"${String(row[c.key] ?? "")}"`).join(",")).join("\n");
    const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-border">
        <div className="space-y-1 p-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="h-[var(--density-row-height)] animate-pulse rounded-sm bg-surface-tertiary" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(searchable || exportable || selected.size > 0) && (
        <div className="flex items-center gap-3 flex-wrap">
          {searchable && (
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="h-9 w-full rounded-md border border-border bg-surface-secondary pl-9 pr-3 text-body-sm text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-focus focus-visible:border-transparent transition-all duration-base"
              />
            </div>
          )}
          <div className="flex-1" />
          {selected.size > 0 && onBatchDelete && (
            <button onClick={() => { onBatchDelete([...selected]); setSelected(new Set()); }}
              className="inline-flex items-center gap-1.5 rounded-md bg-status-error/10 px-3 py-1.5 text-caption font-semibold text-status-error hover:bg-status-error/20 transition-colors" type="button">
              <Trash size={13} strokeWidth={2} /> {selected.size}
            </button>
          )}
          {exportable && sorted.length > 0 && (
            <button onClick={exportCSV}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-secondary px-3 py-1.5 text-caption font-medium text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-colors" type="button">
              <Download size={13} strokeWidth={2} /> CSV
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-tiny text-text-tertiary">Mostrar</span>
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-7 rounded-md border border-border bg-surface-secondary px-1.5 text-caption text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-focus">
              {pageSizeOptions.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <span className="text-tiny text-text-tertiary">{sorted.length} registro{sorted.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="h-11 bg-surface-tertiary text-caption font-semibold text-text-secondary">
              {selectable && <th className="w-12 px-4 text-left">
                <input type="checkbox" checked={selected.size === paged.length && paged.length > 0}
                  onChange={toggleAll} className="cursor-pointer accent-interactive-accent rounded-sm" />
              </th>}
              {columns.map((col) => (
                <th key={col.key} onClick={() => { if (sortKey === col.key) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortKey(col.key); setSortDir("asc"); } }}
                  className="px-4 text-left cursor-pointer select-none hover:text-text-primary transition-colors">
                  <div className="inline-flex items-center gap-1.5">
                    {col.label}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-text-tertiary/50">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </div>
                </th>
              ))}
              {(onEdit || onDelete) && <th className="px-4 text-right w-16">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (onEdit || onDelete ? 1 : 0)}>
                  <div className="flex flex-col items-center py-16 text-center">
                    <p className="text-body-sm font-medium text-text-tertiary">
                      {search ? "Sin resultados" : (emptyMessage || "No hay registros aún")}
                    </p>
                    {search ? (
                      <button onClick={() => setSearch("")} className="text-caption mt-2 text-interactive-accent hover:underline">Limpiar búsqueda</button>
                    ) : (
                      emptyDescription && <p className="text-tiny mt-1 text-text-tertiary max-w-xs">{emptyDescription}</p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paged.map((row, i) => {
                const id = String(row.id || i);
                return (
                  <tr key={id}
                    className={`h-[var(--density-row-height)] border-b border-border-subtle transition-colors duration-fast hover:bg-surface-tertiary ${selected.has(id) ? 'bg-[rgba(255,107,0,0.06)]' : ''} ${onRowClick ? "cursor-pointer" : ""}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td className="px-4" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.has(id)}
                          onChange={() => toggleSelect(id)} className="cursor-pointer accent-interactive-accent rounded-sm" />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 text-body-sm text-text-primary">
                        {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "")}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-0.5">
                          {onEdit && (
                            <button onClick={() => onEdit(row)}
                              className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-tertiary transition-colors" title="Editar" type="button">
                              <Pencil size={13} strokeWidth={1.5} />
                            </button>
                          )}
                          {onDelete && (
                            <button onClick={() => onDelete(row)}
                              className="p-1.5 rounded-md text-text-tertiary hover:text-status-error hover:bg-status-error-bg transition-colors" title="Eliminar" type="button">
                              <Trash2 size={13} strokeWidth={1.5} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {paged.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-tiny text-text-tertiary">Pág. {page} de {totalPages}</span>
          <Pagination page={page} perPage={pageSize} total={sorted.length} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
