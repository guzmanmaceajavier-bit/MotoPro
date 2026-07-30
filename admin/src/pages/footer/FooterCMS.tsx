import { useState, useEffect } from "react";
import { Plus, Save, Trash2, GripVertical, Eye, Phone, Mail, MapPin, Clock, Copyright } from "lucide-react";
import { useToast } from "@/components/Toast";
import { api } from "@/api/client";
import ImageUpload from "@/components/ImageUpload";
import { FooterColumn } from "../../../../shared/types";

interface ColumnForm { id?: string; column_number: number; section_title: string; items: { label: string; link: string }[]; }

const SOCIAL_LINKS = [
  { key: "footer_facebook", label: "Facebook", color: "#1877F2", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
  ) },
  { key: "footer_instagram", label: "Instagram", color: "#E4405F", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="white" stroke="none"/></svg>
  ) },
  { key: "footer_twitter", label: "Twitter / X", color: "#1DA1F2", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  ) },
  { key: "footer_youtube", label: "YouTube", color: "#FF0000", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  ) },
  { key: "footer_whatsapp", label: "WhatsApp", color: "#25D366", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  ) },
];

export default function FooterCMS() {
  const [columns, setColumns] = useState<FooterColumn[]>([]);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ColumnForm | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const { showToast } = useToast();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [colRes, configRes] = await Promise.all([api.get("/cms/footer"), api.get("/config")]);
      setColumns(Array.isArray(colRes) ? colRes : colRes?.data || []);
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
      footer_facebook: "",
      footer_instagram: "",
      footer_twitter: "",
      footer_youtube: "",
      footer_whatsapp: "",
      footer_phone: "",
      footer_email: "",
      footer_address: "",
      footer_hours: "",
      footer_copyright: "",
    });
    setHasChanges(true);
    showToast("info", "Valores restablecidos");
  };

  const saveColumn = async () => {
    if (!editing) return;
    const payload = { id: editing.id, column_number: editing.column_number, section_title: editing.section_title, items_json: JSON.stringify(editing.items) };
    try {
      await (editing.id ? api.put(`/cms/footer/${editing.id}`, payload) : api.post("/cms/footer", payload));
      showToast("success", editing.id ? "Columna actualizada" : "Columna creada");
      setEditing(null); fetchAll();
    } catch { showToast("error", "Error al guardar"); }
  };

  const deleteColumn = async (id: string) => {
    if (!confirm("Eliminar esta columna?")) return;
    await api.delete(`/cms/footer/${id}`); showToast("success", "Columna eliminada"); fetchAll();
  };

  if (loading) return <div className="animate-fade-in space-y-4"><div className="h-8 w-32 bg-[var(--mp-bg-elevated)] rounded animate-pulse" /><div className="mp-card p-5 h-32 animate-pulse" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-lg">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--mp-text-primary)]">Footer</h1>
            <p className="text-sm text-[var(--mp-text-tertiary)]">Personaliza el contenido y la apariencia del pie de pagina de tu sitio web.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing({ column_number: columns.length + 1, section_title: "", items: [] })} className="mp-btn-primary text-sm">
            <Plus size={15} /> Anadir columna
          </button>
          <button className="mp-btn-ghost text-sm border border-[var(--mp-border)]">
            <Eye size={15} /> Vista previa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="mp-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <GripVertical size={16} className="text-[var(--mp-text-tertiary)] cursor-grab" />
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B82F6]/20 to-[#3B82F6]/10 flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              </div>
              <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Logo</h3>
            </div>
            <button className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:bg-[var(--mp-bg-hover)] transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
          </div>
          <p className="text-xs text-[var(--mp-text-tertiary)] mb-3">Logo del footer</p>
          <div className="border-2 border-dashed border-[var(--mp-border)] rounded-xl p-6 text-center hover:border-[var(--mp-accent)]/40 transition-colors">
            <ImageUpload folder="taller-motos/config" label="" value={config["footer_logo"] || ""} onChange={(url) => updateConfig("footer_logo", url)} />
          </div>
        </div>

        <div className="mp-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <GripVertical size={16} className="text-[var(--mp-text-tertiary)] cursor-grab" />
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E4405F]/20 to-[#E4405F]/10 flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E4405F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Redes Sociales</h3>
                <p className="text-[11px] text-[var(--mp-text-tertiary)]">Enlaces a tus redes sociales</p>
              </div>
            </div>
            <button className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:bg-[var(--mp-bg-hover)] transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
          </div>
          <div className="space-y-2">
            {SOCIAL_LINKS.map((s) => (
              <div key={s.key} className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: s.color }}>
                  {s.icon}
                </div>
                <input
                  type="url"
                  className="mp-input text-sm flex-1"
                  placeholder={`URL de ${s.label}`}
                  value={config[s.key] || ""}
                  onChange={(e) => updateConfig(s.key, e.target.value)}
                />
                <button className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-danger)] hover:bg-[rgba(239,68,68,0.08)] transition-all flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mp-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <GripVertical size={16} className="text-[var(--mp-text-tertiary)] cursor-grab" />
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B5CF6]/20 to-[#8B5CF6]/10 flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Contacto</h3>
                <p className="text-[11px] text-[var(--mp-text-tertiary)]">Informacion de contacto</p>
              </div>
            </div>
            <button className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:bg-[var(--mp-bg-hover)] transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--mp-bg-elevated)]">
              <Phone size={16} className="text-[var(--mp-text-tertiary)] flex-shrink-0" />
              <input type="tel" className="mp-input text-sm flex-1 border-none bg-transparent p-0 focus:ring-0" placeholder="Telefono" value={config["footer_phone"] || ""} onChange={(e) => updateConfig("footer_phone", e.target.value)} />
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--mp-bg-elevated)]">
              <Mail size={16} className="text-[var(--mp-text-tertiary)] flex-shrink-0" />
              <input type="email" className="mp-input text-sm flex-1 border-none bg-transparent p-0 focus:ring-0" placeholder="Email" value={config["footer_email"] || ""} onChange={(e) => updateConfig("footer_email", e.target.value)} />
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--mp-bg-elevated)]">
              <MapPin size={16} className="text-[var(--mp-text-tertiary)] flex-shrink-0" />
              <input type="text" className="mp-input text-sm flex-1 border-none bg-transparent p-0 focus:ring-0" placeholder="Direccion" value={config["footer_address"] || ""} onChange={(e) => updateConfig("footer_address", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="mp-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <GripVertical size={16} className="text-[var(--mp-text-tertiary)] cursor-grab" />
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F59E0B]/20 to-[#F59E0B]/10 flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Horarios & Copyright</h3>
                <p className="text-[11px] text-[var(--mp-text-tertiary)]">Informacion legal y horarios</p>
              </div>
            </div>
            <button className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:bg-[var(--mp-bg-hover)] transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--mp-bg-elevated)]">
              <Clock size={16} className="text-[var(--mp-text-tertiary)] flex-shrink-0" />
              <input type="text" className="mp-input text-sm flex-1 border-none bg-transparent p-0 focus:ring-0" placeholder="Horarios" value={config["footer_hours"] || ""} onChange={(e) => updateConfig("footer_hours", e.target.value)} />
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--mp-bg-elevated)]">
              <Copyright size={16} className="text-[var(--mp-text-tertiary)] flex-shrink-0" />
              <input type="text" className="mp-input text-sm flex-1 border-none bg-transparent p-0 focus:ring-0" placeholder="Copyright (c) 2026 MotoPro" value={config["footer_copyright"] || ""} onChange={(e) => updateConfig("footer_copyright", e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 mp-card">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#10B981]/15 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span className="text-sm text-[var(--mp-text-tertiary)]">Los cambios se guardan automaticamente</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={resetConfig} className="mp-btn-ghost text-sm border border-[var(--mp-border)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Restablecer
          </button>
          <button onClick={saveAllConfig} className={`mp-btn-primary text-sm ${!hasChanges ? "opacity-50 cursor-not-allowed" : ""}`} disabled={!hasChanges}>
            <Save size={14} /> Guardar cambios
          </button>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setEditing(null); }}>
          <div className="mp-card w-full max-w-lg p-6 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--mp-text-primary)]">{editing.id ? "Editar columna" : "Nueva columna"}</h3>
                  <p className="text-xs text-[var(--mp-text-tertiary)]">Agrega una nueva columna al footer de tu sitio web.</p>
                </div>
              </div>
              <button onClick={() => setEditing(null)} className="p-2 rounded-lg text-[var(--mp-text-tertiary)] hover:bg-[var(--mp-bg-hover)] transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
                    <span className="text-[#8B5CF6] text-xs font-bold">#</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--mp-text-primary)]">Numero de columna</p>
                    <p className="text-[11px] text-[var(--mp-text-tertiary)]">Define el orden de la columna en el footer.</p>
                  </div>
                </div>
                <input
                  type="number"
                  className="mp-input text-sm w-full"
                  value={editing.column_number}
                  onChange={(e) => setEditing({ ...editing, column_number: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
                    <span className="text-[#8B5CF6] text-sm font-bold">T</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--mp-text-primary)]">Titulo de seccion</p>
                    <p className="text-[11px] text-[var(--mp-text-tertiary)]">Este titulo sera visible en el footer.</p>
                  </div>
                </div>
                <input
                  type="text"
                  className="mp-input text-sm w-full"
                  placeholder="Ej. Servicios, Empresa, Ayuda"
                  value={editing.section_title}
                  onChange={(e) => setEditing({ ...editing, section_title: e.target.value })}
                />
              </div>

              <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--mp-text-primary)]">Enlaces</p>
                    <p className="text-[11px] text-[var(--mp-text-tertiary)]">Agrega los enlaces que contendra esta columna.</p>
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  {editing.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <GripVertical size={14} className="text-[var(--mp-text-tertiary)] cursor-grab flex-shrink-0" />
                      <input
                        type="text"
                        className="mp-input text-sm flex-1"
                        placeholder="Nombre del enlace"
                        value={item.label}
                        onChange={(e) => { const items = [...editing.items]; items[i] = { ...items[i], label: e.target.value }; setEditing({ ...editing, items }); }}
                      />
                      <input
                        type="text"
                        className="mp-input text-sm flex-1"
                        placeholder="URL del enlace"
                        value={item.link}
                        onChange={(e) => { const items = [...editing.items]; items[i] = { ...items[i], link: e.target.value }; setEditing({ ...editing, items }); }}
                      />
                      <button
                        onClick={() => { const items = editing.items.filter((_, idx) => idx !== i); setEditing({ ...editing, items }); }}
                        className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-danger)] hover:bg-[rgba(239,68,68,0.08)] transition-all flex-shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setEditing({ ...editing, items: [...editing.items, { label: "", link: "" }] })}
                  className="w-full py-2 rounded-xl border-2 border-dashed border-[var(--mp-border)] text-sm text-[var(--mp-accent)] font-medium hover:border-[var(--mp-accent)]/40 hover:bg-[var(--mp-accent)]/5 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} /> Anadir otro enlace
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#F59E0B]/5 border border-[#F59E0B]/15 flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#F59E0B]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/><line x1="9" y1="21" x2="15" y2="21"/></svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#F59E0B]">Consejo</p>
                  <p className="text-xs text-[var(--mp-text-tertiary)]">Puedes arrastrar los enlaces para cambiar su orden.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--mp-border)]">
              <button onClick={() => setEditing(null)} className="mp-btn-ghost text-sm border border-[var(--mp-border)]">Cancelar</button>
              <button onClick={saveColumn} className="mp-btn-primary text-sm">
                <Save size={14} /> Guardar columna
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
