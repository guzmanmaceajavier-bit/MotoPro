interface EmptyStateProps {
  query: string;
}

export function EmptyState({ query }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface-secondary p-8 text-center">
      <svg className="mx-auto mb-2 h-10 w-10 text-text-secondary opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <p className="text-text-secondary">No se encontraron resultados para &ldquo;{query}&rdquo;</p>
    </div>
  );
}
