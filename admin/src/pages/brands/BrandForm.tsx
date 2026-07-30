import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, uploadFile } from "@/api/client";
import { useToast } from "@/components/Toast";
import { Save, Tags, X, Plus, Upload, BookOpen, Eye, EyeOff, Store } from "lucide-react";

const colorPresets = ["#ff6b00", "#8B5CF6", "#3B82F6", "#F59E0B", "#F97316", "#EF4444", "#EC4899", "#6366F1", "#64748b", "#374151"];

export default function BrandForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { showToast } = useToast();

  const [form, setForm] = useState({ name: "", image: "", alt_image: "", accent: "#ff6b00", is_active: true, is_visible_store: true });
  const [models, setModels] = useState<string[]>([]);
  const [modelInput, setModelInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const altRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEdit) api.get(`/brands/${id}`).then((b) => {
      let m: string[] = [];
      try { m = JSON.parse(b.models || "[]"); } catch { m = []; }
      setForm({
        name: b.name || "", image: b.image || "", alt_image: b.alt_image || "",
        accent: b.accent || "#ff6b00", is_active: b.is_active !== false, is_visible_store: b.is_visible_store !== false,
      });
      setModels(m);
    });
  }, [id]);

  const addModel = () => {
    const m = modelInput.trim();
    if (m && !models.includes(m)) { setModels([...models, m]); setModelInput(""); }
  };

  const removeModel = (m: string) => setModels(models.filter(x => x !== m));

  const handleLogoUpload = async (file: File) => {
    if (!file || !file.type.startsWith("image/")) { showToast("error", "Solo se permiten imágenes"); return; }
    setUploading(true);
    try {
      const res = await uploadFile("/upload", file, "taller-motos/brands");
      const url = res.data?.url || res.url || res.image || "";
      if (url) { setForm(prev => ({ ...prev, image: url })); setLogoPreview(null); showToast("success", "Logo subido"); }
    } catch { showToast("error", "Error al subir"); }
    finally { setUploading(false); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleLogoUpload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return showToast("error", "El nombre es obligatorio");
    setSaving(true);
    try {
      const data = { ...form, models: JSON.stringify(models) };
      if (isEdit) await api.put(`/brands/${id}`, data);
      else await api.post("/brands", data);
      showToast("success", isEdit ? "Marca actualizada" : "Marca creada");
      navigate("/brands");
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  const handleSubmitAndCreate = async () => {
    if (!form.name.trim()) return showToast("error", "El nombre es obligatorio");
    setSaving(true);
    try {
      const data = { ...form, models: JSON.stringify(models) };
      await api.post("/brands", data);
      showToast("success", "Marca creada. Crea otra.");
      setForm({ name: "", image: "", alt_image: "", accent: "#ff6b00", is_active: true, is_visible_store: true });
      setModels([]);
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(255,107,0,0.1)] text-[var(--mp-accent)]">
            <Tags size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--mp-text-primary)]">{isEdit ? "Editar Marca" : "Nueva Marca"}</h1>
            <p className="text-sm text-[var(--mp-text-tertiary)]">Registra una nueva marca en el catálogo de productos y vehículos.</p>
          </div>
        </div>
        <button className="mp-btn-ghost text-xs"><BookOpen size={14} /> Guía rápida</button>
      </div>

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-xs text-[var(--mp-text-tertiary)]">
        <span className="hover:text-[var(--mp-text-secondary)] cursor-pointer" onClick={() => navigate("/brands")}>Marcas</span>
        <span>/</span>
        <span className="text-[var(--mp-text-secondary)]">{isEdit ? "Editar Marca" : "Nueva Marca"}</span>
      </nav>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Logo Upload */}
            <div className="mp-card p-5">
              <h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-1">Logo de la marca</h3>
              <p className="text-xs text-[var(--mp-text-tertiary)] mb-4">Este logo se mostrará en el catálogo y en los productos.</p>

              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${form.image ? "border-[var(--mp-accent)]" : "border-[var(--mp-border)] hover:border-[var(--mp-accent)]"}`}
                onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}
                onClick={() => logoRef.current?.click()}>
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }} />

                {form.image ? (
                  <div className="relative inline-block">
                    <img src={form.image} alt="Logo" className="w-24 h-24 rounded-2xl object-cover mx-auto" />
                    <button type="button" onClick={(e) => { e.stopPropagation(); setForm(prev => ({ ...prev, image: "" })); }}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--mp-danger)] text-white flex items-center justify-center shadow-lg">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-[var(--mp-bg-elevated)] text-[var(--mp-text-tertiary)]">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1">Arrastra una imagen o haz clic para seleccionar</p>
                    <p className="text-[10px] text-[var(--mp-text-tertiary)]">PNG, JPG o WEBP. Máx. 2MB. Recomendado 512x512px</p>
                  </>
                )}
                {uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl"><div className="w-6 h-6 border-2 border-[var(--mp-accent)] border-t-transparent rounded-full animate-spin" /></div>}
              </div>

              {/* Edit button overlay */}
              {form.image && (
                <button type="button" onClick={() => logoRef.current?.click()}
                  className="w-8 h-8 rounded-full bg-[var(--mp-accent)] text-white flex items-center justify-center mx-auto -mt-4 relative z-10 shadow-lg hover:scale-110 transition-transform">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Alternative Image */}
            <div className="mp-card p-5">
              <h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-1">Imagen alternativa <span className="text-[var(--mp-text-tertiary)] font-normal">(opcional)</span></h3>
              <button type="button" onClick={() => altRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[var(--mp-border)] bg-[var(--mp-bg-elevated)] text-xs text-[var(--mp-text-secondary)] hover:border-[var(--mp-accent)] transition-colors mt-3">
                <Upload size={14} /> Subir archivo
              </button>
              <input ref={altRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const f = e.target.files?.[0]; if (!f) return;
                const res = await uploadFile("/upload", f, "taller-motos/brands");
                const url = res.data?.url || res.url || res.image || "";
                if (url) setForm(prev => ({ ...prev, alt_image: url }));
              }} />
            </div>

            {/* Color Picker */}
            <div className="mp-card p-5">
              <h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-1">Color de marca</h3>
              <p className="text-xs text-[var(--mp-text-tertiary)] mb-4">Elige un color que represente esta marca en el sistema.</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {colorPresets.map(c => (
                  <button key={c} type="button" onClick={() => setForm(prev => ({ ...prev, accent: c }))}
                    className="w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center"
                    style={{ background: c, borderColor: form.accent === c ? 'white' : 'transparent', boxShadow: form.accent === c ? `0 0 0 2px ${c}` : 'none' }}>
                    {form.accent === c && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Color personalizado <span className="text-[var(--mp-text-tertiary)] font-normal">(opcional)</span></label>
                <div className="flex items-center gap-2">
                  <input type="text" value={form.accent} onChange={(e) => setForm(prev => ({ ...prev, accent: e.target.value }))}
                    className="mp-input text-sm flex-1" placeholder="#0EA5E9" maxLength={7} />
                  <div className="w-10 h-10 rounded-xl border border-[var(--mp-border)] shrink-0" style={{ background: form.accent }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-3 space-y-5">
            {/* Información básica */}
            <div className="mp-card p-5">
              <h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-4">Información básica</h3>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Nombre de la marca <span className="text-[var(--mp-danger)]">*</span></label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center" style={{ background: `${form.accent}15` }}>
                    <Tags size={11} style={{ color: form.accent }} />
                  </div>
                  <input type="text" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="mp-input text-sm pl-10" placeholder="Ej: Yamaha" required />
                </div>
                <p className="text-[11px] text-[var(--mp-text-tertiary)] mt-1.5">Este nombre será visible para los clientes en todo el catálogo.</p>
              </div>
            </div>

            {/* Modelos */}
            <div className="mp-card p-5">
              <h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-1">Modelos de vehículos asociados</h3>
              <p className="text-xs text-[var(--mp-text-tertiary)] mb-4">Agrega uno o varios modelos que utilicen esta marca.</p>

              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                  </svg>
                  <input type="text" value={modelInput} onChange={(e) => setModelInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addModel(); } }}
                    className="mp-input text-sm pl-9" placeholder="Ej: MT-07" />
                </div>
                <button type="button" onClick={addModel} className="mp-btn-primary text-sm shrink-0"><Plus size={14} /> Agregar</button>
              </div>

              <div>
                <p className="text-xs font-medium text-[var(--mp-text-secondary)] mb-3">Modelos seleccionados ({models.length})</p>
                {models.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {models.map((m) => (
                      <span key={m} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[rgba(255,107,0,0.08)] text-[var(--mp-accent)]">
                        {m}
                        <button type="button" onClick={() => removeModel(m)} className="hover:text-[var(--mp-danger)] transition-colors"><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 rounded-xl bg-[var(--mp-bg-elevated)] border border-dashed border-[var(--mp-border)]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-[var(--mp-text-tertiary)]">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><path d="M12 8v8" /><path d="M8 12h8" />
                    </svg>
                    <p className="text-xs font-medium text-[var(--mp-text-secondary)]">Aún no has agregado modelos</p>
                    <p className="text-[11px] text-[var(--mp-text-tertiary)] mt-0.5">Busca y agrega modelos para asociarlos a esta marca.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Configuración adicional */}
            <div className="mp-card p-5">
              <h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-4">Configuración adicional</h3>

              <div className="space-y-0">
                <div className="flex items-center justify-between py-4 border-b border-[var(--mp-border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[rgba(255,107,0,0.1)] text-[var(--mp-accent)]">
                      <Eye size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--mp-text-primary)]">Marca activa</p>
                      <p className="text-[11px] text-[var(--mp-text-tertiary)]">La marca será visible y disponible en el catálogo.</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setForm(prev => ({ ...prev, is_active: !prev.is_active }))}
                    className={`w-11 h-6 rounded-full transition-all relative ${form.is_active ? "bg-[var(--mp-accent)]" : "bg-[var(--mp-bg-elevated)]"}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_active ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[rgba(59,130,246,0.1)] text-[#3B82F6]">
                      <Store size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--mp-text-primary)]">Mostrar en tienda</p>
                      <p className="text-[11px] text-[var(--mp-text-tertiary)]">La marca será visible para los clientes en la tienda.</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setForm(prev => ({ ...prev, is_visible_store: !prev.is_visible_store }))}
                    className={`w-11 h-6 rounded-full transition-all relative ${form.is_visible_store ? "bg-[var(--mp-accent)]" : "bg-[var(--mp-bg-elevated)]"}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_visible_store ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-5 border-t border-[var(--mp-border)] mt-6">
          <button type="button" onClick={() => navigate("/brands")} className="mp-btn-ghost text-sm">Cancelar</button>
          <div className="flex items-center gap-3">
            {!isEdit && (
              <button type="button" onClick={handleSubmitAndCreate} disabled={saving || !form.name.trim()} className="mp-btn-ghost text-sm">
                Guardar y crear otra
              </button>
            )}
            <button type="submit" disabled={saving || !form.name.trim()} className="mp-btn-primary text-sm">
              <Save size={14} /> {saving ? "Guardando..." : isEdit ? "Actualizar Marca" : "Crear Marca"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
