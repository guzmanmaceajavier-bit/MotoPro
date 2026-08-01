import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/api/client";
import { useConfig } from "@/providers/CMSProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  LifeBuoy, X, Search, MessageCircle, Phone, Mail, Clock, HelpCircle,
  ShieldCheck, RotateCcw, CreditCard, Truck, Calendar, ClipboardList,
  Wrench, ChevronRight, CheckCircle, MapPin,
} from "lucide-react";

const ACTIVE_WORK_STATUSES = ["pending", "in_diagnostic", "waiting_approval", "in_progress", "waiting_parts", "in_qc"];
const IN_TRANSIT_STATUSES = ["paid", "shipped", "processing"];

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
}

function formatHour(t?: string) {
  if (!t) return "";
  const [h, m] = t.split(":");
  if (!h) return t;
  const hour = Number(h);
  return `${String(hour % 12 || 12).padStart(2, "0")}:${m || "00"} ${hour >= 12 ? "p. m." : "a. m."}`;
}

export function HelpFloat() {
  const config = useConfig();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [ctx, setCtx] = useState<{ orders: any[]; appointments: any[]; warranties: any[] }>({ orders: [], appointments: [], warranties: [] });
  const [ctxLoading, setCtxLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    setCtxLoading(true);
    Promise.all([
      api.get("/customer-auth/orders").catch(() => []),
      api.get("/appointments/my").catch(() => []),
      api.get("/client/warranties").catch(() => []),
    ]).then(([orders, appointments, warranties]) => {
      setCtx({
        orders: Array.isArray(orders) ? orders : [],
        appointments: Array.isArray(appointments) ? appointments : [],
        warranties: Array.isArray(warranties) ? warranties : [],
      });
    }).finally(() => setCtxLoading(false));
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setOpen(false); setSearch(""); }, [pathname]);

  const contextual = useMemo(() => {
    if (!user || ctxLoading) return null;
    const cards: { icon: any; color: string; title: string; desc: string; href: string }[] = [];

    const workOrder = ctx.orders.find((o: any) => o.type === "service" && ACTIVE_WORK_STATUSES.includes(o.status));
    if (workOrder) {
      cards.push({
        icon: Wrench,
        color: "text-orange-500 bg-orange-500/10",
        title: "Tu moto está en reparación",
        desc: `Orden ${workOrder.order_number || workOrder.id?.slice(0, 8).toUpperCase()}. Ver estado.`,
        href: `/estado-servicio?id=${workOrder.id}`,
      });
    }

    const now = new Date();
    const nextAppt = ctx.appointments
      .filter((a: any) => a.status !== "cancelled")
      .sort((a: any, b: any) => new Date(`${a.appointment_date}T${a.start_time || "00:00"}`).getTime() - new Date(`${b.appointment_date}T${b.start_time || "00:00"}`).getTime())
      .find((a: any) => new Date(`${a.appointment_date}T${a.start_time || "00:00"}`).getTime() >= now.getTime());
    if (nextAppt) {
      const isTomorrow = Math.ceil((new Date(`${nextAppt.appointment_date}T00:00:00`).getTime() - new Date(new Date().toDateString()).getTime()) / 86400000) === 1;
      cards.push({
        icon: Calendar,
        color: "text-blue-500 bg-blue-500/10",
        title: isTomorrow ? "Tienes una cita programada para mañana" : "Tu próxima cita",
        desc: `${formatDate(nextAppt.appointment_date)} a las ${formatHour(nextAppt.start_time)}.`,
        href: "/mi-cuenta?tab=citas",
      });
    }

    const storeOrder = ctx.orders.find((o: any) => o.type === "store" && IN_TRANSIT_STATUSES.includes(o.status));
    if (storeOrder) {
      cards.push({
        icon: Truck,
        color: "text-emerald-500 bg-emerald-500/10",
        title: `Tu pedido #${storeOrder.id?.slice(0, 4).toUpperCase() || storeOrder.id} está en camino`,
        desc: "Sigue su estado en tiempo real.",
        href: "/mi-cuenta?tab=compras",
      });
    }

    const warranty = ctx.warranties
      .filter((w: any) => w.status !== "expired" && w.end_date)
      .sort((a: any, b: any) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime())
      .find((w: any) => new Date(w.end_date).getTime() >= now.getTime());
    if (warranty) {
      const days = Math.ceil((new Date(warranty.end_date).getTime() - now.getTime()) / 86400000);
      cards.push({
        icon: ShieldCheck,
        color: "text-purple-500 bg-purple-500/10",
        title: "Tienes una garantía activa",
        desc: days <= 30 ? `Vence en ${days} ${days === 1 ? "día" : "días"}.` : `Válida hasta ${formatDate(warranty.end_date)}.`,
        href: "/mi-cuenta?tab=garantias",
      });
    }

    return cards.slice(0, 4);
  }, [user, ctx, ctxLoading]);

  const whatsapp = config.social_whatsapp || "573001234567";
  const waHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hola, necesito ayuda.")}`;

  const topics = [
    { label: "Consultar una orden", desc: "Sigue tu reparación en tiempo real", href: "/consulta", icon: ClipboardList, cat: "Acciones rápidas", kw: "orden reparacion consultar pedido" },
    { label: "Estado del servicio", desc: "Trazabilidad de tu moto en el taller", href: "/estado-servicio", icon: Wrench, cat: "Acciones rápidas", kw: "servicio estado taller taller reparacion" },
    { label: "Seguimiento de compras", desc: "Historial y estado de tus pedidos", href: "/mi-cuenta?tab=compras", icon: Truck, cat: "Acciones rápidas", kw: "pedido compras seguimiento envio entrega" },
    { label: "Agendar una cita", desc: "Reserva horario con tu mecánico", href: "/agendar-cita", icon: Calendar, cat: "Acciones rápidas", kw: "cita agendar reservar" },
    { label: "Solicitar un diagnóstico", desc: "Envía fotos o video del problema", href: "/solicitar-servicio", icon: ClipboardList, cat: "Acciones rápidas", kw: "diagnostico solicitar revision problema" },
    { label: "Preguntas frecuentes", desc: "Respuestas a dudas comunes", href: "/faq", icon: HelpCircle, cat: "Centro de ayuda", kw: "preguntas frecuentes dudas ayuda" },
    { label: "Garantías", desc: "Consulta tus garantías activas", href: "/mi-cuenta?tab=garantias", icon: ShieldCheck, cat: "Centro de ayuda", kw: "garantia cobertura" },
    { label: "Devoluciones", desc: "Proceso de devolución de productos", href: "/mi-cuenta?tab=compras", icon: RotateCcw, cat: "Centro de ayuda", kw: "devolucion reembolso cambio" },
    { label: "Métodos de pago", desc: "Cómo puedes pagar tu compra", href: "/mi-cuenta?tab=compras", icon: CreditCard, cat: "Centro de ayuda", kw: "pago metodos tarjeta" },
    { label: "Envíos", desc: "Información de despacho y entrega", href: "/mi-cuenta?tab=compras", icon: Truck, cat: "Centro de ayuda", kw: "envio entrega despacho envios" },
    { label: "Servicios", desc: "Mantenimiento, reparación y más", href: "/servicios", icon: Wrench, cat: "Centro de ayuda", kw: "servicios mantenimiento taller" },
  ];

  const contact = [
    { label: "WhatsApp", icon: MessageCircle, desc: "Respuesta inmediata", href: waHref, external: true },
    { label: "Teléfono", icon: Phone, desc: config.site_phone || "+57 300 123 4567", href: `tel:${config.site_phone || "+573001234567"}` },
    { label: "Correo", icon: Mail, desc: config.site_email || "info@motopro.com", href: `mailto:${config.site_email || "info@motopro.com"}` },
    { label: "Horarios", icon: Clock, desc: (config.site_hours || "Lun - Vie: 8:00 - 18:00\nSáb: 9:00 - 13:00").split("\n")[0], href: "/contacto" },
    { label: "Mapa", icon: MapPin, desc: "Cómo llegar", href: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(config.site_address || "Taller MotoPro, Medellín"), external: true },
  ];

  const filtered = search.trim()
    ? topics.filter(t => (t.label + " " + t.desc + " " + t.cat + " " + t.kw).toLowerCase().includes(search.toLowerCase()))
    : [];

  const renderRow = (item: any) => {
    const Icon = item.icon;
    return (
      <Link key={item.label} to={item.href || "#"} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined}
        className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-surface-tertiary/50 transition-colors">
        <span className="w-8 h-8 rounded-lg bg-surface-tertiary/60 text-interactive-accent flex items-center justify-center shrink-0">
          {Icon && <Icon size={15} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-medium text-text-primary group-hover:text-interactive-accent transition-colors truncate">{item.label}</span>
          {item.desc && <span className="block text-[11px] text-text-tertiary truncate">{item.desc}</span>}
        </span>
        <ChevronRight size={14} className="text-text-tertiary group-hover:text-interactive-accent shrink-0" />
      </Link>
    );
  };

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-24 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-interactive-accent text-white shadow-lg hover:bg-interactive-accent-hover transition-all"
        aria-label="Centro de ayuda"
      >
        {open ? <X size={24} /> : <LifeBuoy size={24} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-[11.5rem] left-6 z-40 w-[380px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-12rem)] flex flex-col rounded-2xl border border-border bg-surface-secondary shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-gradient-to-r from-interactive-accent/10 to-transparent">
              <div className="w-10 h-10 rounded-xl bg-interactive-accent text-white flex items-center justify-center shrink-0">
                <LifeBuoy size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-text-primary">Centro de Ayuda</p>
                <p className="text-[11px] text-text-secondary">¿Cómo podemos ayudarte?</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Buscador */}
              <div className="px-4 pt-4">
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar ayuda (ej: garantía, cita, envío...)"
                    className="w-full rounded-xl bg-surface-primary border border-border pl-10 pr-4 py-2.5 text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-interactive-accent transition-colors"
                  />
                </div>
              </div>

              {search.trim() ? (
                <div className="px-2 py-2">
                  {filtered.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-text-tertiary">Sin resultados para "{search}"</p>
                  ) : (
                    filtered.map((item) => renderRow(item))
                  )}
                </div>
              ) : (
                <div className="px-4 pb-4 space-y-4">
                  {/* Contextual */}
                  {contextual && contextual.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CheckCircle size={12} className="text-interactive-accent" /> Según tu actividad
                      </p>
                      <div className="space-y-2">
                        {contextual.map((c, i) => (
                          <Link key={i} to={c.href}
                            className="group flex items-start gap-3 rounded-xl border border-border bg-surface-primary p-3 hover:border-interactive-accent/40 transition-all">
                            <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${c.color}`}>
                              <c.icon size={16} />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[13px] font-semibold text-text-primary group-hover:text-interactive-accent transition-colors">{c.title}</span>
                              <span className="block text-[11px] text-text-secondary mt-0.5">{c.desc}</span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Acciones rápidas */}
                  <div>
                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1.5">Acciones rápidas</p>
                    <div className="rounded-xl border border-border bg-surface-primary p-1">
                      {topics.filter(t => t.cat === "Acciones rápidas").map((q) => renderRow(q))}
                    </div>
                  </div>

                  {/* Centro de ayuda */}
                  <div>
                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1.5">Centro de ayuda</p>
                    <div className="rounded-xl border border-border bg-surface-primary p-1">
                      {topics.filter(t => t.cat === "Centro de ayuda").map((q) => renderRow(q))}
                    </div>
                  </div>

                  {/* Contacto */}
                  <div>
                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1.5">Contacto</p>
                    <div className="rounded-xl border border-border bg-surface-primary p-1">
                      {contact.map((c) => renderRow(c))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CTA WhatsApp */}
            <a href={waHref} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-[#25D366] to-[#20BD5A] text-sm font-bold text-white hover:opacity-95 transition-opacity">
              <MessageCircle size={16} /> ¿No encuentras lo que buscas? Escríbenos
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
