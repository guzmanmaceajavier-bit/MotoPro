import { useState, useEffect, useMemo } from "react";
import { api } from "@/api/client";
import { Search, Globe, Save } from "lucide-react";
import { useToast } from "@/components/Toast";
import PageHeader from "@/components/PageHeader";

const defaultPages = [
  { page: "home", label: "Inicio" },
  { page: "services", label: "Servicios" },
  { page: "shop", label: "Tienda" },
  { page: "blog", label: "Blog" },
  { page: "about", label: "Nosotros" },
  { page: "contact", label: "Contacto" },
  { page: "gallery", label: "Galería" },
  { page: "faq", label: "FAQ" },
  { page: "login", label: "Iniciar Sesión" },
  { page: "register", label: "Registro" },
];

export default function SeoPage() {
  const [configs, setConfigs] = useState<Record<string, any>>({});
  const [selected, setSelected] = useState("home");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});
  const { showToast } = useToast();

  useEffect(() => {
    api.get("/cms/seo").then(r => {
      const arr = Array.isArray(r) ? r : [];
      const map: Record<string, any> = {};
      arr.forEach(c => { map[c.page] = c; });
      setConfigs(map);
    }).catch(() => {});
  }, []);

  const filteredPages = useMemo(() => {
    if (!search.trim()) return defaultPages;
    return defaultPages.filter(p => p.label.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  useEffect(() => {
    const existing = configs[selected];
    setForm(existing ? {
      meta_title: existing.meta_title || "",
      meta_description: existing.meta_description || "",
      keywords: existing.keywords || "",
      og_title: existing.og_title || "",
      og_description: existing.og_description || "",
      og_image: existing.og_image || "",
      canonical_url: existing.canonical_url || "",
      robots: existing.robots || "index, follow",
    } : {
      meta_title: "", meta_description: "", keywords: "", og_title: "", og_description: "",
      og_image: "", canonical_url: "", robots: "index, follow",
    });
  }, [selected, configs]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/cms/seo/${selected}`, form);
      showToast("success", "SEO actualizado");
      const { data } = await api.get("/cms/seo");
      const arr = Array.isArray(data) ? data : [];
      const map: Record<string, any> = {};
      arr.forEach(c => { map[c.page] = c; });
      setConfigs(map);
    } catch { showToast("error", "Error al guardar"); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="SEO" description="Configura el SEO de cada página del sitio." breadcrumbs={[{ label: "Contenido", to: "/seo" }, { label: "SEO" }]} icon={<Globe size={20} />} />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar página..." className="mp-input pl-9 text-sm" />
          </div>
          <div className="space-y-1">
            {filteredPages.map(p => (
              <button key={p.page} onClick={() => setSelected(p.page)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${selected === p.page ? "bg-interactive-accent text-white" : "text-[var(--mp-text-secondary)] hover:bg-[var(--mp-bg-elevated)]"}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="lg:col-span-3 space-y-6">
          <div className="mp-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-[var(--mp-text-primary)] capitalize">{defaultPages.find(p => p.page === selected)?.label} — SEO</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Meta Title</label>
                <input value={form.meta_title || ""} onChange={e => setForm({ ...form, meta_title: e.target.value })} className="mp-input text-sm" placeholder="Título SEO" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Meta Description</label>
                <textarea value={form.meta_description || ""} onChange={e => setForm({ ...form, meta_description: e.target.value })} className="mp-input text-sm min-h-[80px]" placeholder="Descripción SEO" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Keywords</label>
                <input value={form.keywords || ""} onChange={e => setForm({ ...form, keywords: e.target.value })} className="mp-input text-sm" placeholder="palabras, clave, separadas" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Robots</label>
                <select value={form.robots || "index, follow"} onChange={e => setForm({ ...form, robots: e.target.value })} className="mp-input text-sm">
                  <option value="index, follow">index, follow</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="index, nofollow">index, nofollow</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Canonical URL</label>
                <input value={form.canonical_url || ""} onChange={e => setForm({ ...form, canonical_url: e.target.value })} className="mp-input text-sm" placeholder="https://..." />
              </div>
            </div>
            <h4 className="text-xs font-bold text-[var(--mp-text-primary)] pt-2">Open Graph</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">OG Title</label>
                <input value={form.og_title || ""} onChange={e => setForm({ ...form, og_title: e.target.value })} className="mp-input text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">OG Description</label>
                <textarea value={form.og_description || ""} onChange={e => setForm({ ...form, og_description: e.target.value })} className="mp-input text-sm min-h-[60px]" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">OG Image URL</label>
                <input value={form.og_image || ""} onChange={e => setForm({ ...form, og_image: e.target.value })} className="mp-input text-sm" placeholder="https://..." />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving} className="mp-btn-primary text-xs"><Save size={14} /> {saving ? "Guardando..." : "Guardar SEO"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
