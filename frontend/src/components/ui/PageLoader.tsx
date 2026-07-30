export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-surface-primary">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-interactive-accent border-t-transparent" />
        <p className="text-sm text-text-tertiary">Cargando...</p>
      </div>
    </div>
  );
}
