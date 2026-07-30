import { motion } from "framer-motion";
import { ClipboardList, Search, FileText, ThumbsUp, Package, Wrench, CheckCircle2, Shield, CheckCircle, Flag } from "lucide-react";
import { Badge } from "@/components/ui";

export const STATUS_STEPS = [
  { key: "received", label: "Recibido", desc: "Hemos recibido tu moto y estamos registrando los detalles", icon: ClipboardList },
  { key: "diagnosing", label: "Diagnóstico", desc: "Nuestros técnicos están evaluando tu motocicleta", icon: Search },
  { key: "quoted", label: "Cotización", desc: "Te hemos enviado el presupuesto detallado", icon: FileText },
  { key: "approved", label: "Aprobada", desc: "Has aprobado el presupuesto, comenzaremos el trabajo", icon: ThumbsUp },
  { key: "parts_ordered", label: "Repuestos", desc: "Estamos gestionando los repuestos necesarios", icon: Package },
  { key: "in_progress", label: "Reparación", desc: "Nuestro equipo está trabajando en tu moto", icon: Wrench },
  { key: "testing", label: "Pruebas", desc: "Verificando que todo funcione correctamente", icon: CheckCircle2 },
  { key: "quality_check", label: "Control calidad", desc: "Pasando controles de calidad finales", icon: Shield },
  { key: "ready", label: "Lista", desc: "Tu moto está lista para que la recojas", icon: CheckCircle },
  { key: "delivered", label: "Entregada", desc: "Tu moto ha sido entregada", icon: Flag },
];

export const STATUS_COLORS: Record<string, string> = {
  received: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  diagnosing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  quoted: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  parts_ordered: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  in_progress: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  testing: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  quality_check: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  ready: "bg-green-500/10 text-green-400 border-green-500/20",
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export const STATUS_LABELS: Record<string, string> = {
  received: "Recibido",
  diagnosing: "En diagnóstico",
  quoted: "Cotizado",
  approved: "Aprobada",
  parts_ordered: "Repuestos",
  in_progress: "En reparación",
  testing: "Pruebas",
  quality_check: "Control calidad",
  ready: "Lista",
  delivered: "Entregada",
  cancelled: "Cancelado",
};

const STATUS_ORDER = STATUS_STEPS.map(s => s.key);

function getStepIndex(status: string): number {
  return STATUS_ORDER.indexOf(status);
}

export function ServiceTimeline({ entries }: { entries: any[] }) {
  if (entries.length === 0) return <p className="text-sm text-text-tertiary py-4 text-center">Sin actividad registrada</p>;
  return (
    <div className="relative pl-8 space-y-5">
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-interactive-accent/40 via-blue-500/30 to-transparent" />
      {entries.map((e: any, i: number) => (
        <motion.div key={e.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="relative">
          <div className={`absolute -left-8 mt-1.5 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center ${
            e.status === "completed" ? "bg-interactive-accent border-interactive-accent" : "bg-surface-secondary border-interactive-accent"
          }`}>
            {e.status === "completed" && (
              <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </div>
          <div className="rounded-lg border border-border bg-surface-secondary p-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[e.status] || "bg-surface-tertiary/50 text-text-secondary"}`}>
                {STATUS_LABELS[e.status] || e.status}
              </span>
              {e.created_at && (
                <span className="text-[10px] text-text-tertiary">
                  {new Date(e.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
            {e.description && <p className="text-xs text-text-secondary mt-1">{e.description}</p>}
            {e.image && (
              <img src={e.image} alt="Evidencia" loading="lazy" className="mt-2 rounded-lg max-h-40 object-cover" />
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function ServiceStatusProgress({ currentStatus }: { currentStatus: string }) {
  const currentIdx = getStepIndex(currentStatus);
  const displaySteps = currentIdx === -1 ? STATUS_STEPS.slice(0, 1) : STATUS_STEPS;

  return (
    <div className="space-y-4">
      {displaySteps.map((step, i) => {
        const isComplete = currentIdx >= i;
        const isCurrent = currentIdx === i;
        return (
          <motion.div key={step.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-start gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              isComplete ? "bg-interactive-accent" : "border-2 border-border bg-surface-tertiary"
            }`}>
              {isComplete && (
                <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${isCurrent ? "text-interactive-accent" : isComplete ? "text-text-primary" : "text-text-tertiary"}`}>
                  {step.label}
                </p>
                {isCurrent && (
                  <Badge variant="accent">Actual</Badge>
                )}
              </div>
              <p className={`text-xs ${isComplete ? "text-text-secondary" : "text-text-tertiary"}`}>
                {isCurrent ? step.desc : isComplete ? "Completado" : "Pendiente"}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
