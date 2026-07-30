import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "@/providers/CartProvider";
import { useToast } from "@/providers/ToastProvider";
import { BG_GRADIENTS, PRODUCT_ICONS, FALLBACK_PRODUCTS, formatPrice } from "./constants";
import { getFeaturedProducts } from "./services/homeService";
import type { FeaturedProduct } from "./types";
import { ProductCardSkeleton } from "@/components/ui";

export function ProductSlider() {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedProducts().then((data) => {
      setProducts(data);
    }).catch(() => setProducts(FALLBACK_PRODUCTS)).finally(() => setLoading(false));
  }, []);

  const handleAdd = (product: FeaturedProduct) => {
    addItem({ id: product.id, name: product.name, price: product.price, image: typeof product.image === 'string' ? product.image : "" });
    addToast(`${product.name} agregado al carrito`, "success");
  };

  if (loading) {
    return (
      <section className="bg-surface-primary py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-surface-primary py-30">
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-10 flex items-end justify-between"
        >
          <div>
            <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
              Productos <span className="bg-gradient-to-r from-interactive-accent to-blue-400 bg-clip-text text-transparent">destacados</span>
            </h2>
            <p className="mt-2 text-sm text-text-tertiary">Lo m\u00E1s vendido de la semana</p>
          </div>
          <Link to="/tienda"
            className="hidden items-center gap-1.5 text-sm font-medium text-interactive-accent transition-colors hover:text-interactive-accent-hover md:inline-flex"
          >
            Ver todos <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.slice(0, 8).map((product, i) => {
            const imgKey = typeof product.image === 'string' ? product.image : "";
            return (
              <motion.div key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group overflow-hidden rounded-2xl border border-white/5 bg-surface-secondary transition-all duration-300 hover:border-interactive-accent/40 hover:shadow-lg hover:shadow-interactive-accent/5"
              >
                <div className={`relative flex h-36 items-center justify-center overflow-hidden ${imgKey.startsWith("http") ? "" : `bg-gradient-to-br ${BG_GRADIENTS[imgKey] || "from-gray-500/10 to-slate-500/10"}`}`}>
                  {imgKey.startsWith("http") ? (
                    <img src={imgKey} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-all duration-300 group-hover:scale-110" />
                  ) : (
                    <span className="text-5xl opacity-40 transition-all duration-300 group-hover:scale-110 group-hover:opacity-60">{PRODUCT_ICONS[imgKey] || "\uD83D\uDD27"}</span>
                  )}
                  {product.price < 1000 && (
                    <span className="absolute left-2 top-2 rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Oferta
                    </span>
                  )}
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button aria-label="Agregar a favoritos" className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/80 backdrop-blur-sm transition-colors hover:text-red-400">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    </button>
                    <button aria-label="Vista rápida" className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/80 backdrop-blur-sm transition-colors hover:text-blue-400">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <span className="text-[10px] font-medium text-interactive-accent">{product.categoryName || "General"}</span>
                  </div>
                  <h3 className="truncate text-sm font-medium text-white">{product.name}</h3>
                  <div className="mt-1 flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="h-3 w-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-interactive-accent">{formatPrice(product.price)}</span>
                    <button onClick={() => handleAdd(product)}
                      className="rounded-lg bg-interactive-accent/10 px-3 py-1.5 text-xs font-semibold text-interactive-accent transition-all hover:bg-interactive-accent hover:text-white"
                    >
                      + Carrito
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to="/tienda"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-interactive-accent transition-colors hover:text-interactive-accent-hover"
          >
            Ver todos los productos <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
