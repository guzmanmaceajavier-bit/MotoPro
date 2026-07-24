import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Save, Globe, Moon, Bell, Smartphone, Mail } from "lucide-react";

export default function Settings() {
  const [prefs, setPrefs] = useState({
    language: "es",
    timezone: "America/Santiago",
    email_notifications: true,
    push_notifications: false,
    sms_notifications: false,
    marketing_emails: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = async () => {
    try {
      const r = await api.get("/client/settings");
      if (r) setPrefs((p) => ({ ...p, ...r }));
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setMessage(null);
    setSaving(true);
    try {
      await api.put("/client/settings", prefs);
      setMessage({ type: "success", text: "Configuración guardada correctamente" });
    } catch (err: unknown) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Error al guardar" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6"><div className="skeleton h-6 w-48 mb-2" /><div className="skeleton h-4 w-64" /></div>
        <div className="rounded-xl p-6 space-y-5" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
          <div className="skeleton h-4 w-32 mb-4" />
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-10 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Configuración</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Preferencias generales de la cuenta</p>
      </div>

      {message && (
        <div className={`flex items-start gap-2.5 p-3 rounded-xl text-sm mb-5 ${
          message.type === "success" ? "text-[#059669]" : "text-[#EF4444]"
        }`}
          style={{
            background: message.type === "success" ? "rgba(5,150,105,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${message.type === "success" ? "rgba(5,150,105,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}>
          <div className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${message.type === "success" ? "bg-[#059669]" : "bg-[#EF4444]"}`} />
          {message.text}
        </div>
      )}

      <div className="rounded-xl space-y-5" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
        <div className="p-6 pb-0">
          <div className="pb-4 border-b" style={{ borderColor: "var(--border-light)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}><Globe size={14} className="inline mr-1.5" />Región e Idioma</h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>Configura el idioma y la zona horaria</p>
          </div>
          <div className="py-5 space-y-4">
            <div>
              <label className="form-label">Idioma</label>
              <select className="input" value={prefs.language} onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}>
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="form-label">Zona Horaria</label>
              <select className="input" value={prefs.timezone} onChange={(e) => setPrefs({ ...prefs, timezone: e.target.value })}>
                <option value="America/Santiago">Santiago (GMT-3)</option>
                <option value="America/Buenos_Aires">Buenos Aires (GMT-3)</option>
                <option value="America/Mexico_City">Ciudad de México (GMT-5)</option>
                <option value="America/Bogota">Bogotá (GMT-5)</option>
                <option value="America/Lima">Lima (GMT-5)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 pb-0">
          <div className="pb-4 border-b" style={{ borderColor: "var(--border-light)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}><Bell size={14} className="inline mr-1.5" />Notificaciones</h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>Controla qué notificaciones deseas recibir</p>
          </div>
          <div className="py-5 space-y-4">
            <label className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
                <Mail size={14} style={{ color: "var(--text-tertiary)" }} /> Notificaciones por correo
              </span>
              <input type="checkbox" className="toggle" checked={prefs.email_notifications} onChange={(e) => setPrefs({ ...prefs, email_notifications: e.target.checked })} />
            </label>
            <label className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
                <Smartphone size={14} style={{ color: "var(--text-tertiary)" }} /> Notificaciones push
              </span>
              <input type="checkbox" className="toggle" checked={prefs.push_notifications} onChange={(e) => setPrefs({ ...prefs, push_notifications: e.target.checked })} />
            </label>
            <label className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
                <Smartphone size={14} style={{ color: "var(--text-tertiary)" }} /> Notificaciones SMS
              </span>
              <input type="checkbox" className="toggle" checked={prefs.sms_notifications} onChange={(e) => setPrefs({ ...prefs, sms_notifications: e.target.checked })} />
            </label>
            <label className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
                <Mail size={14} style={{ color: "var(--text-tertiary)" }} /> Correos de marketing
              </span>
              <input type="checkbox" className="toggle" checked={prefs.marketing_emails} onChange={(e) => setPrefs({ ...prefs, marketing_emails: e.target.checked })} />
            </label>
          </div>
        </div>

        <div className="flex justify-end px-6 pb-6 pt-2">
          <button onClick={handleSave} disabled={saving}
            className="btn btn-primary shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            style={{ boxShadow: "0 4px 14px rgba(13,148,136,0.3)" }}>
            {saving ? (
              <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Guardando...</span>
            ) : (
              <><Save size={16} /> Guardar cambios</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
