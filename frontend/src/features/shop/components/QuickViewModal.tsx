import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X } from "lucide-react";
import IconRenderer from "@/components/icons/IconRenderer";
import type { Product } from "../types";

export function QuickViewModal({ product, onClose, onAddToCart }: { product: Product | null; onClose: () => void; onAddToCart: (p: Product) => void }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const allImages = [product.image, ...(product.images || [])].filter(Boolean);
  const discount = product.compare_price && product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-surface-secondary rounded-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} aria-label="Cerrar vista rápida" className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-surface-primary/80 border border-border flex items-center justify-center hover:bg-surface-tertiary transition-colors">
            <X size={16} />
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="bg-surface-tertiary rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none p-4">
              <div className="aspect-square rounded-xl overflow-hidden mb-3">
                {allImages.length > 0 ? (
                  <img src={allImages[selectedImage]} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <IconRenderer name="package" size={60} className="text-text-tertiary/20" />
                  </div>
                )}
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {allImages.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImage(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${selectedImage === i ? "border-interactive-accent" : "border-transparent hover:border-border"}`}>
                      <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="p-5 flex flex-col">
              {product.brand && (
                <span className="text-[10px] font-bold text-interactive-accent uppercase tracking-wider">{product.brand}</span>
              )}
              <h2 className="text-lg font-bold text-text-primary mt-1">{product.name}</h2>
              <div className="mt-4">
                {discount > 0 && product.compare_price && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-tertiary line-through">${Math.round(product.compare_price).toLocaleString()}</span>
                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-xs font-bold">-{discount}%</span>
                  </div>
                )}
                <span className="text-2xl font-bold text-interactive-accent">${Math.round(product.price).toLocaleString()}</span>
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                {product.warranty && (
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <svg className="w-4 h-4 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    {product.warranty}
                  </div>
                )}
                {product.quality_label && (
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <svg className="w-4 h-4 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.014 6.014 0 01-2.27.408m0 0c-.51 0-1.01-.064-1.49-.183M16.27 9.728a6.014 6.014 0 00-2.27-.408m0 0c-1.125 0-2.17-.31-3.08-.85m0 0a6.014 6.014 0 01-1.49-.183" />
                    </svg>
                    {product.quality_label}
                  </div>
                )}
                {product.compatibility_text && (
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <svg className="w-4 h-4 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                    {product.compatibility_text}
                  </div>
                )}
              </div>
              <div className="mt-4">
                {(product.stock ?? 0) > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-status-success">
                    <span className="w-2 h-2 rounded-full bg-status-success"></span>
                    En stock ({product.stock} disponibles)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    Agotado
                  </span>
                )}
              </div>
              <div className="mt-auto pt-4 flex items-center gap-3">
                <div className="flex items-center border border-border rounded-lg">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Reducir cantidad"
                    className="w-9 h-9 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
                  </button>
                  <span className="w-10 h-9 flex items-center justify-center text-sm font-bold text-text-primary border-x border-border">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(10, q + 1))} aria-label="Aumentar cantidad"
                    className="w-9 h-9 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" /></svg>
                  </button>
                </div>
                <button
                  onClick={() => { onAddToCart({ ...product, quantity }); onClose(); }}
                  disabled={(product.stock ?? 0) <= 0}
                  className="flex-1 h-10 rounded-lg bg-interactive-accent text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-interactive-accent-hover transition-all disabled:opacity-30"
                >
                  <ShoppingCart size={16} /> Agregar al carrito
                </button>
              </div>
              <Link to={`/tienda/${product.slug}`} className="mt-3 text-center text-xs text-interactive-accent hover:underline">
                Ver producto completo
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
