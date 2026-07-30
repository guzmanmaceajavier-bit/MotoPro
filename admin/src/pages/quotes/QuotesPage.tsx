import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import { FileText, Plus, Search, Eye, CheckCircle, XCircle, Send, Loader2, Download } from "lucide-react";
import Modal from "@/components/Modal";

interface QuoteItem {
  product: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Quote {
  id: string;
  work_order_id: string;
  work_order_number?: string;
  customer_id: string;
  customer_name?: string;
  items: QuoteItem[];
  labor: number;
  discount: number;
  tax: number;
  subtotal: number;
  total: number;
  status: "pending" | "approved" | "rejected" | "sent";
  notes?: string;
  created_at: string;
  updated_at?: string;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface WorkOrder {
  id: string;
  number?: string;
  customer_name?: string;
}

const STATUS_LABELS: Record<string, string> = { pending: "Pendiente", approved: "Aprobada", rejected: "Rechazada", sent: "Enviada" };
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  approved: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  sent: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const FILTER_TABS = [
  { key: "all", label: "Todas" },
  { key: "pending", label: "Pendientes" },
  { key: "approved", label: "Aprobadas" },
  { key: "rejected", label: "Rechazadas" },
  { key: "sent", label: "Enviadas" },
];

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState("all");
  const [search, setSearch] = useState("");
  const [detailQuote, setDetailQuote] = useState<Quote | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    customer_id: "",
    work_order_id: "",
    items: [{ product: "", quantity: 1, unit_price: 0 }] as QuoteItem[],
    labor: 0,
    discount: 0,
    tax: 0,
    notes: "",
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get("/quotes").then((r) => setQuotes(r || [])),
      api.get("/customers").then((r) => setCustomers(r || [])),
      api.get("/orders").then((r) => setWorkOrders(r || [])),
    ]).catch(() => showToast("error", "Error al cargar datos"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = quotes.filter((q) => {
    if (filterTab !== "all" && q.status !== filterTab) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!(q.customer_name || "").toLowerCase().includes(s) && !(q.work_order_number || "").toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const formatCurrency = (n: number) => `$${n.toFixed(2)}`;

  const calcItemTotal = (item: QuoteItem) => item.quantity * item.unit_price;
  const calcSubtotal = (items: QuoteItem[]) => items.reduce((s, i) => s + calcItemTotal(i), 0);
  const calcTotal = (items: QuoteItem[], labor: number, discount: number, tax: number) => {
    const sub = calcSubtotal(items) + labor;
    return sub + tax - discount;
  };

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/quotes/${id}/approve`);
      showToast("success", "Cotización aprobada");
      fetchData();
      setDetailQuote(null);
    } catch { showToast("error", "Error al aprobar"); }
  };

  const handleReject = async (id: string) => {
    try {
      await api.put(`/quotes/${id}/reject`);
      showToast("success", "Cotización rechazada");
      fetchData();
      setDetailQuote(null);
    } catch { showToast("error", "Error al rechazar"); }
  };

  const handleSend = async (id: string) => {
    try {
      await api.post(`/quotes/${id}/send`);
      showToast("success", "Cotización enviada");
      fetchData();
      setDetailQuote(null);
    } catch { showToast("error", "Error al enviar"); }
  };

  const handleCreate = async () => {
    if (!form.customer_id || form.items.length === 0) return;
    setCreating(true);
    try {
      await api.post("/quotes", form);
      showToast("success", "Cotización creada");
      setShowCreateModal(false);
      setForm({ customer_id: "", work_order_id: "", items: [{ product: "", quantity: 1, unit_price: 0 }], labor: 0, discount: 0, tax: 0, notes: "" });
      fetchData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Error al crear");
    } finally { setCreating(false); }
  };

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { product: "", quantity: 1, unit_price: 0 }] }));
  const removeItem = (idx: number) => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx: number, partial: Partial<QuoteItem>) =>
    setForm((f) => ({ ...f, items: f.items.map((item, i) => i === idx ? { ...item, ...partial } : item) }));

  const exportCSV = () => {
    const headers = "ID,Orden,Cliente,Items,Total,Estado,Fecha\n";
    const rows = filtered.map((q) =>
      `"${q.id}","${q.work_order_number || ""}","${q.customer_name || ""}",${q.items.length},"${formatCurrency(q.total)}","${STATUS_LABELS[q.status] || q.status}","${new Date(q.created_at).toLocaleDateString("es-ES")}"`
    ).join("\n");
    const blob = new Blob([`${headers}${rows}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "cotizaciones.csv"; a.click();
    URL.revokeObjectURL(url);
  };

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
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(255,107,0,0.1)] text-[var(--mp-accent)]">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--mp-text-primary)]">Cotizaciones</h1>
            <p className="text-sm text-[var(--mp-text-tertiary)]">Gestión de cotizaciones para clientes</p>
          </div>
        </div>
        <div className="flex gap-2">
          {filtered.length > 0 && (
            <button onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-white/10 text-[var(--mp-text-secondary)] hover:bg-[var(--mp-bg-hover)]">
              <Download size={14} /> CSV
            </button>
          )}
          <button onClick={() => setShowCreateModal(true)} className="mp-btn-primary text-sm inline-flex items-center gap-1.5">
            <Plus size={15} /> Nueva cotización
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente u orden..."
            className="mp-input text-sm w-full pl-9" />
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-[var(--mp-bg-elevated)]">
          {FILTER_TABS.map((t) => (
            <button key={t.key} onClick={() => setFilterTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterTab === t.key ? "bg-[var(--mp-accent)] text-white" : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)]"
              }`}>
              {t.label}
              {t.key !== "all" && (
                <span className="ml-1.5 text-[10px] opacity-70">({quotes.filter((q) => q.status === t.key).length})</span>
              )}
            </button>
          ))}
        </div>
        <span className="text-xs text-[var(--mp-text-tertiary)] ml-auto">{filtered.length} cotización{filtered.length !== 1 ? "es" : ""}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="mp-card p-12 flex flex-col items-center text-center">
          <FileText size={40} className="text-[var(--mp-text-tertiary)] mb-3" />
          <h3 className="text-lg font-semibold text-[var(--mp-text-primary)] mb-1">
            {search || filterTab !== "all" ? "Sin resultados" : "Sin cotizaciones"}
          </h3>
          <p className="text-sm text-[var(--mp-text-tertiary)] mb-6 max-w-sm">
            {search ? "Intenta con otros términos de búsqueda" : "Crea cotizaciones para tus clientes."}
          </p>
          {!search && filterTab === "all" && (
            <button onClick={() => setShowCreateModal(true)} className="mp-btn-primary text-sm inline-flex items-center gap-1.5">
              <Plus size={15} /> Nueva cotización
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => (
            <div key={q.id}
              className="mp-card p-4 flex items-center gap-4 cursor-pointer hover:bg-[var(--mp-bg-elevated)] transition-colors"
              onClick={() => setDetailQuote(q)}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--mp-bg-elevated)] text-[var(--mp-text-tertiary)] shrink-0">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
                <div>
                  <p className="text-sm font-medium text-[var(--mp-text-primary)]">#{q.id.slice(0, 8)}</p>
                  <p className="text-xs text-[var(--mp-text-tertiary)]">{q.customer_name || "—"}</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-[var(--mp-text-tertiary)]">Orden</p>
                  <p className="text-sm text-[var(--mp-text-primary)]">{q.work_order_number || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--mp-text-tertiary)]">Total</p>
                  <p className="text-sm font-semibold text-[var(--mp-text-primary)]">{formatCurrency(q.total)}</p>
                  <p className="text-[10px] text-[var(--mp-text-tertiary)]">{q.items.length} ítem{q.items.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${STATUS_COLORS[q.status] || ""}`}>
                    {STATUS_LABELS[q.status] || q.status}
                  </span>
                  <p className="text-[10px] text-[var(--mp-text-tertiary)] mt-1">{new Date(q.created_at).toLocaleDateString("es-ES")}</p>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setDetailQuote(q); }}
                className="p-1.5 rounded-lg hover:bg-[var(--mp-bg-hover)] text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] shrink-0">
                <Eye size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!detailQuote} onClose={() => setDetailQuote(null)} title={`Cotización #${detailQuote?.id.slice(0, 8) || ""}`} size="xl">
        {detailQuote && (
          <div>
            <div className="border-b border-white/10 pb-4 mb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[var(--mp-text-primary)]">Cotización #{detailQuote.id.slice(0, 8)}</h3>
                  <p className="text-xs text-[var(--mp-text-tertiary)]">{new Date(detailQuote.created_at).toLocaleDateString("es-ES", { dateStyle: "long" })}</p>
                  {detailQuote.work_order_number && (
                    <p className="text-xs text-[var(--mp-text-tertiary)]">Orden: {detailQuote.work_order_number}</p>
                  )}
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium border ${STATUS_COLORS[detailQuote.status]}`}>
                  {STATUS_LABELS[detailQuote.status]}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)] mb-4">
              <h4 className="text-xs font-semibold text-[var(--mp-text-tertiary)] uppercase mb-2">Cliente</h4>
              <p className="text-sm font-medium text-[var(--mp-text-primary)]">{detailQuote.customer_name || "—"}</p>
            </div>

            <table className="w-full mb-4">
              <thead>
                <tr className="border-b border-white/10 text-xs text-[var(--mp-text-tertiary)]">
                  <th className="text-left py-2 font-medium">Producto</th>
                  <th className="text-right py-2 font-medium">Cant.</th>
                  <th className="text-right py-2 font-medium">Precio</th>
                  <th className="text-right py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {(detailQuote.items || []).map((item, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-2 text-sm text-[var(--mp-text-primary)]">{item.product}</td>
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
                <span>{formatCurrency(detailQuote.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[var(--mp-text-tertiary)]">
                <span>Mano de obra</span>
                <span>{formatCurrency(detailQuote.labor)}</span>
              </div>
              <div className="flex justify-between text-[var(--mp-text-tertiary)]">
                <span>Descuento</span>
                <span>-{formatCurrency(detailQuote.discount)}</span>
              </div>
              <div className="flex justify-between text-[var(--mp-text-tertiary)]">
                <span>Impuesto</span>
                <span>{formatCurrency(detailQuote.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[var(--mp-text-primary)] pt-1 border-t border-white/10">
                <span>Total</span>
                <span>{formatCurrency(detailQuote.total)}</span>
              </div>
            </div>

            {detailQuote.notes && (
              <p className="mt-3 text-xs text-[var(--mp-text-tertiary)] italic">Notas: {detailQuote.notes}</p>
            )}

            <div className="flex justify-between gap-2 pt-4 border-t border-white/10 mt-4">
              <div className="flex gap-2">
                {detailQuote.status === "pending" && (
                  <>
                    <button onClick={() => handleApprove(detailQuote.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30">
                      <CheckCircle size={14} /> Aprobar
                    </button>
                    <button onClick={() => handleReject(detailQuote.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30">
                      <XCircle size={14} /> Rechazar
                    </button>
                    <button onClick={() => handleSend(detailQuote.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">
                      <Send size={14} /> Enviar
                    </button>
                  </>
                )}
                {detailQuote.status === "approved" && (
                  <button onClick={() => handleSend(detailQuote.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">
                    <Send size={14} /> Enviar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nueva cotización" size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Cliente *</label>
              <select value={form.customer_id} onChange={(e) => setForm((f) => ({ ...f, customer_id: e.target.value }))}
                className="mp-select text-sm w-full">
                <option value="">Seleccionar cliente</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Orden de trabajo</label>
              <select value={form.work_order_id} onChange={(e) => setForm((f) => ({ ...f, work_order_id: e.target.value }))}
                className="mp-select text-sm w-full">
                <option value="">Sin orden</option>
                {workOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {(o.number || o.id).slice(0, 10)} - {o.customer_name || ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-[var(--mp-text-primary)]">Items</label>
              <button onClick={addItem} type="button"
                className="text-xs text-[var(--mp-accent)] hover:underline">+ Agregar item</button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <input value={item.product} onChange={(e) => updateItem(i, { product: e.target.value })}
                      className="mp-input text-sm w-full" placeholder="Producto/servicio" />
                  </div>
                  <div className="w-16">
                    <input type="number" min={1} value={item.quantity}
                      onChange={(e) => updateItem(i, { quantity: parseInt(e.target.value) || 1 })}
                      className="mp-input text-sm w-full text-center" />
                  </div>
                  <div className="w-24">
                    <input type="number" min={0} step={0.01} value={item.unit_price}
                      onChange={(e) => updateItem(i, { unit_price: parseFloat(e.target.value) || 0 })}
                      className="mp-input text-sm w-full" placeholder="Precio" />
                  </div>
                  <div className="w-20 text-sm text-[var(--mp-text-primary)] pt-1 text-right">
                    {formatCurrency(calcItemTotal(item))}
                  </div>
                  {form.items.length > 1 && (
                    <button onClick={() => removeItem(i)} type="button"
                      className="p-1.5 text-[var(--mp-text-tertiary)] hover:text-red-400">
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Mano de obra</label>
              <input type="number" min={0} step={0.01} value={form.labor}
                onChange={(e) => setForm((f) => ({ ...f, labor: parseFloat(e.target.value) || 0 }))}
                className="mp-input text-sm w-full" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Descuento</label>
              <input type="number" min={0} step={0.01} value={form.discount}
                onChange={(e) => setForm((f) => ({ ...f, discount: parseFloat(e.target.value) || 0 }))}
                className="mp-input text-sm w-full" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Impuesto</label>
              <input type="number" min={0} step={0.01} value={form.tax}
                onChange={(e) => setForm((f) => ({ ...f, tax: parseFloat(e.target.value) || 0 }))}
                className="mp-input text-sm w-full" />
            </div>
          </div>

          <div className="text-right text-sm font-semibold text-[var(--mp-text-primary)]">
            Total estimado: {formatCurrency(calcTotal(form.items, form.labor, form.discount, form.tax))}
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Notas</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="mp-input text-sm w-full resize-none" rows={2} placeholder="Notas opcionales" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 rounded-lg text-sm text-[var(--mp-text-secondary)] hover:bg-[var(--mp-bg-hover)]">
              Cancelar
            </button>
            <button onClick={handleCreate} disabled={!form.customer_id || creating}
              className="mp-btn-primary text-sm inline-flex items-center gap-1.5 disabled:opacity-50">
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Crear cotización
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
