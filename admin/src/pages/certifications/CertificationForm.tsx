import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, uploadFile } from "@/api/client";
import { Save, ArrowLeft, Award, Upload, X } from "lucide-react";
import { useToast } from "@/components/Toast";
import PageHeader from "@/components/PageHeader";

export default function CertificationForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", issuer: "", description: "", is_active: 1, sort_order: 0 });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (isEdit) api.get(`/certifications/${id}`).then(v => {
      setForm({ title: v.title || "", issuer: v.issuer || "", description: v.description || "", is_active: v.is_active ?? 1, sort_order: v.sort_order || 0 });
      if (v.image) setImagePreview(v.image);
    });
  }, [id]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setImageFile(file); setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast("error", "El título es requerido"); return; }
    setSaving(true);
    try {
      let imageUrl = imagePreview;
      if (imageFile) { const res = await uploadFile("/upload", imageFile, "taller-motos/certifications"); imageUrl = res.data?.url || res.url || res.image || ""; }
      const payload = { ...form, image: imageUrl || null };
      if (isEdit) await api.put(`/certifications/${id}`, payload);
      else await api.post("/certifications", payload);
      showToast("success", isEdit ? "Certificación actualizada" : "Certificación creada");
      navigate("/certifications");
    } catch { showToast("error", "Error al guardar"); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title={isEdit ? "Editar Certificación" : "Nueva Certificación"} description={isEdit ? "Modifica la certificación." : "Agrega una nueva certificación."}
        breadcrumbs={[{ label: "Certificaciones", to: "/certifications" }, { label: isEdit ? "Editar" : "Nuevo" }]} icon={<Award size={20} />}
        action={<button onClick={() => navigate("/certifications")} className="mp-btn-ghost text-xs"><ArrowLeft size={14} /> Volver</button>} />
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="mp-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Información</h3>
            <div>
              <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Título *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mp-input text-sm" placeholder="Ej: Certificación ISO 9001" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Emisor</label>
              <input value={form.issuer} onChange={e => setForm({ ...form, issuer: e.target.value })} className="mp-input text-sm" placeholder="Ej: Bureau Veritas" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Descripción</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mp-input text-sm min-h-[100px]" placeholder="Describe esta certificación..." />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="mp-card p-6">
            <h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-4">Imagen / Logo</h3>
            <div className="space-y-3">
              {imagePreview && (
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-[var(--mp-bg-elevated)]">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                  <button type="button" onClick={() => { setImagePreview(""); setImageFile(null); }} className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"><X size={14} /></button>
                </div>
              )}
              <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-[var(--mp-border)] cursor-pointer hover:border-interactive-accent/50 transition-colors">
                <Upload size={16} className="text-[var(--mp-text-tertiary)]" />
                <span className="text-sm text-[var(--mp-text-tertiary)]">{imagePreview ? "Cambiar imagen" : "Subir imagen"}</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImage} />
              </label>
            </div>
          </div>
          <div className="mp-card p-6">
            <h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-4">Configuración</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--mp-text-secondary)]">Activo</span>
                <button type="button" onClick={() => setForm({ ...form, is_active: form.is_active === 1 ? 0 : 1 })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active === 1 ? "bg-[var(--mp-success)]" : "bg-[var(--mp-bg-elevated)]"}`}>
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_active === 1 ? "translate-x-5" : ""}`} />
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Orden</label>
                <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} className="mp-input text-sm" min="0" />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate("/certifications")} className="mp-btn-ghost flex-1 text-xs">Cancelar</button>
            <button type="submit" disabled={saving} className="mp-btn-primary flex-1 text-xs"><Save size={14} /> {saving ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
