import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { api } from "@/api/client";
import { useToast } from "@/providers/ToastProvider";
import { MapPin, Phone, Clock, Mail, ExternalLink, MessageCircle, Star, HelpCircle, Send, CheckCircle, ChevronDown, Headphones } from "lucide-react";
import { Spinner, InlineSpinner } from "@/components/ui";

const contactReasons = [
  { id: "general", label: "Consulta general", description: "Información sobre servicios, productos, disponibilidad y más.", icon: MessageCircle, cta: "Realizar consulta" },
  { id: "duda", label: "Tengo una duda", description: "Resolvemos tus dudas sobre pedidos, envíos, garantías y más.", icon: HelpCircle, cta: "Resolver duda" },
  { id: "valoracion", label: "Valoración / Sugerencia", description: "Tu opinión nos ayuda a mejorar. Cuéntanos tu experiencia.", icon: Star, cta: "Enviar valoración" },
];

const contactSubjects = [
  { value: "", label: "Selecciona un asunto" },
  { value: "productos", label: "Información de productos" },
  { value: "servicios", label: "Servicios disponibles" },
  { value: "disponibilidad", label: "Disponibilidad de repuestos" },
  { value: "pedido", label: "Estado de pedido" },
  { value: "garantia", label: "Garantía" },
  { value: "otro", label: "Otro" },
];

const fallbackBranches = [
  { id: "1", name: "Sede Principal Medellín", address: "Calle 47 # 52 - 18, Medellín, Colombia", phone: "+57 300 123 4567", schedule: "Lun - Vie: 8:00 - 18:00\nSáb: 9:00 - 13:00", email: "info@motopro.com", is_main: 1 },
  { id: "2", name: "Sucursal Bogotá", address: "Av. 68 # 15 - 22, Chapinero, Bogotá", phone: "+57 301 234 5678", schedule: "Lun - Vie: 8:00 - 18:00\nSáb: 9:00 - 13:00", email: "bogota@motopro.com", is_main: 0 },
  { id: "3", name: "Sucursal Cali", address: "Cra. 100 # 5 - 33, Ciudad Jardín, Cali", phone: "+57 302 345 6789", schedule: "Lun - Vie: 8:00 - 18:00\nSáb: 9:00 - 13:00", email: "cali@motopro.com", is_main: 0 },
];

export default function Contacto() {
  const { addToast } = useToast();
  const [config, setConfig] = useState<Record<string, string>>({});
  const [branches, setBranches] = useState(fallbackBranches);
  const [loading, setLoading] = useState(true);
  const [formType, setFormType] = useState("general");
  const [formSubject, setFormSubject] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  // FAQ
  const [contactFaqs, setContactFaqs] = useState<any[]>([]);
  const [openContactFaq, setOpenContactFaq] = useState<number | null>(null);

  // Feedback form state
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHoverRating, setFeedbackHoverRating] = useState(0);
  const [npsScore, setNpsScore] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackSending, setFeedbackSending] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/config").catch(() => ({})),
      api.get("/system-config/branches/list").catch(() => []),
      api.get("/faqs").catch(() => []),
    ]).then(([cfg, branchData, faqData]) => {
      setConfig(cfg);
      if (Array.isArray(branchData) && branchData.length > 0) {
        setBranches(branchData.map((b: any) => ({
          id: b.id || "",
          name: b.name || "",
          address: b.address || "",
          phone: b.phone || "",
          schedule: b.schedule || "",
          email: b.email || "",
          is_main: b.is_main || 0,
        })));
      }
      if (Array.isArray(faqData) && faqData.length > 0) setContactFaqs(faqData);
    }).finally(() => setLoading(false));
  }, []);

  const mainBranch = branches.find(b => b.is_main) || branches[0];
  const mapQuery = encodeURIComponent(mainBranch?.address || "Medellín, Colombia");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/contact", { ...form, type: formType, subject: formType });
      setSent(true);
      setForm({ name: "", email: "", phone: "", message: "" });
      setFormSubject("");
      addToast("Mensaje enviado con éxito", "success");
    } catch {
      addToast("Error al enviar. Intenta de nuevo.", "error");
    } finally {
      setSending(false);
    }
  };

  const scrollToForm = useCallback(() => {
    document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const scrollToFeedback = useCallback(() => {
    document.getElementById("feedback-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const openWhatsApp = useCallback(() => {
    const phone = config.social_whatsapp || mainBranch?.phone?.replace(/[^0-9]/g, "") || "573001234567";
    const msg = encodeURIComponent("Hola, tengo una duda sobre pedidos, envíos o garantías. ¿Podrían ayudarme?");
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  }, [config, mainBranch]);

  const handleFeedbackSubmit = async () => {
    if (feedbackRating === 0) return;
    setFeedbackSending(true);
    try {
      await api.post("/contact", {
        name: "Valoración web",
        email: "",
        phone: "",
        message: `Valoración: ${feedbackRating}/5 estrellas | NPS: ${npsScore}/10${feedbackComment ? `\nComentario: ${feedbackComment}` : ""}`,
        type: "valoracion",
        subject: "valoracion",
        rating: feedbackRating,
        nps: npsScore,
      });
      setFeedbackSent(true);
      addToast("Valoración enviada con éxito", "success");
    } catch {
      addToast("Error al enviar. Intenta de nuevo.", "error");
    } finally {
      setFeedbackSending(false);
    }
  };

  const selectReason = (id: string) => {
    setFormType(id);
    if (id === "general") {
      setTimeout(scrollToForm, 100);
    } else if (id === "duda") {
      openWhatsApp();
    } else if (id === "valoracion") {
      setTimeout(scrollToFeedback, 100);
    }
  };

  return (
    <>
      <SEO title="Contacto | MotoPro" description="Contáctanos para resolver todas tus dudas sobre nuestros servicios." />
      <main className="bg-surface-primary min-h-screen pt-16">

        {/* ── Header ── */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="text-[11px] font-bold text-interactive-accent uppercase tracking-[0.2em]">
              Contáctanos
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="mt-3 text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-text-primary">
              Estamos para ayudarte
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="mt-3 text-sm text-text-secondary max-w-lg mx-auto">
              Selecciona la opción que mejor se adapte a tu necesidad
            </motion.p>
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3 }}
              className="mt-5 mx-auto w-16 h-1 bg-interactive-accent rounded-full" />
          </div>
        </section>

        {/* ── Contact Reason Cards ── */}
        <section className="pb-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-5">
              {contactReasons.map((reason, i) => (
                <motion.button key={reason.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => selectReason(reason.id)}
                  aria-label={`${reason.label}: ${reason.description}`}
                  className={`group text-left rounded-2xl border p-6 transition-all ${
                    formType === reason.id
                      ? "border-interactive-accent/40 bg-interactive-accent/5 shadow-lg shadow-interactive-accent/10"
                      : "border-border-subtle bg-surface-secondary hover:border-interactive-accent/20 hover:bg-surface-tertiary/30"
                  }`}>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-interactive-accent/10 text-interactive-accent mb-4 group-hover:scale-110 transition-transform">
                    <reason.icon size={26} />
                  </div>
                  <h3 className="text-base font-heading font-bold text-text-primary mb-1">{reason.label}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed mb-4">{reason.description}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-interactive-accent group-hover:gap-2.5 transition-all">
                    {reason.cta} <Send size={13} />
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Main Content: Info + Form + Feedback ── */}
        <section className="pb-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-6">

              {/* Contact Info */}
              <div className="lg:col-span-3">
                <div className="rounded-2xl border border-border-subtle bg-surface-secondary p-6 h-full">
                  <h2 className="text-lg font-heading font-bold text-text-primary mb-1">Información de contacto</h2>
                  <div className="w-8 h-0.5 bg-interactive-accent rounded-full mt-2 mb-6" />
                  {loading ? (
                    <div className="space-y-4">
                      {[1,2,3,4].map(i => <div key={i} className="h-12 bg-surface-tertiary rounded-lg animate-pulse" />)}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[
                        { icon: MapPin, label: "Dirección", value: config.site_address || mainBranch?.address || "" },
                        { icon: Phone, label: "Teléfono", value: config.site_phone || mainBranch?.phone || "" },
                        { icon: Mail, label: "Email", value: config.site_email || mainBranch?.email || "" },
                        { icon: Clock, label: "Horario de atención", value: mainBranch?.schedule || config.site_hours || "Lun - Vie: 8:00 - 18:00\nSáb: 9:00 - 13:00" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-interactive-accent/10 text-interactive-accent shrink-0">
                            <item.icon size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-text-primary">{item.label}</p>
                            <p className="text-[11px] text-text-secondary whitespace-pre-line mt-0.5">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <a href={`https://maps.google.com/?q=${mapQuery}`} target="_blank" rel="noopener noreferrer"
                    aria-label="Abrir ubicación en Google Maps"
                    className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl border border-border-subtle py-2.5 text-xs font-semibold text-text-primary hover:bg-surface-tertiary/50 transition-all">
                    <MapPin size={14} />
                    Ver en Google Maps
                  </a>
                </div>
              </div>

              {/* Form */}
              <div className="lg:col-span-5" id="contact-form">
                {sent ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    role="status" aria-label="Mensaje enviado exitosamente"
                    className="rounded-2xl border border-border-subtle bg-surface-secondary p-10 text-center h-full flex flex-col items-center justify-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h2 className="mb-2 text-xl font-heading font-bold text-text-primary">Mensaje enviado</h2>
                    <p className="mb-6 text-sm text-text-secondary">Te responderemos a la brevedad.</p>
                    <button onClick={() => setSent(false)}
                      className="rounded-xl bg-interactive-accent px-6 py-3 text-sm font-bold text-white transition-all hover:bg-interactive-accent-hover">
                      Enviar otro mensaje
                    </button>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-border-subtle bg-surface-secondary p-6 h-full">
                    <h2 className="text-lg font-heading font-bold text-text-primary mb-1">Envíanos un mensaje</h2>
                    <div className="w-8 h-0.5 bg-interactive-accent rounded-full mt-2 mb-6" />
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="contact-name" className="mb-1.5 block text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                            Nombre completo <span className="text-red-400">*</span>
                          </label>
                          <input id="contact-name" type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required
                            placeholder="Tu nombre" autoComplete="name"
                            className="w-full rounded-xl border border-border-subtle bg-surface-tertiary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-interactive-accent focus:outline-none transition-colors" />
                        </div>
                        <div>
                          <label htmlFor="contact-email" className="mb-1.5 block text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                            Correo electrónico <span className="text-red-400">*</span>
                          </label>
                          <input id="contact-email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required
                            placeholder="tu@email.com" autoComplete="email"
                            className="w-full rounded-xl border border-border-subtle bg-surface-tertiary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-interactive-accent focus:outline-none transition-colors" />
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="contact-phone" className="mb-1.5 block text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                            Teléfono (opcional)
                          </label>
                          <input id="contact-phone" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                            placeholder="+57 300 123 4567" autoComplete="tel"
                            className="w-full rounded-xl border border-border-subtle bg-surface-tertiary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-interactive-accent focus:outline-none transition-colors" />
                        </div>
                        <div>
                          <label htmlFor="contact-subject" className="mb-1.5 block text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                            Asunto <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <select id="contact-subject" value={formSubject} onChange={e => setFormSubject(e.target.value)} required
                              className="w-full rounded-xl border border-border-subtle bg-surface-tertiary px-4 py-2.5 text-sm text-text-primary focus:border-interactive-accent focus:outline-none transition-colors appearance-none">
                              {contactSubjects.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="contact-message" className="mb-1.5 block text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                          Mensaje <span className="text-red-400">*</span>
                        </label>
                        <textarea id="contact-message" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required rows={4}
                          placeholder="Escribe tu mensaje aquí..."
                          className="w-full rounded-xl border border-border-subtle bg-surface-tertiary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-interactive-accent focus:outline-none transition-colors resize-none" />
                      </div>
                      <button type="submit" disabled={sending}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-interactive-accent py-3 text-sm font-bold text-white shadow-lg shadow-interactive-accent/25 transition-all hover:bg-interactive-accent-hover hover:shadow-interactive-accent/40 disabled:opacity-60 disabled:cursor-not-allowed">
                        {sending ? (
                          <>
                            <InlineSpinner />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send size={15} />
                            Enviar mensaje
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                )}
              </div>

              {/* ── Valoración / Sugerencia ── */}
              <div className="lg:col-span-4" id="feedback-section">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="rounded-2xl border border-border-subtle bg-surface-secondary p-6 h-full">
                  <h2 className="text-lg font-heading font-bold text-text-primary mb-1">Valoración / Sugerencia</h2>
                  <div className="w-8 h-0.5 bg-interactive-accent rounded-full mt-2 mb-6" />

                  {feedbackSent ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15">
                        <CheckCircle className="h-7 w-7 text-green-500" />
                      </div>
                      <h3 className="text-base font-heading font-bold text-text-primary mb-1">¡Gracias por tu valoración!</h3>
                      <p className="text-xs text-text-secondary mb-5">Tu opinión es muy importante para nosotros.</p>
                      <button onClick={() => { setFeedbackSent(false); setFeedbackRating(0); setNpsScore(0); setFeedbackComment(""); }}
                        className="rounded-xl border border-border-subtle px-5 py-2.5 text-xs font-semibold text-text-primary hover:bg-surface-tertiary/50 transition-all">
                        Enviar otra valoración
                      </button>
                    </motion.div>
                  ) : (
                    <div className="space-y-5">
                      {/* Star rating */}
                      <div>
                        <label className="mb-2 block text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                          ¿Cómo fue tu experiencia? <span className="text-red-400">*</span>
                        </label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} type="button"
                              onMouseEnter={() => setFeedbackHoverRating(star)}
                              onMouseLeave={() => setFeedbackHoverRating(0)}
                              onClick={() => setFeedbackRating(star)}
                              className="p-0.5 transition-transform hover:scale-110"
                              aria-label={`${star} estrella${star > 1 ? "s" : ""}`}>
                              <Star size={28}
                                className={`transition-colors ${
                                  star <= (feedbackHoverRating || feedbackRating)
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-text-tertiary/30"
                                }`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* NPS scale */}
                      <div>
                        <label className="mb-2 block text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                          ¿Qué tan probable es que nos recomiendes? <span className="text-red-400">*</span>
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                            <button key={score} type="button"
                              onClick={() => setNpsScore(score)}
                              className={`h-9 rounded-lg text-xs font-bold transition-all ${
                                npsScore === score
                                  ? score <= 6 ? "bg-red-500/20 border border-red-500/40 text-red-400"
                                    : score <= 8 ? "bg-amber-500/20 border border-amber-500/40 text-amber-400"
                                    : "bg-green-500/20 border border-green-500/40 text-green-400"
                                  : "border border-border-subtle bg-surface-tertiary text-text-secondary hover:border-interactive-accent/30"
                              }`}>
                              {score}
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-between mt-1.5">
                          <span className="text-[10px] text-text-tertiary">Nada probable</span>
                          <span className="text-[10px] text-text-tertiary">Muy probable</span>
                        </div>
                      </div>

                      {/* Comment */}
                      <div>
                        <label htmlFor="feedback-comment" className="mb-1.5 block text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                          Cuéntanos más <span className="text-red-400">*</span>
                        </label>
                        <textarea id="feedback-comment" value={feedbackComment} onChange={e => setFeedbackComment(e.target.value)} rows={3}
                          placeholder="¿Qué podemos mejorar o qué fue lo que más te gustó?"
                          className="w-full rounded-xl border border-border-subtle bg-surface-tertiary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-interactive-accent focus:outline-none transition-colors resize-none" />
                      </div>

                      <button onClick={handleFeedbackSubmit}
                        disabled={feedbackRating === 0 || npsScore === 0 || feedbackSending}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-interactive-accent py-3 text-sm font-bold text-white shadow-lg shadow-interactive-accent/25 transition-all hover:bg-interactive-accent-hover hover:shadow-interactive-accent/40 disabled:opacity-40 disabled:cursor-not-allowed">
                        {feedbackSending ? (
                          <>
                            <InlineSpinner />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Star size={15} />
                            Enviar valoración
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Mapa ── */}
        <section className="pb-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="rounded-2xl border border-border-subtle bg-surface-secondary overflow-hidden">
              <div className="p-6 pb-0">
                <h2 className="text-lg font-heading font-bold text-text-primary mb-1">Nuestra ubicación</h2>
                <div className="w-8 h-0.5 bg-interactive-accent rounded-full mt-2 mb-4" />
              </div>
              <div className="relative mx-6 mb-6 rounded-xl overflow-hidden border border-border-subtle h-[300px]">
                <iframe
                  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d-75.571125!3d6.244203!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4429a0c0b3e2c3%3A0x8b0c3a2b1c0d4e5f!2sMedell%C3%ADn!5e0!3m2!1ses!2sco!4v1`}
                  width="100%" height="100%"
                  style={{ border: 0 }}
                  allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Ubicación: ${mainBranch?.name || "Taller"}`}
                />
                <a href={`https://maps.google.com/?q=${mapQuery}`} target="_blank" rel="noopener noreferrer"
                  className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-surface-primary/90 backdrop-blur-sm border border-border-subtle px-3 py-1.5 text-[11px] font-semibold text-text-primary hover:bg-surface-primary transition-colors shadow-sm">
                  <ExternalLink size={11} />
                  Abrir en Google Maps
                </a>
                {/* Address badge on map */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-xl bg-surface-primary/90 backdrop-blur-sm border border-border-subtle px-4 py-2.5 shadow-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-interactive-accent/10 text-interactive-accent shrink-0">
                    <MapPin size={14} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-text-primary">{mainBranch?.name || "Taller"}</p>
                    <p className="text-[10px] text-text-secondary">{mainBranch?.address || "Medellín, Colombia"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Sucursales ── */}
        <section className="pb-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-8">
              <span className="text-[11px] font-bold text-interactive-accent uppercase tracking-[0.2em]">Nuestras sedes</span>
              <h2 className="mt-2 text-2xl md:text-3xl font-heading font-bold text-text-primary">Nuestras ubicaciones</h2>
              <div className="w-8 h-0.5 bg-interactive-accent rounded-full mt-3" />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {branches.map((branch, i) => (
                <motion.div key={branch.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-border-subtle bg-surface-secondary p-6 hover:border-interactive-accent/30 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-interactive-accent/10 text-interactive-accent">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-heading font-bold text-text-primary">{branch.name}</h3>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 mt-0.5 text-interactive-accent shrink-0" />
                      <span className="text-xs text-text-secondary">{branch.address}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 mt-0.5 text-interactive-accent shrink-0" />
                      <span className="text-xs text-text-secondary">{branch.phone}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 mt-0.5 text-interactive-accent shrink-0" />
                      <span className="text-xs text-text-secondary whitespace-pre-line">{branch.schedule}</span>
                    </div>
                  </div>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(branch.address)}`} target="_blank" rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-interactive-accent hover:underline">
                    Ver en Google Maps <ExternalLink size={13} />
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        {contactFaqs.length > 0 && (
        <section className="pb-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-8">
              <span className="text-[11px] font-bold text-interactive-accent uppercase tracking-[0.2em]">Centro de ayuda</span>
              <h2 className="mt-2 text-2xl md:text-3xl font-heading font-bold text-text-primary">Preguntas frecuentes</h2>
              <p className="text-sm text-text-secondary mt-1">Resuelve tus dudas antes de contactarnos</p>
              <div className="w-8 h-0.5 bg-interactive-accent rounded-full mt-3" />
            </div>
            <div className="max-w-3xl mx-auto space-y-3">
              {contactFaqs.slice(0, 5).map((faq: any, i: number) => (
                <div key={i} className="border border-border-subtle rounded-xl overflow-hidden bg-surface-secondary">
                  <button onClick={() => setOpenContactFaq(openContactFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-surface-tertiary/50">
                    <span className="text-sm font-semibold text-text-primary pr-4">{faq.question}</span>
                    <svg className={`w-5 h-5 shrink-0 text-text-tertiary transition-transform ${openContactFaq === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  {openContactFaq === i && (
                    <div className="px-5 pb-5">
                      <p className="text-sm text-text-secondary leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
              <div className="text-center pt-2">
                <Link to="/preguntas-frecuentes" className="text-xs font-semibold text-interactive-accent hover:underline">
                  Ver todas las preguntas frecuentes
                </Link>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* ── CTA WhatsApp ── */}
        <section className="pb-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-6 rounded-2xl border border-border-subtle bg-surface-secondary p-6 md:p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-interactive-accent/10 text-interactive-accent shrink-0">
                <Headphones size={26} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-heading font-bold text-text-primary">¿Necesitas ayuda inmediata?</h3>
                <p className="text-sm text-text-secondary mt-1">Nuestro equipo está listo para atenderte.</p>
              </div>
              <a href={`https://wa.me/${config.social_whatsapp || "573001234567"}?text=${encodeURIComponent("Hola, necesito ayuda.")}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-interactive-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-interactive-accent/25 hover:bg-interactive-accent-hover hover:shadow-interactive-accent/40 transition-all shrink-0">
                <MessageCircle size={18} />
                Contactar por WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
