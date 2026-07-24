import { useState, useEffect } from "react";
import { api } from "@/api/client";
import FadeIn from "@/components/ui/FadeIn";

const imageSets = [
  [
    { src: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&q=80", label: "Herramientas" },
    { src: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&q=80", label: "Motos" },
    { src: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80", label: "Repuestos" },
    { src: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&q=80", label: "Detalles" },
  ],
  [
    { src: "https://images.unsplash.com/photo-1530294381599-4e0ef46b2c20?w=400&q=80", label: "Diagnóstico" },
    { src: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&q=80", label: "Llantas" },
    { src: "https://images.unsplash.com/photo-1601369820088-c4d2efb5e5e2?w=400&q=80", label: "Suspensión" },
    { src: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&q=80", label: "Personalización" },
  ],
  [
    { src: "https://images.unsplash.com/photo-1631984794911-2a153925e175?w=400&q=80", label: "Motor" },
    { src: "https://images.unsplash.com/photo-1617516202505-d2f6c8c9ca5e?w=400&q=80", label: "Cascos" },
    { src: "https://images.unsplash.com/photo-1602683185526-782651224983?w=400&q=80", label: "Accesorios" },
    { src: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=400&q=80", label: "Viajes" },
  ],
];

export function AboutSection() {
  const [cfg, setCfg] = useState<Record<string, string>>({});
  const [stats, setStats] = useState({ products: 0, brands: 0, services: 0 });
  const [imgSet, setImgSet] = useState(0);

  useEffect(() => {
    api.get("/config").then(setCfg).catch(() => {});
    Promise.all([
      api.get("/products?all=1"),
      api.get("/brands"),
      api.get("/services"),
    ]).then(([prods, brs, svcs]) => {
      const p = Array.isArray(prods?.data ?? prods) ? (prods?.data ?? prods) : [];
      const b = Array.isArray(brs) ? brs : [];
      const s = Array.isArray(svcs) ? svcs : [];
      setStats({ products: p.length, brands: b.length, services: s.length });
    }).catch(() => {});
    const interval = setInterval(() => setImgSet((p) => (p + 1) % imageSets.length), 4000);
    return () => clearInterval(interval);
  }, []);

  const current = imageSets[imgSet];

  return (
    <section className="py-16 md:py-20 bg-surface-primary">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <FadeIn>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden relative">
                <div key={imgSet} className="grid grid-cols-2 grid-rows-2 h-full animate-fadeIn">
                  {current.map((img, i) => (
                    <div key={i} className="relative overflow-hidden group">
                      <img src={img.src} alt={img.label}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-white bg-black/40 px-2 py-0.5 rounded">{img.label}</span>
                    </div>
                  ))}
                </div>
                {/* dots indicator */}
                <div className="absolute bottom-3 right-3 flex gap-1.5 z-10">
                  {imageSets.map((_, i) => (
                    <button key={i} onClick={() => setImgSet(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgSet ? "bg-white w-3" : "bg-white/40 hover:bg-white/60"}`}
                    />
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 rounded-lg border border-interactive-accent/20 bg-surface-tertiary p-4 shadow-lg shadow-interactive-accent/10">
                <p className="text-2xl font-bold text-interactive-accent">{stats.services}+</p>
                <p className="text-xs text-gray-400">Servicios</p>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.1} direction="left">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Pasión por las <span className="text-interactive-accent">motos</span>
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              {cfg.site_description || "Taller especializado en mantenimiento, reparación y personalización de motocicletas."}
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: stats.products.toLocaleString() + "+", label: "Productos" },
                { value: stats.brands.toLocaleString() + "+", label: "Marcas" },
                { value: "100%", label: "Compromiso" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-white/10 bg-surface-secondary p-4 text-center hover:border-interactive-accent/30 transition-all">
                  <p className="text-xl font-bold text-interactive-accent">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
