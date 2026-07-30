import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/api/client";
import { uploadFile } from "@/api/client";
import { Save, ArrowLeft, Upload, X, Users } from "lucide-react";
import { useToast } from "@/components/Toast";
import PageHeader from "@/components/PageHeader";

export default function TeamForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", role: "", specialty: "", experience: "", description: "", sort_order: 0
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (isEdit) {
      api.get(`/team/${id}`).then((m) => {
        setForm({
          name: m.name || "", role: m.role || "", specialty: m.specialty || "",
          experience: m.experience || "", description: m.description || "", sort_order: m.sort_order || 0
        });
        if (m.image) setImagePreview(m.image);
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
    if (!form.name.trim()) {
      showToast("error", "El nombre es requerido");
      return;
    }
    setSaving(true);
    try {
      let imageUrl = imagePreview;
      if (imageFile) {
        imageUrl = await uploadFile(imageFile, "team");
      }
      const payload = { ...form, image: imageUrl || null };
      if (isEdit) {
        await api.put(`/team/${id}`, payload);
        showToast("success", "Miembro actualizado");
      } else {
        await api.post("/team", payload);
        showToast("success", "Miembro creado");
      }
      navigate("/team");
    } catch (err) {
      showToast("error", "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={isEdit ? "Editar Miembro" : "Nuevo Miembro"}
        description={isEdit ? "Modifica la información del miembro." : "Agrega un nuevo miembro a tu equipo."}
        breadcrumbs={[{ label: "Equipo", to: "/team" }, { label: isEdit ? "Editar" : "Nuevo" }]}
        icon={<Users size={20} />}
        action={
          <button onClick={() => navigate("/team")} className="mp-btn-ghost text-xs">
            <ArrowLeft size={14} /> Volver
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="mp-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Información del Miembro</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Nombre *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mp-input text-sm" placeholder="Ej: Juan Pérez" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Cargo / Rol</label>
                <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="mp-input text-sm" placeholder="Ej: Mecánico Senior" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Especialidad</label>
                <input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="mp-input text-sm" placeholder="Ej: Motores, Suspensión, Eléctrica" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Experiencia</label>
                <input value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className="mp-input text-sm" placeholder="Ej: 10 años" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Descripción</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mp-input text-sm min-h-[100px]" placeholder="Breve descripción del miembro..." />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image */}
          <div className="mp-card p-6">
            <h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-4">Foto del Miembro</h3>
            <div className="flex flex-col items-center gap-3">
              {imagePreview ? (
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-[var(--mp-border)]">
                  <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(""); }}
                    className="absolute top-0 right-0 w-6 h-6 bg-[var(--mp-danger)] text-white rounded-full flex items-center justify-center"><X size={12} /></button>
                </div>
              ) : (
                <label className="w-28 h-28 rounded-full border-2 border-dashed border-[var(--mp-border)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--mp-accent)] transition-colors">
                  <Upload size={24} className="text-[var(--mp-text-tertiary)]" />
                  <span className="text-[10px] text-[var(--mp-text-tertiary)] mt-1">Subir foto</span>
                  <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="mp-card p-6">
            <h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-4">Configuración</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Orden de visualización</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="mp-input text-sm" min="0" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate("/team")} className="mp-btn-ghost flex-1 text-xs">Cancelar</button>
            <button type="submit" disabled={saving} className="mp-btn-primary flex-1 text-xs">
              <Save size={14} /> {saving ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
