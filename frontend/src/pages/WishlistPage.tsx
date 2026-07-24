import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { api } from "@/api/client";

export default function WishlistPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get("/customer-auth/wishlist").then((data) => {
      setItems(Array.isArray(data) ? data : data?.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const removeFromWishlist = (productId: string) => {
    api.delete(`/customer-auth/wishlist/${productId}`).then(() => {
      setItems(prev => prev.filter(i => i.id !== productId && i.product_id !== productId));
      addToast("Eliminado de favoritos", "success");
    }).catch(() => addToast("Error al eliminar", "error"));
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-surface-primary flex items-center justify-center px-4 pt-16">
          <div className="text-center">
            <h1 className="text-h3 text-text-primary mb-4">Inicia sesión</h1>
            <p className="text-body text-text-tertiary mb-6">Debes iniciar sesión para ver tu lista de deseos.</p>
            <Link to="/perfil" className="rounded-sm bg-interactive-accent px-6 py-3 text-body-sm font-semibold text-text-inverse hover:bg-interactive-accent-hover transition-colors">Ir a mi perfil</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-primary pt-28 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-h2 text-text-primary">Mis favoritos</h1>
              <p className="text-body-sm text-text-tertiary mt-1">{items.length} producto{items.length !== 1 ? "s" : ""}</p>
            </div>
            <Link to="/tienda" className="text-body-sm text-interactive-accent hover:underline">Ir a la tienda</Link>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1,2,3,4].map(i => <div key={i} className="rounded-lg bg-surface-secondary animate-pulse h-80" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-surface-tertiary flex items-center justify-center">
                <svg className="w-8 h-8 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <p className="text-body text-text-tertiary">No tienes productos en favoritos</p>
              <Link to="/tienda" className="inline-block mt-4 rounded-sm bg-interactive-accent px-6 py-3 text-body-sm font-semibold text-text-inverse hover:bg-interactive-accent-hover transition-colors">Explorar tienda</Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item, i) => {
                const product = item.product || item;
                return (
                  <motion.div key={item.id || product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className="group relative rounded-lg border border-border bg-surface-secondary overflow-hidden hover:border-interactive-accent/40 hover:shadow-lg transition-all duration-base h-full flex flex-col">
                      <Link to={`/tienda/${product.slug || product.id}`} className="block aspect-square bg-surface-tertiary flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <svg className="w-12 h-12 text-text-tertiary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <rect x="2" y="2" width="20" height="20" rx="2" ry="2" /><path d="M2 16l4.5-4.5 3 3L14 9l6 6" />
                          </svg>
                        )}
                      </Link>
                      <button onClick={() => removeFromWishlist(product.id)}
                        className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary/80 backdrop-blur-sm text-status-error hover:bg-status-error hover:text-text-primary transition-all"
                        aria-label="Eliminar de favoritos"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                      </button>
                      <div className="p-4 flex-1 flex flex-col">
                        <Link to={`/tienda/${product.slug || product.id}`}>
                          <h3 className="text-body-sm font-semibold text-text-primary group-hover:text-interactive-accent transition-colors line-clamp-2">{product.name}</h3>
                        </Link>
                        <p className="text-tiny text-text-tertiary mt-1">{product.brand || ""}</p>
                        <div className="mt-auto pt-3 flex items-center justify-between">
                          <span className="text-h6 font-bold text-text-primary">${(product.price || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer /><BackToTop /><WhatsAppFloat />
    </>
  );
}
