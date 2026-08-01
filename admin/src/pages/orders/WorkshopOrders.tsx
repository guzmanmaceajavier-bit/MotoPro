import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { Plus, Search, Wrench, Eye, Calendar, Download, AlertTriangle, Clock, CheckCircle2, XCircle, ClipboardCheck, Columns3, Table2, ChevronLeft, ChevronRight, Ban, Loader2 } from "lucide-react";
import { Badge } from "@shared/components/ui/Badge";
import { Pagination } from "@shared/components/ui/Pagination";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@shared/components/ui/KpiCard";

interface WorkshopOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  vehicle_description: string;
  mechanic_name: string;
  status: string;
  priority: string;
  service_type: string;
  created_at: string;
  total: number;
}

const PAGE_SIZE = 10;

const statusConfig: Record<string, { label: string; variant: "info" | "warning" | "success" | "danger" | "default"; dot: string }> = {
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

const FLOW = ["received", "diagnosed", "quoted", "approved", "in_progress", "quality_check", "ready", "delivered"];
const KANBAN_COLUMNS = [...FLOW, "cancelled"];

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Baja", color: "#10B981" },
  normal: { label: "Normal", color: "#3B82F6" },
  high: { label: "Alta", color: "#F59E0B" },
  urgent: { label: "Urgente", color: "#EF4444" },
};

function timeAgo(dateStr?: string) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr.replace(" ", "T")).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "recién";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days} d`;
}

export default function WorkshopOrders() {
  const [orders, setOrders] = useState<WorkshopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [view, setView] = useState<"table" | "kanban">("table");
  const [movingId, setMovingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadOrders = async () => {
    setLoading(true);
    try {
      if (view === "kanban") {
        const res = await api.get("/orders");
        const all = Array.isArray(res) ? res : res?.data ?? [];
        setOrders(all);
      } else {
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
      }
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadOrders(); }, [view, search, statusFilter, page]);

  const moveStatus = async (order: WorkshopOrder, dir: "prev" | "next" | "cancel") => {
    const idx = FLOW.indexOf(order.status);
    let next: string | null = null;
    if (dir === "cancel") next = "cancelled";
    else if (dir === "prev" && idx > 0) next = FLOW[idx - 1];
    else if (dir === "next" && idx >= 0 && idx < FLOW.length - 1) next = FLOW[idx + 1];
    if (!next || next === order.status) return;
    setMovingId(order.id);
    try {
      await api.put(`/orders/${order.id}/status`, { status: next });
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: next as string } : o));
    } catch {
      /* silencioso */
    } finally { setMovingId(null); }
  };

  const stats = useMemo(() => {
    const total = view === "kanban" ? orders.length : pagination.total;
    const byStatus = (s: string) => orders.filter(o => o.status === s).length;
    return { total, received: byStatus("received"), in_progress: byStatus("in_progress") + byStatus("approved"), delivered: byStatus("delivered") };
  }, [orders, pagination, view]);

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
        title="Centro de Órdenes"
        description="Gestiona y da seguimiento al proceso completo de las órdenes de servicio"
        breadcrumbs={[{ label: "Servicios", to: "/services" }, { label: "Órdenes de Taller" }]}
        icon={<Wrench size={20} />}
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[var(--mp-bg-elevated)] rounded-lg p-1 mr-1">
              <button onClick={() => setView("table")} type="button"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === "table" ? "bg-[var(--mp-accent)] text-white" : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)]"}`}>
                <Table2 size={13} /> Tabla
              </button>
              <button onClick={() => setView("kanban")} type="button"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === "kanban" ? "bg-[var(--mp-accent)] text-white" : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)]"}`}>
                <Columns3 size={13} /> Kanban
              </button>
            </div>
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
        <KpiCard title="Recibidas" value={stats.received} icon={<Clock size={18} />} iconColor="blue" change={{ value: "Pendientes", positive: true }} />
        <KpiCard title="En Proceso" value={stats.in_progress} icon={<Wrench size={18} />} iconColor="orange" change={{ value: "Activas", positive: true }} />
        <KpiCard title="Entregadas" value={stats.delivered} icon={<CheckCircle2 size={18} />} iconColor="green" />
      </div>

      {view === "table" ? (
        <>
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
                        <span className="text-xs text-[var(--mp-text-tertiary)]">{o.created_at ? new Date(o.created_at.replace(" ", "T")).toLocaleDateString("es-CO") : "—"}</span>
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
        </>
      ) : (
        <KanbanBoard
          orders={orders}
          loading={loading}
          search={search}
          setSearch={setSearch}
          movingId={movingId}
          onMove={moveStatus}
          onOpen={(id) => navigate(`/orders/${id}`)}
        />
      )}
    </div>
  );
}

function KanbanBoard({
  orders, loading, search, setSearch, movingId, onMove, onOpen,
}: {
  orders: WorkshopOrder[];
  loading: boolean;
  search: string;
  setSearch: (s: string) => void;
  movingId: string | null;
  onMove: (o: WorkshopOrder, dir: "prev" | "next" | "cancel") => void;
  onOpen: (id: string) => void;
}) {
  const q = search.toLowerCase();
  const filtered = orders.filter(o =>
    !q || o.order_number?.toLowerCase().includes(q) || o.customer_name?.toLowerCase().includes(q) || o.vehicle_description?.toLowerCase().includes(q));

  return (
    <div className="space-y-3">
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] pointer-events-none" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Filtrar tarjetas (orden, cliente, vehículo)..." className="mp-input pl-9" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-[var(--mp-text-tertiary)]">
          <Loader2 size={22} className="animate-spin mr-2" /> Cargando órdenes...
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4" style={{ alignItems: "flex-start" }}>
          {KANBAN_COLUMNS.map((status) => {
            const cfg = statusConfig[status] || statusConfig.received;
            const items = filtered.filter(o => o.status === status);
            const isTerminal = status === "delivered" || status === "cancelled";
            const idx = FLOW.indexOf(status);
            return (
              <div key={status} className="w-72 shrink-0 rounded-xl bg-[var(--mp-bg-elevated)] border border-[var(--mp-border)] flex flex-col" style={{ maxHeight: "calc(100vh - 320px)" }}>
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--mp-border)]">
                  <span className="w-2 h-2 rounded-full" style={{ background: cfg.dot }} />
                  <span className="text-xs font-bold text-[var(--mp-text-primary)] uppercase tracking-wider">{cfg.label}</span>
                  <span className="ml-auto text-[10px] font-bold text-[var(--mp-text-tertiary)] bg-[var(--mp-bg-card)] px-2 py-0.5 rounded-full">{items.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[80px]">
                  {items.length === 0 && (
                    <div className="text-[11px] text-[var(--mp-text-tertiary)] text-center py-4 border border-dashed border-[var(--mp-border)] rounded-lg">Sin órdenes</div>
                  )}
                  {items.map((o) => {
                    const pr = priorityConfig[o.priority] || priorityConfig.normal;
                    return (
                      <div key={o.id} onClick={() => onOpen(o.id)}
                        className="rounded-xl bg-[var(--mp-bg-card)] border border-[var(--mp-border)] p-3 cursor-pointer hover:border-[var(--mp-accent)] transition-colors shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-[var(--mp-accent)]">{o.order_number}</span>
                          <span className="flex items-center gap-1 text-[9px] text-[var(--mp-text-tertiary)]">
                            <Clock size={9} /> {timeAgo(o.created_at)}
                          </span>
                        </div>
                        <p className="text-[13px] font-semibold text-[var(--mp-text-primary)] mt-1 truncate">{o.customer_name}</p>
                        <p className="text-[11px] text-[var(--mp-text-tertiary)] truncate">{o.vehicle_description || o.service_type || "—"}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: `${pr.color}1a`, color: pr.color }}>{pr.label}</span>
                          {o.mechanic_name && <span className="px-1.5 py-0.5 rounded text-[9px] font-medium text-[var(--mp-text-tertiary)] bg-[var(--mp-bg-elevated)] truncate">{o.mechanic_name}</span>}
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--mp-border-subtle)]">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); onMove(o, "prev"); }}
                              disabled={idx <= 0 || movingId === o.id}
                              className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--mp-text-tertiary)] hover:bg-[var(--mp-bg-elevated)] hover:text-[var(--mp-text-primary)] disabled:opacity-25 transition-colors"
                              title={idx <= 0 ? "Primer estado" : statusConfig[FLOW[idx - 1]].label}>
                              <ChevronLeft size={13} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); onMove(o, "next"); }}
                              disabled={isTerminal || idx === -1 || idx >= FLOW.length - 1 || movingId === o.id}
                              className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--mp-text-tertiary)] hover:bg-[var(--mp-bg-elevated)] hover:text-[var(--mp-text-primary)] disabled:opacity-25 transition-colors"
                              title={isTerminal ? "Estado final" : statusConfig[FLOW[idx + 1]].label}>
                              <ChevronRight size={13} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            {!isTerminal && status !== "cancelled" && (
                              <button
                                onClick={(e) => { e.stopPropagation(); onMove(o, "cancel"); }}
                                disabled={movingId === o.id}
                                className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--mp-text-tertiary)] hover:bg-[rgba(239,68,68,0.1)] hover:text-[#EF4444] disabled:opacity-25 transition-colors"
                                title="Cancelar orden">
                                <Ban size={13} />
                              </button>
                            )}
                            {movingId === o.id ? <Loader2 size={12} className="animate-spin text-[var(--mp-accent)]" /> : <Eye size={12} className="text-[var(--mp-text-tertiary)]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
