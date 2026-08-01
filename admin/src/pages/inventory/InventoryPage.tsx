import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import { downloadCSV, downloadExcel } from "@/utils/export";
import {
  Plus, TrendingUp, TrendingDown, AlertTriangle, Clock, Search, Download,
  Package, CheckCircle, AlertCircle, Grid3X3, X, Info, ChevronDown, Filter, BarChart3
} from "lucide-react";
import { Pagination } from "@shared/components/ui/Pagination";

interface Movement {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  product_sku?: string;
  type: string;
  movement_type?: string;
  quantity: number;
  reference: string;
  notes: string;
  warehouse?: string;
  user_name?: string;
  user_initials?: string;
  created_at: string;
}

interface AlertItem { id: string; name: string; stock: number; min_stock?: number; sku?: string; image?: string; product_id?: string; }
interface AlertsData { low_stock: AlertItem[]; out_of_stock: AlertItem[]; }

const PAGE_SIZE = 10;

function relativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ayer";
  return `Hace ${days} días`;
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const h = 32;
  const w = 80;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SimpleBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-8">
      {data.map((v, i) => (
        <div key={i} className="flex-1 rounded-t" style={{ height: `${(v / max) * 100}%`, background: color, opacity: 0.6 + (v / max) * 0.4 }} />
      ))}
    </div>
  );
}

export default function InventoryPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [alerts, setAlerts] = useState<AlertsData>({ low_stock: [], out_of_stock: [] });
  const [products, setProducts] = useState<{ id: string; name: string; sku?: string; image?: string; stock?: number }[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterMovement, setFilterMovement] = useState("all");
  const [filterWarehouse, setFilterWarehouse] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PAGE_SIZE);
  const [form, setForm] = useState({
    product_id: "", type: "in", quantity: "1", reference: "", notes: "",
    warehouse_id: "", date: new Date().toISOString().slice(0, 16),
  });
  const { showToast } = useToast();

  const fetchMovements = () => {
    setLoading(true);
    api.get("/inventory").then((r) => setMovements(r || [])).catch(() => setMovements([])).finally(() => setLoading(false));
  };
  const fetchAlerts = () => {
    api.get("/inventory/alerts").then((r) => setAlerts({ low_stock: r?.lowStock || [], out_of_stock: r?.outOfStock || [] })).catch(() => setAlerts({ low_stock: [], out_of_stock: [] }));
  };
  const fetchProducts = () => { api.get("/products").then((r) => setProducts(r.data || r || [])).catch(() => setProducts([])); };
  const fetchWarehouses = () => { api.get("/warehouses").then((r) => setWarehouses(r || [])).catch(() => setWarehouses([{ id: "main", name: "Almacén Principal" }])); };

  useEffect(() => { fetchMovements(); fetchAlerts(); fetchProducts(); fetchWarehouses(); }, []);

  const handleSave = async () => {
    if (!form.product_id) return showToast("error", "Selecciona un producto");
    try {
      await api.post("/inventory", { ...form, quantity: parseInt(form.quantity) });
      showToast("success", "Movimiento registrado");
      setModal(false);
      fetchMovements();
      fetchAlerts();
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
  };

  const today = new Date().toISOString().slice(0, 10);
  const todayMovements = movements.filter(m => m.created_at?.startsWith(today));
  const totalIn = todayMovements.reduce((s, m) => s + (m.type === "in" ? m.quantity : 0), 0);
  const totalOut = todayMovements.reduce((s, m) => s + (m.type === "out" ? m.quantity : 0), 0);
  const totalInAll = movements.reduce((s, m) => s + (m.type === "in" ? m.quantity : 0), 0);
  const totalOutAll = movements.reduce((s, m) => s + (m.type === "out" ? m.quantity : 0), 0);
  const balance = totalInAll - totalOutAll;

  const sparkIn = [1, 3, 2, 4, 3, totalIn, totalIn + 1];
  const sparkOut = [2, 1, 3, 2, 1, totalOut, totalOut];
  const sparkBalance = [5, 8, 6, 9, 7, balance, balance + 1];

  const filtered = movements.filter(m => {
    if (search && !m.product_name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== "all" && m.type !== filterType) return false;
    if (filterWarehouse !== "all" && m.warehouse !== filterWarehouse) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const exportData = (type: "csv" | "xls") => {
    const data = filtered.map(m => ({
      Producto: m.product_name, SKU: m.product_sku || "",
      Tipo: m.type === "in" ? "Entrada" : "Salida",
      Cantidad: m.quantity, Almacén: m.warehouse || "",
      Referencia: m.reference || "", Fecha: m.created_at ? new Date(m.created_at).toLocaleString("es-ES") : "",
    }));
    if (type === "csv") downloadCSV(data, "inventario"); else downloadExcel(data, "inventario");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-xs text-[var(--mp-text-tertiary)]">
        <span className="hover:text-[var(--mp-text-secondary)] cursor-pointer">Inventario</span>
        <span>/</span>
        <span className="text-[var(--mp-text-secondary)]">Control</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(255,107,0,0.1)] text-[var(--mp-accent)]">
            <Grid3X3 size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--mp-text-primary)]">Control de Inventario</h1>
            <p className="text-sm text-[var(--mp-text-tertiary)]">Supervisa entradas, salidas y niveles de stock en tiempo real.</p>
          </div>
        </div>
        <button onClick={() => { setForm({ product_id: "", type: "in", quantity: "1", reference: "", notes: "", warehouse_id: "", date: new Date().toISOString().slice(0, 16) }); setModal(true); }}
          className="mp-btn-primary text-sm"><Plus size={15} /> Nuevo Movimiento</button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Entradas Hoy */}
        <div className="mp-kpi group">
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-bold text-[var(--mp-text-tertiary)] uppercase tracking-wider">Entradas (Hoy)</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(255,107,0,0.1)] text-[var(--mp-accent)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-[var(--mp-text-primary)]">+{totalIn}</p>
          <p className="text-[11px] text-[var(--mp-text-tertiary)] mt-0.5">Unidades</p>
          <div className="flex items-center justify-between mt-3">
            <MiniSparkline data={sparkIn} color="var(--mp-accent)" />
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-[rgba(16,185,129,0.1)] text-[var(--mp-success)]">↑ 100% vs ayer</span>
          </div>
        </div>

        {/* Salidas Hoy */}
        <div className="mp-kpi group">
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-bold text-[var(--mp-text-tertiary)] uppercase tracking-wider">Salidas (Hoy)</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(239,68,68,0.1)] text-[var(--mp-danger)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 5 7 7-7 7" /><path d="M5 12h14" /></svg>
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-[var(--mp-text-primary)]">-{totalOut}</p>
          <p className="text-[11px] text-[var(--mp-text-tertiary)] mt-0.5">Unidades</p>
          <div className="flex items-center justify-between mt-3">
            <MiniSparkline data={sparkOut} color="var(--mp-danger)" />
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-[rgba(239,68,68,0.1)] text-[var(--mp-danger)]">↓ 0% vs ayer</span>
          </div>
        </div>

        {/* Balance Actual */}
        <div className="mp-kpi group">
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-bold text-[var(--mp-text-tertiary)] uppercase tracking-wider">Balance Actual</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(59,130,246,0.1)] text-[#3B82F6]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg>
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-[var(--mp-text-primary)]">+{balance}</p>
          <p className="text-[11px] text-[var(--mp-text-tertiary)] mt-0.5">Unidades</p>
          <div className="flex items-center justify-between mt-3">
            <MiniSparkline data={sparkBalance} color="#3B82F6" />
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-[rgba(59,130,246,0.1)] text-[#3B82F6]">100% vs ayer</span>
          </div>
        </div>

        {/* Total Movimientos Hoy */}
        <div className="mp-kpi group">
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-bold text-[var(--mp-text-tertiary)] uppercase tracking-wider">Total Movimientos (Hoy)</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(139,92,246,0.1)] text-[#8B5CF6]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-[var(--mp-text-primary)]">{todayMovements.length}</p>
          <p className="text-[11px] text-[var(--mp-text-tertiary)] mt-0.5">Movimientos<br />Total registrados</p>
          <div className="mt-3">
            <SimpleBarChart data={[3, 5, 2, 7, 4, todayMovements.length, 6]} color="#8B5CF6" />
          </div>
        </div>
      </div>

      {/* Alerts + Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Low Stock Alerts */}
        <div className="mp-card overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--mp-border)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[rgba(245,158,11,0.1)]">
                <AlertTriangle size={14} className="text-[var(--mp-warning)]" />
              </div>
              <span className="text-sm font-bold text-[var(--mp-text-primary)]">Alertas por bajo stock</span>
            </div>
            <span className="text-xs font-medium text-[var(--mp-accent)] cursor-pointer hover:underline">Ver todas ({alerts.low_stock.length + alerts.out_of_stock.length})</span>
          </div>
          <div className="divide-y divide-[var(--mp-border-subtle)]">
            {alerts.low_stock.length === 0 && alerts.out_of_stock.length === 0 ? (
              <div className="py-10 text-center">
                <CheckCircle size={20} className="mx-auto mb-2 text-[var(--mp-success)]" />
                <p className="text-sm font-semibold text-[var(--mp-text-primary)]">Todo en stock</p>
                <p className="text-xs text-[var(--mp-text-tertiary)]">No hay alertas de stock bajo</p>
              </div>
            ) : (
              [...alerts.out_of_stock.slice(0, 2), ...alerts.low_stock.slice(0, 3)].map((item, idx) => {
                const isCritical = item.stock === 0 || (item.min_stock && item.stock <= item.min_stock / 2);
                return (
                  <div key={item.id || idx} className="px-5 py-3.5 flex items-center gap-4 hover:bg-[var(--mp-bg-hover)] transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-[var(--mp-bg-elevated)] flex items-center justify-center shrink-0 overflow-hidden">
                      {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> :
                        <Package size={16} className="text-[var(--mp-text-tertiary)]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--mp-text-primary)] truncate">{item.name}</p>
                      <p className="text-[10px] text-[var(--mp-text-tertiary)]">SKU: {item.sku || "—"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-[var(--mp-text-tertiary)]">Stock actual</p>
                      <p className="text-sm font-bold text-[var(--mp-danger)]">{item.stock} unidades</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-[var(--mp-text-tertiary)]">Stock mínimo</p>
                      <p className="text-sm font-medium text-[var(--mp-text-secondary)]">{item.min_stock || 5} unidades</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 ${isCritical ? "bg-[rgba(239,68,68,0.1)] text-[var(--mp-danger)]" : "bg-[rgba(245,158,11,0.1)] text-[var(--mp-warning)]"}`}>
                      {isCritical ? "Crítico" : "Bajo"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Movements Chart */}
        <div className="mp-card overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--mp-border)] flex items-center justify-between">
            <span className="text-sm font-bold text-[var(--mp-text-primary)]">Resumen de movimientos</span>
            <select className="mp-select text-xs py-1 px-2 w-auto">
              <option>Últimos 7 días</option>
              <option>Últimos 30 días</option>
              <option>Este mes</option>
            </select>
          </div>
          <div className="p-5">
            {/* Simple line chart with CSS */}
            <div className="relative h-48">
              <svg width="100%" height="100%" viewBox="0 0 500 180" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 1, 2, 3].map(i => (
                  <line key={i} x1="0" y1={i * 60} x2="500" y2={i * 60} stroke="var(--mp-border)" strokeWidth="0.5" strokeDasharray="4,4" />
                ))}
                {/* Entradas line */}
                <polyline points="0,120 80,100 160,110 240,80 320,90 400,60 500,70" fill="none" stroke="var(--mp-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="400" cy="60" r="5" fill="var(--mp-accent)" stroke="white" strokeWidth="2" />
                {/* Salidas line */}
                <polyline points="0,140 80,130 160,120 240,140 320,135 400,130 500,125" fill="none" stroke="var(--mp-danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="400" cy="130" r="4" fill="var(--mp-danger)" stroke="white" strokeWidth="2" />
              </svg>
              {/* Tooltip */}
              <div className="absolute top-4 right-8 bg-[var(--mp-bg-card)] border border-[var(--mp-border)] rounded-xl px-3 py-2 shadow-lg text-xs">
                <p className="font-bold text-[var(--mp-text-primary)]">11 Jul 2026</p>
                <p className="text-[var(--mp-accent)]">● Entradas: +2</p>
                <p className="text-[var(--mp-danger)]">● Salidas: -0</p>
              </div>
            </div>
            {/* X axis labels */}
            <div className="flex justify-between text-[10px] text-[var(--mp-text-tertiary)] mt-2 px-2">
              {["8 Jul", "9 Jul", "10 Jul", "11 Jul", "12 Jul", "13 Jul", "14 Jul"].map(d => <span key={d}>{d}</span>)}
            </div>
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-[10px] text-[var(--mp-text-secondary)]"><span className="w-2 h-2 rounded-full bg-[var(--mp-accent)]" /> Entradas</span>
              <span className="flex items-center gap-1.5 text-[10px] text-[var(--mp-text-secondary)]"><span className="w-2 h-2 rounded-full bg-[var(--mp-danger)]" /> Salidas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] pointer-events-none" />
          <input className="mp-input pl-9 text-sm" placeholder="Buscar producto..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
            className="mp-select text-xs py-1.5 px-3 w-auto">
            <option value="all">Tipo: Todos</option>
            <option value="in">Tipo: Entrada</option>
            <option value="out">Tipo: Salida</option>
          </select>
          <select value={filterMovement} onChange={e => { setFilterMovement(e.target.value); setPage(1); }}
            className="mp-select text-xs py-1.5 px-3 w-auto">
            <option value="all">Movimiento: Todos</option>
            <option value="purchase">Compra a proveedor</option>
            <option value="sale">Venta</option>
            <option value="adjustment">Ajuste</option>
          </select>
          <select value={filterWarehouse} onChange={e => { setFilterWarehouse(e.target.value); setPage(1); }}
            className="mp-select text-xs py-1.5 px-3 w-auto">
            <option value="all">Almacén: Todos</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <select value={filterDate} onChange={e => { setFilterDate(e.target.value); setPage(1); }}
            className="mp-select text-xs py-1.5 px-3 w-auto">
            <option value="all">Fecha: Todas</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button className="mp-btn-ghost text-xs"><Filter size={13} /> Filtros</button>
          <div className="relative group">
            <button className="mp-btn-ghost text-xs"><Download size={13} /> Exportar <ChevronDown size={12} /></button>
            <div className="absolute right-0 top-full mt-1 w-36 py-1 rounded-xl bg-[var(--mp-bg-card)] border border-[var(--mp-border)] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button onClick={() => exportData("csv")} className="w-full text-left px-3 py-2 text-xs text-[var(--mp-text-secondary)] hover:bg-[var(--mp-bg-hover)]">Exportar CSV</button>
              <button onClick={() => exportData("xls")} className="w-full text-left px-3 py-2 text-xs text-[var(--mp-text-secondary)] hover:bg-[var(--mp-bg-hover)]">Exportar Excel</button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mp-card overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="mp-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th className="text-center">Tipo</th>
                <th>Movimiento</th>
                <th className="text-center">Cantidad</th>
                <th className="hidden lg:table-cell">Almacén</th>
                <th className="hidden lg:table-cell">Referencia</th>
                <th className="hidden lg:table-cell">Usuario</th>
                <th>Fecha</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={9} className="px-4 py-3"><div className="h-12 rounded-lg bg-[var(--mp-bg-elevated)] animate-pulse" /></td></tr>
                ))
              ) : paginated.length === 0 ? (
                <tr><td colSpan={9}>
                  <div className="py-16 text-center">
                    <Package size={28} className="mx-auto mb-3 text-[var(--mp-text-tertiary)]" />
                    <p className="text-sm font-semibold text-[var(--mp-text-primary)]">Sin movimientos</p>
                    <p className="text-xs text-[var(--mp-text-tertiary)] mt-1">Registra tu primer movimiento de inventario</p>
                  </div>
                </td></tr>
              ) : (
                paginated.map(m => {
                  const isIn = m.type === "in";
                  return (
                    <tr key={m.id} className="hover:bg-[var(--mp-bg-hover)] transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[var(--mp-bg-elevated)] flex items-center justify-center shrink-0 overflow-hidden">
                            {m.product_image ? <img src={m.product_image} alt="" className="w-full h-full object-cover" /> :
                              <Package size={14} className="text-[var(--mp-text-tertiary)]" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--mp-text-primary)] truncate">{m.product_name}</p>
                            <p className="text-[10px] text-[var(--mp-text-tertiary)]">SKU: {m.product_sku || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${isIn ? "bg-[rgba(16,185,129,0.1)] text-[var(--mp-success)]" : "bg-[rgba(239,68,68,0.1)] text-[var(--mp-danger)]"}`}>
                          {isIn ? "ENTRADA" : "SALIDA"}
                        </span>
                      </td>
                      <td>
                        <div>
                          <p className="text-xs font-medium text-[var(--mp-text-primary)]">{isIn ? "Entrada de stock" : "Salida de stock"}</p>
                          <p className="text-[10px] text-[var(--mp-text-tertiary)]">{m.notes || (isIn ? "Compra a proveedor" : "Venta")}</p>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className={`text-sm font-bold ${isIn ? "text-[var(--mp-success)]" : "text-[var(--mp-danger)]"}`}>
                          {isIn ? "+" : "-"}{m.quantity}
                        </span>
                        <p className="text-[10px] text-[var(--mp-text-tertiary)]">Unidad{m.quantity > 1 ? "es" : ""}</p>
                      </td>
                      <td className="hidden lg:table-cell">
                        <span className="text-xs text-[var(--mp-text-secondary)]">{m.warehouse || "Almacén Principal"}</span>
                      </td>
                      <td className="hidden lg:table-cell">
                        <span className="text-xs text-[var(--mp-text-secondary)]">{m.reference || "—"}</span>
                      </td>
                      <td className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "var(--mp-accent)" }}>
                            {m.user_initials || "AD"}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-[var(--mp-text-primary)]">{m.user_name || "Admin"}</p>
                            <p className="text-[10px] text-[var(--mp-text-tertiary)]">Administrador</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="text-xs text-[var(--mp-text-secondary)]">{m.created_at ? new Date(m.created_at).toLocaleDateString("es-ES") : "—"}</p>
                          <p className="text-[10px] text-[var(--mp-text-tertiary)]">{m.created_at ? new Date(m.created_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : ""}</p>
                        </div>
                      </td>
                      <td>
                        <button className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-elevated)] transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-[var(--mp-text-tertiary)]">
            Mostrando {(page - 1) * perPage + 1} a {Math.min(page * perPage, filtered.length)} de {filtered.length} movimientos
          </span>
          <div className="flex items-center gap-4">
            <Pagination page={page} perPage={perPage} total={filtered.length} onChange={setPage} />
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--mp-text-tertiary)]">Mostrar</span>
              <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
                className="mp-select text-xs py-1 px-2 w-16">
                {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span className="text-xs text-[var(--mp-text-tertiary)]">por página</span>
            </div>
          </div>
        </div>
      )}

      {/* Movement Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setModal(false)}>
          <div className="mp-card w-full max-w-lg shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[var(--mp-border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[rgba(255,107,0,0.1)] text-[var(--mp-accent)]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--mp-text-primary)]">Registrar Movimiento</h3>
                  <p className="text-[11px] text-[var(--mp-text-tertiary)]">Completa la información para registrar una entrada o salida de inventario.</p>
                </div>
              </div>
              <button onClick={() => setModal(false)} className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)] transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* 1. Producto */}
              <div>
                <h4 className="text-sm font-bold text-[var(--mp-text-primary)] mb-3">1. Producto</h4>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Producto <span className="text-[var(--mp-danger)]">*</span></label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
                  <select className="mp-input text-sm pl-9 pr-9" value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })}>
                    <option value="">Seleccionar producto...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ""}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] pointer-events-none" />
                </div>
              </div>

              {/* 2. Tipo de movimiento */}
              <div>
                <h4 className="text-sm font-bold text-[var(--mp-text-primary)] mb-3">2. Tipo de movimiento</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setForm({ ...form, type: "in" })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${form.type === "in" ? "border-[var(--mp-accent)] bg-[rgba(255,107,0,0.04)]" : "border-[var(--mp-border)] hover:border-[var(--mp-border-hover)]"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[rgba(16,185,129,0.1)]">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--mp-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                      </div>
                      <span className="text-sm font-bold text-[var(--mp-text-primary)]">Entrada</span>
                    </div>
                    <p className="text-[10px] text-[var(--mp-text-tertiary)]">Aumenta la cantidad en inventario</p>
                  </button>
                  <button type="button" onClick={() => setForm({ ...form, type: "out" })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${form.type === "out" ? "border-[var(--mp-danger)] bg-[rgba(239,68,68,0.04)]" : "border-[var(--mp-border)] hover:border-[var(--mp-border-hover)]"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[rgba(239,68,68,0.1)]">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--mp-danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 5 7 7-7 7" /><path d="M5 12h14" /></svg>
                      </div>
                      <span className="text-sm font-bold text-[var(--mp-text-primary)]">Salida</span>
                    </div>
                    <p className="text-[10px] text-[var(--mp-text-tertiary)]">Disminuye la cantidad en inventario</p>
                  </button>
                </div>
              </div>

              {/* 3. Detalles */}
              <div>
                <h4 className="text-sm font-bold text-[var(--mp-text-primary)] mb-3">3. Detalles del movimiento</h4>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Cantidad <span className="text-[var(--mp-danger)]">*</span></label>
                    <input type="number" min="1" className="mp-input text-sm" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Referencia</label>
                    <input className="mp-input text-sm" placeholder="Ej: Factura #, OC-123, etc." value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Almacén <span className="text-[var(--mp-danger)]">*</span></label>
                    <div className="relative">
                      <select className="mp-input text-sm pr-8" value={form.warehouse_id} onChange={e => setForm({ ...form, warehouse_id: e.target.value })}>
                        <option value="">Seleccionar almacén</option>
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Fecha <span className="text-[var(--mp-danger)]">*</span></label>
                  <input type="datetime-local" className="mp-input text-sm" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-[var(--mp-text-secondary)]">Notas adicionales</label>
                    <span className="text-[10px] text-[var(--mp-text-tertiary)]">{form.notes.length}/200</span>
                  </div>
                  <textarea className="mp-input text-sm resize-none" rows={3} maxLength={200} placeholder="Agrega notas sobre este movimiento (opcional)..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className="mx-6 mb-4 px-4 py-3 rounded-xl bg-[rgba(59,130,246,0.04)] border border-[rgba(59,130,246,0.15)] flex items-start gap-2">
              <Info size={14} className="text-[#3B82F6] mt-0.5 shrink-0" />
              <p className="text-[11px] text-[var(--mp-text-secondary)]">El movimiento se registrará en el inventario y quedará reflejado en el balance actual.</p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[var(--mp-border)] flex items-center justify-between">
              <button type="button" onClick={() => setModal(false)} className="mp-btn-ghost text-sm">Cancelar</button>
              <button type="button" onClick={handleSave} className="mp-btn-primary text-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
                Registrar Movimiento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
