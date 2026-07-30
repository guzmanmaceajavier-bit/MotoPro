import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { SEO } from "@/components/SEO";
import { Spinner } from "@/components/ui";
import { api } from "@/api/client";

export default function Promociones() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/offers").then((data) => {
      setOffers(Array.isArray(data) ? data : data?.data || []);
    }).catch(() => setOffers([])).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEO title="Promociones | MotoPro" />
      <main className="bg-surface-primary min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold text-interactive-accent uppercase tracking-[0.2em]">Ofertas</span>
            <h1 className="text-3xl font-bold text-text-primary mt-2">Promociones del mes</h1>
            <p className="text-text-secondary mt-2">Aprovecha descuentos exclusivos en servicios y productos.</p>
          </div>

          {loading ? (
            <Spinner size="md" className="py-20" />
          ) : offers.length === 0 ? (
            <EmptyState title="No hay promociones activas" description="Vuelve pronto, estamos preparando nuevas ofertas." />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer, i) => (
                <motion.div key={offer.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="relative group rounded-2xl overflow-hidden bg-surface-secondary border border-border hover:border-border-accent transition-all"
                >
                  <div className={`absolute inset-0 opacity-20 ${offer.gradient || 'from-purple-600 to-pink-500'} bg-gradient-to-br`} />
                  <div className="relative p-6">
                    <h3 className="text-lg font-bold text-text-primary mb-2">{offer.title}</h3>
                    {offer.subtitle && <p className="text-sm text-interactive-accent font-semibold mb-2">{offer.subtitle}</p>}
                    {offer.description && <p className="text-sm text-text-secondary mb-4">{offer.description}</p>}
                    <Link to={offer.cta_link || "/tienda"}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-interactive-accent hover:text-interactive-accent-hover transition-colors">
                      {offer.cta_text || "Ver oferta"} →
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

    </>
  );
}
