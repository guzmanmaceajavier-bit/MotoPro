import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import {
  Bell, CheckCheck, Plus, X, Trash2, Loader2, Search, Info, AlertTriangle, CheckCircle2, XCircle, Send, Users, Mail
} from "lucide-react";
import PageHeader from "@/components/PageHeader";

interface AppNotification {
  id: string;
  user_id: string | null;
  customer_id: string | null;
  type: string;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  is_read: number;
  created_at: string;
}

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  info: { icon: <Info size={14} />, color: "#3B82F6" },
  success: { icon: <CheckCircle2 size={14} />, color: "#10B981" },
  warning: { icon: <AlertTriangle size={14} />, color: "#F59E0B" },
  danger: { icon: <XCircle size={14} />, color: "#EF4444" },
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [form, setForm] = useState({ type: "info", title: "", message: "", recipient: "general", user_id: "", customer_id: "" });
  const [sending, setSending] = useState(false);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    api.get("/notifications").then((r) => setNotifs(Array.isArray(r) ? r : [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!modal) return;
    if (users.length === 0) api.get("/users").then((r) => setUsers(Array.isArray(r) ? r : [])).catch(() => {});
    if (customers.length === 0) api.get("/customers?limit=100").then((r) => setCustomers(Array.isArray(r) ? r : r?.data ?? [])).catch(() => {});
  }, [modal]);

  const filtered = notifs.filter((n) => {
    if (filter === "unread" && n.is_read) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!n.title?.toLowerCase().includes(q) && !(n.message || "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const unreadCount = notifs.filter((n) => !n.is_read).length;

  const markRead = async (n: AppNotification) => {
    if (n.is_read) return;
    try {
      await api.put(`/notifications/${n.id}/read`);
      setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, is_read: 1 } : x));
    } catch { /* silencioso */ }
  };

  const markAll = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifs((prev) => prev.map((x) => ({ ...x, is_read: 1 })));
      showToast("success", "Todas marcadas como leídas");
    } catch { showToast("error", "Error al marcar"); }
  };

  const remove = async (n: AppNotification) => {
    if (!confirm("¿Eliminar esta notificación?")) return;
    try {
      await api.delete(`/notifications/${n.id}`);
      setNotifs((prev) => prev.filter((x) => x.id !== n.id));
      showToast("success", "Notificación eliminada");
    } catch { showToast("error", "Error al eliminar"); }
  };

  const send = async () => {
    if (!form.title.trim()) { showToast("error", "El título es requerido"); return; }
    setSending(true);
    try {
      const payload: any = { type: form.type, title: form.title.trim(), message: form.message.trim() };
      if (form.recipient === "user" && form.user_id) payload.user_id = form.user_id;
      if (form.recipient === "customer" && form.customer_id) payload.customer_id = form.customer_id;
      await api.post("/notifications", payload);
      showToast("success", "Notificación enviada");
      setModal(false); setForm({ type: "info", title: "", message: "", recipient: "general", user_id: "", customer_id: "" });
      load();
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error al enviar"); }
    finally { setSending(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Notificaciones"
        description="Mensajes centralizados para el equipo y los clientes"
        breadcrumbs={[{ label: "Sistema", to: "/" }, { label: "Notificaciones" }]}
        icon={<Bell size={20} />}
        action={
          <div className="flex items-center gap-2">
            <button onClick={markAll} className="mp-btn-secondary text-xs"><CheckCheck size={14} /> Marcar todas</button>
            <button onClick={() => setModal(true)} className="mp-btn-primary text-xs"><Plus size={14} /> Nueva Notificación</button>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <div className="mp-card p-4">
          <p className="text-xs text-[var(--mp-text-tertiary)] mb-1">Total</p>
          <p className="text-2xl font-bold text-[var(--mp-text-primary)]">{notifs.length}</p>
        </div>
        <div className="mp-card p-4">
          <p className="text-xs text-[var(--mp-text-tertiary)] mb-1">Sin leer</p>
          <p className="text-2xl font-bold text-[#3B82F6]">{unreadCount}</p>
        </div>
        <div className="mp-card p-4">
          <p className="text-xs text-[var(--mp-text-tertiary)] mb-1">Leídas</p>
          <p className="text-2xl font-bold text-[#10B981]">{notifs.length - unreadCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-[var(--mp-bg-elevated)] rounded-lg p-1">
          {([["all", "Todas"], ["unread", "Sin leer"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} type="button"
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === k ? "bg-[var(--mp-accent)] text-white" : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)]"}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] pointer-events-none" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar notificación..." className="mp-input pl-9" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-[var(--mp-accent)]" /></div>
      ) : filtered.length === 0 ? (
        <div className="mp-card p-10 text-center">
          <Bell size={32} className="mx-auto mb-3 text-[var(--mp-text-tertiary)]" />
          <p className="text-sm font-semibold text-[var(--mp-text-primary)]">Sin notificaciones</p>
          <p className="text-xs text-[var(--mp-text-tertiary)] mt-1">Las alertas del sistema y del taller aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const cfg = typeConfig[n.type] || typeConfig.info;
            return (
              <div key={n.id} onClick={() => markRead(n)}
                className={`mp-card p-4 flex items-start gap-3 cursor-pointer transition-opacity ${n.is_read ? "opacity-55" : ""}`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${cfg.color}1a`, color: cfg.color }}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--mp-text-primary)] truncate">{n.title}</p>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-[var(--mp-accent)] shrink-0" />}
                  </div>
                  {n.message && <p className="text-xs text-[var(--mp-text-secondary)] mt-0.5 line-clamp-2">{n.message}</p>}
                  <p className="text-[10px] text-[var(--mp-text-tertiary)] mt-1.5">
                    {n.created_at ? new Date(n.created_at.replace(" ", "T")).toLocaleString("es-CO") : ""}
                    {n.user_id ? " · Equipo" : n.customer_id ? " · Cliente" : " · General"}
                  </p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); remove(n); }}
                  className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:bg-[rgba(239,68,68,0.08)] hover:text-[var(--mp-danger)] transition-colors shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-scale-in max-h-[90vh] flex flex-col">
            <div className="flex items-center gap-3 px-6 pt-6 pb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(59,130,246,0.1)] text-[#3B82F6]">
                <Send size={18} />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-gray-900">Nueva Notificación</h3>
                <p className="text-xs text-gray-400">Notifica al equipo o a un cliente.</p>
              </div>
              <button onClick={() => setModal(false)} type="button"
                className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Tipo</label>
                <div className="flex items-center gap-2">
                  {Object.entries(typeConfig).map(([k, cfg]) => (
                    <button key={k} onClick={() => setForm({ ...form, type: k })} type="button"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.type === k ? "text-white border-transparent" : "text-gray-500 border-gray-200 hover:border-gray-300"}`}
                      style={form.type === k ? { background: cfg.color } : undefined}>
                      {cfg.icon} {k}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Título <span className="text-red-500">*</span></label>
                <input className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)]"
                  placeholder="Ej: Nueva orden de trabajo creada" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value.slice(0, 120) })} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Mensaje</label>
                <textarea rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)]"
                  placeholder="Detalle del mensaje (opcional)" value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value.slice(0, 500) })} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Destinatario</label>
                <div className="flex items-center gap-2 mb-3">
                  {([
                    ["general", "General", <Bell size={13} />],
                    ["user", "Equipo", <Users size={13} />],
                    ["customer", "Cliente", <Mail size={13} />],
                  ] as const).map(([k, l, icon]) => (
                    <button key={k} onClick={() => setForm({ ...form, recipient: k })} type="button"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.recipient === k ? "bg-[var(--mp-accent)] text-white" : "bg-[var(--mp-bg-elevated)] text-[var(--mp-text-tertiary)]"}`}>
                      {icon} {l}
                    </button>
                  ))}
                </div>
                {form.recipient === "user" && (
                  <select className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none"
                    value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })}>
                    <option value="">Selecciona un usuario del equipo...</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                  </select>
                )}
                {form.recipient === "customer" && (
                  <select className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none"
                    value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
                    <option value="">Selecciona un cliente...</option>
                    {customers.map((c) => <option key={c.id} value={c.id}>{c.name}{c.email ? ` (${c.email})` : ""}</option>)}
                  </select>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                Cancelar
              </button>
              <button onClick={send} disabled={sending || !form.title.trim() || (form.recipient === "user" && !form.user_id) || (form.recipient === "customer" && !form.customer_id)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white flex items-center gap-2 disabled:opacity-50 transition-colors"
                style={{ background: "var(--mp-accent)" }}>
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
