import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

import { useConfig } from "@/providers/CMSProvider";
import { api } from "@/api/client";
import IconRenderer from "@/components/icons/IconRenderer";
import { Clock, Search, FileText, Wrench, CheckCircle, ClipboardList, ChevronDown, ChevronUp, Star, Calendar, Shield, ArrowRight, Image as ImageIcon, Phone } from "lucide-react";
import { Breadcrumb } from "@/components/ui";

export default function ServicioDetail() {
  const { id, slug } = useParams();
  const config = useConfig();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    if (slug) {
      api.get(`/services/slug/${slug}`).then((data) => setService(data || null)).catch(() => setService(null)).finally(() => setLoading(false));
    } else if (id) {
      api.get(`/services/${id}`).then((data) => setService(data || null)).catch(() => setService(null)).finally(() => setLoading(false));
    }
  }, [id, slug]);

  const relatedServices = Array.isArray(service?.related) ? service.related : [];

  const features: string[] = (() => {
    try {
      const f = service?.features;
      if (Array.isArray(f)) return f;
      if (typeof f === "string") return JSON.parse(f);
      return ["Diagnóstico gratuito", "Repuestos originales", "Garantía por escrito",
        "Entrega a tiempo", "Reporte detallado", "Limpieza incluida"];
    } catch { return []; }
  })();

  const beforeAfterPhotos = service?.before_after || [];

  if (loading) {
    return (
      <>
        <SEO title="Servicios" />
        <main className="pt-20 bg-surface-primary min-h-screen">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <div className="space-y-6">
              <div className="h-8 w-64 bg-surface-tertiary rounded-lg animate-pulse mx-auto" />
              <div className="h-4 w-96 bg-surface-tertiary rounded animate-pulse mx-auto" />
              <div className="h-64 w-full bg-surface-tertiary rounded-2xl animate-pulse" />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!service) {
    return (
      <>
        <SEO title="Servicio no encontrado" />
        <main className="pt-20 bg-surface-primary min-h-screen flex items-center justify-center">
          <div className="text-center">
            <IconRenderer name="wrench" size={64} className="mx-auto text-text-tertiary mb-4" />
            <h1 className="text-2xl font-bold text-text-primary">Servicio no encontrado</h1>
            <Link to="/servicios" className="mt-4 inline-block text-interactive-accent hover:underline">Ver todos los servicios</Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SEO title={service.title} description={service.description} />
      <main className="bg-surface-primary min-h-screen pt-16">
        {/* Hero section */}
        <section className="relative pt-20 pb-16 overflow-hidden">
          {service.hero_image ? (
            <>
              <img src={service.hero_image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${service.accent_color || "#1a1a2e"}, ${service.accent_color ? service.accent_color + "88" : "#16213e"})`
              }}
            />
          )}
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
            <Breadcrumb items={[
              { label: "Inicio", href: "/" },
              { label: "Servicios", href: "/servicios" },
              { label: service.title }
            ]} className="mb-8" />

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-interactive-accent/10 border border-interactive-accent/30 text-interactive-accent text-xs font-semibold px-4 py-2 rounded-full mb-6">
                <Wrench className="w-3.5 h-3.5" />
                SERVICIO PROFESIONAL
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight mb-6">
                {service.title}
              </h1>
              <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl">
                {service.description}
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link
                  to={`/agendar-cita?service=${service.id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-interactive-accent px-6 py-3.5 text-sm font-bold text-black hover:bg-interactive-accent-hover transition-all duration-300 shadow-elevation-2"
                >
                  <Calendar className="w-4 h-4" />
                  Agendar servicio
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/contacto"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-secondary px-6 py-3.5 text-sm font-semibold text-text-primary hover:bg-surface-tertiary transition-all"
                >
                  <Phone className="w-4 h-4" />
                  Solicitar asesoría
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-16">
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-10">
              {/* Service info card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {[
                  { label: "Precio desde", value: service.price ? `$${service.price.toLocaleString()}` : "Consultar", icon: "💰" },
                  { label: "Duración", value: service.duration || "—", icon: "⏱️" },
                  { label: "Garantía", value: service.warranty || "Respaldado", icon: "🛡️" },
                  { label: "Agendamiento", value: "Disponible", icon: "📅" },
                ].map((info) => (
                  <div key={info.label} className="bg-surface-secondary border border-border rounded-xl p-4 text-center">
                    <span className="text-xl">{info.icon}</span>
                    <p className="text-xs text-text-tertiary mt-1">{info.label}</p>
                    <p className="text-sm font-bold text-text-primary">{info.value}</p>
                  </div>
                ))}
              </motion.div>

              {/* What includes */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h2 className="text-xl font-bold text-text-primary mb-4">¿Qué incluye?</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {features.map((f: string) => (
                    <div key={f} className="flex items-center gap-3 rounded-lg border border-border bg-surface-secondary p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-interactive-accent/10">
                        <CheckCircle className="h-5 w-5 text-interactive-accent" />
                      </div>
                      <span className="text-sm text-text-primary">{f}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* What not includes */}
              {service?.excludes && service.excludes.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <h2 className="text-xl font-bold text-text-primary mb-4">¿Qué no incluye?</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(service.excludes || []).map((item: string) => (
                      <div key={item} className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                          <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <span className="text-sm text-text-primary">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Process */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="text-xl font-bold text-text-primary mb-6">Proceso</h2>
                <div className="relative pl-10 space-y-6">
                  <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-interactive-accent/40 to-blue-500/30" />
                  {[
                    { icon: ClipboardList, title: "Recepción", desc: "Recibimos tu moto y registramos todos los detalles del ingreso." },
                    { icon: Search, title: "Diagnóstico", desc: "Realizamos una revisión completa para identificar el problema." },
                    { icon: FileText, title: "Cotización", desc: "Te presentamos un presupuesto detallado sin compromiso." },
                    { icon: Wrench, title: "Reparación", desc: "Ejecutamos el trabajo con repuestos originales y técnicos certificados." },
                    { icon: CheckCircle, title: "Control de Calidad", desc: "Probamos cada componente para garantizar un servicio óptimo." },
                  ].map((step, i) => (
                    <div key={step.title} className="relative flex items-start gap-4">
                      <div className="absolute -left-10 mt-0.5 w-[30px] h-[30px] rounded-full bg-interactive-accent/10 border-2 border-interactive-accent flex items-center justify-center">
                        <step.icon className="w-3.5 h-3.5 text-interactive-accent" />
                      </div>
                      <div className="flex-1 bg-surface-secondary border border-border rounded-lg p-4">
                        <span className="text-xs font-bold text-interactive-accent">Paso {i + 1}</span>
                        <h3 className="text-sm font-bold text-text-primary mt-0.5">{step.title}</h3>
                        <p className="text-xs text-text-secondary mt-1">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Before / After */}
              {beforeAfterPhotos.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <h2 className="text-xl font-bold text-text-primary mb-4">Antes y después</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {beforeAfterPhotos.map((pair: any, i: number) => (
                      <div key={i} className="bg-surface-secondary border border-border rounded-xl overflow-hidden">
                        <div className="grid grid-cols-2">
                          <div className="relative">
                            <img src={pair.before} alt={`Antes ${i + 1}`} loading="lazy" className="w-full h-36 object-cover" />
                            <span className="absolute top-2 left-2 bg-red-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">Antes</span>
                          </div>
                          <div className="relative">
                            <img src={pair.after} alt={`Después ${i + 1}`} loading="lazy" className="w-full h-36 object-cover" />
                            <span className="absolute top-2 right-2 bg-green-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">Después</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* FAQ */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="text-xl font-bold text-text-primary mb-4">Preguntas frecuentes</h2>
                <div className="space-y-3">
                  {[
                    { q: "¿Cuánto tiempo toma el servicio?", a: "El tiempo varía según el tipo de servicio. Los mantenimientos preventivos toman de 2 a 4 horas, mientras que reparaciones mayores pueden requerir de 1 a 3 días." },
                    { q: "¿Ofrecen garantía?", a: "Sí, todos nuestros servicios cuentan con garantía por escrito. La cobertura depende del tipo de reparación." },
                    { q: "¿Puedo agendar una cita para el mismo día?", a: "Sujeto a disponibilidad de nuestros técnicos. Te recomendamos agendar con al menos 24 horas de anticipación." },
                    { q: "¿Qué métodos de pago aceptan?", a: "Aceptamos efectivo, tarjetas débito/crédito, transferencias y pagos por Nequi." },
                    { q: "¿Usan repuestos originales?", a: "Sí, trabajamos exclusivamente con repuestos originales y certificados para garantizar la calidad del servicio." },
                  ].map((faq, i) => (
                    <div key={i} className="border border-border rounded-lg bg-surface-secondary overflow-hidden">
                      <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                        <span className="text-sm font-semibold text-text-primary">{faq.q}</span>
                        {faqOpen === i ? <ChevronUp className="w-4 h-4 text-text-tertiary shrink-0" /> : <ChevronDown className="w-4 h-4 text-text-tertiary shrink-0" />}
                      </button>
                      {faqOpen === i && <div className="px-4 pb-4"><p className="text-sm text-text-secondary">{faq.a}</p></div>}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Opinions */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <h2 className="text-xl font-bold text-text-primary mb-4">Opiniones</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { name: "Carlos Mendoza", rating: 5, comment: "Excelente servicio, muy profesionales. Mi moto quedó como nueva. Recomiendo totalmente el taller." },
                    { name: "Laura Gutiérrez", rating: 5, comment: "Atención rápida y de calidad. Me explicaron todo el proceso y cumplieron con los tiempos estimados." },
                    { name: "Andrés Rivera", rating: 4, comment: "Buen servicio, precios justos. La comunicación durante el proceso fue muy clara y constante." },
                  ].map((review) => (
                    <div key={review.name} className="border border-border bg-surface-secondary rounded-lg p-4">
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-surface-tertiary"}`} />
                        ))}
                      </div>
                      <p className="text-sm text-text-primary mb-2">"{review.comment}"</p>
                      <p className="text-xs font-semibold text-text-secondary">— {review.name}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Warranty section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-green-500/5 to-emerald-500/5 border border-green-500/20 rounded-2xl p-6 md:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    <Shield className="w-7 h-7 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary mb-2">Garantía de servicio</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Todos nuestros servicios cuentan con garantía por escrito. Respadamos cada reparación con 
                      nuestro compromiso de calidad. Si algo no queda como esperas, lo resolvemos sin costo adicional.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-text-primary">Cobertura completa</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-text-primary">Sin costos ocultos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-text-primary">Soporte post-servicio</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Related */}
              {relatedServices.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                  <h2 className="text-xl font-bold text-text-primary mb-4">Servicios relacionados</h2>
                  <div className="grid gap-4 md:grid-cols-3">
                    {relatedServices.map((rs: any, i: number) => (
                      <Link key={rs.id} to={`/servicios/${rs.id}`}
                        className="group rounded-lg border border-border bg-surface-secondary overflow-hidden hover:border-border-accent transition-all"
                      >
                        <div className="h-32 overflow-hidden">
                          <img src={rs.image} alt={rs.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-4">
                          <h3 className="text-sm font-bold text-text-primary group-hover:text-interactive-accent transition-colors">{rs.title}</h3>
                          <p className="text-xs text-text-tertiary mt-1">{rs.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="sticky top-24 space-y-6"
              >
                {/* Pricing */}
                <div className="bg-surface-secondary border border-border rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-text-primary mb-4">Información</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-border">
                      <span className="text-sm text-text-secondary">Precio desde</span>
                      <span className="text-2xl font-bold text-interactive-accent">
                        {service.price ? `$${service.price.toLocaleString()}` : "Consultar"}
                      </span>
                    </div>
                    {service.duration && (
                    <div className="flex items-center justify-between pb-4 border-b border-border">
                      <span className="text-sm text-text-secondary">Duración</span>
                      <span className="text-sm font-medium text-text-primary flex items-center gap-1">
                        <Clock className="w-4 h-4 text-text-tertiary" />
                        {service.duration}
                      </span>
                    </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-text-tertiary" />
                      <div>
                        <p className="text-sm text-text-secondary">Garantía</p>
                        <p className="text-sm font-semibold text-text-primary">Respaldamos nuestro trabajo</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Link to={`/agendar-cita?service=${service.id}`}
                      className="flex items-center justify-center gap-2 w-full rounded-lg bg-interactive-accent px-6 py-3.5 text-sm font-bold text-black hover:bg-interactive-accent-hover transition-all duration-300 shadow-elevation-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Agendar servicio
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link to="/contacto"
                      className="flex items-center justify-center gap-2 w-full rounded-lg border border-interactive-accent py-3.5 text-sm font-semibold text-interactive-accent hover:bg-interactive-accent/10 transition-all"
                    >
                      <Phone className="w-4 h-4" />
                      Solicitar asesoría
                    </Link>
                    <Link to="/servicios"
                      className="flex items-center justify-center gap-2 w-full rounded-lg border border-border py-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-all"
                    >
                      Ver todos los servicios
                    </Link>
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-surface-secondary border border-border rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-text-primary mb-4">¿Tienes dudas?</h3>
                  <p className="text-xs text-text-secondary mb-4">Contáctanos y resolveremos tus preguntas sobre este servicio.</p>
                  <a
                    href={`https://wa.me/${config.social_whatsapp || "525551234567"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full rounded-lg bg-interactive-accent/10 border border-interactive-accent/30 py-3 text-sm font-semibold text-interactive-accent hover:bg-interactive-accent/20 transition-all"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Contactar por WhatsApp
                  </a>
                </div>

                {/* Trust */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: "🛡️", title: "Garantía", desc: "Respaldamos nuestro trabajo" },
                    { icon: "⚡", title: "Rapidez", desc: "Entregas a tiempo" },
                    { icon: "🎧", title: "Soporte", desc: "Te acompañamos siempre" },
                    { icon: "⭐", title: "Calidad", desc: "Estándares profesionales" },
                  ].map((item) => (
                    <div key={item.title} className="bg-surface-secondary border border-border rounded-lg p-3 text-center">
                      <span className="text-xl">{item.icon}</span>
                      <p className="text-xs font-bold text-text-primary mt-1">{item.title}</p>
                      <p className="text-[10px] text-text-tertiary">{item.desc}</p>
                    </div>
                  ))}
                </div>

                {/* CTA final */}
                <div className="bg-gradient-to-br from-interactive-accent/10 to-blue-500/10 border border-interactive-accent/20 rounded-2xl p-6 text-center">
                  <h3 className="text-lg font-bold text-text-primary mb-2">¿Listo para agendar?</h3>
                  <p className="text-sm text-text-secondary mb-5">Contamos con los mejores técnicos y repuestos originales.</p>
                  <Link
                    to={`/agendar-cita?service=${service.id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-interactive-accent px-6 py-3.5 text-sm font-bold text-black hover:bg-interactive-accent-hover transition-all duration-300 shadow-elevation-2"
                  >
                    Agendar servicio ahora
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
