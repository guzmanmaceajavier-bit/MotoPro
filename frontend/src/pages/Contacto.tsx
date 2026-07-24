import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { api } from "@/api/client";

const contactTypes = [
  { id: "general", label: "Consulta general" },
  { id: "duda", label: "Tengo una duda" },
  { id: "valoracion", label: "Valoración" },
  { id: "cita", label: "Agendar cita" },
];

const today = () => new Date().toISOString().split("T")[0];

export default function Contacto() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [formType, setFormType] = useState("general");
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [citaDate, setCitaDate] = useState(today());
  const [citaTime, setCitaTime] = useState("10:00");
  const [citaService, setCitaService] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api.get("/config").then(setConfig).catch(() => {});
    api.get("/services?all=1").then((data) => {
      const arr = Array.isArray(data) ? data : [];
      setServices(arr.map((s: any) => s.title));
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body: any = { ...form, type: formType };
      if (formType === "cita") { body.citaDate = citaDate; body.citaTime = citaTime; body.citaService = citaService; }
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      setForm({ name: "", email: "", phone: "", message: "" });
      setCitaDate(today());
      setCitaTime("10:00");
      setCitaService("");
    } catch {}
  };

  const whatsapp = config.social_whatsapp?.replace(/[^0-9]/g, "") || "525551234567";
  const mapSrc = config.map_lat && config.map_lng
    ? `https://www.google.com/maps?q=${config.map_lat},${config.map_lng}&z=15&output=embed`
    : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12087.689631342!2d-99.133208!3d19.432608!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1f92a1b1b1b1b%3A0x1b1b1b1b1b1b1b1b!2sCiudad%20de%20M%C3%A9xico!5e0!3m2!1ses!2smx!4v1";

  return (
    <>
      <SEO title="Contacto | MotoPro" description="Ponte en contacto con nuestro equipo de expertos." />
      <Navbar />
      <main className="bg-surface-primary min-h-screen pt-16">
        {/* Hero */}
        <section className="relative pt-24 pb-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&h=1080&fit=crop"
              alt="Taller"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold"
              >
                <span className="text-text-primary">¿</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r bg-interactive-accent">Hablamos</span>
                <span className="text-text-primary">?</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-4 text-lg text-text-secondary"
              >
                Resuelve tus dudas o agenda una cita directamente con nuestro equipo.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 flex flex-wrap gap-4"
              >
                {[
                  "Atención personalizada",
                  "Respuesta rápida",
                  "Servicio con garantía",
                ].map((label) => (
                  <div key={label} className="flex items-center gap-2 bg-surface-secondary border border-border rounded-lg px-4 py-2.5">
                    <span className="text-sm text-text-secondary">{label}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Form + Info */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-5">
              {/* Form */}
              <div className="lg:col-span-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-surface-secondary border border-border rounded-2xl p-6 md:p-8"
                >
                  <h2 className="text-2xl font-bold text-text-primary mb-2">Envíanos un mensaje</h2>
                  <p className="text-sm text-text-secondary mb-6">Selecciona el tipo de contacto y completa el formulario.</p>

                  {/* Contact Type Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                    {contactTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setFormType(type.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                          formType === type.id
                            ? "border-interactive-accent bg-interactive-accent/10 text-interactive-accent shadow-md shadow-interactive-accent/10"
                            : "border-border bg-surface-secondary text-text-secondary hover:border-border-accent"
                        }`}
                      >
                        <span className="text-xs font-bold text-center">{type.label}</span>
                      </button>
                    ))}
                  </div>

                  {sent ? (
                    <div className="text-center py-12">
                      <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-interactive-accent/20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-text-primary">
                        {formType === "cita" ? "¡Cita agendada!" : "¡Mensaje enviado!"}
                      </h3>
                      <p className="text-sm text-text-secondary mt-1">
                        {formType === "cita"
                          ? "Te confirmaremos tu cita a la brevedad."
                          : "Gracias por contactarnos. Te responderemos pronto."}
                      </p>
                      <button onClick={() => setSent(false)} className="mt-4 text-sm text-interactive-accent hover:text-interactive-accent-hover transition-colors">
                        Enviar otro mensaje
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-text-primary">Nombre completo *</label>
                        <div className="relative">
                          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                          <input
                            required
                            placeholder="Juan Pérez"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full rounded-xl border border-border bg-surface-tertiary pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-accent focus:ring-2 focus:ring-interactive-accent/20 transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-text-primary">Correo electrónico *</label>
                        <div className="relative">
                          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                          </svg>
                          <input
                            required
                            type="email"
                            placeholder="tu@email.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full rounded-xl border border-border bg-surface-tertiary pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-accent focus:ring-2 focus:ring-interactive-accent/20 transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-text-primary">Teléfono *</label>
                        <div className="relative">
                          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                          </svg>
                          <input
                            required
                            type="tel"
                            placeholder="+57 300 123 4567"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="w-full rounded-xl border border-border bg-surface-tertiary pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-accent focus:ring-2 focus:ring-interactive-accent/20 transition-all"
                          />
                        </div>
                      </div>

                      {formType === "cita" && (
                        <div className="space-y-4 p-4 rounded-xl bg-surface-tertiary border border-border">
                          <p className="text-xs font-bold text-interactive-accent uppercase tracking-wider">Detalles de la cita</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-xs font-bold text-text-primary">Fecha *</label>
                              <input type="date" value={citaDate} min={today()} onChange={(e) => setCitaDate(e.target.value)} required
                                className="w-full rounded-xl border border-border bg-surface-tertiary px-4 py-3 text-sm text-text-primary outline-none focus:border-border-accent focus:ring-2 focus:ring-interactive-accent/20 transition-all" />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-xs font-bold text-text-primary">Hora *</label>
                              <input type="time" value={citaTime} onChange={(e) => setCitaTime(e.target.value)} required
                                className="w-full rounded-xl border border-border bg-surface-tertiary px-4 py-3 text-sm text-text-primary outline-none focus:border-border-accent focus:ring-2 focus:ring-interactive-accent/20 transition-all" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-text-primary">Tipo de servicio *</label>
                            <select value={citaService} onChange={(e) => setCitaService(e.target.value)} required
                              className="w-full rounded-xl border border-border bg-surface-tertiary px-4 py-3 text-sm text-text-primary outline-none focus:border-border-accent focus:ring-2 focus:ring-interactive-accent/20 transition-all">
                              <option value="" className="bg-surface-secondary text-text-secondary">Selecciona un servicio</option>
                              {services.map((s) => (
                                <option key={s} value={s} className="bg-surface-secondary text-text-primary">{s}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-text-primary">Mensaje *</label>
                        <textarea
                          required
                          placeholder={
                            formType === "cita" ? "Notas adicionales (opcional)..." :
                            formType === "duda" ? "Escribe tu duda..." :
                            "Escribe tu mensaje..."
                          }
                          rows={4}
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          className="w-full rounded-xl border border-border bg-surface-tertiary px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-accent focus:ring-2 focus:ring-interactive-accent/20 resize-none transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r bg-interactive-accent py-3.5 font-semibold text-black hover:bg-interactive-accent-hover transition-all duration-300 shadow-elevation-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                        Enviar mensaje
                      </button>
                    </form>
                  )}
                </motion.div>
              </div>

              {/* Info Sidebar */}
              <div className="lg:col-span-2 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-surface-secondary border border-border rounded-2xl p-6"
                >
                  <h3 className="text-lg font-bold text-text-primary mb-6">Información</h3>
                  <div className="space-y-5">
                    {[
                      { label: "Dirección", value: config.site_address || config.address || "Av. Revolución 1234, Col. Centro, CDMX" },
                      { label: "Teléfono", value: config.site_phone || config.phone || "+52 555 123 4567" },
                      { label: "Email", value: config.site_email || config.email || "info@motopro.com" },
                      { label: "Horario", value: config.site_hours || "Lun - Vie: 8:00 - 18:00 | Sáb: 8:00 - 14:00" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-3">
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{item.label}</p>
                          <p className="text-sm text-text-secondary mt-0.5 whitespace-pre-line">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 flex items-center justify-center gap-2 w-full rounded-lg bg-interactive-accent/10 border border-interactive-accent/30 py-3 text-sm font-semibold text-interactive-accent hover:bg-interactive-accent/20 transition-all duration-300"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Escribir por WhatsApp
                  </a>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-2xl overflow-hidden border border-border h-[220px]"
                >
                  <iframe
                    src={mapSrc}
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
                    allowFullScreen
                    loading="lazy"
                    title="Ubicación del taller"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-surface-secondary border border-border rounded-2xl p-6 flex items-start gap-4"
                >
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">¿Prefieres visitarnos?</h4>
                    <p className="text-sm text-text-secondary mt-1">Te esperamos en nuestro taller con la mejor atención y tecnología especializada.</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Agenda tu cita */}
        <section className="py-16 border-t border-border">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-surface-secondary border border-border rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-text-primary">Agenda tu cita fácilmente</h3>
                  <p className="text-sm text-text-secondary mt-1">Ahorra tiempo y asegura tu servicio. Agenda en línea en pocos pasos.</p>
                </div>
              </div>
              <a
                href="/servicios"
                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-interactive-accent text-interactive-accent font-semibold text-sm hover:bg-interactive-accent/10 transition-all duration-300 whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                Agendar ahora
              </a>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />
      <WhatsAppFloat />
    </>
  );
}
