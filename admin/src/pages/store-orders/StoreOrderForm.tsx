import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { X, User, Phone, Mail, Search, Plus, Info, ClipboardList, ShoppingCart, Truck, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/Toast";

interface Props {
  open: boolean;
  onClose: () => void;
  id?: string;
}

const steps = [
  { key: "info", label: "Información", desc: "Datos del pedido", icon: ClipboardList },
  { key: "productos", label: "Productos", desc: "Agregar artículos", icon: ShoppingCart },
  { key: "envio", label: "Envío y pago", desc: "Método y dirección", icon: Truck },
  { key: "revision", label: "Revisión", desc: "Confirmar pedido", icon: CheckCircle2 },
];

const priorities = [
  { value: "baja", label: "Baja", color: "#10B981" },
  { value: "media", label: "Media", color: "#F59E0B" },
  { value: "alta", label: "Alta", color: "#EF4444" },
];

export default function StoreOrderForm({ open, onClose, id }: Props) {
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    client: "", email: "", phone: "",
    orderDate: new Date().toISOString().slice(0, 10),
    priority: "media", observations: "", origin: "Tienda Online",
    internalNotes: "",
  });

  useEffect(() => {
    if (id && open) {
      setLoading(true);
      api.get(`/checkout/${id}`).then((o: any) => {
        setForm({
          client: o.customer_name || "",
          email: o.customer_email || "",
          phone: o.customer_phone || "",
          orderDate: o.created_at ? o.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
          priority: o.priority || "media",
          observations: o.notes || "",
          origin: o.origin || "Tienda Online",
          internalNotes: o.internal_notes || "",
        });
      }).finally(() => setLoading(false));
    }
  }, [id, open]);

  if (!open) return null;

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-[var(--mp-bg-surface)] rounded-2xl shadow-2xl w-full max-w-5xl mx-4 p-6">
        <div className="skeleton h-96 rounded-lg" />
      </div>
    </div>
  );

  const update = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  const goNext = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const goPrev = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const data = {
        customer_name: form.client,
        customer_email: form.email,
        customer_phone: form.phone,
        date: form.orderDate,
        priority: form.priority,
        notes: form.observations,
        origin: form.origin,
        internal_notes: form.internalNotes,
      };
      if (id) await api.put(`/direct-sales/${id}`, data);
      else await api.post("/checkout", data);
      showToast("success", id ? "Pedido actualizado correctamente" : "Pedido creado correctamente");
      onClose();
      setStep(0);
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Error al guardar el pedido");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--mp-bg-surface)] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto mx-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--mp-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(255,107,0,0.1)]">
              <ShoppingCart size={20} className="text-[#FF6B00]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--mp-text-primary)]">Nuevo Pedido</h2>
              <p className="text-xs text-[var(--mp-text-tertiary)]">Completa la información para crear un nuevo pedido de tienda.</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)] transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-6 py-4 border-b border-[var(--mp-border-subtle)]">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((s, i) => {
              const done = i < step;
              const active = i === step;
              const Icon = s.icon;
              return (
                <div key={s.key} className="flex items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      done ? "bg-[#FF6B00] text-white" : active ? "bg-[rgba(255,107,0,0.15)] text-[#FF6B00] border-2 border-[#FF6B00]" : "bg-[var(--mp-bg-elevated)] text-[var(--mp-text-tertiary)]"
                    }`}>
                      {done ? <CheckCircle2 size={16} /> : i + 1}
                    </div>
                    <div className="text-center">
                      <p className={`text-[11px] font-semibold ${active ? "text-[#FF6B00]" : done ? "text-[var(--mp-text-primary)]" : "text-[var(--mp-text-tertiary)]"}`}>{s.label}</p>
                      <p className="text-[10px] text-[var(--mp-text-tertiary)] hidden sm:block">{s.desc}</p>
                    </div>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-12 sm:w-20 h-0.5 mx-2 mb-5 rounded-full ${done ? "bg-[#FF6B00]" : "bg-[var(--mp-border)]"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                {/* Cliente */}
                <div className="mp-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(255,107,0,0.1)]">
                      <User size={16} className="text-[#FF6B00]" />
                    </div>
                    <h3 className="text-sm font-semibold text-[var(--mp-text-primary)]">Información del cliente</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Cliente *</label>
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
                        <input value={form.client} onChange={(e) => update("client", e.target.value)}
                          placeholder="Buscar cliente por nombre, email o teléfono..."
                          className="mp-input pl-9 pr-10" />
                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-[var(--mp-accent)] hover:bg-[var(--mp-bg-hover)] transition-all">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Email</label>
                        <div className="relative">
                          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
                          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                            placeholder="ejemplo@correo.com"
                            className="mp-input pl-9" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Teléfono</label>
                        <div className="relative">
                          <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
                          <input value={form.phone} onChange={(e) => update("phone", e.target.value)}
                            placeholder="+57 300 123 4567"
                            className="mp-input pl-9" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalles del pedido */}
                <div className="mp-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(139,92,246,0.1)]">
                      <ClipboardList size={16} className="text-[#8B5CF6]" />
                    </div>
                    <h3 className="text-sm font-semibold text-[var(--mp-text-primary)]">Detalles del pedido</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Fecha del pedido *</label>
                      <input type="date" value={form.orderDate} onChange={(e) => update("orderDate", e.target.value)}
                        className="mp-input" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Prioridad</label>
                      <div className="flex gap-2">
                        {priorities.map(p => (
                          <button key={p.value} type="button" onClick={() => update("priority", p.value)}
                            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border ${
                              form.priority === p.value
                                ? "border-current shadow-sm" : "border-[var(--mp-border)] hover:border-[var(--mp-text-tertiary)]"
                            }`}
                            style={{ color: form.priority === p.value ? p.color : "var(--mp-text-secondary)", background: form.priority === p.value ? `${p.color}10` : "transparent" }}>
                            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: p.color }} />
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Observaciones</label>
                    <textarea value={form.observations} onChange={(e) => update("observations", e.target.value)}
                      rows={3} maxLength={200} placeholder="Notas adicionales sobre el pedido..."
                      className="mp-input resize-none" />
                    <div className="flex justify-end mt-1"><span className="text-[10px] text-[var(--mp-text-tertiary)]">{form.observations.length}/200</span></div>
                  </div>
                </div>

                {/* Origen */}
                <div className="mp-card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(255,107,0,0.1)]">
                      <Info size={16} className="text-[#FF6B00]" />
                    </div>
                    <h3 className="text-sm font-semibold text-[var(--mp-text-primary)]">Origen</h3>
                  </div>
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Canal de origen</label>
                  <select value={form.origin} onChange={(e) => update("origin", e.target.value)} className="mp-input">
                    <option>Tienda Online</option>
                    <option>WhatsApp</option>
                    <option>Teléfono</option>
                    <option>Presencial</option>
                  </select>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                <div className="mp-card p-5">
                  <h3 className="text-sm font-semibold text-[var(--mp-text-primary)] mb-4 flex items-center gap-2">
                    <ShoppingCart size={16} className="text-[#FF6B00]" /> Resumen del pedido
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-sm text-[var(--mp-text-secondary)]">Subtotal productos</span><span className="text-sm font-semibold">$0</span></div>
                    <div className="flex justify-between"><span className="text-sm text-[var(--mp-text-secondary)]">Envío</span><span className="text-sm font-semibold">$0</span></div>
                    <div className="flex justify-between"><span className="text-sm text-[var(--mp-text-secondary)]">Descuento</span><span className="text-sm font-semibold text-[var(--mp-accent)]">-$0</span></div>
                    <div className="pt-3 border-t border-[var(--mp-border-subtle)]">
                      <div className="flex justify-between"><span className="text-sm font-bold">Total estimado</span><span className="text-lg font-bold">$0</span></div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 mt-3 px-3 py-2 rounded-lg bg-[rgba(255,107,0,0.06)] border border-[rgba(255,107,0,0.15)]">
                    <Info size={14} className="text-[#FF6B00] mt-0.5 shrink-0" />
                    <p className="text-[11px] text-[var(--mp-text-secondary)]">El total se calculará automáticamente al agregar productos y configurar el envío.</p>
                  </div>
                </div>

                <div className="mp-card p-5">
                  <h3 className="text-sm font-semibold text-[var(--mp-text-primary)] mb-3 flex items-center gap-2">
                    <ClipboardList size={16} className="text-[#F59E0B]" /> Notas internas
                  </h3>
                  <textarea value={form.internalNotes} onChange={(e) => update("internalNotes", e.target.value)}
                    rows={3} maxLength={200} placeholder="Notas internas solo visibles para el equipo..."
                    className="mp-input resize-none" />
                  <div className="flex justify-end mt-1"><span className="text-[10px] text-[var(--mp-text-tertiary)]">{form.internalNotes.length}/200</span></div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="text-center py-16">
              <ShoppingCart size={48} className="mx-auto mb-4 text-[var(--mp-text-tertiary)]" />
              <h3 className="text-base font-semibold text-[var(--mp-text-primary)] mb-1">Agregar productos</h3>
              <p className="text-sm text-[var(--mp-text-tertiary)]">Busca y selecciona los productos para este pedido.</p>
            </div>
          )}

          {step === 2 && (
            <div className="text-center py-16">
              <Truck size={48} className="mx-auto mb-4 text-[var(--mp-text-tertiary)]" />
              <h3 className="text-base font-semibold text-[var(--mp-text-primary)] mb-1">Envío y pago</h3>
              <p className="text-sm text-[var(--mp-text-tertiary)]">Configura el método de envío y forma de pago.</p>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-16">
              <CheckCircle2 size={48} className="mx-auto mb-4 text-[var(--mp-text-tertiary)]" />
              <h3 className="text-base font-semibold text-[var(--mp-text-primary)] mb-1">Revisar y confirmar</h3>
              <p className="text-sm text-[var(--mp-text-tertiary)]">Verifica los datos antes de crear el pedido.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--mp-border)]">
          <button type="button" onClick={step === 0 ? onClose : goPrev}
            className="mp-btn-ghost text-xs">
            {step === 0 ? "Cancelar" : "Anterior"}
          </button>
          <div className="flex items-center gap-3">
            {step < steps.length - 1 ? (
              <button type="button" onClick={goNext} className="mp-btn-primary text-xs">
                Siguiente: {steps[step + 1]?.label} →
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={saving} className="mp-btn-primary text-xs">
                {saving ? "Guardando..." : "Crear Pedido"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}