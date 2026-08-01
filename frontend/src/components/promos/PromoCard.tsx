import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Wrench, Package, Layers, Flame } from "lucide-react";
import { Countdown } from "./Countdown";

const typeStyles: Record<string, { label: string; icon: any; gradient: string; ring: string; chip: string }> = {
  product: { label: "Tienda", icon: Package, gradient: "from-blue-500/20 to-cyan-400/10", ring: "hover:border-blue-400/40", chip: "bg-blue-500/15 text-blue-500" },
  service: { label: "Taller", icon: Wrench, gradient: "from-orange-500/20 to-amber-400/10", ring: "hover:border-orange-400/40", chip: "bg-orange-500/15 text-orange-500" },
  general: { label: "Promoción", icon: Layers, gradient: "from-emerald-500/20 to-teal-400/10", ring: "hover:border-emerald-400/40", chip: "bg-emerald-500/15 text-emerald-500" },
  combo: { label: "Combo", icon: Layers, gradient: "from-purple-500/20 to-fuchsia-400/10", ring: "hover:border-purple-400/40", chip: "bg-purple-500/15 text-purple-500" },
  campaign: { label: "Temporada", icon: Flame, gradient: "from-rose-500/20 to-red-400/10", ring: "hover:border-rose-400/40", chip: "bg-rose-500/15 text-rose-500" },
};

export function PromoCard({ offer, index = 0 }: { offer: any; index?: number }) {
  const st = typeStyles[offer.promo_type || "campaign"] || typeStyles.campaign;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className={`relative group rounded-2xl overflow-hidden bg-surface-secondary border border-border hover:shadow-xl transition-all ${st.ring}`}
    >
      <div className={`absolute inset-0 opacity-20 ${st.gradient} bg-gradient-to-br`} />
      {offer.image && <img src={offer.image} alt={offer.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-15" />}
      <div className="relative p-6 flex flex-col h-full">
        <span className={`inline-flex items-center gap-1.5 w-fit rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${st.chip}`}>
          <st.icon size={12} /> {st.label}
        </span>
        <h3 className="text-lg font-bold text-text-primary mt-3 mb-1">{offer.title}</h3>
        {offer.subtitle && <p className="text-sm text-interactive-accent font-semibold mb-2">{offer.subtitle}</p>}
        {offer.description && <p className="text-sm text-text-secondary mb-4">{offer.description}</p>}
        <div className="mt-auto pt-4 space-y-3">
          {offer.ends_at && <Countdown endsAt={offer.ends_at} />}
          <Link to={offer.cta_link || "/tienda"}
            className="inline-flex items-center gap-2 text-sm font-semibold text-interactive-accent hover:text-interactive-accent-hover transition-colors">
            {offer.cta_text || "Ver oferta"} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
