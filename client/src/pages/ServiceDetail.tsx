import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/api/client";
import { ArrowLeft, Wrench, Clock, CheckCircle, AlertTriangle, FileText, Package } from "lucide-react";

interface ServiceDetail {
  id: string; order_number: string; service_type: string; status: string; priority: string;
  vehicle_description: string; customer_name: string; diagnostic?: string; notes?: string;
  estimated_delivery?: string; total_parts?: number; total_labor?: number; total?: number;
  created_at: string; updated_at: string;
  timeline: Array<{ id: string; description: string; from_status?: string; to_status: string; created_at: string }>;
  parts: Array<{ id: string; product_name: string; quantity: number; unit_price: number; total: number }>;
  checklist: Array<{ id: string; item: string; is_checked: number; notes?: string }>;
}

const statusMeta: Record<string, { label: string; color: string; bg: string }> = {
  received:      { label: "Recibido",     color: "#6366F1", bg: "rgba(99,102,241,0.1)" },
  diagnosed:     { label: "Diagnosticado", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  quoted:        { label: "Cotizado",     color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
  approved:      { label: "Aprobado",     color: "#22C55E", bg: "rgba(34,197,94,0.1)" },
  in_progress:   { label: "En Reparación", color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  quality_check: { label: "Control Calidad", color: "#0EA5E9", bg: "rgba(14,165,233,0.1)" },
  ready:         { label: "Listo",        color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  delivered:     { label: "Entregado",    color: "#22C55E", bg: "rgba(34,197,94,0.1)" },
  cancelled:     { label: "Cancelado",    color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
};

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"info" | "timeline" | "parts" | "checklist">("info");

  useEffect(() => {
    if (!id) return;
    api.get(`/client/services/${id}`).then((r) => setService(r)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-16">
        <Wrench size={48} className="mx-auto mb-4" style={{ color: "var(--text-tertiary)" }} />
        <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text)" }}>Servicio no encontrado</h3>
        <Link to="/servicios" className="text-sm font-medium" style={{ color: "var(--accent)" }}>Volver a servicios</Link>
      </div>
    );
  }

  const meta = statusMeta[service.status] || { label: service.status, color: "var(--text-tertiary)", bg: "var(--bg-muted)" };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/servicios" className="p-2 rounded-lg hover:bg-[var(--bg-muted)] transition-colors" style={{ color: "var(--text-secondary)" }}>
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>{service.order_number}</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{service.service_type}</p>
        </div>
        <span className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>
          {meta.label}
        </span>
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "var(--bg-muted)" }}>
        {([
          { key: "info", label: "Información" },
          { key: "timeline", label: "Historial" },
          { key: "parts", label: "Repuestos" },
          { key: "checklist", label: "Checklist" },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex-1 py-2 text-xs font-medium rounded-lg transition-all"
            style={{
              background: tab === t.key ? "var(--bg-card)" : "transparent",
              color: tab === t.key ? "var(--accent)" : "var(--text-secondary)",
              boxShadow: tab === t.key ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }} type="button">
            {t.label}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <div className="space-y-4">
          <div className="rounded-xl p-5" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>Detalles del Servicio</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span style={{ color: "var(--text-tertiary)" }}>Vehículo</span><p className="font-medium" style={{ color: "var(--text)" }}>{service.vehicle_description || "No especificado"}</p></div>
              <div><span style={{ color: "var(--text-tertiary)" }}>Cliente</span><p className="font-medium" style={{ color: "var(--text)" }}>{service.customer_name}</p></div>
              <div><span style={{ color: "var(--text-tertiary)" }}>Prioridad</span><p className="font-medium" style={{ color: "var(--text)" }}>{service.priority || "Normal"}</p></div>
              <div><span style={{ color: "var(--text-tertiary)" }}>Entrega Estimada</span><p className="font-medium" style={{ color: "var(--text)" }}>{service.estimated_delivery || "Por definir"}</p></div>
              <div><span style={{ color: "var(--text-tertiary)" }}>Creado</span><p className="font-medium" style={{ color: "var(--text)" }}>{new Date(service.created_at).toLocaleDateString("es-ES")}</p></div>
              <div><span style={{ color: "var(--text-tertiary)" }}>Total</span><p className="font-bold" style={{ color: "var(--accent)" }}>${(service.total || 0).toLocaleString()}</p></div>
            </div>
          </div>
          {service.diagnostic && (
            <div className="rounded-xl p-5" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>Diagnóstico</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{service.diagnostic}</p>
            </div>
          )}
          {service.notes && (
            <div className="rounded-xl p-5" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>Notas</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{service.notes}</p>
            </div>
          )}
        </div>
      )}

      {tab === "timeline" && (
        <div className="space-y-3">
          {service.timeline.length === 0 ? (
            <div className="text-center py-12">
              <Clock size={32} className="mx-auto mb-3" style={{ color: "var(--text-tertiary)" }} />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Sin eventos en el historial</p>
            </div>
          ) : service.timeline.map((ev) => (
            <div key={ev.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>
                <Clock size={14} />
              </div>
              <div className="flex-1 rounded-xl p-4" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                <p className="text-sm" style={{ color: "var(--text)" }}>{ev.description}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>{new Date(ev.created_at).toLocaleString("es-ES")}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "parts" && (
        <div className="space-y-3">
          {service.parts.length === 0 ? (
            <div className="text-center py-12">
              <Package size={32} className="mx-auto mb-3" style={{ color: "var(--text-tertiary)" }} />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Sin repuestos registrados</p>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>Producto</th>
                    <th className="text-center px-4 py-3 text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>Cant.</th>
                    <th className="text-right px-4 py-3 text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>Precio</th>
                    <th className="text-right px-4 py-3 text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {service.parts.map((p) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="px-4 py-3 font-medium" style={{ color: "var(--text)" }}>{p.product_name}</td>
                      <td className="text-center px-4 py-3" style={{ color: "var(--text-secondary)" }}>{p.quantity}</td>
                      <td className="text-right px-4 py-3" style={{ color: "var(--text-secondary)" }}>${p.unit_price.toLocaleString()}</td>
                      <td className="text-right px-4 py-3 font-semibold" style={{ color: "var(--text)" }}>${p.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "checklist" && (
        <div className="space-y-2">
          {service.checklist.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle size={32} className="mx-auto mb-3" style={{ color: "var(--text-tertiary)" }} />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Sin checklist disponible</p>
            </div>
          ) : service.checklist.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-xl p-4"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: c.is_checked ? "var(--accent)" : "transparent",
                  border: c.is_checked ? "none" : "2px solid var(--border)",
                  color: c.is_checked ? "white" : "var(--text-tertiary)",
                }}>
                {c.is_checked ? "✓" : ""}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{c.item}</p>
                {c.notes && <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{c.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
