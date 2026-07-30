import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Spinner, EmptyState } from "@/components/ui";

export function NotificationsList() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/notifications").then((data) => {
      const arr = Array.isArray(data) ? data : data?.data || [];
      setNotifications(arr);
    }).catch((err) => console.warn("[fetch]", err)).finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  if (loading) {
    return <Spinner size="md" className="py-16" />;
  }

  if (notifications.length === 0) {
    return <EmptyState title="No tienes notificaciones" className="py-10" />;
  }

  return (
    <div className="space-y-3">
      {notifications.map((n: any) => (
        <div key={n.id}
          className={`bg-surface-secondary border border-border rounded-lg p-4 transition-all ${!n.read ? 'border-l-2 border-l-interactive-accent' : ''}`}
          onClick={() => !n.read && markRead(n.id)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${n.read ? 'text-text-secondary' : 'text-text-primary font-semibold'}`}>{n.message || n.title}</p>
              {n.description && <p className="text-xs text-text-tertiary mt-1">{n.description}</p>}
            </div>
            <div className="text-right shrink-0">
              {n.created_at && (
                <p className="text-[10px] text-text-tertiary">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: es })}
                </p>
              )}
              {!n.read && <span className="w-2 h-2 rounded-full bg-interactive-accent inline-block mt-1" />}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
