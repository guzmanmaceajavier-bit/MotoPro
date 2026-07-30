import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Eye } from "lucide-react";
import IconRenderer from "@/components/icons/IconRenderer";
import type { Product } from "../types";

export function ProductCard({ product, onAddToCart, onQuickView }: { product: Product; onAddToCart: (p: Product) => void; onQuickView: (p: Product) => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const discount = product.compare_price && product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;
  const inStock = (product.stock ?? 0) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-surface-secondary border border-border-subtle rounded-2xl overflow-hidden hover:border-interactive-accent/30 hover:shadow-lg hover:shadow-interactive-accent/5 transition-all duration-300 relative"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {discount > 0 && (
          <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[10px] font-bold">
            -{discount}%
          </span>
        )}
        {!inStock && (
          <span className="px-2 py-0.5 rounded-md bg-text-tertiary text-white text-[10px] font-bold">
            Agotado
          </span>
        )}
        {product.quality_label?.toLowerCase().includes("más vendido") && (
          <span className="px-2 py-0.5 rounded-md bg-interactive-accent text-white text-[10px] font-bold">
            Más vendido
          </span>
        )}
        {product.quality_label?.toLowerCase().includes("nuevo") && (
          <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold">
            Nuevo
          </span>
        )}
      </div>

      {product.brand && (
        <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-md bg-surface-primary/80 backdrop-blur-sm border border-border-subtle text-[10px] font-bold text-text-primary">
          {product.brand}
        </div>
      )}

      <button
        onClick={(e) => { e.preventDefault(); onQuickView(product); }}
        className="absolute top-12 right-3 z-10 w-8 h-8 rounded-full bg-surface-primary/80 backdrop-blur-sm border border-border-subtle flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-interactive-accent hover:text-white hover:border-interactive-accent"
      >
        <Eye size={14} />
      </button>

      <Link to={`/tienda/${product.slug}`} className="block">
        <div className="relative aspect-square bg-surface-tertiary overflow-hidden">
          {product.image ? (
            <>
              <img src={product.image} alt={product.name} loading="lazy"
                className={`w-full h-full object-cover transition-all duration-500 ${isHovered && product.images?.length ? "opacity-0 scale-105" : "scale-100"}`} />
              {product.images && product.images.length > 0 && (
                <img src={product.images[0]} alt={product.name} loading="lazy"
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"}`} />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <IconRenderer name="package" size={40} className="text-text-tertiary/20" />
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/tienda/${product.slug}`}>
          <h3 className="text-sm font-medium text-text-primary line-clamp-2 min-h-[40px] group-hover:text-interactive-accent transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-[11px] text-text-tertiary mt-1 truncate">{product.sku || ""}</p>

        {/* Rating */}
        <div className="flex items-center gap-0.5 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={11} className={i < (product.rating || 0) ? "text-amber-400 fill-amber-400" : "text-text-tertiary/30"} />
          ))}
          {product.review_count !== undefined && product.review_count > 0 && (
            <span className="text-[10px] text-text-tertiary ml-1">({product.review_count})</span>
          )}
        </div>

        {/* Price + Cart */}
        <div className="flex items-end justify-between mt-3">
          <div>
            {discount > 0 && product.compare_price && (
              <span className="text-xs text-text-tertiary line-through">${Math.round(product.compare_price).toLocaleString()}</span>
            )}
            <span className="text-lg font-bold text-interactive-accent block">${Math.round(product.price).toLocaleString()}</span>
          </div>
          <button
            onClick={() => onAddToCart(product)}
            disabled={!inStock}
            aria-label="Agregar al carrito"
            className="w-10 h-10 rounded-xl bg-interactive-accent/10 text-interactive-accent flex items-center justify-center hover:bg-interactive-accent hover:text-white transition-all shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
