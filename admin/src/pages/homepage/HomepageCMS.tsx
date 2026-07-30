import { useState, useEffect } from "react";
import { GripVertical, Eye, EyeOff, ChevronDown, Plus, Link2, Upload, Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/Toast";
import { api, uploadFile } from "@/api/client";
import { HomepageSection } from "../../../../shared/types";
import PageHeader from "@/components/PageHeader";

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero", brand_selector: "Selector de Marca", brands: "Marcas", categories: "Categorias",
  why_us: "Por que MotoPro?", services: "Servicios", promotions: "Promociones",
  featured_products: "Productos Destacados", values: "Valores", before_after: "Antes y Despues",
  stats: "Estadisticas", gallery: "Galeria", team: "Equipo", testimonials: "Testimonios",
  blog: "Blog", faq: "FAQ", contact: "Contacto",
};

const SECTION_DESCRIPTIONS: Record<string, string> = {
  hero: "Presentacion principal del sitio", brand_selector: "Selector de marca para productos",
  brands: "Listado de marcas destacadas", categories: "Explora nuestras categorias",
  why_us: "Beneficios y razones para elegirnos", services: "Nuestros servicios especializados",
  promotions: "Ofertas y promociones vigentes", featured_products: "Productos mas populares",
  values: "Nuestros valores y compromiso", before_after: "Galeria antes y despues",
  stats: "Estadisticas del negocio", gallery: "Galeria de imagenes",
  team: "Nuestro equipo de trabajo", testimonials: "Opiniones de clientes",
  blog: "Articulos del blog", faq: "Preguntas frecuentes", contact: "Formulario de contacto",
};

const SECTION_SVG_ICONS: Record<string, JSX.Element> = {
  brands: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>,
  categories: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>,
  why_us: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  services: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  promotions: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  featured_products: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>,
  values: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
  hero: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
};

const SECTION_COLORS: Record<string, string> = {
  hero: "#6366F1", brands: "#8B5CF6", categories: "#3B82F6", why_us: "#FF6B00",
  services: "#10B981", promotions: "#F59E0B", featured_products: "#EF4444", values: "#EC4899",
};

export default function HomepageCMS() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string>("hero");
  const [activeTab, setActiveTab] = useState<"sections" | "settings">("sections");
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchSections = async () => {
    setLoading(true);
    try { const res = await api.get("/cms/homepage"); setSections(Array.isArray(res) ? res : res?.data || []); }
    catch { showToast("error", "Error al cargar secciones"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSections(); }, []);

  const updateSection = (key: string, field: string, value: any) => {
    setSections((prev) => prev.map((s) => (s.section_key === key ? { ...s, [field]: value } : s)));
  };

  const saveSection = async (section: HomepageSection) => {
    setSaving(section.section_key);
    try {
      await api.put(`/cms/homepage/${section.section_key}`, {
        title: section.title, subtitle: section.subtitle, description: section.description,
        image: section.image, button_text: section.button_text, button_link: section.button_link,
        is_visible: section.is_visible, sort_order: section.sort_order, settings_json: section.settings_json,
      });
      showToast("success", "Seccion guardada");
    } catch { showToast("error", "Error al guardar"); }
    finally { setSaving(null); }
  };

  const toggleVisibility = async (section: HomepageSection) => {
    const updated = { ...section, is_visible: section.is_visible ? 0 : 1 };
    updateSection(section.section_key, "is_visible", updated.is_visible);
    try { await api.put(`/cms/homepage/${section.section_key}`, { is_visible: updated.is_visible }); }
    catch { updateSection(section.section_key, "is_visible", section.is_visible); }
  };

  const moveSection = async (idx: number, dir: "up" | "down") => {
    const newIdx = dir === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= sections.length) return;
    const newSections = [...sections];
    [newSections[idx], newSections[newIdx]] = [newSections[newIdx], newSections[idx]];
    newSections.forEach((s, i) => (s.sort_order = i));
    setSections(newSections);
    await api.put("/cms/homepage/order/reorder", { items: newSections.map((s) => ({ id: s.id, sort_order: s.sort_order })) }).catch(() => {});
  };

  if (loading) return (
    <div className="animate-fade-in space-y-4">
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
      {[1, 2, 3, 4, 5].map(i => <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 h-20 animate-pulse" />)}
    </div>
  );

  const expandedSection = sections.find(s => s.section_key === expanded);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Homepage</h1>
          <p className="text-sm text-gray-400">Gestiona las secciones de tu sitio web</p>
        </div>
        <button onClick={() => navigate("/homepage/new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
          style={{ background: "var(--mp-accent)" }}>
          <Plus size={16} /> Nueva seccion
        </button>
      </div>

      <div className="flex items-center gap-1 mt-5 mb-5 border-b border-gray-200">
        <button onClick={() => setActiveTab("sections")} type="button"
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === "sections" ? "border-[var(--mp-accent)] text-[var(--mp-accent)]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
          Secciones del sitio
        </button>
        <button onClick={() => setActiveTab("settings")} type="button"
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === "settings" ? "border-[var(--mp-accent)] text-[var(--mp-accent)]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
          Configuracion general
        </button>
        <div className="ml-auto flex items-center gap-1 text-gray-400">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
          <span className="text-xs font-medium">Ayuda</span>
        </div>
      </div>

      {activeTab === "sections" && (
        <>
          {expandedSection && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 mb-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Informacion de la seccion</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1.5 block">Titulo</label>
                      <input type="text" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)]"
                        value={expandedSection.title} onChange={(e) => updateSection(expanded.section_key, "title", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1.5 block">Subtitulo</label>
                      <input type="text" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)]"
                        value={expandedSection.subtitle} onChange={(e) => updateSection(expanded.section_key, "subtitle", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">Descripcion</label>
                    <textarea className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)]"
                      rows={2} value={expandedSection.description} onChange={(e) => updateSection(expanded.section_key, "description", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1.5 block">Texto del boton</label>
                      <input type="text" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)]"
                        value={expandedSection.button_text} onChange={(e) => updateSection(expanded.section_key, "button_text", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1.5 block">Enlace del boton</label>
                      <div className="relative">
                        <input type="text" className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)]"
                          value={expandedSection.button_link} onChange={(e) => updateSection(expanded.section_key, "button_link", e.target.value)} />
                        <Link2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">Imagen de fondo</label>
                    <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-[var(--mp-border)] cursor-pointer hover:border-[var(--mp-accent)] transition-colors">
                      <Upload size={16} className="text-[var(--mp-text-tertiary)]" />
                      <span className="text-sm text-[var(--mp-text-secondary)]">Subir archivo</span>
                      <span className="text-xs text-[var(--mp-text-tertiary)]">o arrastra y suelta</span>
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const res = await uploadFile("/upload", file, "taller-motos/homepage");
                          const url = res.data?.url || res.url || res.image || "";
                          if (url) updateSection(expanded.section_key, "image", url);
                        } catch { showToast("error", "Error al subir imagen"); }
                      }} />
                    </label>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={() => saveSection(expandedSection)} disabled={saving === expanded.section_key}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
                      style={{ background: "var(--mp-accent)" }}>
                      {saving === expanded.section_key ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="w-full aspect-video rounded-xl overflow-hidden bg-gray-900 relative">
                    {expandedSection.image ? (
                      <img src={expandedSection.image} alt={expandedSection.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/50 text-white text-xs font-medium backdrop-blur-sm">
                      <Eye size={13} /> Vista previa
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {sections.map((section, idx) => {
              const isActive = expanded === section.section_key;
              return (
                <div key={section.id} className={`rounded-xl border bg-white transition-all ${isActive ? "border-[var(--mp-accent)] shadow-sm" : "border-gray-200 hover:border-gray-300"}`}>
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <GripVertical size={16} className="shrink-0 text-gray-300 cursor-grab" />
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${SECTION_COLORS[section.section_key] || "#6B7280"}12`, color: SECTION_COLORS[section.section_key] || "#6B7280" }}>
                      {SECTION_SVG_ICONS[section.section_key] || <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{SECTION_LABELS[section.section_key] || section.section_key}</p>
                      <p className="text-xs text-gray-400 truncate">{SECTION_DESCRIPTIONS[section.section_key] || section.title || "Sin titulo"}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${section.is_visible ? "bg-teal-50 text-[var(--mp-accent)]" : "bg-gray-100 text-gray-400"}`}>
                      {section.is_visible ? "Activo" : "Inactivo"}
                    </span>
                    <span className="w-px h-5 bg-gray-200" />
                    <button onClick={() => { setExpanded(isActive ? "" : section.section_key); }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                      type="button" title="Editar">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    <button onClick={() => setExpanded(isActive ? "" : section.section_key)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                      type="button">
                      <ChevronDown size={16} className="transition-transform" style={{ transform: isActive ? "rotate(180deg)" : "" }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === "settings" && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-400">Configuracion general del sitio web (proximamente)</p>
        </div>
      )}
    </div>
  );
}
