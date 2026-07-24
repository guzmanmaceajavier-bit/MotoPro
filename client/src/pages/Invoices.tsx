import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { FileText, CheckCircle, Clock, Download, Eye } from "lucide-react";

interface Invoice {
  id: string; invoice_number: string; total: number; status: string; payment_method?: string;
  subtotal?: number; tax?: number; notes?: string; work_order_id?: string;
  created_at: string; paid_at?: string;
}

const statusMeta: Record<string, { label: string; color: string; bg: string }> = {
  paid:    { label: "Pagada",    color: "#22C55E", bg: "rgba(34,197,94,0.1)" },
  pending: { label: "Pendiente", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  partial: { label: "Parcial",   color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  void:    { label: "Anulada",   color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
};

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Invoice | null>(null);

  useEffect(() => {
    api.get("/client/invoices").then((r) => {
      setInvoices(Array.isArray(r) ? r : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Facturas</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Historial de facturas de servicios y compras</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 w-full rounded-xl" />)}</div>
      ) : invoices.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
          <FileText size={48} className="mx-auto mb-4" style={{ color: "var(--text-tertiary)" }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text)" }}>Sin facturas</h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Tus facturas aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => {
            const meta = statusMeta[inv.status] || { label: inv.status, color: "var(--text-tertiary)", bg: "var(--bg-muted)" };
            return (
              <div key={inv.id} className="rounded-xl p-5 transition-all hover:shadow-sm cursor-pointer" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
                onClick={() => setDetail(inv)}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: meta.bg, color: meta.color }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>{inv.invoice_number}</h3>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {inv.payment_method || "N/A"} · {inv.work_order_id ? "Servicio" : "Compra"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-medium px-2.5 py-1 rounded-full" style={{ background: meta.bg, color: meta.color }}>
                      {meta.label}
                    </span>
                    <span className="text-base font-bold" style={{ color: "var(--text)" }}>${inv.total?.toLocaleString() || 0}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs" style={{ color: "var(--text-tertiary)" }}>
                  <span>{new Date(inv.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</span>
                  {inv.paid_at && <span>Pagado: {new Date(inv.paid_at).toLocaleDateString("es-ES")}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setDetail(null)}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>{detail.invoice_number}</h3>
              <button onClick={() => setDetail(null)} className="text-sm" style={{ color: "var(--text-tertiary)" }}>Cerrar</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span style={{ color: "var(--text-tertiary)" }}>Estado</span>
                  <p className="font-medium" style={{ color: (statusMeta[detail.status] || statusMeta.pending).color }}>{(statusMeta[detail.status] || statusMeta.pending).label}</p></div>
                <div><span style={{ color: "var(--text-tertiary)" }}>Método de pago</span>
                  <p className="font-medium" style={{ color: "var(--text)" }}>{detail.payment_method || "N/A"}</p></div>
                <div><span style={{ color: "var(--text-tertiary)" }}>Fecha</span>
                  <p className="font-medium" style={{ color: "var(--text)" }}>{new Date(detail.created_at).toLocaleDateString("es-ES")}</p></div>
                {detail.paid_at && <div><span style={{ color: "var(--text-tertiary)" }}>Pagado</span>
                  <p className="font-medium" style={{ color: "var(--text)" }}>{new Date(detail.paid_at).toLocaleDateString("es-ES")}</p></div>}
              </div>
              <div className="pt-3 border-t space-y-2" style={{ borderColor: "var(--border)" }}>
                {detail.subtotal && <div className="flex justify-between"><span style={{ color: "var(--text-secondary)" }}>Subtotal</span><span style={{ color: "var(--text)" }}>${detail.subtotal.toLocaleString()}</span></div>}
                {detail.tax && <div className="flex justify-between"><span style={{ color: "var(--text-secondary)" }}>IVA</span><span style={{ color: "var(--text)" }}>${detail.tax.toLocaleString()}</span></div>}
                <div className="flex justify-between pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                  <span className="font-semibold" style={{ color: "var(--text)" }}>Total</span>
                  <span className="text-xl font-bold" style={{ color: "var(--accent)" }}>${detail.total?.toLocaleString()}</span>
                </div>
              </div>
              {detail.notes && <div><h4 className="text-xs font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>NOTAS</h4><p style={{ color: "var(--text-secondary)" }}>{detail.notes}</p></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
