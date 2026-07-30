import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/api/client";
import { uploadFile } from "@/api/client";
import { Save, ArrowLeft, Star, Upload, X } from "lucide-react";
import { useToast } from "@/components/Toast";
import PageHeader from "@/components/PageHeader";

export default function TestimonialForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", role: "", content: "", rating: 5, is_active: 1, sort_order: 0
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (isEdit) {
      api.get(`/testimonials/${id}`).then((t) => {
        setForm({
          name: t.name || "", role: t.role || "", content: t.content || "",
          rating: t.rating || 5, is_active: t.is_active ?? 1, sort_order: t.sort_order || 0
        });
        if (t.image) setImagePreview(t.image);
      });
    }
  }, [id, isEdit]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.content.trim()) {
      showToast("error", "Nombre y contenido son requeridos");
      return;
    }
    setSaving(true);
    try {
      let imageUrl = imagePreview;
      if (imageFile) {
        imageUrl = await uploadFile(imageFile, "testimonials");
      }
      const payload = { ...form, image: imageUrl || null };
      if (isEdit) {
        await api.put(`/testimonials/${id}`, payload);
        showToast("success", "Testimonio actualizado");
      } else {
        await api.post("/testimonials", payload);
        showToast("success", "Testimonio creado");
      }
      navigate("/testimonials");
    } catch (err) {
      showToast("error", "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={isEdit ? "Editar Testimonio" : "Nuevo Testimonio"}
        description={isEdit ? "Modifica la información del testimonio." : "Agrega un nuevo testimonio de cliente."}
        breadcrumbs={[{ label: "Testimonios", to: "/testimonials" }, { label: isEdit ? "Editar" : "Nuevo" }]}
        icon={<Star size={20} />}
        action={
          <button onClick={() => navigate("/testimonials")} className="mp-btn-ghost text-xs">
            <ArrowLeft size={14} /> Volver
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="mp-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Información del Testimonio</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Nombre del Cliente *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mp-input text-sm" placeholder="Ej: Juan Pérez" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Cargo / Rol</label>
                <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="mp-input text-sm" placeholder="Ej: Cliente frecuente" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Testimonio *</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="mp-input text-sm min-h-[120px]" placeholder="Escribe el testimonio del cliente..." required />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image */}
          <div className="mp-card p-6">
            <h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-4">Foto del Cliente</h3>
            <div className="flex flex-col items-center gap-3">
              {imagePreview ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[var(--mp-border)]">
                  <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(""); }}
                    className="absolute top-0 right-0 w-6 h-6 bg-[var(--mp-danger)] text-white rounded-full flex items-center justify-center"><X size={12} /></button>
                </div>
              ) : (
                <label className="w-24 h-24 rounded-full border-2 border-dashed border-[var(--mp-border)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--mp-accent)] transition-colors">
                  <Upload size={20} className="text-[var(--mp-text-tertiary)]" />
                  <span className="text-[10px] text-[var(--mp-text-tertiary)] mt-1">Subir foto</span>
                  <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Rating */}
          <div className="mp-card p-6">
            <h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-4">Calificación</h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setForm({ ...form, rating: star })}
                  className="transition-transform hover:scale-110">
                  <Star size={28} className={star <= form.rating ? "fill-amber-400 text-amber-400" : "text-gray-300 hover:text-amber-300"} />
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--mp-text-tertiary)] mt-2">{form.rating} de 5 estrellas</p>
          </div>

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
            <button type="button" onClick={() => navigate("/testimonials")} className="mp-btn-ghost flex-1 text-xs">Cancelar</button>
            <button type="submit" disabled={saving} className="mp-btn-primary flex-1 text-xs">
              <Save size={14} /> {saving ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
