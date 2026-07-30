import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SEO } from "@/components/SEO";
import { api } from "@/api/client";
import IconRenderer from "@/components/icons/IconRenderer";
import { BrandLogo } from "@/components/BrandLogo";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BeforeAfterSlider } from "@/features/home/sections/BeforeAfterSlider";
import { useCMS } from "@/providers/CMSProvider";
import { useMoto } from "@/providers/MotoProvider";
import { useAuth } from "@/providers/AuthProvider";
import { Bike } from "lucide-react";

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

export default function Home() {
  const { services, testimonials, brands: globalBrands, heroSlides: globalHero, faqs } = useCMS();
  const { user } = useAuth();
  const { activeVehicle } = useMoto();
  const brands = globalBrands;
  const [garageBays, setGarageBays] = useState<any[]>([]);
  const [processSteps, setProcessSteps] = useState<any[]>([]);
  const [trustItems, setTrustItems] = useState<any[]>([]);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [heroIdx, setHeroIdx] = useState(0);
  const defaultHeroImages = [
    "https://images.unsplash.com/photo-1616712134411-6b6ae89bc3ba?w=1600&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&q=80",
    "https://images.unsplash.com/photo-1569519889055-e8a4e0c04121?w=1600&q=80",
  ];
  const heroImages = globalHero.length > 0
    ? globalHero.map(s => s.image).filter(Boolean)
    : defaultHeroImages;
  const heroData = globalHero.length > 0 ? globalHero[heroIdx] : null;
  const testimonialRef = useRef<HTMLDivElement>(null);
  const brandsRef = useRef<HTMLDivElement>(null);
  const brandsTrackRef = useRef<HTMLDivElement>(null);
  const brandsAnimRef = useRef<number>(0);
  const brandsPosRef = useRef(0);
  const [brandsPaused, setBrandsPaused] = useState(false);
  const scrollTestimonials = (dir: number) => {
    if (!testimonialRef.current) return;
    testimonialRef.current.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  useEffect(() => {
    const track = brandsTrackRef.current;
    if (!track) return;
    let lastTime = performance.now();
    const speed = 40;

    const animate = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      if (!brandsPaused) {
        brandsPosRef.current -= speed * delta;
        const halfWidth = track.scrollWidth / 2;
        if (Math.abs(brandsPosRef.current) >= halfWidth) {
          brandsPosRef.current += halfWidth;
        }
        track.style.transform = `translateX(${brandsPosRef.current}px)`;
      }
      brandsAnimRef.current = requestAnimationFrame(animate);
    };
    brandsAnimRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(brandsAnimRef.current);
  }, [brandsPaused]);

  const scrollBrands = (dir: "left" | "right") => {
    setBrandsPaused(true);
    const amount = dir === "left" ? 250 : -250;
    brandsPosRef.current += amount;
    if (brandsTrackRef.current) {
      brandsTrackRef.current.style.transform = `translateX(${brandsPosRef.current}px)`;
    }
    setTimeout(() => setBrandsPaused(false), 2500);
  };

  useEffect(() => {
    Promise.all([
      api.get("/garage-bays").catch(() => []),
      api.get("/process-steps").catch(() => []),
      api.get("/trust-items?page=home").catch(() => []),
    ]).then(([bayData, stepData, trustData]) => {
      if (Array.isArray(bayData) && bayData.length > 0) setGarageBays(bayData);
      if (Array.isArray(stepData) && stepData.length > 0) setProcessSteps(stepData);
      if (Array.isArray(trustData) && trustData.length > 0) setTrustItems(trustData);
    });
  }, []);

  useEffect(() => {
    const total = heroImages.length || 1;
    const t = setInterval(() => setHeroIdx((p) => (p + 1) % total), 5000);
    return () => clearInterval(t);
  }, [heroImages.length]);

  return (
    <>
      <SEO title="Inicio" description="MotoPro - Taller especializado en mantenimiento, reparación y personalización de motocicletas." />
      <main className="pt-16">

        {/* ── 1. Hero with Slideshow ── */}
        <section className="relative py-20 lg:py-28 bg-surface-primary overflow-hidden min-h-[400px] flex items-center">
          <div className="absolute inset-0">
            <AnimatePresence mode="wait">
              <motion.img
                key={heroIdx}
                src={heroImages[heroIdx % heroImages.length]}
                alt=""
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/80" />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <motion.div key={heroIdx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 border border-interactive-accent/30 text-interactive-accent text-xs font-semibold px-4 py-2 rounded-full mb-6 bg-black/40 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 bg-interactive-accent rounded-full animate-pulse" />
                {heroData?.subtitle || "Taller mecánico de alto rendimiento"}
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-tight">
                {heroData?.title ? (
                  <>
                    {heroData.title.split(" ").slice(0, 2).join(" ")}{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-interactive-accent to-orange-400">
                      {heroData.title.split(" ").slice(2).join(" ") || "potencia"}
                    </span>
                  </>
                ) : (
                  <>Potencia tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-interactive-accent to-orange-400">máquina</span></>
                )}
              </h1>
              <p className="mt-6 text-base text-white/70 leading-relaxed max-w-lg mx-auto">
                {heroData?.description || "Diagnóstico, reparación y preparación de motocicletas. 15 años haciendo que cada motor rinda al máximo."}
              </p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <Link to={heroData?.cta_link || "/agendar-cita"}
                  className="rounded-lg bg-interactive-accent px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-interactive-accent/30 hover:shadow-interactive-accent/50 hover:brightness-110 transition-all">
                  {heroData?.cta_text || "Agendar servicio"}
                </Link>
                <Link to="/servicios"
                  className="rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 transition-all">
                  Ver servicios
                </Link>
              </div>
            </motion.div>
          </div>
          {/* Hero Navigation Dots */}
          {heroImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {heroImages.map((_: string, i: number) => (
                <button key={i} onClick={() => setHeroIdx(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === heroIdx ? "bg-interactive-accent w-6" : "bg-white/40 hover:bg-white/60"}`} />
              ))}
            </div>
          )}
        </section>

        {/* ── 2. ¿Qué necesitas hoy? ── */}
        <section className="py-12 bg-surface-primary border-b border-border-subtle">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-text-primary">¿Qué necesitas hoy?</h2>
              <p className="text-sm text-text-secondary mt-2">Encuentra lo que buscas en segundos</p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-4">
              <Link to="/agendar-cita"
                className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-secondary p-6 hover:border-interactive-accent/30 hover:bg-surface-tertiary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-interactive-accent/10 text-interactive-accent group-hover:scale-110 transition-transform shrink-0">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-heading font-bold text-text-primary">Agendar servicio</h3>
                    <p className="text-xs text-text-secondary mt-0.5">Agenda tu cita en el taller</p>
                  </div>
                  <svg className="w-5 h-5 text-interactive-accent -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </div>
              </Link>
              <Link to="/tienda"
                className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-secondary p-6 hover:border-interactive-accent/30 hover:bg-surface-tertiary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-interactive-accent/10 text-interactive-accent group-hover:scale-110 transition-transform shrink-0">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-heading font-bold text-text-primary">Comprar repuestos</h3>
                    <p className="text-xs text-text-secondary mt-0.5">Encuentra la pieza que necesitas</p>
                  </div>
                  <svg className="w-5 h-5 text-interactive-accent -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </div>
              </Link>
              <Link to="/estado-servicio"
                className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-secondary p-6 hover:border-interactive-accent/30 hover:bg-surface-tertiary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-interactive-accent/10 text-interactive-accent group-hover:scale-110 transition-transform shrink-0">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-heading font-bold text-text-primary">Consultar estado</h3>
                    <p className="text-xs text-text-secondary mt-0.5">Sigue tu reparación en vivo</p>
                  </div>
                  <svg className="w-5 h-5 text-interactive-accent -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ── 3. Tu Moto ── */}
        {user && activeVehicle && (
        <section className="py-8 bg-surface-primary border-b border-border-subtle">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-gradient-to-r from-interactive-accent/5 to-surface-secondary border border-border rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-interactive-accent/20 flex items-center justify-center shrink-0">
                  <Bike className="w-6 h-6 text-interactive-accent" />
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">Tu moto</p>
                  <p className="text-sm font-bold text-text-primary">{activeVehicle.brand} {activeVehicle.model} {activeVehicle.plate ? `· ${activeVehicle.plate}` : ""}</p>
                </div>
              </div>
              <Link to="/mi-moto"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-interactive-accent px-4 py-2.5 text-xs font-bold text-black hover:bg-interactive-accent-hover transition-all">
                Ir a Mi Moto
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </section>
        )}

        {/* ── 4. Quick Benefits Bar ── */}
        {trustItems.length > 0 && (
        <section className="py-8 bg-surface-primary border-b border-border-subtle">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {trustItems.map((b, i) => (
                <motion.div key={b.id || i}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                  className="flex flex-col items-center text-center p-4 rounded-xl bg-surface-secondary border border-border-subtle hover:border-interactive-accent/30 transition-all"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-interactive-accent/10 text-interactive-accent mb-2">
                    <IconRenderer name={b.icon || "shield"} size={20} />
                  </div>
                  <p className="text-xs font-bold text-text-primary">{b.title || b.label}</p>
                  <p className="text-[10px] text-text-tertiary mt-0.5">{b.description || b.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* ── 5. Servicios — Mechanical Spec Sheet ── */}
        <section className="py-20 bg-surface-secondary">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="text-[10px] font-bold text-interactive-accent uppercase tracking-[0.2em]">Catálogo de servicios</motion.span>
              <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                className="mt-4 text-3xl md:text-4xl font-heading font-bold text-text-primary">
                Ficha técnica de servicios
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
                className="mt-4 text-sm text-text-secondary">
                Mantenimiento, reparación y preparación profesional.
              </motion.p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {services.slice(0, 3).map((svc: any, i: number) => {
                const specData = [
                  ["COMPATIBLE", svc.brand || "Multimarca"],
                  ["TIEMPO", svc.duration || "60 min"],
                  ["ESTADO", svc.available !== false ? "DISPONIBLE" : "EN ESPERA"],
                ];
                return (
                <motion.div key={svc.id || i}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="rounded-lg border border-border bg-surface-primary overflow-hidden transition-all hover:border-interactive-accent/30 hover:shadow-lg hover:shadow-interactive-accent/10"
                >
                  <div className="relative h-40 overflow-hidden" style={{background: "linear-gradient(135deg, var(--surface-primary), var(--surface-secondary), var(--surface-primary))"}}>
                    <div className="absolute inset-0 opacity-[0.08" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FF6B00' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}} />
                    <div className="relative z-10 p-5">
                      <div className="text-[10px] font-mono font-bold text-interactive-accent tracking-widest mb-1">
                        SERVICE {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="w-full h-px bg-interactive-accent/30 mb-3" />
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-interactive-accent/10 text-interactive-accent">
                          <IconRenderer name={svc.icon || "settings"} size={20} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-base font-heading font-bold text-white leading-tight">
                          {svc.title || svc.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="space-y-2 mb-5">
                      {specData.map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between text-xs">
                          <span className="text-text-tertiary font-mono tracking-wider">{label}</span>
                          <span className={`font-semibold font-mono ${value === "DISPONIBLE" ? "text-technical" : "text-text-primary"}`}>{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="w-full h-px bg-border mb-4" />
                    <p className="text-xs text-text-secondary leading-relaxed mb-4 line-clamp-2">
                      {svc.description}
                    </p>
                    <Link to="/agendar-cita"
                      className="inline-flex items-center justify-center gap-2 w-full rounded-lg bg-interactive-accent px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-interactive-accent/25 hover:shadow-interactive-accent/40 transition-all">
                      AGENDAR SERVICIO
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                  </div>
                </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 6. Antes y Después ── */}
        <section className="py-20 bg-surface-primary">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[10px] font-bold text-interactive-accent uppercase tracking-[0.2em]">Before & After</span>
              <h2 className="mt-4 text-3xl md:text-4xl font-heading font-bold text-text-primary">
                Resultados que hablan solos
              </h2>
            </div>
            <div className="max-w-3xl mx-auto">
              <BeforeAfterSlider
                before="https://images.unsplash.com/photo-1607853554431-006187c0dc5a?w=800&q=80"
                after="https://images.unsplash.com/photo-1616712134411-6b6ae89bc3ba?w=800&q=80"
              />
            </div>
          </div>
        </section>

        {/* ── 7. Inside The Garage ── */}
        {garageBays.length > 0 && (
        <section className="py-20 bg-surface-secondary overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-12">
            <div className="flex items-end justify-between">
              <div>
                <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="text-[10px] font-bold text-interactive-accent uppercase tracking-[0.2em]">Inside The Garage</motion.span>
                <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                  className="mt-3 text-3xl md:text-4xl font-heading font-bold text-text-primary">
                  Donde tu moto cobra vida
                </motion.h2>
              </div>
              <div className="hidden md:flex items-center gap-2 text-xs text-text-tertiary">
                <span className="inline-block w-2 h-2 rounded-full bg-interactive-accent animate-pulse" />
                EXPLORAR
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="flex gap-6 overflow-x-auto pb-6 px-6 lg:px-8 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: "none" }}>
              {garageBays.map((bay: any, i: number) => {
                const specs = typeof bay.services === "string" ? JSON.parse(bay.services) : Array.isArray(bay.services) ? bay.services : [];
                return (
                <motion.div key={bay.id || i}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="min-w-[380px] max-w-[380px] shrink-0 snap-start relative group"
                >
                  <div className="rounded-lg overflow-hidden border border-border bg-surface-primary">
                    <div className="relative h-52 overflow-hidden">
                      <motion.img
                        src={bay.image || "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80"}
                        alt={bay.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-mono font-bold text-interactive-accent bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
                          BAY {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-base font-heading font-bold text-white">{bay.title}</h3>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-text-secondary leading-relaxed mb-3">{bay.description || bay.subtitle}</p>
                      {specs.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {specs.map((spec: string, si: number) => (
                          <span key={si} className="text-[9px] font-mono font-semibold text-technical bg-technical/10 px-2 py-0.5 rounded">
                            {spec}
                          </span>
                        ))}
                      </div>
                      )}
                    </div>
                  </div>
                </motion.div>
                );
              })}
            </div>
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-surface-secondary to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-surface-secondary to-transparent pointer-events-none" />
          </div>
        </section>
        )}

        {/* ── 8. Repair Process Timeline ── */}
        {processSteps.length > 0 && (
        <section className="py-20 bg-surface-primary">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="text-[10px] font-bold text-interactive-accent uppercase tracking-[0.2em]">Proceso de reparación</motion.span>
              <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                className="mt-4 text-3xl md:text-4xl font-heading font-bold text-text-primary">
                De la entrada a la entrega
              </motion.h2>
            </div>
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute left-[23px] top-0 bottom-0 w-px bg-border hidden md:block" />
              {processSteps.map((p, i) => (
                <motion.div key={p.id || i}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="relative flex items-start gap-5 pb-10 last:pb-0"
                >
                  <div className="hidden md:flex flex-col items-center">
                    <div className="w-[46px] h-[46px] rounded-full border-2 border-interactive-accent bg-surface-primary flex items-center justify-center relative z-10">
                      <span className="text-xs font-mono font-bold text-interactive-accent">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                  </div>
                  <div className="flex-1 rounded-lg border border-border bg-surface-secondary p-5 hover:border-interactive-accent/20 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="md:hidden text-[10px] font-mono font-bold text-interactive-accent bg-interactive-accent/10 px-2 py-0.5 rounded">{String(i + 1).padStart(2, "0")}</span>
                      <h3 className="text-base font-heading font-bold text-text-primary">{p.title}</h3>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{p.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* ── 9. Stats ── */}
        <section className="py-16 bg-surface-primary border-y border-border-subtle">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {[
                { value: "15+", label: "Años de experiencia" },
                { value: "12K+", label: "Motos reparadas" },
                { value: "98%", label: "Clientes satisfechos" },
                { value: "5+", label: "Técnicos certificados" },
                { value: "24/7", label: "Soporte disponible" },
              ].map((stat, i) => (
                <motion.div key={stat.label}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="text-center"
                >
                  <p className="text-2xl md:text-3xl font-heading font-bold text-interactive-accent">{stat.value}</p>
                  <p className="text-xs text-text-tertiary mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 10. Testimonios ── */}
        <section className="py-20 bg-surface-primary">
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
              <button onClick={() => scrollTestimonials(-1)} aria-label="Testimonio anterior"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-primary text-text-secondary hover:text-text-primary hover:border-interactive-accent/30 transition-all">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => scrollTestimonials(1)} aria-label="Testimonio siguiente"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-primary text-text-secondary hover:text-text-primary hover:border-interactive-accent/30 transition-all">
                <ChevronRight size={20} />
              </button>
              <div ref={testimonialRef} className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: "none" }}>
                {testimonials.map((t: any) => (
                  <div key={t.id || t.name} className="min-w-[280px] max-w-[300px] shrink-0 rounded-lg border border-border-subtle bg-surface-secondary p-5">
                    <svg className="w-6 h-6 text-interactive-accent/30 mb-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" />
                    </svg>
                    <p className="text-sm text-text-secondary leading-relaxed mb-4">"{t.content || ""}"</p>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-interactive-accent text-xs font-bold text-white">{(t.name || "").charAt(0)}</div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                        <p className="text-xs text-text-tertiary">{t.bike || t.role || ""}</p>
                      </div>
                    </div>
                    <StarRating rating={t.rating || 5} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 11. FAQ ── */}
        <section className="py-20 bg-surface-secondary">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="text-[10px] font-bold text-interactive-accent uppercase tracking-[0.2em]">FAQ</motion.span>
              <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                className="mt-4 text-3xl md:text-4xl font-heading font-bold text-text-primary">
                Preguntas frecuentes
              </motion.h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq: any, i: number) => (
                <div key={i} className="border border-border-subtle rounded-xl overflow-hidden bg-surface-primary">
                  <button onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-surface-tertiary/50">
                    <span className="text-sm font-semibold text-text-primary pr-4">{faq.question}</span>
                    <svg className={`w-5 h-5 shrink-0 text-text-tertiary transition-transform ${openFAQ === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  <AnimatePresence>
                    {openFAQ === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                        className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 12. CTA Final ── */}
        <section className="relative py-24 overflow-hidden bg-surface-primary">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1600&q=80" alt="" loading="lazy" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-xl">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-white leading-tight">
                  ¿Listo para darle a tu{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-interactive-accent to-orange-400">moto</span>{" "}
                  el cuidado que merece?
                </h2>
                <p className="mt-4 text-sm text-white/70">Agenda tu servicio hoy y descubre por qué los motociclistas confían en MotoPro.</p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link to="/agendar-cita"
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-interactive-accent-hover to-interactive-accent px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-interactive-accent/25 hover:shadow-interactive-accent/40 transition-all">
                    Agendar servicio
                  </Link>
                  <Link to="/contacto"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-all">
                    Contactar
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── 13. Marcas ── */}
        <section className="py-12 bg-surface-primary overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-8">
            <p className="text-[10px] font-bold text-text-tertiary text-center uppercase tracking-[0.2em]">Trabajamos con las mejores marcas</p>
          </div>
          <div ref={brandsRef} className="relative group" onMouseEnter={() => setBrandsPaused(true)} onMouseLeave={() => setBrandsPaused(false)}>
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-surface-primary to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-surface-primary to-transparent z-10 pointer-events-none" />
            <div className="overflow-hidden">
              <div ref={brandsTrackRef} className="flex gap-14 items-center w-max">
                {[...brands, ...brands].map((brand: any, i: number) => (
                  <BrandLogo key={i} name={brand.name} image={brand.image} size="sm" showName={false} className="!px-0 !py-0 !border-0 !bg-transparent hover:!bg-transparent opacity-70 hover:opacity-100 transition-opacity" />
                ))}
              </div>
            </div>
            <button onClick={() => scrollBrands("left")} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-surface-secondary/90 backdrop-blur-sm border border-border text-text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-interactive-accent hover:text-white hover:border-interactive-accent shadow-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            <button onClick={() => scrollBrands("right")} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-surface-secondary/90 backdrop-blur-sm border border-border text-text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-interactive-accent hover:text-white hover:border-interactive-accent shadow-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
