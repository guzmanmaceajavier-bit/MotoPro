import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { SEO } from "@/components/SEO";
import { api } from "@/api/client";

const statusSteps = [
  { key: "pending", label: "Recepción e inspección", desc: "Hemos recibido tu solicitud" },
  { key: "in_progress", label: "Diagnóstico", desc: "Estamos evaluando tu moto" },
  { key: "approved", label: "En reparación", desc: "Trabajando en tu servicio" },
  { key: "testing", label: "Pruebas de calidad", desc: "Verificando el resultado" },
  { key: "completed", label: "Listo para entregar", desc: "Tu moto está lista" },
];

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  approved: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  testing: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  in_progress: "En Progreso",
  approved: "Aprobado",
  testing: "En pruebas",
  completed: "Completado",
  cancelled: "Cancelado",
};

const formatDate = (d: string) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
};

function ServiceTimeline({ entries }: { entries: any[] }) {
  if (entries.length === 0) return <p className="text-sm text-text-tertiary py-4 text-center">Sin actividad registrada</p>;
  return (
    <div className="relative pl-8 space-y-5">
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-interactive-accent/40 via-blue-500/30 to-transparent" />
      {entries.map((e: any, i: number) => (
        <motion.div key={e.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="relative">
          <div className={`absolute -left-8 mt-1.5 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center ${
            e.status === "completed" ? "bg-interactive-accent border-interactive-accent" : "bg-surface-secondary border-interactive-accent"
          }`}>
            {e.status === "completed" && (
              <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            )}
          </div>
          <div className="rounded-lg border border-border bg-surface-secondary p-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[e.status] || "bg-surface-tertiary/50 text-text-secondary"}`}>
                {statusLabels[e.status] || e.status}
              </span>
              {e.created_at && <span className="text-[10px] text-text-tertiary">{formatDate(e.created_at)}</span>}
            </div>
            {e.description && <p className="text-xs text-text-secondary mt-1">{e.description}</p>}
            {e.image && (
              <img src={e.image} alt="Evidencia" className="mt-2 rounded-lg max-h-40 object-cover" />
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function EstadoServicio() {
  const [searchId, setSearchId] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [current, setCurrent] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [error, setError] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    if (!current?.id) { setTimeline([]); return; }
    setTimelineLoading(true);
    api.get(`/timeline?order_id=${encodeURIComponent(current.id)}`).then((data) => {
      setTimeline(Array.isArray(data) ? data : []);
    }).catch(() => setTimeline([])).finally(() => setTimelineLoading(false));
  }, [current?.id]);

  useEffect(() => {
    if (!current?.id || current.status === "completed" || current.status === "cancelled") {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(async () => {
      try {
        const data = await api.get(`/service-requests/search?q=${encodeURIComponent(current.id)}&type=orden`);
        const arr = Array.isArray(data) ? data : data?.data ? data.data : [];
        if (arr.length > 0) setCurrent(arr[0]);
      } catch {}
    }, 30000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [current?.id, current?.status]);

  const doSearch = async () => {
    const id = searchId.trim();
    if (!id) return;
    setSearchLoading(true);
    setError(false);
    try {
      const data = await api.get(`/service-requests/search?q=${encodeURIComponent(id)}&type=orden`);
      const arr = Array.isArray(data) ? data : data?.data ? data.data : [];
      if (arr.length > 0) {
        setCurrent(arr[0]);
      } else {
        setCurrent(null);
        setError(true);
      }
    } catch {
      setCurrent(null);
      setError(true);
    } finally {
      setSearchLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchId("");
    setCurrent(null);
    setTimeline([]);
    setError(false);
    if (pollRef.current) clearInterval(pollRef.current);
  };

  const currentStepIndex = current ? statusSteps.findIndex(s => s.key === current.status) : -1;

  return (
    <>
      <SEO title="Consulta tu servicio | MotoPro" description="Ingresa el ID de tu servicio y conoce en tiempo real el estado y avance de tu moto." />
      <Navbar />
      <main className="bg-surface-primary min-h-screen pt-16">
        {/* Hero */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&h=1080&fit=crop"
              alt="Moto"
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-interactive-accent/10 border border-interactive-accent/30 text-interactive-accent text-xs font-semibold px-4 py-2 rounded-full mb-6"
              >
                <span className="w-2 h-2 bg-interactive-accent rounded-full animate-pulse" />
                SEGUIMIENTO DE SERVICIO
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight mb-4"
              >
                Consulta el estado{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r bg-interactive-accent">
                  de tu servicio
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-text-secondary"
              >
                Ingresa el ID de tu servicio y conoce en tiempo real el estado y avance de tu moto.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Search */}
        <section className="pb-8">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-surface-secondary border border-border rounded-2xl p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="text-sm text-text-secondary">ID del servicio</span>
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doSearch()}
                    placeholder="Ej: MP-2024-000123"
                    className="w-full rounded-lg border border-border bg-surface-tertiary px-4 py-3.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-accent transition-colors"
                  />
                  <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <button
                  onClick={doSearch}
                  disabled={!searchId.trim() || searchLoading}
                  className="shrink-0 flex items-center gap-2 rounded-lg bg-gradient-to-r bg-interactive-accent px-6 py-3.5 text-sm font-bold text-black hover:bg-interactive-accent-hover transition-all duration-300 shadow-elevation-2 disabled:opacity-40"
                >
                  {searchLoading ? "Buscando..." : "Consultar estado"}
                  {!searchLoading && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-3 text-xs text-text-tertiary flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                Puedes encontrar tu ID en la factura o comprobante de servicio.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Results */}
        <section className="pb-16">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-surface-secondary border border-border rounded-2xl p-8 text-center"
                >
                  <svg className="w-12 h-12 mx-auto text-text-tertiary mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <p className="text-text-secondary text-sm mb-4">No encontramos un servicio con ese ID</p>
                  <button onClick={resetSearch} className="text-sm text-interactive-accent hover:text-interactive-accent-hover underline">Intentar de nuevo</button>
                </motion.div>
              )}

              {current && (
                <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  {/* Service Header */}
                  <div className="bg-surface-secondary border border-border rounded-2xl p-6 md:p-8">
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-interactive-accent/10 flex items-center justify-center">
                          <svg className="w-6 h-6 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-4.655 4.655a2.121 2.121 0 01-3-3l4.655-4.655m0 0L4.5 10.5m2.92 4.67l4.655-4.655m0 0L12 6m-2.58 4.67l4.655-4.655" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-text-primary">Servicio #{current.id?.slice(0, 8).toUpperCase()}</h2>
                            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${statusColors[current.status] || "bg-surface-tertiary/50 text-text-secondary"}`}>
                              {statusLabels[current.status] || current.status}
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary mt-1">
                            Fecha de ingreso: {current.created_at ? formatDate(current.created_at) : "—"}
                            {current.brand_model && ` · ${current.brand_model}`}
                            {current.plate && ` · Placa: ${current.plate}`}
                          </p>
                        </div>
                      </div>
                      <button onClick={resetSearch}
                        className="text-sm text-interactive-accent hover:text-interactive-accent-hover transition-colors shrink-0"
                      >
                        Nueva consulta
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Timeline */}
                      <div>
                        <h3 className="text-sm font-bold text-text-primary mb-4">Estado actual</h3>
                        <div className="space-y-4">
                          {statusSteps.map((step, i) => {
                            const isComplete = i <= currentStepIndex;
                            const isCurrent = i === currentStepIndex;
                            return (
                              <div key={step.key} className="flex items-start gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                  isComplete
                                    ? "bg-interactive-accent"
                                    : "border-2 border-border bg-surface-tertiary"
                                }`}>
                                  {isComplete && (
                                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className={`text-sm font-semibold ${isCurrent ? "text-interactive-accent" : isComplete ? "text-text-primary" : "text-text-tertiary"}`}>
                                      {step.label}
                                    </p>
                                    {isCurrent && (
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-interactive-accent/10 text-interactive-accent">
                                        Actual
                                      </span>
                                    )}
                                  </div>
                                  {!isComplete && <p className="text-xs text-text-tertiary">Pendiente</p>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Details */}
                      <div>
                        <h3 className="text-sm font-bold text-text-primary mb-4">Detalles del servicio</h3>
                        <div className="space-y-3">
                          {current.service_type && (
                            <div className="flex items-center gap-3">
                              <svg className="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-4.655 4.655a2.121 2.121 0 01-3-3l4.655-4.655m0 0L4.5 10.5m2.92 4.67l4.655-4.655m0 0L12 6m-2.58 4.67l4.655-4.655" />
                              </svg>
                              <div>
                                <p className="text-xs text-text-tertiary">Servicio contratado</p>
                                <p className="text-sm text-text-primary font-medium">{current.service_type}</p>
                              </div>
                            </div>
                          )}
                          {current.mechanic && (
                            <div className="flex items-center gap-3">
                              <svg className="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                              </svg>
                              <div>
                                <p className="text-xs text-text-tertiary">Mecánico asignado</p>
                                <p className="text-sm text-text-primary font-medium">{current.mechanic}</p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <p className="text-xs text-text-tertiary">Tiempo estimado</p>
                              <p className="text-sm text-text-primary font-medium">2 - 3 días hábiles</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-text-tertiary mb-2">Progreso general</p>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-surface-tertiary rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r bg-interactive-accent rounded-full transition-all duration-500"
                                  style={{ width: `${Math.max(10, ((currentStepIndex + 1) / statusSteps.length) * 100)}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold text-interactive-accent">
                                {Math.round(((currentStepIndex + 1) / statusSteps.length) * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Parts used */}
                        <div className="mt-6 p-4 rounded-lg bg-surface-tertiary border border-border">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Repuestos utilizados</span>
                          </div>
                          {current.description?.includes("Repuestos") || current.description?.toLowerCase().includes("cambio") ? (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">{current.description?.split(",")[0] || "Kit de arrastre"}</span>
                                <span className="text-text-primary font-medium">$150,000</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Aceite de motor</span>
                                <span className="text-text-primary font-medium">$45,000</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Filtro de aceite</span>
                                <span className="text-text-primary font-medium">$25,000</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-text-tertiary">Los repuestos utilizados se actualizarán durante el servicio.</p>
                          )}
                          <div className="mt-3 pt-3 border-t border-border flex justify-between text-sm font-bold">
                            <span className="text-text-primary">Total repuestos</span>
                            <span className="text-interactive-accent">$220,000</span>
                          </div>
                        </div>
                        {/* WhatsApp */}
                        <div className="mt-4 p-4 rounded-lg bg-surface-tertiary border border-border">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">💬</span>
                            <div>
                              <p className="text-sm font-bold text-text-primary">¿Tienes dudas?</p>
                              <p className="text-xs text-text-secondary">Contáctanos y con gusto te ayudaremos.</p>
                            </div>
                          </div>
                          <a
                            href="https://wa.me/525551234567"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full rounded-lg bg-interactive-accent/10 border border-interactive-accent/30 py-2.5 text-sm font-semibold text-interactive-accent hover:bg-interactive-accent/20 transition-all"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Escribir por WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  {timeline.length > 0 && (
                    <div className="bg-surface-secondary border border-border rounded-2xl p-6 md:p-8">
                      <h3 className="text-sm font-bold text-text-primary mb-4">Línea de tiempo</h3>
                      {timelineLoading ? (
                        <div className="flex justify-center py-6">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-interactive-accent border-t-transparent" />
                        </div>
                      ) : (
                        <ServiceTimeline entries={timeline} />
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA for unregistered users */}
            {!current && !error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 bg-surface-secondary border border-border rounded-2xl p-6 md:p-8 text-center"
              >
                <p className="text-sm text-text-secondary mb-2">¿Quieres ver todos tus servicios?</p>
                <p className="text-xs text-text-tertiary mb-4">Regístrate para acceder a tu historial completo, citas, facturas y más.</p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r bg-interactive-accent px-6 py-3 text-sm font-bold text-black hover:bg-interactive-accent-hover transition-all duration-300"
                >
                  Iniciar sesión
                </Link>
              </motion.div>
            )}
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-12 border-t border-border">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: "🛡️", title: "Transparencia total", desc: "Te mantenemos informado en cada paso." },
                { icon: "🔄", title: "Actualizaciones en tiempo real", desc: "Consulta el estado de tu servicio cuando quieras." },
                { icon: "✅", title: "Servicio garantizado", desc: "Todos nuestros trabajos cuentan con garantía." },
                { icon: "🎧", title: "Atención personalizada", desc: "Nuestro equipo está listo para ayudarte." },
              ].map((badge) => (
                <div key={badge.title} className="flex items-start gap-3">
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{badge.title}</p>
                    <p className="text-xs text-text-tertiary mt-0.5">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />
      <WhatsAppFloat />
    </>
  );
}
