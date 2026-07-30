import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { useConfig } from "@/providers/CMSProvider";
import { Spinner } from "@/components/ui";
import { api } from "@/api/client";

export function BookingForm() {
  const { user } = useAuth();
  const config = useConfig();
  const { addToast } = useToast();
  const [services, setServices] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [bookingService, setBookingService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMechanic, setSelectedMechanic] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingForm, setBookingForm] = useState({ name: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [bookingDone, setBookingDone] = useState<any>(null);
  const [apptError, setApptError] = useState("");

  useEffect(() => {
    api.get("/services").then(d => setServices(Array.isArray(d) ? d : [])).catch((err) => console.warn("[fetch]", err));
    api.get("/mechanics").then(d => setMechanics(Array.isArray(d) ? d : [])).catch((err) => console.warn("[fetch]", err));
  }, []);

  useEffect(() => {
    if (user) setBookingForm({ name: user.name || "", phone: user.phone || "", email: user.email || "" });
  }, [user]);

  useEffect(() => {
    if (!selectedDate || !selectedMechanic) { setSlots([]); return; }
    setSlotsLoading(true);
    setSelectedSlot("");
    api.get(`/appointments/slots?date=${selectedDate}&mechanic_id=${selectedMechanic}`)
      .then(d => setSlots(Array.isArray(d) ? d : []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, selectedMechanic]);

  const minDate = new Date().toISOString().split("T")[0];

  const resetBooking = () => {
    setBookingService(""); setSelectedDate(""); setSelectedMechanic(""); setSelectedSlot(""); setSlots([]); setBookingDone(null); setApptError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingService || !selectedDate || !selectedMechanic || !selectedSlot || !bookingForm.name || !bookingForm.phone || !bookingForm.email) return;
    setSubmitting(true);
    setApptError("");
    try {
      await api.post("/appointments", { service: bookingService, mechanic_id: selectedMechanic, date: selectedDate, time_slot: selectedSlot, name: bookingForm.name, phone: bookingForm.phone, email: bookingForm.email });
      setBookingDone({ id: "confirmado" });
      addToast("Cita agendada exitosamente", "success");
    } catch {
      setApptError("Error al reservar. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (bookingDone) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-border bg-surface-primary p-8 text-center shadow-elevation-2 md:p-12"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15">
          <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="mb-2 font-heading text-2xl font-bold text-text-primary">Cita confirmada</h3>
        <p className="mb-8 text-text-secondary">Te hemos enviado los detalles a tu correo.</p>
        <div className="mb-8 inline-block space-y-3 rounded-2xl border border-border bg-surface-secondary p-6 text-left">
          {[
            { label: "Servicio", value: bookingService },
            { label: "Fecha y hora", value: `${selectedDate ? new Date(selectedDate).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : ""} — ${selectedSlot}` },
            { label: "Mecánico", value: mechanics.find(m => String(m.id) === String(selectedMechanic))?.name || "Asignado" },
          ].map(i => (
            <div key={i.label} className="flex items-center gap-3">
              <div>
                <p className="text-xs text-text-tertiary">{i.label}</p>
                <p className="text-sm font-bold text-text-primary">{i.value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href={`https://wa.me/${config.social_whatsapp || "573001234567"}?text=${encodeURIComponent(`Hola, quiero confirmar mi cita para ${bookingService} el ${selectedDate} a las ${selectedSlot}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-green-600/25 transition-all hover:bg-green-500"
          >
            Contactar por WhatsApp
          </a>
          <button onClick={resetBooking}
            className="rounded-xl border-2 border-border px-6 py-3 text-sm font-bold text-text-primary transition-all hover:bg-surface-secondary"
          >
            Agendar otro servicio
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-surface-primary p-6 shadow-elevation-2 md:p-10">
      <form onSubmit={handleSubmit}>
        <div className="mb-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-interactive-accent text-sm font-bold text-white">1</div>
            <h3 className="font-heading text-lg font-bold text-text-primary">Servicio y profesional</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-text-primary">Tipo de servicio</label>
              <select value={bookingService} onChange={e => { setBookingService(e.target.value); setSelectedSlot(""); }}
                className="h-12 w-full cursor-pointer appearance-none rounded-xl border-2 border-border bg-surface-secondary px-4 text-sm font-medium text-text-primary transition-all focus:border-interactive-accent focus:outline-none"
              >
                <option value="">Selecciona un servicio</option>
                {services.map(s => <option key={s.id || s.title} value={s.title || s.name}>{s.title || s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-text-primary">Mecánico</label>
              <select value={selectedMechanic} onChange={e => { setSelectedMechanic(e.target.value); setSelectedSlot(""); }}
                className="h-12 w-full cursor-pointer appearance-none rounded-xl border-2 border-border bg-surface-secondary px-4 text-sm font-medium text-text-primary transition-all focus:border-interactive-accent focus:outline-none"
              >
                <option value="">Selecciona un mecánico</option>
                {mechanics.map(m => <option key={m.id} value={m.id}>{m.name}{m.specialty ? ` — ${m.specialty}` : ""}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-interactive-accent text-sm font-bold text-white">2</div>
            <h3 className="font-heading text-lg font-bold text-text-primary">Fecha y horario</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-text-primary">Fecha</label>
              <input type="date" value={selectedDate} min={minDate}
                onChange={e => { setSelectedDate(e.target.value); setSelectedSlot(""); }}
                className="h-12 w-full rounded-xl border-2 border-border bg-surface-secondary px-4 text-sm font-medium text-text-primary transition-all focus:border-interactive-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-text-primary">Horarios disponibles</label>
              <div className="min-h-[48px] rounded-xl border-2 border-border bg-surface-secondary p-3">
                {!selectedDate || !selectedMechanic ? (
                  <p className="py-2 text-center text-xs text-text-tertiary">Selecciona fecha y mecánico</p>
                ) : slotsLoading ? (
                  <Spinner size="sm" />
                ) : slots.length === 0 ? (
                  <p className="py-2 text-center text-xs text-text-tertiary">No hay horarios disponibles</p>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5">
                    {slots.map(slot => {
                      const time = typeof slot === "string" ? slot : (slot as any).time || (slot as any).slot;
                      return (
                        <button key={time} type="button" onClick={() => setSelectedSlot(time)}
                          className={`rounded-lg px-2 py-2 text-xs font-semibold transition-all ${
                            selectedSlot === time
                              ? "bg-interactive-accent text-white shadow-md shadow-interactive-accent/25"
                              : "border border-transparent bg-surface-tertiary text-text-secondary hover:border-interactive-accent/30 hover:text-text-primary"
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-interactive-accent text-sm font-bold text-white">3</div>
            <h3 className="font-heading text-lg font-bold text-text-primary">Tus datos de contacto</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-bold text-text-primary">Nombre completo</label>
              <input type="text" value={bookingForm.name}
                onChange={e => setBookingForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Tu nombre"
                className="h-12 w-full rounded-xl border-2 border-border bg-surface-secondary px-4 text-sm font-medium text-text-primary placeholder:text-text-tertiary transition-all focus:border-interactive-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-text-primary">Teléfono</label>
              <input type="tel" value={bookingForm.phone}
                onChange={e => setBookingForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="300 123 4567"
                className="h-12 w-full rounded-xl border-2 border-border bg-surface-secondary px-4 text-sm font-medium text-text-primary placeholder:text-text-tertiary transition-all focus:border-interactive-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-text-primary">Email</label>
              <input type="email" value={bookingForm.email}
                onChange={e => setBookingForm(p => ({ ...p, email: e.target.value }))}
                placeholder="correo@ejemplo.com"
                className="h-12 w-full rounded-xl border-2 border-border bg-surface-secondary px-4 text-sm font-medium text-text-primary placeholder:text-text-tertiary transition-all focus:border-interactive-accent focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button type="submit"
          disabled={submitting || !bookingService || !selectedDate || !selectedMechanic || !selectedSlot}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-interactive-accent-hover to-interactive-accent py-4 text-base font-bold text-white shadow-lg shadow-interactive-accent/25 transition-all hover:shadow-interactive-accent/40 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {submitting ? "Reservando..." : "Confirmar mi cita"}
        </button>
        {apptError && <p className="mt-3 text-center text-sm text-red-400">{apptError}</p>}
      </form>
    </div>
  );
}
