import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { api } from "@/api/client";

export default function LegalPage() {
  const params = useParams();
  const location = useLocation();
  const slug = params.slug || location.pathname.replace(/^\//, "");
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    api.get(`/legal/slug/${slug}`).then((data) => {
      setPage(data?.data || data || null);
    }).catch(() => setPage(null)).finally(() => setLoading(false));
  }, [slug]);

  const titleMap: Record<string, string> = {
    privacidad: "Política de Privacidad",
    terminos: "Términos y Condiciones",
  };

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="relative overflow-hidden bg-surface-primary pt-28 pb-16">
          <div className="absolute inset-0 bg-gradient-to-b from-interactive-accent/5 via-transparent to-transparent" />
          <div className="mx-auto max-w-3xl px-6 lg:px-8 relative">
            <Link to="/" className="inline-flex items-center gap-2 text-body-sm text-text-tertiary hover:text-text-secondary transition-colors mb-6">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
              Volver al inicio
            </Link>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-10 w-64 bg-surface-tertiary rounded-lg" />
                <div className="h-4 w-full bg-surface-tertiary rounded-lg" />
                <div className="h-4 w-3/4 bg-surface-tertiary rounded-lg" />
                <div className="h-4 w-5/6 bg-surface-tertiary rounded-lg" />
              </div>
            ) : page ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-h2 lg:text-h1 text-text-primary tracking-tight mb-6">{page.title}</h1>
                <div
                  className="prose prose-invert max-w-none text-text-secondary leading-relaxed space-y-4 [&_h2]:text-h4 [&_h2]:text-text-primary [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-h5 [&_h3]:text-text-primary [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-body [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_li]:text-body [&_a]:text-interactive-accent [&_a]:hover:underline"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
              </motion.div>
            ) : (
              <div className="text-center py-16">
                <p className="text-body text-text-tertiary">Página no encontrada</p>
                <Link to="/" className="text-interactive-accent hover:underline mt-4 inline-block">Volver al inicio</Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
