import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import { FileText, Plus, Search, Eye, CheckCircle, XCircle, Loader2, Download, Printer } from "lucide-react";
import Modal from "@/components/Modal";

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  order_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "pending" | "paid" | "cancelled";
  payment_method?: string;
  payment_date?: string;
  notes?: string;
  created_at: string;
}

interface Order {
  id: string;
  customer_name: string;
  total?: number;
}

const STATUS_LABELS: Record<string, string> = { pending: "Pendiente", paid: "Pagada", cancelled: "Cancelada" };
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  paid: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [generating, setGenerating] = useState(false);
  const { showToast } = useToast();

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get("/invoices").then((r) => setInvoices(r || [])),
      api.get("/orders").then((r) => setOrders(r || [])),
    ]).catch(() => showToast("error", "Error al cargar datos"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = invoices.filter((inv) => {
    if (filterStatus !== "all" && inv.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!inv.invoice_number.toLowerCase().includes(q) && !inv.customer_name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleMarkPaid = async (id: string) => {
    try {
      await api.put(`/invoices/${id}/status`, { status: "paid" });
      showToast("success", "Factura marcada como pagada");
      fetchData();
      setDetailInvoice(null);
    } catch { showToast("error", "Error al actualizar"); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("¿Cancelar esta factura?")) return;
    try {
      await api.put(`/invoices/${id}/status`, { status: "cancelled" });
      showToast("success", "Factura cancelada");
      fetchData();
      setDetailInvoice(null);
    } catch { showToast("error", "Error al cancelar"); }
  };

  const handleGenerate = async () => {
    if (!selectedOrderId) return;
    setGenerating(true);
    try {
      await api.post("/invoices", { order_id: selectedOrderId });
      showToast("success", "Factura generada");
      setShowGenerateModal(false);
      setSelectedOrderId("");
      fetchData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Error al generar");
    } finally { setGenerating(false); }
  };

  const handleViewPdf = (id: string) => {
    window.open(`/api/invoices/${id}/pdf`, "_blank");
  };

  const formatCurrency = (n: number) => `$${n.toFixed(2)}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-[var(--mp-accent)]" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(20,184,166,0.1)] text-[var(--mp-accent)]">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--mp-text-primary)]">Facturas</h1>
            <p className="text-sm text-[var(--mp-text-tertiary)]">Gestión de facturación</p>
          </div>
        </div>
        <button onClick={() => setShowGenerateModal(true)} className="mp-btn-primary text-sm inline-flex items-center gap-1.5">
          <Plus size={15} /> Generar factura
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar factura..."
            className="mp-input text-sm w-full pl-9" />
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-[var(--mp-bg-elevated)]">
          {[
            { key: "all", label: "Todas" },
            { key: "pending", label: "Pendientes" },
            { key: "paid", label: "Pagadas" },
            { key: "cancelled", label: "Canceladas" },
          ].map((t) => (
            <button key={t.key} onClick={() => setFilterStatus(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === t.key ? "bg-[var(--mp-accent)] text-white" : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)]"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-[var(--mp-text-tertiary)] ml-auto">{filtered.length} factura{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="mp-card p-12 flex flex-col items-center text-center">
          <FileText size={40} className="text-[var(--mp-text-tertiary)] mb-3" />
          <h3 className="text-lg font-semibold text-[var(--mp-text-primary)] mb-1">
            {search || filterStatus !== "all" ? "Sin resultados" : "Sin facturas"}
          </h3>
          <p className="text-sm text-[var(--mp-text-tertiary)] mb-6 max-w-sm">
            {search ? "Intenta con otros términos de búsqueda" : "Genera facturas desde las órdenes de trabajo existentes."}
          </p>
          {!search && filterStatus === "all" && (
            <button onClick={() => setShowGenerateModal(true)} className="mp-btn-primary text-sm inline-flex items-center gap-1.5">
              <Plus size={15} /> Generar factura
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv) => (
            <div key={inv.id}
              className="mp-card p-4 flex items-center gap-4 cursor-pointer hover:bg-[var(--mp-bg-elevated)] transition-colors"
              onClick={() => setDetailInvoice(inv)}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--mp-bg-elevated)] text-[var(--mp-text-tertiary)] shrink-0">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
                <div>
                  <p className="text-sm font-medium text-[var(--mp-text-primary)]">{inv.invoice_number}</p>
                  <p className="text-xs text-[var(--mp-text-tertiary)]">{inv.customer_name}</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-[var(--mp-text-tertiary)]">Fecha</p>
                  <p className="text-sm text-[var(--mp-text-primary)]">
                    {new Date(inv.created_at).toLocaleDateString("es-ES")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--mp-text-tertiary)]">Total</p>
                  <p className="text-sm font-semibold text-[var(--mp-text-primary)]">{formatCurrency(inv.total)}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${STATUS_COLORS[inv.status] || ""}`}>
                    {STATUS_LABELS[inv.status] || inv.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => handleViewPdf(inv.id)}
                  className="p-1.5 rounded-lg hover:bg-[var(--mp-bg-hover)] text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)]">
                  <Download size={14} />
                </button>
                <button onClick={() => setDetailInvoice(inv)}
                  className="p-1.5 rounded-lg hover:bg-[var(--mp-bg-hover)] text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)]">
                  <Eye size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!detailInvoice} onClose={() => setDetailInvoice(null)} title={`Factura ${detailInvoice?.invoice_number || ""}`} size="xl">
        {detailInvoice && (
          <div>
            <div className="border-b border-white/10 pb-4 mb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[var(--mp-text-primary)]">{detailInvoice.invoice_number}</h3>
                  <p className="text-xs text-[var(--mp-text-tertiary)]">{new Date(detailInvoice.created_at).toLocaleDateString("es-ES", { dateStyle: "long" })}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium border ${STATUS_COLORS[detailInvoice.status]}`}>
                  {STATUS_LABELS[detailInvoice.status]}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)] mb-4">
              <h4 className="text-xs font-semibold text-[var(--mp-text-tertiary)] uppercase mb-2">Cliente</h4>
              <p className="text-sm font-medium text-[var(--mp-text-primary)]">{detailInvoice.customer_name}</p>
              {detailInvoice.customer_email && <p className="text-xs text-[var(--mp-text-tertiary)]">{detailInvoice.customer_email}</p>}
              {detailInvoice.customer_phone && <p className="text-xs text-[var(--mp-text-tertiary)]">{detailInvoice.customer_phone}</p>}
            </div>

            <table className="w-full mb-4">
              <thead>
                <tr className="border-b border-white/10 text-xs text-[var(--mp-text-tertiary)]">
                  <th className="text-left py-2 font-medium">Descripción</th>
                  <th className="text-right py-2 font-medium">Cant.</th>
                  <th className="text-right py-2 font-medium">Precio</th>
                  <th className="text-right py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {(detailInvoice.items || []).map((item, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-2 text-sm text-[var(--mp-text-primary)]">{item.description}</td>
                    <td className="py-2 text-sm text-right text-[var(--mp-text-primary)]">{item.quantity}</td>
                    <td className="py-2 text-sm text-right text-[var(--mp-text-primary)]">{formatCurrency(item.unit_price)}</td>
                    <td className="py-2 text-sm text-right text-[var(--mp-text-primary)]">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-white/10 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-[var(--mp-text-tertiary)]">
                <span>Subtotal</span>
                <span>{formatCurrency(detailInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[var(--mp-text-tertiary)]">
                <span>IVA</span>
                <span>{formatCurrency(detailInvoice.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[var(--mp-text-primary)] pt-1 border-t border-white/10">
                <span>Total</span>
                <span>{formatCurrency(detailInvoice.total)}</span>
              </div>
            </div>

            {detailInvoice.payment_method && (
              <div className="mt-4 p-3 rounded-xl bg-[var(--mp-bg-elevated)]">
                <p className="text-xs text-[var(--mp-text-tertiary)]">Método de pago: <span className="text-[var(--mp-text-primary)] font-medium">{detailInvoice.payment_method}</span></p>
                {detailInvoice.payment_date && <p className="text-xs text-[var(--mp-text-tertiary)]">Pagado el: {new Date(detailInvoice.payment_date).toLocaleDateString("es-ES")}</p>}
              </div>
            )}

            {detailInvoice.notes && (
              <p className="mt-3 text-xs text-[var(--mp-text-tertiary)] italic">Notas: {detailInvoice.notes}</p>
            )}

            <div className="flex justify-between gap-2 pt-4 border-t border-white/10 mt-4">
              <div className="flex gap-2">
                {detailInvoice.status === "pending" && (
                  <>
                    <button onClick={() => handleMarkPaid(detailInvoice.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30">
                      <CheckCircle size={14} /> Marcar pagada
                    </button>
                    <button onClick={() => handleCancel(detailInvoice.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30">
                      <XCircle size={14} /> Cancelar
                    </button>
                  </>
                )}
              </div>
              <button onClick={() => handleViewPdf(detailInvoice.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-white/10 text-[var(--mp-text-secondary)] hover:bg-[var(--mp-bg-hover)]">
                <Printer size={14} /> Ver PDF
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showGenerateModal} onClose={() => setShowGenerateModal(false)} title="Generar factura desde orden" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Seleccionar orden *</label>
            <select value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)}
              className="mp-select text-sm w-full">
              <option value="">Selecciona una orden</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  #{o.id.slice(0, 8)} - {o.customer_name}{o.total ? ` ($${o.total})` : ""}
                </option>
              ))}
            </select>
            {orders.length === 0 && <p className="text-xs text-[var(--mp-text-tertiary)] mt-1">No hay órdenes disponibles</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowGenerateModal(false)}
              className="px-4 py-2 rounded-lg text-sm text-[var(--mp-text-secondary)] hover:bg-[var(--mp-bg-hover)]">
              Cancelar
            </button>
            <button onClick={handleGenerate} disabled={!selectedOrderId || generating}
              className="mp-btn-primary text-sm inline-flex items-center gap-1.5 disabled:opacity-50">
              {generating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Generar factura
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
