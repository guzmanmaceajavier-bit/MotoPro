import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Spinner, EmptyState } from "@/components/ui";
import { api } from "@/api/client";
import {
  Clock, Copy, Check, Wrench, Package, Layers, Flame, TicketPercent,
  ArrowRight, ShoppingBag, AlertTriangle,
} from "lucide-react";

const formatPrice = (v: number) => `$${Math.round(v || 0).toLocaleString("es-CO")}`;

function useCountdown(endsAt?: string) {
  const calc = useCallback(() => {
    if (!endsAt) return null;
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, expired: true };
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
      expired: false,
    };
  }, [endsAt]);
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    setLeft(calc());
    if (!endsAt) return;
    const t = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(t);
  }, [endsAt, calc]);
  return left;
}

function Countdown({ endsAt, light }: { endsAt: string; light?: boolean }) {
  const left = useCountdown(endsAt);
  if (!left || left.expired) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${light ? "text-amber-300" : "text-text-tertiary"}`}>
        <AlertTriangle size={13} /> Promoción finalizada
      </span>
    );
  }
  const cells = [
    { v: left.d, l: "días" },
    { v: left.h, l: "hrs" },
    { v: left.m, l: "min" },
    { v: left.s, l: "seg" },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {cells.map((c, i) => (
        <div key={c.l} className="flex items-center gap-1.5">
          <div className={`rounded-lg px-2 py-1 text-center min-w-[44px] ${light ? "bg-white/15 backdrop-blur-sm" : "bg-surface-primary/60 border border-border"}`}>
            <span className={`block text-base font-bold tabular-nums leading-none ${light ? "text-white" : "text-text-primary"}`}>
              {String(c.v).padStart(2, "0")}
            </span>
            <span className={`block text-[10px] uppercase tracking-wider mt-0.5 ${light ? "text-white/70" : "text-text-tertiary"}`}>{c.l}</span>
          </div>
          {i < cells.length - 1 && <span className={`text-sm font-bold ${light ? "text-white/60" : "text-text-tertiary"}`}>:</span>}
        </div>
      ))}
    </div>
  );
}

const typeStyles: Record<string, { label: string; icon: any; gradient: string; ring: string }> = {
  product: { label: "Tienda", icon: Package, gradient: "from-blue-500/20 to-cyan-400/10", ring: "group-hover:border-blue-400/40" },
  service: { label: "Taller", icon: Wrench, gradient: "from-orange-500/20 to-amber-400/10", ring: "group-hover:border-orange-400/40" },
  combo: { label: "Combo", icon: Layers, gradient: "from-purple-500/20 to-fuchsia-400/10", ring: "group-hover:border-purple-400/40" },
  campaign: { label: "Temporada", icon: Flame, gradient: "from-rose-500/20 to-red-400/10", ring: "group-hover:border-rose-400/40" },
};

export default function Promociones() {
  const [offers, setOffers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get("/offers").catch(() => []),
      api.get("/products?all=1").catch(() => []),
      api.get("/services").catch(() => []),
      api.get("/coupons/public").catch(() => []),
    ]).then(([o, p, s, c]) => {
      setOffers(Array.isArray(o) ? o : o?.data || []);
      setProducts(Array.isArray(p) ? p : []);
      setServices(Array.isArray(s) ? s : []);
      setCoupons(Array.isArray(c) ? c : []);
    }).finally(() => setLoading(false));
  }, []);

  const activeOffers = useMemo(() => (offers || []).filter((o: any) => o.is_active !== 0), [offers]);

  const byType = useMemo(() => ({
    campaign: activeOffers.filter((o) => (o.promo_type || "campaign") === "campaign"),
    product: activeOffers.filter((o) => (o.promo_type || "") === "product"),
    service: activeOffers.filter((o) => (o.promo_type || "") === "service"),
    combo: activeOffers.filter((o) => (o.promo_type || "") === "combo"),
  }), [activeOffers]);

  const discountProducts = useMemo(() => (products || [])
    .filter((p) => p.is_active !== 0 && Number(p.compare_price) > Number(p.price))
    .sort((a, b) => ((Number(a.compare_price) - Number(a.price)) / Number(a.price)) - ((Number(b.compare_price) - Number(b.price)) / Number(b.price)))
    .slice(0, 8), [products]);

  const featuredServices = useMemo(() => (services || []).filter((s) => s.is_active !== 0).slice(0, 6), [services]);

  const hero = byType.campaign[0] || activeOffers.find((o) => o.ends_at) || activeOffers[0];

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const renderOfferCard = (offer: any, i: number) => {
    const st = typeStyles[offer.promo_type || "campaign"] || typeStyles.campaign;
    return (
      <motion.div key={offer.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
        className={`relative group rounded-2xl overflow-hidden bg-surface-secondary border border-border hover:shadow-xl transition-all ${st.ring}`}>
        <div className={`absolute inset-0 opacity-20 ${st.gradient} bg-gradient-to-br`} />
        <div className="relative p-6 flex flex-col h-full">
          <span className={`inline-flex items-center gap-1.5 w-fit rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${offer.promo_type === "service" ? "bg-orange-500/15 text-orange-500" : offer.promo_type === "combo" ? "bg-purple-500/15 text-purple-500" : offer.promo_type === "product" ? "bg-blue-500/15 text-blue-500" : "bg-rose-500/15 text-rose-500"}`}>
            <st.icon size={12} /> {st.label}
          </span>
          <h3 className="text-lg font-bold text-text-primary mt-3 mb-1">{offer.title}</h3>
          {offer.subtitle && <p className="text-sm text-interactive-accent font-semibold mb-2">{offer.subtitle}</p>}
          {offer.description && <p className="text-sm text-text-secondary mb-4">{offer.description}</p>}
          <div className="mt-auto pt-4 space-y-3">
            {offer.ends_at && <Countdown endsAt={offer.ends_at} />}
            <Link to={offer.cta_link || "/promociones"}
              className="inline-flex items-center gap-2 text-sm font-semibold text-interactive-accent hover:text-interactive-accent-hover transition-colors">
              {offer.cta_text || "Ver oferta"} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <main className="bg-surface-primary min-h-screen pt-24">
        <Spinner size="md" className="py-20" />
      </main>
    );
  }

  const hasAny = activeOffers.length > 0 || discountProducts.length > 0 || coupons.length > 0;

  return (
    <>
      <SEO title="Promociones | MotoPro"
        description="Aprovecha descuentos en productos, promociones de servicio del taller, combos y cupones exclusivos. Ofertas por tiempo limitado." />
      <main className="bg-surface-primary min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          {/* Hero campaña */}
          {hero && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="relative mb-14 overflow-hidden rounded-3xl border border-border">
              <div className={`absolute inset-0 ${hero.gradient || "from-purple-600 to-pink-500"} bg-gradient-to-br opacity-30`} />
              {hero.image && <img src={hero.image} alt={hero.title} className="absolute inset-0 w-full h-full object-cover opacity-40" />}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
              <div className="relative px-8 py-14 md:py-20 max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                  <Flame size={13} /> Temporada
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white mt-4 drop-shadow">{hero.title}</h1>
                {hero.subtitle && <p className="text-lg md:text-xl font-semibold text-amber-300 mt-2">{hero.subtitle}</p>}
                {hero.description && <p className="text-white/80 mt-3 max-w-lg">{hero.description}</p>}
                {hero.ends_at && (
                  <div className="mt-6">
                    <p className="text-xs uppercase tracking-widest text-white/70 mb-2 flex items-center gap-1.5"><Clock size={13} /> Termina en</p>
                    <Countdown endsAt={hero.ends_at} light />
                  </div>
                )}
                <Link to={hero.cta_link || "/tienda"}
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black hover:bg-amber-300 transition-colors">
                  {hero.cta_text || "Ver promoción"} <ArrowRight size={16} />
                </Link>
              </div>
            </motion.section>
          )}

          {!hasAny ? (
            <EmptyState title="No hay promociones activas"
              description="Vuelve pronto, estamos preparando nuevas ofertas."
              action={<Link to="/tienda" className="inline-flex items-center gap-2 rounded-xl bg-interactive-accent px-6 py-3 text-sm font-semibold text-white">Ir a la tienda</Link>} />
          ) : (
            <>
              {/* Productos en oferta */}
              {(byType.product.length > 0 || discountProducts.length > 0) && (
                <section className="mb-14">
                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <span className="text-[11px] font-bold text-blue-500 uppercase tracking-[0.2em]">Tienda</span>
                      <h2 className="text-2xl font-bold text-text-primary mt-1">Productos en oferta</h2>
                    </div>
                    <Link to="/tienda" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-interactive-accent hover:underline">
                      Ver tienda <ArrowRight size={14} />
                    </Link>
                  </div>

                  {byType.product.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {byType.product.slice(0, 3).map((o, i) => renderOfferCard(o, i))}
                    </div>
                  )}

                  {discountProducts.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {discountProducts.map((p, i) => {
                        const discountPct = Math.round(((Number(p.compare_price) - Number(p.price)) / Number(p.compare_price)) * 100);
                        return (
                          <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                            className="group rounded-2xl border border-border bg-surface-secondary overflow-hidden hover:border-interactive-accent/40 hover:shadow-lg transition-all">
                            <Link to={`/productos/${p.slug || p.id}`} className="block relative aspect-square overflow-hidden">
                              {p.image ? (
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-surface-tertiary/40 text-text-tertiary"><Package size={32} /></div>
                              )}
                              <span className="absolute top-3 left-3 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white">-{discountPct}%</span>
                            </Link>
                            <div className="p-4">
                              <p className="text-xs text-text-tertiary truncate">{p.brand_name || "Producto"}</p>
                              <h3 className="text-sm font-semibold text-text-primary line-clamp-1 mt-0.5">{p.name}</h3>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-base font-bold text-interactive-accent">{formatPrice(p.price)}</span>
                                {Number(p.compare_price) > Number(p.price) && (
                                  <span className="text-xs text-text-tertiary line-through">{formatPrice(p.compare_price)}</span>
                                )}
                              </div>
                              <Link to={`/productos/${p.slug || p.id}`}
                                className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-interactive-accent/10 px-3 py-2 text-xs font-semibold text-interactive-accent hover:bg-interactive-accent hover:text-white transition-colors">
                                <ShoppingBag size={13} /> Ver producto
                              </Link>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* Servicios en promoción */}
              {(byType.service.length > 0 || featuredServices.length > 0) && (
                <section className="mb-14">
                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <span className="text-[11px] font-bold text-orange-500 uppercase tracking-[0.2em]">Taller</span>
                      <h2 className="text-2xl font-bold text-text-primary mt-1">Servicios en promoción</h2>
                    </div>
                    <Link to="/servicios" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-interactive-accent hover:underline">
                      Ver servicios <ArrowRight size={14} />
                    </Link>
                  </div>

                  {byType.service.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {byType.service.slice(0, 3).map((o, i) => renderOfferCard(o, i))}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featuredServices.slice(0, 6).map((s, i) => (
                      <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                        className="rounded-2xl border border-border bg-surface-secondary p-5 hover:border-orange-400/40 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                            <Wrench size={18} />
                          </div>
                          {s.duration && (
                            <span className="inline-flex items-center gap-1 text-xs text-text-tertiary"><Clock size={12} /> {s.duration}</span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-text-primary">{s.title}</h3>
                        <p className="text-xs text-text-tertiary line-clamp-2 mt-1">{s.description}</p>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-lg font-bold text-orange-500">{s.price ? formatPrice(s.price) : "Consultar"}</span>
                          <Link to={`/servicios/${s.slug || s.id}`}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-interactive-accent hover:text-interactive-accent-hover">
                            Agendar <ArrowRight size={14} />
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Combos */}
              {byType.combo.length > 0 && (
                <section className="mb-14">
                  <div className="mb-6">
                    <span className="text-[11px] font-bold text-purple-500 uppercase tracking-[0.2em]">Combos</span>
                    <h2 className="text-2xl font-bold text-text-primary mt-1">Combos y paquetes</h2>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {byType.combo.map((o, i) => renderOfferCard(o, i))}
                  </div>
                </section>
              )}

              {/* Cupones */}
              {coupons.length > 0 && (
                <section className="mb-14">
                  <div className="mb-6">
                    <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-[0.2em]">Cupones</span>
                    <h2 className="text-2xl font-bold text-text-primary mt-1">Cupones activos</h2>
                    <p className="text-sm text-text-secondary mt-1">Cópialos y úsalos al finalizar tu compra.</p>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coupons.map((c, i) => (
                      <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                        className="relative overflow-hidden rounded-2xl border border-dashed border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-teal-400/5 p-6">
                        <div className="absolute -right-3 -top-3 w-20 h-20 rounded-full bg-emerald-500/10" />
                        <TicketPercent className="w-6 h-6 text-emerald-500 mb-3" />
                        <p className="text-sm font-medium text-text-secondary">{c.description || "Descuento exclusivo"}</p>
                        <p className="text-2xl font-extrabold text-text-primary mt-1">
                          {c.discount_type === "percentage" ? `${c.discount_value}% OFF` : `${formatPrice(c.discount_value)} OFF`}
                        </p>
                        <p className="text-xs text-text-tertiary mt-1">
                          {c.min_purchase > 0 ? `Compras mayores a ${formatPrice(c.min_purchase)}` : "Sin compra mínima"}
                        </p>
                        <button onClick={() => copyCode(c.code)}
                          className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 transition-colors">
                          {copied === c.code ? <Check size={15} /> : <Copy size={15} />}
                          {copied === c.code ? "¡Copiado!" : c.code}
                        </button>
                        {c.expires_at && (
                          <div className="mt-3 flex items-center justify-center">
                            <Countdown endsAt={c.expires_at} />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* CTA */}
              <section className="rounded-2xl bg-gradient-to-r from-interactive-accent/15 to-orange-400/10 border border-interactive-accent/20 p-8 text-center">
                <ShoppingBag className="w-8 h-8 text-interactive-accent mx-auto mb-3" />
                <h2 className="text-xl font-bold text-text-primary">Visita nuestra tienda</h2>
                <p className="text-sm text-text-secondary mt-1 mb-6">Explora todos los productos y servicios disponibles en MotoPro.</p>
                <Link to="/tienda"
                  className="inline-flex items-center gap-2 rounded-xl bg-interactive-accent px-6 py-3 text-sm font-semibold text-white hover:bg-interactive-accent-hover transition-all">
                  Ir a la tienda
                  <ArrowRight size={16} />
                </Link>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
