import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { api } from "@/api/client";
import IconRenderer from "@/components/icons/IconRenderer";

export default function ServicioDetail() {
  const { id } = useParams();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.get(`/services/${id}`).then((data) => setService(data || null)).catch(() => setService(null)).finally(() => setLoading(false));
    }
  }, [id]);

  const features: string[] = (() => {
    try {
      const f = service?.features;
      if (Array.isArray(f)) return f;
      if (typeof f === "string") return JSON.parse(f);
      return ["Diagnóstico gratuito", "Repuestos originales", "Garantía por escrito",
        "Entrega a tiempo", "Reporte detallado", "Limpieza incluida"];
    } catch { return []; }
  })();

  if (loading) {
    return (
      <>
        <SEO title="Servicios" />
        <Navbar />
        <main className="pt-20 bg-surface-primary min-h-screen">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <div className="space-y-6">
              <div className="h-8 w-64 bg-surface-tertiary rounded-lg animate-pulse mx-auto" />
              <div className="h-4 w-96 bg-surface-tertiary rounded animate-pulse mx-auto" />
              <div className="h-64 w-full bg-surface-tertiary rounded-2xl animate-pulse" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!service) {
    return (
      <>
        <SEO title="Servicio no encontrado" />
        <Navbar />
        <main className="pt-20 bg-surface-primary min-h-screen flex items-center justify-center">
          <div className="text-center">
            <IconRenderer name="wrench" size={64} className="mx-auto text-text-tertiary mb-4" />
            <h1 className="text-2xl font-bold text-text-primary">Servicio no encontrado</h1>
            <Link to="/servicios" className="mt-4 inline-block text-interactive-accent hover:underline">Ver todos los servicios</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO title={service.title} description={service.description} />
      <Navbar />
      <main className="bg-surface-primary min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-text-tertiary mb-8">
            <Link to="/" className="hover:text-interactive-accent transition-colors">Inicio</Link>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <Link to="/servicios" className="hover:text-interactive-accent transition-colors">Servicios</Link>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-text-primary">{service.title}</span>
          </div>

          <div className="grid lg:grid-cols-5 gap-10">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-interactive-accent/10 text-interactive-accent">
                    <IconRenderer name={service.icon || "wrench"} size={32} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-interactive-accent uppercase tracking-widest">Servicio</span>
                    <h1 className="text-3xl md:text-4xl font-bold text-text-primary mt-1">{service.title}</h1>
                  </div>
                </div>
                <p className="text-text-secondary leading-relaxed">{service.description}</p>
              </motion.div>

              {service.icon && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="rounded-2xl overflow-hidden bg-surface-secondary flex items-center justify-center h-72"
              >
                <IconRenderer name={service.icon || "wrench"} size={96} className="text-interactive-accent opacity-30" />
              </motion.div>
              )}

              {/* What includes */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="text-xl font-bold text-text-primary mb-4">¿Qué incluye?</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {features.map((f: string) => (
                    <div key={f} className="flex items-center gap-3 rounded-lg border border-border bg-surface-secondary p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-interactive-accent/10">
                        <svg className="h-5 w-5 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <span className="text-sm text-text-primary">{f}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Related */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="text-xl font-bold text-text-primary mb-4">Servicios relacionados</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {relatedServices.map((rs, i) => (
                    <Link key={rs.id} to={`/servicios/${rs.id}`}
                      className="group rounded-lg border border-border bg-surface-secondary overflow-hidden hover:border-border-accent transition-all"
                    >
                      <div className="h-32 overflow-hidden">
                        <img src={rs.image} alt={rs.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-bold text-text-primary group-hover:text-interactive-accent transition-colors">{rs.title}</h3>
                        <p className="text-xs text-text-tertiary mt-1">{rs.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
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
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                      </svg>
                      <div>
                        <p className="text-sm text-text-secondary">Garantía</p>
                        <p className="text-sm font-semibold text-text-primary">Respaldamos nuestro trabajo</p>
                      </div>
                    </div>
                  </div>

                  <Link to="/solicitar-servicio"
                    className="mt-6 flex items-center justify-center gap-2 w-full rounded-lg bg-gradient-to-r bg-interactive-accent py-3.5 font-semibold text-black hover:bg-interactive-accent-hover transition-all shadow-elevation-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    Solicitar este servicio
                  </Link>
                </div>

                {/* Contact */}
                <div className="bg-surface-secondary border border-border rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-text-primary mb-4">¿Tienes dudas?</h3>
                  <p className="text-xs text-text-secondary mb-4">Contáctanos y resolveremos tus preguntas sobre este servicio.</p>
                  <Link to="/contacto"
                    className="flex items-center justify-center gap-2 w-full rounded-lg border border-interactive-accent py-3 text-sm font-semibold text-interactive-accent hover:bg-interactive-accent/10 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    Contactar
                  </Link>
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
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BackToTop />
      <WhatsAppFloat />
    </>
  );
}
