import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Bell, Info, AlertTriangle, CheckCircle, CheckCheck } from "lucide-react";

interface Notification {
  id: string; title: string; message: string; type: string; is_read: number; created_at: string;
}

const typeMeta: Record<string, { icon: any; color: string; bg: string }> = {
  success:  { icon: CheckCircle,  color: "#22C55E", bg: "rgba(34,197,94,0.1)" },
  info:     { icon: Info,         color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  warning:  { icon: AlertTriangle, color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  error:    { icon: AlertTriangle, color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
  service:  { icon: CheckCircle,  color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/client/notifications").then((r) => {
      setNotifications(Array.isArray(r) ? r : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/client/notifications/${id}/read`, {});
      setNotifications(notifications.map((n) => n.id === id ? { ...n, is_read: 1 } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.put("/client/notifications/read-all", {});
      setNotifications(notifications.map((n) => ({ ...n, is_read: 1 })));
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Notificaciones</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {unreadCount > 0 ? `${unreadCount} sin leer` : "Todo al día"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
            style={{ color: "var(--accent)", background: "var(--accent-glow)" }} type="button">
            <CheckCheck size={14} /> Marcar todo leído
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 w-full rounded-xl" />)}</div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
          <Bell size={48} className="mx-auto mb-4" style={{ color: "var(--text-tertiary)" }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text)" }}>Sin notificaciones</h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Las notificaciones de tus servicios y compras aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const meta = typeMeta[n.type] || typeMeta.info;
            const Icon = meta.icon;
            const timeAgo = getTimeAgo(n.created_at);
            return (
              <div key={n.id} className="flex items-start gap-4 rounded-xl p-4 transition-all hover:shadow-sm cursor-pointer"
                style={{
                  border: `1px solid ${n.is_read ? "var(--border)" : "var(--accent)"}`,
                  background: n.is_read ? "var(--bg-card)" : "rgba(255,107,0,0.03)",
                }}
                onClick={() => !n.is_read && markAsRead(n.id)}>
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: meta.bg, color: meta.color }}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{n.title}</p>
                    {!n.is_read && <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--accent)" }} />}
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{n.message}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>{timeAgo}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "Hace un momento";
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `Hace ${Math.floor(diff / 86400)}d`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}
