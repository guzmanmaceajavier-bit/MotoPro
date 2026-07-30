import { useState, useEffect } from "react";
import { useToast } from "@/providers/ToastProvider";
import { Spinner } from "@/components/ui";
import { api } from "@/api/client";

interface Settings {
  email_notifications: number;
  push_notifications: number;
  sms_notifications: number;
  marketing_emails: number;
  language?: string;
  timezone?: string;
}

export function NotificationPreferences() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<Settings>({
    email_notifications: 1,
    push_notifications: 1,
    sms_notifications: 1,
    marketing_emails: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/client/settings").then((data) => {
      if (data) setSettings(prev => ({ ...prev, ...data }));
    }).catch((err) => console.warn("[fetch]", err)).finally(() => setLoading(false));
  }, []);

  const toggle = (key: keyof Settings) => {
    setSettings(prev => ({ ...prev, [key]: prev[key] ? 0 : 1 }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/client/settings", settings);
      addToast("Preferencias guardadas", "success");
    } catch {
      addToast("Error al guardar preferencias", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spinner size="md" className="py-16" />;
  }

  const items = [
    { key: "email_notifications" as const, label: "Notificaciones por correo", desc: "Recibe emails sobre cambios de estado, cotizaciones y más" },
    { key: "sms_notifications" as const, label: "Notificaciones por SMS", desc: "Recibe mensajes de texto con información importante" },
    { key: "push_notifications" as const, label: "Notificaciones en la app", desc: "Recibe notificaciones dentro de la plataforma" },
    { key: "marketing_emails" as const, label: "Correos promocionales", desc: "Ofertas, promociones y novedades de MotoPro" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary">Preferencias de notificación</h2>
        <button onClick={save} disabled={saving}
          className="rounded-lg bg-interactive-accent px-5 py-2 text-sm font-semibold text-black hover:bg-interactive-accent-hover transition-colors disabled:opacity-50">
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
      <p className="text-sm text-text-tertiary">Elige qué notificaciones quieres recibir.</p>

      <div className="space-y-2">
        {items.map(({ key, label, desc }) => (
          <div key={key}
            className="bg-surface-secondary border border-border rounded-lg p-4 hover:border-border-accent transition-colors cursor-pointer"
            onClick={() => toggle(key)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-primary">{label}</p>
                <p className="text-xs text-text-tertiary mt-0.5">{desc}</p>
              </div>
              <div className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${settings[key] ? 'bg-interactive-accent' : 'bg-surface-tertiary'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${settings[key] ? 'left-[22px]' : 'left-[2px]'}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
