import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import { Activity, Search, Plus, Trash2, Loader2, Clock, Image as ImageIcon } from "lucide-react";
import Modal from "@/components/Modal";

interface TimelineEntry {
  id: string;
  order_id: string;
  status: string;
  description: string;
  image?: string;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "received", label: "Recibido", color: "bg-blue-500/20 text-blue-400" },
  { value: "diagnosing", label: "Diagnosticando", color: "bg-purple-500/20 text-purple-400" },
  { value: "waiting_parts", label: "Esperando piezas", color: "bg-amber-500/20 text-amber-400" },
  { value: "in_progress", label: "En reparación", color: "bg-teal-500/20 text-teal-400" },
  { value: "ready", label: "Listo", color: "bg-green-500/20 text-green-400" },
  { value: "delivered", label: "Entregado", color: "bg-gray-500/20 text-gray-400" },
  { value: "cancelled", label: "Cancelado", color: "bg-red-500/20 text-red-400" },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {};
STATUS_OPTIONS.forEach((s) => { STATUS_MAP[s.value] = { label: s.label, color: s.color }; });

interface Order {
  id: string;
  customer_name: string;
  brand_model?: string;
  plate?: string;
}

export default function OrderTimelinePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({ status: "received", description: "", image: "" });

  const fetchOrders = () => {
    api.get("/orders").then((r) => setOrders(r || [])).catch(() => {});
  };

  const fetchEntries = (orderId: string) => {
    setLoading(true);
    api.get(`/timeline?order_id=${orderId}`).then((r) => {
      setEntries((r || []).sort((a: TimelineEntry, b: TimelineEntry) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      setLoaded(true);
    }).catch(() => showToast("error", "Error al cargar timeline"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    if (selectedOrderId) fetchEntries(selectedOrderId);
    else { setEntries([]); setLoaded(false); }
  }, [selectedOrderId]);

  const filteredOrders = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return o.id.toLowerCase().includes(q) || (o.customer_name || "").toLowerCase().includes(q) ||
      (o.plate || "").toLowerCase().includes(q) || (o.brand_model || "").toLowerCase().includes(q);
  });

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  const handleAddEntry = async () => {
    if (!selectedOrderId || !form.description) return;
    try {
      await api.post("/timeline", { order_id: selectedOrderId, status: form.status, description: form.description, image: form.image || undefined });
      showToast("success", "Entrada agregada");
      setShowAddModal(false);
      setForm({ status: "received", description: "", image: "" });
      fetchEntries(selectedOrderId);
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Error al agregar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta entrada?")) return;
    try {
      await api.delete(`/timeline/${id}?order_id=${selectedOrderId}`);
      showToast("success", "Entrada eliminada");
      fetchEntries(selectedOrderId!);
    } catch {
      showToast("error", "Error al eliminar");
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(255,107,0,0.1)] text-[var(--mp-accent)]">
          <Activity size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--mp-text-primary)]">Timeline de Órdenes</h1>
          <p className="text-sm text-[var(--mp-text-tertiary)]">Historial de estados de las órdenes de trabajo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="mp-card p-4">
            <h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-3">Buscar orden</h3>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="ID, cliente, placa..."
                className="mp-input text-sm w-full pl-9" />
            </div>
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {filteredOrders.length === 0 ? (
                <p className="text-xs text-[var(--mp-text-tertiary)] text-center py-8">
                  {search ? "Sin resultados" : "No hay órdenes disponibles"}
                </p>
              ) : (
                filteredOrders.map((o) => (
                  <button key={o.id} onClick={() => setSelectedOrderId(o.id)}
                    className={`w-full text-left p-3 rounded-xl text-sm transition-colors ${
                      selectedOrderId === o.id
                        ? "bg-[rgba(255,107,0,0.1)] border border-[rgba(255,107,0,0.3)]"
                        : "bg-[var(--mp-bg-elevated)] hover:bg-[var(--mp-bg-hover)] border border-transparent"
                    }`}
                  >
                    <span className="font-medium text-[var(--mp-text-primary)] block truncate">{o.customer_name}</span>
                    <span className="text-[11px] text-[var(--mp-text-tertiary)]">
                      #{o.id.slice(0, 8)}{o.plate ? ` · ${o.plate}` : ""}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {!selectedOrderId ? (
            <div className="mp-card p-12 flex flex-col items-center text-center">
              <Activity size={40} className="text-[var(--mp-text-tertiary)] mb-3" />
              <h3 className="text-lg font-semibold text-[var(--mp-text-primary)] mb-1">Selecciona una orden</h3>
              <p className="text-sm text-[var(--mp-text-tertiary)]">Elige una orden del panel izquierdo para ver su timeline</p>
            </div>
          ) : loading ? (
            <div className="mp-card p-12 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-[var(--mp-accent)]" />
            </div>
          ) : (
            <div className="mp-card p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">
                    {selectedOrder?.customer_name || "Orden"}
                  </h3>
                  <p className="text-xs text-[var(--mp-text-tertiary)]">
                    #{selectedOrderId.slice(0, 8)}{selectedOrder?.plate ? ` · ${selectedOrder.plate}` : ""}
                  </p>
                </div>
                <button onClick={() => { setForm({ status: "received", description: "", image: "" }); setShowAddModal(true); }}
                  className="mp-btn-primary text-sm inline-flex items-center gap-1.5">
                  <Plus size={14} /> Añadir entrada
                </button>
              </div>

              {entries.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <Clock size={28} className="text-[var(--mp-text-tertiary)] mb-2" />
                  <p className="text-sm text-[var(--mp-text-tertiary)]">Sin entradas en el timeline</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-white/10" />
                  <div className="space-y-4">
                    {entries.map((entry, idx) => {
                      const statusInfo = STATUS_MAP[entry.status] || { label: entry.status, color: "bg-gray-500/20 text-gray-400" };
                      return (
                        <div key={entry.id} className="relative pl-10">
                          <div className={`absolute left-[9px] w-[13px] h-[13px] rounded-full border-2 border-[var(--mp-bg-surface)] ${
                            idx === 0 ? "bg-[var(--mp-accent)]" : "bg-white/20"
                          }`} />
                          <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)] border border-white/5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusInfo.color}`}>
                                    {statusInfo.label}
                                  </span>
                                  <span className="text-[10px] text-[var(--mp-text-tertiary)]">
                                    {formatDate(entry.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm text-[var(--mp-text-primary)]">{entry.description}</p>
                                {entry.image && (
                                  <div className="mt-2">
                                    <img src={entry.image} alt=""
                                      className="max-h-32 rounded-lg object-cover border border-white/10" />
                                  </div>
                                )}
                              </div>
                              <button onClick={() => handleDelete(entry.id)}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--mp-text-tertiary)] hover:text-red-400 shrink-0">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Nueva entrada en timeline" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Estado *</label>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="mp-select text-sm w-full">
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Descripción *</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mp-input text-sm w-full resize-none" rows={3}
              placeholder="Describe el avance o novedad..." />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">URL de imagen (opcional)</label>
            <div className="relative">
              <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
              <input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                className="mp-input text-sm w-full pl-9" placeholder="https://..." />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-lg text-sm text-[var(--mp-text-secondary)] hover:bg-[var(--mp-bg-hover)]">
              Cancelar
            </button>
            <button onClick={handleAddEntry} disabled={!form.description}
              className="mp-btn-primary text-sm disabled:opacity-50">
              Agregar entrada
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
