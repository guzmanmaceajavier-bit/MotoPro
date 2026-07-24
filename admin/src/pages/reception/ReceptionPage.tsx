import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import PageHeader from "@/components/PageHeader";
import {
  User, Bike, Phone, Wrench, Search, Plus, Camera, FileText,
  AlertTriangle, CheckCircle2, ArrowRight, ArrowLeft, Info, X, Upload
} from "lucide-react";

interface Customer {
  id: string; name: string; email: string; phone: string; nit: string;
  default_vehicle_id: string;
}

interface Vehicle {
  id: string; customer_id: string; brand: string; model: string;
  year: string; plate: string; vin: string; color: string; mileage: number;
}

const serviceTypes = [
  "Mantenimiento preventivo", "Reparación general", "Cambio de aceite",
  "Servicio de frenos", "Reparación de motor", "Electrónica",
  "Suspensión", "Transmisión", "Carrocería y pintura", "Diagnóstico", "Otro"
];

const priorities = [
  { value: "low", label: "Baja", color: "#10B981" },
  { value: "normal", label: "Normal", color: "#3B82F6" },
  { value: "high", label: "Alta", color: "#F59E0B" },
  { value: "urgent", label: "Urgente", color: "#EF4444" },
];

const steps = [
  { key: "customer", label: "Cliente", icon: User },
  { key: "vehicle", label: "Vehículo", icon: Bike },
  { key: "intake", label: "Recepción", icon: Wrench },
];

export default function ReceptionPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Customer search
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "", nit: "" });

  // Vehicle search
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [vehicleResults, setVehicleResults] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ brand: "", model: "", year: "", plate: "", vin: "", color: "" });

  // Intake
  const [form, setForm] = useState({
    service_type: "", description: "", priority: "normal",
    reception_observations: "", reception_mileage: "",
  });
  const [photos, setPhotos] = useState<string[]>([]);

  // Search customers
  const searchCustomers = useCallback(async () => {
    if (customerSearch.length < 2) { setCustomerResults([]); return; }
    try {
      const results = await api.get(`/customers?search=${encodeURIComponent(customerSearch)}`);
      setCustomerResults(Array.isArray(results) ? results : results?.data || []);
    } catch { setCustomerResults([]); }
  }, [customerSearch]);

  useEffect(() => {
    const t = setTimeout(searchCustomers, 300);
    return () => clearTimeout(t);
  }, [searchCustomers]);

  // Search vehicles
  const searchVehicles = useCallback(async () => {
    if (vehicleSearch.length < 2) { setVehicleResults([]); return; }
    try {
      const results = await api.get(`/vehicles?search=${encodeURIComponent(vehicleSearch)}`);
      setVehicleResults(Array.isArray(results) ? results : results?.data || []);
    } catch { setVehicleResults([]); }
  }, [vehicleSearch]);

  useEffect(() => {
    const t = setTimeout(searchVehicles, 300);
    return () => clearTimeout(t);
  }, [searchVehicles]);

  // Create new customer inline
  const handleCreateCustomer = async () => {
    if (!newCustomer.name.trim()) { showToast("error", "Nombre requerido"); return; }
    const email = newCustomer.email.trim() || `${newCustomer.phone.replace(/\D/g, "") || "sin"}@motopro.local`;
    try {
      const res = await api.post("/customers", { ...newCustomer, email });
      const created = res || { id: "temp", ...newCustomer, email };
      setSelectedCustomer(created);
      setShowCustomerForm(false);
      showToast("success", "Cliente creado");
      setStep(1);
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Error al crear cliente");
    }
  };

  // Create new vehicle inline
  const handleCreateVehicle = async () => {
    if (!newVehicle.brand.trim() || !newVehicle.plate.trim()) {
      showToast("error", "Marca y placa requeridas"); return;
    }
    try {
      const res = await api.post("/vehicles", {
        ...newVehicle,
        customer_id: selectedCustomer?.id
      });
      const created = res || { id: "temp", ...newVehicle };
      setSelectedVehicle(created);
      setShowVehicleForm(false);
      showToast("success", "Vehículo registrado");
      setStep(2);
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Error al crear vehículo");
    }
  };

  // Create work order
  const handleCreateOrder = async () => {
    if (!form.service_type) { showToast("error", "Selecciona un tipo de servicio"); return; }
    setSaving(true);
    try {
      const vehicleDesc = selectedVehicle
        ? `${selectedVehicle.brand} ${selectedVehicle.model} ${selectedVehicle.year} - ${selectedVehicle.plate}`
        : "";
      const res = await api.post("/orders", {
        customer_id: selectedCustomer?.id,
        customer_name: selectedCustomer?.name || "",
        customer_phone: selectedCustomer?.phone || "",
        customer_email: selectedCustomer?.email || "",
        vehicle_id: selectedVehicle?.id,
        vehicle_description: vehicleDesc,
        service_type: form.service_type,
        description: form.description,
        priority: form.priority,
        reception_photos: photos,
        reception_observations: form.reception_observations,
        reception_mileage: parseInt(form.reception_mileage) || 0,
      });
      showToast("success", `Orden ${res?.order_number || ""} creada exitosamente`);
      navigate("/orders");
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Error al crear orden");
    } finally { setSaving(false); }
  };

  const canNext = () => {
    if (step === 0) return !!selectedCustomer;
    if (step === 1) return !!selectedVehicle;
    return !!form.service_type;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Recepción de Vehículo"
        description="Registrar ingreso de moto al taller — paso a paso"
        backTo="/orders"
        breadcrumbs={[{ label: "Órdenes", to: "/orders" }, { label: "Recepción" }]}
        icon={<Wrench size={20} />}
      />

      {/* Steps indicator */}
      <div className="mp-card p-4">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? "bg-[#14B8A6] text-white" :
                i === step ? "bg-[rgba(20,184,166,0.15)] text-[#14B8A6] ring-2 ring-[#14B8A6]" :
                "bg-[var(--mp-bg-elevated)] text-[var(--mp-text-tertiary)]"
              }`}>
                {i < step ? <CheckCircle2 size={14} /> : <s.icon size={14} />}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-[var(--mp-text-primary)]" : "text-[var(--mp-text-tertiary)]"}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 rounded ${i < step ? "bg-[#14B8A6]" : "bg-[var(--mp-border)]"}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 0: Customer */}
      {step === 0 && (
        <div className="space-y-4">
          <div className="mp-card p-5">
            <h3 className="text-sm font-semibold text-[var(--mp-text-primary)] mb-4">Buscar cliente existente</h3>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
              <input value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Buscar por nombre, teléfono, email..." className="mp-input pl-9 pr-4" />
            </div>
            {customerResults.length > 0 && (
              <div className="mt-3 border border-[var(--mp-border)] rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                {customerResults.map(c => (
                  <button key={c.id} onClick={() => { setSelectedCustomer(c); setStep(1); }}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--mp-bg-hover)] transition-colors border-b border-[var(--mp-border-subtle)] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[var(--mp-text-primary)]">{c.name}</p>
                      <p className="text-xs text-[var(--mp-text-tertiary)]">{c.phone || c.email}</p>
                    </div>
                    <ArrowRight size={14} className="text-[var(--mp-text-tertiary)]" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[var(--mp-border)]" />
            <span className="text-xs text-[var(--mp-text-tertiary)]">o</span>
            <div className="flex-1 h-px bg-[var(--mp-border)]" />
          </div>

          {!showCustomerForm ? (
            <button onClick={() => setShowCustomerForm(true)} className="mp-btn-secondary w-full">
              <Plus size={14} /> Registrar nuevo cliente
            </button>
          ) : (
            <div className="mp-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--mp-text-primary)]">Nuevo cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Nombre *</label>
                  <input value={newCustomer.name} onChange={(e) => setNewCustomer(p => ({ ...p, name: e.target.value }))}
                    className="mp-input" placeholder="Nombre completo" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Teléfono</label>
                  <input value={newCustomer.phone} onChange={(e) => setNewCustomer(p => ({ ...p, phone: e.target.value }))}
                    className="mp-input" placeholder="+57 300 123 4567" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Email</label>
                  <input type="email" value={newCustomer.email} onChange={(e) => setNewCustomer(p => ({ ...p, email: e.target.value }))}
                    className="mp-input" placeholder="correo@ejemplo.com" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">NIT / Cédula</label>
                  <input value={newCustomer.nit} onChange={(e) => setNewCustomer(p => ({ ...p, nit: e.target.value }))}
                    className="mp-input" placeholder="123456789" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowCustomerForm(false)} className="mp-btn-ghost text-xs">Cancelar</button>
                <button onClick={handleCreateCustomer} className="mp-btn-primary text-xs">
                  <CheckCircle2 size={14} /> Crear y continuar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 1: Vehicle */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="mp-card p-4 bg-[rgba(20,184,166,0.04)] border border-[rgba(20,184,166,0.15)]">
            <div className="flex items-center gap-2">
              <User size={14} className="text-[#14B8A6]" />
              <span className="text-sm text-[var(--mp-text-primary)]">Cliente: <b>{selectedCustomer?.name}</b></span>
              <button onClick={() => { setSelectedCustomer(null); setStep(0); }} className="ml-auto text-xs text-[var(--mp-accent)] hover:underline">Cambiar</button>
            </div>
          </div>

          <div className="mp-card p-5">
            <h3 className="text-sm font-semibold text-[var(--mp-text-primary)] mb-4">Buscar vehículo existente</h3>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
              <input value={vehicleSearch} onChange={(e) => setVehicleSearch(e.target.value)}
                placeholder="Buscar por marca, modelo, placa, VIN..." className="mp-input pl-9 pr-4" />
            </div>
            {vehicleResults.length > 0 && (
              <div className="mt-3 border border-[var(--mp-border)] rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                {vehicleResults.map(v => (
                  <button key={v.id} onClick={() => { setSelectedVehicle(v); setStep(2); }}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--mp-bg-hover)] transition-colors border-b border-[var(--mp-border-subtle)] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[var(--mp-text-primary)]">{v.brand} {v.model} {v.year}</p>
                      <p className="text-xs text-[var(--mp-text-tertiary)]">Placa: {v.plate} | Color: {v.color || "N/A"}</p>
                    </div>
                    <ArrowRight size={14} className="text-[var(--mp-text-tertiary)]" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[var(--mp-border)]" />
            <span className="text-xs text-[var(--mp-text-tertiary)]">o</span>
            <div className="flex-1 h-px bg-[var(--mp-border)]" />
          </div>

          {!showVehicleForm ? (
            <button onClick={() => setShowVehicleForm(true)} className="mp-btn-secondary w-full">
              <Plus size={14} /> Registrar nuevo vehículo
            </button>
          ) : (
            <div className="mp-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--mp-text-primary)]">Nuevo vehículo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Marca *</label>
                  <input value={newVehicle.brand} onChange={(e) => setNewVehicle(p => ({ ...p, brand: e.target.value }))}
                    className="mp-input" placeholder="Honda, Yamaha..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Modelo *</label>
                  <input value={newVehicle.model} onChange={(e) => setNewVehicle(p => ({ ...p, model: e.target.value }))}
                    className="mp-input" placeholder="CBR 600, MT-09..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Año</label>
                  <input value={newVehicle.year} onChange={(e) => setNewVehicle(p => ({ ...p, year: e.target.value }))}
                    className="mp-input" placeholder="2024" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Placa *</label>
                  <input value={newVehicle.plate} onChange={(e) => setNewVehicle(p => ({ ...p, plate: e.target.value.toUpperCase() }))}
                    className="mp-input" placeholder="ABC 123" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">VIN</label>
                  <input value={newVehicle.vin} onChange={(e) => setNewVehicle(p => ({ ...p, vin: e.target.value }))}
                    className="mp-input" placeholder="Número de chassis" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Color</label>
                  <input value={newVehicle.color} onChange={(e) => setNewVehicle(p => ({ ...p, color: e.target.value }))}
                    className="mp-input" placeholder="Rojo, Negro..." />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowVehicleForm(false)} className="mp-btn-ghost text-xs">Cancelar</button>
                <button onClick={handleCreateVehicle} className="mp-btn-primary text-xs">
                  <CheckCircle2 size={14} /> Registrar y continuar
                </button>
              </div>
            </div>
          )}

          <button onClick={() => setStep(0)} className="mp-btn-ghost text-xs">
            <ArrowLeft size={14} /> Volver
          </button>
        </div>
      )}

      {/* Step 2: Intake */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="mp-card p-4 bg-[rgba(20,184,166,0.04)] border border-[rgba(20,184,166,0.15)] space-y-2">
            <div className="flex items-center gap-2">
              <User size={14} className="text-[#14B8A6]" />
              <span className="text-sm text-[var(--mp-text-primary)]">Cliente: <b>{selectedCustomer?.name}</b></span>
            </div>
            <div className="flex items-center gap-2">
              <Bike size={14} className="text-[#14B8A6]" />
              <span className="text-sm text-[var(--mp-text-primary)]">Vehículo: <b>{selectedVehicle?.brand} {selectedVehicle?.model} {selectedVehicle?.year} — {selectedVehicle?.plate}</b></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="mp-card p-5">
                <h3 className="text-sm font-semibold text-[var(--mp-text-primary)] mb-4">Datos del servicio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Tipo de servicio *</label>
                    <select value={form.service_type} onChange={(e) => setForm(p => ({ ...p, service_type: e.target.value }))}
                      className="mp-input">
                      <option value="">Seleccionar servicio...</option>
                      {serviceTypes.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Prioridad</label>
                    <select value={form.priority} onChange={(e) => setForm(p => ({ ...p, priority: e.target.value }))}
                      className="mp-input">
                      {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Kilometraje actual</label>
                    <input type="number" value={form.reception_mileage} onChange={(e) => setForm(p => ({ ...p, reception_mileage: e.target.value }))}
                      className="mp-input" placeholder="Ej: 15000" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Descripción del problema</label>
                    <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                      rows={3} className="mp-input resize-none"
                      placeholder="Describa el problema reportado por el cliente..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Observaciones de recepción</label>
                    <textarea value={form.reception_observations} onChange={(e) => setForm(p => ({ ...p, reception_observations: e.target.value }))}
                      rows={2} className="mp-input resize-none"
                      placeholder="Estado general, daños visibles, accesorios del cliente..." />
                  </div>
                </div>
              </div>

              <div className="mp-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[var(--mp-text-primary)]">Fotos de recepción</h3>
                  <span className="text-xs text-[var(--mp-text-tertiary)]">{photos.length} fotos</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {photos.map((p, i) => (
                    <div key={i} className="relative aspect-square rounded-lg border border-[var(--mp-border)] overflow-hidden bg-[var(--mp-bg-elevated)]">
                      <img src={p} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      <button onClick={() => setPhotos(ps => ps.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-lg border-2 border-dashed border-[var(--mp-border)] bg-[var(--mp-bg-elevated)] hover:border-[var(--mp-accent)] transition-colors cursor-pointer flex flex-col items-center justify-center gap-1">
                    <Camera size={20} className="text-[var(--mp-text-tertiary)]" />
                    <span className="text-[10px] text-[var(--mp-text-tertiary)]">Agregar foto</span>
                    <input type="file" accept="image/*" className="hidden" multiple onChange={(e) => {
                      const files = e.target.files;
                      if (!files) return;
                      Array.from(files).forEach(file => {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) setPhotos(ps => [...ps, ev.target!.result as string]);
                        };
                        reader.readAsDataURL(file);
                      });
                    }} />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="mp-card p-5">
                <h3 className="text-sm font-semibold text-[var(--mp-text-primary)] mb-3">Resumen</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--mp-text-tertiary)]">Cliente</span>
                    <span className="font-medium text-[var(--mp-text-primary)]">{selectedCustomer?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--mp-text-tertiary)]">Vehículo</span>
                    <span className="font-medium text-[var(--mp-text-primary)]">{selectedVehicle?.plate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--mp-text-tertiary)]">Servicio</span>
                    <span className="font-medium text-[var(--mp-text-primary)]">{form.service_type || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--mp-text-tertiary)]">Prioridad</span>
                    <span className="font-medium text-[var(--mp-text-primary)]">
                      {priorities.find(p => p.value === form.priority)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--mp-text-tertiary)]">Kilometraje</span>
                    <span className="font-medium text-[var(--mp-text-primary)]">{form.reception_mileage || "—"} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--mp-text-tertiary)]">Fotos</span>
                    <span className="font-medium text-[var(--mp-text-primary)]">{photos.length}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-[rgba(20,184,166,0.06)] border border-[rgba(20,184,166,0.15)]">
                <Info size={16} className="text-[#14B8A6] mt-0.5 shrink-0" />
                <p className="text-xs text-[var(--mp-text-secondary)]">Se creará la orden con estado <b>Recibido</b> y un checklist de recepción por defecto.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setStep(1)} className="mp-btn-ghost text-xs">
              <ArrowLeft size={14} /> Volver
            </button>
            <div className="flex-1" />
            <button onClick={handleCreateOrder} disabled={saving || !form.service_type} className="mp-btn-primary text-xs">
              {saving ? "Creando..." : "Crear orden de trabajo"}
              {!saving && <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
