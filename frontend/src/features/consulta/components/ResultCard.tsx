import { motion } from "framer-motion";
import { statusColors, formatDate } from "../hooks/useServiceInquiry";
import type { ServiceRequest } from "../hooks/useServiceInquiry";

interface ResultCardProps {
  request: ServiceRequest;
  index: number;
}

export function ResultCard({ request: r, index }: ResultCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      className="rounded-2xl border border-border bg-surface-secondary p-5 transition-all hover:border-interactive-accent/30"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-text-secondary">{r.id}</span>
          <span className="text-[10px] text-text-secondary">|</span>
          <span className="text-xs text-text-secondary">{formatDate(r.created_at)}</span>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[r.status?.toLowerCase()] || "bg-gray-500/10 text-gray-500"}`}>
          {r.status || "Pendiente"}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 text-xs text-text-tertiary">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          {r.name}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { label: "Moto", value: r.brand_model },
          { label: "Placa", value: r.plate },
          { label: "Servicio", value: r.service_type },
          { label: "Contacto", value: `${r.phone}${r.email ? ` | ${r.email}` : ""}` },
        ].map((f) => (
          <div key={f.label}>
            <span className="text-[10px] uppercase tracking-wider text-text-secondary">{f.label}</span>
            <p className="text-sm font-medium text-text-primary">{f.value || "-"}</p>
          </div>
        ))}
        {r.description && (
          <div className="sm:col-span-2">
            <span className="text-[10px] uppercase tracking-wider text-text-secondary">Descripci\u00F3n</span>
            <p className="text-sm text-text-secondary">{r.description}</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-xs text-text-tertiary">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Timeline de servicio disponible
      </div>
    </motion.div>
  );
}
