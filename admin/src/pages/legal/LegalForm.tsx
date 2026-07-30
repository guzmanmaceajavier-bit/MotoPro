import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/api/client";
import { Save, ArrowLeft, BookOpen } from "lucide-react";
import { useToast } from "@/components/Toast";
import PageHeader from "@/components/PageHeader";

export default function LegalForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", is_published: 1 });

  useEffect(() => {
    if (isEdit) api.get(`/legal/${id}`).then(p => setForm({ title: p.title || "", content: p.content || "", is_published: p.is_published ?? 1 }));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast("error", "El título es requerido"); return; }
    setSaving(true);
    try {
      if (isEdit) await api.put(`/legal/${id}`, form);
      else await api.post("/legal", form);
      showToast("success", isEdit ? "Página actualizada" : "Página creada");
      navigate("/legal");
    } catch { showToast("error", "Error al guardar"); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title={isEdit ? "Editar Página Legal" : "Nueva Página Legal"} description={isEdit ? "Modifica el contenido legal." : "Agrega una nueva página legal."}
        breadcrumbs={[{ label: "Legales", to: "/legal" }, { label: isEdit ? "Editar" : "Nuevo" }]} icon={<BookOpen size={20} />}
        action={<button onClick={() => navigate("/legal")} className="mp-btn-ghost text-xs"><ArrowLeft size={14} /> Volver</button>} />
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="mp-card p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Título *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mp-input text-sm" placeholder="Ej: Aviso de Privacidad" required />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <span className="text-xs text-[var(--mp-text-secondary)]">Publicado</span>
              <button type="button" onClick={() => setForm({ ...form, is_published: form.is_published === 1 ? 0 : 1 })}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.is_published === 1 ? "bg-[var(--mp-success)]" : "bg-[var(--mp-bg-elevated)]"}`}>
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_published === 1 ? "translate-x-5" : ""}`} />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Contenido</label>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="mp-input text-sm min-h-[300px] font-mono" placeholder="Escribe el contenido aquí..." />
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate("/legal")} className="mp-btn-ghost text-xs">Cancelar</button>
          <button type="submit" disabled={saving} className="mp-btn-primary text-xs"><Save size={14} /> {saving ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}</button>
        </div>
      </form>
    </div>
  );
}
