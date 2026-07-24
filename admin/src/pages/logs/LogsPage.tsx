import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Activity, Users, FileText, Trash2, Download, Filter } from "lucide-react";
import DataTable from "@/components/DataTable";

interface Log {
  id: string; user_id: string; user_name?: string; action: string;
  entity_type: string; entity_id?: string; description: string;
  ip: string; created_at: string;
}

const actionColors: Record<string, string> = {
  POST: "text-green-600 bg-green-50",
  PUT: "text-blue-600 bg-blue-50",
  DELETE: "text-red-600 bg-red-50",
  PATCH: "text-orange-600 bg-orange-50",
};

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ entity_type: "", search: "" });
  const [stats, setStats] = useState({ total: 0, today: 0, byAction: [] as any[] });

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "25" });
    if (filters.entity_type) params.set("entity_type", filters.entity_type);
    if (filters.search) params.set("search", filters.search);
    api.get(`/system-config/logs?${params}`).then((r: any) => {
      setLogs(r.logs || []);
      setTotal(r.total || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, filters]);

  useEffect(() => {
    api.get("/system-config/logs?limit=1000").then((r: any) => {
      const all = r.logs || [];
      const today = all.filter((l: Log) => new Date(l.created_at).toDateString() === new Date().toDateString());
      const byAction: Record<string, number> = {};
      all.forEach((l: Log) => { byAction[l.action] = (byAction[l.action] || 0) + 1; });
      setStats({
        total: r.total || 0,
        today: today.length,
        byAction: Object.entries(byAction).map(([action, count]) => ({ action, count })),
      });
    }).catch(() => {});
  }, []);

  const clearLogs = async () => {
    if (!confirm("¿Eliminar todos los logs? Esta acción no se puede deshacer.")) return;
    await api.delete("/system-config/logs");
    load();
  };

  const columns = [
    {
      key: "action", label: "Acción", render: (v: unknown) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${actionColors[String(v)] || "text-gray-600 bg-gray-50"}`}>
          {String(v)}
        </span>
      ),
    },
    { key: "entity_type", label: "Entidad" },
    { key: "description", label: "Descripción", render: (v: unknown) => <span className="text-xs truncate max-w-[300px] block">{String(v)}</span> },
    { key: "user_name", label: "Usuario", render: (v: unknown) => String(v || "Sistema") },
    { key: "ip", label: "IP" },
    {
      key: "created_at", label: "Fecha", render: (v: unknown) => (
        <span className="text-xs">{new Date(String(v)).toLocaleString("es-ES")}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Monitoreo y Auditoría</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Registro de actividades del sistema</p>
        </div>
        <button onClick={clearLogs} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-red-600 hover:bg-red-50 transition-colors" type="button">
          <Trash2 size={13} /> Limpiar logs
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
          <div className="flex items-center gap-2 mb-2"><Activity size={16} style={{ color: "var(--accent)" }} /><span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Total logs</span></div>
          <p className="text-2xl font-bold" style={{ color: "var(--text)" }}>{stats.total}</p>
        </div>
        <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
          <div className="flex items-center gap-2 mb-2"><FileText size={16} style={{ color: "#3B82F6" }} /><span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Hoy</span></div>
          <p className="text-2xl font-bold" style={{ color: "var(--text)" }}>{stats.today}</p>
        </div>
        {stats.byAction.slice(0, 2).map((a) => (
          <div key={a.action} className="rounded-lg border p-4" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
            <div className="flex items-center gap-2 mb-2"><span className={`text-xs font-bold px-1.5 py-0.5 rounded ${actionColors[a.action] || ""}`}>{a.action}</span><span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>acciones</span></div>
            <p className="text-2xl font-bold" style={{ color: "var(--text)" }}>{a.count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: "var(--text-tertiary)" }} />
          <select value={filters.entity_type} onChange={(e) => setFilters({ ...filters, entity_type: e.target.value })}
            className="h-8 rounded-md border px-2 text-xs" style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--text)" }}>
            <option value="">Todas las entidades</option>
            {["work_orders", "customers", "products", "invoices", "appointments", "quotes", "users", "store_orders", "config"].map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={logs} loading={loading} pageSize={25} searchable={false} />
    </div>
  );
}
