import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/api/client";
import { Save, ArrowLeft, Shield } from "lucide-react";
import { useToast } from "@/components/Toast";
import PageHeader from "@/components/PageHeader";

const iconOptions = ["shield", "star", "zap", "award", "thumbsUp", "clock", "checkCircle", "truck", "lock", "headphones", "refreshCw", "heart"];
const pageOptions = ["", "home", "shop", "contact", "services"];

export default function TrustItemForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", icon: "shield", page: "", is_active: 1, sort_order: 0 });

  useEffect(() => {
    if (isEdit) api.get(`/trust-items/${id}`).then(v => {
      setForm({ title: v.title || "", description: v.description || "", icon: v.icon || "shield", page: v.page || "", is_active: v.is_active ?? 1, sort_order: v.sort_order || 0 });
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast("error", "El título es requerido"); return; }
    setSaving(true);
    try {
      if (isEdit) await api.put(`/trust-items/${id}`, form);
      else await api.post("/trust-items", form);
      showToast("success", isEdit ? "Elemento actualizado" : "Elemento creado");
      navigate("/trust-items");
    } catch { showToast("error", "Error al guardar"); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title={isEdit ? "Editar Elemento" : "Nuevo Elemento"} description={isEdit ? "Modifica el elemento de confianza." : "Agrega un nuevo elemento de confianza."}
        breadcrumbs={[{ label: "Confianza", to: "/trust-items" }, { label: isEdit ? "Editar" : "Nuevo" }]} icon={<Shield size={20} />}
        action={<button onClick={() => navigate("/trust-items")} className="mp-btn-ghost text-xs"><ArrowLeft size={14} /> Volver</button>} />
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="mp-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Información</h3>
            <div>
              <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Título *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mp-input text-sm" placeholder="Ej: Garantía" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Descripción</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mp-input text-sm min-h-[100px]" placeholder="Describe este elemento..." />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="mp-card p-6">
            <h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-4">Icono</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {iconOptions.map(ico => (
                <button key={ico} type="button" onClick={() => setForm({ ...form, icon: ico })}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${form.icon === ico ? "bg-interactive-accent text-white ring-2 ring-interactive-accent ring-offset-2" : "bg-[var(--mp-bg-elevated)] text-[var(--mp-text-tertiary)] hover:bg-[var(--mp-bg-hover)]"}`}>
                  <Shield size={18} />
                </button>
              ))}
            </div>
          </div>
          <div className="mp-card p-6">
            <h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-4">Configuración</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Mostrar en página</label>
                <select value={form.page} onChange={e => setForm({ ...form, page: e.target.value })} className="mp-input text-sm">
                  <option value="">Todas las páginas</option>
                  <option value="home">Inicio</option>
                  <option value="shop">Tienda</option>
                  <option value="contact">Contacto</option>
                  <option value="services">Servicios</option>
                </select>
              </div>
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
            <button type="button" onClick={() => navigate("/trust-items")} className="mp-btn-ghost flex-1 text-xs">Cancelar</button>
            <button type="submit" disabled={saving} className="mp-btn-primary flex-1 text-xs"><Save size={14} /> {saving ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
