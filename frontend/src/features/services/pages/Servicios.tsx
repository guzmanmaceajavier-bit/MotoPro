import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { api } from "@/api/client";
import { useBrands } from "@/providers/CMSProvider";
import IconRenderer from "@/components/icons/IconRenderer";
import { EmptyState, Spinner, Badge, ServiceCardSkeleton } from "@/components/ui";
import { useConfig } from "@/providers/CMSProvider";
import { Clock, Search, ChevronDown, X, CalendarCheck, MessageCircle, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const FALLBACK_CATEGORIES = [
  { name: "Mecánica", icon: "wrench", description: "Revisión y reparación general del motor, transmisión y sistemas." },
  { name: "Eléctrica", icon: "zap", description: "Diagnóstico y reparación del sistema eléctrico, luces y arranque." },
  { name: "Suspensión", icon: "circle-dot", description: "Revisión y mantenimiento de la suspensión delantera y trasera." },
  { name: "Frenos", icon: "shield", description: "Inspección y servicio del sistema de frenos para tu seguridad." },
  { name: "Motor", icon: "cpu", description: "Mantenimiento preventivo y correctivo del motor." },
  { name: "Llantas", icon: "disc", description: "Revisión, cambio y balanceo de llantas para mejor desempeño." },
];

export default function Servicios() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>(FALLBACK_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [tips, setTips] = useState<any[]>([]);
  const { brands } = useBrands();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const config = useConfig();
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const amount = 280;
    carouselRef.current.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  useEffect(() => {
    Promise.all([
      api.get("/services"),
      api.get("/service-categories").catch(() => []),
    ]).then(([svcData, catData]) => {
      setServices(Array.isArray(svcData) && svcData.length > 0 ? svcData : []);
      if (Array.isArray(catData) && catData.length > 0) {
        setCategories(catData.map((c: any) => ({
          name: c.name,
          icon: c.icon || "settings",
          description: c.description || "",
          image: c.image || "",
        })));
      }
    }).catch(() => {}).finally(() => setLoading(false));

    api.get("/blog-posts").then(data => {
      if (Array.isArray(data)) setTips(data.slice(0, 3));
    }).catch(() => {});
  }, []);

  // Close brand dropdown on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setBrandDropdownOpen(false);
      }
    };
    if (brandDropdownOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [brandDropdownOpen]);

  const filteredBrands = useMemo(() => {
    if (!brandSearch) return brands;
    return brands.filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()));
  }, [brands, brandSearch]);

  const toggleBrand = (name: string) => {
    setSelectedBrands(prev => prev.includes(name) ? prev.filter(b => b !== name) : [...prev, name]);
  };

  // Count services per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    services.forEach(s => {
      const cat = (s.category || "").toLowerCase();
      if (cat) counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [services]);

  const filtered = useMemo(() => {
    let result = services;
    if (selectedCategory) {
      result = result.filter(s => (s.category || "").toLowerCase() === selectedCategory.toLowerCase());
    }
    if (selectedBrands.length > 0) {
      result = result.filter(s => selectedBrands.some(b => (s.brand || "").toLowerCase() === b.toLowerCase()));
    }
    if (sortBy === "price_asc") result = [...result].sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sortBy === "price_desc") result = [...result].sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sortBy === "duration") result = [...result].sort((a, b) => (a.duration || "").localeCompare(b.duration || ""));
    return result;
  }, [services, selectedCategory, selectedBrands, sortBy]);

  const hasCategoryFilter = !!selectedCategory;
  const hasBrandFilter = selectedBrands.length > 0;
  const hasSortFilter = !!sortBy;
  const hasAnyFilter = hasCategoryFilter || hasBrandFilter || hasSortFilter;

  return (
    <>
      <SEO title="Servicios" description="Servicios especializados para tu motocicleta con garantía y el mejor equipo técnico." />
      <main className="pt-16">

        {/* ── Hero ── */}
        <section className="relative py-20 lg:py-28 min-h-[400px] flex items-center bg-surface-primary overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1600&q=80" alt="" loading="lazy" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl">
              <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs font-semibold text-interactive-accent uppercase tracking-widest">
                SERVICIOS
              </motion.span>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="mt-4 text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight whitespace-pre-line">
                {"Cuidado experto\npara tu moto"}
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="mt-5 text-base text-white/70 leading-relaxed max-w-lg">
                Servicios completos con garantía, repuestos originales y técnicos certificados.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="mt-8 flex flex-wrap gap-6">
                {[
                  { icon: "shield", label: "Garantía en todos", sub: "nuestros servicios" },
                  { icon: "award", label: "Técnicos certificados", sub: "por las mejores marcas" },
                  { icon: "package", label: "Repuestos originales", sub: "y garantizados" },
                  { icon: "clock", label: "Más de 15 años", sub: "de experiencia" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-interactive-accent">
                      <IconRenderer name={item.icon} size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-white/50">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Step 1: Tipo de servicio ── */}
        <section className="py-16 bg-surface-primary">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-text-primary mb-2">
                <span className="text-interactive-accent">1.</span> Elige el tipo de servicio
              </h2>
              <div className="w-12 h-1 bg-interactive-accent rounded-full mt-3 mb-8" />
            </motion.div>

            <div className="relative group/carousel">
              {/* Left arrow */}
              <button onClick={() => scrollCarousel("left")}
                className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface-secondary text-text-secondary shadow-md hover:border-interactive-accent/30 hover:text-interactive-accent transition-all opacity-0 group-hover/carousel:opacity-100"
                aria-label="Anterior">
                <ChevronLeft size={18} />
              </button>

              {/* Right arrow */}
              <button onClick={() => scrollCarousel("right")}
                className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface-secondary text-text-secondary shadow-md hover:border-interactive-accent/30 hover:text-interactive-accent transition-all opacity-0 group-hover/carousel:opacity-100"
                aria-label="Siguiente">
                <ChevronRight size={18} />
              </button>

              {/* Gradient fade edges */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-surface-primary to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-surface-primary to-transparent z-10 pointer-events-none" />

              <div ref={carouselRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-1 px-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {categories.map((cat, i) => {
                  const isSelected = selectedCategory === cat.name;
                  const count = categoryCounts[cat.name.toLowerCase()] || 0;
                  const cardClass = `snap-start shrink-0 w-[220px] sm:w-[240px] text-left rounded-2xl border p-5 transition-all group relative overflow-hidden ${
                    isSelected
                      ? "border-interactive-accent/40 bg-interactive-accent/5 shadow-lg shadow-interactive-accent/10"
                      : "border-border-subtle bg-surface-secondary hover:border-interactive-accent/20 hover:bg-surface-tertiary/30"
                  }`;
                  return (
                    <motion.button key={cat.name}
                      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedCategory(isSelected ? "" : cat.name)}
                      className={cardClass}>
                      <div className="relative z-10">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-interactive-accent/10 text-interactive-accent mb-3 group-hover:scale-110 transition-transform">
                          <IconRenderer name={cat.icon || "settings"} size={22} />
                        </div>
                        <h3 className="text-sm font-heading font-bold text-text-primary mb-1">{cat.name}</h3>
                        <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2 mb-3">{cat.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-interactive-accent">
                            {isSelected ? "Seleccionado" : "Ver servicios"} <ArrowRight size={12} />
                          </span>
                          {count > 0 && (
                            <span className="text-[10px] font-bold text-text-tertiary bg-surface-tertiary px-1.5 py-0.5 rounded-full">{count}</span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Step 2 & 3: Filters ── */}
        <section className="py-10 bg-surface-primary border-t border-border-subtle">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">

              {/* Step 2: Brand filter */}
              <div>
                <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
                  <span className="text-interactive-accent">2.</span> Filtra por marca
                </h2>
                <div className="w-12 h-1 bg-interactive-accent rounded-full mt-3 mb-6" />

                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
                    className="w-full flex items-center justify-between rounded-xl border border-border-subtle bg-surface-secondary px-4 py-3 text-sm text-text-primary hover:border-interactive-accent/30 transition-all"
                    aria-haspopup="listbox" aria-expanded={brandDropdownOpen}>
                    <span className={selectedBrands.length > 0 ? "text-text-primary" : "text-text-tertiary"}>
                      Selecciona una o varias marcas
                    </span>
                    <ChevronDown size={16} className={`text-text-tertiary transition-transform ${brandDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {brandDropdownOpen && (
                    <div className="absolute z-20 mt-2 w-full rounded-xl border border-border-subtle bg-surface-secondary shadow-xl" role="listbox">
                      <div className="p-3 border-b border-border-subtle">
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                          <input type="text" placeholder="Buscar marca..." value={brandSearch} onChange={e => setBrandSearch(e.target.value)}
                            className="w-full rounded-lg border border-border-subtle bg-surface-tertiary pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:border-interactive-accent focus:outline-none"
                            autoFocus />
                        </div>
                      </div>
                      <div className="p-2 max-h-48 overflow-y-auto">
                        <label className="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-surface-tertiary/50 transition-colors">
                          <input type="checkbox" checked={selectedBrands.length === filteredBrands.length && filteredBrands.length > 0}
                            onChange={() => {
                              if (selectedBrands.length === filteredBrands.length) setSelectedBrands([]);
                              else setSelectedBrands(filteredBrands.map(b => b.name));
                            }}
                            className="w-4 h-4 rounded border-border text-interactive-accent focus:ring-interactive-accent bg-surface-tertiary" />
                          <span className="text-xs text-text-secondary">Seleccionar todas</span>
                        </label>
                        {filteredBrands.map(brand => (
                          <label key={brand.id || brand.name}
                            className="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-surface-tertiary/50 transition-colors">
                            <input type="checkbox" checked={selectedBrands.includes(brand.name)}
                              onChange={() => toggleBrand(brand.name)}
                              className="w-4 h-4 rounded border-border text-interactive-accent focus:ring-interactive-accent bg-surface-tertiary" />
                            <span className="text-xs text-text-primary">{brand.name}</span>
                          </label>
                        ))}
                        {filteredBrands.length === 0 && (
                          <p className="text-xs text-text-tertiary text-center py-3">No se encontraron marcas</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected brands as chips */}
                {selectedBrands.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2 items-center">
                      {selectedBrands.map(name => (
                        <span key={name}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-interactive-accent/10 text-interactive-accent text-xs font-medium">
                          {name}
                          <button onClick={() => toggleBrand(name)} className="hover:text-interactive-accent-hover" aria-label={`Quitar ${name}`}>
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      <button onClick={() => setSelectedBrands([])}
                        className="text-xs text-text-tertiary hover:text-interactive-accent transition-colors">
                        Limpiar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Sort (renamed from "filter") */}
              <div>
                <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
                  <span className="text-interactive-accent">3.</span> Ordenar por{" "}
                  <span className="text-sm font-normal text-text-tertiary">(opcional)</span>
                </h2>
                <div className="w-12 h-1 bg-interactive-accent rounded-full mt-3 mb-6" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Precio</label>
                    <select value={sortBy === "price_asc" || sortBy === "price_desc" ? sortBy : ""} onChange={e => setSortBy(e.target.value)}
                      className="w-full rounded-xl border border-border-subtle bg-surface-secondary px-4 py-3 text-sm text-text-primary focus:border-interactive-accent focus:outline-none transition-colors appearance-none">
                      <option value="">Sin orden</option>
                      <option value="price_asc">Menor precio</option>
                      <option value="price_desc">Mayor precio</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Duración</label>
                    <select value={sortBy === "duration" ? "duration" : ""} onChange={e => setSortBy(e.target.value === "duration" ? "duration" : "")}
                      className="w-full rounded-xl border border-border-subtle bg-surface-secondary px-4 py-3 text-sm text-text-primary focus:border-interactive-accent focus:outline-none transition-colors appearance-none">
                      <option value="">Sin orden</option>
                      <option value="duration">Menor duración</option>
                    </select>
                  </div>
                </div>

                {hasAnyFilter && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {hasCategoryFilter && (
                      <button onClick={() => setSelectedCategory("")}
                        className="text-xs text-interactive-accent hover:underline flex items-center gap-1">
                        <X size={12} /> Quitar categoría
                      </button>
                    )}
                    {hasSortFilter && (
                      <button onClick={() => setSortBy("")}
                        className="text-xs text-interactive-accent hover:underline flex items-center gap-1">
                        <X size={12} /> Quitar orden
                      </button>
                    )}
                    {hasAnyFilter && (
                      <button onClick={() => { setSelectedCategory(""); setSelectedBrands([]); setSortBy(""); }}
                        className="text-xs text-text-tertiary hover:text-interactive-accent transition-colors">
                        Limpiar todos
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Service Cards ── */}
        <section className="py-16 bg-surface-primary">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[10px] font-bold text-interactive-accent uppercase tracking-[0.2em]">Servicios</span>
                <h2 className="mt-2 text-2xl md:text-3xl font-heading font-bold text-text-primary">
                  {selectedCategory ? selectedCategory : `${filtered.length} servicios disponibles`}
                </h2>
              </div>
              <Link to="/solicitar-servicio" className="hidden md:flex items-center gap-2 text-sm font-semibold text-interactive-accent hover:underline">
                Ver todos
                <ArrowRight size={16} />
              </Link>
            </div>

            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                title="Sin resultados"
                description="No encontramos servicios con esos filtros"
                action={<button onClick={() => { setSelectedCategory(""); setSelectedBrands([]); setSortBy(""); }}
                  className="px-5 py-2.5 rounded-lg bg-interactive-accent text-white text-sm font-semibold hover:bg-interactive-accent-hover transition-all">
                  Limpiar filtros
                </button>}
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((svc: any, i: number) => (
                  <motion.div key={svc.id || i}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="group rounded-2xl border border-border-subtle bg-surface-secondary overflow-hidden transition-all hover:border-interactive-accent/30 hover:shadow-lg hover:shadow-interactive-accent/5">
                    <div className="relative h-44 overflow-hidden bg-gradient-to-br from-surface-primary to-surface-secondary">
                      {svc.image ? (
                        <img src={svc.image} alt={svc.title || svc.name} loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-interactive-accent/10 text-interactive-accent">
                            <IconRenderer name={svc.icon || "settings"} size={32} />
                          </div>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {svc.category && (
                          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-semibold text-white capitalize">
                            {svc.category}
                          </span>
                        )}
                        {svc.available !== false && (
                          <Badge variant="success" className="bg-green-500/80 text-white">Disponible</Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-heading font-bold text-text-primary mb-1">{svc.title || svc.name}</h3>
                      <p className="text-xs text-text-secondary leading-relaxed mb-3 line-clamp-2">{svc.description}</p>
                      <div className="flex items-center gap-4 text-[11px] text-text-tertiary mb-4">
                        {svc.duration && (
                          <span className="flex items-center gap-1"><Clock size={12} /> {svc.duration}</span>
                        )}
                        {svc.price != null && (
                          <span className="font-semibold text-interactive-accent">${Number(svc.price).toLocaleString()}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/servicios/${svc.id}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border-subtle px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-surface-tertiary transition-all">
                          Ver detalles
                        </Link>
                        <Link to="/solicitar-servicio"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-interactive-accent px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-interactive-accent/25 hover:shadow-interactive-accent/40 transition-all">
                          Solicitar asesoría
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Aprendizaje: Tips y consejos ── */}
        {tips.length > 0 && (
        <section className="py-16 bg-surface-primary border-t border-border-subtle">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-[10px] font-bold text-interactive-accent uppercase tracking-[0.2em]">Aprendizaje</span>
                <h2 className="mt-2 text-2xl md:text-3xl font-heading font-bold text-text-primary">Tips y consejos de mantenimiento</h2>
                <p className="text-sm text-text-secondary mt-1">Aprende a cuidar mejor tu moto</p>
              </div>
              <Link to="/blog" className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-interactive-accent hover:underline">
                Ver todos <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {tips.map((tip: any, i: number) => (
                <Link key={tip.id || i} to={`/blog/${tip.slug || tip.id}`}
                  className="group rounded-2xl border border-border-subtle bg-surface-secondary overflow-hidden hover:border-interactive-accent/30 transition-all">
                  <div className="h-44 overflow-hidden bg-surface-tertiary">
                    {tip.image ? (
                      <img src={tip.image} alt={tip.title} loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-semibold text-interactive-accent uppercase tracking-wider mb-1.5">
                      {tip.category || "Consejos"}
                    </p>
                    <h3 className="text-sm font-heading font-bold text-text-primary mb-1.5 line-clamp-2 group-hover:text-interactive-accent transition-colors">{tip.title}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{tip.excerpt || tip.description}</p>
                    <div className="mt-3 flex items-center gap-3 text-[10px] text-text-tertiary">
                      {tip.reading_time && <span>{tip.reading_time} min de lectura</span>}
                      {tip.author && <span>{tip.author}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* ── CTA: ¿Necesitas asesoría? ── */}
        <section className="bg-surface-secondary py-10 border-t border-border-subtle">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-6 rounded-2xl border border-border-subtle bg-surface-primary p-6 md:p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-interactive-accent/10 text-interactive-accent shrink-0">
                <CalendarCheck size={26} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-heading font-bold text-text-primary">¿Necesitas asesoría?</h3>
                <p className="text-sm text-text-secondary mt-1">Nuestro equipo está listo para ayudarte a elegir el servicio que tu moto necesita.</p>
              </div>
              <a href={`https://wa.me/${config.social_whatsapp || "573001234567"}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-interactive-accent/30 px-5 py-3 text-sm font-semibold text-interactive-accent hover:bg-interactive-accent/5 transition-all shrink-0">
                <MessageCircle size={16} />
                Consultar ahora
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
