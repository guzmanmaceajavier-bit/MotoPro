import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { Bike, Wrench, ShoppingCart, FileText, Plus, Calendar, Heart } from "lucide-react";

interface Stats {
  vehicles: number; activeServices: number; purchases: number; pendingInvoices: number;
  recentServices: Array<{ id: string; order_number: string; status: string; created_at: string; service_type: string }>;
  recentPurchases: Array<{ id: string; total: number; status: string; created_at: string }>;
}

const quickActions = [
  { label: "Nuevo Vehículo", desc: "Registra tu moto", to: "/vehiculos/nuevo", icon: Bike, color: "#0EA5E9" },
  { label: "Agendar Cita", desc: "Solicita una cita", to: "/citas", icon: Calendar, color: "#8B5CF6" },
  { label: "Mis Servicios", desc: "Historial de servicios", to: "/servicios", icon: Wrench, color: "#F59E0B" },
  { label: "Favoritos", desc: "Productos guardados", to: "/favoritos", icon: Heart, color: "#EF4444" },
];

const statusColors: Record<string, string> = {
  received: "#6366F1", diagnosed: "#F59E0B", quoted: "#8B5CF6", approved: "#22C55E",
  in_progress: "#3B82F6", quality_check: "#0EA5E9", ready: "#10B981", delivered: "#22C55E",
  cancelled: "#EF4444",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/client/stats").then((r) => setStats(r)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const kpis = [
    { label: "Vehículos", value: stats?.vehicles || 0, sub: "Registrados", color: "#0EA5E9", icon: Bike },
    { label: "Servicios Activos", value: stats?.activeServices || 0, sub: "En taller", color: "#F59E0B", icon: Wrench },
    { label: "Compras", value: stats?.purchases || 0, sub: "Historial", color: "#22C55E", icon: ShoppingCart },
    { label: "Facturas", value: stats?.pendingInvoices || 0, sub: "Pendientes", color: "#8B5CF6", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-h3 text-text-primary tracking-tight">Hola, {user?.name || "Cliente"}</h1>
        <p className="text-body-sm text-text-tertiary mt-1">Resumen de tu cuenta</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-lg border border-border bg-surface-secondary p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15`, color: s.color }}>
                <s.icon size={16} />
              </div>
              <p className="text-tiny font-medium text-text-tertiary uppercase tracking-wider">{s.label}</p>
            </div>
            <p className="text-display font-bold tracking-tight" style={{ color: s.color }}>{loading ? "—" : s.value}</p>
            <p className="text-tiny text-text-tertiary mt-1">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-border bg-surface-secondary">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h2 className="text-caption font-semibold text-text-primary">Servicios Recientes</h2>
            <Link to="/servicios" className="text-tiny font-medium text-interactive-accent hover:underline">Ver todos</Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 w-full rounded-lg" />)}</div>
          ) : stats?.recentServices && stats.recentServices.length > 0 ? (
            <div className="divide-y divide-border">
              {stats.recentServices.map((s) => (
                <Link key={s.id} to={`/servicios/${s.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-surface-tertiary transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${statusColors[s.status] || "#9CA3AF"}15`, color: statusColors[s.status] || "#9CA3AF" }}>
                      <Wrench size={14} />
                    </div>
                    <div>
                      <p className="text-body-sm font-medium text-text-primary">{s.service_type}</p>
                      <p className="text-tiny text-text-tertiary">{s.order_number} · {new Date(s.created_at).toLocaleDateString("es-ES")}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${statusColors[s.status] || "#9CA3AF"}15`, color: statusColors[s.status] || "#9CA3AF" }}>
                    {s.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Wrench size={28} className="mx-auto text-text-tertiary mb-3" />
              <p className="text-body-sm text-text-secondary">Sin servicios aún</p>
              <p className="text-tiny text-text-tertiary mt-1">Los servicios solicitados aparecerán aquí</p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-lg border border-border bg-surface-secondary">
            <div className="border-b border-border px-5 py-3.5">
              <h2 className="text-caption font-semibold text-text-primary">Acceso Rápido</h2>
            </div>
            <div className="p-3 space-y-1">
              {quickActions.map((a) => (
                <Link key={a.label} to={a.to}
                  className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-body-sm text-text-secondary hover:bg-surface-tertiary hover:text-text-primary transition-colors group">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm transition-colors group-hover:text-white"
                    style={{ background: `${a.color}15`, color: a.color }}>
                    <a.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-medium text-text-primary">{a.label}</p>
                    <p className="text-tiny text-text-tertiary">{a.desc}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {stats?.recentPurchases && stats.recentPurchases.length > 0 && (
            <div className="rounded-lg border border-border bg-surface-secondary">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                <h2 className="text-caption font-semibold text-text-primary">Últimas Compras</h2>
                <Link to="/compras" className="text-tiny font-medium text-interactive-accent hover:underline">Ver todas</Link>
              </div>
              <div className="divide-y divide-border">
                {stats.recentPurchases.slice(0, 3).map((p) => (
                  <div key={p.id} className="px-5 py-3.5">
                    <div className="flex items-center justify-between">
                      <p className="text-body-sm font-medium text-text-primary">${p.total?.toLocaleString() || 0}</p>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: p.status === "completed" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)", color: p.status === "completed" ? "#22C55E" : "#F59E0B" }}>
                        {p.status}
                      </span>
                    </div>
                    <p className="text-tiny text-text-tertiary">{new Date(p.created_at).toLocaleDateString("es-ES")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
