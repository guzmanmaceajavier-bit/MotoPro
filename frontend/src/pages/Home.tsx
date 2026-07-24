import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { SEO } from "@/components/SEO";
import { api } from "@/api/client";
import IconRenderer from "@/components/icons/IconRenderer";

const heroImages = [
  "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1600&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&q=80",
  "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1600&q=80",
  "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1600&q=80",
];

const defaultBrands = [
  "Yamaha", "Honda", "Kawasaki", "Suzuki", "BMW", "KTM", "Ducati", "Triumph",
  "Aprilia", "Harley-Davidson", "Royal Enfield", "Benelli", "MV Agusta",
];

const serviceIcons = [
  "M11.42 15.17l2.05-2.05m0 0l2.05-2.05m-2.05 2.05l-2.05-2.05m2.05 2.05l2.05 2.05m-6.17-2.05L16.5 3.75 12 8.25m-5.17 8.5l-1.25 5.25 5.25-1.25L20.25 5.25 18 3l-12.5 12.5z",
  "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5",
  "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z",
];

const defaultServices = [
  { id: 1, title: "Reparación de Motores", description: "Diagnóstico y reparación de motores 2T y 4T con garantía.", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&q=80" },
  { id: 2, title: "Electrónica Avanzada", description: "Centralitas, inyectores, sensores y sistemas de encendido.", image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&q=80" },
  { id: 3, title: "Personalización", description: "Modificaciones estéticas y de rendimiento.", image: "https://images.unsplash.com/photo-1558980664-6f2343f08f18?w=600&q=80" },
];

const defaultTestimonials = [
  { id: 1, name: "Carlos Méndez", content: "Llevo mi moto con ellos desde hace 2 años. Siempre impecables.", bike: "Kawasaki Z900", rating: 5 },
  { id: 2, name: "Ana Lucía Ríos", content: "Me salvaron un viaje. Diagnóstico rápido y preciso.", bike: "Yamaha MT-07", rating: 5 },
  { id: 3, name: "Miguel Ángel Soto", content: "La preparación fue exactamente lo que necesitaba.", bike: "Yamaha R6", rating: 5 },
  { id: 4, name: "Laura Castillo", content: "El mejor taller. Explican todo con detalle.", bike: "Honda CB500X", rating: 5 },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < rating ? "currentColor" : "none"} stroke={i < rating ? "currentColor" : "var(--text-tertiary)"} strokeWidth="2" className={i < rating ? "text-amber-400" : ""}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ name, text, rating, bike }: { name: string; text: string; rating: number; bike: string }) {
  return (
    <div className="min-w-[280px] max-w-[300px] shrink-0 rounded-lg border border-border-subtle bg-surface-secondary p-5">
      <svg className="w-6 h-6 text-interactive-accent/30 mb-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" />
      </svg>
      <p className="text-sm text-text-secondary leading-relaxed mb-4">"{text}"</p>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-interactive-accent text-xs font-bold text-white">{name.charAt(0)}</div>
        <div>
          <p className="text-sm font-semibold text-text-primary">{name}</p>
          <p className="text-xs text-text-tertiary">{bike}</p>
        </div>
      </div>
      <StarRating rating={rating} />
    </div>
  );
}

export default function Home() {
  const [services, setServices] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [brands, setBrands] = useState<{name: string, image?: string}[]>(defaultBrands.map(name => ({ name })));
  const [heroIdx, setHeroIdx] = useState(0);
  const [stats, setStats] = useState({ motos: "1,250", marcas: "13", rating: "4.9" });
  const testimonialRef = useRef<HTMLDivElement>(null);
  const scrollTestimonials = (dir: number) => {
    if (!testimonialRef.current) return;
    testimonialRef.current.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  useEffect(() => {
    Promise.all([
      api.get("/services").catch(() => []),
      api.get("/testimonials").catch(() => []),
      api.get("/brands").catch(() => []),
      api.get("/cms/homepage/stats").catch(() => null),
    ]).then(([svcData, testData, brandData, statsData]) => {
      setServices(Array.isArray(svcData) && svcData.length > 0 ? svcData : defaultServices);
      setTestimonials(Array.isArray(testData) && testData.length > 0 ? testData : defaultTestimonials);
      if (Array.isArray(brandData) && brandData.length > 0) {
        setBrands(brandData.map((b: any) => ({ name: b.name, image: b.image })));
      }
      if (statsData?.settings_json) {
        try {
          const s = JSON.parse(statsData.settings_json);
          setStats(prev => ({ ...prev, ...s }));
        } catch {}
      }
    });
  }, []);

  useEffect(() => { const t = setInterval(() => setHeroIdx((p) => (p + 1) % heroImages.length), 3000); return () => clearInterval(t); }, []);

  const displayedServices = services.length > 0 ? services : defaultServices;
  const displayedTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials;

  return (
    <>
      <SEO title="Inicio" description="MotoPro - Taller especializado en mantenimiento, reparación y personalización de motocicletas." />
      <Navbar />
      <main className="pt-16">

        {/* ── Hero ── */}
        <section className="relative h-[60vh] min-h-[450px] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img key={heroIdx} src={heroImages[heroIdx]} alt="Moto" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-16 w-full">
            <div className="max-w-2xl">
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-text-primary leading-tight"
              >
                El cuidado que tu{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-interactive-accent to-emerald-400">moto merece</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-5 text-base text-text-secondary leading-relaxed max-w-lg"
              >
                Mantenimiento de precisión, personalización sin límites y diagnóstico avanzado para tu motocicleta. Expertos en todas las marcas.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-8 flex flex-wrap gap-4"
              >
                <Link to="/agendar-cita"
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-interactive-accent-hover to-interactive-accent px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-interactive-accent/25 hover:shadow-interactive-accent/40 transition-all active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  Agendar Servicio
                </Link>
                <Link to="/tienda"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-secondary/80 backdrop-blur-sm px-7 py-3.5 text-sm font-semibold text-text-primary hover:border-interactive-accent/40 transition-all active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349" />
                  </svg>
                  Explorar Tienda
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Stats + Features ── */}
        <section className="py-16 bg-surface-primary border-y border-border-subtle">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "search", label: "Diagnóstico Avanzado", desc: "Tecnología de precisión para tu moto" },
                { icon: "package", label: "Repuestos Originales", desc: "Partes certificadas y garantizadas" },
                { icon: "shield", label: "Garantía Certificada", desc: "Trabajo respaldado con garantía" },
              ].map((feat, i) => (
                <motion.div key={feat.label}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 rounded-xl border border-border-subtle bg-surface-secondary p-5 hover:border-interactive-accent/30 transition-all"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-interactive-accent/10 text-interactive-accent">
                    <IconRenderer name={feat.icon} size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{feat.label}</p>
                    <p className="text-xs text-text-tertiary mt-1">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-surface-secondary border border-border-subtle">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-interactive-accent/10 text-interactive-accent">
                    <IconRenderer name="user" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-heading font-bold text-text-primary">+{stats.motos}</p>
                    <p className="text-sm text-text-secondary">Motos atendidas con excelencia</p>
                  </div>
                </div>
                <div className="w-full bg-surface-tertiary rounded-full h-2">
                  <div className="bg-interactive-accent h-2 rounded-full" style={{ width: "98%" }} />
                </div>
                <p className="text-xs text-text-tertiary mt-2">Clientes satisfechos <span className="text-interactive-accent font-semibold">98%</span></p>
              </div>
              <div className="p-6 rounded-xl bg-surface-secondary border border-border-subtle">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-interactive-accent/10 text-interactive-accent">
                    <IconRenderer name="award" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-heading font-bold text-text-primary">{stats.marcas}+</p>
                    <p className="text-sm text-text-secondary">Marcas certificadas</p>
                  </div>
                </div>
                <div className="w-full bg-surface-tertiary rounded-full h-2">
                  <div className="bg-interactive-accent h-2 rounded-full" style={{ width: "100%" }} />
                </div>
                <p className="text-xs text-text-tertiary mt-2">Cobertura garantizada <span className="text-interactive-accent font-semibold">100%</span></p>
              </div>
              <div className="p-6 rounded-xl bg-surface-secondary border border-border-subtle">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-interactive-accent/10 text-interactive-accent">
                    <IconRenderer name="star" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-heading font-bold text-text-primary">{stats.rating}</p>
                    <p className="text-sm text-text-secondary">Calificación en Google</p>
                  </div>
                </div>
                <div className="w-full bg-surface-tertiary rounded-full h-2">
                  <div className="bg-interactive-accent h-2 rounded-full" style={{ width: "99%" }} />
                </div>
                <p className="text-xs text-text-tertiary mt-2">Recomendado por nuestros clientes <span className="text-interactive-accent font-semibold">99%</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Brands ── */}
        <section className="py-12 bg-surface-primary">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <p className="text-[10px] font-bold text-text-tertiary text-center uppercase tracking-[0.2em] mb-8">Trabajamos con las mejores marcas</p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {brands.map((brand) => (
                <div key={brand.name} className="flex items-center gap-2 text-text-tertiary hover:text-text-primary transition-colors">
                  {brand.image ? (
                    <img src={brand.image} alt={brand.name} className="h-10 w-auto object-contain" />
                  ) : (
                    <span className="text-sm font-heading font-semibold">{brand.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services ── */}
        <section className="py-24 bg-surface-secondary">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="text-[10px] font-bold text-interactive-accent uppercase tracking-[0.2em]">Servicios</motion.span>
              <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                className="mt-4 text-3xl md:text-4xl font-heading font-bold text-text-primary">
                Todo para tu moto, en un solo lugar
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
                className="mt-4 text-sm text-text-secondary">
                Desde el mantenimiento básico hasta la personalización más exigente.
              </motion.p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {displayedServices.slice(0, 3).map((svc: any, i: number) => (
                <motion.div key={svc.id || i}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="group rounded-lg border border-border-subtle bg-surface-primary overflow-hidden transition-all hover:border-interactive-accent/20 hover:shadow-lg hover:shadow-interactive-accent/5 hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img src={svc.image || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&q=80"} alt={svc.title || svc.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute -bottom-4 left-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-interactive-accent shadow-lg shadow-interactive-accent/25 text-white">
                        <IconRenderer name={svc.icon || "wrench"} size={24} />
                      </div>
                    </div>
                  </div>
                  <div className="p-5 pt-8">
                    <h3 className="text-base font-heading font-bold text-text-primary mb-2">{svc.title || svc.name}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed mb-4">{svc.description}</p>
                    <Link to="/agendar-cita"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-interactive-accent hover:text-interactive-accent-hover transition-colors">
                      Agendar
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="py-24 bg-surface-primary">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="text-[10px] font-bold text-interactive-accent uppercase tracking-[0.2em]">Testimonios</motion.span>
              <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                className="mt-4 text-3xl md:text-4xl font-heading font-bold text-text-primary">
                Lo que dicen nuestros clientes
              </motion.h2>
            </div>
            <div className="relative">
              <button onClick={() => scrollTestimonials(-1)}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-primary text-text-secondary hover:text-text-primary hover:border-interactive-accent/30 transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button onClick={() => scrollTestimonials(1)}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-primary text-text-secondary hover:text-text-primary hover:border-interactive-accent/30 transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
              <div ref={testimonialRef} className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: "none" }}>
                {displayedTestimonials.map((t: any) => (
                  <TestimonialCard key={t.id || t.name} name={t.name} text={t.content || ""} rating={t.rating || 5} bike={t.role || t.bike || ""} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Final ── */}
        <section className="relative py-28 overflow-hidden bg-surface-primary">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1600&q=80" alt="" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-xl">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary leading-tight">
                  ¿Listo para darle a tu{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-interactive-accent to-emerald-400">moto</span>{" "}
                  el{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-interactive-accent to-emerald-400">cuidado</span>{" "}
                  que merece?
                </h2>
                <p className="mt-4 text-sm text-text-secondary">Agenda tu servicio hoy y descubre por qué los motociclistas confían en MotoPro.</p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link to="/agendar-cita"
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-interactive-accent-hover to-interactive-accent px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-interactive-accent/25 hover:shadow-interactive-accent/40 transition-all">
                    Agendar Ahora
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </Link>
                  <Link to="/contacto"
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-secondary/80 backdrop-blur-sm px-6 py-3.5 text-sm font-semibold text-text-primary hover:border-interactive-accent/40 transition-all">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Contactar
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer /><BackToTop /><WhatsAppFloat />
    </>
  );
}
