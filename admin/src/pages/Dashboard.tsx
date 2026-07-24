import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import {
  DollarSign, Wrench, ShoppingCart, Users, Calendar, AlertTriangle,
  TrendingUp, ArrowRight, Clock, CheckCircle, Banknote, UserCheck,
  Activity, Package, FileText, ChevronRight, XCircle, Info,
} from "lucide-react";

const statusColors: Record<string, string> = {
  received: "bg-blue-500/15 text-blue-400",
  diagnosed: "bg-amber-500/15 text-amber-400",
  quoted: "bg-purple-500/15 text-purple-400",
  approved: "bg-teal-500/15 text-teal-400",
  in_progress: "bg-orange-500/15 text-orange-400",
  quality_check: "bg-cyan-500/15 text-cyan-400",
  ready: "bg-emerald-500/15 text-emerald-400",
  delivered: "bg-green-500/15 text-green-400",
  cancelled: "bg-red-500/15 text-red-400",
  pending: "bg-amber-500/15 text-amber-400",
  sent: "bg-blue-500/15 text-blue-400",
  approved: "bg-green-500/15 text-green-400",
  rejected: "bg-red-500/15 text-red-400",
};

const statusLabels: Record<string, string> = {
  received: "Recibida", diagnosed: "Diagnosticada", quoted: "Cotizada",
  approved: "Aprobada", in_progress: "En Progreso", quality_check: "Control Calidad",
  ready: "Lista", delivered: "Entregada", cancelled: "Cancelada",
  pending: "Pendiente", sent: "Enviada", rejected: "Rechazada",
};

const priorityColors: Record<string, string> = {
  urgent: "bg-red-500/15 text-red-400 border-red-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  normal: "bg-surface-tertiary text-text-secondary border-border",
  low: "bg-surface-tertiary text-text-tertiary border-border",
};

const alertIcons: Record<string, typeof DollarSign> = {
  warning: AlertTriangle, danger: XCircle, info: Info, success: CheckCircle,
};

const alertColors: Record<string, string> = {
  warning: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  danger: "bg-red-500/10 border-red-500/30 text-red-400",
  info: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
};

const activityIcons: Record<string, typeof DollarSign> = {
  work_order: Wrench, store_order: ShoppingCart, customer: Users,
};

const activityColors: Record<string, string> = {
  work_order: "bg-teal-500/10 text-teal-400",
  store_order: "bg-blue-500/10 text-blue-400",
  customer: "bg-purple-500/10 text-purple-400",
};

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard")
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-xl border border-border bg-surface-secondary p-5">
              <div className="skeleton h-20 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 skeleton h-80 rounded-xl" />
          <div className="skeleton h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto text-amber-400 mb-4" />
          <h2 className="text-h3 font-bold text-text-primary">Error al cargar</h2>
          <p className="text-body-sm text-text-tertiary mt-2">No se pudieron cargar los datos del dashboard</p>
          <button onClick={() => window.location.reload()} className="mp-btn mp-btn-primary mt-4">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { kpis, ordersByStatus, activeOrders, pendingServices, cashSummary, mechanics, alerts, recentActivity, mechanicPerformance } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-h2 font-bold text-text-primary tracking-tight">Dashboard</h1>
          <p className="text-body-sm text-text-tertiary mt-1">
            {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/orders/new" className="mp-btn mp-btn-primary text-sm gap-2">
            <Wrench size={14} /> Nueva Orden
          </Link>
          <Link to="/calendar" className="mp-btn mp-btn-secondary text-sm gap-2">
            <Calendar size={14} /> Agenda
          </Link>
        </div>
      </div>

      {/* ── 1. KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Ingresos del Mes", value: `$${(kpis.monthRevenue + kpis.monthWorkOrderRevenue).toLocaleString()}`, icon: DollarSign, color: "teal" as const, change: { value: `${kpis.todayRevenue > 0 ? "$" + kpis.todayRevenue.toLocaleString() + " hoy" : "Sin datos hoy"}`, positive: true } },
          { label: "Órdenes Activas", value: kpis.workOrdersActive, icon: Wrench, color: "orange" as const, change: { value: `${kpis.workOrdersDelivered} entregadas`, positive: true } },
          { label: "Pedidos Tienda", value: kpis.pendingInvoices, icon: ShoppingCart, color: "blue" as const, change: { value: `${kpis.totalProducts} productos`, positive: true } },
          { label: "Citas Hoy", value: kpis.todayAppointments, icon: Calendar, color: "purple" as const, change: { value: `${kpis.pendingQuotes} cotizaciones`, positive: kpis.pendingQuotes === 0 } },
          { label: "Clientes", value: kpis.totalClients, icon: Users, color: "green" as const, change: { value: `${kpis.totalServices} servicios`, positive: true } },
          { label: "Facturas Pendientes", value: kpis.pendingInvoices, icon: FileText, color: "red" as const, change: { value: kpis.pendingInvoices > 0 ? "Requiere atención" : "Al día", positive: kpis.pendingInvoices === 0 } },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="mp-kpi group hover:border-[rgba(20,184,166,0.2)] transition-all duration-150"
              style={{ animation: `slideUp 200ms ${i * 50}ms var(--ease-out) both` }}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-[var(--mp-text-tertiary)] uppercase tracking-wider">{kpi.label}</span>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  kpi.color === "teal" ? "bg-teal-500/10 text-teal-400" :
                  kpi.color === "orange" ? "bg-orange-500/10 text-orange-400" :
                  kpi.color === "blue" ? "bg-blue-500/10 text-blue-400" :
                  kpi.color === "purple" ? "bg-purple-500/10 text-purple-400" :
                  kpi.color === "green" ? "bg-emerald-500/10 text-emerald-400" :
                  "bg-red-500/10 text-red-400"
                }`}>
                  <Icon size={15} strokeWidth={1.5} />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight text-text-primary">{kpi.value}</p>
              <p className={`text-xs mt-1.5 flex items-center gap-1 ${kpi.change.positive ? "text-emerald-400" : "text-amber-400"}`}>
                <TrendingUp size={11} strokeWidth={2} />
                {kpi.change.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── 2. Alertas ── */}
      {alerts.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {alerts.map((alert: any, i: number) => {
            const Icon = alertIcons[alert.type] || Info;
            return (
              <Link key={i} to={alert.action || "#"}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 hover:shadow-elevation-1 ${alertColors[alert.type] || alertColors.info}`}
                style={{ animation: `slideUp 200ms ${i * 50}ms var(--ease-out) both` }}>
                <Icon size={16} strokeWidth={1.5} className="shrink-0" />
                <div className="min-w-0">
                  <span className="font-semibold">{alert.title}</span>
                  <span className="ml-2 opacity-80">{alert.message}</span>
                </div>
                <ChevronRight size={14} className="shrink-0 ml-auto opacity-60" />
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Main Grid: Órdenes + Sidebar ── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* ── 3. Órdenes Activas ── */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface-secondary overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <div className="flex items-center gap-3">
              <h2 className="text-caption font-semibold text-text-primary tracking-wide">Órdenes Activas</h2>
              {ordersByStatus.length > 0 && (
                <div className="flex gap-1.5">
                  {ordersByStatus.map((s: any) => (
                    <span key={s.status} className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[s.status] || "bg-surface-tertiary text-text-secondary"}`}>
                      {statusLabels[s.status] || s.status} ({s.count})
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Link to="/orders" className="text-tiny font-medium text-teal-400 hover:text-teal-300 inline-flex items-center gap-1 transition-colors">
              Ver todo <ArrowRight size={11} strokeWidth={2} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">Orden</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">Vehículo</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">Mecánico</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">Estado</th>
                  <th className="text-right px-5 py-2.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {activeOrders.length > 0 ? activeOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-surface-tertiary/50 transition-colors duration-fast cursor-pointer"
                    onClick={() => window.location.href = `/orders/${order.id}/edit`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-text-secondary">{order.order_number}</span>
                        {order.priority === "urgent" && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 uppercase">Urgente</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-text-primary font-medium">{order.customer_name}</td>
                    <td className="px-5 py-3 text-text-secondary text-xs">{order.vehicle_description || "—"}</td>
                    <td className="px-5 py-3 text-text-secondary text-xs">{order.mechanic_name || <span className="text-amber-400">Sin asignar</span>}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColors[order.status] || "bg-surface-tertiary text-text-secondary"}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-text-primary">${(order.total || 0).toLocaleString()}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-text-tertiary">No hay órdenes activas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="space-y-5">

          {/* ── 4. Caja del Día ── */}
          <div className="rounded-xl border border-border bg-surface-secondary overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h2 className="text-caption font-semibold text-text-primary tracking-wide">Caja del Día</h2>
              <Link to="/settings" className="text-tiny font-medium text-teal-400 hover:text-teal-300 transition-colors">
                {cashSummary.isOpen ? "Cerrar" : "Abrir"}
              </Link>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cashSummary.isOpen ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                  <Banknote size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">{cashSummary.isOpen ? "Caja Abierta" : "Caja Cerrada"}</p>
                  <p className="text-lg font-bold text-text-primary">${cashSummary.balance.toLocaleString()}</p>
                </div>
              </div>
              {cashSummary.isOpen && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border-subtle">
                  <div>
                    <p className="text-[10px] text-text-tertiary uppercase">Ingresos</p>
                    <p className="text-sm font-semibold text-emerald-400">+${cashSummary.income.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-tertiary uppercase">Egresos</p>
                    <p className="text-sm font-semibold text-red-400">-${cashSummary.expenses.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── 5. Mecánicos Disponibles ── */}
          <div className="rounded-xl border border-border bg-surface-secondary overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h2 className="text-caption font-semibold text-text-primary tracking-wide">Mecánicos</h2>
              <Link to="/mechanics" className="text-tiny font-medium text-teal-400 hover:text-teal-300 transition-colors">Ver todos</Link>
            </div>
            <div className="p-3 space-y-1">
              {mechanics.length > 0 ? mechanics.map((m: any) => (
                <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-tertiary transition-colors">
                  <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 text-xs font-bold shrink-0">
                    {m.image ? <img src={m.image} alt="" className="w-8 h-8 rounded-full object-cover" /> : m.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary font-medium truncate">{m.name}</p>
                    <p className="text-[11px] text-text-tertiary truncate">{m.specialty || "Mecánico general"}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${m.activeOrders > 0 ? "bg-orange-500/15 text-orange-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                    {m.activeOrders > 0 ? `${m.activeOrders} activa${m.activeOrders > 1 ? "s" : ""}` : "Disponible"}
                  </span>
                </div>
              )) : (
                <div className="px-3 py-6 text-center text-xs text-text-tertiary">No hay mecánicos registrados</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Grid: Servicios + Actividad + Rendimiento ── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* ── 6. Servicios Pendientes (Citas) ── */}
        <div className="rounded-xl border border-border bg-surface-secondary overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <h2 className="text-caption font-semibold text-text-primary tracking-wide">Próximos Servicios</h2>
            <Link to="/calendar" className="text-tiny font-medium text-teal-400 hover:text-teal-300 transition-colors">Calendario</Link>
          </div>
          <div className="divide-y divide-border-subtle">
            {pendingServices.length > 0 ? pendingServices.map((s: any) => (
              <div key={s.id} className="px-5 py-3 hover:bg-surface-tertiary/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-text-primary">{s.customer_name}</span>
                  <span className="text-[10px] text-text-tertiary">{s.start_time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">{s.service_type || "Servicio general"}</span>
                  <span className="text-[10px] text-text-tertiary">{s.mechanic_name || "Sin asignar"}</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${s.appointment_date === new Date().toISOString().split("T")[0] ? "bg-teal-500/15 text-teal-400" : "bg-blue-500/15 text-blue-400"}`}>
                    {s.appointment_date === new Date().toISOString().split("T")[0] ? "Hoy" : "Mañana"}
                  </span>
                  {s.customer_phone && (
                    <span className="text-[10px] text-text-tertiary">{s.customer_phone}</span>
                  )}
                </div>
              </div>
            )) : (
              <div className="px-5 py-8 text-center text-sm text-text-tertiary">No hay servicios programados</div>
            )}
          </div>
        </div>

        {/* ── 7. Actividad Reciente ── */}
        <div className="rounded-xl border border-border bg-surface-secondary overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <h2 className="text-caption font-semibold text-text-primary tracking-wide">Actividad Reciente</h2>
          </div>
          <div className="divide-y divide-border-subtle">
            {recentActivity.length > 0 ? recentActivity.map((item: any, i: number) => {
              const Icon = activityIcons[item.activity_type] || Activity;
              const color = activityColors[item.activity_type] || "bg-surface-tertiary text-text-secondary";
              return (
                <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-tertiary/50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                    <Icon size={13} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate font-medium">
                      {item.activity_type === "work_order" ? `Orden ${item.order_number || item.id?.slice(0, 8)}` :
                       item.activity_type === "store_order" ? `Pedido #${item.id?.slice(0, 8)}` :
                       `Cliente: ${item.name}`}
                    </p>
                    <p className="text-[11px] text-text-tertiary truncate">
                      {item.customer_name || item.name} · {item.status ? (statusLabels[item.status] || item.status) : ""}
                    </p>
                  </div>
                  <span className="text-[10px] text-text-tertiary shrink-0">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : ""}
                  </span>
                </div>
              );
            }) : (
              <div className="px-5 py-8 text-center text-sm text-text-tertiary">No hay actividad reciente</div>
            )}
          </div>
        </div>

        {/* ── 8. Rendimiento de Mecánicos ── */}
        <div className="rounded-xl border border-border bg-surface-secondary overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <h2 className="text-caption font-semibold text-text-primary tracking-wide">Rendimiento del Mes</h2>
            <Link to="/mechanics" className="text-tiny font-medium text-teal-400 hover:text-teal-300 transition-colors">Detalles</Link>
          </div>
          <div className="p-4 space-y-4">
            {mechanicPerformance.length > 0 ? mechanicPerformance.map((m: any, i: number) => {
              const total = m.completed + m.in_progress;
              const pct = total > 0 ? Math.round((m.completed / total) * 100) : 0;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-text-primary font-medium">{m.name}</span>
                    <span className="text-xs text-text-tertiary">{m.completed} completada{m.completed !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-tertiary overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-500"
                      style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-text-tertiary">{m.in_progress} en progreso</span>
                    <span className="text-[10px] text-teal-400 font-medium">{pct}%</span>
                  </div>
                </div>
              );
            }) : (
              <div className="py-6 text-center text-sm text-text-tertiary">Sin datos de rendimiento</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
