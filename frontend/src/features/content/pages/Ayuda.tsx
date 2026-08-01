import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { api } from "@/api/client";
import { useConfig } from "@/providers/CMSProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  Search, MessageCircle, Phone, Mail, MapPin, HelpCircle,
  Wrench, ShieldCheck, ChevronRight, LifeBuoy, X,
  Calendar, Truck, CheckCircle,
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

export default function Ayuda() {
  const config = useConfig();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [faqs, setFaqs] = useState<any[]>([]);
  const [ctx, setCtx] = useState<{ orders: any[]; appointments: any[]; warranties: any[] }>({ orders: [], appointments: [], warranties: [] });
  const [ctxLoading, setCtxLoading] = useState(false);

  useEffect(() => {
    api.get("/faqs").then((d) => setFaqs(Array.isArray(d) ? d.slice(0, 4) : [])).catch(() => setFaqs([]));
  }, []);

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

  const contextual = useMemo(() => {
    if (!user || ctxLoading) return null;
    const cards: { icon: any; color: string; title: string; desc: string; href: string }[] = [];

    const workOrder = ctx.orders.find((o: any) => o.type === "service" && ACTIVE_WORK_STATUSES.includes(o.status));
    if (workOrder) {
      cards.push({
        icon: Wrench,
        color: "text-orange-500 bg-orange-500/10",
        title: "Tienes una reparación en proceso",
        desc: `Orden ${workOrder.order_number || workOrder.id?.slice(0, 8).toUpperCase()} — ${workOrder.service_type || "servicio en taller"}.`,
        href: `/estado-servicio?id=${workOrder.id}`,
      });
    }

    const now = new Date();
    const nextAppt = ctx.appointments
      .filter((a: any) => a.status !== "cancelled")
      .sort((a: any, b: any) => new Date(`${a.appointment_date}T${a.start_time || "00:00"}`).getTime() - new Date(`${b.appointment_date}T${b.start_time || "00:00"}`).getTime())
      .find((a: any) => new Date(`${a.appointment_date}T${a.start_time || "00:00"}`).getTime() >= now.getTime());
    if (nextAppt) {
      cards.push({
        icon: Calendar,
        color: "text-blue-500 bg-blue-500/10",
        title: "Tu próxima cita",
        desc: `${formatDate(nextAppt.appointment_date)} a las ${formatHour(nextAppt.start_time)} — ${nextAppt.service || "servicio programado"}.`,
        href: "/mi-cuenta?tab=citas",
      });
    }

    const storeOrder = ctx.orders.find((o: any) => o.type === "store" && IN_TRANSIT_STATUSES.includes(o.status));
    if (storeOrder) {
      cards.push({
        icon: Truck,
        color: "text-emerald-500 bg-emerald-500/10",
        title: "Tu pedido está en camino",
        desc: `Pedido #${storeOrder.id?.slice(0, 8).toUpperCase() || storeOrder.id} — pronto estará en tus manos.`,
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
        title: days <= 30 ? "Tu garantía está por vencer" : "Tu garantía activa",
        desc: days <= 30
          ? `Vence en ${days} ${days === 1 ? "día" : "días"} (${formatDate(warranty.end_date)}).`
          : `Válida hasta ${formatDate(warranty.end_date)}.`,
        href: "/mi-cuenta?tab=garantias",
      });
    }

    return cards.slice(0, 4);
  }, [user, ctx, ctxLoading]);

  const whatsapp = config.social_whatsapp || "573001234567";

  const links = {
    contact: [
      { label: "WhatsApp", icon: MessageCircle, desc: "Respuesta inmediata", href: `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hola, necesito ayuda.")}`, external: true },
      { label: "Llamar", icon: Phone, desc: config.site_phone || "+57 300 123 4567", href: `tel:${config.site_phone || "+573001234567"}` },
      { label: "Correo", icon: Mail, desc: config.site_email || "info@motopro.com", href: `mailto:${config.site_email || "info@motopro.com"}` },
      { label: "Mapa", icon: MapPin, desc: "Cómo llegar", href: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(config.site_address || "Taller MotoPro, Medellín"), external: true },
    ],
    quick: [
      { label: "Consultar orden", desc: "Sigue tu reparación en tiempo real", href: "/consulta" },
      { label: "Estado del servicio", desc: "Trazabilidad de tu moto en el taller", href: "/estado-servicio" },
      { label: "Seguimiento de compras", desc: "Historial y estado de tus pedidos", href: "/mi-cuenta?tab=compras" },
      { label: "Agendar cita", desc: "Reserva horario con tu mecánico", href: "/agendar-cita" },
      { label: "Solicitar diagnóstico", desc: "Envía fotos o video del problema", href: "/solicitar-servicio" },
    ],
    services: [
      { label: "Ver servicios", desc: "Mantenimiento, reparación y más", href: "/servicios" },
      { label: "Garantías", desc: "Consulta tus garantías activas", href: "/mi-cuenta?tab=garantias" },
      { label: "Devoluciones", desc: "Proceso de devolución de productos", href: "/mi-cuenta?tab=compras" },
    ],
    info: [
      { label: "Privacidad", desc: "Cómo manejamos tus datos", href: "/privacidad" },
      { label: "Términos", desc: "Condiciones de uso del sitio", href: "/terminos" },
      { label: "Horarios", desc: (config.site_hours || "Lun - Vie: 8:00 - 18:00\nSáb: 9:00 - 13:00").split("\n")[0], href: "/contacto" },
    ],
  };

  const allItems = useMemo(() => Object.entries(links).flatMap(([cat, items]) => items.map((i) => ({ ...i, cat }))), []);

  const filtered = search.trim()
    ? allItems.filter(i => (i.label + " " + i.desc + " " + i.cat).toLowerCase().includes(search.toLowerCase()))
    : [];

  const renderRow = (item: any) => {
    const Icon = item.icon;
    return (
      <Link key={item.label} to={item.href || "#"} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined}
        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-surface-tertiary/50 transition-colors">
        <span className="w-9 h-9 rounded-lg bg-surface-tertiary/60 text-interactive-accent flex items-center justify-center shrink-0">
          {Icon && <Icon size={16} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-text-primary group-hover:text-interactive-accent transition-colors">{item.label}</span>
          {item.desc && <span className="block text-xs text-text-tertiary truncate">{item.desc}</span>}
        </span>
        <ChevronRight size={15} className="text-text-tertiary group-hover:text-interactive-accent shrink-0" />
      </Link>
    );
  };

  return (
    <>
      <SEO title="Centro de Ayuda | MotoPro" description="Resolvemos tus dudas: consulta tu orden, agenda citas, contacta por WhatsApp y encuentra respuestas en nuestras preguntas frecuentes." />
      <main className="bg-surface-primary min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold text-interactive-accent uppercase tracking-[0.2em]">
              <LifeBuoy size={14} /> Centro de Ayuda
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mt-2">¿Cómo podemos ayudarte?</h1>
            <p className="text-text-secondary mt-2">Encuentra lo que necesitas o escríbenos directamente.</p>
          </div>

          {/* Search */}
          <div className="relative max-w-xl mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar ayuda (ej: garantía, cita, envío...)"
                className="w-full rounded-xl bg-surface-secondary border border-border-subtle pl-11 pr-10 py-3.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-interactive-accent focus:ring-2 focus:ring-interactive-accent/10 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors">
                  <X size={15} />
                </button>
              )}
            </div>
            {search && (
              <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-border bg-surface-secondary shadow-xl z-20 overflow-hidden">
                {filtered.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-text-tertiary">Sin resultados para "{search}"</p>
                ) : (
                  filtered.map((item) => renderRow(item))
                )}
              </div>
            )}
          </div>

          {/* Panel contextual (logueado) */}
          {contextual && contextual.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle size={15} className="text-interactive-accent" /> Según tu actividad
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {contextual.map((c, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link to={c.href}
                      className="group flex items-start gap-3 rounded-2xl border border-border bg-surface-secondary p-4 hover:border-interactive-accent/40 hover:shadow-lg transition-all">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.color}`}>
                        <c.icon size={18} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-text-primary group-hover:text-interactive-accent transition-colors">{c.title}</span>
                        <span className="block text-xs text-text-secondary mt-0.5">{c.desc}</span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-interactive-accent mt-1.5">
                          Ver estado <ChevronRight size={12} />
                        </span>
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          <div className="space-y-10">
            {/* Contacto */}
            <section>
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-3">Contacto</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {links.contact.map((c) => (
                  <a key={c.label} href={c.href} target={c.external ? "_blank" : undefined} rel={c.external ? "noopener noreferrer" : undefined}
                    className="group rounded-2xl border border-border bg-surface-secondary p-4 hover:border-interactive-accent/40 hover:shadow-lg transition-all">
                    <span className="w-10 h-10 rounded-xl bg-interactive-accent/10 text-interactive-accent flex items-center justify-center mb-3 group-hover:bg-interactive-accent group-hover:text-white transition-colors">
                      <c.icon size={18} />
                    </span>
                    <span className="block text-sm font-semibold text-text-primary">{c.label}</span>
                    <span className="block text-xs text-text-tertiary mt-0.5 truncate">{c.desc}</span>
                  </a>
                ))}
              </div>
            </section>

            {/* Accesos rápidos */}
            <section>
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-3">Accesos rápidos</h2>
              <div className="rounded-2xl border border-border bg-surface-secondary p-2">
                {links.quick.map((q) => renderRow(q))}
              </div>
            </section>

            {/* FAQ */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Preguntas frecuentes</h2>
                <Link to="/faq" className="text-sm font-semibold text-interactive-accent hover:underline">Ver todas</Link>
              </div>
              <div className="rounded-2xl border border-border bg-surface-secondary p-2 space-y-2">
                {faqs.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-text-tertiary">No hay preguntas frecuentes disponibles.</p>
                ) : (
                  faqs.map((f: any) => (
                    <details key={f.id} className="group rounded-lg px-3 py-2 hover:bg-surface-tertiary/40 transition-colors">
                      <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-text-primary list-none">
                        <span className="flex items-center gap-2"><HelpCircle size={15} className="text-interactive-accent shrink-0" /> {f.question}</span>
                        <ChevronRight size={14} className="text-text-tertiary group-open:rotate-90 transition-transform shrink-0 ml-3" />
                      </summary>
                      <p className="text-sm text-text-secondary mt-2 pt-2 border-t border-border">{f.answer}</p>
                    </details>
                  ))
                )}
              </div>
            </section>

            {/* Servicios */}
            <section>
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-3">Servicios</h2>
              <div className="rounded-2xl border border-border bg-surface-secondary p-2">
                {links.services.map((s) => renderRow(s))}
              </div>
            </section>

            {/* Información */}
            <section>
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-3">Información</h2>
              <div className="rounded-2xl border border-border bg-surface-secondary p-2">
                {links.info.map((s) => renderRow(s))}
              </div>
            </section>
          </div>

        </div>
      </main>
    </>
  );
}
