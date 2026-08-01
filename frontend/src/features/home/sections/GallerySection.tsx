import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGallery, useConfig } from "@/providers/CMSProvider";

interface GalleryImg {
  id: string; label: string; image: string; size: string;
}

const fallbackGallery: GalleryImg[] = [
  { id: "fb1", label: "Restauración Yamaha MT-09", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80", size: "large" },
  { id: "fb2", label: "Personalización Honda CB190", image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80", size: "small" },
  { id: "fb3", label: "Mantenimiento Preventivo General", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80", size: "small" },
  { id: "fb4", label: "Pintura Personalizada", image: "https://images.unsplash.com/photo-1626668893632-6f3a4466d22d?w=800&q=80", size: "small" },
  { id: "fb5", label: "Reparación de Motor Completo", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80", size: "small" },
  { id: "fb6", label: "Servicio de Transmisión", image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80", size: "large" },
];

export function GallerySection() {
  const { gallery } = useGallery();
  const config = useConfig();
  const images: GalleryImg[] = gallery.length > 0 ? (gallery as GalleryImg[]) : fallbackGallery;
  const [open, setOpen] = useState<GalleryImg | null>(null);

  return (
    <section className="py-30 relative overflow-hidden bg-surface-primary">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">
            Trabajos <span className="text-transparent bg-clip-text bg-gradient-to-r from-interactive-accent to-blue-400">realizados</span>
          </h2>
          <p className="mt-2 text-gray-400 text-sm">Conoce algunos de nuestros proyectos</p>
        </motion.div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.slice(0, 6).map((item, i) => (
              <motion.button key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setOpen(item)}
                className={`group relative rounded-2xl overflow-hidden bg-surface-secondary border border-white/5 hover:border-interactive-accent/30 transition-all ${
                  i === 0 || i === 5 ? "row-span-2" : ""
                }`}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={item.image} alt={item.label} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-interactive-accent mt-1">
                      Ver proyecto <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}

      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setOpen(null)}
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-secondary border border-white/10 rounded-2xl max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-heading font-bold text-white">{open.label}</h3>
                <button onClick={() => setOpen(null)} aria-label="Cerrar" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="aspect-video rounded-lg overflow-hidden mb-4">
                <img src={open.image} alt={open.label} loading="lazy" className="w-full h-full object-cover" />
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Trabajo de {open.label.toLowerCase()} realizado en nuestro taller.
              </p>
              <a
                href={`https://wa.me/${config.social_whatsapp || "525551234567"}?text=${encodeURIComponent(`Hola, quisiera una cotización para un trabajo similar a "${open.label}". Mi moto es una [marca/modelo/año].`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center rounded-lg bg-gradient-to-r from-interactive-accent-hover to-interactive-accent py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-interactive-accent/25 transition-all"
              >
                Solicitar cotización
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
