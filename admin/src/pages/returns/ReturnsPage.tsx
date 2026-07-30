import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import { RotateCcw, Plus, Search, Eye, CheckCircle, XCircle, Loader2, Trash2, DollarSign, CreditCard, Building2, Wallet, ArrowRight } from "lucide-react";
import Modal from "@/components/Modal";

interface ReturnItem {
  id: string;
  name: string;
  type: "product" | "service";
}

interface ReturnEntry {
  id: string;
  customer_id: string;
  customer_name?: string;
  items: ReturnItem[];
  reason: string;
  description?: string;
  images?: string[];
  status: "pending" | "approved" | "rejected";
  notes?: string;
  amount?: number;
  refund_status?: "pending" | "processing" | "completed" | "failed";
  refund_amount?: number;
  refund_method?: string;
  refund_date?: string;
  refund_transaction_id?: string;
  created_at: string;
  updated_at?: string;
}

interface Customer {
  id: string;
  name: string;
}

const STATUS_LABELS: Record<string, string> = { pending: "Pendiente", approved: "Aprobada", rejected: "Rechazada" };
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  approved: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

const REASONS = [
  "Producto defectuoso",
  "Producto incorrecto",
  "Daño durante envío",
  "Insatisfacción con el servicio",
  "Garantía",
  "Cancelación de orden",
  "Otro",
];

const FILTER_TABS = [
  { key: "all", label: "Todas" },
  { key: "pending", label: "Pendientes" },
  { key: "approved", label: "Aprobadas" },
  { key: "rejected", label: "Rechazadas" },
];

const REFUND_METHODS = ["efectivo", "transferencia", "tarjeta", "mercado_pago"];
const REFUND_METHOD_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
  mercado_pago: "Mercado Pago",
};
const REFUND_METHOD_ICONS: Record<string, any> = {
  efectivo: Wallet,
  transferencia: Building2,
  tarjeta: CreditCard,
  mercado_pago: DollarSign,
};
const REFUND_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  processing: "Procesando",
  completed: "Completado",
  failed: "Fallido",
};
const REFUND_STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnEntry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState("all");
  const [search, setSearch] = useState("");
  const [detailReturn, setDetailReturn] = useState<ReturnEntry | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [refundForm, setRefundForm] = useState({ amount: 0, method: "transferencia", transaction_id: "" });
  const { showToast } = useToast();

  const [form, setForm] = useState({
    customer_id: "",
    items: [{ id: "", name: "", type: "product" as "product" | "service" }],
    reason: "",
    description: "",
    images: [] as string[],
    amount: 0,
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get("/returns").then((r) => setReturns(r || [])),
      api.get("/customers").then((r) => setCustomers(r || [])),
    ]).catch(() => showToast("error", "Error al cargar datos"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = returns.filter((r) => {
    if (filterTab !== "all" && r.status !== filterTab) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!(r.customer_name || "").toLowerCase().includes(q) && !r.id.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/returns/${id}`, { status: "approved" });
      showToast("success", "Devolución aprobada");
      fetchData();
      setDetailReturn(null);
    } catch { showToast("error", "Error al aprobar"); }
  };

  const handleReject = async (id: string) => {
    try {
      await api.put(`/returns/${id}`, { status: "rejected" });
      showToast("success", "Devolución rechazada");
      fetchData();
      setDetailReturn(null);
    } catch { showToast("error", "Error al rechazar"); }
  };

  const handleProcessRefund = async (id: string) => {
    if (!refundForm.amount || !refundForm.method) return;
    setRefunding(true);
    try {
      await api.put(`/returns/${id}`, {
        refund_status: "completed",
        refund_amount: refundForm.amount,
        refund_method: refundForm.method,
        refund_transaction_id: refundForm.transaction_id || undefined,
        refund_date: new Date().toISOString(),
      });
      showToast("success", "Reembolso procesado correctamente");
      setShowRefundModal(false);
      setDetailReturn(null);
      fetchData();
    } catch {
      showToast("error", "Error al procesar reembolso");
    } finally { setRefunding(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta devolución?")) return;
    try {
      await api.delete(`/returns/${id}`);
      showToast("success", "Devolución eliminada");
      fetchData();
      setDetailReturn(null);
    } catch { showToast("error", "Error al eliminar"); }
  };

  const handleCreate = async () => {
    if (!form.customer_id || !form.reason) return;
    setCreating(true);
    try {
      await api.post("/returns", form);
      showToast("success", "Devolución creada");
      setShowCreateModal(false);
      setForm({ customer_id: "", items: [{ id: "", name: "", type: "product" }], reason: "", description: "", images: [], amount: 0 });
      fetchData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Error al crear");
    } finally { setCreating(false); }
  };

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { id: "", name: "", type: "product" as const }] }));
  const removeItem = (idx: number) => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx: number, partial: Partial<ReturnItem>) =>
    setForm((f) => ({ ...f, items: f.items.map((item, i) => i === idx ? { ...item, ...partial } : item) }));

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
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(255,107,0,0.1)] text-[var(--mp-accent)]">
            <RotateCcw size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--mp-text-primary)]">Devoluciones</h1>
            <p className="text-sm text-[var(--mp-text-tertiary)]">Gestión de devoluciones y reembolsos</p>
          </div>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="mp-btn-primary text-sm inline-flex items-center gap-1.5">
          <Plus size={15} /> Nueva devolución
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente o ID..."
            className="mp-input text-sm w-full pl-9" />
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-[var(--mp-bg-elevated)]">
          {FILTER_TABS.map((t) => (
            <button key={t.key} onClick={() => setFilterTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterTab === t.key ? "bg-[var(--mp-accent)] text-white" : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)]"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-[var(--mp-text-tertiary)] ml-auto">{filtered.length} devolución{filtered.length !== 1 ? "es" : ""}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="mp-card p-12 flex flex-col items-center text-center">
          <RotateCcw size={40} className="text-[var(--mp-text-tertiary)] mb-3" />
          <h3 className="text-lg font-semibold text-[var(--mp-text-primary)] mb-1">
            {search || filterTab !== "all" ? "Sin resultados" : "Sin devoluciones"}
          </h3>
          <p className="text-sm text-[var(--mp-text-tertiary)] mb-6 max-w-sm">
            {search ? "Intenta con otros términos de búsqueda" : "Registra devoluciones de productos o servicios."}
          </p>
          {!search && filterTab === "all" && (
            <button onClick={() => setShowCreateModal(true)} className="mp-btn-primary text-sm inline-flex items-center gap-1.5">
              <Plus size={15} /> Nueva devolución
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id}
              className="mp-card p-4 flex items-center gap-4 cursor-pointer hover:bg-[var(--mp-bg-elevated)] transition-colors"
              onClick={() => setDetailReturn(r)}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                r.status === "approved" ? "bg-green-500/10 text-green-400" :
                r.status === "rejected" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
              }`}>
                <RotateCcw size={18} />
              </div>
              <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
                <div>
                  <p className="text-sm font-medium text-[var(--mp-text-primary)] truncate">{r.customer_name || "—"}</p>
                  <p className="text-xs text-[var(--mp-text-tertiary)]">#{r.id.slice(0, 8)}</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-[var(--mp-text-tertiary)]">Motivo</p>
                  <p className="text-sm text-[var(--mp-text-primary)] truncate max-w-[150px]">{r.reason}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--mp-text-tertiary)]">Monto</p>
                  <p className="text-sm font-semibold text-[var(--mp-text-primary)]">{r.amount ? formatCurrency(r.amount) : "—"}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${STATUS_COLORS[r.status] || ""}`}>
                    {STATUS_LABELS[r.status] || r.status}
                  </span>
                  <p className="text-[10px] text-[var(--mp-text-tertiary)] mt-1">{new Date(r.created_at).toLocaleDateString("es-ES")}</p>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setDetailReturn(r); }}
                className="p-1.5 rounded-lg hover:bg-[var(--mp-bg-hover)] text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] shrink-0">
                <Eye size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!detailReturn} onClose={() => setDetailReturn(null)} title="Detalle de devolución" size="xl">
        {detailReturn && (
          <div>
            <div className="border-b border-white/10 pb-4 mb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[var(--mp-text-primary)]">Devolución #{detailReturn.id.slice(0, 8)}</h3>
                  <p className="text-xs text-[var(--mp-text-tertiary)]">{new Date(detailReturn.created_at).toLocaleDateString("es-ES", { dateStyle: "long" })}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium border ${STATUS_COLORS[detailReturn.status]}`}>
                  {STATUS_LABELS[detailReturn.status]}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)] mb-4">
              <h4 className="text-xs font-semibold text-[var(--mp-text-tertiary)] uppercase mb-2">Cliente</h4>
              <p className="text-sm font-medium text-[var(--mp-text-primary)]">{detailReturn.customer_name || "—"}</p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)] mb-4">
              <h4 className="text-xs font-semibold text-[var(--mp-text-tertiary)] uppercase mb-2">Motivo</h4>
              <p className="text-sm text-[var(--mp-text-primary)]">{detailReturn.reason}</p>
            </div>

            {detailReturn.description && (
              <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)] mb-4">
                <h4 className="text-xs font-semibold text-[var(--mp-text-tertiary)] uppercase mb-2">Descripción</h4>
                <p className="text-sm text-[var(--mp-text-primary)] whitespace-pre-wrap">{detailReturn.description}</p>
              </div>
            )}

            {detailReturn.items && detailReturn.items.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-[var(--mp-text-tertiary)] uppercase mb-2">Items</h4>
                <div className="space-y-1">
                  {detailReturn.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[var(--mp-bg-elevated)]">
                      <p className="text-sm text-[var(--mp-text-primary)]">{item.name}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 capitalize">{item.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detailReturn.amount && (
              <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)] mb-4">
                <h4 className="text-xs font-semibold text-[var(--mp-text-tertiary)] uppercase mb-2">Monto</h4>
                <p className="text-sm font-bold text-[var(--mp-text-primary)]">{formatCurrency(detailReturn.amount)}</p>
              </div>
            )}

            {detailReturn.images && detailReturn.images.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-[var(--mp-text-tertiary)] uppercase mb-2">Imágenes</h4>
                <div className="grid grid-cols-3 gap-2">
                  {detailReturn.images.map((img, i) => (
                    <div key={i} className="rounded-lg overflow-hidden bg-[var(--mp-bg-elevated)]">
                      <img src={img} alt="" className="w-full h-24 object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detailReturn.notes && (
              <p className="mt-3 text-xs text-[var(--mp-text-tertiary)] italic">Notas: {detailReturn.notes}</p>
            )}

            {/* Flujo de reembolso */}
            {detailReturn.status === "approved" && (
              <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign size={16} className="text-green-400" />
                  <h4 className="text-sm font-semibold text-[var(--mp-text-primary)]">Reembolso</h4>
                </div>

                {detailReturn.refund_status === "completed" ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <CheckCircle size={18} className="text-green-400 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-green-400">Reembolso completado</p>
                        <p className="text-xs text-[var(--mp-text-tertiary)]">
                          {detailReturn.refund_date && new Date(detailReturn.refund_date).toLocaleDateString("es-ES", { dateStyle: "long" })}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-[var(--mp-bg-elevated)]">
                        <p className="text-[10px] text-[var(--mp-text-tertiary)] uppercase">Monto reembolsado</p>
                        <p className="text-sm font-bold text-[var(--mp-text-primary)]">{detailReturn.refund_amount ? formatCurrency(detailReturn.refund_amount) : "—"}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-[var(--mp-bg-elevated)]">
                        <p className="text-[10px] text-[var(--mp-text-tertiary)] uppercase">Método</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {(() => {
                            const Icon = REFUND_METHOD_ICONS[detailReturn.refund_method || ""] || DollarSign;
                            return <Icon size={12} className="text-[var(--mp-accent)]" />;
                          })()}
                          <p className="text-sm font-medium text-[var(--mp-text-primary)]">
                            {REFUND_METHOD_LABELS[detailReturn.refund_method || ""] || detailReturn.refund_method}
                          </p>
                        </div>
                      </div>
                    </div>
                    {detailReturn.refund_transaction_id && (
                      <div className="p-3 rounded-lg bg-[var(--mp-bg-elevated)]">
                        <p className="text-[10px] text-[var(--mp-text-tertiary)] uppercase">ID de transacción</p>
                        <p className="text-sm font-mono text-[var(--mp-text-primary)]">{detailReturn.refund_transaction_id}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {detailReturn.refund_status === "processing" && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <Loader2 size={16} className="animate-spin text-blue-400" />
                        <p className="text-sm text-blue-400">Procesando reembolso...</p>
                      </div>
                    )}
                    {detailReturn.refund_status === "failed" && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <XCircle size={16} className="text-red-400" />
                        <div>
                          <p className="text-sm font-medium text-red-400">Reembolso fallido</p>
                          <p className="text-xs text-[var(--mp-text-tertiary)]">Intenta nuevamente o cambia el método</p>
                        </div>
                      </div>
                    )}
                    <button onClick={() => { setRefundForm({ amount: detailReturn.amount || 0, method: "transferencia", transaction_id: "" }); setShowRefundModal(true); }}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">
                      <DollarSign size={14} /> Procesar reembolso
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between gap-2 pt-4 border-t border-white/10 mt-4">
              <div className="flex gap-2">
                {detailReturn.status === "pending" && (
                  <>
                    <button onClick={() => handleApprove(detailReturn.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30">
                      <CheckCircle size={14} /> Aprobar
                    </button>
                    <button onClick={() => handleReject(detailReturn.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30">
                      <XCircle size={14} /> Rechazar
                    </button>
                  </>
                )}
              </div>
              <button onClick={() => handleDelete(detailReturn.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30">
                <Trash2 size={14} /> Eliminar
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nueva devolución" size="lg">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Cliente *</label>
            <select value={form.customer_id} onChange={(e) => setForm((f) => ({ ...f, customer_id: e.target.value }))}
              className="mp-select text-sm w-full">
              <option value="">Seleccionar cliente</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
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
                    <input value={item.name} onChange={(e) => updateItem(i, { name: e.target.value })}
                      className="mp-input text-sm w-full" placeholder="Nombre del item" />
                  </div>
                  <select value={item.type} onChange={(e) => updateItem(i, { type: e.target.value as "product" | "service" })}
                    className="mp-select text-sm w-28">
                    <option value="product">Producto</option>
                    <option value="service">Servicio</option>
                  </select>
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

          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Motivo *</label>
            <select value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              className="mp-select text-sm w-full">
              <option value="">Seleccionar motivo</option>
              {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Descripción</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mp-input text-sm w-full resize-none" rows={3}
              placeholder="Describe el motivo de la devolución..." />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Monto a reembolsar</label>
            <input type="number" min={0} step={0.01} value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
              className="mp-input text-sm w-full" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 rounded-lg text-sm text-[var(--mp-text-secondary)] hover:bg-[var(--mp-bg-hover)]">
              Cancelar
            </button>
            <button onClick={handleCreate} disabled={!form.customer_id || !form.reason || creating}
              className="mp-btn-primary text-sm inline-flex items-center gap-1.5 disabled:opacity-50">
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Crear devolución
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de reembolso */}
      <Modal open={showRefundModal} onClose={() => setShowRefundModal(false)} title="Procesar reembolso" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Monto a reembolsar *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--mp-text-tertiary)]">$</span>
              <input type="number" min={0} step={0.01} value={refundForm.amount}
                onChange={(e) => setRefundForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                className="mp-input text-sm w-full pl-7" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Método de reembolso *</label>
            <div className="grid grid-cols-2 gap-2">
              {REFUND_METHODS.map((method) => {
                const Icon = REFUND_METHOD_ICONS[method] || DollarSign;
                return (
                  <button key={method} type="button" onClick={() => setRefundForm((f) => ({ ...f, method }))}
                    className={`p-3 rounded-xl text-xs font-medium transition-all border flex items-center gap-2 ${
                      refundForm.method === method
                        ? "border-[var(--mp-accent)] bg-[rgba(255,107,0,0.1)] text-[var(--mp-accent)]"
                        : "border-white/10 bg-[var(--mp-bg-elevated)] text-[var(--mp-text-secondary)] hover:border-white/20"
                    }`}>
                    <Icon size={14} />
                    {REFUND_METHOD_LABELS[method]}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">ID de transacción</label>
            <input value={refundForm.transaction_id}
              onChange={(e) => setRefundForm((f) => ({ ...f, transaction_id: e.target.value }))}
              className="mp-input text-sm w-full font-mono" placeholder="Opcional, ej: TXN-001" />
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-amber-400 flex items-center gap-1.5">
              <ArrowRight size={12} />
              Al confirmar se registrará el reembolso como completado. Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowRefundModal(false)}
              className="px-4 py-2 rounded-lg text-sm text-[var(--mp-text-secondary)] hover:bg-[var(--mp-bg-hover)]">
              Cancelar
            </button>
            <button onClick={() => detailReturn && handleProcessRefund(detailReturn.id)}
              disabled={!refundForm.amount || !refundForm.method || refunding}
              className="mp-btn-primary text-sm inline-flex items-center gap-1.5 disabled:opacity-50">
              {refunding ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />}
              Confirmar reembolso
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
