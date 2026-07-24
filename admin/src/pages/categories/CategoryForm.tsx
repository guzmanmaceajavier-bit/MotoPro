import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import { X, FolderTree, Check, Upload, Eye, EyeOff, Star, ChevronDown } from "lucide-react";

const colorPresets = ["#14b8a6", "#8b5cf6", "#3b82f6", "#f59e0b", "#f97316", "#ef4444", "#ec4899", "#6366f1", "#64748b", "#374151"];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "sin-nombre";
}

export default function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { showToast } = useToast();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", slug: "", description: "", image: "", color: "#14b8a6",
    parent_id: "", is_visible: true, is_featured: false,
    seo_title: "", seo_description: "", seo_keywords: ""
  });
  const [saving, setSaving] = useState(false);
  const [createAnother, setCreateAnother] = useState(false);
  const [manualSlug, setManualSlug] = useState(false);

  useEffect(() => {
    if (isEdit) api.get(`/categories/id/${id}`).then((c) => {
      setForm({
        name: c.name || "", slug: c.slug || "", description: c.description || "",
        image: c.image || "", color: c.color || "#14b8a6", parent_id: c.parent_id || "",
        is_visible: c.is_visible !== false, is_featured: c.is_featured || false,
        seo_title: c.seo_title || "", seo_description: c.seo_description || "", seo_keywords: c.seo_keywords || ""
      });
    });
  }, [id]);

  const handleNameChange = (name: string) => {
    setForm(prev => ({ ...prev, name, slug: manualSlug ? prev.slug : slugify(name) }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return showToast("error", "El nombre es obligatorio");
    setSaving(true);
    try {
      const data = {
        name: form.name, slug: form.slug || slugify(form.name), description: form.description,
        image: form.image, color: form.color, parent_id: form.parent_id || undefined,
        is_visible: form.is_visible, is_featured: form.is_featured,
        seo_title: form.seo_title, seo_description: form.seo_description, seo_keywords: form.seo_keywords
      };
      if (isEdit) {
        await api.put(`/categories/${id}`, data);
      } else {
        const res = await api.post("/categories", data) as any;
        if (createAnother) {
          setForm({ name: "", slug: "", description: "", image: "", color: "#14b8a6", parent_id: "", is_visible: true, is_featured: false, seo_title: "", seo_description: "", seo_keywords: "" });
          setStep(0);
          showToast("success", "Categoría creada. Crea otra.");
        } else {
          showToast("success", "Categoría creada");
          navigate("/categories");
        }
      }
      if (isEdit) { showToast("success", "Categoría actualizada"); navigate("/categories"); }
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  const steps = [
    { num: 1, label: "Información básica", desc: "Detalles principales de la categoría" },
    { num: 2, label: "Configuración", desc: "Opciones y preferencias" },
    { num: 3, label: "SEO y visibilidad", desc: "Mejora el posicionamiento" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(20,184,166,0.1)] text-[var(--mp-accent)]">
            <FolderTree size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--mp-text-primary)]">{isEdit ? "Editar categoría" : "Nueva categoría"}</h1>
            <p className="text-sm text-[var(--mp-text-tertiary)]">Crea una nueva categoría para organizar productos o servicios en el catálogo.</p>
          </div>
        </div>
        <button onClick={() => navigate("/categories")} className="p-2 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)] transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center flex-1">
            <button onClick={() => setStep(i)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all flex-1 ${
                step === i ? "bg-[rgba(20,184,166,0.08)] border border-[rgba(20,184,166,0.2)]" : "border border-transparent hover:bg-[var(--mp-bg-hover)]"
              }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                step === i ? "bg-[var(--mp-accent)] text-white" : step > i ? "bg-[var(--mp-success)] text-white" : "bg-[var(--mp-bg-elevated)] text-[var(--mp-text-tertiary)]"
              }`}>
                {step > i ? <Check size={14} /> : s.num}
              </div>
              <div className="text-left hidden sm:block">
                <p className={`text-sm font-semibold ${step === i ? "text-[var(--mp-text-primary)]" : "text-[var(--mp-text-secondary)]"}`}>{s.label}</p>
                <p className="text-[11px] text-[var(--mp-text-tertiary)]">{s.desc}</p>
              </div>
            </button>
            {i < steps.length - 1 && <div className="w-8 h-px bg-[var(--mp-border)] mx-1 shrink-0" />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left - Form */}
        <div className="lg:col-span-3 space-y-6">
          {step === 0 && (
            <div className="mp-card p-6 space-y-5">
              <h3 className="text-sm font-bold text-[var(--mp-text-primary)] uppercase tracking-wider">Información Básica</h3>

              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Nombre de la categoría <span className="text-[var(--mp-danger)]">*</span></label>
                <input value={form.name} onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ej. Frenos, Suspensión, Aceites..." className="mp-input" required />
                <p className="text-[11px] text-[var(--mp-text-tertiary)] mt-1">Este nombre será visible para los clientes.</p>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Slug (URL) <span className="text-[var(--mp-danger)]">*</span></label>
                <div className="flex items-center">
                  <span className="text-xs text-[var(--mp-text-tertiary)] bg-[var(--mp-bg-elevated)] border border-r-0 border-[var(--mp-border)] rounded-l-lg px-3 h-[38px] flex items-center whitespace-nowrap">motopro.com/categoria/</span>
                  <input value={form.slug} onChange={(e) => { setForm(p => ({ ...p, slug: e.target.value })); setManualSlug(true); }}
                    placeholder="ej. frenos" className="mp-input rounded-l-none flex-1" />
                </div>
                <p className="text-[11px] text-[var(--mp-text-tertiary)] mt-1">URL amigable para la categoría. Solo minúsculas, números y guiones.</p>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Descripción</label>
                <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe esta categoría..." rows={3} className="mp-input resize-none" />
                <p className="text-[11px] text-[var(--mp-text-tertiary)] mt-1">Esta descripción no será visible para los clientes.</p>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Categoría padre</label>
                <select className="mp-select" value={form.parent_id} onChange={(e) => setForm(p => ({ ...p, parent_id: e.target.value }))}>
                  <option value="">Sin categoría padre</option>
                </select>
                <p className="text-[11px] text-[var(--mp-text-tertiary)] mt-1">Selecciona una categoría padre si esta será una subcategoría.</p>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Imagen de la categoría</label>
                <div className="border-2 border-dashed border-[var(--mp-border)] rounded-xl p-8 text-center hover:border-[var(--mp-accent)] transition-colors cursor-pointer">
                  <Upload size={24} className="mx-auto mb-2 text-[var(--mp-text-tertiary)]" />
                  <p className="text-sm text-[var(--mp-text-secondary)]">Arrastra una imagen o haz clic para seleccionar</p>
                  <p className="text-[11px] text-[var(--mp-text-tertiary)] mt-1">PNG, JPG o WEBP. Máx. 2MB. Recomendado 600x400px</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-2 block">Color identificador</label>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map(c => (
                    <button key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))}
                      className="w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center"
                      style={{ background: c, borderColor: form.color === c ? 'white' : 'transparent', boxShadow: form.color === c ? `0 0 0 2px ${c}` : 'none' }}>
                      {form.color === c && <Check size={14} color="white" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[var(--mp-text-tertiary)] mt-2">Este color se usará para identificar la categoría en el panel y en el catálogo.</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="mp-card p-6 space-y-5">
              <h3 className="text-sm font-bold text-[var(--mp-text-primary)] uppercase tracking-wider">Configuración</h3>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(20,184,166,0.1)] text-[var(--mp-accent)]">
                    <Eye size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--mp-text-primary)]">Mostrar en el catálogo</p>
                    <p className="text-xs text-[var(--mp-text-tertiary)]">La categoría será visible para los clientes</p>
                  </div>
                </div>
                <button type="button" onClick={() => setForm(p => ({ ...p, is_visible: !p.is_visible }))}
                  className={`w-11 h-6 rounded-full transition-all relative ${form.is_visible ? "bg-[var(--mp-accent)]" : "bg-[var(--mp-bg-hover)]"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_visible ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(245,158,11,0.1)] text-[var(--mp-warning)]">
                    <Star size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--mp-text-primary)]">Categoría destacada</p>
                    <p className="text-xs text-[var(--mp-text-tertiary)]">Mostrar en secciones destacadas del catálogo</p>
                  </div>
                </div>
                <button type="button" onClick={() => setForm(p => ({ ...p, is_featured: !p.is_featured }))}
                  className={`w-11 h-6 rounded-full transition-all relative ${form.is_featured ? "bg-[var(--mp-accent)]" : "bg-[var(--mp-bg-hover)]"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_featured ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="mp-card p-6 space-y-5">
              <h3 className="text-sm font-bold text-[var(--mp-text-primary)] uppercase tracking-wider">SEO y Visibilidad</h3>

              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Título SEO</label>
                <input value={form.seo_title} onChange={(e) => setForm(p => ({ ...p, seo_title: e.target.value }))}
                  placeholder="Título SEO de la categoría" className="mp-input" />
                <p className="text-[11px] text-[var(--mp-text-tertiary)] mt-1">Recomendado: 50-60 caracteres. <span className="text-[var(--mp-text-secondary)]">{form.seo_title.length}/60</span></p>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Meta descripción</label>
                <textarea value={form.seo_description} onChange={(e) => setForm(p => ({ ...p, seo_description: e.target.value }))}
                  placeholder="Descripción meta para buscadores..." rows={3} className="mp-input resize-none" />
                <p className="text-[11px] text-[var(--mp-text-tertiary)] mt-1">Recomendado: 120-160 caracteres. <span className="text-[var(--mp-text-secondary)]">{form.seo_description.length}/160</span></p>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Palabras clave</label>
                <input value={form.seo_keywords} onChange={(e) => setForm(p => ({ ...p, seo_keywords: e.target.value }))}
                  placeholder="Ej. frenos, pastillas, discos" className="mp-input" />
                <p className="text-[11px] text-[var(--mp-text-tertiary)] mt-1">Separa las palabras clave con comas. <span className="text-[var(--mp-text-secondary)]">{form.seo_keywords.length}/160</span></p>
              </div>
            </div>
          )}
        </div>

        {/* Right - Preview */}
        <div className="lg:col-span-2 space-y-5">
          {/* Preview Card */}
          <div className="mp-card p-5">
            <h3 className="text-xs font-bold text-[var(--mp-text-tertiary)] uppercase tracking-wider mb-3">Vista Previa</h3>
            <p className="text-xs text-[var(--mp-text-tertiary)] mb-3">Así se verá la categoría en el catálogo</p>
            <div className="rounded-xl border border-[var(--mp-border)] bg-[var(--mp-bg-elevated)] p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${form.color}15` }}>
                {form.image ? <img src={form.image} alt="" className="w-full h-full object-cover rounded-xl" /> :
                  <FolderTree size={22} style={{ color: form.color }} />}
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-[var(--mp-text-primary)]">{form.name || "Nombre de la categoría"}</p>
                <p className="text-xs text-[var(--mp-text-tertiary)]">{form.description || "Descripción breve que verán los clientes al navegar"}</p>
                <p className="text-xs text-[var(--mp-accent)] mt-1">0 productos · 0 subcategorías</p>
              </div>
            </div>
          </div>

          {/* Quick Config */}
          <div className="mp-card p-5">
            <h3 className="text-xs font-bold text-[var(--mp-text-tertiary)] uppercase tracking-wider mb-4">Configuración Rápida</h3>

            <div className="flex items-center justify-between py-3 border-b border-[var(--mp-border-subtle)]">
              <div className="flex items-center gap-3">
                <Eye size={16} className="text-[var(--mp-accent)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--mp-text-primary)]">Mostrar en el catálogo</p>
                  <p className="text-[11px] text-[var(--mp-text-tertiary)]">La categoría será visible para los clientes</p>
                </div>
              </div>
              <button type="button" onClick={() => setForm(p => ({ ...p, is_visible: !p.is_visible }))}
                className={`w-11 h-6 rounded-full transition-all relative ${form.is_visible ? "bg-[var(--mp-accent)]" : "bg-[var(--mp-bg-hover)]"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_visible ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Star size={16} className="text-[var(--mp-warning)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--mp-text-primary)]">Categoría destacada</p>
                  <p className="text-[11px] text-[var(--mp-text-tertiary)]">Mostrar en secciones destacadas del catálogo</p>
                </div>
              </div>
              <button type="button" onClick={() => setForm(p => ({ ...p, is_featured: !p.is_featured }))}
                className={`w-11 h-6 rounded-full transition-all relative ${form.is_featured ? "bg-[var(--mp-accent)]" : "bg-[var(--mp-bg-hover)]"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_featured ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
          </div>

          {/* SEO Quick */}
          <div className="mp-card p-5">
            <h3 className="text-xs font-bold text-[var(--mp-text-tertiary)] uppercase tracking-wider mb-4">SEO y Visibilidad</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">Título SEO</label>
                <input value={form.seo_title} onChange={(e) => setForm(p => ({ ...p, seo_title: e.target.value }))}
                  placeholder="Título SEO de la categoría" className="mp-input text-xs" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">Meta descripción</label>
                <textarea value={form.seo_description} onChange={(e) => setForm(p => ({ ...p, seo_description: e.target.value }))}
                  placeholder="Descripción meta para buscadores..." rows={2} className="mp-input text-xs resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">Palabras clave</label>
                <input value={form.seo_keywords} onChange={(e) => setForm(p => ({ ...p, seo_keywords: e.target.value }))}
                  placeholder="Ej. frenos, pastillas, discos" className="mp-input text-xs" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-5 border-t border-[var(--mp-border)]">
        <button onClick={() => navigate("/categories")} className="mp-btn-ghost text-sm">Cancelar</button>
        <div className="flex items-center gap-4">
          {!isEdit && (
            <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--mp-text-secondary)]">
              <input type="checkbox" checked={createAnother} onChange={(e) => setCreateAnother(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--mp-accent)]" />
              Crear otra categoría
            </label>
          )}
          <button onClick={handleSubmit} disabled={saving || !form.name.trim()} className="mp-btn-primary text-sm">
            {saving ? "Guardando..." : isEdit ? "Actualizar categoría" : "+ Crear categoría"}
          </button>
        </div>
      </div>
    </div>
  );
}
