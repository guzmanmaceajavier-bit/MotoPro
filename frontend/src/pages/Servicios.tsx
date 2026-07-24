import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { api } from "@/api/client";
import IconRenderer from "@/components/icons/IconRenderer";

const heroImages = [
  "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1600&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&q=80",
  "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1600&q=80",
  "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1600&q=80",
];

const defaultServices = [
  { id: 1, title: "Reparación de Motores", description: "Diagnóstico y reparación de motores 2T y 4T con garantía.", icon: "wrench", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&q=80" },
  { id: 2, title: "Electrónica Avanzada", description: "Centralitas, inyectores, sensores y sistemas de encendido.", icon: "zap", image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&q=80" },
  { id: 3, title: "Personalización", description: "Modificaciones estéticas y de rendimiento.", icon: "palette", image: "https://images.unsplash.com/photo-1558980664-6f2343f08f18?w=600&q=80" },
];

export default function Servicios() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [services, setServices] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Appointment form
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
    Promise.all([
      api.get("/services").catch(() => []),
      api.get("/mechanics").catch(() => []),
    ]).then(([svcData, mechData]) => {
      setServices(Array.isArray(svcData) && svcData.length > 0 ? svcData : defaultServices);
      setMechanics(Array.isArray(mechData) ? mechData : []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      setBookingForm({ name: user.name || "", phone: user.phone || "", email: user.email || "" });
    }
  }, [user]);

  useEffect(() => {
    if (!selectedDate || !selectedMechanic) { setSlots([]); return; }
    setSlotsLoading(true);
    setSelectedSlot("");
    api.get(`/appointments/slots?date=${selectedDate}&mechanic_id=${selectedMechanic}`).then((data) => {
      setSlots(Array.isArray(data) ? data : []);
    }).catch(() => setSlots([])).finally(() => setSlotsLoading(false));
  }, [selectedDate, selectedMechanic]);

  const minDate = new Date().toISOString().split("T")[0];

  const resetBooking = () => {
    setBookingService("");
    setSelectedDate("");
    setSelectedMechanic("");
    setSelectedSlot("");
    setSlots([]);
    setBookingDone(null);
    setApptError("");
  };

  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingService || !selectedDate || !selectedMechanic || !selectedSlot || !bookingForm.name || !bookingForm.phone || !bookingForm.email) return;
    setSubmitting(true);
    setApptError("");
    try {
      const result = await api.post("/appointments", {
        service: bookingService,
        mechanic_id: selectedMechanic,
        date: selectedDate,
        time_slot: selectedSlot,
        name: bookingForm.name,
        phone: bookingForm.phone,
        email: bookingForm.email,
      });
      setBookingDone(result || { id: "confirmado" });
    } catch {
      setApptError("Error al reservar. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const displayedServices = services.length > 0 ? services : defaultServices;

  return (
    <>
      <SEO title="Servicios" description="Servicios especializados para tu motocicleta con garantía y el mejor equipo técnico." />
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-surface-primary">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1600&q=80"
              alt="Servicios"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-10" />
          </div>
          <div className="relative z-20 mx-auto max-w-7xl px-6 lg:px-8 py-24 w-full">
            <div className="max-w-2xl">
              <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs font-semibold text-interactive-accent uppercase tracking-widest"
              >
                Servicios
              </motion.span>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="mt-4 text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-text-primary leading-tight"
              >
                Soluciones para tu{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-interactive-accent to-emerald-400">moto</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="mt-5 text-base text-text-secondary leading-relaxed max-w-lg"
              >
                Servicios especializados con garantía, transparencia y el mejor equipo técnico.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 bg-surface-primary">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-3">
              {displayedServices.slice(0, 3).map((svc: any, i: number) => {
                return (
                  <motion.div key={svc.id || i}
                    initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: i * 0.12 }}
                    className="group rounded-lg border border-border-subtle bg-surface-tertiary/30 p-6 transition-all hover:border-interactive-accent/20 hover:shadow-lg hover:shadow-interactive-accent/5"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-interactive-accent/10 text-interactive-accent transition-colors group-hover:bg-interactive-accent group-hover:text-white">
                      <IconRenderer name={svc.icon || "wrench"} size={22} />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-text-primary mb-2">{svc.title || svc.name}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed mb-4">{svc.description}</p>
                    <div className="flex items-center gap-2 text-sm text-interactive-accent mb-6">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                      Consultar
                    </div>
                    <div className="flex gap-3">
                      <Link to="/contacto"
                        className="flex-1 rounded-lg border border-border-subtle py-3 text-sm font-semibold text-text-primary text-center hover:bg-surface-tertiary/50 transition-all"
                      >
                        Consultar
                      </Link>
                      <Link to="/solicitar-servicio"
                        className="flex-1 rounded-lg bg-gradient-to-r from-interactive-accent-hover to-interactive-accent py-3 text-sm font-semibold text-white text-center shadow-lg shadow-interactive-accent/25 hover:shadow-interactive-accent/40 transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        Agendar
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Appointment Section */}
        <section className="py-20 bg-surface-secondary">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              {!bookingDone ? (
                <div className="bg-surface-primary border border-border rounded-3xl p-6 md:p-10 shadow-elevation-2">
                  {/* Header */}
                  <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-interactive-accent/10 border border-interactive-accent/20 rounded-full px-4 py-1.5 mb-4">
                      <svg className="w-4 h-4 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      <span className="text-xs font-semibold text-interactive-accent uppercase tracking-wider">Agendar Cita</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary">Agenda tu cita en el taller</h2>
                    <p className="mt-3 text-text-secondary max-w-lg mx-auto">Completa los datos y reserva el mejor horario para tu moto</p>
                  </div>

                  {/* Step 1 - Service & Mechanic */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-full bg-interactive-accent flex items-center justify-center text-white text-sm font-bold">1</div>
                      <h3 className="text-lg font-heading font-bold text-text-primary">Servicio y profesional</h3>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-bold text-text-primary mb-2">Tipo de servicio</label>
                        <select value={bookingService} onChange={(e) => { setBookingService(e.target.value); setSelectedSlot(""); }}
                          className="h-12 w-full rounded-xl border-2 border-border bg-surface-secondary px-4 text-sm font-medium text-text-primary transition-all focus:border-interactive-accent focus:outline-none appearance-none cursor-pointer"
                        >
                          <option value="">Selecciona un servicio</option>
                          {services.map((s: any) => (
                            <option key={s.id || s.title} value={s.title || s.name}>{s.title || s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-text-primary mb-2">Mecánico</label>
                        <select value={selectedMechanic} onChange={(e) => { setSelectedMechanic(e.target.value); setSelectedSlot(""); }}
                          className="h-12 w-full rounded-xl border-2 border-border bg-surface-secondary px-4 text-sm font-medium text-text-primary transition-all focus:border-interactive-accent focus:outline-none appearance-none cursor-pointer"
                        >
                          <option value="">Selecciona un mecánico</option>
                          {mechanics.map((m: any) => (
                            <option key={m.id} value={m.id}>{m.name}{m.specialty ? ` — ${m.specialty}` : ""}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 - Date & Time */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-full bg-interactive-accent flex items-center justify-center text-white text-sm font-bold">2</div>
                      <h3 className="text-lg font-heading font-bold text-text-primary">Fecha y horario</h3>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-bold text-text-primary mb-2">Fecha</label>
                        <input type="date" value={selectedDate} min={minDate}
                          onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(""); }}
                          className="h-12 w-full rounded-xl border-2 border-border bg-surface-secondary px-4 text-sm font-medium text-text-primary transition-all focus:border-interactive-accent focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-text-primary mb-2">Horarios disponibles</label>
                        <div className="rounded-xl border-2 border-border bg-surface-secondary p-3 min-h-[48px]">
                          {!selectedDate || !selectedMechanic ? (
                            <p className="text-xs text-text-tertiary text-center py-2">Selecciona fecha y mecánico</p>
                          ) : slotsLoading ? (
                            <div className="flex items-center justify-center py-2">
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-interactive-accent border-t-transparent" />
                            </div>
                          ) : slots.length === 0 ? (
                            <p className="text-xs text-text-tertiary text-center py-2">No hay horarios disponibles</p>
                          ) : (
                            <div className="grid grid-cols-3 gap-1.5">
                              {slots.map((slot: any) => {
                                const time = typeof slot === "string" ? slot : slot.time || slot.slot;
                                return (
                                  <button key={time} onClick={() => setSelectedSlot(time)}
                                    className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                                      selectedSlot === time
                                        ? "bg-interactive-accent text-white shadow-md shadow-interactive-accent/25"
                                        : "bg-surface-tertiary text-text-secondary hover:border-interactive-accent/30 hover:text-text-primary border border-transparent"
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

                  {/* Step 3 - Contact */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-full bg-interactive-accent flex items-center justify-center text-white text-sm font-bold">3</div>
                      <h3 className="text-lg font-heading font-bold text-text-primary">Tus datos de contacto</h3>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block text-sm font-bold text-text-primary mb-2">Nombre completo</label>
                        <input type="text" value={bookingForm.name}
                          onChange={(e) => setBookingForm(p => ({ ...p, name: e.target.value }))}
                          placeholder="Tu nombre"
                          className="h-12 w-full rounded-xl border-2 border-border bg-surface-secondary px-4 text-sm font-medium text-text-primary placeholder:text-text-tertiary transition-all focus:border-interactive-accent focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-text-primary mb-2">Teléfono</label>
                        <div className="flex gap-2">
                          <div className="flex items-center gap-1.5 h-12 rounded-xl border-2 border-border bg-surface-secondary px-3 shrink-0">
                            <span className="text-sm">🇨🇴</span>
                            <span className="text-xs font-semibold text-text-secondary">+57</span>
                          </div>
                          <input type="tel" value={bookingForm.phone}
                            onChange={(e) => setBookingForm(p => ({ ...p, phone: e.target.value }))}
                            placeholder="300 123 4567"
                            className="flex-1 h-12 rounded-xl border-2 border-border bg-surface-secondary px-4 text-sm font-medium text-text-primary placeholder:text-text-tertiary transition-all focus:border-interactive-accent focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-text-primary mb-2">Email</label>
                        <input type="email" value={bookingForm.email}
                          onChange={(e) => setBookingForm(p => ({ ...p, email: e.target.value }))}
                          placeholder="correo@ejemplo.com"
                          className="h-12 w-full rounded-xl border-2 border-border bg-surface-secondary px-4 text-sm font-medium text-text-primary placeholder:text-text-tertiary transition-all focus:border-interactive-accent focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <button onClick={handleAppointmentSubmit}
                    disabled={submitting || !bookingService || !selectedDate || !selectedMechanic || !selectedSlot}
                    className="w-full rounded-xl bg-gradient-to-r from-interactive-accent-hover to-interactive-accent py-4 text-base font-bold text-white shadow-lg shadow-interactive-accent/25 hover:shadow-interactive-accent/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    {submitting ? "Reservando..." : "Confirmar mi cita"}
                  </button>
                  {apptError && <p className="mt-3 text-sm text-red-400 text-center">{apptError}</p>}
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-surface-primary border border-border rounded-3xl p-8 md:p-12 shadow-elevation-2 text-center"
                >
                  <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-text-primary mb-2">Cita confirmada</h3>
                  <p className="text-text-secondary mb-8 max-w-md mx-auto">Te hemos enviado los detalles a tu correo electrónico.</p>
                  <div className="inline-block text-left rounded-2xl border border-border bg-surface-secondary p-6 mb-8 space-y-3">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l2.05-2.05m0 0l2.05-2.05m-2.05 2.05l-2.05-2.05m2.05 2.05l2.05 2.05m-6.17-2.05L16.5 3.75 12 8.25m-5.17 8.5l-1.25 5.25 5.25-1.25L20.25 5.25 18 3l-12.5 12.5z" /></svg>
                      <div>
                        <p className="text-xs text-text-tertiary">Servicio</p>
                        <p className="text-sm font-bold text-text-primary">{bookingService}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                      <div>
                        <p className="text-xs text-text-tertiary">Fecha y hora</p>
                        <p className="text-sm font-bold text-text-primary">{selectedDate ? new Date(selectedDate).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : ""} — {selectedSlot}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                      <div>
                        <p className="text-xs text-text-tertiary">Mecánico</p>
                        <p className="text-sm font-bold text-text-primary">{mechanics.find((m) => String(m.id) === String(selectedMechanic))?.name || "Asignado"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a href={`https://wa.me/573001234567?text=${encodeURIComponent(`Hola, quiero confirmar mi cita para ${bookingService} el ${selectedDate} a las ${selectedSlot}`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-500 transition-all shadow-lg shadow-green-600/25"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Confirmar por WhatsApp
                    </a>
                    <button onClick={resetBooking}
                      className="rounded-xl border-2 border-border px-6 py-3 text-sm font-bold text-text-primary hover:bg-surface-secondary transition-all"
                    >
                      Agendar otra cita
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-surface-primary">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className="relative h-64 md:h-80 rounded-2xl overflow-hidden"
              >
                <img src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80" alt="Mecánico"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className="space-y-5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-interactive-accent/10">
                  <svg className="w-6 h-6 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l2.05-2.05m0 0l2.05-2.05m-2.05 2.05l-2.05-2.05m2.05 2.05l2.05 2.05m-6.17-2.05L16.5 3.75 12 8.25m-5.17 8.5l-1.25 5.25 5.25-1.25L20.25 5.25 18 3l-12.5 12.5z" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-text-primary leading-tight">
                  ¿No sabes qué necesita{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-interactive-accent to-emerald-400">tu moto</span>?
                </h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Agenda un diagnóstico completo y descubre todo lo que podemos hacer por ella.
                </p>
                <Link to="/solicitar-servicio"
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-interactive-accent-hover to-interactive-accent px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-interactive-accent/25 hover:shadow-interactive-accent/40 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  Diagnóstico Gratuito
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer /><BackToTop /><WhatsAppFloat />
    </>
  );
}
