interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

function ChevronLeftIcon() {
  return (<svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.5 19l-7-7 7-7" /></svg>);
}

function ChevronRightIcon() {
  return (<svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.5 5l7 7-7 7" /></svg>);
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Página anterior"
        className="rounded-lg border border-border-subtle bg-surface-tertiary/50 p-2.5 text-text-secondary hover:text-text-primary hover:border-interactive-accent/50 transition-all disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronLeftIcon />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button key={n} onClick={() => onChange(n)}
          className={`min-w-[40px] rounded-lg border px-3.5 py-2 text-sm font-medium transition-all ${
            n === page
              ? "border-interactive-accent bg-interactive-accent text-text-primary"
              : "border-border-subtle bg-surface-tertiary/50 text-text-secondary hover:text-text-primary hover:border-interactive-accent/50"
          }`}
        >
          {n}
        </button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages} aria-label="Página siguiente"
        className="rounded-lg border border-border-subtle bg-surface-tertiary/50 p-2.5 text-text-secondary hover:text-text-primary hover:border-interactive-accent/50 transition-all disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}
