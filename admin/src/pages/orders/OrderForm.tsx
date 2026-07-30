import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import PageHeader from "@/components/PageHeader";
import { User, Bike, Phone, Wrench, Search, Plus, Info, AlertTriangle } from "lucide-react";

const priorities = [
  { value: "low", label: "Baja", color: "#10B981" },
  { value: "normal", label: "Normal", color: "#3B82F6" },
  { value: "high", label: "Alta", color: "#F59E0B" },
  { value: "urgent", label: "Urgente", color: "#EF4444" },
];

const serviceTypes = [
  "Mantenimiento preventivo", "Reparación general", "Cambio de aceite",
  "Servicio de frenos", "Reparación de motor", "Electrónica",
  "Suspensión", "Transmisión", "Carrocería y pintura", "Diagnóstico", "Otro"
];

export default function OrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    customer_name: "", customer_phone: "", customer_email: "",
    vehicle_description: "", service_type: "", description: "",
    priority: "normal", assigned_to: "", estimated_completion: "",
  });

  const [mechanics, setMechanics] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    api.get("/mechanics").then(r => setMechanics(Array.isArray(r) ? r : r?.data || [])).catch(() => {});
    if (isEdit) {
      api.get(`/orders/${id}`).then((o) => {
        setForm({
          customer_name: o.customer_name || "",
          customer_phone: o.customer_phone || "",
          customer_email: o.customer_email || "",
          vehicle_description: o.vehicle_description || "",
          service_type: o.service_type || "",
          description: o.description || "",
          priority: o.priority || "normal",
          assigned_to: o.assigned_to || "",
          estimated_completion: o.estimated_completion || "",
        });
      });
    }
  }, [id, isEdit]);

  const update = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name.trim()) { showToast("error", "Nombre del cliente requerido"); return; }
    setSaving(true);
    try {
      const data = { ...form };
      if (isEdit) await api.put(`/orders/${id}`, data);
      else await api.post("/orders", data);
      showToast("success", "Orden guardada correctamente");
      navigate("/orders");
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={isEdit ? "Editar Orden de Taller" : "Nueva Orden de Taller"}
        description={isEdit ? "Modifica los datos de la orden de servicio" : "Completa la información para crear una nueva orden de servicio"}
        backTo="/orders"
        breadcrumbs={[{ label: "Órdenes", to: "/orders" }, { label: isEdit ? "Editar Orden" : "Nueva Orden" }]}
        icon={<Wrench size={20} />}
        action={
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate("/orders")} className="mp-btn-ghost text-xs">Cancelar</button>
            <button type="submit" form="order-form" disabled={saving} className="mp-btn-primary text-xs">
              {saving ? "Guardando..." : isEdit ? "Actualizar" : "Crear orden"}
            </button>
          </div>
        }
      />

      <form id="order-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="mp-card p-5">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[var(--mp-border-subtle)]">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[rgba(255,107,0,0.1)]">
                  <User size={18} className="text-[#FF6B00]" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--mp-text-primary)]">Información del cliente</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Nombre del cliente *</label>
                  <input value={form.customer_name} onChange={(e) => update("customer_name", e.target.value)}
                    placeholder="Nombre completo" required className="mp-input" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Teléfono</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
                    <input value={form.customer_phone} onChange={(e) => update("customer_phone", e.target.value)}
                      placeholder="+57 300 123 4567" className="mp-input pl-9" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Email</label>
                  <input type="email" value={form.customer_email} onChange={(e) => update("customer_email", e.target.value)}
                    placeholder="correo@ejemplo.com" className="mp-input" />
                </div>
              </div>
            </div>

            <div className="mp-card p-5">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[var(--mp-border-subtle)]">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[rgba(255,107,0,0.1)]">
                  <Bike size={18} className="text-[#FF6B00]" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--mp-text-primary)]">Vehículo y servicio</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Descripción del vehículo</label>
                  <input value={form.vehicle_description} onChange={(e) => update("vehicle_description", e.target.value)}
                    placeholder="Marca Modelo Año - Placa" className="mp-input" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Tipo de servicio *</label>
                  <select value={form.service_type} onChange={(e) => update("service_type", e.target.value)}
                    className="mp-input" required>
                    <option value="">Seleccionar...</option>
                    {serviceTypes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Prioridad</label>
                  <select value={form.priority} onChange={(e) => update("priority", e.target.value)} className="mp-input">
                    {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Descripción del problema</label>
                  <textarea value={form.description} onChange={(e) => update("description", e.target.value)}
                    rows={4} className="mp-input resize-none"
                    placeholder="Describe el problema reportado por el cliente..." />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="mp-card p-5">
              <h3 className="text-sm font-semibold text-[var(--mp-text-primary)] mb-4">Información adicional</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Mecánico asignado</label>
                  <select value={form.assigned_to} onChange={(e) => update("assigned_to", e.target.value)} className="mp-input text-xs">
                    <option value="">Sin asignar</option>
                    {mechanics.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Fecha estimada de entrega</label>
                  <input type="datetime-local" value={form.estimated_completion}
                    onChange={(e) => update("estimated_completion", e.target.value)} className="mp-input" />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-[rgba(255,107,0,0.06)] border border-[rgba(255,107,0,0.15)]">
              <Info size={16} className="text-[#FF6B00] mt-0.5 shrink-0" />
              <p className="text-xs text-[var(--mp-text-secondary)]">Una vez creada, podrás gestionar el diagnóstico, cotización, repuestos y entrega desde el detalle de la orden.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
