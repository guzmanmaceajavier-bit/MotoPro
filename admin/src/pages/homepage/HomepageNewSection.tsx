import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Link2, HelpCircle } from "lucide-react";
import { useToast } from "@/components/Toast";
import { api, uploadFile } from "@/api/client";

const SECTION_OPTIONS = [
  { key: "hero", label: "Hero" },
  { key: "brands", label: "Marcas" },
  { key: "categories", label: "Categorias" },
  { key: "why_us", label: "Por que MotoPro?" },
  { key: "services", label: "Servicios" },
  { key: "promotions", label: "Promociones" },
  { key: "featured_products", label: "Productos Destacados" },
  { key: "values", label: "Valores" },
  { key: "testimonials", label: "Testimonios" },
  { key: "gallery", label: "Galeria" },
  { key: "team", label: "Equipo" },
  { key: "stats", label: "Estadisticas" },
  { key: "blog", label: "Blog" },
  { key: "faq", label: "FAQ" },
  { key: "contact", label: "Contacto" },
];

const ICON_OPTIONS = ["home", "star", "wrench", "tag", "heart", "box", "users", "message", "image", "help"];

export default function HomepageNewSection() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    section_key: "", title: "", subtitle: "", description: "",
    button_text: "", button_link: "", image: "", icon: "help", is_visible: 1,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim()) { showToast("error", "El titulo es requerido"); return; }
    if (!form.section_key) { showToast("error", "Selecciona un tipo de seccion"); return; }
    setSaving(true);
    try {
      await api.post("/cms/homepage", { ...form, sort_order: 99, settings_json: "" });
      showToast("success", "Seccion creada correctamente");
      navigate("/homepage");
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Error al crear");
    } finally { setSaving(false); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span className="hover:text-gray-600 cursor-pointer" onClick={() => navigate("/homepage")}>Homepage</span>
            <span>&gt;</span>
            <span className="hover:text-gray-600 cursor-pointer" onClick={() => navigate("/homepage")}>Secciones</span>
            <span>&gt;</span>
            <span className="text-gray-600 font-medium">Nueva seccion</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Nueva seccion</h1>
          <p className="text-sm text-gray-400">Crea una nueva seccion para tu sitio web</p>
        </div>
        <button onClick={() => navigate("/homepage")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors bg-white">
          <ArrowLeft size={15} /> Volver a secciones
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-5">Informacion de la seccion</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  Titulo de la seccion <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej. Nuestros servicios"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)]" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Subtitulo</label>
                <input type="text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="Ej. Calidad y confianza en cada servicio"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)]" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Descripcion</label>
              <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe el contenido o proposito de esta seccion..."
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Texto del boton</label>
                <input type="text" value={form.button_text} onChange={(e) => setForm({ ...form, button_text: e.target.value })}
                  placeholder="Ej. Agendar cita"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)]" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Enlace del boton</label>
                <div className="relative">
                  <input type="text" value={form.button_link} onChange={(e) => setForm({ ...form, button_link: e.target.value })}
                    placeholder="Ej. /agendar-servicio"
                    className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)]" />
                  <Link2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Icono (opcional)</label>
              <p className="text-xs text-gray-400 mb-2">Selecciona un icono que represente esta seccion.</p>
              <div className="relative">
                <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-full appearance-none pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)] cursor-pointer">
                  {ICON_OPTIONS.map(i => <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>)}
                </select>
                <HelpCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">Imagen de la seccion</label>
            <p className="text-xs text-[var(--mp-text-tertiary)] mb-3">Esta imagen se mostrara como fondo o encabezado de la seccion.</p>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--mp-border)] rounded-xl p-8 cursor-pointer hover:border-[var(--mp-accent)] transition-colors">
              <Upload size={28} className="text-[var(--mp-text-tertiary)] mb-2" />
              <span className="text-sm font-medium text-[var(--mp-text-primary)]">Subir imagen</span>
              <span className="text-xs text-[var(--mp-text-tertiary)] mt-0.5">o arrastra y suelta</span>
              <span className="text-[11px] text-[var(--mp-text-tertiary)] mt-3">Formatos: JPG, PNG, WebP (max. 2MB)</span>
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const res = await uploadFile("/upload", file, "taller-motos/homepage");
                  const url = res.data?.url || res.url || res.image || "";
                  if (url) setForm({ ...form, image: url });
                } catch { showToast("error", "Error al subir imagen"); }
              }} />
            </label>
            {form.image && (
              <div className="mt-3 relative">
                <img src={form.image} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                <button type="button" onClick={() => setForm({ ...form, image: "" })}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center text-xs hover:bg-red-500">
                  X
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between py-5 mt-6 border-t border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-900">Estado de la seccion</p>
            <p className="text-xs text-gray-400">Activa o desactiva la visibilidad de esta seccion en tu sitio web.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">Activa</span>
            <button type="button" onClick={() => setForm({ ...form, is_visible: form.is_visible ? 0 : 1 })}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{ background: form.is_visible ? "var(--mp-accent)" : "#D1D5DB" }}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${form.is_visible ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6">
        <button onClick={() => navigate("/homepage")}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-colors"
          style={{ background: "var(--mp-accent)" }}>
          {saving ? "Creando..." : "Crear seccion"}
        </button>
      </div>
    </div>
  );
}
