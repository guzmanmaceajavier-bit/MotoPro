import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BRAND_GRADIENTS } from "./constants";
import { useBrands } from "@/providers/CMSProvider";

export function BrandsShowcase() {
  const { brands } = useBrands();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const updateFocus = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const containerCenter = el.scrollLeft + el.clientWidth / 2;
    let closest = 0; let minDist = Infinity;
    cardRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const cardCenter = ref.offsetLeft + ref.offsetWidth / 2;
      const dist = Math.abs(cardCenter - containerCenter);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setFocusedIndex(closest);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
      updateFocus();
    };
    el.addEventListener("scroll", check);
    check();
    return () => el.removeEventListener("scroll", check);
  }, [brands, updateFocus]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || brands.length === 0) return;
    intervalRef.current = setInterval(() => {
      if (isHovering) return;
      const cardWidth = 220 + 24;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - cardWidth) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [brands, isHovering]);

  const scroll = (dir: "left" | "right") => {
    const cardWidth = 220 + 24;
    scrollRef.current?.scrollBy({ left: dir === "left" ? -cardWidth * 2 : cardWidth * 2, behavior: "smooth" });
  };

  if (brands.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-surface-primary py-20 md:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.03)_0%,transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="font-heading text-2xl font-bold text-white md:text-3xl">
            Trabajamos con las <span className="bg-gradient-to-r from-interactive-accent to-blue-400 bg-clip-text text-transparent">mejores marcas</span>
          </h2>
          <p className="mt-2 text-sm text-text-tertiary">Las marcas de motocicletas con las que trabajamos</p>
        </motion.div>

        <div className="relative px-8 md:px-10">
          <button onClick={() => scroll("left")} disabled={!canScrollLeft}
            className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-surface-secondary text-text-tertiary shadow-lg transition-all duration-200 hover:scale-105 hover:border-interactive-accent/40 hover:bg-interactive-accent/5 hover:text-text-primary hover:shadow-interactive-accent/10 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-20 disabled:hover:scale-100 disabled:hover:border-white/10 disabled:hover:shadow-lg disabled:hover:bg-surface-secondary md:flex w-14 h-14"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <div ref={scrollRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="flex gap-6 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory scrollbar-hide"
          >
            {brands.map((brand, i) => {
              const isFocused = i === focusedIndex;
              const slug = brand.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
              return (
                <motion.div key={brand.id} ref={(el) => { cardRefs.current[i] = el; }}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className={`shrink-0 snap-start transition-all duration-300 ${isFocused ? "scale-[1.03]" : "opacity-60 hover:opacity-100"}`}
                >
                  <Link to={`/tienda?marca=${slug}`}
                    className="group block w-[170px] rounded-2xl border border-white/10 bg-surface-secondary p-5 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-interactive-accent/40 hover:shadow-xl hover:shadow-interactive-accent/5 sm:w-[190px] md:w-[210px] md:p-6 lg:w-[220px]"
                  >
                    <div className="mb-3 flex select-none items-center justify-center">
                      {brand.image ? (
                        <img src={brand.image} alt={brand.name} className="h-14 w-14 rounded-full object-contain" />
                      ) : (
                        <div className="flex items-center justify-center gap-1 text-2xl font-bold text-text-tertiary">
                          <span className="opacity-40">&lt;</span>
                          <span className={`bg-gradient-to-br ${BRAND_GRADIENTS[i % BRAND_GRADIENTS.length]} bg-clip-text text-transparent`}>{brand.name.charAt(0)}</span>
                          <span className="opacity-40">&gt;</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-heading text-base font-bold text-white transition-colors group-hover:text-interactive-accent">{brand.name}</h3>
                    <p className="mt-1 text-xs text-text-tertiary">{brand.vehicle_count} {brand.vehicle_count === 1 ? "producto" : "productos"}</p>
                    <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-interactive-accent opacity-0 transition-opacity group-hover:opacity-100">
                      Ver catálogo
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <button onClick={() => scroll("right")} disabled={!canScrollRight}
            className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-surface-secondary text-text-tertiary shadow-lg transition-all duration-200 hover:scale-105 hover:border-interactive-accent/40 hover:bg-interactive-accent/5 hover:text-text-primary hover:shadow-interactive-accent/10 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-20 disabled:hover:scale-100 disabled:hover:border-white/10 disabled:hover:shadow-lg disabled:hover:bg-surface-secondary md:flex w-14 h-14"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
