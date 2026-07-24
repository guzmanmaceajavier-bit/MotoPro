import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Shield, Clock, CheckCircle, AlertTriangle, Eye } from "lucide-react";

interface Warranty {
  id: string; warranty_number?: string; status: string; warranty_type: string;
  description?: string; start_date: string; end_date: string; terms?: string;
  order_number?: string; service_type?: string; vehicle_description?: string;
  created_at: string;
}

const statusMeta: Record<string, { label: string; color: string; bg: string }> = {
  active:   { label: "Activa",     color: "#22C55E", bg: "rgba(34,197,94,0.1)" },
  expired:  { label: "Vencida",    color: "#9CA3AF", bg: "rgba(156,163,175,0.1)" },
  claimed:  { label: "Reclamada",  color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  void:     { label: "Anulada",    color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
};

export default function Warranties() {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Warranty | null>(null);

  useEffect(() => {
    api.get("/client/warranties").then((r) => {
      setWarranties(Array.isArray(r) ? r : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Garantías</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Consulta el estado de las garantías de tus servicios</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 w-full rounded-xl" />)}</div>
      ) : warranties.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
          <Shield size={48} className="mx-auto mb-4" style={{ color: "var(--text-tertiary)" }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text)" }}>Sin garantías</h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Las garantías de tus servicios aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {warranties.map((w) => {
            const meta = statusMeta[w.status] || { label: w.status, color: "var(--text-tertiary)", bg: "var(--bg-muted)" };
            const daysLeft = getDaysRemaining(w.end_date);
            const startDate = new Date(w.start_date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
            const endDate = new Date(w.end_date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
            return (
              <div key={w.id} className="rounded-xl p-5 transition-all hover:shadow-sm" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: meta.bg, color: meta.color }}>
                      <Shield size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>{w.warranty_number || w.service_type}</h3>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{w.vehicle_description || w.service_type} · {w.order_number || ""}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium px-2.5 py-1 rounded-full" style={{ background: meta.bg, color: meta.color }}>
                    {meta.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    <span>{startDate} → {endDate}</span>
                    {w.status === "active" && daysLeft > 0 && (
                      <span className="ml-2 font-medium" style={{ color: daysLeft <= 30 ? "#F59E0B" : "#22C55E" }}>
                        · {daysLeft} días restantes
                      </span>
                    )}
                  </div>
                  <button onClick={() => setDetail(w)} className="p-1.5 rounded-md hover:bg-[var(--bg-muted)] transition-all" style={{ color: "var(--text-secondary)" }} title="Ver detalle" type="button">
                    <Eye size={14} />
                  </button>
                </div>
                {w.description && <p className="text-xs mt-2 pt-2 border-t" style={{ color: "var(--text-tertiary)", borderColor: "var(--border-light)" }}>{w.description}</p>}
              </div>
            );
          })}
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setDetail(null)}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>{detail.warranty_number || "Garantía"}</h3>
              <button onClick={() => setDetail(null)} className="text-sm" style={{ color: "var(--text-tertiary)" }}>Cerrar</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span style={{ color: "var(--text-tertiary)" }}>Estado</span>
                  <p className="font-medium" style={{ color: (statusMeta[detail.status] || meta).color }}>{(statusMeta[detail.status] || meta).label}</p></div>
                <div><span style={{ color: "var(--text-tertiary)" }}>Tipo</span>
                  <p className="font-medium" style={{ color: "var(--text)" }}>{detail.warranty_type}</p></div>
                <div><span style={{ color: "var(--text-tertiary)" }}>Inicio</span>
                  <p className="font-medium" style={{ color: "var(--text)" }}>{new Date(detail.start_date).toLocaleDateString("es-ES")}</p></div>
                <div><span style={{ color: "var(--text-tertiary)" }}>Vencimiento</span>
                  <p className="font-medium" style={{ color: "var(--text)" }}>{new Date(detail.end_date).toLocaleDateString("es-ES")}</p></div>
                <div><span style={{ color: "var(--text-tertiary)" }}>Servicio</span>
                  <p className="font-medium" style={{ color: "var(--text)" }}>{detail.service_type || "N/A"}</p></div>
                <div><span style={{ color: "var(--text-tertiary)" }}>Vehículo</span>
                  <p className="font-medium" style={{ color: "var(--text)" }}>{detail.vehicle_description || "N/A"}</p></div>
              </div>
              {detail.description && <div><h4 className="text-xs font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>DESCRIPCIÓN</h4><p style={{ color: "var(--text-secondary)" }}>{detail.description}</p></div>}
              {detail.terms && <div><h4 className="text-xs font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>TÉRMINOS</h4><p style={{ color: "var(--text-secondary)" }}>{detail.terms}</p></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
