import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

import { SEO } from "@/components/SEO";
import { Spinner } from "@/components/ui";
import { BrandModelFields } from "@/components/forms/BrandModelFields";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { useBrands } from "@/providers/CMSProvider";
import { api } from "@/api/client";

const serviceTypes = [
  "Mantenimiento preventivo", "Reparación de motor", "Sistema eléctrico",
  "Frenos", "Suspensión", "Transmisión", "Personalización", "Diagnóstico general",
];

export default function AgendarCita() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { brands } = useBrands();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    customer_name: user?.name || "", customer_phone: user?.phone || "",
    customer_email: user?.email || "", customer_id: user?.id || null,
    service_type: "", mechanic_id: "", appointment_date: "", start_time: "", notes: "",
    vehicle_brand: "", vehicle_model: "", vehicle_plate: "", vehicle_year: "",
  });
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  useEffect(() => {
    api.get("/services").then(d => setServices(Array.isArray(d) ? d : [])).catch((err) => console.warn("[fetch]", err));
    api.get("/team").then(d => setMechanics(Array.isArray(d) ? d : [])).catch((err) => console.warn("[fetch]", err));
    if (user) {
      api.get("/client/vehicles").then(d => setVehicles(Array.isArray(d) ? d : [])).catch((err) => console.warn("[fetch]", err));
    }
  }, [user]);

  useEffect(() => {
    if (services.length === 0 || form.service_type) return;
    const serviceParam = searchParams.get("service");
    if (!serviceParam) return;
    const svc = services.find(s => String(s.id) === serviceParam || s.slug === serviceParam || s.title === serviceParam);
    if (svc) setForm(f => ({ ...f, service_type: svc.title || svc.name }));
  }, [services, searchParams, form.service_type]);

  useEffect(() => {
    if (form.appointment_date && form.mechanic_id) {
      setLoading(true);
      api.get(`/appointments/slots?date=${form.appointment_date}&mechanic_id=${form.mechanic_id}`)
        .then(d => setSlots(Array.isArray(d) ? d : []))
        .catch(() => setSlots([]))
        .finally(() => setLoading(false));
    }
  }, [form.appointment_date, form.mechanic_id]);

  const minDate = new Date().toISOString().split("T")[0];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post("/appointments", form);
      setDone(true);
      addToast("Cita agendada exitosamente", "success");
    } catch {
      addToast("Error al agendar la cita", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <>
        <SEO title="Cita agendada" />
        <main className="bg-surface-primary min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-interactive-accent/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Cita agendada</h2>
            <p className="text-text-secondary mb-6">Te enviaremos un recordatorio antes de tu cita.</p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r bg-interactive-accent px-6 py-3 font-semibold text-black">Volver al inicio</Link>
              {user && <Link to="/mi-cuenta" className="inline-flex items-center gap-2 rounded-lg border border-interactive-accent px-6 py-3 font-semibold text-interactive-accent">Ver mis citas</Link>}
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SEO title="Agendar cita | MotoPro" />
        <main className="bg-surface-primary min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold text-interactive-accent uppercase tracking-[0.2em]">Agendar</span>
            <h1 className="text-3xl font-bold text-text-primary mt-2">Agenda tu cita en el taller</h1>
            <p className="text-text-secondary mt-2">Selecciona el servicio, fecha y mecánico de tu preferencia.</p>
          </div>

          {/* Steps */}
          <div className="flex items-center justify-center gap-4 mb-10">
            {["Servicio", "Fecha y hora", "Confirmar"].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 ${i <= step ? "text-interactive-accent" : "text-text-tertiary"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i < step ? "bg-interactive-accent text-black" : i === step ? "border-2 border-interactive-accent text-interactive-accent" : "border-2 border-border text-text-tertiary"}`}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{label}</span>
                </div>
                {i < 2 && <div className={`w-12 h-px ${i < step ? "bg-interactive-accent" : "bg-surface-tertiary"}`} />}
              </div>
            ))}
          </div>

          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-text-primary mb-4">Tipo de servicio</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {services.map(s => (
                      <button key={s.id} onClick={() => setForm({ ...form, service_type: s.title })}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          form.service_type === s.title ? "border-interactive-accent bg-interactive-accent/10" : "border-border bg-surface-secondary hover:border-border-accent"
                        }`}>
                        <p className="text-sm font-semibold text-text-primary">{s.title}</p>
                        <p className="text-xs text-text-tertiary mt-1">{s.description}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-text-tertiary mt-3">¿No encuentras tu servicio? <Link to="/solicitar-servicio" className="text-interactive-accent">Solicítalo aquí</Link></p>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary mb-4">Datos de contacto</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-text-secondary mb-1.5">Nombre completo</label>
                      <input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })}
                        className="w-full rounded-lg border border-border bg-surface-tertiary px-4 py-3 text-sm text-text-primary outline-none focus:border-border-accent" placeholder="Tu nombre" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-secondary mb-1.5">Teléfono</label>
                      <input value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })}
                        className="w-full rounded-lg border border-border bg-surface-tertiary px-4 py-3 text-sm text-text-primary outline-none focus:border-border-accent" placeholder="+57 300 123 4567" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-secondary mb-1.5">Email</label>
                      <input value={form.customer_email} onChange={e => setForm({ ...form, customer_email: e.target.value })}
                        className="w-full rounded-lg border border-border bg-surface-tertiary px-4 py-3 text-sm text-text-primary outline-none focus:border-border-accent" placeholder="email@ejemplo.com" />
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary mb-4">Vehículo</h2>
                  {user && vehicles.length > 0 ? (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-text-secondary mb-1.5">Seleccionar vehículo guardado</label>
                      <select value={selectedVehicleId} onChange={(e) => {
                        const v = vehicles.find(v => v.id === e.target.value);
                        setSelectedVehicleId(e.target.value);
                        if (v) setForm({ ...form, vehicle_brand: v.brand || "", vehicle_model: v.model || "", vehicle_plate: v.plate || "", vehicle_year: v.year || "" });
                      }}
                        className="w-full rounded-lg border border-border bg-surface-tertiary px-4 py-3 text-sm text-text-primary outline-none focus:border-border-accent"
                      >
                        <option value="" className="bg-surface-secondary">Seleccionar...</option>
                        {vehicles.map((v: any) => (
                          <option key={v.id} value={v.id} className="bg-surface-secondary">{v.brand} {v.model} - {v.plate}</option>
                        ))}
                      </select>
                      <button onClick={() => { setSelectedVehicleId(""); setForm({ ...form, vehicle_brand: "", vehicle_model: "", vehicle_plate: "", vehicle_year: "" }); }}
                        className="mt-1 text-xs text-interactive-accent hover:underline"
                      >
                        Ingresar manualmente
                      </button>
                    </div>
                  ) : null}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <BrandModelFields
                      brand={form.vehicle_brand}
                      model={form.vehicle_model}
                      onBrandChange={(b) => setForm({ ...form, vehicle_brand: b })}
                      onModelChange={(m) => setForm({ ...form, vehicle_model: m })}
                      extraBrands={brands.map(b => b.name)}
                    />
                    <div>
                      <label className="block text-sm font-semibold text-text-secondary mb-1.5">Placa</label>
                      <input value={form.vehicle_plate} onChange={(e) => setForm({ ...form, vehicle_plate: e.target.value })}
                        className="w-full rounded-lg border border-border bg-surface-tertiary px-4 py-3 text-sm text-text-primary outline-none focus:border-border-accent" placeholder="ABC-123" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-secondary mb-1.5">Año</label>
                      <input type="number" value={form.vehicle_year} onChange={(e) => setForm({ ...form, vehicle_year: e.target.value })}
                        className="w-full rounded-lg border border-border bg-surface-tertiary px-4 py-3 text-sm text-text-primary outline-none focus:border-border-accent" placeholder="2024" min="2000" max="2030" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-text-primary mb-4">Selecciona un mecánico</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {mechanics.map(m => (
                      <button key={m.id} onClick={() => setForm({ ...form, mechanic_id: m.id })}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          form.mechanic_id === m.id ? "border-interactive-accent bg-interactive-accent/10" : "border-border bg-surface-secondary hover:border-border-accent"
                        }`}>
                        <p className="text-sm font-semibold text-text-primary">{m.name}</p>
                        <p className="text-xs text-text-tertiary">{m.specialty}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {form.mechanic_id && (
                  <>
                    <div>
                      <h2 className="text-lg font-bold text-text-primary mb-4">Selecciona la fecha</h2>
                      <input type="date" value={form.appointment_date} min={minDate} onChange={e => setForm({ ...form, appointment_date: e.target.value, start_time: "" })}
                        className="w-full rounded-lg border border-border bg-surface-tertiary px-4 py-3 text-sm text-text-primary outline-none focus:border-border-accent" />
                    </div>

                    {form.appointment_date && (
                      <div>
                        <h2 className="text-lg font-bold text-text-primary mb-4">Horarios disponibles</h2>
                        {loading ? (
                          <Spinner size="sm" label="Cargando horarios..." />
                        ) : slots.length > 0 ? (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {slots.map(slot => (
                              <button key={slot} onClick={() => setForm({ ...form, start_time: slot })}
                                className={`p-3 rounded-lg border text-center text-sm font-medium transition-all ${
                                  form.start_time === slot ? "border-interactive-accent bg-interactive-accent/10 text-interactive-accent" : "border-border bg-surface-secondary text-text-primary hover:border-border-accent"
                                }`}>
                                {slot}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-text-tertiary">No hay horarios disponibles para esta fecha.</p>
                        )}
                      </div>
                    )}
                  </>
                )}

                <div>
                  <h2 className="text-lg font-bold text-text-primary mb-4">Notas (opcional)</h2>
                  <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                    className="w-full rounded-lg border border-border bg-surface-tertiary px-4 py-3 text-sm text-text-primary outline-none focus:border-border-accent resize-none" rows={3} placeholder="Describe el problema o lo que necesitas..." />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-surface-secondary border border-border rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-bold text-text-primary mb-4">Confirma tu cita</h2>
                {[
                  { label: "Servicio", value: form.service_type || "Por definir" },
                  { label: "Nombre", value: form.customer_name },
                  { label: "Teléfono", value: form.customer_phone },
                  { label: "Email", value: form.customer_email },
                  { label: "Vehículo", value: form.vehicle_brand && form.vehicle_model ? `${form.vehicle_brand} ${form.vehicle_model}${form.vehicle_plate ? ` · ${form.vehicle_plate}` : ""}` : "No especificado" },
                  { label: "Mecánico", value: mechanics.find(m => m.id === form.mechanic_id)?.name || "Sin asignar" },
                  { label: "Fecha", value: form.appointment_date ? new Date(form.appointment_date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "" },
                  { label: "Hora", value: form.start_time },
                  { label: "Notas", value: form.notes || "Ninguna" },
                ].map(i => i.value && (
                  <div key={i.label} className="flex justify-between text-sm">
                    <span className="text-text-secondary">{i.label}</span>
                    <span className="text-text-primary font-medium">{i.value}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="text-sm text-text-secondary hover:text-text-primary transition-colors">← Atrás</button>
            ) : (
              <Link to="/servicios" className="text-sm text-interactive-accent">← Servicios</Link>
            )}
            <button onClick={step < 2 ? () => setStep(s => s + 1) : handleSubmit} disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r bg-interactive-accent px-6 py-3 text-sm font-bold text-black hover:bg-interactive-accent-hover transition-all disabled:opacity-50">
              {submitting ? "Agendando..." : step < 2 ? "Continuar" : "Confirmar cita"}
            </button>
          </div>
        </div>
      </main>

    </>
  );
}
