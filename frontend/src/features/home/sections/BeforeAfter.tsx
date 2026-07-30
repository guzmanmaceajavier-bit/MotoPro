import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBeforeAfter } from "@/providers/CMSProvider";

interface BeforeAfterItem {
  id: string;
  title: string;
  before_image: string;
  after_image: string;
  description: string;
}

const fallbackData: BeforeAfterItem[] = [
  {
    id: "1",
    title: "Restauración de carrocería",
    before_image: "https://images.unsplash.com/photo-1607853554431-006187c0dc5a?w=800&q=80",
    after_image: "https://images.unsplash.com/photo-1607853554431-006187c0dc5a?w=800&q=80&sat=-100&bri=20",
    description: "Trabajo de restauración completa",
  },
  {
    id: "2",
    title: "Pintura y detallado",
    before_image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80",
    after_image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80&sat=-100&bri=20",
    description: "Pintura y detallado profesional",
  },
  {
    id: "3",
    title: "Reparación de motor",
    before_image: "https://images.unsplash.com/photo-1616712134411-6b6ae89bc3ba?w=800&q=80",
    after_image: "https://images.unsplash.com/photo-1616712134411-6b6ae89bc3ba?w=800&q=80&sat=-100&bri=20",
    description: "Reparación completa de motor",
  },
  {
    id: "4",
    title: "Cambio de escapes",
    before_image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80",
    after_image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80&sat=-100&bri=20",
    description: "Instalación de escapes deportivos",
  },
];

export function BeforeAfter() {
  const { beforeAfter, loading } = useBeforeAfter();
  const items: BeforeAfterItem[] = beforeAfter.length > 0 ? beforeAfter : fallbackData;
  const [current, setCurrent] = useState(0);

  const prev = useCallback(() => setCurrent((c) => (c === 0 ? items.length - 1 : c - 1)), [items.length]);
  const next = useCallback(() => setCurrent((c) => (c === items.length - 1 ? 0 : c + 1)), [items.length]);

  useEffect(() => {
    if (items.length === 0) return;
    const timer = setInterval(() => setCurrent((p) => (p + 1) % items.length), 4000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (loading || items.length === 0) return null;

  const comp = items[current];

  return (
    <section className="py-30 relative overflow-hidden bg-surface-primary">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">
            Antes <span className="text-transparent bg-clip-text bg-gradient-to-r from-interactive-accent to-blue-400">y</span> Después
          </h2>
          <p className="mt-2 text-gray-400 text-sm">El resultado de nuestro trabajo habla por sí solo</p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          <button onClick={prev}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-lg border border-white/10 bg-surface-primary/80 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-white hover:border-interactive-accent/40 transition-all shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button onClick={next}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-lg border border-white/10 bg-surface-primary/80 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-white hover:border-interactive-accent/40 transition-all shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="wait">
              <motion.div key={`before-${current}`} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.5 }}
                className="relative rounded-2xl overflow-hidden border border-white/10 aspect-[4/3]"
              >
                <img src={comp.before_image} alt="Antes" loading="lazy" className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10 z-10">Antes</div>
              </motion.div>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.div key={`after-${current}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.5 }}
                className="relative rounded-2xl overflow-hidden border border-interactive-accent/30 aspect-[4/3]"
              >
                <img src={comp.after_image} alt="Después" loading="lazy" className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-interactive-accent/80 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10 z-10">Después</div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            {items.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === current ? "w-6 bg-interactive-accent" : "bg-white/20 hover:bg-white/40"}`}
              />
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-4">{comp.title}</p>
          {comp.description && <p className="text-center text-xs text-gray-500 mt-1">{comp.description}</p>}
        </div>
      </div>
    </section>
  );
}
