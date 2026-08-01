import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/api/client";
import { Badge } from "@shared/components/ui/Badge";
import KpiCard from "@shared/components/ui/KpiCard";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/components/Toast";
import {
  ArrowLeft, Users, Wrench, ShoppingBag, FileText, ShieldCheck,
  MessageCircle, Mail, Phone, MapPin, Pencil, Calendar, ClipboardList,
  AlertTriangle, Plus, DollarSign, Clock, CheckCircle2,
} from "lucide-react";

const woStatus: Record<string, { label: string; variant: "info" | "warning" | "success" | "danger"; dot: string }> = {
  received: { label: "Recibido", variant: "info", dot: "#3B82F6" },
  diagnosed: { label: "Diagnosticado", variant: "warning", dot: "#F59E0B" },
  quoted: { label: "Cotizado", variant: "warning", dot: "#F59E0B" },
  approved: { label: "Aprobado", variant: "success", dot: "#10B981" },
  in_progress: { label: "En reparación", variant: "info", dot: "#3B82F6" },
  quality_check: { label: "Control calidad", variant: "warning", dot: "#F59E0B" },
  ready: { label: "Listo", variant: "success", dot: "#10B981" },
  delivered: { label: "Entregado", variant: "success", dot: "#10B981" },
  cancelled: { label: "Cancelado", variant: "danger", dot: "#EF4444" },
};

const invStatus: Record<string, { label: string; variant: "info" | "warning" | "success" | "danger" }> = {
  pending: { label: "Pendiente", variant: "warning" },
  paid: { label: "Pagada", variant: "success" },
  cancelled: { label: "Cancelada", variant: "danger" },
};

const quoteStatus: Record<string, { label: string; variant: "info" | "warning" | "success" | "danger" }> = {
  pending: { label: "Pendiente", variant: "warning" },
  sent: { label: "Enviada", variant: "info" },
  approved: { label: "Aprobada", variant: "success" },
  rejected: { label: "Rechazada", variant: "danger" },
};

const warStatus: Record<string, { label: string; variant: "info" | "warning" | "success" | "danger" | "default" }> = {
  active: { label: "Activa", variant: "success" },
  expired: { label: "Expirada", variant: "default" },
  cancelled: { label: "Cancelada", variant: "danger" },
};

const apptStatus: Record<string, { label: string; variant: "info" | "warning" | "success" | "danger" }> = {
  pending: { label: "Pendiente", variant: "warning" },
  confirmed: { label: "Confirmada", variant: "info" },
  completed: { label: "Completada", variant: "success" },
  cancelled: { label: "Cancelada", variant: "danger" },
};

const tabs = [
  { key: "resumen", label: "Resumen", icon: Users },
  { key: "vehiculos", label: "Vehículos", icon: Wrench },
  { key: "ordenes", label: "Órdenes Taller", icon: ClipboardList },
  { key: "pedidos", label: "Pedidos Tienda", icon: ShoppingBag },
  { key: "facturas", label: "Facturas", icon: FileText },
  { key: "garantias", label: "Garantías", icon: ShieldCheck },
  { key: "cotizaciones", label: "Cotizaciones", icon: DollarSign },
  { key: "citas", label: "Citas", icon: Calendar },
] as const;

type TabKey = (typeof tabs)[number]["key"];

const fmtMoney = (n: number) => `$${Number(n || 0).toLocaleString("es-CO")}`;
const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString("es-CO") : "—");

const avatarColors = ["#0D9488", "#6366F1", "#F59E0B", "#EC4899", "#3B82F6", "#8B5CF6", "#F97316", "#10B981"];

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function CustomerExpediente() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("resumen");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/customers/${id}`);
      if (data && data.id) setCustomer(data);
      else { setCustomer(null); showToast("error", "Cliente no encontrado"); }
    } catch { setCustomer(null); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="rounded-xl border border-border bg-surface-secondary p-5"><div className="skeleton h-20 rounded-lg" /></div>)}
        </div>
        <div className="skeleton h-80 rounded-xl" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto text-amber-400 mb-4" />
          <h2 className="text-h3 font-bold text-text-primary">Cliente no encontrado</h2>
          <button onClick={() => navigate("/clientes")} className="mp-btn-primary mt-4 text-sm">Volver a Clientes</button>
        </div>
      </div>
    );
  }

  const vehicles = customer.vehicles || [];
  const workOrders = customer.workOrders || [];
  const storeOrders = customer.orders || [];
  const invoices = customer.invoices || [];
  const warranties = customer.warranties || [];
  const quotes = customer.quotes || [];
  const appointments = customer.appointments || [];
  const directSales = customer.directSales || [];

  const activity = [
    ...workOrders.map((o: any) => ({ type: "orden", id: o.id, title: `Orden ${o.order_number}`, sub: `${o.service_type || "Servicio"} · ${fmtDate(o.created_at)}`, status: o.status, amount: o.total })),
    ...storeOrders.map((o: any) => ({ type: "pedido", id: o.id, title: `Pedido #${o.id?.slice(0, 8)}`, sub: `Tienda · ${fmtDate(o.created_at)}`, status: o.status, amount: o.total })),
    ...directSales.map((o: any) => ({ type: "venta", id: o.id, title: `Venta ${o.sale_number}`, sub: `POS · ${fmtDate(o.created_at)}`, status: o.status, amount: o.total })),
  ].sort((a, b) => new Date(b.sub?.split(" · ")[1] || 0).getTime() - new Date(a.sub?.split(" · ")[1] || 0).getTime()).slice(0, 10);

  const activityIcon: Record<string, typeof Wrench> = { orden: Wrench, pedido: ShoppingBag, venta: DollarSign };

  const renderTab = () => {
    switch (tab) {
      case "vehiculos":
        return (
          <div className="mp-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border"><h3 className="text-caption font-semibold text-text-primary">Vehículos ({vehicles.length})</h3></div>
            {vehicles.length === 0 ? (
              <div className="py-10 text-center text-sm text-text-tertiary">Sin vehículos registrados</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="mp-table">
                  <thead><tr><th>VEHÍCULO</th><th>PLACA</th><th>MOTOR/CHASIS</th><th>KILOMETRAJE</th><th>REGISTRO</th></tr></thead>
                  <tbody>
                    {vehicles.map((v: any) => (
                      <tr key={v.id} className="cursor-pointer hover:bg-surface-tertiary/50" onClick={() => navigate(`/vehiculos`)}>
                        <td className="text-sm font-medium text-text-primary">{v.brand} {v.model}</td>
                        <td className="text-xs text-text-secondary">{v.plate || "—"}</td>
                        <td className="text-xs text-text-secondary">{v.engine_number || v.chassis_number || "—"}</td>
                        <td className="text-xs text-text-secondary">{v.current_mileage ? `${Number(v.current_mileage).toLocaleString()} km` : "—"}</td>
                        <td className="text-xs text-text-tertiary">{fmtDate(v.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "ordenes":
        return (
          <div className="mp-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <h3 className="text-caption font-semibold text-text-primary">Órdenes de Taller ({workOrders.length})</h3>
              <Link to="/orders/new" className="mp-btn-secondary text-xs"><Plus size={14} /> Nueva Orden</Link>
            </div>
            {workOrders.length === 0 ? (
              <div className="py-10 text-center text-sm text-text-tertiary">Sin órdenes de taller</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="mp-table">
                  <thead><tr><th>ORDEN</th><th>SERVICIO</th><th>VHÍCULO</th><th>ESTADO</th><th>TOTAL</th><th className="text-right">FECHA</th></tr></thead>
                  <tbody>
                    {workOrders.map((o: any) => {
                      const st = woStatus[o.status] || woStatus.received;
                      return (
                        <tr key={o.id} className="cursor-pointer hover:bg-surface-tertiary/50" onClick={() => navigate(`/orders/${o.id}`)}>
                          <td className="font-mono text-xs text-accent font-semibold">{o.order_number}</td>
                          <td className="text-sm text-text-secondary">{o.service_type || "—"}</td>
                          <td className="text-xs text-text-secondary">{o.vehicle_description || "—"}</td>
                          <td><div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} /><Badge variant={st.variant}>{st.label}</Badge></div></td>
                          <td className="text-sm font-semibold text-text-primary">{fmtMoney(o.total)}</td>
                          <td className="text-right text-xs text-text-tertiary">{fmtDate(o.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "pedidos":
        return (
          <div className="mp-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border"><h3 className="text-caption font-semibold text-text-primary">Pedidos de Tienda ({storeOrders.length + directSales.length})</h3></div>
            {storeOrders.length + directSales.length === 0 ? (
              <div className="py-10 text-center text-sm text-text-tertiary">Sin pedidos de tienda</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="mp-table">
                  <thead><tr><th>PEDIDO</th><th>ORIGEN</th><th>ESTADO</th><th className="text-right">TOTAL</th><th className="text-right">FECHA</th></tr></thead>
                  <tbody>
                    {storeOrders.map((o: any) => {
                      const st = invStatus[o.status] || invStatus.pending;
                      return (
                        <tr key={o.id} className="cursor-pointer hover:bg-surface-tertiary/50" onClick={() => navigate("/pedidos-tienda")}>
                          <td className="font-mono text-xs text-accent font-semibold">#{o.id?.slice(0, 8)}</td>
                          <td className="text-xs text-text-secondary">Tienda</td>
                          <td><Badge variant={st.variant}>{st.label}</Badge></td>
                          <td className="text-right text-sm font-semibold text-text-primary">{fmtMoney(o.total)}</td>
                          <td className="text-right text-xs text-text-tertiary">{fmtDate(o.created_at)}</td>
                        </tr>
                      );
                    })}
                    {directSales.map((o: any) => (
                      <tr key={o.id} className="cursor-pointer hover:bg-surface-tertiary/50" onClick={() => navigate("/pos")}>
                        <td className="font-mono text-xs text-accent font-semibold">{o.sale_number}</td>
                        <td className="text-xs text-text-secondary">Punto de venta</td>
                        <td><Badge variant="success">Completada</Badge></td>
                        <td className="text-right text-sm font-semibold text-text-primary">{fmtMoney(o.total)}</td>
                        <td className="text-right text-xs text-text-tertiary">{fmtDate(o.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "facturas":
        return (
          <div className="mp-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border"><h3 className="text-caption font-semibold text-text-primary">Facturas ({invoices.length})</h3></div>
            {invoices.length === 0 ? (
              <div className="py-10 text-center text-sm text-text-tertiary">Sin facturas</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="mp-table">
                  <thead><tr><th>FACTURA</th><th>ESTADO</th><th className="text-right">TOTAL</th><th className="text-right">FECHA</th></tr></thead>
                  <tbody>
                    {invoices.map((i: any) => {
                      const st = invStatus[i.status] || invStatus.pending;
                      return (
                        <tr key={i.id} className="cursor-pointer hover:bg-surface-tertiary/50" onClick={() => navigate("/invoices")}>
                          <td className="font-mono text-xs text-accent font-semibold">{i.invoice_number}</td>
                          <td><Badge variant={st.variant}>{st.label}</Badge></td>
                          <td className="text-right text-sm font-semibold text-text-primary">{fmtMoney(i.total)}</td>
                          <td className="text-right text-xs text-text-tertiary">{fmtDate(i.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "garantias":
        return (
          <div className="mp-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border"><h3 className="text-caption font-semibold text-text-primary">Garantías ({warranties.length})</h3></div>
            {warranties.length === 0 ? (
              <div className="py-10 text-center text-sm text-text-tertiary">Sin garantías</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="mp-table">
                  <thead><tr><th>REFERENCIA</th><th>SERVICIO/PRODUCTO</th><th>VIGENCIA</th><th>ESTADO</th></tr></thead>
                  <tbody>
                    {warranties.map((w: any) => {
                      const st = warStatus[w.status] || warStatus.active;
                      return (
                        <tr key={w.id} className="cursor-pointer hover:bg-surface-tertiary/50" onClick={() => navigate("/warranties")}>
                          <td className="font-mono text-xs text-accent font-semibold">{w.entity_type === "work_order" ? "Taller" : w.entity_type === "product" ? "Producto" : "General"}</td>
                          <td className="text-sm text-text-secondary">{w.service_name || w.product_name || "—"}</td>
                          <td className="text-xs text-text-secondary">{fmtDate(w.start_date)} → {fmtDate(w.end_date)}</td>
                          <td><Badge variant={st.variant}>{st.label}</Badge></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "cotizaciones":
        return (
          <div className="mp-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border"><h3 className="text-caption font-semibold text-text-primary">Cotizaciones ({quotes.length})</h3></div>
            {quotes.length === 0 ? (
              <div className="py-10 text-center text-sm text-text-tertiary">Sin cotizaciones</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="mp-table">
                  <thead><tr><th>COTIZACIÓN</th><th>ESTADO</th><th className="text-right">TOTAL</th><th className="text-right">VENCE</th></tr></thead>
                  <tbody>
                    {quotes.map((q: any) => {
                      const st = quoteStatus[q.status] || quoteStatus.pending;
                      return (
                        <tr key={q.id} className="cursor-pointer hover:bg-surface-tertiary/50" onClick={() => navigate("/quotes")}>
                          <td className="font-mono text-xs text-accent font-semibold">{q.quote_number}</td>
                          <td><Badge variant={st.variant}>{st.label}</Badge></td>
                          <td className="text-right text-sm font-semibold text-text-primary">{fmtMoney(q.total)}</td>
                          <td className="text-right text-xs text-text-tertiary">{fmtDate(q.valid_until)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "citas":
        return (
          <div className="mp-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border"><h3 className="text-caption font-semibold text-text-primary">Citas ({appointments.length})</h3></div>
            {appointments.length === 0 ? (
              <div className="py-10 text-center text-sm text-text-tertiary">Sin citas</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="mp-table">
                  <thead><tr><th>FECHA</th><th>HORA</th><th>SERVICIO</th><th>MECÁNICO</th><th>ESTADO</th></tr></thead>
                  <tbody>
                    {appointments.map((a: any) => {
                      const st = apptStatus[a.status] || apptStatus.pending;
                      return (
                        <tr key={a.id} className="cursor-pointer hover:bg-surface-tertiary/50" onClick={() => navigate("/calendar")}>
                          <td className="text-sm text-text-primary">{fmtDate(a.appointment_date)}</td>
                          <td className="text-xs text-text-secondary">{a.start_time} – {a.end_time}</td>
                          <td className="text-sm text-text-secondary">{a.service_type || "—"}</td>
                          <td className="text-xs text-text-secondary">{a.mechanic_name || "Sin asignar"}</td>
                          <td><Badge variant={st.variant}>{st.label}</Badge></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-5">
              <div className="mp-card p-5">
                <h3 className="text-caption font-semibold text-text-primary mb-3">Información</h3>
                <div className="space-y-2.5 text-sm">
                  <p className="flex items-center gap-2 text-text-secondary"><Mail size={13} className="text-text-tertiary" /> {customer.email || "—"}</p>
                  <p className="flex items-center gap-2 text-text-secondary"><Phone size={13} className="text-text-tertiary" /> {customer.phone || "—"}</p>
                  <p className="flex items-center gap-2 text-text-secondary"><MapPin size={13} className="text-text-tertiary" /> {customer.address || "—"}</p>
                  <p className="flex items-center gap-2 text-text-secondary"><Clock size={13} className="text-text-tertiary" /> Registro: {fmtDate(customer.created_at)}</p>
                </div>
                {customer.notes && (
                  <div className="mt-4 p-3 rounded-lg bg-surface-tertiary/60 text-xs text-text-secondary whitespace-pre-wrap">
                    <p className="font-semibold text-text-primary mb-1">Notas</p>
                    {customer.notes}
                  </div>
                )}
                <div className="mt-5 flex flex-wrap gap-2">
                  {customer.phone && (
                    <a href={`https://wa.me/${customer.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="mp-btn-secondary text-xs"><MessageCircle size={14} /> WhatsApp</a>
                  )}
                  <Link to={`/clientes?search=${encodeURIComponent(customer.email || "")}`} className="mp-btn-ghost text-xs"><Pencil size={14} /> Editar</Link>
                </div>
              </div>
              <div className="mp-card p-5">
                <h3 className="text-caption font-semibold text-text-primary mb-3">Accesos rápidos</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/orders/new" className="mp-btn-secondary text-xs"><Plus size={14} /> Nueva Orden</Link>
                  <Link to="/pos" className="mp-btn-secondary text-xs"><DollarSign size={14} /> Venta</Link>
                  <Link to="/calendar" className="mp-btn-secondary text-xs"><Calendar size={14} /> Agendar</Link>
                  <Link to="/warranties" className="mp-btn-secondary text-xs"><ShieldCheck size={14} /> Garantía</Link>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 mp-card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border">
                <h3 className="text-caption font-semibold text-text-primary">Actividad reciente</h3>
              </div>
              {activity.length === 0 ? (
                <div className="py-10 text-center text-sm text-text-tertiary">Sin actividad registrada</div>
              ) : (
                <div className="divide-y divide-border-subtle">
                  {activity.map((a, i) => {
                    const Icon = activityIcon[a.type] || Wrench;
                    const st = woStatus[a.status];
                    return (
                      <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-tertiary/50 transition-colors">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-teal-500/10 text-teal-400">
                          <Icon size={13} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-primary truncate font-medium">{a.title}</p>
                          <p className="text-[11px] text-text-tertiary truncate">{a.sub}</p>
                        </div>
                        {st && <Badge variant={st.variant}>{st.label}</Badge>}
                        <span className="text-sm font-bold text-text-primary shrink-0">{fmtMoney(a.amount)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Expediente del Cliente"
        description={`Ficha integral de ${customer.name}`}
        breadcrumbs={[{ label: "Dashboard", to: "/" }, { label: "Clientes", to: "/clientes" }, { label: customer.name }]}
        icon={<Users size={20} />}
        action={
          <button onClick={() => navigate("/clientes")} className="mp-btn-ghost text-xs"><ArrowLeft size={14} /> Volver</button>
        }
      />

      {/* Perfil */}
      <div className="rounded-xl border border-border bg-surface-secondary overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0"
            style={{ background: `${avatarColors[4]}18`, color: avatarColors[4] }}>
            {customer.avatar ? <img src={customer.avatar} alt="" className="w-full h-full rounded-2xl object-cover" /> : getInitials(customer.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-text-primary">{customer.name}</h2>
              {customer.is_registered === 1 && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent/10 text-accent">Web</span>}
              {customer.customer_type && <Badge variant="info">{customer.customer_type}</Badge>}
            </div>
            <p className="text-sm text-text-secondary mt-0.5">{customer.email}{customer.phone ? ` · ${customer.phone}` : ""}</p>
            <p className="text-xs text-text-tertiary mt-1 flex items-center gap-1"><Calendar size={11} /> Cliente desde {fmtDate(customer.created_at)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => showToast("success", "Acción disponible desde el listado")} className="mp-btn-secondary text-xs"><Pencil size={14} /> Editar</button>
            {customer.phone && (
              <a href={`https://wa.me/${customer.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="mp-btn-secondary text-xs"><MessageCircle size={14} /> WhatsApp</a>
            )}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard title="Pedidos" value={storeOrders.length + directSales.length} icon={<ShoppingBag size={18} />} iconColor="blue" change={{ value: fmtMoney(customer.total_spent) + " gastado", positive: true }} />
        <KpiCard title="Órdenes Taller" value={workOrders.length} icon={<Wrench size={18} />} iconColor="orange" change={{ value: `${workOrders.filter((o: any) => o.status === "delivered").length} entregadas`, positive: true }} />
        <KpiCard title="Facturas" value={invoices.length} icon={<FileText size={18} />} iconColor="purple" change={{ value: `${invoices.filter((i: any) => i.status === "paid").length} pagadas`, positive: true }} />
        <KpiCard title="Garantías" value={warranties.length} icon={<ShieldCheck size={18} />} iconColor="green" change={{ value: `${warranties.filter((w: any) => w.status === "active").length} activas`, positive: true }} />
        <KpiCard title="Cotizaciones" value={quotes.length} icon={<DollarSign size={18} />} iconColor="purple" change={{ value: `${quotes.filter((q: any) => q.status === "approved").length} aprobadas`, positive: true }} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${tab === t.key ? "text-accent" : "text-text-tertiary hover:text-text-primary"}`}>
              <Icon size={14} /> {t.label}
              {tab === t.key && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-accent rounded-t-full" />}
            </button>
          );
        })}
      </div>

      {renderTab()}
    </div>
  );
}
