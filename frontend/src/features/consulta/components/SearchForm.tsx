import { InlineSpinner } from "@/components/ui";
import { placeholders } from "../hooks/useServiceInquiry";

interface SearchFormProps {
  searchType: "orden" | "placa" | "cedula";
  onTypeChange: (t: "orden" | "placa" | "cedula") => void;
  query: string;
  onQueryChange: (v: string) => void;
  loading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}

const types = [
  { value: "orden" as const, label: "N\u00B0 Orden" },
  { value: "placa" as const, label: "Placa" },
  { value: "cedula" as const, label: "C\u00E9dula" },
];

export function SearchForm({ searchType, onTypeChange, query, onQueryChange, loading, error, onSubmit }: SearchFormProps) {
  return (
    <div className="mb-8 rounded-2xl border border-border bg-surface-secondary p-6 md:p-8">
      <form onSubmit={onSubmit}>
        <div className="mb-4 flex flex-wrap gap-2">
          {types.map((t) => (
            <button key={t.value} type="button" onClick={() => onTypeChange(t.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                searchType === t.value
                  ? "bg-interactive-accent text-white shadow-lg shadow-interactive-accent/25"
                  : "border border-border bg-surface-tertiary text-text-secondary hover:text-text-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <input type="text" value={query} onChange={(e) => onQueryChange(e.target.value)}
            placeholder={placeholders[searchType]}
            className="flex-1 rounded-md border border-border bg-surface-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none transition-all duration-base ease-out hover:border-text-tertiary focus:border-interactive-focus focus:ring-2 focus:ring-interactive-focus"
          />
          <button type="submit" disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-interactive-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-interactive-accent-hover transition-all disabled:opacity-50 shadow-[0_1px_2px_rgba(255,107,0,0.2)]"
          >
            {loading ? (
              <InlineSpinner />
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            )}
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-status-error">{error}</p>}
      </form>
    </div>
  );
}
