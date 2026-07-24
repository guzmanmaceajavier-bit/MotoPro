import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, ArrowLeft, Plus, Info, Link as LinkIcon, Tag, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/Toast";
import { api } from "@/api/client";

export default function NavbarItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [form, setForm] = useState({
    label: "",
    link: "",
    icon: "",
    is_visible: 1,
    is_mega_menu: 0,
    sort_order: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get("/cms/navbar").then((res) => {
        const items = Array.isArray(res) ? res : res?.data || [];
        const found = items.find((it: any) => String(it.id) === String(id));
        if (found) {
          setForm({
            label: found.label || "",
            link: found.link || "",
            icon: found.icon || "",
            is_visible: found.is_visible ?? 1,
            is_mega_menu: found.is_mega_menu ?? 0,
            sort_order: found.sort_order ?? 0,
          });
        }
      }).catch(() => showToast("error", "Error al cargar item"));
    }
  }, [id, isEdit]);

  const handleSave = async () => {
    if (!form.label.trim()) {
      showToast("error", "La etiqueta es requerida");
      return;
    }
    if (!form.link.trim()) {
      showToast("error", "El enlace es requerido");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/cms/navbar/${id}`, form);
        showToast("success", "Item actualizado correctamente");
      } else {
        await api.post("/cms/navbar", form);
        showToast("success", "Item creado correctamente");
      }
      navigate("/navbar");
    } catch {
      showToast("error", "Error al guardar el item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/navbar")} className="p-2 rounded-xl hover:bg-[var(--mp-bg-elevated)] transition-all text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)]">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--mp-accent)] to-[#8B5CF6] flex items-center justify-center">
            <Plus size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--mp-text-primary)]">{isEdit ? "Editar item" : "Nuevo item"}</h1>
            <p className="text-sm text-[var(--mp-text-tertiary)]">Agrega o modifica un elemento del menu de navegacion</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="mp-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-[var(--mp-text-primary)] border-b border-[var(--mp-border)] pb-3">Informacion basica</h3>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Tag size={13} className="text-[var(--mp-text-tertiary)]" />
                <label className="text-xs font-medium text-[var(--mp-text-secondary)]">Etiqueta</label>
                <div className="group relative">
                  <Info size={12} className="text-[var(--mp-text-tertiary)] cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[var(--mp-bg-dark)] text-white text-[11px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-10">
                    Texto que se muestra en el menu
                  </div>
                </div>
              </div>
              <input
                type="text"
                className="mp-input text-sm w-full"
                placeholder="Ej. Tienda, Servicios, Blog..."
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <LinkIcon size={13} className="text-[var(--mp-text-tertiary)]" />
                <label className="text-xs font-medium text-[var(--mp-text-secondary)]">Enlace</label>
              </div>
              <input
                type="text"
                className="mp-input text-sm w-full"
                placeholder="Ej. /tienda, /servicios, https://ejemplo.com"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Info size={13} className="text-[var(--mp-text-tertiary)]" />
                <label className="text-xs font-medium text-[var(--mp-text-secondary)]">Icono (opcional)</label>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="mp-input text-sm flex-1"
                  placeholder="Selecciona un icono o escribe su nombre"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                />
                <button type="button" className="px-4 py-2 rounded-xl bg-[var(--mp-bg-elevated)] border border-[var(--mp-border)] text-xs font-medium text-[var(--mp-text-secondary)] hover:text-[var(--mp-text-primary)] hover:border-[var(--mp-border-hover)] transition-all">
                  Explorar
                </button>
              </div>
            </div>
          </div>

          <div className="mp-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-[var(--mp-text-primary)] border-b border-[var(--mp-border)] pb-3">Opciones</h3>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--mp-bg-elevated)]">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.is_visible ? "bg-[var(--mp-accent)]/10" : "bg-[var(--mp-bg-hover)]"}`}>
                  {form.is_visible ? <Eye size={15} className="text-[var(--mp-accent)]" /> : <EyeOff size={15} className="text-[var(--mp-text-tertiary)]" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--mp-text-primary)]">{form.is_visible ? "Visible" : "Oculto"}</p>
                  <p className="text-[11px] text-[var(--mp-text-tertiary)]">{form.is_visible ? "Se muestra en el menu" : "Oculto para los visitantes"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, is_visible: form.is_visible ? 0 : 1 })}
                className={`w-11 h-6 rounded-full transition-all relative ${form.is_visible ? "bg-[var(--mp-accent)]" : "bg-[var(--mp-bg-hover)]"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_visible ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--mp-bg-elevated)]">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.is_mega_menu ? "bg-[#8B5CF6]/10" : "bg-[var(--mp-bg-hover)]"}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={form.is_mega_menu ? "#8B5CF6" : "var(--mp-text-tertiary)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--mp-text-primary)]">Mega menu</p>
                  <p className="text-[11px] text-[var(--mp-text-tertiary)]">Muestra subcategorias en un panel ampliado</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, is_mega_menu: form.is_mega_menu ? 0 : 1 })}
                className={`w-11 h-6 rounded-full transition-all relative ${form.is_mega_menu ? "bg-[#8B5CF6]" : "bg-[var(--mp-bg-hover)]"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_mega_menu ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="mp-card p-5 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--mp-accent)] to-[#8B5CF6] flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Plus size={32} className="text-white" />
            </div>
            <h4 className="text-sm font-bold text-[var(--mp-text-primary)] mb-1">Nuevo item</h4>
            <p className="text-xs text-[var(--mp-text-tertiary)] leading-relaxed">
              Los items del menu aparecen en la barra de navegacion de tu sitio. Puedes reordenarlos, ocultarlos o configurar mega menus.
            </p>
          </div>

          <div className="mp-card p-5 space-y-3">
            <h4 className="text-xs font-bold text-[var(--mp-text-primary)]">Consejos</h4>
            <div className="space-y-2">
              {[
                "Usa etiquetas cortas como 'Tienda', 'Blog', 'Contacto'",
                "Los enlaces pueden ser internos (/servicios) o externos (https://...)",
                "Los mega menus son ideales para categorias con subcategorias",
                "Puedes ocultar items sin eliminarlos",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[var(--mp-text-tertiary)]">
                  <div className="w-1 h-1 rounded-full bg-[var(--mp-accent)] mt-1.5 flex-shrink-0" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 p-4 mp-card">
        <button onClick={() => navigate("/navbar")} className="mp-btn-ghost text-sm border border-[var(--mp-border)]">
          Cancelar
        </button>
        <button onClick={handleSave} disabled={saving} className="mp-btn-primary text-sm">
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <><Save size={14} /> {isEdit ? "Guardar cambios" : "Guardar item"}</>
          )}
        </button>
      </div>
    </div>
  );
}
