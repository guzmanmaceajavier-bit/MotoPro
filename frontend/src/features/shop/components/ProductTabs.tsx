import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";

type TabId = "description" | "specs" | "reviews" | "compatibility" | "questions" | "video" | "spin" | "shipping" | "warranty_info";

interface ProductTabsProps {
  tabs: { id: TabId; label: string }[];
  selectedTab: TabId;
  setSelectedTab: (tab: TabId) => void;
  product: any;
  specs: any[];
  reviewsArr: any[];
  spinImages: any[];
  spinIndex: number;
  isSpinning: boolean;
  spinRef: React.RefObject<HTMLDivElement | null>;
  startSpin: (e: React.MouseEvent) => void;
  spinMove: (e: React.MouseEvent) => void;
  stopSpin: () => void;
}

export function ProductTabs({
  tabs, selectedTab, setSelectedTab, product, specs, reviewsArr,
  spinImages, spinIndex, isSpinning, spinRef, startSpin, spinMove, stopSpin
}: ProductTabsProps) {
  return (
    <>
      <div className="mt-6 flex gap-4 border-b border-border overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setSelectedTab(tab.id)}
            className={`shrink-0 pb-3 text-sm font-semibold border-b-2 transition-colors ${
              selectedTab === tab.id ? "text-interactive-accent border-interactive-accent" : "text-text-tertiary border-transparent hover:text-text-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 min-h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div key={selectedTab}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
          >
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
                {product.warranty && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-text-secondary bg-surface-secondary border border-border rounded-lg px-3 py-2">
                    <svg className="w-4 h-4 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    <span>Garantía: <strong>{product.warranty}</strong></span>
                  </div>
                )}
              </div>
            )}

            {selectedTab === "specs" && (
              <div className="space-y-3">
                {specs.length > 0 ? specs.map((s: any) => (
                  <div key={s.label} className="flex justify-between py-2 border-b border-border">
                    <span className="text-sm text-text-tertiary">{s.label}</span>
                    <span className="text-sm text-text-primary font-medium">{s.value}</span>
                  </div>
                )) : (
                  <p className="text-sm text-text-tertiary text-center py-8">No hay especificaciones disponibles</p>
                )}
              </div>
            )}

            {selectedTab === "compatibility" && (
              <div>
                {product.compatibility_text ? (
                  <p className="text-sm text-text-secondary leading-relaxed">{product.compatibility_text}</p>
                ) : (
                  <p className="text-sm text-text-tertiary text-center py-8">Información de compatibilidad no disponible</p>
                )}
                {(product.compatible_models || []).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {product.compatible_models.map((m: string) => (
                      <span key={m} className="text-xs bg-surface-secondary border border-border rounded-lg px-3 py-1.5 text-text-secondary">
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedTab === "video" && product.video_url && (
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <iframe src={product.video_url.replace("watch?v=", "embed/")} className="w-full h-full" allowFullScreen title="Video" />
              </div>
            )}

            {selectedTab === "reviews" && (
              <div className="space-y-4">
                {reviewsArr.length > 0 ? reviewsArr.map((r: any) => (
                  <div key={r.id} className="bg-surface-secondary border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-interactive-accent/10 flex items-center justify-center text-xs font-bold text-interactive-accent">{r.name?.charAt(0) || "?"}</div>
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
                )) : (
                  <p className="text-sm text-text-tertiary text-center py-8">No hay reseñas todavía</p>
                )}
              </div>
            )}

            {selectedTab === "questions" && (
              <div className="text-center py-8">
                <svg className="w-10 h-10 mx-auto text-text-tertiary mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
                <p className="text-sm text-text-secondary mb-4">¿Tienes dudas sobre este producto?</p>
                <Link to="/contacto"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-interactive-accent hover:text-interactive-accent-hover transition-colors"
                >
                  Preguntar al vendedor
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            )}

            {selectedTab === "spin" && (
              <div className="aspect-square max-w-md mx-auto rounded-lg bg-surface-tertiary flex items-center justify-center overflow-hidden relative">
                {spinImages.length > 0 ? (
                  <div ref={spinRef} onMouseDown={startSpin} onMouseMove={spinMove} onMouseUp={stopSpin}
                    className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none">
                    <img src={spinImages[spinIndex]} alt={`360° view ${spinIndex + 1}`} className="w-full h-full object-contain" draggable={false} />
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <span className="text-5xl block mb-4 opacity-30">🔄</span>
                    <p className="text-sm text-text-tertiary">Vista 360° próximamente</p>
                  </div>
                )}
              </div>
            )}

            {selectedTab === "shipping" && (
              <div className="space-y-4">
                <h3 className="font-bold text-text-primary">Opciones de envío</h3>
                {product.shipping_info ? (
                  <div className="text-sm text-text-secondary leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.shipping_info) }} />
                ) : (
                  <div className="grid gap-3">
                    {[
                      { icon: "🚚", title: "Envío estándar", desc: "2-3 días hábiles • $8.000", time: "2-3 días" },
                      { icon: "⚡", title: "Envío express", desc: "24 horas • $15.000", time: "24 horas" },
                      { icon: "📦", title: "Recoger en tienda", desc: "Sin costo", time: "Inmediato" },
                    ].map(s => (
                      <div key={s.title} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface-secondary">
                        <span className="text-2xl">{s.icon}</span>
                        <div><p className="font-medium text-text-primary">{s.title}</p><p className="text-xs text-text-tertiary">{s.desc}</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedTab === "warranty_info" && (
              <div className="space-y-4">
                <h3 className="font-bold text-text-primary">Garantía</h3>
                {product.warranty ? (
                  <div className="p-4 rounded-lg border border-border bg-surface-secondary">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-6 h-6 text-interactive-accent" />
                      <span className="font-semibold text-text-primary">{product.warranty}</span>
                    </div>
                    <p className="text-sm text-text-secondary">Todos nuestros productos cuentan con garantía contra defectos de fábrica.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {[
                      { icon: "🛡️", title: "Garantía de fábrica", desc: "Cubierta por el fabricante contra defectos de origen" },
                      { icon: "🔄", title: "Cambios y devoluciones", desc: "30 días para cambios con factura y producto en estado original" },
                      { icon: "✅", title: "Sellos de garantía", desc: "No retirar los sellos de garantía del producto" },
                    ].map(w => (
                      <div key={w.title} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface-secondary">
                        <span className="text-2xl">{w.icon}</span>
                        <div><p className="font-medium text-text-primary">{w.title}</p><p className="text-xs text-text-tertiary">{w.desc}</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
