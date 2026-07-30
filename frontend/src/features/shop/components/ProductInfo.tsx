import { Link } from "react-router-dom";
import { Share2 } from "lucide-react";

interface ProductInfoProps {
  product: any;
  liked: boolean;
  toggleWishlist: () => Promise<void>;
  formatPrice: (val: number) => string;
  priceHistory: any[];
  stockLevel: string;
  stockColors: Record<string, string>;
  stockLabels: Record<string, string>;
  children?: React.ReactNode;
  price: number;
  originalPrice: number;
  hasDiscount: boolean;
  quantity: number;
  setQuantity: (fn: (q: number) => number) => void;
  stock: number;
  addItem: (item: any) => void;
  addToast: (message: string, type?: "success" | "error" | "info") => void;
  images: string[];
}

export function ProductInfo({
  product, liked, toggleWishlist, formatPrice, priceHistory, stockLevel,
  stockColors, stockLabels, children, price, originalPrice, hasDiscount,
  quantity, setQuantity, stock, addItem, addToast, images
}: ProductInfoProps) {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-interactive-accent uppercase tracking-wider">{product.category_name || "Producto"}</span>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mt-1">{product.name}</h1>
          {product.brand_name && <p className="text-sm text-text-secondary mt-1">{product.brand_name}</p>}
        </div>
        <div className="flex items-center gap-2">
        <button onClick={toggleWishlist} aria-label={liked ? "Quitar de favoritos" : "Agregar a favoritos"} className="w-10 h-10 rounded-lg bg-surface-secondary border border-border flex items-center justify-center hover:border-border-accent transition-all shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "#ef4444" : "none"} stroke={liked ? "#ef4444" : "currentColor"} strokeWidth="2" className="text-text-secondary">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <button onClick={() => {
          if (navigator.share) navigator.share({ title: product.name, url: window.location.href });
          else { navigator.clipboard.writeText(window.location.href); addToast("Enlace copiado", "success"); }
        }} className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-text-secondary hover:text-interactive-accent hover:border-interactive-accent transition-all" aria-label="Compartir">
          <Share2 size={18} />
        </button>
        <Link to={`/comparar?add=${product.id}`} className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-text-secondary hover:text-interactive-accent hover:border-interactive-accent transition-all" aria-label="Comparar">
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
        </Link>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4 flex-wrap">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map(i => (
            <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= Math.round(product.rating || 4) ? "#fbbf24" : "none"} stroke="#fbbf24" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
        </div>
        <span className="text-xs text-text-tertiary">{product.rating || 4} ({(Array.isArray(product.reviews) ? product.reviews.length : product.reviews) || 0} reseñas)</span>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${stockColors[stockLevel]}`}>{stockLabels[stockLevel]}</span>
      </div>

      {priceHistory.length > 1 && (
        <div className="mt-3 flex items-center gap-2 text-[11px] text-text-tertiary bg-surface-secondary border border-border rounded-lg px-3 py-2">
          <svg className="w-3.5 h-3.5 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Precio más bajo en 30 días</span>
          <span className="font-semibold text-interactive-accent">{formatPrice(Math.min(...priceHistory.map((p: any) => p.price || p)))}</span>
        </div>
      )}

      {children}

      <div className="mt-8 bg-surface-secondary border border-border rounded-2xl p-6">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl md:text-3xl font-bold text-interactive-accent">{formatPrice(price)}</span>
          {hasDiscount && (
            <>
              <span className="text-sm text-text-tertiary line-through">{formatPrice(originalPrice)}</span>
              <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">-{Math.round((1 - price / originalPrice) * 100)}%</span>
            </>
          )}
        </div>

        {(product.shipping_estimate || product.shipping_info) && (
          <p className="mt-2 text-xs text-text-tertiary flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            {product.shipping_estimate || product.shipping_info}
          </p>
        )}

        <div className="flex items-center gap-4 mt-5">
          <div className="flex items-center border border-border bg-surface-tertiary rounded-lg">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="flex h-10 w-10 items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
            <span className="flex h-10 w-12 items-center justify-center text-sm font-bold text-text-primary border-x border-border">{quantity}</span>
            <button onClick={() => setQuantity(q => Math.min(stock > 0 ? stock : 10, q + 1))}
              className="flex h-10 w-10 items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
          </div>
          <button onClick={() => { addItem({ id: product.id, name: product.name, price, image: images[0] || "", quantity, brand: product.brand_name, warranty: product.warranty, quality_label: product.quality_label, compatibility_text: product.compatibility_text }); addToast("Producto agregado al carrito", "success"); }}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r bg-interactive-accent px-6 py-3 font-semibold text-black hover:bg-interactive-accent-hover transition-all shadow-elevation-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            Agregar al carrito
          </button>
        </div>

        <Link to="/checkout"
          className="mt-3 flex items-center justify-center gap-2 w-full rounded-lg border border-interactive-accent py-3 text-sm font-semibold text-interactive-accent hover:bg-interactive-accent/10 transition-all"
        >
          Comprar ahora
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-surface-secondary p-3 text-center">
          <svg className="w-5 h-5 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <span className="text-[10px] text-text-tertiary leading-tight">Pago seguro</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-surface-secondary p-3 text-center">
          <svg className="w-5 h-5 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
          </svg>
          <span className="text-[10px] text-text-tertiary leading-tight">Envío garantizado</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-surface-secondary p-3 text-center">
          <svg className="w-5 h-5 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-6.75-3.75h7.5M9 6v-.75m0 3v.75m0 3v.75m0 3V18m-7.5-3.75h7.5" />
          </svg>
          <span className="text-[10px] text-text-tertiary leading-tight">Garantía 30 días</span>
        </div>
      </div>
    </>
  );
}
