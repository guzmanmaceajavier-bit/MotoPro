import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/api/client";
import { useCMS } from "@/providers/CMSProvider";

interface HeroSlide {
  image: string; title: string; subtitle: string; description: string;
  cta_text: string; cta_link: string;
}

const fallbackSlides: HeroSlide[] = [
  { image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&q=80", title: "Expertos en motocicletas", subtitle: "", description: "", cta_text: "Agendar Servicio", cta_link: "/solicitar-servicio" },
  { image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1600&q=80", title: "Repuestos originales", subtitle: "", description: "", cta_text: "Ver Tienda", cta_link: "/tienda" },
  { image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1600&q=80", title: "Diagnóstico profesional", subtitle: "", description: "", cta_text: "Agendar Servicio", cta_link: "/solicitar-servicio" },
  { image: "https://images.unsplash.com/photo-1626668893632-6f3a4466d22d?w=1600&q=80", title: "Personalización única", subtitle: "", description: "", cta_text: "Ver Tienda", cta_link: "/tienda" },
];

const STAT_ICONS = {
  star: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
  users: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  package: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z",
  flag: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  shield: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

export function HeroSection() {
  const { getSection, config } = useCMS();
  const heroSection = getSection("hero");
  const heroTitle = heroSection?.title || "Cuidamos tu moto<br/>como si fuera nuestra";
  const heroDesc = heroSection?.description || "Especialistas en mantenimiento, reparación y venta de repuestos originales para todas las marcas. Más de 10 años cuidando tu moto.";
  const cta1Text = heroSection?.button_text || "Agendar Servicio";
  const cta1Link = heroSection?.button_link || "/solicitar-servicio";
  let cta2Text = "Ver Tienda";
  let cta2Link = "/tienda";
  try {
    const s = heroSection?.settings_json ? JSON.parse(heroSection.settings_json) : {};
    if (s.cta2_text) cta2Text = s.cta2_text;
    if (s.cta2_link) cta2Link = s.cta2_link;
  } catch (_) {}

  const [slides, setSlides] = useState<HeroSlide[]>(fallbackSlides);
  const [current, setCurrent] = useState(0);
  const [liveStats, setLiveStats] = useState({ products: 0, brands: 0, reviews: 0, testimonials: 0 });

  useEffect(() => {
    fetch("/api/hero")
      .then((r) => r.json())
      .then((res) => {
        const data = res.data || res;
        if (Array.isArray(data) && data.length > 0) {
          const merged = data.map((s: HeroSlide, i: number) => ({
            ...s,
            image: s.image || fallbackSlides[i % fallbackSlides.length]?.image || "",
          }));
          setSlides(merged);
        }
      })
      .catch(() => {});
    Promise.all([
      api.get("/products").then((r) => Array.isArray(r) ? r.length : r?.data?.length || 0).catch(() => 0),
      api.get("/brands").then((r) => Array.isArray(r) ? r.length : 0).catch(() => 0),
      api.get("/reviews?approved=1").then((r) => Array.isArray(r) ? r.length : 0).catch(() => 0),
      api.get("/testimonials?all=1").then((r) => Array.isArray(r) ? r.length : 0).catch(() => 0),
    ]).then(([products, brands, reviews, testimonials]) => setLiveStats({ products, brands, reviews, testimonials }));
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative min-h-[600px] md:min-h-[650px] lg:min-h-[750px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img src={slides[current].image} alt="Taller" className="w-full h-full object-cover" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/75" />
      <div className="absolute inset-0 bg-gradient-to-r from-surface-primary via-surface-primary/60 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.1)_0%,transparent_60%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-surface-primary via-surface-primary/40 to-transparent pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl h-full px-4 md:px-6">
        <div className="flex flex-col justify-center h-full pt-24 md:pt-28 pb-56 md:pb-52 lg:pb-48">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-interactive-accent/15 border border-interactive-accent/25 px-4 py-1.5 text-xs font-medium text-interactive-accent backdrop-blur-sm mb-6">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              {slides[current].title}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-[1.1] tracking-tight"
          >
            {heroTitle.includes("<br/>") ? (
              <>
                {heroTitle.split("<br/>")[0]}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-interactive-accent to-blue-400">
                  {heroTitle.split("<br/>")[1]}
                </span>
              </>
            ) : (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-interactive-accent to-blue-400">{heroTitle}</span>
            )}
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base md:text-lg text-gray-300 leading-relaxed max-w-xl"
          >
            {heroDesc}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link to={cta1Link}
              className="group relative inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-interactive-accent-hover to-interactive-accent px-7 py-3.5 font-semibold text-white overflow-hidden transition-all duration-300 shadow-lg shadow-interactive-accent/30 hover:shadow-interactive-accent/60 hover:scale-105"
            >
              <span className="relative z-10">{cta1Text}</span>
              <svg className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link to={cta2Link}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-7 py-3.5 font-semibold text-white/80 hover:bg-white/10 hover:text-white hover:border-white/40 transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {cta2Text}
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 pb-8 md:pb-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-wrap justify-center lg:justify-start gap-3 md:gap-4">
            {(
              [
                { value: "4.9", label: "Calificación Google", icon: STAT_ICONS.star },
                { value: `${liveStats.testimonials > 0 ? liveStats.testimonials : 0}+`, label: "Clientes satisfechos", icon: STAT_ICONS.users },
                { value: `${liveStats.products > 0 ? liveStats.products : 0}+`, label: "Productos disponibles", icon: STAT_ICONS.package },
                { value: `${liveStats.brands > 0 ? liveStats.brands : 0}+`, label: "Marcas atendidas", icon: STAT_ICONS.flag },
                { value: "100%", label: "Garantía", icon: STAT_ICONS.shield },
              ] as const
            ).map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.08 }}
                className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-surface-primary/80 backdrop-blur-xl px-4 py-3 min-w-[140px] md:min-w-[160px]"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-interactive-accent/20 to-blue-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-white leading-none">{s.value}</p>
                  <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-20 flex gap-1.5">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-interactive-accent" : "w-1.5 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
