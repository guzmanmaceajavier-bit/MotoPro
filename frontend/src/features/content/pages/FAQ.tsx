import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

import { useConfig } from "@/providers/CMSProvider";
import { SEO } from "@/components/SEO";
import { Spinner } from "@/components/ui";
import { api } from "@/api/client";

const categoryIcons: Record<string, string> = {
  general: "❓", servicios: "🔧", tienda: "🛒", facturacion: "💰", garantias: "🛡️",
};

export default function FAQ() {
  const config = useConfig();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    api.get("/faqs").then(d => setFaqs(Array.isArray(d) ? d : [])).catch(() => setFaqs([])).finally(() => setLoading(false));
  }, []);

  const filtered = faqs.filter(f => !search || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase()));
  const categories = [...new Set(filtered.map(f => f.category || "general"))];

  return (
    <>
      <SEO title="Preguntas Frecuentes | MotoPro" />
      <main className="bg-surface-primary min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold text-interactive-accent uppercase tracking-[0.2em]">FAQ</span>
            <h1 className="text-3xl font-bold text-text-primary mt-2">Preguntas frecuentes</h1>
            <p className="text-text-secondary mt-2">Respuestas a las dudas más comunes sobre nuestros servicios.</p>
          </div>

          <div className="relative mb-8">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar preguntas..."
              className="w-full rounded-lg border border-border bg-surface-tertiary pl-11 pr-4 py-3.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-accent"
            />
          </div>

          {loading ? (
            <Spinner size="md" />
          ) : filtered.length === 0 ? (
            <EmptyState title="No se encontraron resultados" description="Intenta con otros términos de búsqueda" />
          ) : (
            <div className="space-y-8">
              {categories.map(cat => (
                <div key={cat}>
                  <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span>{categoryIcons[cat] || "❓"}</span>
                    <span className="text-text-secondary">{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                  </h2>
                  <div className="space-y-2">
                    {filtered.filter(f => (f.category || "general") === cat).map(faq => (
                      <motion.div key={faq.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-surface-secondary border border-border rounded-lg overflow-hidden"
                      >
                        <button onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                          className="w-full flex items-center justify-between p-4 text-left"
                        >
                          <span className="text-sm font-medium text-text-primary pr-4">{faq.question}</span>
                          <svg className={`w-4 h-4 text-text-tertiary shrink-0 transition-transform ${openId === faq.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                        <AnimatePresence>
                          {openId === faq.id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <p className="px-4 pb-4 text-sm text-text-secondary leading-relaxed">{faq.answer}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contacto CTA */}
          <div className="text-center py-12 border-t border-border mt-12">
            <h3 className="text-xl font-bold text-text-primary mb-2">¿No encuentras lo que buscas?</h3>
            <p className="text-text-secondary mb-6">Contáctanos directamente y resolveremos tus dudas.</p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/contacto" className="inline-flex items-center gap-2 rounded-lg bg-interactive-accent px-6 py-3 font-semibold text-black hover:bg-interactive-accent-hover transition-all">
                <MessageCircle size={18} /> Contacto directo
              </Link>
              <a href={`https://wa.me/${config.social_whatsapp || "573001234567"}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-interactive-accent px-6 py-3 font-semibold text-interactive-accent hover:bg-interactive-accent/10 transition-all">
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>

    </>
  );
}
