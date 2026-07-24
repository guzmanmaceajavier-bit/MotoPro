import { useState } from "react";
import { api } from "@/api/client";
import { motion } from "framer-motion";

interface ServiceRequest {
  id: string; name: string; phone: string; email: string;
  brand_model: string; service_type: string; plate: string;
  description: string; status: string; created_at: string;
}

const statusColors: Record<string, string> = {
  pendiente: "bg-yellow-500/10 text-yellow-500",
  "en taller": "bg-blue-500/10 text-blue-500",
  completado: "bg-green-500/10 text-green-500",
  cancelado: "bg-red-500/10 text-red-500",
};

export function ServiceInquiry() {
  const [searchType, setSearchType] = useState<"orden" | "placa" | "cedula">("orden");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ServiceRequest[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const data = await api.get(`/orders/search?q=${encodeURIComponent(query)}&type=${searchType}`);
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  };

  const placeholder = searchType === "orden" ? "Ej: SRV-001" : searchType === "placa" ? "Ej: ABC-123" : "Ej: 123456789";

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface-secondary)] p-6 md:p-8"
        >
          <form onSubmit={handleSearch}>
            <div className="mb-4 flex gap-2 flex-wrap">
              {(["orden", "placa", "cedula"] as const).map((type) => (
                <button key={type} type="button" onClick={() => { setSearchType(type); setQuery(""); setResults(null); setSearched(false); }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    searchType === type
                      ? "bg-interactive-accent text-white shadow-lg shadow-interactive-accent/25"
                      : "bg-[var(--surface-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]"
                  }`}
                >
                  {type === "orden" ? "N° Orden" : type === "placa" ? "Placa" : "Cédula"}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="input-premium flex-1"
              />
              <button type="submit" disabled={loading}
                className="btn-premium"
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                )}
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </form>
        </motion.div>

        {searched && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1,2].map((i) => (
                  <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-secondary)] p-5 space-y-3">
                    <div className="h-4 w-32 bg-[var(--surface-tertiary)] rounded animate-pulse" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-3 bg-[var(--surface-tertiary)] rounded animate-pulse" />
                      <div className="h-3 bg-[var(--surface-tertiary)] rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : results && results.length > 0 ? (
              results.map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-secondary)] p-5 hover:border-interactive-accent/30 transition-all"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[var(--text-secondary)]">{r.id}</span>
                      <span className="text-[10px] text-[var(--text-secondary)]">|</span>
                      <span className="text-xs text-[var(--text-secondary)]">{formatDate(r.created_at)}</span>
                    </div>
                    <span className={`badge-premium text-xs ${statusColors[r.status?.toLowerCase()] || "bg-gray-500/10 text-gray-500"}`}>
                      {r.status || "Pendiente"}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Cliente</span>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{r.name}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Contacto</span>
                      <p className="text-sm text-[var(--text-primary)]">{r.phone} {r.email ? `| ${r.email}` : ""}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Moto</span>
                      <p className="text-sm text-[var(--text-primary)]">{r.brand_model || "-"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Placa</span>
                      <p className="text-sm text-[var(--text-primary)]">{r.plate || "-"}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Servicio solicitado</span>
                      <p className="text-sm text-[var(--text-primary)]">{r.service_type || "-"}</p>
                    </div>
                    {r.description && (
                      <div className="sm:col-span-2">
                        <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Descripción</span>
                        <p className="text-sm text-[var(--text-secondary)]">{r.description}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-secondary)] p-8 text-center">
                <svg className="w-10 h-10 mx-auto mb-2 text-[var(--text-secondary)] opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <p className="text-[var(--text-secondary)]">No se encontraron resultados para "{query}"</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
