import { useState, useEffect } from "react";
import { Plus, Save, Eye, EyeOff, Trash2, ChevronUp, ChevronDown, GripVertical, Menu, Palette, MousePointer, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/Toast";
import { api } from "@/api/client";
import ImageUpload from "@/components/ImageUpload";
import { NavbarItem } from "../../../../shared/types";

const NAVBAR_CONFIG_KEYS = ["navbar_logo", "navbar_logo_mobile", "navbar_bg_color", "navbar_text_color", "navbar_accent_color", "navbar_sticky", "navbar_cta_text", "navbar_cta_link"];

const DEVICE_TABS = [
  { id: "desktop", label: "Escritorio", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
  ) },
  { id: "tablet", label: "Tablet", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
  ) },
  { id: "mobile", label: "Movil", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
  ) },
];

export default function NavbarCMS() {
  const [items, setItems] = useState<NavbarItem[]>([]);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [hasChanges, setHasChanges] = useState(false);
  const { showToast } = useToast();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [itemsRes, configRes] = await Promise.all([api.get("/cms/navbar"), api.get("/config")]);
      setItems(Array.isArray(itemsRes) ? itemsRes : itemsRes?.data || []);
      const data = Array.isArray(configRes) ? configRes : configRes?.data || [];
      const map: Record<string, string> = {};
      data.forEach((item: any) => { map[item.key] = item.value; });
      setConfig(map);
    } catch { showToast("error", "Error al cargar"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const updateConfig = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveConfigField = async (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    await api.put(`/system-config/${key}`, { value }).catch(() => {});
  };

  const saveAllConfig = async () => {
    try {
      api.put("/config", config);
      await Promise.all(promises);
      showToast("success", "Cambios guardados");
      setHasChanges(false);
    } catch { showToast("error", "Error al guardar"); }
  };

  const resetConfig = () => {
    setConfig({
      navbar_bg_color: "#0B0D16",
      navbar_text_color: "#FFFFFF",
      navbar_accent_color: "#6B5CF6",
      navbar_sticky: "1",
      navbar_cta_text: "Agendar cita",
      navbar_cta_link: "/agendar-servicio",
    });
    setHasChanges(true);
    showToast("info", "Valores restablecidos");
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Eliminar este item?")) return;
    await api.delete(`/cms/navbar/${id}`);
    showToast("success", "Item eliminado");
    fetchAll();
  };

  const toggleVisibility = async (item: NavbarItem) => {
    await api.put(`/cms/navbar/${item.id}`, { is_visible: item.is_visible ? 0 : 1 });
    fetchAll();
  };

  const moveItem = async (idx: number, dir: "up" | "down") => {
    const newIdx = dir === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= items.length) return;
    const newItems = [...items];
    [newItems[idx], newItems[newIdx]] = [newItems[newIdx], newItems[idx]];
    setItems(newItems);
    for (let i = 0; i < newItems.length; i++) {
      await api.put(`/cms/navbar/${newItems[i].id}`, { sort_order: i }).catch(() => {});
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in space-y-5">
        <div className="flex items-center gap-4 mb-2">
          <div className="h-12 w-12 rounded-2xl bg-[var(--mp-bg-elevated)] animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-[var(--mp-bg-elevated)] rounded animate-pulse" />
            <div className="h-4 w-72 bg-[var(--mp-bg-elevated)] rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <div key={i} className="mp-card p-5 h-48 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--mp-accent)] to-[#8B5CF6] flex items-center justify-center shadow-lg">
          <span className="text-white text-lg font-bold">T</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--mp-text-primary)]">Menu de Navegacion</h1>
          <p className="text-sm text-[var(--mp-text-tertiary)]">Personaliza la apariencia y comportamiento del menu de navegacion de tu sitio web.</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Link to="/navbar/new" className="mp-btn-primary text-sm">
          <Plus size={15} /> Anadir item
        </Link>
        <button className="mp-btn-ghost text-sm border border-[var(--mp-border)]">
          <Eye size={15} /> Vista previa
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="mp-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B5CF6]/20 to-[#8B5CF6]/10 flex items-center justify-center">
              <Menu size={15} className="text-[#8B5CF6]" />
            </div>
            <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Logo</h3>
          </div>
          <div className="space-y-4">
<ImageUpload folder="taller-motos/config" label="Logo principal" value={config["navbar_logo"] || ""} onChange={(url) => updateConfig("navbar_logo", url)} />
<ImageUpload folder="taller-motos/config" label="Logo movil" value={config["navbar_logo_mobile"] || ""} onChange={(url) => updateConfig("navbar_logo_mobile", url)} />
          </div>
        </div>

        <div className="mp-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B82F6]/20 to-[#3B82F6]/10 flex items-center justify-center">
              <Palette size={15} className="text-[#3B82F6]" />
            </div>
            <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Colores</h3>
          </div>
          <div className="space-y-3">
            {[
              { key: "navbar_bg_color", label: "Fondo", default: "#0B0D16" },
              { key: "navbar_text_color", label: "Texto", default: "#FFFFFF" },
              { key: "navbar_accent_color", label: "Acento", default: "#6B5CF6" },
            ].map((c) => (
              <div key={c.key}>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">{c.label}</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <input
                      type="color"
                      className="w-10 h-10 rounded-lg cursor-pointer border border-[var(--mp-border)] appearance-none"
                      value={config[c.key] || c.default}
                      onChange={(e) => updateConfig(c.key, e.target.value)}
                      style={{ background: config[c.key] || c.default }}
                    />
                  </div>
                  <input
                    type="text"
                    className="mp-input text-sm flex-1 font-mono"
                    value={config[c.key] || ""}
                    onChange={(e) => updateConfig(c.key, e.target.value)}
                    placeholder={c.default}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mp-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F59E0B]/20 to-[#F59E0B]/10 flex items-center justify-center">
              <MousePointer size={15} className="text-[#F59E0B]" />
            </div>
            <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Comportamiento</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--mp-bg-elevated)]">
              <div>
                <p className="text-sm font-medium text-[var(--mp-text-primary)]">Sticky / Fijo</p>
                <p className="text-[11px] text-[var(--mp-text-tertiary)]">Barra fija al hacer scroll</p>
              </div>
              <button
                type="button"
                onClick={() => updateConfig("navbar_sticky", config["navbar_sticky"] === "0" ? "1" : "0")}
                className={`w-11 h-6 rounded-full transition-all relative ${config["navbar_sticky"] !== "0" ? "bg-[var(--mp-accent)]" : "bg-[var(--mp-bg-hover)]"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${config["navbar_sticky"] !== "0" ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Boton CTA</label>
              <input
                type="text"
                className="mp-input text-sm mb-2"
                placeholder="Texto del boton"
                value={config["navbar_cta_text"] || ""}
                onChange={(e) => updateConfig("navbar_cta_text", e.target.value)}
              />
              <input
                type="text"
                className="mp-input text-sm"
                placeholder="Link del boton"
                value={config["navbar_cta_link"] || ""}
                onChange={(e) => updateConfig("navbar_cta_link", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mp-card p-5 mb-6">
        <h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-4">Vista previa del menu</h3>
        <div className={`mx-auto rounded-2xl border border-[var(--mp-border)] overflow-hidden transition-all ${
          device === "mobile" ? "max-w-[375px]" : device === "tablet" ? "max-w-[768px]" : "w-full"
        }`}>
          <div
            className="flex items-center justify-between px-5 py-3 border-b border-[var(--mp-border)]"
            style={{
              background: config["navbar_bg_color"] || "#0B0D16",
              color: config["navbar_text_color"] || "#FFFFFF",
            }}
          >
            <div className="flex items-center gap-2">
              {config["navbar_logo"] ? (
                <img src={config["navbar_logo"]} alt="Logo" className="h-8 object-contain" />
              ) : (
                <span className="text-base font-bold" style={{ color: config["navbar_text_color"] || "#FFFFFF" }}>MotoPro</span>
              )}
            </div>
            {device !== "mobile" && (
              <div className="hidden md:flex items-center gap-5">
                {items.filter((it) => it.is_visible).map((item) => (
                  <span key={item.id} className="text-sm font-medium" style={{ color: config["navbar_text_color"] || "#FFFFFF" }}>
                    {item.label}
                  </span>
                ))}
              </div>
            )}
            <button
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: config["navbar_accent_color"] || "#6B5CF6" }}
            >
              {config["navbar_cta_text"] || "Agendar cita"}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-1 mt-4">
          {DEVICE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDevice(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                device === tab.id
                  ? "bg-[var(--mp-accent)] text-white"
                  : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-elevated)]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-2">Items del menu ({items.length})</h3>
        {items.map((item, idx) => (
          <div key={item.id} className="mp-card flex items-center gap-3 px-4 py-3 group hover:border-[var(--mp-border-hover)] transition-all">
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => moveItem(idx, "up")} disabled={idx === 0} className="p-1 rounded text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] disabled:opacity-20">
                <ChevronUp size={14} />
              </button>
              <button onClick={() => moveItem(idx, "down")} disabled={idx === items.length - 1} className="p-1 rounded text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] disabled:opacity-20">
                <ChevronDown size={14} />
              </button>
            </div>
            <GripVertical size={16} className="text-[var(--mp-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--mp-text-primary)]">{item.label}</p>
              <p className="text-xs text-[var(--mp-text-tertiary)]">{item.link}{item.is_mega_menu ? " · Mega menu" : ""}</p>
            </div>
            <button onClick={() => toggleVisibility(item)} className="p-1.5 rounded-lg transition-all hover:bg-[var(--mp-bg-hover)]" style={{ color: item.is_visible ? "var(--mp-accent)" : "var(--mp-text-tertiary)" }}>
              {item.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <Link to={`/navbar/${item.id}/edit`} className="mp-btn-ghost text-xs">Editar</Link>
            <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-danger)] hover:bg-[rgba(239,68,68,0.08)] transition-all">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="mp-card p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--mp-accent)]/20 to-[var(--mp-accent)]/5 flex items-center justify-center mx-auto mb-3">
              <Menu size={24} className="text-[var(--mp-accent)]" />
            </div>
            <p className="text-sm text-[var(--mp-text-tertiary)] mb-3">No hay items en el menu</p>
            <Link to="/navbar/new" className="mp-btn-primary text-sm">
              <Plus size={14} /> Agregar primer item
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between p-4 mp-card">
        <span className="text-sm text-[var(--mp-text-tertiary)]">Los cambios se guardan automaticamente</span>
        <div className="flex items-center gap-3">
          <button onClick={resetConfig} className="mp-btn-ghost text-sm border border-[var(--mp-border)]">Restablecer</button>
          <button onClick={saveAllConfig} className={`mp-btn-primary text-sm ${!hasChanges ? "opacity-50 cursor-not-allowed" : ""}`} disabled={!hasChanges}>
            <Save size={14} /> Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
