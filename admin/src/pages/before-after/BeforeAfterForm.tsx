import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/api/client";
import { uploadFile } from "@/api/client";
import { Save, ArrowLeft, Upload, X, Layers } from "lucide-react";
import { useToast } from "@/components/Toast";
import PageHeader from "@/components/PageHeader";

export default function BeforeAfterForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", is_active: 1, sort_order: 0
  });
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string>("");
  const [afterPreview, setAfterPreview] = useState<string>("");

  useEffect(() => {
    if (isEdit) {
      api.get(`/before-after/${id}`).then((item) => {
        setForm({
          title: item.title || "", description: item.description || "",
          is_active: item.is_active ?? 1, sort_order: item.sort_order || 0
        });
        if (item.before_image) setBeforePreview(item.before_image);
        if (item.after_image) setAfterPreview(item.after_image);
      });
    }
  }, [id, isEdit]);

  const handleBeforeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBeforeFile(file);
    setBeforePreview(URL.createObjectURL(file));
  };

  const handleAfterImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAfterFile(file);
    setAfterPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast("error", "El título es requerido");
      return;
    }
    if (!beforePreview || !afterPreview) {
      showToast("error", "Ambas imágenes son requeridas");
      return;
    }
    setSaving(true);
    try {
      let beforeUrl = beforePreview;
      let afterUrl = afterPreview;
      if (beforeFile) beforeUrl = await uploadFile(beforeFile, "before-after");
      if (afterFile) afterUrl = await uploadFile(afterFile, "before-after");
      const payload = { ...form, before_image: beforeUrl, after_image: afterUrl };
      if (isEdit) {
        await api.put(`/before-after/${id}`, payload);
        showToast("success", "Comparación actualizada");
      } else {
        await api.post("/before-after", payload);
        showToast("success", "Comparación creada");
      }
      navigate("/before-after");
    } catch (err) {
      showToast("error", "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={isEdit ? "Editar Comparación" : "Nueva Comparación"}
        description={isEdit ? "Modifica la comparación antes/después." : "Agrega una nueva comparación de trabajo realizado."}
        breadcrumbs={[{ label: "Antes/Después", to: "/before-after" }, { label: isEdit ? "Editar" : "Nuevo" }]}
        icon={<Layers size={20} />}
        action={
          <button onClick={() => navigate("/before-after")} className="mp-btn-ghost text-xs">
            <ArrowLeft size={14} /> Volver
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="mp-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Información</h3>
            <div>
              <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Título *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mp-input text-sm" placeholder="Ej: Cambio de Aceite Yamaha MT-09" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Descripción</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mp-input text-sm min-h-[100px]" placeholder="Describe el trabajo realizado..." />
            </div>
          </div>

          {/* Images */}
          <div className="mp-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Imágenes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Before */}
              <div>
                <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-2">Antes *</label>
                {beforePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-[var(--mp-border)]">
                    <img src={beforePreview} alt="Antes" className="w-full h-48 object-cover" />
                    <button type="button" onClick={() => { setBeforeFile(null); setBeforePreview(""); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-[var(--mp-danger)] text-white rounded-full flex items-center justify-center shadow-lg"><X size={14} /></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-[var(--mp-border)] cursor-pointer hover:border-[var(--mp-accent)] transition-colors">
                    <Upload size={28} className="text-[var(--mp-text-tertiary)] mb-2" />
                    <span className="text-xs text-[var(--mp-text-tertiary)]">Subir imagen "Antes"</span>
                    <input type="file" accept="image/*" onChange={handleBeforeImage} className="hidden" />
                  </label>
                )}
              </div>
              {/* After */}
              <div>
                <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-2">Después *</label>
                {afterPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-[var(--mp-border)]">
                    <img src={afterPreview} alt="Después" className="w-full h-48 object-cover" />
                    <button type="button" onClick={() => { setAfterFile(null); setAfterPreview(""); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-[var(--mp-danger)] text-white rounded-full flex items-center justify-center shadow-lg"><X size={14} /></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-[var(--mp-border)] cursor-pointer hover:border-[var(--mp-accent)] transition-colors">
                    <Upload size={28} className="text-[var(--mp-text-tertiary)] mb-2" />
                    <span className="text-xs text-[var(--mp-text-tertiary)]">Subir imagen "Después"</span>
                    <input type="file" accept="image/*" onChange={handleAfterImage} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Settings */}
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
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="mp-input text-sm" min="0" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate("/before-after")} className="mp-btn-ghost flex-1 text-xs">Cancelar</button>
            <button type="submit" disabled={saving} className="mp-btn-primary flex-1 text-xs">
              <Save size={14} /> {saving ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
