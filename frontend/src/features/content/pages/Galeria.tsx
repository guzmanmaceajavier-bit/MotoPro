import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SEO } from "@/components/SEO";
import { useConfig } from "@/providers/CMSProvider";
import { usePageSEO } from "@/hooks/usePageSEO";

import Pagination from "@/components/Pagination";
import { api } from "@/api/client";
import { Image, Play, Scissors, Calendar, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { Spinner } from "@/components/ui";

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
  const config = useConfig();
  const [images, setImages] = useState<GalleryImg[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<GalleryImg | null>(null);
  const [page, setPage] = useState(1);
  const [heroIdx, setHeroIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("fotos");
  const [beforeAfter, setBeforeAfter] = useState<any[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);
  const [instalaciones, setInstalaciones] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loadingTab, setLoadingTab] = useState(false);

  const tabs = [
    { id: "fotos", label: "Fotos", icon: Image },
    { id: "videos", label: "Videos", icon: Play },
    { id: "antes-despues", label: "Antes/Después", icon: Scissors },
    { id: "eventos", label: "Eventos", icon: Calendar },
    { id: "instalaciones", label: "Instalaciones", icon: Building2 },
  ];

  useEffect(() => { const t = setInterval(() => setHeroIdx((p) => (p + 1) % heroImages.length), 4000); return () => clearInterval(t); }, []);

  useEffect(() => {
    if (activeTab === "videos" && videos.length === 0) {
      setLoadingTab(true);
      api.get("/gallery?category=video").then((data) => setVideos(Array.isArray(data) ? data : [])).catch(() => {
        setVideos([
          { id: "v1", label: "Reparación de motor 4T", image: "", video_url: "" },
          { id: "v2", label: "Personalización de carenado", image: "", video_url: "" },
          { id: "v3", label: "Mantenimiento preventivo", image: "", video_url: "" },
        ]);
      }).finally(() => setLoadingTab(false));
    } else if (activeTab === "antes-despues" && beforeAfter.length === 0) {
      setLoadingTab(true);
      api.get("/before-after").then((data) => setBeforeAfter(Array.isArray(data) ? data : [])).catch((err) => console.warn("[fetch]", err)).finally(() => setLoadingTab(false));
    } else if (activeTab === "eventos" && eventos.length === 0) {
      setLoadingTab(true);
      api.get("/gallery?category=evento").then((data) => setEventos(Array.isArray(data) ? data : [])).catch((err) => console.warn("[fetch]", err)).finally(() => setLoadingTab(false));
    } else if (activeTab === "instalaciones" && instalaciones.length === 0) {
      setLoadingTab(true);
      api.get("/gallery?category=instalaciones").then((data) => setInstalaciones(Array.isArray(data) ? data : [])).catch((err) => console.warn("[fetch]", err)).finally(() => setLoadingTab(false));
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    api.get("/gallery").then((data) => {
      const arr = Array.isArray(data) ? data : [];
      setImages(arr.map((img: any) => ({ id: img.id, label: img.label || "", image: img.image, size: img.size || "medium" })));
    })
      .catch((err) => console.warn("[fetch]", err))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(images.length / PER_PAGE);
  const paginated = images.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  useEffect(() => { setPage(1); }, [images.length]);

  return (
    <>
      <SEO title="Galería" description="Galería de trabajos realizados en nuestro taller." pageSEO={seo} />
      <main className="pt-16">
        <section className="relative py-20 lg:py-28 min-h-[400px] flex items-center overflow-hidden bg-surface-primary">
          <div className="absolute inset-0">
            <img key={heroIdx} src={heroImages[heroIdx]} alt="Taller" loading="lazy"
              className="w-full h-full object-cover animate-fadeIn"
            />
            <div className="absolute inset-0 bg-black/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 w-full">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-4xl md:text-5xl font-heading font-bold text-white">Proyectos <span className="text-transparent bg-clip-text bg-gradient-to-r from-interactive-accent to-orange-400">realizados</span></h1>
                <p className="mt-3 text-base md:text-lg text-white/70">Conoce los trabajos que hemos realizado en nuestro taller.</p>
              </motion.div>
            </div>
        </section>

        <section className="py-12 bg-surface-primary min-h-[50vh]">
          <div className="mx-auto max-w-7xl px-4">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-interactive-accent text-white shadow-lg shadow-interactive-accent/25"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-tertiary"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Fotos */}
            {activeTab === "fotos" && (
              <>
              {loading ? (
                <div className="columns-2 md:columns-3 gap-4 space-y-4">
                  {[1,2,3,4,5,6].map((i) => (
                    <div key={i} className="rounded-2xl bg-surface-tertiary/50 animate-pulse" style={{ height: `${150 + i * 30}px` }} />
                  ))}
                </div>
              ) : images.length === 0 ? (
                <EmptyState title="No hay imágenes disponibles" />
              ) : (
                <>
                <div className="columns-2 md:columns-3 gap-4 space-y-4">
                  {paginated.map((item, i) => (
                    <motion.button key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                      onClick={() => setOpen(item)}
                      className="group relative w-full rounded-2xl overflow-hidden border border-border hover:border-interactive-accent/40 transition-all"
                    >
                      <img src={item.image} alt={item.label} loading="lazy"
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
              </>
            )}

            {/* Videos */}
            {activeTab === "videos" && (
              <>
              {loadingTab ? (
                <Spinner size="md" />
              ) : videos.length === 0 ? (
                <EmptyState icon={<Play className="w-8 h-8 text-text-tertiary" />} title="Próximamente" description="Tendremos videos disponibles pronto" />
              ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video: any) => (
                  <motion.div
                    key={video.id || video.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="group relative bg-surface-secondary border border-border-subtle rounded-2xl overflow-hidden cursor-pointer"
                  >
                    <div className="aspect-video bg-gradient-to-br from-interactive-accent/20 to-blue-900/30 flex items-center justify-center">
                      {video.image ? (
                        <img src={video.image} alt={video.label} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-interactive-accent/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-7 h-7 text-white ml-0.5" fill="white" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-text-primary">{video.label || video.title}</h3>
                      {video.description && <p className="text-xs text-text-secondary mt-1">{video.description}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
              )}
              </>
            )}

            {/* Antes/Después */}
            {activeTab === "antes-despues" && (
              <>
              {loadingTab ? (
                <Spinner size="md" />
              ) : beforeAfter.length === 0 ? (
                <EmptyState title="No hay proyectos antes/después disponibles" />
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  {beforeAfter.map((item: any) => (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                      className="bg-surface-secondary border border-border rounded-2xl overflow-hidden"
                    >
                      <div className="grid grid-cols-2">
                        <div className="relative">
                          <img src={item.before_image || item.before} alt="Antes" loading="lazy" className="w-full h-48 object-cover" />
                          <span className="absolute top-2 left-2 bg-red-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">ANTES</span>
                        </div>
                        <div className="relative">
                          <img src={item.after_image || item.after} alt="Después" loading="lazy" className="w-full h-48 object-cover" />
                          <span className="absolute top-2 right-2 bg-green-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">DESPUÉS</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-bold text-text-primary">{item.label || item.title || "Proyecto"}</h3>
                        <p className="text-xs text-text-secondary mt-1">{item.description || ""}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              </>
            )}

            {/* Eventos */}
            {activeTab === "eventos" && (
              <>
              {loadingTab ? (
                <Spinner size="md" />
              ) : eventos.length === 0 ? (
                <EmptyState title="No hay eventos disponibles" />
              ) : (
                <div className="columns-2 md:columns-3 gap-4 space-y-4">
                  {eventos.map((item: any, i: number) => (
                    <motion.button key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                      onClick={() => setOpen(item)}
                      className="group relative w-full rounded-2xl overflow-hidden border border-border hover:border-interactive-accent/40 transition-all"
                    >
                      <img src={item.image} alt={item.label || ""} loading="lazy" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                        <p className="text-sm font-semibold text-text-primary">{item.label || "Evento"}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
              </>
            )}

            {/* Instalaciones */}
            {activeTab === "instalaciones" && (
              <>
              {loadingTab ? (
                <Spinner size="md" />
              ) : instalaciones.length === 0 ? (
                <EmptyState title="No hay imágenes de instalaciones disponibles" />
              ) : (
                <div className="columns-2 md:columns-3 gap-4 space-y-4">
                  {instalaciones.map((item: any, i: number) => (
                    <motion.button key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                      onClick={() => setOpen(item)}
                      className="group relative w-full rounded-2xl overflow-hidden border border-border hover:border-interactive-accent/40 transition-all"
                    >
                      <img src={item.image} alt={item.label || ""} loading="lazy" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                        <p className="text-sm font-semibold text-text-primary">{item.label || "Instalación"}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
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
                <img src={open.image} alt={open.label} loading="lazy" className="w-full h-[50vh] object-cover" />
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
                  href={`https://wa.me/${config.social_whatsapp || "525551234567"}?text=${encodeURIComponent(`Hola, quisiera una cotización para un trabajo similar a "${open.label}". Mi moto es una [marca/modelo/año].`)}`}
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


    </>
  );
}
