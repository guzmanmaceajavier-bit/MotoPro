import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import { BarChart3, TrendingUp, Users, Wrench, Package, Download, Loader2 } from "lucide-react";

interface Report { label: string; value: number; color?: string; }
interface ExecutiveReport { revenue: number; profit: number; completedOrders: number; newCustomers: number; trend: Report[]; }
interface FinancialReport { revenue: number; expenses: number; profit: number; invoices: number; payments: number; pending: number; byMonth: Report[]; byPaymentMethod: Report[]; }
interface WorkshopReport { total: number; avgDays: number; warrantyClaims: number; completionRate: number; byStatus: Report[]; byMechanic: Report[]; }
interface InventoryReport { totalProducts: number; totalValue: number; lowStock: number; outOfStock: number; topSelling: Report[]; }
interface CustomerReport { total: number; newThisMonth: number; retentionRate: number; avgSpent: number; topSpenders: Report[]; }

function MiniBar({ data }: { data: Report[] }) {
  if (!data || !data.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold text-[var(--mp-text-primary)]">{d.value.toLocaleString()}</span>
          <div className="w-full rounded-t transition-all" style={{ height: `${(d.value / max) * 100}%`, minHeight: 4, background: d.color || "var(--mp-accent)" }} />
          <span className="text-[9px] text-[var(--mp-text-tertiary)] text-center leading-tight truncate w-full">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function MiniPie({ data }: { data: Report[] }) {
  if (!data || !data.length) return null;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const colors = ["#25D366", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#FF6B00"];
  let cum = 0;
  return (
    <div className="space-y-2">
      {data.map((d, i) => {
        const pct = ((d.value / total) * 100).toFixed(1);
        const color = d.color || colors[i % colors.length];
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-xs text-[var(--mp-text-primary)] flex-1 truncate">{d.label}</span>
            <span className="text-xs font-bold text-[var(--mp-text-primary)]">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState("executive");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});
  const [period, setPeriod] = useState("month");
  const [exporting, setExporting] = useState(false);
  const { showToast } = useToast();

  const reports = [
    { key: "executive", label: "Ejecutivo", icon: <BarChart3 size={15} /> },
    { key: "financial", label: "Financiero", icon: <TrendingUp size={15} /> },
    { key: "workshop", label: "Taller", icon: <Wrench size={15} /> },
    { key: "inventory", label: "Inventario", icon: <Package size={15} /> },
    { key: "customers", label: "Clientes", icon: <Users size={15} /> },
  ];

  const load = () => {
    setLoading(true);
    api.get(`/reports/${activeReport}?period=${period}`).then((r) => setData(r || {})).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [activeReport, period]);

  const exportCSV = async (format: string) => {
    setExporting(true);
    try {
      const resp = await api.get(`/reports/export/${activeReport}?format=${period}&type=${format}`);
      const blob = new Blob([typeof resp === "string" ? resp : JSON.stringify(resp)], { type: format === "excel" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `reporte_${activeReport}_${period}.${format === "excel" ? "xlsx" : "csv"}`; a.click();
      showToast("success", "Reporte descargado");
    } catch { showToast("error", "Error al exportar"); } finally { setExporting(false); }
  };

  const fmt = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--mp-accent)] to-[#059669] flex items-center justify-center shadow-lg">
            <BarChart3 size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--mp-text-primary)]">Reportes y Analitica</h1>
            <p className="text-sm text-[var(--mp-text-tertiary)]">Metricas e informes del negocio</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[var(--mp-bg-elevated)] rounded-lg p-1">
            {[{ k: "week", l: "Sem" }, { k: "month", l: "Mes" }, { k: "quarter", l: "Trim" }, { k: "year", l: "Anio" }].map((p) => (
              <button key={p.k} onClick={() => setPeriod(p.k)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${period === p.k ? "bg-[var(--mp-accent)] text-white" : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)]"}`} type="button">{p.l}</button>
            ))}
          </div>
          <button onClick={() => exportCSV("csv")} disabled={exporting} className="mp-btn-secondary text-sm" type="button"><Download size={14} /> CSV</button>
          <button onClick={() => exportCSV("excel")} disabled={exporting} className="mp-btn-secondary text-sm" type="button"><Download size={14} /> Excel</button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-[var(--mp-border)] overflow-x-auto">
        {reports.map((r) => (
          <button key={r.key} onClick={() => setActiveReport(r.key)} className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${activeReport === r.key ? "text-[var(--mp-accent)]" : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)]"}`} type="button">
            {r.icon} {r.label}
            {activeReport === r.key && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[var(--mp-accent)] rounded-t-full" />}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-[var(--mp-accent)]" /></div>
      ) : (
        <div className="space-y-6">
          {activeReport === "executive" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Ingresos del periodo", value: fmt(data.revenue || 0), color: "#25D366" },
                  { label: "Ganancia neta", value: fmt(data.profit || 0), color: "#3B82F6" },
                  { label: "Ordenes completadas", value: String(data.completedOrders || 0), color: "#8B5CF6" },
                  { label: "Clientes nuevos", value: String(data.newCustomers || 0), color: "#F59E0B" },
                ].map((s) => (
                  <div key={s.label} className="mp-card p-4">
                    <p className="text-xs font-medium text-[var(--mp-text-tertiary)] mb-1">{s.label}</p>
                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>
              {data.trend && (
                <div className="mp-card p-5">
                  <h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-4">Tendencia de ingresos</h3>
                  <MiniBar data={data.trend} />
                </div>
              )}
            </div>
          )}

          {activeReport === "financial" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="mp-card p-4 text-center"><p className="text-xs text-[var(--mp-text-tertiary)] mb-1">Ingresos</p><p className="text-2xl font-bold text-[#25D366]">{fmt(data.revenue || 0)}</p></div>
                <div className="mp-card p-4 text-center"><p className="text-xs text-[var(--mp-text-tertiary)] mb-1">Gastos</p><p className="text-2xl font-bold text-[#EF4444]">{fmt(data.expenses || 0)}</p></div>
                <div className="mp-card p-4 text-center"><p className="text-xs text-[var(--mp-text-tertiary)] mb-1">Utilidad</p><p className="text-2xl font-bold text-[#3B82F6]">{fmt(data.profit || 0)}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="mp-card p-5"><h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-4">Ingresos por mes</h3><MiniBar data={data.byMonth || []} /></div>
                <div className="mp-card p-5"><h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-4">Por metodo de pago</h3><MiniPie data={data.byPaymentMethod || []} /></div>
              </div>
              <div className="mp-card p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><p className="text-xs text-[var(--mp-text-tertiary)]">Facturas</p><p className="text-lg font-bold text-[var(--mp-text-primary)]">{data.invoices || 0}</p></div>
                  <div><p className="text-xs text-[var(--mp-text-tertiary)]">Pagos recibidos</p><p className="text-lg font-bold text-[#25D366]">{data.payments || 0}</p></div>
                  <div><p className="text-xs text-[var(--mp-text-tertiary)]">Por cobrar</p><p className="text-lg font-bold text-[#F59E0B]">{fmt(data.pending || 0)}</p></div>
                </div>
              </div>
            </div>
          )}

          {activeReport === "workshop" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="mp-card p-4"><p className="text-xs text-[var(--mp-text-tertiary)]">Total ordenes</p><p className="text-2xl font-bold text-[var(--mp-text-primary)]">{data.total || 0}</p></div>
                <div className="mp-card p-4"><p className="text-xs text-[var(--mp-text-tertiary)]">Promedio dias</p><p className="text-2xl font-bold text-[#3B82F6]">{data.avgDays || 0}</p></div>
                <div className="mp-card p-4"><p className="text-xs text-[var(--mp-text-tertiary)]">Garantias</p><p className="text-2xl font-bold text-[#F59E0B]">{data.warrantyClaims || 0}</p></div>
                <div className="mp-card p-4"><p className="text-xs text-[var(--mp-text-tertiary)]">Tasa completado</p><p className="text-2xl font-bold text-[#25D366]">{data.completionRate || 0}%</p></div>
              </div>
              {data.byStatus && <div className="mp-card p-5"><h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-4">Por estado</h3><MiniBar data={data.byStatus} /></div>}
              {data.byMechanic && <div className="mp-card p-5"><h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-4">Por mecanico</h3><MiniBar data={data.byMechanic} /></div>}
            </div>
          )}

          {activeReport === "inventory" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="mp-card p-4"><p className="text-xs text-[var(--mp-text-tertiary)]">Productos</p><p className="text-2xl font-bold text-[var(--mp-text-primary)]">{data.totalProducts || 0}</p></div>
                <div className="mp-card p-4"><p className="text-xs text-[var(--mp-text-tertiary)]">Valor total</p><p className="text-2xl font-bold text-[#3B82F6]">{fmt(data.totalValue || 0)}</p></div>
                <div className="mp-card p-4"><p className="text-xs text-[var(--mp-text-tertiary)]">Stock bajo</p><p className="text-2xl font-bold text-[#F59E0B]">{data.lowStock || 0}</p></div>
                <div className="mp-card p-4"><p className="text-xs text-[var(--mp-text-tertiary)]">Sin stock</p><p className="text-2xl font-bold text-[#EF4444]">{data.outOfStock || 0}</p></div>
              </div>
              {data.topSelling && <div className="mp-card p-5"><h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-4">Mas vendidos</h3><MiniBar data={data.topSelling} /></div>}
            </div>
          )}

          {activeReport === "customers" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="mp-card p-4"><p className="text-xs text-[var(--mp-text-tertiary)]">Total clientes</p><p className="text-2xl font-bold text-[var(--mp-text-primary)]">{data.total || 0}</p></div>
                <div className="mp-card p-4"><p className="text-xs text-[var(--mp-text-tertiary)]">Nuevos este mes</p><p className="text-2xl font-bold text-[#25D366]">{data.newThisMonth || 0}</p></div>
                <div className="mp-card p-4"><p className="text-xs text-[var(--mp-text-tertiary)]">Retencion</p><p className="text-2xl font-bold text-[#3B82F6]">{data.retentionRate || 0}%</p></div>
                <div className="mp-card p-4"><p className="text-xs text-[var(--mp-text-tertiary)]">Gasto promedio</p><p className="text-2xl font-bold text-[#8B5CF6]">{fmt(data.avgSpent || 0)}</p></div>
              </div>
              {data.topSpenders && <div className="mp-card p-5"><h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-4">Top clientes por gasto</h3><MiniBar data={data.topSpenders} /></div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
