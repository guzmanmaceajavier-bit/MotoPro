import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SEO } from "@/components/SEO";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import Pagination from "@/components/Pagination";
import { api } from "@/api/client";

interface GalleryImg {
  id: string; label: string; image: string; size: string;
}

const PER_PAGE = 12;

const heroImages = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&q=80",
  "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1600&q=80",
  "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1600&q=80",
];

export default function Galeria() {
  const seo = usePageSEO("galeria");
  const [images, setImages] = useState<GalleryImg[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<GalleryImg | null>(null);
  const [page, setPage] = useState(1);
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => { const t = setInterval(() => setHeroIdx((p) => (p + 1) % heroImages.length), 4000); return () => clearInterval(t); }, []);

  useEffect(() => {
    setLoading(true);
    api.get("/gallery").then((data) => {
      const arr = Array.isArray(data) ? data : [];
      setImages(arr.map((img: any) => ({ id: img.id, label: img.label || "", image: img.image, size: img.size || "medium" })));
    })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(images.length / PER_PAGE);
  const paginated = images.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  useEffect(() => { setPage(1); }, [images.length]);

  return (
    <>
      <SEO title="Galería" description="Galería de trabajos realizados en nuestro taller." pageSEO={seo} />
      <Navbar />
      <main className="pt-16">
        <section className="relative h-[55vh] min-h-[400px] overflow-hidden">
          <div className="absolute inset-0">
            <img key={heroIdx} src={heroImages[heroIdx]} alt="Taller"
              className="w-full h-full object-cover animate-fadeIn"
            />
            <div className="absolute inset-0 bg-black/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
          </div>
          <div className="relative z-10 h-full flex items-center">
            <div className="mx-auto max-w-7xl px-4 pt-20">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-4xl md:text-5xl font-heading font-bold text-text-primary">Proyectos <span className="text-transparent bg-clip-text bg-gradient-to-r from-interactive-accent to-blue-400">realizados</span></h1>
                <p className="mt-3 text-base md:text-lg text-text-secondary">Conoce los trabajos que hemos realizado en nuestro taller.</p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-surface-primary min-h-[50vh]">
          <div className="mx-auto max-w-7xl px-4">
            {loading ? (
              <div className="columns-2 md:columns-3 gap-4 space-y-4">
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="rounded-2xl bg-surface-tertiary/50 animate-pulse" style={{ height: `${150 + i * 30}px` }} />
                ))}
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-text-secondary">No hay imágenes disponibles.</p>
              </div>
            ) : (
              <>
              <div className="columns-2 md:columns-3 gap-4 space-y-4">
                {paginated.map((item, i) => (
                  <motion.button key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                    onClick={() => setOpen(item)}
                    className="group relative w-full rounded-2xl overflow-hidden border border-border hover:border-interactive-accent/40 transition-all"
                  >
                    <img src={item.image} alt={item.label}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                      <p className="text-sm font-semibold text-text-primary">{item.label}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </>
            )}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-primary/80 backdrop-blur-sm"
            onClick={() => setOpen(null)}
          >
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-3xl w-full rounded-2xl overflow-hidden border border-border bg-surface-secondary shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img src={open.image} alt={open.label} className="w-full h-[50vh] object-cover" />
                <button onClick={() => setOpen(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-primary/60 backdrop-blur-sm flex items-center justify-center text-text-primary hover:bg-surface-primary/80 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 pt-12">
                  <h3 className="text-xl font-heading font-bold text-text-primary">{open.label}</h3>
                  <p className="text-sm text-text-secondary mt-1">Trabajo de {open.label.toLowerCase()} realizado en nuestro taller.</p>
                </div>
              </div>
              <div className="p-5">
                <a
                  href={`https://wa.me/525551234567?text=${encodeURIComponent(`Hola, quisiera una cotización para un trabajo similar a "${open.label}". Mi moto es una [marca/modelo/año].`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full rounded-lg bg-gradient-to-r from-interactive-accent-hover to-interactive-accent py-3 text-sm font-semibold text-text-primary shadow-lg shadow-interactive-accent/25 hover:shadow-interactive-accent/40 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Solicitar cotización
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
      <BackToTop />
      <WhatsAppFloat />
    </>
  );
}
