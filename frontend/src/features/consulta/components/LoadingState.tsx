export function LoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-border bg-surface-secondary p-5">
          <div className="mb-3 h-4 w-32 rounded bg-surface-tertiary" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-3 rounded bg-surface-tertiary" />
            <div className="h-3 rounded bg-surface-tertiary" />
          </div>
        </div>
      ))}
    </div>
  );
}
