import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { SEO } from "@/components/SEO";
import { Spinner, Badge } from "@/components/ui";
import { useConfig } from "@/providers/CMSProvider";
import { api } from "@/api/client";
import { ServiceTimeline, ServiceStatusProgress, STATUS_STEPS, STATUS_COLORS, STATUS_LABELS } from "../components/ServiceTimeline";
import { Search, FileText, Shield, CheckCircle, Clock, User, Camera, ThumbsUp, XCircle, AlertCircle, Wrench } from "lucide-react";

const formatDate = (d: string) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
};

export default function EstadoServicio() {
  const config = useConfig();
  const [searchType, setSearchType] = useState<"orden" | "placa" | "documento">("orden");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [current, setCurrent] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [warranty, setWarranty] = useState<any>(null);
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
    if (!current?.id) { setInvoices([]); setWarranty(null); return; }
    api.get(`/invoices?order_id=${current.id}`).then(d => setInvoices(Array.isArray(d) ? d : [])).catch(() => setInvoices([]));
    api.get(`/warranties?entity_id=${current.id}`).then(d => setWarranty(d || null)).catch(() => setWarranty(null));
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
    const q = searchQuery.trim();
    if (!q) return;
    setSearchLoading(true);
    setError(false);
    try {
      const endpoint = searchType === "orden"
        ? `/service-requests/search?q=${encodeURIComponent(q)}&type=orden`
        : searchType === "placa"
          ? `/orders/search?q=${encodeURIComponent(q)}&type=plate`
          : `/orders/search?q=${encodeURIComponent(q)}&type=document`;
      const data = await api.get(endpoint);
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
    setSearchQuery("");
    setCurrent(null);
    setTimeline([]);
    setInvoices([]);
    setWarranty(null);
    setError(false);
    if (pollRef.current) clearInterval(pollRef.current);
  };

  const currentStepIndex = current ? STATUS_STEPS.findIndex(s => s.key === current.status) : -1;

  return (
    <>
      <SEO title="Consulta tu servicio | MotoPro" description="Ingresa el ID de tu servicio y conoce en tiempo real el estado y avance de tu moto." />
      <main className="bg-surface-primary min-h-screen pt-16">
        {/* Hero */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&h=1080&fit=crop"
              alt="Moto" loading="lazy"
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
              <div className="flex items-center gap-1 mb-5 bg-surface-tertiary rounded-lg p-1 w-fit">
                {(["orden", "placa", "documento"] as const).map((type) => (
                  <button key={type} onClick={() => { setSearchType(type); setSearchQuery(""); }}
                    className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                      searchType === type ? "bg-interactive-accent text-black" : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {type === "orden" ? "Orden" : type === "placa" ? "Placa" : "Documento"}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doSearch()}
                    placeholder={searchType === "orden" ? "Ej: MP-2024-000123" : searchType === "placa" ? "Ej: ABC-123" : "Ej: 1234567890"}
                    className="w-full rounded-lg border border-border bg-surface-tertiary px-4 py-3.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-accent transition-colors"
                  />
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                </div>
                <button
                  onClick={doSearch}
                  disabled={!searchQuery.trim() || searchLoading}
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
                {searchType === "orden" ? "Puedes encontrar tu ID en la factura o comprobante de servicio." : searchType === "placa" ? "Ingresa el número de placa de tu moto." : "Ingresa el número de documento con el que registraste el servicio."}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Results */}
        <section className="pb-16">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <EmptyState
                    icon={<Search className="w-8 h-8 text-text-tertiary" />}
                    title="Servicio no encontrado"
                    description="No encontramos un servicio con ese ID"
                    action={<button onClick={resetSearch} className="text-sm text-interactive-accent hover:text-interactive-accent-hover underline">Intentar de nuevo</button>}
                  />
                </motion.div>
              )}

              {current && (
                <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  {/* Service Header */}
                  <div className="bg-surface-secondary border border-border rounded-2xl p-6 md:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-interactive-accent/10 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-interactive-accent" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xl font-bold text-text-primary">Servicio #{current.id?.slice(0, 8).toUpperCase()}</h2>
                            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[current.status] || "bg-surface-tertiary/50 text-text-secondary"}`}>
                              {STATUS_LABELS[current.status] || current.status}
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary mt-1">
                            <Clock className="w-3.5 h-3.5 inline mr-1 text-text-tertiary" />
                            Ingreso: {current.created_at ? formatDate(current.created_at) : "—"}
                            {current.brand_model && ` · ${current.brand_model}`}
                            {current.plate && ` · Placa: ${current.plate}`}
                          </p>
                        </div>
                      </div>
                      <button onClick={resetSearch}
                        className="text-sm text-interactive-accent hover:text-interactive-accent-hover transition-colors shrink-0"
                      >
                        ← Nueva consulta
                      </button>
                    </div>

                    {/* Amazon-style Horizontal Progress Tracker */}
                    <div className="mb-8 overflow-x-auto">
                      <div className="flex items-center min-w-[640px]">
                        {STATUS_STEPS.slice(0, -1).map((step, i) => {
                          const isComplete = currentStepIndex >= i;
                          const isCurrent = currentStepIndex === i;
                          const stepIcon = step.icon;
                          return (
                            <div key={step.key} className="flex-1 flex flex-col items-center relative">
                              <div className="flex items-center w-full">
                                {/* Connecting line before */}
                                {i > 0 && (
                                  <div className={`flex-1 h-0.5 ${isComplete ? "bg-interactive-accent" : "bg-surface-tertiary"}`} />
                                )}
                                {/* Step circle */}
                                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                                  isComplete
                                    ? "bg-interactive-accent border-interactive-accent"
                                    : isCurrent
                                      ? "bg-interactive-accent/10 border-interactive-accent animate-pulse"
                                      : "bg-surface-tertiary border-border"
                                }`}>
                                  {isComplete ? (
                                    <CheckCircle className="w-5 h-5 text-black" />
                                  ) : (
                                    <stepIcon className={`w-4 h-4 ${isCurrent ? "text-interactive-accent" : "text-text-tertiary"}`} />
                                  )}
                                </div>
                                {/* Connecting line after */}
                                <div className={`flex-1 h-0.5 ${isComplete && i < STATUS_STEPS.length - 2 ? "bg-interactive-accent" : "bg-surface-tertiary"}`} />
                              </div>
                              <span className={`mt-2 text-[10px] font-semibold whitespace-nowrap ${
                                isCurrent ? "text-interactive-accent" : isComplete ? "text-text-primary" : "text-text-tertiary"
                              }`}>
                                {step.label}
                              </span>
                              {isCurrent && (
                                <span className="text-[9px] text-interactive-accent/70 mt-0.5">Actual</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Top Stats Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      <div className="bg-surface-tertiary rounded-xl p-4 text-center">
                        <p className="text-xs text-text-tertiary mb-1">Progreso</p>
                        <p className="text-2xl font-bold text-interactive-accent">
                          {Math.round(((currentStepIndex + 1) / STATUS_STEPS.length) * 100)}%
                        </p>
                      </div>
                      <div className="bg-surface-tertiary rounded-xl p-4 text-center">
                        <p className="text-xs text-text-tertiary mb-1">Tiempo estimado</p>
                        <p className="text-sm font-bold text-text-primary">2-3 días hábiles</p>
                      </div>
                      <div className="bg-surface-tertiary rounded-xl p-4 text-center">
                        <p className="text-xs text-text-tertiary mb-1">Estado</p>
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border inline-block mt-0.5 ${STATUS_COLORS[current.status] || "bg-surface-tertiary/50 text-text-secondary"}`}>
                          {STATUS_LABELS[current.status] || current.status}
                        </span>
                      </div>
                      <div className="bg-surface-tertiary rounded-xl p-4 text-center">
                        <p className="text-xs text-text-tertiary mb-1">Actualizado</p>
                        <p className="text-sm font-bold text-text-primary">Hoy</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div>
                        {/* Service Details */}
                        <div className="space-y-3 mb-6">
                          <h3 className="text-sm font-bold text-text-primary mb-3">Detalles del servicio</h3>
                          {current.service_type && (
                            <div className="flex items-center gap-3">
                              <Wrench className="w-4 h-4 text-text-tertiary shrink-0" />
                              <div>
                                <p className="text-xs text-text-tertiary">Servicio contratado</p>
                                <p className="text-sm text-text-primary font-medium">{current.service_type}</p>
                              </div>
                            </div>
                          )}
                          {current.observations && (
                            <div className="flex items-start gap-3">
                              <FileText className="w-4 h-4 text-text-tertiary shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs text-text-tertiary">Observaciones del técnico</p>
                                <p className="text-sm text-text-primary">{current.observations}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Mechanic Card */}
                        {current.mechanic && (
                          <div className="bg-surface-tertiary border border-border rounded-xl p-4 mb-4">
                            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                              <User className="w-3.5 h-3.5" />
                              Mecánico asignado
                            </h4>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-interactive-accent/20 flex items-center justify-center text-interactive-accent font-bold text-lg shrink-0">
                                {current.mechanic.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-text-primary">{current.mechanic}</p>
                                <p className="text-xs text-text-tertiary">Técnico certificado</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Timeline */}
                        {timeline.length > 0 && (
                          <div className="bg-surface-tertiary border border-border rounded-xl p-4">
                            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Historial de cambios</h3>
                            {timelineLoading ? (
                              <Spinner size="sm" />
                            ) : (
                              <ServiceTimeline entries={timeline} />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right Column */}
                      <div>
                        {/* Progress Photos */}
                        <div className="mb-4">
                          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Camera className="w-3.5 h-3.5" />
                            Fotos de avance
                          </h4>
                          {current.photos && Array.isArray(current.photos) && current.photos.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                              {current.photos.map((photo: string, i: number) => (
                                <div key={i} className="rounded-lg overflow-hidden border border-border group relative">
                                  <img src={photo} alt={`Avance ${i + 1}`} loading="lazy" className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300" />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-surface-tertiary border border-border rounded-xl p-6 text-center">
                              <Camera className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
                              <p className="text-xs text-text-tertiary">Las fotos de avance aparecerán durante el servicio.</p>
                            </div>
                          )}
                        </div>

                        {/* Customer Approval Status */}
                        <div className="bg-surface-tertiary border border-border rounded-xl p-4 mb-4">
                          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            Aprobación del cliente
                          </h4>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              current.approval_status === "approved" ? "bg-green-500/20 text-green-400" :
                              current.approval_status === "rejected" ? "bg-red-500/20 text-red-400" :
                              "bg-amber-500/20 text-amber-400"
                            }`}>
                              {current.approval_status === "approved" ? <CheckCircle className="w-5 h-5" /> :
                               current.approval_status === "rejected" ? <XCircle className="w-5 h-5" /> :
                               <AlertCircle className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-text-primary">
                                {current.approval_status === "approved" ? "Presupuesto aprobado" :
                                 current.approval_status === "rejected" ? "Presupuesto rechazado" :
                                 "Esperando aprobación"}
                              </p>
                              <p className="text-xs text-text-tertiary">
                                {current.approval_status === "approved" ? "El trabajo está en marcha" :
                                 current.approval_status === "rejected" ? "Contactaremos para ajustar" :
                                 "Revisa el presupuesto enviado"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Parts used */}
                        <div className="bg-surface-tertiary border border-border rounded-xl p-4 mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Repuestos utilizados</span>
                          </div>
                          {current.parts && Array.isArray(current.parts) && current.parts.length > 0 ? (
                            <div className="space-y-2">
                              {current.parts.map((part: any, i: number) => (
                                <div key={i} className="flex justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                                  <span className="text-text-secondary">{part.name}</span>
                                  <div className="text-right">
                                    <span className="text-text-primary font-medium">${part.price?.toLocaleString() || "—"}</span>
                                    {part.quantity > 1 && <span className="text-text-tertiary text-[10px] ml-1">x{part.quantity}</span>}
                                  </div>
                                </div>
                              ))}
                              <div className="flex justify-between text-sm font-bold pt-2 border-t border-border">
                                <span className="text-text-primary">Total repuestos</span>
                                <span className="text-interactive-accent">
                                  ${current.parts.reduce((sum: number, p: any) => sum + (p.price || 0) * (p.quantity || 1), 0).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ) : current.description?.includes("Repuestos") || current.description?.toLowerCase().includes("cambio") ? (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm py-1.5 border-b border-border/50">
                                <span className="text-text-secondary">{current.description?.split(",")[0] || "Kit de arrastre"}</span>
                                <span className="text-text-primary font-medium">$150,000</span>
                              </div>
                              <div className="flex justify-between text-sm py-1.5 border-b border-border/50">
                                <span className="text-text-secondary">Aceite de motor</span>
                                <span className="text-text-primary font-medium">$45,000</span>
                              </div>
                              <div className="flex justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                                <span className="text-text-secondary">Filtro de aceite</span>
                                <span className="text-text-primary font-medium">$25,000</span>
                              </div>
                              <div className="flex justify-between text-sm font-bold pt-2 border-t border-border">
                                <span className="text-text-primary">Total repuestos</span>
                                <span className="text-interactive-accent">$220,000</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-text-tertiary">Los repuestos utilizados se actualizarán durante el servicio.</p>
                          )}
                        </div>

                        {/* WhatsApp */}
                        <div className="bg-surface-tertiary border border-border rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-xl">💬</span>
                            <div>
                              <p className="text-sm font-bold text-text-primary">¿Tienes dudas?</p>
                              <p className="text-xs text-text-secondary">Contáctanos y con gusto te ayudaremos.</p>
                            </div>
                          </div>
                          <a
                            href={`https://wa.me/${config.social_whatsapp || "525551234567"}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full rounded-lg bg-interactive-accent/10 border border-interactive-accent/30 py-2.5 text-sm font-semibold text-interactive-accent hover:bg-interactive-accent/20 transition-all"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Contactar por WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  {timeline.length > 0 && (
                    <div className="bg-surface-secondary border border-border rounded-2xl p-6 md:p-8">
                      <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-text-tertiary" />
                        Línea de tiempo
                      </h3>
                      {timelineLoading ? (
                        <Spinner size="sm" />
                      ) : (
                        <ServiceTimeline entries={timeline} />
                      )}
                    </div>
                  )}

                  {/* Invoices */}
                  {invoices.length > 0 && (
                    <div className="bg-surface-secondary border border-border rounded-2xl p-6 md:p-8">
                      <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-text-tertiary" />
                        Facturas
                      </h3>
                      <div className="space-y-3">
                        {invoices.map((inv: any) => (
                          <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-tertiary border border-border">
                            <div>
                              <p className="text-sm font-semibold text-text-primary">Factura #{inv.number || inv.id}</p>
                              <p className="text-xs text-text-tertiary">{inv.date ? new Date(inv.date).toLocaleDateString("es-ES") : ""}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-interactive-accent">${inv.amount?.toLocaleString() || "—"}</p>
                              <Badge variant={inv.status === "paid" ? "success" : inv.status === "pending" ? "warning" : "default"}>
                                {inv.status === "paid" ? "Pagada" : inv.status === "pending" ? "Pendiente" : inv.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warranty */}
                  {warranty && (
                    <div className="bg-surface-secondary border border-border rounded-2xl p-6 md:p-8">
                      <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-text-tertiary" />
                        Garantía
                      </h3>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-surface-tertiary border border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-text-primary">{warranty.type || "Garantía de servicio"}</p>
                            <p className="text-xs text-text-tertiary">
                              {warranty.end_date ? `Vence: ${new Date(warranty.end_date).toLocaleDateString("es-ES")}` : ""}
                            </p>
                          </div>
                        </div>
                        {warranty.end_date && (
                          <div className="text-right">
                            <p className="text-xs text-text-tertiary">
                              {Math.max(0, Math.ceil((new Date(warranty.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} días restantes
                            </p>
                            <Badge variant={new Date(warranty.end_date) > new Date() ? "success" : "error"}>
                              {new Date(warranty.end_date) > new Date() ? "Vigente" : "Expirada"}
                            </Badge>
                          </div>
                        )}
                      </div>
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

    </>
  );
}
