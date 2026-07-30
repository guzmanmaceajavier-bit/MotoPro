import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import PageHeader from "@/components/PageHeader";
import { Badge } from "@shared/components/ui/Badge";
import {
  User, Bike, Phone, Mail, Wrench, FileText, Clock, AlertTriangle,
  CheckCircle2, XCircle, ArrowRight, Save, Plus, Trash2, Send,
  Shield, Camera, PenTool, Eye, Package, DollarSign, Star, Info,
  ChevronDown, ChevronUp, MessageSquare
} from "lucide-react";

interface WorkOrder {
  id: string; order_number: string; customer_id: string; customer_name: string;
  customer_phone: string; customer_email: string; vehicle_id: string;
  vehicle_description: string; service_type: string; description: string;
  diagnosis: string; status: string; priority: string; assigned_to: string;
  mechanic_name: string; estimated_completion: string; actual_completion: string;
  subtotal: number; tax_amount: number; total: number; is_paid: number;
  reception_photos: string; reception_observations: string; reception_mileage: number;
  delivery_signature: string; delivery_notes: string; warranty_days: number;
  warranty_notes: string; qc_checklist: string; qc_completed_by: string;
  qc_completed_at: string; created_at: string; updated_at: string;
  diagnostic: any; quotes: any[]; parts: any[]; timeline: any[];
  photos: any[]; checklist: any[]; vehicle: any; customer: any;
}

const statusConfig: Record<string, { label: string; variant: "info" | "warning" | "success" | "danger" | "neutral"; dot: string }> = {
  received: { label: "Recibido", variant: "info", dot: "#3B82F6" },
  diagnosed: { label: "Diagnosticado", variant: "warning", dot: "#F59E0B" },
  quoted: { label: "Cotizado", variant: "warning", dot: "#F59E0B" },
  approved: { label: "Aprobado", variant: "success", dot: "#10B981" },
  in_progress: { label: "En reparación", variant: "info", dot: "#3B82F6" },
  quality_check: { label: "Control de calidad", variant: "warning", dot: "#F59E0B" },
  ready: { label: "Listo para entregar", variant: "success", dot: "#10B981" },
  delivered: { label: "Entregado", variant: "success", dot: "#10B981" },
  cancelled: { label: "Cancelado", variant: "danger", dot: "#EF4444" },
};

const tabs = [
  { key: "info", label: "Información", icon: FileText },
  { key: "diagnosis", label: "Diagnóstico", icon: Wrench },
  { key: "quote", label: "Cotización", icon: DollarSign },
  { key: "repair", label: "Reparación", icon: Package },
  { key: "timeline", label: "Historial", icon: Clock },
  { key: "qc", label: "Control Calidad", icon: CheckCircle2 },
  { key: "delivery", label: "Entrega", icon: Send },
  { key: "warranty", label: "Garantía", icon: Shield },
];

export default function WorkOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [order, setOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const [saving, setSaving] = useState(false);

  // Diagnosis form
  const [diagForm, setDiagForm] = useState({ findings: "", recommendations: "", urgency: "normal", estimated_cost: "", estimated_days: "" });

  // Quote form
  const [quoteForm, setQuoteForm] = useState({ labor_cost: "", parts_cost: "", discount: "", tax_rate: "16", notes: "", valid_until: "" });
  const [quoteItems, setQuoteItems] = useState<{ name: string; quantity: number; unit_price: number }[]>([]);
  const [quoteItemInput, setQuoteItemInput] = useState({ name: "", quantity: 1, unit_price: 0 });

  // Repair
  const [partInput, setPartInput] = useState({ name: "", quantity: 1, unit_price: 0 });

  // QC
  const [qcBy, setQcBy] = useState("");

  // Delivery
  const [deliveryForm, setDeliveryForm] = useState({ delivery_notes: "", delivery_signature: "" });

  // Status change
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const loadOrder = useCallback(async () => {
    try {
      const data = await api.get(`/orders/${id}`);
      setOrder(data);
      if (data.diagnostic) {
        setDiagForm({
          findings: data.diagnostic.findings || "",
          recommendations: data.diagnostic.recommendations || "",
          urgency: data.diagnostic.urgency || "normal",
          estimated_cost: data.diagnostic.estimated_cost || "",
          estimated_days: data.diagnostic.estimated_days || "",
        });
      }
    } catch { showToast("error", "Error al cargar orden"); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadOrder(); }, [loadOrder]);

  const updateStatus = async (status: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      showToast("success", "Estado actualizado");
      setShowStatusChange(false);
      loadOrder();
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
  };

  const saveDiagnostic = async () => {
    setSaving(true);
    try {
      await api.put(`/orders/${id}/diagnostic`, {
        ...diagForm,
        estimated_cost: parseFloat(diagForm.estimated_cost) || 0,
        estimated_days: parseInt(diagForm.estimated_days) || 0,
      });
      showToast("success", "Diagnóstico guardado");
      loadOrder();
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  const createQuote = async () => {
    setSaving(true);
    try {
      const labor = parseFloat(quoteForm.labor_cost) || 0;
      const parts = parseFloat(quoteForm.parts_cost) || 0;
      await api.post(`/orders/${id}/quotes`, {
        items: quoteItems, labor_cost: labor, parts_cost: parts,
        discount: parseFloat(quoteForm.discount) || 0,
        tax_rate: parseFloat(quoteForm.tax_rate) || 0,
        notes: quoteForm.notes, valid_until: quoteForm.valid_until || null,
      });
      showToast("success", "Cotización creada");
      setQuoteForm({ labor_cost: "", parts_cost: "", discount: "", tax_rate: "16", notes: "", valid_until: "" });
      setQuoteItems([]);
      loadOrder();
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  const approveQuote = async (quoteId: string) => {
    try { await api.put(`/orders/quotes/${quoteId}/approve`); showToast("success", "Cotización aprobada"); loadOrder(); }
    catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
  };

  const rejectQuote = async (quoteId: string) => {
    try { await api.put(`/orders/quotes/${quoteId}/reject`, { rejection_reason: "Rechazado por el cliente" }); showToast("info", "Cotización rechazada"); loadOrder(); }
    catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
  };

  const addPart = async () => {
    if (!partInput.name.trim()) return;
    try {
      await api.post(`/orders/${id}/parts`, partInput);
      showToast("success", "Repuesto agregado");
      setPartInput({ name: "", quantity: 1, unit_price: 0 });
      loadOrder();
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
  };

  const removePart = async (partId: string) => {
    try { await api.delete(`/orders/${id}/parts/${partId}`); showToast("success", "Repuesto eliminado"); loadOrder(); }
    catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
  };

  const saveQC = async () => {
    if (!order?.checklist) return;
    try {
      await api.put(`/orders/${id}/quality-check`, { checklist: order.checklist, qc_completed_by: qcBy });
      showToast("success", "Control de calidad actualizado");
      loadOrder();
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
  };

  const toggleChecklistItem = (itemId: string) => {
    if (!order?.checklist) return;
    const updated = order.checklist.map((item: any) =>
      item.id === itemId ? { ...item, checked: item.checked ? 0 : 1, checked_by: qcBy } : item
    );
    setOrder({ ...order, checklist: updated });
  };

  const deliverOrder = async () => {
    setSaving(true);
    try {
      await api.post(`/orders/${id}/deliver`, deliveryForm);
      showToast("success", "Orden entregada exitosamente");
      loadOrder();
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-16 bg-[var(--mp-bg-elevated)] rounded-xl" />
      <div className="h-10 bg-[var(--mp-bg-elevated)] rounded-lg w-96" />
      <div className="h-64 bg-[var(--mp-bg-elevated)] rounded-xl" />
    </div>
  );

  if (!order) return <div className="text-center py-20 text-[var(--mp-text-tertiary)]">Orden no encontrada</div>;

  const st = statusConfig[order.status] || statusConfig.received;
  const receptionPhotos = JSON.parse(order.reception_photos || "[]");

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`Orden ${order.order_number}`}
        description={`${order.customer_name} — ${order.vehicle_description}`}
        backTo="/orders"
        breadcrumbs={[{ label: "Órdenes", to: "/orders" }, { label: order.order_number }]}
        icon={<Wrench size={20} />}
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: st.dot }} />
              <Badge variant={st.variant}>{st.label}</Badge>
            </div>
            <button onClick={() => setShowStatusChange(!showStatusChange)} className="mp-btn-ghost text-xs">
              Cambiar estado
            </button>
          </div>
        }
      />

      {/* Status change dropdown */}
      {showStatusChange && (
        <div className="mp-card p-4">
          <p className="text-xs font-medium text-[var(--mp-text-secondary)] mb-3">Cambiar estado a:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <button key={key} onClick={() => updateStatus(key)}
                disabled={key === order.status}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  key === order.status
                    ? "border-[var(--mp-accent)] bg-[rgba(255,107,0,0.1)] text-[var(--mp-accent)]"
                    : "border-[var(--mp-border)] hover:border-[var(--mp-accent)] hover:bg-[rgba(255,107,0,0.05)] text-[var(--mp-text-secondary)]"
                }`}>
                {cfg.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[var(--mp-border)]">
        <div className="flex gap-1 overflow-x-auto scrollbar-thin">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-all ${
                activeTab === t.key
                  ? "border-[var(--mp-accent)] text-[var(--mp-accent)] bg-[rgba(255,107,0,0.04)]"
                  : "border-transparent text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-secondary)]"
              }`}>
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Info */}
      {activeTab === "info" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="mp-card p-5">
              <h3 className="text-sm font-semibold text-[var(--mp-text-primary)] mb-4">Datos de la orden</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><span className="text-[var(--mp-text-tertiary)] text-xs">Orden</span><p className="font-bold text-[var(--mp-accent)]">{order.order_number}</p></div>
                <div><span className="text-[var(--mp-text-tertiary)] text-xs">Servicio</span><p className="font-medium text-[var(--mp-text-primary)]">{order.service_type || "General"}</p></div>
                <div><span className="text-[var(--mp-text-tertiary)] text-xs">Prioridad</span><p className="font-medium text-[var(--mp-text-primary)]">{order.priority}</p></div>
                <div><span className="text-[var(--mp-text-tertiary)] text-xs">Mecánico</span><p className="font-medium text-[var(--mp-text-primary)]">{order.mechanic_name || "Sin asignar"}</p></div>
                <div><span className="text-[var(--mp-text-tertiary)] text-xs">Total</span><p className="font-bold text-[var(--mp-text-primary)]">${(order.total || 0).toLocaleString()}</p></div>
                <div><span className="text-[var(--mp-text-tertiary)] text-xs">Creada</span><p className="text-[var(--mp-text-secondary)]">{new Date(order.created_at).toLocaleString("es-CO")}</p></div>
              </div>
              {order.description && (
                <div className="mt-4 pt-4 border-t border-[var(--mp-border-subtle)]">
                  <span className="text-xs text-[var(--mp-text-tertiary)]">Descripción</span>
                  <p className="text-sm text-[var(--mp-text-secondary)] mt-1">{order.description}</p>
                </div>
              )}
            </div>

            <div className="mp-card p-5">
              <h3 className="text-sm font-semibold text-[var(--mp-text-primary)] mb-4">Recepción</h3>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div><span className="text-[var(--mp-text-tertiary)] text-xs">Kilometraje</span><p className="font-medium text-[var(--mp-text-primary)]">{order.reception_mileage || 0} km</p></div>
                <div><span className="text-[var(--mp-text-tertiary)] text-xs">Observaciones</span><p className="text-[var(--mp-text-secondary)]">{order.reception_observations || "—"}</p></div>
              </div>
              {receptionPhotos.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {receptionPhotos.map((p: string, i: number) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden border border-[var(--mp-border)]">
                      <img src={p} alt={`Recepción ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="mp-card p-5">
              <h3 className="text-sm font-semibold text-[var(--mp-text-primary)] mb-3">Cliente</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><User size={14} className="text-[var(--mp-text-tertiary)]" /><span>{order.customer_name}</span></div>
                {order.customer_phone && <div className="flex items-center gap-2"><Phone size={14} className="text-[var(--mp-text-tertiary)]" /><span>{order.customer_phone}</span></div>}
                {order.customer_email && <div className="flex items-center gap-2"><Mail size={14} className="text-[var(--mp-text-tertiary)]" /><span>{order.customer_email}</span></div>}
              </div>
            </div>

            <div className="mp-card p-5">
              <h3 className="text-sm font-semibold text-[var(--mp-text-primary)] mb-3">Vehículo</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><Bike size={14} className="text-[var(--mp-text-tertiary)]" /><span>{order.vehicle_description || "Sin vehículo"}</span></div>
                {order.vehicle && (
                  <>
                    {order.vehicle.plate && <div className="flex items-center gap-2 text-[var(--mp-text-secondary)]">Placa: {order.vehicle.plate}</div>}
                    {order.vehicle.color && <div className="flex items-center gap-2 text-[var(--mp-text-secondary)]">Color: {order.vehicle.color}</div>}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Diagnosis */}
      {activeTab === "diagnosis" && (
        <div className="max-w-3xl space-y-4">
          <div className="mp-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[var(--mp-text-primary)]">Diagnóstico del técnico</h3>
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Hallazgos</label>
              <textarea value={diagForm.findings} onChange={(e) => setDiagForm(p => ({ ...p, findings: e.target.value }))}
                rows={4} className="mp-input resize-none" placeholder="Describe los hallazgos del diagnóstico..." />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Recomendaciones</label>
              <textarea value={diagForm.recommendations} onChange={(e) => setDiagForm(p => ({ ...p, recommendations: e.target.value }))}
                rows={3} className="mp-input resize-none" placeholder="Trabajos recomendados..." />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Urgencia</label>
                <select value={diagForm.urgency} onChange={(e) => setDiagForm(p => ({ ...p, urgency: e.target.value }))} className="mp-input">
                  <option value="low">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Costo estimado</label>
                <input type="number" value={diagForm.estimated_cost} onChange={(e) => setDiagForm(p => ({ ...p, estimated_cost: e.target.value }))}
                  className="mp-input" placeholder="$0" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Días estimados</label>
                <input type="number" value={diagForm.estimated_days} onChange={(e) => setDiagForm(p => ({ ...p, estimated_days: e.target.value }))}
                  className="mp-input" placeholder="0" />
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={saveDiagnostic} disabled={saving} className="mp-btn-primary text-xs">
                <Save size={14} /> {saving ? "Guardando..." : "Guardar diagnóstico"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Quote */}
      {activeTab === "quote" && (
        <div className="space-y-4">
          {order.quotes && order.quotes.length > 0 && (
            <div className="space-y-3">
              {order.quotes.map((q: any) => (
                <div key={q.id} className="mp-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-[var(--mp-accent)]">{q.quote_number}</p>
                      <p className="text-xs text-[var(--mp-text-tertiary)]">{new Date(q.created_at).toLocaleString("es-CO")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={q.status === "approved" ? "success" : q.status === "rejected" ? "danger" : "warning"}>
                        {q.status === "approved" ? "Aprobada" : q.status === "rejected" ? "Rechazada" : "Pendiente"}
                      </Badge>
                      {q.status === "pending" && (
                        <>
                          <button onClick={() => approveQuote(q.id)} className="mp-btn-ghost text-xs text-emerald-600 hover:bg-emerald-50">
                            <CheckCircle2 size={13} /> Aprobar
                          </button>
                          <button onClick={() => rejectQuote(q.id)} className="mp-btn-ghost text-xs text-red-600 hover:bg-red-50">
                            <XCircle size={13} /> Rechazar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><span className="text-[var(--mp-text-tertiary)] text-xs">Mano de obra</span><p className="font-medium">${q.labor_cost}</p></div>
                    <div><span className="text-[var(--mp-text-tertiary)] text-xs">Repuestos</span><p className="font-medium">${q.parts_cost}</p></div>
                    <div><span className="text-[var(--mp-text-tertiary)] text-xs">Impuestos</span><p className="font-medium">${q.tax_amount}</p></div>
                    <div><span className="text-[var(--mp-text-tertiary)] text-xs">Total</span><p className="font-bold text-lg">${q.total}</p></div>
                  </div>
                  {q.notes && <p className="text-xs text-[var(--mp-text-secondary)] mt-3 pt-3 border-t border-[var(--mp-border-subtle)]">{q.notes}</p>}
                </div>
              ))}
            </div>
          )}

          <div className="mp-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[var(--mp-text-primary)]">Crear nueva cotización</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Mano de obra</label>
                <input type="number" value={quoteForm.labor_cost} onChange={(e) => setQuoteForm(p => ({ ...p, labor_cost: e.target.value }))}
                  className="mp-input" placeholder="$0" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Repuestos</label>
                <input type="number" value={quoteForm.parts_cost} onChange={(e) => setQuoteForm(p => ({ ...p, parts_cost: e.target.value }))}
                  className="mp-input" placeholder="$0" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Descuento</label>
                <input type="number" value={quoteForm.discount} onChange={(e) => setQuoteForm(p => ({ ...p, discount: e.target.value }))}
                  className="mp-input" placeholder="$0" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">IVA %</label>
                <input type="number" value={quoteForm.tax_rate} onChange={(e) => setQuoteForm(p => ({ ...p, tax_rate: e.target.value }))}
                  className="mp-input" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Válido hasta</label>
                <input type="date" value={quoteForm.valid_until} onChange={(e) => setQuoteForm(p => ({ ...p, valid_until: e.target.value }))}
                  className="mp-input" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Notas</label>
              <textarea value={quoteForm.notes} onChange={(e) => setQuoteForm(p => ({ ...p, notes: e.target.value }))}
                rows={2} className="mp-input resize-none" placeholder="Notas para el cliente..." />
            </div>

            <div className="border-t border-[var(--mp-border-subtle)] pt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-[var(--mp-text-secondary)]">Items de la cotización</p>
                <button onClick={() => {
                  if (quoteItemInput.name.trim()) {
                    setQuoteItems([...quoteItems, quoteItemInput]);
                    setQuoteItemInput({ name: "", quantity: 1, unit_price: 0 });
                  }
                }} className="mp-btn-ghost text-xs"><Plus size={13} /> Agregar item</button>
              </div>
              <div className="flex gap-2 mb-3">
                <input value={quoteItemInput.name} onChange={(e) => setQuoteItemInput(p => ({ ...p, name: e.target.value }))}
                  placeholder="Nombre del item" className="mp-input flex-1 text-xs" />
                <input type="number" value={quoteItemInput.quantity} onChange={(e) => setQuoteItemInput(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))}
                  className="mp-input w-20 text-xs" min={1} />
                <input type="number" value={quoteItemInput.unit_price} onChange={(e) => setQuoteItemInput(p => ({ ...p, unit_price: parseFloat(e.target.value) || 0 }))}
                  className="mp-input w-28 text-xs" placeholder="$0" />
              </div>
              {quoteItems.length > 0 && (
                <div className="space-y-1">
                  {quoteItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs px-3 py-2 rounded bg-[var(--mp-bg-elevated)]">
                      <span>{item.name} x{item.quantity}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">${(item.quantity * item.unit_price).toLocaleString()}</span>
                        <button onClick={() => setQuoteItems(quoteItems.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button onClick={createQuote} disabled={saving} className="mp-btn-primary text-xs">
                <Send size={14} /> {saving ? "Creando..." : "Crear cotización"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Repair */}
      {activeTab === "repair" && (
        <div className="space-y-4">
          <div className="mp-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--mp-text-primary)]">Repuestos utilizados</h3>
              <span className="text-xs text-[var(--mp-text-tertiary)]">{order.parts?.length || 0} items</span>
            </div>
            {order.parts && order.parts.length > 0 ? (
              <div className="space-y-2 mb-4">
                {order.parts.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--mp-bg-elevated)] border border-[var(--mp-border-subtle)]">
                    <div className="flex items-center gap-3">
                      <Package size={14} className="text-[var(--mp-accent)]" />
                      <div>
                        <p className="text-sm font-medium text-[var(--mp-text-primary)]">{p.name}</p>
                        <p className="text-xs text-[var(--mp-text-tertiary)]">x{p.quantity} @ ${p.unit_price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">${p.total.toLocaleString()}</span>
                      <button onClick={() => removePart(p.id)} className="text-[var(--mp-text-tertiary)] hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--mp-text-tertiary)] text-center py-4">No hay repuestos registrados</p>
            )}

            <div className="border-t border-[var(--mp-border-subtle)] pt-4">
              <p className="text-xs font-medium text-[var(--mp-text-secondary)] mb-2">Agregar repuesto</p>
              <div className="flex gap-2">
                <input value={partInput.name} onChange={(e) => setPartInput(p => ({ ...p, name: e.target.value }))}
                  placeholder="Nombre del repuesto" className="mp-input flex-1 text-xs" />
                <input type="number" value={partInput.quantity} onChange={(e) => setPartInput(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))}
                  className="mp-input w-20 text-xs" min={1} placeholder="Cant." />
                <input type="number" value={partInput.unit_price} onChange={(e) => setPartInput(p => ({ ...p, unit_price: parseFloat(e.target.value) || 0 }))}
                  className="mp-input w-28 text-xs" placeholder="Precio" />
                <button onClick={addPart} className="mp-btn-primary text-xs"><Plus size={14} /></button>
              </div>
            </div>
          </div>

          <div className="mp-card p-5">
            <h3 className="text-sm font-semibold text-[var(--mp-text-primary)] mb-3">Resumen de costos</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[var(--mp-text-tertiary)]">Repuestos</span><span className="font-medium">${(order.parts || []).reduce((s: number, p: any) => s + (p.total || 0), 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-[var(--mp-text-tertiary)]">Subtotal</span><span className="font-medium">${(order.subtotal || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-[var(--mp-text-tertiary)]">Impuestos</span><span className="font-medium">${(order.tax_amount || 0).toLocaleString()}</span></div>
              <div className="flex justify-between pt-2 border-t border-[var(--mp-border-subtle)]"><span className="font-semibold">Total</span><span className="text-lg font-bold">${(order.total || 0).toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Timeline */}
      {activeTab === "timeline" && (
        <div className="max-w-3xl">
          <div className="mp-card p-5">
            <h3 className="text-sm font-semibold text-[var(--mp-text-primary)] mb-4">Historial de estados</h3>
            {order.timeline && order.timeline.length > 0 ? (
              <div className="space-y-4">
                {order.timeline.map((evt: any, i: number) => {
                  const cfg = statusConfig[evt.status] || { label: evt.status, dot: "#999" };
                  return (
                    <div key={evt.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full mt-1" style={{ background: cfg.dot }} />
                        {i < order.timeline.length - 1 && <div className="w-0.5 flex-1 bg-[var(--mp-border)] mt-1" />}
                      </div>
                      <div className="pb-4 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                          <span className="text-xs text-[var(--mp-text-tertiary)]">{new Date(evt.created_at).toLocaleString("es-CO")}</span>
                        </div>
                        <p className="text-sm text-[var(--mp-text-secondary)] mt-1">{evt.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[var(--mp-text-tertiary)] text-center py-8">Sin eventos en el historial</p>
            )}
          </div>
        </div>
      )}

      {/* Tab: QC */}
      {activeTab === "qc" && (
        <div className="max-w-3xl space-y-4">
          <div className="mp-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--mp-text-primary)]">Checklist de control de calidad</h3>
              {order.qc_completed_at && (
                <span className="text-xs text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Completado por {order.qc_completed_by}
                </span>
              )}
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Verificado por</label>
              <input value={qcBy} onChange={(e) => setQcBy(e.target.value)} className="mp-input" placeholder="Nombre del inspector" />
            </div>

            {order.checklist && order.checklist.length > 0 ? (
              <div className="space-y-2">
                {order.checklist.map((item: any) => (
                  <label key={item.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all cursor-pointer ${
                    item.checked ? "border-emerald-300 bg-emerald-50/50" : "border-[var(--mp-border)] hover:border-[var(--mp-accent)]"
                  }`}>
                    <input type="checkbox" checked={!!item.checked} onChange={() => toggleChecklistItem(item.id)}
                      className="w-4 h-4 rounded border-[var(--mp-border)] text-[#FF6B00] focus:ring-[#FF6B00]" />
                    <span className={`text-sm ${item.checked ? "text-emerald-700 line-through" : "text-[var(--mp-text-primary)]"}`}>{item.item}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--mp-text-tertiary)] text-center py-8">No hay items en el checklist</p>
            )}

            <div className="flex justify-end mt-4">
              <button onClick={saveQC} className="mp-btn-primary text-xs">
                <Save size={14} /> Guardar checklist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Delivery */}
      {activeTab === "delivery" && (
        <div className="max-w-3xl space-y-4">
          {order.status === "delivered" ? (
            <div className="mp-card p-8 text-center">
              <CheckCircle2 size={48} className="mx-auto mb-3 text-emerald-500" />
              <h3 className="text-lg font-bold text-[var(--mp-text-primary)]">Orden entregada</h3>
              <p className="text-sm text-[var(--mp-text-secondary)] mt-1">
                Entregada el {order.actual_completion ? new Date(order.actual_completion).toLocaleString("es-CO") : "—"}
              </p>
              {order.delivery_notes && (
                <div className="mt-4 p-3 rounded-lg bg-[var(--mp-bg-elevated)] text-sm text-left">
                  <p className="text-xs text-[var(--mp-text-tertiary)] mb-1">Notas de entrega</p>
                  <p className="text-[var(--mp-text-secondary)]">{order.delivery_notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="mp-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--mp-text-primary)]">Entregar orden</h3>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Notas de entrega</label>
                <textarea value={deliveryForm.delivery_notes} onChange={(e) => setDeliveryForm(p => ({ ...p, delivery_notes: e.target.value }))}
                  rows={3} className="mp-input resize-none" placeholder="Instrucciones finales, recomendaciones al cliente..." />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Firma del cliente (base64 o URL)</label>
                <input value={deliveryForm.delivery_signature} onChange={(e) => setDeliveryForm(p => ({ ...p, delivery_signature: e.target.value }))}
                  className="mp-input" placeholder="URL o base64 de la firma" />
              </div>
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800">Al entregar se creará automáticamente una garantía de {order.warranty_days || 15} días.</p>
              </div>
              <div className="flex justify-end">
                <button onClick={deliverOrder} disabled={saving} className="mp-btn-primary text-xs bg-emerald-600 hover:bg-emerald-700">
                  <Send size={14} /> {saving ? "Entregando..." : "Entregar moto"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Warranty */}
      {activeTab === "warranty" && (
        <div className="max-w-3xl">
          <div className="mp-card p-5">
            <h3 className="text-sm font-semibold text-[var(--mp-text-primary)] mb-4">Información de garantía</h3>
            {order.status === "delivered" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-[var(--mp-text-tertiary)] text-xs">Días de garantía</span><p className="font-medium">{order.warranty_days || 15} días</p></div>
                  <div><span className="text-[var(--mp-text-tertiary)] text-xs">Estado</span><p className="font-medium text-emerald-600">Activa</p></div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--mp-bg-elevated)]">
                  <p className="text-xs text-[var(--mp-text-tertiary)] mb-1">Notas</p>
                  <p className="text-sm text-[var(--mp-text-secondary)]">{order.warranty_notes || `Garantía de ${order.warranty_days || 15} días por servicio ${order.order_number}`}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield size={32} className="mx-auto mb-2 text-[var(--mp-text-tertiary)]" />
                <p className="text-sm text-[var(--mp-text-secondary)]">La garantía se activa al entregar la moto</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
