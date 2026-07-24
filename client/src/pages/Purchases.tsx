import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { ShoppingCart, Package, Eye, ExternalLink } from "lucide-react";

interface Purchase {
  id: string; order_number?: string; total: number; status: string; payment_method?: string;
  shipping_address?: string; notes?: string; items?: any; created_at: string;
}

const statusMeta: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: "Pendiente",  color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  processing: { label: "Procesando", color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  shipped:    { label: "Enviado",    color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
  delivered:  { label: "Entregado",  color: "#22C55E", bg: "rgba(34,197,94,0.1)" },
  cancelled:  { label: "Cancelado",  color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
  completed:  { label: "Completado", color: "#22C55E", bg: "rgba(34,197,94,0.1)" },
};

export default function Purchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Purchase | null>(null);

  useEffect(() => {
    api.get("/client/purchases").then((r) => {
      setPurchases(Array.isArray(r) ? r : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const viewDetail = async (id: string) => {
    try {
      const r = await api.get(`/client/purchases/${id}`);
      setDetail(r);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Mis Compras</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Historial de pedidos de la tienda</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 w-full rounded-xl" />)}</div>
      ) : purchases.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
          <ShoppingCart size={48} className="mx-auto mb-4" style={{ color: "var(--text-tertiary)" }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text)" }}>Sin compras</h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Tus pedidos de la tienda aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map((p) => {
            const meta = statusMeta[p.status] || { label: p.status, color: "var(--text-tertiary)", bg: "var(--bg-muted)" };
            let itemCount = 0;
            try { const items = typeof p.items === "string" ? JSON.parse(p.items) : p.items; itemCount = Array.isArray(items) ? items.length : 0; } catch {}
            return (
              <div key={p.id} className="rounded-xl p-5 transition-all hover:shadow-sm" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: meta.bg, color: meta.color }}>
                      <Package size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>{p.order_number || p.id.slice(0, 8)}</h3>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {itemCount > 0 ? `${itemCount} producto${itemCount !== 1 ? "s" : ""}` : "Pedido"} · {p.payment_method || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-medium px-2.5 py-1 rounded-full" style={{ background: meta.bg, color: meta.color }}>
                      {meta.label}
                    </span>
                    <span className="text-base font-bold" style={{ color: "var(--text)" }}>${p.total?.toLocaleString() || 0}</span>
                    <button onClick={() => viewDetail(p.id)} className="p-1.5 rounded-md hover:bg-[var(--bg-muted)] transition-all" style={{ color: "var(--text-secondary)" }} title="Ver detalle" type="button">
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs mt-2" style={{ color: "var(--text-tertiary)" }}>{new Date(p.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
            );
          })}
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setDetail(null)}>
          <div className="w-full max-w-lg rounded-2xl p-6 max-h-[80vh] overflow-y-auto" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>Pedido {detail.order_number || detail.id.slice(0, 8)}</h3>
              <button onClick={() => setDetail(null)} className="text-sm" style={{ color: "var(--text-tertiary)" }}>Cerrar</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span style={{ color: "var(--text-tertiary)" }}>Estado</span><p className="font-medium" style={{ color: (statusMeta[detail.status] || statusMeta.pending).color }}>{(statusMeta[detail.status] || statusMeta.pending).label}</p></div>
                <div><span style={{ color: "var(--text-tertiary)" }}>Pago</span><p className="font-medium" style={{ color: "var(--text)" }}>{detail.payment_method || "N/A"}</p></div>
                <div><span style={{ color: "var(--text-tertiary)" }}>Fecha</span><p className="font-medium" style={{ color: "var(--text)" }}>{new Date(detail.created_at).toLocaleDateString("es-ES")}</p></div>
                <div><span style={{ color: "var(--text-tertiary)" }}>Total</span><p className="font-bold" style={{ color: "var(--accent)" }}>${detail.total?.toLocaleString()}</p></div>
              </div>
              {detail.items && (() => {
                const items = typeof detail.items === "string" ? JSON.parse(detail.items) : detail.items;
                return Array.isArray(items) && items.length > 0 ? (
                  <div><h4 className="text-xs font-medium mb-2" style={{ color: "var(--text-tertiary)" }}>PRODUCTOS</h4>
                    <div className="space-y-2">{items.map((it: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--bg-muted)" }}>
                        <div><p className="font-medium" style={{ color: "var(--text)" }}>{it.name || it.product_name}</p><p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Cant: {it.quantity}</p></div>
                        <span className="font-semibold" style={{ color: "var(--text)" }}>${(it.price || it.unit_price || 0).toLocaleString()}</span>
                      </div>
                    ))}</div>
                  </div>
                ) : null;
              })()}
              {detail.shipping_address && <div><h4 className="text-xs font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>DIRECCIÓN DE ENVÍO</h4><p style={{ color: "var(--text-secondary)" }}>{detail.shipping_address}</p></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
