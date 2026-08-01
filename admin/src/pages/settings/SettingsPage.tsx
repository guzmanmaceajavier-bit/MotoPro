import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import ImageUpload from "@/components/ImageUpload";
import { useTheme } from "@/context/ThemeContext";
import { Save, Settings, Mail, Phone, MapPin, Clock, Palette, Share2, Loader2, Check, Store, AlertTriangle, Download, RotateCcw, CreditCard, MessageCircle, Shield, ChevronRight, Coins, FileText } from "lucide-react";

const businessTypes = [
  { value: "taller", label: "Taller mecanico", icon: "🔧" }, { value: "tienda", label: "Tienda de motos", icon: "🏍️" },
  { value: "repuestos", label: "Repuestos y accesorios", icon: "⚙️" }, { value: "servicios", label: "Servicios generales", icon: "🛠️" },
  { value: "personalizado", label: "Otro / Personalizado", icon: "💼" },
];

const currencies = [
  { value: "USD", label: "USD - Dolar" }, { value: "MXN", label: "MXN - Peso mexicano" },
  { value: "COP", label: "COP - Peso colombiano" }, { value: "ARS", label: "ARS - Peso argentino" },
  { value: "CLP", label: "CLP - Peso chileno" }, { value: "PEN", label: "PEN - Sol peruano" },
  { value: "EUR", label: "EUR - Euro" }, { value: "BRL", label: "BRL - Real brasileño" },
];

const accentOptions = [
  { value: "#0D9488", label: "Teal" }, { value: "#6366F1", label: "Indigo" }, { value: "#8B5CF6", label: "Violet" },
  { value: "#0EA5E9", label: "Sky" }, { value: "#10B981", label: "Emerald" }, { value: "#F59E0B", label: "Amber" },
  { value: "#EF4444", label: "Red" }, { value: "#EC4899", label: "Pink" },
];

const TABS = [
  { key: "general", label: "General", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  ) },
  { key: "empresa", label: "Empresa", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/></svg>
  ) },
  { key: "contacto", label: "Contacto", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
  ) },
  { key: "redes", label: "Redes Sociales", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
  ) },
  { key: "whatsapp", label: "WhatsApp", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
  ) },
  { key: "moneda", label: "Moneda", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
  ) },
  { key: "impuestos", label: "Impuestos", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  ) },
  { key: "pagos", label: "Pagos", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
  ) },
  { key: "backups", label: "Backups", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
  ) },
];

export default function SettingsPage() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();
  const { accent, setAccent } = useTheme();

  useEffect(() => { api.get("/config").then((r) => setConfig(r || {})).finally(() => setLoading(false)); }, []);

  const handleChange = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validateTab = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (activeTab === "contacto" && !config.site_email?.trim()) newErrors.site_email = "El correo es obligatorio";
    if (activeTab === "moneda" && !config.site_currency) newErrors.site_currency = "Selecciona una moneda";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateTab()) return;
    setSaving(true);
    try {
      await api.put("/config", config);
      if (config.site_accent) setAccent(config.site_accent);
      showToast("success", "Configuracion guardada");
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error al guardar"); }
    finally { setSaving(false); }
  };

  const c = config;

  if (loading) return <div className="flex items-center justify-center py-20 animate-fade-in"><Loader2 size={28} className="animate-spin text-[var(--mp-accent)]" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--mp-accent)] to-[#059669] flex items-center justify-center shadow-lg">
            <Settings size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--mp-text-primary)]">Configuracion</h1>
            <p className="text-sm text-[var(--mp-text-tertiary)]">Administra todos los aspectos de la plataforma</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="mp-btn-primary text-sm">
          {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />}
          {saving ? "Guardando..." : saved ? "Guardado" : "Guardar cambios"}
        </button>
      </div>

      <div className="mb-6 border-b border-[var(--mp-border)] overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "text-[var(--mp-accent)]"
                    : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-elevated)]"
                }`}
              >
                <span className={isActive ? "text-[var(--mp-accent)]" : "text-[var(--mp-text-tertiary)]"}>{tab.icon}</span>
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[var(--mp-accent)] rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-5">
        {activeTab === "general" && (
          <>
            <div className="mp-card p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3B82F6]/15 to-[#3B82F6]/5 flex items-center justify-center">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="8"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Informacion general</h3>
                  <p className="text-[11px] text-[var(--mp-text-tertiary)]">Datos basicos que identifican tu negocio en la plataforma.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    </div>
                    <label className="text-xs font-semibold text-[var(--mp-text-primary)]">Nombre del negocio</label>
                  </div>
                  <input type="text" className="mp-input text-sm w-full" value={c.site_name || ""} onChange={(e) => handleChange("site_name", e.target.value)} placeholder="Ej: MotoPro Taller" />
                </div>
                <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                    </div>
                    <label className="text-xs font-semibold text-[var(--mp-text-primary)]">Eslogan</label>
                  </div>
                  <input type="text" className="mp-input text-sm w-full" value={c.site_slogan || ""} onChange={(e) => handleChange("site_slogan", e.target.value)} placeholder="Tu moto en las mejores manos" />
                </div>
                <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    </div>
                    <label className="text-xs font-semibold text-[var(--mp-text-primary)]">Descripcion</label>
                  </div>
                  <textarea className="mp-input text-sm resize-none w-full" rows={3} value={c.site_description || ""} onChange={(e) => handleChange("site_description", e.target.value)} placeholder="Taller especializado en mantenimiento, reparacion y personalizacion de motocicletas." />
                </div>
              </div>
            </div>

            <div className="mp-card p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EC4899]/15 to-[#EC4899]/5 flex items-center justify-center">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Apariencia</h3>
                  <p className="text-[11px] text-[var(--mp-text-tertiary)]">Personaliza la apariencia visual de tu sitio web.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <p className="text-xs font-semibold text-[var(--mp-text-primary)] mb-2">Logo del sitio</p>
                  <div className="border-2 border-dashed border-[var(--mp-border)] rounded-xl p-4 text-center hover:border-[var(--mp-accent)]/40 transition-colors">
                    <ImageUpload key="site_logo" folder="taller-motos/config" value={c.site_logo || ""} onChange={(url) => handleChange("site_logo", url)} label="" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--mp-text-primary)] mb-2">Favicon</p>
                  <div className="border-2 border-dashed border-[var(--mp-border)] rounded-xl p-4 text-center hover:border-[var(--mp-accent)]/40 transition-colors">
                    <ImageUpload key="site_favicon" folder="taller-motos/config" value={c.site_favicon || ""} onChange={(url) => handleChange("site_favicon", url)} label="" />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--mp-text-primary)] mb-3">Color principal de la plataforma</p>
                <div className="flex flex-wrap gap-3">
                  {accentOptions.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => handleChange("site_accent", opt.value)} className="flex flex-col items-center gap-1.5 transition-all hover:scale-105 active:scale-95">
                      <div className="w-11 h-11 rounded-xl transition-all relative" style={{ background: opt.value, boxShadow: (c.site_accent || "#0D9488") === opt.value ? `0 0 0 3px var(--mp-bg-card), 0 0 0 5px ${opt.value}` : "none", transform: (c.site_accent || "#0D9488") === opt.value ? "scale(1.15)" : "scale(1)" }}>
                        {(c.site_accent || "#0D9488") === opt.value && (
                          <span className="absolute inset-0 flex items-center justify-center"><Check size={16} className="text-white" strokeWidth={3} /></span>
                        )}
                      </div>
                      <span className="text-[10px] font-medium" style={{ color: (c.site_accent || "#0D9488") === opt.value ? opt.value : "var(--mp-text-tertiary)" }}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mp-card p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F97316]/15 to-[#F97316]/5 flex items-center justify-center">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Promociones</h3>
                  <p className="text-[11px] text-[var(--mp-text-tertiary)]">Controla la visibilidad de las campañas promocionales en el sitio.</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
                <div>
                  <p className="text-sm font-semibold text-[var(--mp-text-primary)]">Activar promociones</p>
                  <p className="text-[11px] text-[var(--mp-text-tertiary)] mt-0.5">Muestra las secciones de promociones en Inicio, Tienda y Servicios.</p>
                </div>
                <button onClick={() => handleChange("promotions_enabled", c.promotions_enabled === "1" ? "0" : "1")} type="button"
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ml-4"
                  style={{ background: c.promotions_enabled === "1" ? "var(--mp-accent)" : "#D1D5DB" }}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${c.promotions_enabled === "1" ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === "empresa" && (
          <>
            <div className="mp-card p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6]/15 to-[#8B5CF6]/5 flex items-center justify-center">
                  <Store size={17} className="text-[#8B5CF6]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Tipo de negocio</h3>
                  <p className="text-[11px] text-[var(--mp-text-tertiary)]">Selecciona el tipo de negocio que operas.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {businessTypes.map((bt) => (
                  <button key={bt.value} type="button" onClick={() => handleChange("site_type", bt.value)} className="p-4 rounded-xl text-center transition-all hover:bg-[var(--mp-bg-hover)]"
                    style={{ background: (c.site_type || "taller") === bt.value ? "rgba(13,148,136,0.08)" : "var(--mp-bg-elevated)", border: (c.site_type || "taller") === bt.value ? "2px solid var(--mp-accent)" : "2px solid transparent" }}>
                    <span className="text-2xl block mb-1.5">{bt.icon}</span>
                    <span className="text-[11px] font-medium" style={{ color: (c.site_type || "taller") === bt.value ? "var(--mp-accent)" : "var(--mp-text-secondary)" }}>{bt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mp-card p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F59E0B]/15 to-[#F59E0B]/5 flex items-center justify-center">
                  <Clock size={17} className="text-[#F59E0B]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Horarios de atencion</h3>
                  <p className="text-[11px] text-[var(--mp-text-tertiary)]">Define los horarios de apertura de tu negocio.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)] mb-3">
                <label className="text-xs font-semibold text-[var(--mp-text-primary)] mb-2 block">Horario general</label>
                <input type="text" className="mp-input text-sm w-full" value={c.site_hours || ""} onChange={(e) => handleChange("site_hours", e.target.value)} placeholder="Lun - Vie: 8:00 - 18:00" />
              </div>
              <div className="space-y-2">
                {["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"].map((day) => (
                  <div key={day} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--mp-bg-elevated)]">
                    <span className="text-xs font-medium w-24 text-[var(--mp-text-primary)]">{day}</span>
                    <input type="text" className="mp-input text-xs flex-1" placeholder="8:00 - 18:00" value={c[`hours_${day.toLowerCase()}`] || ""} onChange={(e) => handleChange(`hours_${day.toLowerCase()}`, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
            <div className="mp-card p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981]/15 to-[#10B981]/5 flex items-center justify-center">
                  <MapPin size={17} className="text-[#10B981]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Ubicacion</h3>
                  <p className="text-[11px] text-[var(--mp-text-tertiary)]">Direccion y coordenadas de tu negocio.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
                  <label className="text-xs font-semibold text-[var(--mp-text-primary)] mb-2 block">Direccion</label>
                  <input type="text" className="mp-input text-sm w-full" value={c.site_address || ""} onChange={(e) => handleChange("site_address", e.target.value)} placeholder="Calle 123" />
                </div>
                <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
                  <label className="text-xs font-semibold text-[var(--mp-text-primary)] mb-2 block">Sitio web</label>
                  <input type="text" className="mp-input text-sm w-full" value={c.site_url || ""} onChange={(e) => handleChange("site_url", e.target.value)} placeholder="https://tunegocio.com" />
                </div>
                <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
                  <label className="text-xs font-semibold text-[var(--mp-text-primary)] mb-2 block">Latitud</label>
                  <input type="text" className="mp-input text-sm w-full" value={c.map_lat || ""} onChange={(e) => handleChange("map_lat", e.target.value)} placeholder="6.2476" />
                </div>
                <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
                  <label className="text-xs font-semibold text-[var(--mp-text-primary)] mb-2 block">Longitud</label>
                  <input type="text" className="mp-input text-sm w-full" value={c.map_lng || ""} onChange={(e) => handleChange("map_lng", e.target.value)} placeholder="-75.5658" />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "contacto" && (
          <div className="mp-card p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3B82F6]/15 to-[#3B82F6]/5 flex items-center justify-center">
                <Phone size={17} className="text-[#3B82F6]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Datos de contacto</h3>
                <p className="text-[11px] text-[var(--mp-text-tertiary)]">Informacion de contacto de tu negocio.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
                <div className="flex items-center gap-2 mb-2">
                  <Mail size={13} className="text-[var(--mp-text-tertiary)]" />
                  <label className="text-xs font-semibold text-[var(--mp-text-primary)]">Correo electronico</label>
                </div>
                <input type="email" className={`mp-input text-sm w-full ${errors.site_email ? "border-[var(--mp-danger)]" : ""}`} value={c.site_email || ""} onChange={(e) => handleChange("site_email", e.target.value)} placeholder="contacto@motopro.com" />
                {errors.site_email && <p className="text-[11px] mt-1 text-[var(--mp-danger)]">{errors.site_email}</p>}
              </div>
              <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
                <div className="flex items-center gap-2 mb-2">
                  <Phone size={13} className="text-[var(--mp-text-tertiary)]" />
                  <label className="text-xs font-semibold text-[var(--mp-text-primary)]">Telefono</label>
                </div>
                <input type="text" className="mp-input text-sm w-full" value={c.site_phone || ""} onChange={(e) => handleChange("site_phone", e.target.value)} placeholder="+52 555 123 4567" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "redes" && (
          <div className="mp-card p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1DA1F2]/15 to-[#1DA1F2]/5 flex items-center justify-center">
                <Share2 size={17} className="text-[#1DA1F2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Redes Sociales</h3>
                <p className="text-[11px] text-[var(--mp-text-tertiary)]">Enlaces a tus redes sociales.</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { key: "social_facebook", label: "Facebook", color: "#1877F2", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg> },
                { key: "social_instagram", label: "Instagram", color: "#E4405F", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="white" stroke="none"/></svg> },
                { key: "social_tiktok", label: "TikTok", color: "#000", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.89 2.89 2.89 0 0 1 2.88-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.78a8.18 8.18 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.21z"/></svg> },
                { key: "social_youtube", label: "YouTube", color: "#FF0000", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
                { key: "social_whatsapp", label: "WhatsApp", color: "#25D366", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
              ].map((s) => (
                <div key={s.key} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--mp-bg-elevated)]">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: s.color }}>
                    {s.icon}
                  </div>
                  <input type="text" className="mp-input text-sm flex-1" value={c[s.key] || ""} onChange={(e) => handleChange(s.key, e.target.value)} placeholder={`URL de ${s.label}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "whatsapp" && (
          <div className="mp-card p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#25D366]/15 to-[#25D366]/5 flex items-center justify-center">
                <MessageCircle size={17} className="text-[#25D366]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">WhatsApp</h3>
                <p className="text-[11px] text-[var(--mp-text-tertiary)]">Configuracion del boton de WhatsApp.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
                <label className="text-xs font-semibold text-[var(--mp-text-primary)] mb-2 block">Numero</label>
                <input type="text" className="mp-input text-sm w-full" value={c.whatsapp_number || ""} onChange={(e) => handleChange("whatsapp_number", e.target.value)} placeholder="521234567890" />
              </div>
              <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
                <label className="text-xs font-semibold text-[var(--mp-text-primary)] mb-2 block">Mensaje por defecto</label>
                <input type="text" className="mp-input text-sm w-full" value={c.whatsapp_message || ""} onChange={(e) => handleChange("whatsapp_message", e.target.value)} placeholder="Hola! Quiero mas informacion" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
                <div>
                  <p className="text-sm font-medium text-[var(--mp-text-primary)]">Mostrar boton</p>
                  <p className="text-[11px] text-[var(--mp-text-tertiary)]">Muestra u oculta el boton flotante</p>
                </div>
                <button type="button" onClick={() => handleChange("whatsapp_enabled", c.whatsapp_enabled === "true" ? "false" : "true")}
                  className={`w-11 h-6 rounded-full transition-all relative ${c.whatsapp_enabled === "true" ? "bg-[var(--mp-accent)]" : "bg-[var(--mp-bg-hover)]"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${c.whatsapp_enabled === "true" ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "moneda" && (
          <div className="mp-card p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F59E0B]/15 to-[#F59E0B]/5 flex items-center justify-center">
                <Coins size={17} className="text-[#F59E0B]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Moneda</h3>
                <p className="text-[11px] text-[var(--mp-text-tertiary)]">Selecciona la moneda de tu negocio.</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
              <label className="text-xs font-semibold text-[var(--mp-text-primary)] mb-2 block">Moneda del negocio</label>
              <select className={`mp-select text-sm w-full ${errors.site_currency ? "border-[var(--mp-danger)]" : ""}`} value={c.site_currency || "USD"} onChange={(e) => handleChange("site_currency", e.target.value)}>
                {currencies.map((cur) => <option key={cur.value} value={cur.value}>{cur.label}</option>)}
              </select>
              {errors.site_currency && <p className="text-[11px] mt-1 text-[var(--mp-danger)]">{errors.site_currency}</p>}
            </div>
          </div>
        )}

        {activeTab === "impuestos" && (
          <>
            <div className="mp-card p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EF4444]/15 to-[#EF4444]/5 flex items-center justify-center">
                  <FileText size={17} className="text-[#EF4444]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Impuestos</h3>
                  <p className="text-[11px] text-[var(--mp-text-tertiary)]">Configura los impuestos de tu negocio.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
                  <label className="text-xs font-semibold text-[var(--mp-text-primary)] mb-2 block">Nombre del impuesto</label>
                  <input type="text" className="mp-input text-sm w-full" value={c.tax_name || "IVA"} onChange={(e) => handleChange("tax_name", e.target.value)} />
                </div>
                <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
                  <label className="text-xs font-semibold text-[var(--mp-text-primary)] mb-2 block">Porcentaje (%)</label>
                  <input type="number" step="0.01" className="mp-input text-sm w-full" value={c.tax_rate || "16"} onChange={(e) => handleChange("tax_rate", e.target.value)} />
                </div>
              </div>
            </div>
            <div className="mp-card p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F59E0B]/15 to-[#F59E0B]/5 flex items-center justify-center">
                  <Shield size={17} className="text-[#F59E0B]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Inventario</h3>
                  <p className="text-[11px] text-[var(--mp-text-tertiary)]">Configuracion de alertas de stock.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
                <label className="text-xs font-semibold text-[var(--mp-text-primary)] mb-2 block">Stock minimo para alertas</label>
                <input type="number" min="1" className="mp-input text-sm w-full" value={c.low_stock_threshold || "5"} onChange={(e) => handleChange("low_stock_threshold", e.target.value)} />
                <p className="text-[11px] mt-1.5 text-[var(--mp-text-tertiary)]">Productos con stock menor apareceran como "Stock Bajo".</p>
              </div>
            </div>
          </>
        )}

        {activeTab === "pagos" && (
          <div className="mp-card p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0EA5E9]/15 to-[#0EA5E9]/5 flex items-center justify-center">
                <CreditCard size={17} className="text-[#0EA5E9]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Cuentas de pago</h3>
                <p className="text-[11px] text-[var(--mp-text-tertiary)]">Datos que veran los clientes al elegir estos metodos.</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { key: "nequi_phone", label: "Nequi" }, { key: "daviplata_phone", label: "Daviplata" },
                { key: "bank_name", label: "Banco" }, { key: "bank_account_type", label: "Tipo de cuenta" },
                { key: "bank_account_number", label: "Numero de cuenta" }, { key: "bank_holder", label: "Titular" },
              ].map((f) => (
                <div key={f.key} className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
                  <label className="text-xs font-semibold text-[var(--mp-text-primary)] mb-2 block">{f.label}</label>
                  <input type="text" className="mp-input text-sm w-full" value={c[f.key] || ""} onChange={(e) => handleChange(f.key, e.target.value)} placeholder={f.label} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "backups" && (
          <>
            <div className="mp-card p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981]/15 to-[#10B981]/5 flex items-center justify-center">
                  <Download size={17} className="text-[#10B981]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Respaldo de base de datos</h3>
                  <p className="text-[11px] text-[var(--mp-text-tertiary)]">Descarga una copia de la base de datos SQLite.</p>
                </div>
              </div>
              <a href="/api/backup" download className="mp-btn-primary text-sm inline-flex">
                <Download size={15} /> Descargar respaldo (.sqlite)
              </a>
            </div>
            <div className="mp-card p-5 border border-[rgba(239,68,68,0.15)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EF4444]/15 to-[#EF4444]/5 flex items-center justify-center">
                  <AlertTriangle size={17} className="text-[#EF4444]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#EF4444]">Zona de peligro</h3>
                  <p className="text-[11px] text-[var(--mp-text-tertiary)]">Acciones irreversibles.</p>
                </div>
              </div>
              <div className="space-y-3">
                <button onClick={() => { if (confirm("Restablecer configuracion?")) { localStorage.removeItem("config"); window.location.reload(); } }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-[rgba(245,158,11,0.08)] bg-[rgba(245,158,11,0.05)] text-[#F59E0B] border border-[rgba(245,158,11,0.15)]">
                  <span className="flex items-center gap-2"><RotateCcw size={15} /> Restablecer configuracion</span>
                  <ChevronRight size={14} />
                </button>
                <button onClick={() => { if (confirm("FORMATEAR todo el sistema?")) { api.post("/config/format").then(() => { showToast("success", "Sistema formateado"); setTimeout(() => window.location.reload(), 2000); }).catch((err) => showToast("error", err instanceof Error ? err.message : "Error")); } }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-[rgba(239,68,68,0.08)] bg-[rgba(239,68,68,0.05)] text-[#EF4444] border border-[rgba(239,68,68,0.15)]">
                  <span className="flex items-center gap-2"><AlertTriangle size={15} /> Formatear sistema</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
