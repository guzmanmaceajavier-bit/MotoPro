import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const brandGradients = [
  "from-red-600 to-red-700", "from-blue-600 to-blue-700", "from-red-500 to-red-600",
  "from-green-600 to-green-700", "from-red-700 to-red-800", "from-blue-500 to-cyan-500",
  "from-orange-600 to-orange-700", "from-blue-600 to-blue-700", "from-gray-500 to-gray-600",
  "from-yellow-600 to-yellow-700", "from-green-500 to-green-600", "from-teal-500 to-teal-600",
];

const fallbackBrands = [
  { id: "fb1", name: "Yamaha", image: "", vehicle_count: 15 },
  { id: "fb2", name: "Honda", image: "", vehicle_count: 12 },
  { id: "fb3", name: "Suzuki", image: "", vehicle_count: 10 },
  { id: "fb4", name: "Kawasaki", image: "", vehicle_count: 8 },
  { id: "fb5", name: "AKT", image: "", vehicle_count: 20 },
  { id: "fb6", name: "Bajaj", image: "", vehicle_count: 14 },
  { id: "fb7", name: "Victory", image: "", vehicle_count: 6 },
  { id: "fb8", name: "Hero", image: "", vehicle_count: 18 },
  { id: "fb9", name: "TVS", image: "", vehicle_count: 9 },
  { id: "fb10", name: "KTM", image: "", vehicle_count: 7 },
  { id: "fb11", name: "BMW", image: "", vehicle_count: 5 },
  { id: "fb12", name: "Ducati", image: "", vehicle_count: 4 },
];

export function BrandsShowcase() {
  const [brands, setBrands] = useState<{ id: string; name: string; image: string; vehicle_count: number }[]>(fallbackBrands);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((res) => {
        const items = res.data || res || [];
        if (Array.isArray(items) && items.length > 0) {
          setBrands(items);
          cardRefs.current = cardRefs.current.slice(0, items.length);
        }
      })
      .catch(() => {});
  }, []);

  const updateFocus = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const containerCenter = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;
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

    const startAutoScroll = () => {
      intervalRef.current = setInterval(() => {
        if (isHovering) return;
        const cardWidth = 220 + 24;
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - cardWidth) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          el.scrollBy({ left: cardWidth, behavior: "smooth" });
        }
      }, 4000);
    };

    startAutoScroll();
    return () => clearInterval(intervalRef.current);
  }, [brands, isHovering]);

  const scroll = (dir: "left" | "right") => {
    const cardWidth = 220 + 24;
    scrollRef.current?.scrollBy({ left: dir === "left" ? -cardWidth * 2 : cardWidth * 2, behavior: "smooth" });
  };

  if (brands.length === 0) return null;

  return (
    <section className="py-20 md:py-24 bg-surface-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.03)_0%,transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-4 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-white">
            Trabajamos con las <span className="text-transparent bg-clip-text bg-gradient-to-r from-interactive-accent to-blue-400">mejores marcas</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500">Las marcas de motocicletas con las que trabajamos</p>
        </motion.div>

        <div className="relative px-8 md:px-10">
          <button onClick={() => scroll("left")} disabled={!canScrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex w-14 h-14 rounded-full border border-white/10 bg-surface-secondary items-center justify-center text-gray-400 shadow-lg hover:scale-105 hover:border-interactive-accent/40 hover:shadow-xl hover:shadow-interactive-accent/10 hover:bg-interactive-accent/5 active:scale-95 transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:border-white/10 disabled:hover:shadow-lg disabled:hover:bg-surface-secondary"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <div ref={scrollRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory scroll-smooth"
          >
            {brands.map((brand, i) => {
              const isFocused = i === focusedIndex;
              const slug = brand.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
              return (
                <motion.div key={brand.id} ref={(el) => { cardRefs.current[i] = el; }}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className={`snap-start shrink-0 transition-all duration-300 ${isFocused ? "scale-[1.03]" : "opacity-60 hover:opacity-100"}`}
                >
                  <Link to={`/tienda?marca=${slug}`}
                    className="group block w-[170px] sm:w-[190px] md:w-[210px] lg:w-[220px] rounded-2xl border border-white/10 bg-surface-secondary p-5 md:p-6 hover:border-interactive-accent/40 hover:shadow-xl hover:shadow-interactive-accent/5 hover:-translate-y-1.5 transition-all duration-300 text-center"
                  >
                    <div className="flex items-center justify-center mb-3 select-none">
                      {brand.image ? (
                        <img src={brand.image} alt={brand.name} className="h-14 w-14 object-contain rounded-full" />
                      ) : (
                        <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-600">
                          <span className="opacity-40">&lt;</span>
                          <span className={`bg-gradient-to-br ${brandGradients[i % brandGradients.length]} bg-clip-text text-transparent`}>{brand.name.charAt(0)}</span>
                          <span className="opacity-40">&gt;</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-base font-heading font-bold text-white group-hover:text-interactive-accent transition-colors">{brand.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{brand.vehicle_count} {brand.vehicle_count === 1 ? "producto" : "productos"}</p>
                    <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-interactive-accent opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver catálogo
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <button onClick={() => scroll("right")} disabled={!canScrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex w-14 h-14 rounded-full border border-white/10 bg-surface-secondary items-center justify-center text-gray-400 shadow-lg hover:scale-105 hover:border-interactive-accent/40 hover:shadow-xl hover:shadow-interactive-accent/10 hover:bg-interactive-accent/5 active:scale-95 transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:border-white/10 disabled:hover:shadow-lg disabled:hover:bg-surface-secondary"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
