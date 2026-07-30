import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import { Award, Gift, TrendingUp, Users, Search, Star, Loader2, Plus, Minus } from "lucide-react";
import DataTable from "@/components/DataTable";

interface LoyaltyCustomer { id: string; name: string; email: string; points: number; totalEarned: number; totalRedeemed: number; }
interface LoyaltyHistory { id: string; customer_name: string; points: number; type: string; description: string; created_at: string; }
interface LoyaltyConfig { points_per_100k: number; points_per_service: number; birthday_bonus: number; first_order_bonus: number; redemption_rate: number; min_redeem: number; enabled: boolean; }

export default function LoyaltyPage() {
  const [tab, setTab] = useState<"customers" | "history" | "config">("customers");
  const [customers, setCustomers] = useState<LoyaltyCustomer[]>([]);
  const [history, setHistory] = useState<LoyaltyHistory[]>([]);
  const [config, setConfig] = useState<LoyaltyConfig>({ points_per_100k: 100, points_per_service: 50, birthday_bonus: 200, first_order_bonus: 100, redemption_rate: 0.01, min_redeem: 1000, enabled: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [adjustModal, setAdjustModal] = useState<{ customerId: string; customerName: string } | null>(null);
  const [adjustPoints, setAdjustPoints] = useState("");
  const [adjustDesc, setAdjustDesc] = useState("");
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get("/loyalty/customers").catch(() => []),
      api.get("/loyalty/history?limit=100").catch(() => []),
      api.get("/loyalty/config").catch(() => ({})),
    ]).then(([c, h, cfg]) => {
      setCustomers(Array.isArray(c) ? c : []);
      setHistory(Array.isArray(h) ? h : []);
      if (cfg && Object.keys(cfg).length) setConfig({ ...config, ...cfg });
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const saveConfig = async () => {
    setSaving(true);
    try {
      await api.put("/loyalty/config", config);
      showToast("success", "Configuracion de fidelidad guardada");
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); } finally { setSaving(false); }
  };

  const adjust = async () => {
    if (!adjustModal || !adjustPoints) return;
    const pts = parseInt(adjustPoints);
    if (isNaN(pts) || pts === 0) { showToast("error", "Puntos invalidos"); return; }
    try {
      await api.post(`/loyalty/points/${adjustModal.customerId}`, { points: pts, description: adjustDesc || "Ajuste manual" });
      showToast("success", `${pts > 0 ? "Agregados" : "Restados"} ${Math.abs(pts)} puntos`);
      setAdjustModal(null); setAdjustPoints(""); setAdjustDesc(""); load();
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
  };

  const filteredCustomers = customers.filter((c) => !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()));

  const customerColumns = [
    { key: "name", label: "Cliente" },
    { key: "email", label: "Email", render: (v: unknown) => <span className="text-xs">{String(v || "")}</span> },
    { key: "points", label: "Puntos", render: (v: unknown) => <span className="font-bold text-[var(--mp-accent)]">{String(v)}</span> },
    { key: "totalEarned", label: "Acumulados", render: (v: unknown) => <span className="text-xs text-[#25D366]">+{String(v)}</span> },
    { key: "totalRedeemed", label: "Canjeados", render: (v: unknown) => <span className="text-xs text-[#F59E0B]">-{String(v)}</span> },
    { key: "actions", label: "", render: (_: unknown, row: any) => (
      <button onClick={() => setAdjustModal({ customerId: row.id, customerName: row.name })} className="text-[var(--mp-accent)] hover:underline text-xs font-medium" type="button">Ajustar</button>
    )},
  ];

  const historyColumns = [
    { key: "customer_name", label: "Cliente" },
    { key: "points", label: "Puntos", render: (v: unknown) => <span className={`font-bold ${Number(v) > 0 ? "text-[#25D366]" : "text-[#EF4444]"}`}>{Number(v) > 0 ? "+" : ""}{String(v)}</span> },
    { key: "type", label: "Tipo", render: (v: unknown) => <span className="text-xs px-2 py-0.5 rounded bg-[var(--mp-bg-elevated)]">{String(v)}</span> },
    { key: "description", label: "Descripcion", render: (v: unknown) => <span className="text-xs truncate max-w-[200px] block">{String(v)}</span> },
    { key: "created_at", label: "Fecha", render: (v: unknown) => <span className="text-xs">{new Date(String(v)).toLocaleDateString("es-ES")}</span> },
  ];

  const totalPoints = customers.reduce((s, c) => s + (c.points || 0), 0);
  const totalEarned = customers.reduce((s, c) => s + (c.totalEarned || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center shadow-lg">
            <Award size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--mp-text-primary)]">Programa de Fidelidad</h1>
            <p className="text-sm text-[var(--mp-text-tertiary)]">Puntos, canjes y recompensas para clientes</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="mp-card p-4"><div className="flex items-center gap-2 mb-1"><Users size={14} className="text-[var(--mp-accent)]" /><span className="text-xs text-[var(--mp-text-tertiary)]">Clientes activos</span></div><p className="text-2xl font-bold text-[var(--mp-text-primary)]">{customers.length}</p></div>
        <div className="mp-card p-4"><div className="flex items-center gap-2 mb-1"><Star size={14} className="text-[#F59E0B]" /><span className="text-xs text-[var(--mp-text-tertiary)]">Puntos totales</span></div><p className="text-2xl font-bold text-[#F59E0B]">{totalPoints.toLocaleString()}</p></div>
        <div className="mp-card p-4"><div className="flex items-center gap-2 mb-1"><TrendingUp size={14} className="text-[#25D366]" /><span className="text-xs text-[var(--mp-text-tertiary)]">Acumulados</span></div><p className="text-2xl font-bold text-[#25D366]">{totalEarned.toLocaleString()}</p></div>
        <div className="mp-card p-4"><div className="flex items-center gap-2 mb-1"><Gift size={14} className="text-[#8B5CF6]" /><span className="text-xs text-[var(--mp-text-tertiary)]">Canjeados</span></div><p className="text-2xl font-bold text-[#8B5CF6]">{(totalEarned - totalPoints).toLocaleString()}</p></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--mp-border)]">
        {[
          { key: "customers" as const, label: "Clientes", icon: <Users size={14} /> },
          { key: "history" as const, label: "Historial", icon: <TrendingUp size={14} /> },
          { key: "config" as const, label: "Configuracion", icon: <Award size={14} /> },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all ${tab === t.key ? "text-[var(--mp-accent)]" : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)]"}`} type="button">
            {t.icon} {t.label}
            {tab === t.key && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[var(--mp-accent)] rounded-t-full" />}
          </button>
        ))}
      </div>

      {loading ? <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-[var(--mp-accent)]" /></div> : (
        <>
          {tab === "customers" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-[var(--mp-bg-elevated)] rounded-lg px-3 py-2 flex-1 max-w-sm">
                  <Search size={14} className="text-[var(--mp-text-tertiary)]" />
                  <input type="text" className="bg-transparent text-sm outline-none flex-1 text-[var(--mp-text-primary)]" placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>
              <DataTable columns={customerColumns} data={filteredCustomers} pageSize={25} />
            </div>
          )}

          {tab === "history" && (
            <DataTable columns={historyColumns} data={history} pageSize={25} />
          )}

          {tab === "config" && (
            <div className="space-y-5 max-w-2xl">
              <div className="mp-card p-5">
                <h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-4">Acumulacion de puntos</h3>
                <div className="space-y-3">
                  {[
                    { key: "points_per_100k", label: "Puntos por $100.000 en compras", icon: "💰" },
                    { key: "points_per_service", label: "Puntos por servicio completado", icon: "🔧" },
                    { key: "birthday_bonus", label: "Bonus de cumpleanos", icon: "🎂" },
                    { key: "first_order_bonus", label: "Bonus primera compra", icon: "🎉" },
                  ].map((f) => (
                    <div key={f.key} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--mp-bg-elevated)]">
                      <span className="text-lg">{f.icon}</span>
                      <label className="text-xs font-medium text-[var(--mp-text-primary)] flex-1">{f.label}</label>
                      <input type="number" min="0" className="mp-input text-sm w-24 text-right" value={(config as any)[f.key] || 0} onChange={(e) => setConfig({ ...config, [f.key]: parseInt(e.target.value) || 0 })} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mp-card p-5">
                <h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-4">Canje</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--mp-bg-elevated)]">
                    <span className="text-lg">🔄</span>
                    <label className="text-xs font-medium text-[var(--mp-text-primary)] flex-1">Valor por punto ($)</label>
                    <input type="number" step="0.001" min="0" className="mp-input text-sm w-24 text-right" value={config.redemption_rate || 0.01} onChange={(e) => setConfig({ ...config, redemption_rate: parseFloat(e.target.value) || 0.01 })} />
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--mp-bg-elevated)]">
                    <span className="text-lg">🎯</span>
                    <label className="text-xs font-medium text-[var(--mp-text-primary)] flex-1">Minimo para canjear</label>
                    <input type="number" min="0" className="mp-input text-sm w-24 text-right" value={config.min_redeem || 1000} onChange={(e) => setConfig({ ...config, min_redeem: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
                <div>
                  <p className="text-sm font-medium text-[var(--mp-text-primary)]">Programa activo</p>
                  <p className="text-xs text-[var(--mp-text-tertiary)]">Habilitar o deshabilitar el programa de fidelidad</p>
                </div>
                <button onClick={() => setConfig({ ...config, enabled: !config.enabled })} type="button" className={`w-11 h-6 rounded-full transition-all relative ${config.enabled ? "bg-[var(--mp-accent)]" : "bg-[var(--mp-bg-hover)]"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${config.enabled ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>
              <button onClick={saveConfig} disabled={saving} className="mp-btn-primary text-sm">
                {saving ? <Loader2 size={15} className="animate-spin" /> : null}
                {saving ? "Guardando..." : "Guardar configuracion"}
              </button>
            </div>
          )}
        </>
      )}

      {/* Adjust Modal */}
      {adjustModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setAdjustModal(null)}>
          <div className="bg-[var(--mp-bg-card)] rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[var(--mp-text-primary)] mb-1">Ajustar puntos</h3>
            <p className="text-sm text-[var(--mp-text-tertiary)] mb-4">{adjustModal.customerName}</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[var(--mp-text-primary)] mb-1 block">Puntos (+ para agregar, - para restar)</label>
                <input type="number" className="mp-input text-sm w-full" value={adjustPoints} onChange={(e) => setAdjustPoints(e.target.value)} placeholder="Ej: 500 o -200" autoFocus />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--mp-text-primary)] mb-1 block">Descripcion</label>
                <input type="text" className="mp-input text-sm w-full" value={adjustDesc} onChange={(e) => setAdjustDesc(e.target.value)} placeholder="Motivo del ajuste" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setAdjustModal(null)} className="mp-btn-secondary text-sm flex-1" type="button">Cancelar</button>
                <button onClick={adjust} className="mp-btn-primary text-sm flex-1" type="button">Aplicar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
