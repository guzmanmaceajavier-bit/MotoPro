import { useState, useEffect, useMemo } from "react";
import { api } from "@/api/client";
import PageHeader from "@/components/PageHeader";
import StoreOrderForm from "./StoreOrderForm";
import {
  ShoppingCart,
  Clock,
  CreditCard,
  Truck,
  CheckCircle2,
  XCircle,
  DollarSign,
  Search,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
} from "lucide-react";

interface MockOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  created_at: string;
  status: "pendiente" | "pagado" | "enviado" | "entregado" | "cancelado";
  payment_method: string;
  shipping_status: string;
  carrier: string;
  total: number;
}

const statusMap: Record<string, MockOrder["status"]> = {
  pending: "pendiente", pendiente: "pendiente",
  paid: "pagado", pagado: "pagado",
  shipped: "enviado", enviado: "enviado",
  delivered: "entregado", entregado: "entregado",
  cancelled: "cancelado", cancelado: "cancelado",
};

const shipStatusMap: Record<string, string> = {
  pendiente: "Pendiente", pagado: "Preparando",
  enviado: "En tránsito", entregado: "Entregado", cancelado: "Cancelado",
};

const statusConfig: Record<string, { label: string; dot: string; badge: string }> = {
  pendiente: { label: "Pendiente", dot: "bg-orange-400", badge: "mp-badge-warning" },
  pagado:    { label: "Pagado",    dot: "bg-emerald-500", badge: "mp-badge-success" },
  enviado:   { label: "Enviado",   dot: "bg-purple-500",  badge: "mp-badge-info" },
  entregado: { label: "Entregado", dot: "bg-emerald-500", badge: "mp-badge-success" },
  cancelado: { label: "Cancelado", dot: "bg-red-500",     badge: "mp-badge-danger" },
};

const paymentConfig: Record<string, string> = {
  "Tarjeta":       "mp-badge-info",
  "Transferencia": "mp-badge-accent",
  "Efectivo":      "mp-badge-success",
  "PSE":           "mp-badge-warning",
};

const PER_PAGE = 10;

export default function StoreOrdersPage() {
  const [orders, setOrders] = useState<MockOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PER_PAGE);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    api.get("/checkout").then((r) => {
      const items = Array.isArray(r) ? r : [];
      setOrders(items.map((o: any): MockOrder => ({
        id: o.id || "",
        customer_name: o.customer_name || "",
        customer_email: o.customer_email || "",
        created_at: o.created_at || "",
        status: statusMap[o.status] || "pendiente",
        payment_method: o.payment_method || "",
        shipping_status: shipStatusMap[statusMap[o.status] || "pendiente"] || "Pendiente",
        carrier: o.shipping_address ? "—" : "—",
        total: Number(o.total) || 0,
      })));
    }).finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const all = orders;
    return {
      total: all.length,
      pendientes: all.filter((o) => o.status === "pendiente").length,
      pagados: all.filter((o) => o.status === "pagado").length,
      enviados: all.filter((o) => o.status === "enviado").length,
      entregados: all.filter((o) => o.status === "entregado").length,
      cancelados: all.filter((o) => o.status === "cancelado").length,
      ingresos: all.reduce((sum, o) => sum + o.total, 0),
    };
  }, [orders]);

  const filtered = useMemo(() => {
    let items = [...orders];
    if (statusFilter !== "all") {
      items = items.filter((o) => o.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (o) =>
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_email.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q)
      );
    }
    if (dateFrom) items = items.filter((o) => o.created_at >= dateFrom);
    if (dateTo) items = items.filter((o) => o.created_at <= dateTo);
    return items;
  }, [statusFilter, search, dateFrom, dateTo, orders]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const startIdx = filtered.length === 0 ? 0 : (page - 1) * perPage + 1;
  const endIdx = Math.min(page * perPage, filtered.length);

  const kpis = [
    { title: "TOTAL", value: stats.total, icon: ShoppingCart, iconColor: "teal", subtitle: "Pedidos" },
    { title: "PENDIENTES", value: stats.pendientes, icon: Clock, iconColor: "orange", subtitle: "Por procesar" },
    { title: "PAGADOS", value: stats.pagados, icon: CreditCard, iconColor: "green", subtitle: "Completados" },
    { title: "ENVIADOS", value: stats.enviados, icon: Truck, iconColor: "purple", subtitle: "En tránsito" },
    { title: "ENTREGADOS", value: stats.entregados, icon: CheckCircle2, iconColor: "green", subtitle: "Completados" },
    { title: "CANCELADOS", value: stats.cancelados, icon: XCircle, iconColor: "red", subtitle: "Cancelados" },
    { title: "INGRESOS", value: `$${stats.ingresos.toLocaleString()}`, icon: DollarSign, iconColor: "teal", subtitle: "Total generados" },
  ];

  const iconColorMap: Record<string, string> = {
    teal: "rgba(20,184,166,0.12)",
    orange: "rgba(249,115,22,0.12)",
    green: "rgba(34,197,94,0.12)",
    purple: "rgba(139,92,246,0.12)",
    red: "rgba(239,68,68,0.12)",
  };

  const iconFgMap: Record<string, string> = {
    teal: "#14b8a6",
    orange: "#f97316",
    green: "#22c55e",
    purple: "#8b5cf6",
    red: "#ef4444",
  };

  const filterTabs = [
    { key: "all", label: "Todos" },
    { key: "pendiente", label: "Pendiente" },
    { key: "pagado", label: "Pagado" },
    { key: "enviado", label: "Enviado" },
    { key: "entregado", label: "Entregado" },
    { key: "cancelado", label: "Cancelado" },
  ];

  if (loading) return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-7 gap-3 mb-6">
        {[1, 2, 3, 4, 5, 6, 7].map(i => (
          <div key={i} className="mp-card p-4">
            <div className="skeleton h-16 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Pedidos Tienda"
        description="Órdenes de compra realizadas desde la tienda online"
        breadcrumbs={[
          { label: "Dashboard", to: "/" },
          { label: "Pedidos Tienda" },
        ]}
        icon={<ShoppingCart size={20} />}
        action={
          <button className="mp-btn-primary" onClick={() => setShowForm(true)}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Nuevo Pedido
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-7 gap-3 mb-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="mp-card p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-[var(--mp-text-tertiary)] uppercase tracking-widest">
                {kpi.title}
              </span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: iconColorMap[kpi.iconColor] }}
              >
                <kpi.icon size={14} color={iconFgMap[kpi.iconColor]} strokeWidth={2} />
              </div>
            </div>
            <p className="text-xl font-bold text-[var(--mp-text-primary)] leading-tight">{kpi.value}</p>
            <p className="text-[10px] text-[var(--mp-text-tertiary)] mt-1">{kpi.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-4 p-1 bg-[var(--mp-bg-elevated)] rounded-xl w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setStatusFilter(tab.key); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
              statusFilter === tab.key
                ? "bg-[var(--mp-accent)] text-white shadow-sm"
                : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-secondary)] hover:bg-[var(--mp-bg-hover)]"
            }`}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] pointer-events-none" />
          <input
            className="mp-input pl-9"
            placeholder="Buscar por nombre, email o ID de pedido..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <button className="mp-btn-secondary" type="button">
          <Filter size={14} /> Filtros
        </button>
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="mp-input"
            style={{ width: 150 }}
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          />
          <span className="text-[var(--mp-text-tertiary)] text-xs">—</span>
          <input
            type="date"
            className="mp-input"
            style={{ width: 150 }}
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          />
        </div>
        <button className="mp-btn-secondary" type="button">
          <Download size={14} /> Exportar
        </button>
      </div>

      {/* Table */}
      <div className="mp-card overflow-hidden mb-4">
        <table className="mp-table">
          <thead>
            <tr>
              <th>PEDIDO</th>
              <th>CLIENTE</th>
              <th>FECHA</th>
              <th>ESTADO</th>
              <th>PAGO</th>
              <th>ENVÍO</th>
              <th>TOTAL</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-[var(--mp-text-tertiary)]">
                  No se encontraron pedidos
                </td>
              </tr>
            ) : (
              paginated.map((order) => {
                const st = statusConfig[order.status];
                return (
                  <tr key={order.id}>
                    <td>
                      <span className="font-semibold text-[var(--mp-text-primary)]">{order.id}</span>
                    </td>
                    <td>
                      <p className="font-medium text-[var(--mp-text-primary)]">{order.customer_name}</p>
                      <p className="text-[11px] text-[var(--mp-text-tertiary)]">{order.customer_email}</p>
                    </td>
                    <td className="text-[var(--mp-text-secondary)] text-xs">
                      {new Date(order.created_at).toLocaleDateString("es-CO")}
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                    </td>
                    <td>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${paymentConfig[order.payment_method] || "mp-badge-info"}`}>
                        {order.payment_method}
                      </span>
                    </td>
                    <td>
                      <div>
                        <span className="text-xs font-medium text-[var(--mp-text-primary)]">{order.shipping_status}</span>
                        {order.carrier !== "—" && (
                          <p className="text-[11px] text-[var(--mp-text-tertiary)]">{order.carrier}</p>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="font-bold text-[var(--mp-text-primary)]">
                        ${order.total.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--mp-text-tertiary)] hover:text-[var(--mp-accent)] hover:bg-[var(--mp-bg-hover)] transition-all"
                          type="button"
                          title="Ver detalle"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)] transition-all"
                          type="button"
                          title="Más opciones"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--mp-text-tertiary)]">
          Mostrando {startIdx} a {endIdx} de {filtered.length} pedidos
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`mp-page-btn ${n === page ? "active" : ""}`}
                type="button"
              >
                {n}
              </button>
            ))}
          </div>
          <select
            className="mp-select"
            style={{ width: 90 }}
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Store Order Form Modal */}
      <StoreOrderForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
