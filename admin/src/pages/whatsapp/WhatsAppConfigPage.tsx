import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import { MessageCircle, Save, Loader2, Check, Send, BarChart3, Clock, ToggleLeft, ToggleRight } from "lucide-react";

interface Template {
  key: string; label: string; message: string; enabled: boolean; variables: string[];
}

const defaultTemplates: Template[] = [
  { key: "appointment_confirmation", label: "Confirmacion de cita", message: "", enabled: true, variables: ["customer_name", "date", "time", "service"] },
  { key: "appointment_reminder", label: "Recordatorio de cita", message: "", enabled: true, variables: ["customer_name", "date", "time", "service"] },
  { key: "status_change", label: "Cambio de estado", message: "", enabled: true, variables: ["customer_name", "order_id", "status", "vehicle"] },
  { key: "quote_ready", label: "Cotizacion lista", message: "", enabled: true, variables: ["customer_name", "quote_id", "total", "vehicle"] },
  { key: "service_completed", label: "Servicio completado", message: "", enabled: true, variables: ["customer_name", "order_id", "vehicle", "total"] },
  { key: "warranty_expiring", label: "Garantia por vencer", message: "", enabled: true, variables: ["customer_name", "vehicle", "warranty_end"] },
  { key: "order_confirmation", label: "Confirmacion de pedido", message: "", enabled: true, variables: ["customer_name", "order_id", "total"] },
  { key: "order_status", label: "Estado del pedido", message: "", enabled: true, variables: ["customer_name", "order_id", "status"] },
  { key: "new_appointment_admin", label: "[Admin] Nueva cita", message: "", enabled: true, variables: ["customer_name", "date", "time", "service"] },
  { key: "new_order_admin", label: "[Admin] Nuevo pedido", message: "", enabled: true, variables: ["customer_name", "order_id", "total"] },
  { key: "low_stock_admin", label: "[Admin] Stock bajo", message: "", enabled: true, variables: ["product_name", "current_stock", "min_stock"] },
  { key: "daily_reminder_admin", label: "[Admin] Recordatorio diario", message: "", enabled: true, variables: ["pending_orders", "pending_quotes"] },
];

export default function WhatsAppConfigPage() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testSending, setTestSending] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    Promise.all([
      api.get("/config").catch(() => ({})),
      api.get("/whatsapp-admin/stats").catch(() => ({ total: 0, sent: 0, failed: 0, pending: 0 })),
      api.get("/whatsapp-admin/templates").catch(() => []),
    ]).then(([cfg, st, tpls]) => {
      setConfig(cfg || {});
      setStats(st || { total: 0, sent: 0, failed: 0, pending: 0 });
      if (Array.isArray(tpls) && tpls.length > 0) setTemplates(tpls);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/config", {
        whatsapp_number: config.whatsapp_number,
        whatsapp_message: config.whatsapp_message,
        whatsapp_enabled: config.whatsapp_enabled,
        whatsapp_api_token: config.whatsapp_api_token,
        whatsapp_phone_number_id: config.whatsapp_phone_number_id,
        whatsapp_business_account_id: config.whatsapp_business_account_id,
      });
      await api.put("/whatsapp-admin/templates", { templates });
      showToast("success", "Configuracion de WhatsApp guardada");
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Error al guardar");
    } finally { setSaving(false); }
  };

  const sendTest = async () => {
    if (!testPhone.trim()) { showToast("error", "Ingresa un numero de telefono"); return; }
    setTestSending(true);
    try {
      await api.post("/whatsapp-admin/test", { phone: testPhone, message: "Mensaje de prueba desde MotoPro" });
      showToast("success", "Mensaje de prueba enviado");
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Error al enviar");
    } finally { setTestSending(false); }
  };

  const toggleTemplate = (key: string) => {
    setTemplates(prev => prev.map(t => t.key === key ? { ...t, enabled: !t.enabled } : t));
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-[var(--mp-accent)]" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shadow-lg">
            <MessageCircle size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--mp-text-primary)]">WhatsApp Business</h1>
            <p className="text-sm text-[var(--mp-text-tertiary)]">Configuracion de mensajeria y notificaciones</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="mp-btn-primary text-sm">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Enviados", value: stats.sent, color: "#25D366", icon: <Send size={16} /> },
          { label: "Pendientes", value: stats.pending, color: "#F59E0B", icon: <Clock size={16} /> },
          { label: "Fallidos", value: stats.failed, color: "#EF4444", icon: <BarChart3 size={16} /> },
          { label: "Total", value: stats.total, color: "var(--mp-accent)", icon: <MessageCircle size={16} /> },
        ].map((s) => (
          <div key={s.label} className="mp-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: s.color }}>{s.icon}</span>
              <span className="text-xs font-medium text-[var(--mp-text-tertiary)]">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-[var(--mp-text-primary)]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* API Config */}
      <div className="mp-card p-5">
        <h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-4">Configuracion de la API</h3>
        <div className="space-y-3">
          {[
            { key: "whatsapp_phone_number_id", label: "Phone Number ID", placeholder: "123456789" },
            { key: "whatsapp_business_account_id", label: "Business Account ID", placeholder: "987654321" },
            { key: "whatsapp_api_token", label: "Access Token", placeholder: "EAAxxxxxxx...", type: "password" },
          ].map((f) => (
            <div key={f.key} className="p-3 rounded-xl bg-[var(--mp-bg-elevated)]">
              <label className="text-xs font-semibold text-[var(--mp-text-primary)] mb-1.5 block">{f.label}</label>
              <input type={f.type || "text"} className="mp-input text-sm w-full" value={config[f.key] || ""} onChange={(e) => setConfig({ ...config, [f.key]: e.target.value })} placeholder={f.placeholder} />
            </div>
          ))}
        </div>
      </div>

      {/* Templates */}
      <div className="mp-card p-5">
        <h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-4">Plantillas de mensajes</h3>
        <div className="space-y-2">
          {templates.map((t) => (
            <div key={t.key} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--mp-bg-elevated)]">
              <button onClick={() => toggleTemplate(t.key)} className="flex-shrink-0" type="button">
                {t.enabled ? <ToggleRight size={24} className="text-[#25D366]" /> : <ToggleLeft size={24} className="text-[var(--mp-text-tertiary)]" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--mp-text-primary)]">{t.label}</p>
                <p className="text-xs text-[var(--mp-text-tertiary)] truncate">{t.variables.join(", ")}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${t.enabled ? "bg-[#25D366]/10 text-[#25D366]" : "bg-[var(--mp-bg-hover)] text-[var(--mp-text-tertiary)]"}`}>
                {t.enabled ? "Activo" : "Inactivo"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Test */}
      <div className="mp-card p-5">
        <h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-4">Enviar mensaje de prueba</h3>
        <div className="flex gap-3">
          <input type="text" className="mp-input text-sm flex-1" value={testPhone} onChange={(e) => setTestPhone(e.target.value)} placeholder="Numero con codigo de pais (ej: 573001234567)" />
          <button onClick={sendTest} disabled={testSending} className="mp-btn-primary text-sm">
            {testSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
