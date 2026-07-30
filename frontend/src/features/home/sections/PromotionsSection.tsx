import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useOffers } from "@/providers/CMSProvider";

interface OfferItem {
  id: string; title: string; subtitle: string; description: string;
  image: string; gradient: string; cta_text: string; cta_link: string;
  sort_order: number; is_active: number;
}

const fallbackColors = [
  { border: "border-amber-500/20", gradient: "from-amber-500/20 to-yellow-500/5", text: "text-amber-400" },
  { border: "border-red-500/20", gradient: "from-red-500/20 to-rose-500/5", text: "text-red-400" },
  { border: "border-blue-500/20", gradient: "from-blue-500/20 to-cyan-500/5", text: "text-blue-400" },
];

const fallbackOffers: OfferItem[] = [
  { id: "fb1", title: "Cambio de Aceite", subtitle: "Mantenimiento", description: "Incluye aceite sintético y filtro. Válido para todas las marcas.", image: "", gradient: "", cta_text: "Agendar ahora", cta_link: "/solicitar-servicio", sort_order: 1, is_active: 1 },
  { id: "fb2", title: "Kit de Arrastre", subtitle: "Descuento especial", description: "Kit cadena + corona + piñón con instalación gratis.", image: "", gradient: "", cta_text: "Ver oferta", cta_link: "/tienda", sort_order: 2, is_active: 1 },
  { id: "fb3", title: "Diagnóstico Gratis", subtitle: "Revisión completa", description: "Agenda tu servicio y llévate el diagnóstico computarizado sin costo.", image: "", gradient: "", cta_text: "Agendar ahora", cta_link: "/solicitar-servicio", sort_order: 3, is_active: 1 },
];

export function PromotionsSection() {
  const { offers } = useOffers();
  const items: OfferItem[] = offers.length > 0
    ? offers.filter((o: any) => o.is_active).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)).slice(0, 3)
    : fallbackOffers;

  if (items.length === 0) return null;

  return (
    <section className="py-30 relative overflow-hidden bg-surface-primary">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">
            Promociones <span className="text-transparent bg-clip-text bg-gradient-to-r from-interactive-accent to-blue-400">activas</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {items.map((p, i) => {
            const colors = fallbackColors[i % fallbackColors.length];
            return (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={p.cta_link || "/tienda"}
                  className={`block relative overflow-hidden rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.gradient} p-6 group hover:scale-[1.02] transition-all duration-300`}
                >
                  <div className="relative z-10">
                    {p.image && <img src={p.image} alt={p.title} loading="lazy" className="w-16 h-16 object-cover rounded-lg mb-3" />}
                    <p className={`text-xs font-semibold uppercase tracking-wider ${colors.text} mb-1`}>{p.subtitle}</p>
                    <h3 className="text-xl font-heading font-bold text-white">{p.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{p.description}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-interactive-accent mt-3 group-hover:gap-2 transition-all">
                      {p.cta_text || "Ver más"} <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
