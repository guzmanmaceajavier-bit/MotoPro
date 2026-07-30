import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import { Input } from "@shared/components/ui/Input";
import { Textarea } from "@shared/components/ui/Textarea";
import { Button } from "@shared/components/ui/Button";
import { Badge } from "@shared/components/ui/Badge";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import IconPicker, { ICON_LIBRARY } from "@/components/icons/IconPicker";
import { Save, Wrench, Plus, X, Check, BookOpen } from "lucide-react";

const accentOptions = ["#F59E0B","#F97316","#0EA5E9","#8B5CF6","#10B981","#EC4899","#6366F1","#FF6B00"];

const iconEntries = Object.entries(ICON_LIBRARY).map(([value, icon]) => ({ value, icon }));
const icons = iconEntries;

export default function ServiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { showToast } = useToast();
  const [form, setForm] = useState({ title: "", slug: "", description: "", icon: "wrench", icon_type: "lucide" as "lucide" | "svg", price: "", duration: "", is_active: "1", accent: "#F59E0B", category: "" });
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{id: string; name: string}[]>([]);

  useEffect(() => {
    api.get("/service-categories").then(r => setCategories(r || []));
  }, []);

  useEffect(() => {
    if (isEdit) api.get(`/services/${id}`).then((s) => {
      const f = Array.isArray(s.features) ? s.features : [];
      setForm({
        title: s.title,
        slug: s.slug,
        description: s.description || "",
        icon: s.icon || "wrench",
        icon_type: s.icon_type || "lucide",
        price: s.price ? String(s.price) : "",
        duration: s.duration || "",
        is_active: String(s.is_active),
        accent: s.accent || "#F59E0B",
        category: s.category || ""
      });
      setFeatures(f);
    });
  }, [id]);

  const addFeature = () => {
    const f = featureInput.trim();
    if (f && !features.includes(f)) { setFeatures([...features, f]); setFeatureInput(""); }
  };

  const removeFeature = (f: string) => setFeatures(features.filter(x => x !== f));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); addFeature(); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        features: JSON.stringify(features),
        price: form.price ? parseFloat(form.price) : null,
        is_active: parseInt(form.is_active)
      };
      if (isEdit) await api.put(`/services/${id}`, data);
      else await api.post("/services", data);
      showToast("success", "Servicio guardado");
      navigate("/services");
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); } finally { setSaving(false); }
  };

  const activeIcon = icons.find((i) => i.value === form.icon);
  const PreviewIcon = activeIcon?.icon || Wrench;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={isEdit ? "Editar Servicio" : "Nuevo Servicio"}
        description={isEdit ? "Actualiza los datos del servicio" : "Agrega un nuevo servicio al taller"}
        backTo="/services"
        breadcrumbs={[{ label: "Servicios", to: "/services" }, { label: isEdit ? "Editar Servicio" : "Nuevo Servicio" }]}
        icon={<Wrench size={20} />}
        action={<button type="button" className="mp-btn-ghost text-xs"><BookOpen size={14} /> Guía rápida</button>}
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <SectionCard title="Ícono del servicio">
              <IconPicker
                value={form.icon}
                onChange={(value) => setForm({ ...form, icon: value })}
                type={form.icon_type}
                onTypeChange={(type) => setForm({ ...form, icon_type: type })}
                label="Seleccionar icono"
              />
            </SectionCard>

            <SectionCard title="Color del servicio">
              <div className="flex flex-wrap gap-2 mb-3">
                {accentOptions.map((c) => (
                  <button key={c} type="button" onClick={() => setForm(p => ({ ...p, accent: c }))}
                    className="w-8 h-8 rounded-lg transition-all active:scale-[0.97]"
                    style={{ background: c, boxShadow: form.accent === c ? `0 0 0 3px ${c}, 0 0 0 5px var(--mp-bg-surface), 0 0 20px ${c}40` : "none", transform: form.accent === c ? "scale(1.15)" : "scale(1)", borderRadius: form.accent === c ? "50%" : "8px" }} />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input type="text" placeholder="#F59E0B" maxLength={7} inputSize="sm"
                  value={form.accent} onChange={(e) => setForm(p => ({ ...p, accent: e.target.value }))} />
                <label className="relative w-10 h-10 rounded-xl shrink-0 overflow-hidden cursor-pointer border-2 border-[var(--mp-border)]">
                  <input type="color" className="absolute inset-0 w-[200%] h-[200%] -left-1/2 -top-1/2 cursor-pointer" value={form.accent} onChange={(e) => setForm(p => ({ ...p, accent: e.target.value }))} />
                  <div className="w-full h-full pointer-events-none rounded-xl" style={{ background: form.accent }} />
                </label>
              </div>
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Información del servicio">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Título del servicio</label>
                  <div className="relative">
                    <PreviewIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required placeholder="Ej: Mantenimiento Preventivo"
                      className="mp-input pl-9" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Slug</label>
                    <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder="mantenimiento"
                      className="mp-input" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Categoría</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="mp-input">
                      <option value="">Sin categoría</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Precio</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] text-sm">$</span>
                    <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="0.00"
                      className="mp-input pl-7" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Duración</label>
                  <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="2 horas"
                    className="mp-input" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Descripción</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3} placeholder="Describe el servicio en detalle..."
                    className="mp-input resize-none" />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Características del servicio">
              <div className="flex gap-2 mb-3">
                <input placeholder="Ej: Revisión de frenos" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyDown={handleKeyDown}
                  className="mp-input flex-1" />
                <button type="button" onClick={addFeature} className="px-4 py-2 rounded-xl font-medium text-white text-sm transition-all active:scale-[0.97]"
                  style={{ background: form.accent }}>
                  <Plus size={16} />
                </button>
              </div>
              {features.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {features.map((f) => (
                    <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium group"
                      style={{ background: `${form.accent}10`, color: form.accent }}>
                      <Check size={12} strokeWidth={3} />{f}
                      <button type="button" onClick={() => removeFeature(f)} className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-[var(--mp-danger)]"><X size={12} /></button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 rounded-xl bg-[var(--mp-bg-elevated)] border border-dashed border-[var(--mp-border)]">
                  <p className="text-xs text-[var(--mp-text-tertiary)]">Agrega características del servicio</p>
                </div>
              )}
            </SectionCard>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-[var(--mp-border)] mt-6">
          <button type="button" onClick={() => navigate("/services")} className="mp-btn-ghost text-xs">
            Cancelar
          </button>
          <div className="flex items-center gap-3">
            <button type="button" onClick={async () => {
              setSaving(true);
              try {
                const data = {
                  ...form,
                  features: JSON.stringify(features),
                  price: form.price ? parseFloat(form.price) : null,
                  is_active: parseInt(form.is_active)
                };
                await api.post("/services", data);
                showToast("success", "Servicio creado, creando otro...");
                setForm({ title: "", slug: "", description: "", icon: "wrench", icon_type: "lucide", price: "", duration: "", is_active: "1", accent: "#F59E0B" });
                setFeatures([]);
              } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); } finally { setSaving(false); }
            }} className="mp-btn-ghost text-xs">
              Guardar y crear otro
            </button>
            <button type="submit" disabled={saving || !form.title.trim()} className="mp-btn-primary text-xs">
              {saving ? "Guardando..." : isEdit ? "Actualizar Servicio" : "Crear Servicio"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}