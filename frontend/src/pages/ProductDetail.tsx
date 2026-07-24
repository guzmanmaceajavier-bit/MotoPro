import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { SEO } from "@/components/SEO";
import { api } from "@/api/client";
import { useCart } from "@/providers/CartProvider";
import { useToast } from "@/providers/ToastProvider";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"description" | "specs" | "reviews">("description");
  const { addItem } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    api.get(`/products/slug/${slug}`).then((data) => {
      const p = data?.data || data;
      setProduct(p || null);
    }).catch(() => setProduct(null)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <>
        <SEO title="Cargando..." />
        <Navbar />
        <main className="bg-surface-primary min-h-screen pt-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-surface-tertiary rounded-2xl animate-pulse" />
              <div className="space-y-4">
                <div className="h-6 w-24 bg-surface-tertiary rounded animate-pulse" />
                <div className="h-8 w-3/4 bg-surface-tertiary rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-surface-tertiary rounded animate-pulse" />
                <div className="h-20 w-full bg-surface-tertiary rounded animate-pulse" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <SEO title="Producto no encontrado" />
        <Navbar />
        <main className="bg-surface-primary min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <span className="text-5xl block mb-4">🔍</span>
            <p className="text-text-primary text-lg font-semibold">Producto no encontrado</p>
            <Link to="/tienda" className="inline-block mt-4 text-interactive-accent hover:underline">Volver a la tienda</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const price = product.price || 0;
  const images = [product.image, ...(product.images || []).map((img: any) => img.image_url || img.image)].filter(Boolean);
  const formatPrice = (val: number) => `$${Math.round(val).toLocaleString()}`;

  return (
    <>
      <SEO title={`${product.name} | MotoPro`} description={product.description} />
      <Navbar />
      <main className="bg-surface-primary min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-text-tertiary mb-6">
            <Link to="/" className="hover:text-interactive-accent transition-colors">Inicio</Link>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            <Link to="/tienda" className="hover:text-interactive-accent transition-colors">Tienda</Link>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            <span className="text-text-primary">{product.name}</span>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Gallery */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="aspect-square rounded-2xl bg-surface-tertiary border border-border flex items-center justify-center overflow-hidden">
                {images.length > 0 && images[selectedImage] ? (
                  <img src={images[selectedImage]} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-6xl opacity-20">🏍️</span>
                )}
              </div>
              <div className="flex gap-3">
                {[0, 1, 2, 3].map(i => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`aspect-square w-20 rounded-lg border transition-all duration-300 overflow-hidden ${
                      selectedImage === i ? "border-interactive-accent ring-1 ring-interactive-accent" : "border-border"
                    }`}
                  >
                    <div className="h-full w-full bg-surface-tertiary flex items-center justify-center">
                      {images[i] ? (
                        <img src={images[i]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-6 h-6 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <rect x="2" y="2" width="20" height="20" rx="2" ry="2" /><path d="M2 16l4.5-4.5 3 3L14 9l6 6" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-interactive-accent uppercase tracking-wider">{product.category_name || "Producto"}</span>
                  <h1 className="text-2xl md:text-3xl font-bold text-text-primary mt-1">{product.name}</h1>
                  {product.brand_name && <p className="text-sm text-text-secondary mt-1">{product.brand_name}</p>}
                </div>
                <button onClick={() => setLiked(!liked)} className="w-10 h-10 rounded-lg bg-surface-secondary border border-border flex items-center justify-center hover:border-border-accent transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "#ef4444" : "none"} stroke={liked ? "#ef4444" : "currentColor"} strokeWidth="2" className="text-text-secondary">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= Math.round(product.rating || 4) ? "#fbbf24" : "none"} stroke="#fbbf24" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-text-tertiary">{product.rating || 4} ({product.reviews || 0} reseñas)</span>
                <span className="text-xs text-interactive-accent bg-interactive-accent/10 px-2 py-0.5 rounded font-semibold">En stock</span>
              </div>

              {/* Tabs */}
              <div className="mt-6 flex gap-4 border-b border-border">
                {[
                  { id: "description" as const, label: "Descripción" },
                  { id: "specs" as const, label: "Especificaciones" },
                  { id: "reviews" as const, label: `Opiniones (${reviews.length})` },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setSelectedTab(tab.id)}
                    className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                      selectedTab === tab.id ? "text-interactive-accent border-interactive-accent" : "text-text-tertiary border-transparent hover:text-text-secondary"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="mt-6 min-h-[200px]">
                {selectedTab === "description" && (
                  <div>
                    <p className="text-sm text-text-secondary leading-relaxed">{product.description}</p>
                    {(product.features || []).length > 0 && (
                      <div className="mt-4 space-y-2">
                        {product.features.map((f: string) => (
                          <div key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                            <svg className="w-4 h-4 text-interactive-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            {f}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedTab === "specs" && (
                  <div className="space-y-3">
                    {specs.map((s: any) => (
                      <div key={s.label} className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm text-text-tertiary">{s.label}</span>
                        <span className="text-sm text-text-primary font-medium">{s.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedTab === "reviews" && (
                  <div className="space-y-4">
                    {reviews.map((r: any) => (
                      <div key={r.id} className="bg-surface-secondary border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-interactive-accent/10 flex items-center justify-center text-xs font-bold text-interactive-accent">{r.name.charAt(0)}</div>
                            <div>
                              <p className="text-sm font-semibold text-text-primary">{r.name}</p>
                              <p className="text-xs text-text-tertiary">{r.date}</p>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(i => (
                              <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= r.rating ? "#fbbf24" : "none"} stroke="#fbbf24" strokeWidth="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-text-secondary">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price + CTA */}
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

                <div className="flex items-center gap-4 mt-5">
                  <div className="flex items-center border border-border bg-surface-tertiary rounded-lg">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="flex h-10 w-10 items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </button>
                    <span className="flex h-10 w-12 items-center justify-center text-sm font-bold text-text-primary border-x border-border">{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(10, q + 1))}
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

              {/* Trust */}
              <div className="mt-4 flex items-center gap-4 text-xs text-text-tertiary">
                <span className="flex items-center gap-1">🔒 Pago seguro</span>
                <span className="flex items-center gap-1">🚚 Envío a todo el país</span>
                <span className="flex items-center gap-1">🛡️ Garantía 30 días</span>
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          <section className="mt-20 pt-12 border-t border-border">
            <h2 className="text-xl font-bold text-text-primary mb-8">Productos relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {relatedProducts.map((rp, i) => (
                <Link key={i} to={`/tienda/${rp.slug}`}
                  className="group bg-surface-secondary border border-border rounded-lg overflow-hidden hover:border-border-accent transition-all"
                >
                  <div className="aspect-square bg-surface-tertiary flex items-center justify-center p-4">
                    <img src={rp.image} alt={rp.name} className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-text-primary group-hover:text-interactive-accent transition-colors">{rp.name}</h3>
                    <p className="text-sm font-bold text-interactive-accent mt-1">{formatPrice(rp.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
      <BackToTop />
      <WhatsAppFloat />
    </>
  );
}
