import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { Plus, Search, Wrench, Eye, MoreHorizontal, Calendar, Download, Filter, AlertTriangle, Clock, CheckCircle2, XCircle, ClipboardCheck } from "lucide-react";
import { Badge } from "@shared/components/ui/Badge";
import { Pagination } from "@shared/components/ui/Pagination";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@shared/components/ui/KpiCard";

interface WorkshopOrder {
  id: string;
  order_number: string;
  customer_name: string;
  vehicle_description: string;
  mechanic_name: string;
  status: string;
  priority: string;
  created_at: string;
  total: number;
}

const PAGE_SIZE = 10;

const statusConfig: Record<string, { label: string; variant: "info" | "warning" | "success" | "danger" | "neutral"; dot: string }> = {
  received: { label: "Recibido", variant: "info", dot: "#3B82F6" },
  diagnosed: { label: "Diagnosticado", variant: "warning", dot: "#F59E0B" },
  quoted: { label: "Cotizado", variant: "warning", dot: "#F59E0B" },
  approved: { label: "Aprobado", variant: "success", dot: "#10B981" },
  in_progress: { label: "En reparación", variant: "info", dot: "#3B82F6" },
  quality_check: { label: "Control de calidad", variant: "warning", dot: "#F59E0B" },
  ready: { label: "Listo", variant: "success", dot: "#10B981" },
  delivered: { label: "Entregado", variant: "success", dot: "#10B981" },
  cancelled: { label: "Cancelado", variant: "danger", dot: "#EF4444" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Baja", color: "#10B981" },
  normal: { label: "Normal", color: "#3B82F6" },
  high: { label: "Alta", color: "#F59E0B" },
  urgent: { label: "Urgente", color: "#EF4444" },
};

export default function WorkshopOrders() {
  const [orders, setOrders] = useState<WorkshopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const navigate = useNavigate();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));

      const res = await api.get(`/orders?${params.toString()}`);
      if (res && res.data) {
        setOrders(res.data);
        setPagination(res.pagination || { total: 0, totalPages: 0 });
      } else {
        setOrders(Array.isArray(res) ? res : []);
      }
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadOrders(); }, [search, statusFilter, page]);

  const stats = useMemo(() => {
    const total = pagination.total;
    const byStatus = (s: string) => orders.filter(o => o.status === s).length;
    return { total, received: byStatus("received"), in_progress: byStatus("in_progress") + byStatus("approved"), delivered: byStatus("delivered") };
  }, [orders, pagination]);

  if (loading && orders.length === 0) return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="rounded-xl border border-border bg-surface-secondary p-5"><div className="skeleton h-20 rounded-lg" /></div>)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Órdenes de Taller"
        description="Gestiona y da seguimiento a todas las órdenes de servicio"
        breadcrumbs={[{ label: "Servicios", to: "/services" }, { label: "Órdenes de Taller" }]}
        icon={<Wrench size={20} />}
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/recepcion")} className="mp-btn-secondary text-xs">
              <ClipboardCheck size={14} /> Recepción
            </button>
            <button onClick={() => navigate("/orders/new")} className="mp-btn-primary text-xs">
              <Plus size={14} /> Nueva Orden
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Órdenes" value={stats.total} icon={<Wrench size={18} />} iconColor="purple" />
        <KpiCard title="Recibidas" value={stats.received} icon={<Clock size={18} />} iconColor="blue" subtitle="Pendientes" />
        <KpiCard title="En Proceso" value={stats.in_progress} icon={<Wrench size={18} />} iconColor="orange" subtitle="Activas" />
        <KpiCard title="Entregadas" value={stats.delivered} icon={<CheckCircle2 size={18} />} iconColor="green" />
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] pointer-events-none" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por orden, cliente, vehículo..." className="mp-input pl-9" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="mp-input max-w-[180px] text-xs">
          <option value="all">Estado: Todos</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="mp-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--mp-border)]">
              <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase tracking-wider">Orden</th>
              <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase tracking-wider">Cliente</th>
              <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase tracking-wider hidden md:table-cell">Vehículo</th>
              <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase tracking-wider hidden lg:table-cell">Mecánico</th>
              <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase tracking-wider">Estado</th>
              <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase tracking-wider hidden xl:table-cell">Fecha</th>
              <th className="text-right text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase tracking-wider">Total</th>
              <th className="text-right text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const st = statusConfig[o.status] || statusConfig.received;
              const pr = priorityConfig[o.priority] || priorityConfig.normal;
              return (
                <tr key={o.id} className="border-b border-[var(--mp-border-subtle)] hover:bg-[var(--mp-bg-elevated)] transition-colors cursor-pointer"
                  onClick={() => navigate(`/orders/${o.id}`)}>
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-sm font-bold text-[var(--mp-accent)]">{o.order_number}</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: pr.color }} />
                        <span className="text-[10px] text-[var(--mp-text-tertiary)]">{pr.label}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-[var(--mp-text-primary)]">{o.customer_name}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-[var(--mp-text-secondary)]">{o.vehicle_description || "—"}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-[var(--mp-text-secondary)]">{o.mechanic_name || "Sin asignar"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <span className="text-xs text-[var(--mp-text-tertiary)]">{o.created_at ? new Date(o.created_at).toLocaleDateString("es-CO") : "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-bold text-[var(--mp-text-primary)]">${(o.total || 0).toLocaleString("es-CO")}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/orders/${o.id}`); }}
                      className="mp-btn-ghost text-xs py-1.5 px-2" title="Ver detalle">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr><td colSpan={8} className="text-center py-12 text-[var(--mp-text-tertiary)]">No hay órdenes</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-[var(--mp-text-tertiary)]">
          Mostrando {orders.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0} a {Math.min(page * PAGE_SIZE, pagination.total)} de {pagination.total} órdenes
        </span>
        <Pagination page={page} perPage={PAGE_SIZE} total={pagination.total} onChange={setPage} />
      </div>
    </div>
  );
}
