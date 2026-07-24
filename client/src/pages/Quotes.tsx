import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Link } from "react-router-dom";
import { FileText, CheckCircle, XCircle, Clock, AlertTriangle, Eye } from "lucide-react";

interface Quote {
  id: string; quote_number: string; total: number; status: string; notes?: string;
  valid_until?: string; service_type?: string; order_number?: string;
  created_at: string; approved_at?: string;
}

const statusMeta: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending:  { label: "Pendiente",  color: "#F59E0B", bg: "rgba(245,158,11,0.1)", icon: Clock },
  sent:     { label: "Enviada",    color: "#3B82F6", bg: "rgba(59,130,246,0.1)", icon: FileText },
  approved: { label: "Aprobada",   color: "#22C55E", bg: "rgba(34,197,94,0.1)", icon: CheckCircle },
  rejected: { label: "Rechazada",  color: "#EF4444", bg: "rgba(239,68,68,0.1)", icon: XCircle },
  expired:  { label: "Expirada",   color: "#9CA3AF", bg: "rgba(156,163,175,0.1)", icon: AlertTriangle },
};

export default function Quotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [detail, setDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    api.get("/client/quotes").then((r) => {
      setQuotes(Array.isArray(r) ? r : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? quotes : quotes.filter((q) => q.status === filter);

  const viewDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const r = await api.get(`/client/quotes/${id}`);
      setDetail(r);
    } catch {} finally { setLoadingDetail(false); }
  };

  const approveQuote = async (id: string) => {
    if (!confirm("¿Aprobar esta cotización? Se autorizará el inicio del servicio.")) return;
    try {
      await api.put(`/client/quotes/${id}/approve`, {});
      setQuotes(quotes.map((q) => q.id === id ? { ...q, status: "approved" } : q));
      setDetail(null);
    } catch (err: any) { alert(err.message || "Error al aprobar"); }
  };

  const rejectQuote = async (id: string) => {
    if (!confirm("¿Rechazar esta cotización?")) return;
    try {
      await api.put(`/client/quotes/${id}/reject`, {});
      setQuotes(quotes.map((q) => q.id === id ? { ...q, status: "rejected" } : q));
      setDetail(null);
    } catch (err: any) { alert(err.message || "Error al rechazar"); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Cotizaciones</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Revisa y aprueba las cotizaciones de tus servicios</p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[{ key: "all", label: "Todas" }, { key: "pending", label: "Pendientes" }, { key: "approved", label: "Aprobadas" }, { key: "rejected", label: "Rechazadas" }].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-all"
            style={{
              background: filter === f.key ? "var(--accent-glow)" : "transparent",
              color: filter === f.key ? "var(--accent)" : "var(--text-secondary)",
              border: filter === f.key ? "1px solid var(--accent)" : "1px solid transparent",
            }} type="button">
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 w-full rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
          <FileText size={48} className="mx-auto mb-4" style={{ color: "var(--text-tertiary)" }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text)" }}>Sin cotizaciones</h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Las cotizaciones de tus servicios aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => {
            const meta = statusMeta[q.status] || { label: q.status, color: "var(--text-tertiary)", bg: "var(--bg-muted)", icon: AlertTriangle };
            const Icon = meta.icon;
            return (
              <div key={q.id} className="rounded-xl p-5 transition-all hover:shadow-sm" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: meta.bg, color: meta.color }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>{q.quote_number}</h3>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{q.service_type || "Servicio"} · {q.order_number || ""}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium px-2.5 py-1 rounded-full" style={{ background: meta.bg, color: meta.color }}>
                    {meta.label}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    {new Date(q.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                    {q.valid_until && <span> · Válida hasta {new Date(q.valid_until).toLocaleDateString("es-ES")}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold" style={{ color: "var(--accent)" }}>${q.total?.toLocaleString() || 0}</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => viewDetail(q.id)} className="p-1.5 rounded-md hover:bg-[var(--bg-muted)] transition-all" style={{ color: "var(--text-secondary)" }} title="Ver detalle" type="button">
                        <Eye size={14} />
                      </button>
                      {(q.status === "pending" || q.status === "sent") && (
                        <>
                          <button onClick={() => approveQuote(q.id)} className="p-1.5 rounded-md hover:bg-green-50 transition-all" style={{ color: "#22C55E" }} title="Aprobar" type="button">
                            <CheckCircle size={14} />
                          </button>
                          <button onClick={() => rejectQuote(q.id)} className="p-1.5 rounded-md hover:bg-red-50 transition-all" style={{ color: "#EF4444" }} title="Rechazar" type="button">
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setDetail(null)}>
          <div className="w-full max-w-lg rounded-2xl p-6 max-h-[80vh] overflow-y-auto" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>{detail.quote_number}</h3>
              <button onClick={() => setDetail(null)} className="text-sm" style={{ color: "var(--text-tertiary)" }}>Cerrar</button>
            </div>
            {loadingDetail ? (
              <div className="space-y-3"><div className="skeleton h-20 w-full" /><div className="skeleton h-20 w-full" /></div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span style={{ color: "var(--text-tertiary)" }}>Servicio</span><p className="font-medium" style={{ color: "var(--text)" }}>{detail.service_type || "N/A"}</p></div>
                  <div><span style={{ color: "var(--text-tertiary)" }}>Vehículo</span><p className="font-medium" style={{ color: "var(--text)" }}>{detail.vehicle_description || "N/A"}</p></div>
                </div>
                {detail.items?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium mb-2" style={{ color: "var(--text-tertiary)" }}>DETALLE</h4>
                    <div className="space-y-2">
                      {detail.items.map((it: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm p-3 rounded-lg" style={{ background: "var(--bg-muted)" }}>
                          <div>
                            <p className="font-medium" style={{ color: "var(--text)" }}>{it.description}</p>
                            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{it.quantity} x ${it.unit_price?.toLocaleString()}</p>
                          </div>
                          <span className="font-semibold" style={{ color: "var(--text)" }}>${it.total?.toLocaleString() || (it.quantity * it.unit_price).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {detail.notes && <div><h4 className="text-xs font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>NOTAS</h4><p className="text-sm" style={{ color: "var(--text-secondary)" }}>{detail.notes}</p></div>}
                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                  <span className="text-sm font-medium" style={{ color: "var(--text)" }}>Total</span>
                  <span className="text-xl font-bold" style={{ color: "var(--accent)" }}>${detail.total?.toLocaleString()}</span>
                </div>
                {(detail.status === "pending" || detail.status === "sent") && (
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => approveQuote(detail.id)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-all" style={{ background: "#22C55E" }} type="button">Aprobar</button>
                    <button onClick={() => rejectQuote(detail.id)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-all" style={{ background: "#EF4444" }} type="button">Rechazar</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
