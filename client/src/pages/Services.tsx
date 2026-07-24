import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Wrench, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface Service {
  id: string; service_type: string; description?: string; status: string;
  brand_model?: string; total?: number; created_at: string; updated_at?: string;
}

const statusMeta: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending:     { label: "Pendiente",   color: "#F59E0B", bg: "rgba(245,158,11,0.1)", icon: Clock },
  in_progress: { label: "En taller",   color: "#3B82F6", bg: "rgba(59,130,246,0.1)", icon: Wrench },
  completed:   { label: "Completado",  color: "#22C55E", bg: "rgba(34,197,94,0.1)", icon: CheckCircle },
  cancelled:   { label: "Cancelado",   color: "#EF4444", bg: "rgba(239,68,68,0.1)", icon: XCircle },
  approved:    { label: "Aprobado",    color: "#22C55E", bg: "rgba(34,197,94,0.1)", icon: CheckCircle },
};

const timelineStatuses = ["pending", "in_progress", "completed"];

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    api.get("/client/services").then((r) => {
      const d = Array.isArray(r) ? r : r?.data || [];
      setServices(d);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? services : services.filter((s) => s.status === filter);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Mis Servicios</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Historial de servicios del taller</p>
        </div>
        <div className="flex items-center gap-2">
          {[
            { key: "all", label: "Todos" },
            { key: "pending", label: "Pendientes" },
            { key: "in_progress", label: "En taller" },
            { key: "completed", label: "Completados" },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: filter === f.key ? "var(--accent-glow)" : "transparent",
                color: filter === f.key ? "var(--accent)" : "var(--text-secondary)",
                border: filter === f.key ? "1px solid var(--accent)" : "1px solid transparent",
              }}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl p-5" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <div className="skeleton h-4 w-48 mb-3" /><div className="skeleton h-3 w-32" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
          <Wrench size={48} style={{ color: "var(--text-tertiary)" }} className="mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text)" }}>Sin servicios</h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No hay servicios que mostrar en esta categoría.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((s) => {
            const meta = statusMeta[s.status] || { label: s.status, color: "var(--text-tertiary)", bg: "var(--bg-muted)", icon: AlertTriangle };
            const Icon = meta.icon;
            const statusIndex = timelineStatuses.indexOf(s.status);
            const date = new Date(s.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

            return (
              <div key={s.id} className="rounded-xl overflow-hidden transition-all hover:shadow-sm" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: meta.bg, color: meta.color }}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>{s.service_type}</h3>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{s.brand_model || "Sin vehículo"}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: meta.bg, color: meta.color }}>
                      {meta.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mb-4">
                    {timelineStatuses.map((st, i) => {
                      const stMeta = statusMeta[st]!;
                      const active = i <= statusIndex;
                      const current = i === statusIndex;
                      return (
                        <div key={st} className="flex-1 flex items-center">
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                              style={{
                                background: active ? stMeta.color : "var(--bg-muted)",
                                color: active ? "white" : "var(--text-tertiary)",
                                boxShadow: current ? `0 0 0 3px ${stMeta.color}33` : "none",
                              }}>
                              {i + 1}
                            </div>
                            <span className="text-[9px] font-medium hidden sm:block" style={{ color: active ? stMeta.color : "var(--text-tertiary)" }}>
                              {stMeta.label}
                            </span>
                          </div>
                          {i < timelineStatuses.length - 1 && (
                            <div className="h-0.5 flex-1 mx-1 rounded-full" style={{ background: active ? stMeta.color : "var(--bg-muted)" }} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-tertiary)" }}>
                    <span>{date}</span>
                    {s.total !== undefined && s.total > 0 && (
                      <span className="font-semibold" style={{ color: "var(--text)" }}>${s.total.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
