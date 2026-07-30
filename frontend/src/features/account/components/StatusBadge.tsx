export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  in_progress: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  approved: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  completed: 'bg-green-500/10 text-green-400 border border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
  active: 'bg-green-500/10 text-green-400 border border-green-500/20',
  expired: 'bg-surface-tertiary/50 text-text-secondary border border-border',
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En Progreso',
  approved: 'Aprobado',
  completed: 'Completado',
  cancelled: 'Cancelado',
  paid: 'Pagada',
  active: 'Activa',
  expired: 'Expirada',
};

export function StatusBadge({ status, className = '' }: { status: string; className?: string }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status] || 'bg-surface-tertiary/50 text-text-secondary'} ${className}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
