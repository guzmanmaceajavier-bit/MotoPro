import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { SEO } from "@/components/SEO";
import { api } from "@/api/client";

export default function Comparar() {
  const [products, setProducts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/products?all=1").then(d => {
      const items = Array.isArray(d) ? d : d?.data || [];
      setProducts(items);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleProduct = (p: any) => {
    if (selected.find(s => s.id === p.id)) {
      setSelected(selected.filter(s => s.id !== p.id));
    } else if (selected.length < 4) {
      setSelected([...selected, p]);
    }
  };

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  const specs = ["price", "stock", "brand_name"] as const;
  const specLabels: Record<string, string> = { price: "Precio", stock: "Stock", brand_name: "Marca" };

  return (
    <>
      <SEO title="Comparar productos | MotoPro" />
      <Navbar />
      <main className="bg-surface-primary min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold text-interactive-accent uppercase tracking-[0.2em]">Comparar</span>
            <h1 className="text-3xl font-bold text-text-primary mt-2">Compara productos</h1>
            <p className="text-text-secondary mt-2">Selecciona hasta 4 productos para comparar.</p>
          </div>

          {/* Selected */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 min-h-[200px]">
            {Array.from({ length: 4 }).map((_, i) => {
              const p = selected[i];
              return (
                <div key={i} className={`rounded-lg border-2 border-dashed p-4 flex items-center justify-center min-h-[180px] transition-all ${p ? "border-interactive-accent/40 bg-surface-secondary" : "border-border"}`}>
                  {p ? (
                    <div className="text-center w-full">
                      <div className="w-20 h-20 mx-auto rounded-lg bg-surface-tertiary flex items-center justify-center mb-3 overflow-hidden">
                        {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-3xl opacity-30">🏍️</span>}
                      </div>
                      <p className="text-sm font-semibold text-text-primary truncate">{p.name}</p>
                      <p className="text-lg font-bold text-interactive-accent">${Number(p.price).toLocaleString()}</p>
                      <button onClick={() => toggleProduct(p)} className="mt-2 text-xs text-red-400 hover:text-red-300">Quitar</button>
                    </div>
                  ) : (
                    <p className="text-xs text-text-tertiary text-center">{i === 0 ? "Busca y selecciona productos" : `Producto ${i + 1}`}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Search */}
          {selected.length < 4 && (
            <div className="relative mb-6">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar productos..."
                className="w-full rounded-lg border border-border bg-surface-tertiary pl-11 pr-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-accent"
              />
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-interactive-accent border-t-transparent rounded-full animate-spin" /></div>
          ) : selected.length < 4 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filtered.filter(p => !selected.find(s => s.id === p.id)).slice(0, 20).map(p => (
                <button key={p.id} onClick={() => toggleProduct(p)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-secondary border border-border hover:border-border-accent text-left transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-surface-tertiary flex items-center justify-center shrink-0 overflow-hidden">
                    {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-xl opacity-30">🏍️</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">{p.name}</p>
                    <p className="text-xs text-interactive-accent font-semibold">${Number(p.price).toLocaleString()}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Comparison table */}
          {selected.length >= 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 bg-surface-secondary border border-border rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-4 text-left text-text-secondary font-medium w-32">Especificación</th>
                    {selected.map(p => (
                      <th key={p.id} className="p-4 text-center text-text-primary font-semibold">{p.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-4 text-text-secondary">Imagen</td>
                    {selected.map(p => (
                      <td key={p.id} className="p-4 text-center">
                        <div className="w-16 h-16 mx-auto rounded-lg bg-surface-tertiary flex items-center justify-center overflow-hidden">
                          {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-2xl opacity-30">🏍️</span>}
                        </div>
                      </td>
                    ))}
                  </tr>
                  {specs.map(spec => (
                    <tr key={spec} className="border-b border-border">
                      <td className="p-4 text-text-secondary">{specLabels[spec]}</td>
                      {selected.map(p => (
                        <td key={p.id} className={`p-4 text-center font-medium ${spec === "price" ? "text-interactive-accent font-bold" : "text-text-primary"}`}>
                          {spec === "price" ? `$${Number(p[spec]).toLocaleString()}` : p[spec] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="p-4 text-text-secondary">Acción</td>
                    {selected.map(p => (
                      <td key={p.id} className="p-4 text-center">
                        <Link to={`/tienda/${p.slug || p.id}`}
                          className="inline-block rounded-lg bg-interactive-accent px-4 py-2 text-xs font-bold text-black hover:bg-interactive-accent-hover transition-colors">
                          Ver detalle
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
      <BackToTop />
      <WhatsAppFloat />
    </>
  );
}
