import { useState, useEffect } from "react";
import { api, uploadFile } from "@/api/client";
import { useToast } from "@/components/Toast";
import { downloadCSV, downloadExcel } from "@/utils/export";
import {
  Plus, Layers, Edit3, Trash2, Image, Eye, EyeOff,
  GripVertical, Search, Grid3X3, List, Copy, Link2, ImagePlus, X,
  ChevronUp, ChevronDown, Check
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@shared/components/ui/KpiCard";
import { Pagination } from "@shared/components/ui/Pagination";

interface SlideItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  gradient: string;
  cta_text: string;
  cta_link: string;
  sort_order: number;
  is_active: number;
  overlay_color?: string;
  overlay_opacity?: number;
}

const tabs = [{ key: "hero", label: "Hero" }, { key: "offers", label: "Ofertas" }];

const overlayColors = ["#000000", "#1E40AF", "#059669", "#9333EA", "#F97316", "#DC2626"];

const emptyForm = {
  title: "", subtitle: "", description: "", image: "", gradient: "",
  cta_text: "", cta_link: "", is_active: "1", sort_order: "1",
  overlay_color: "#000000", overlay_opacity: "60"
};

export default function SlidersPage() {
  const [activeTab, setActiveTab] = useState("hero");
  const [items, setItems] = useState<SlideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<SlideItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [page, setPage] = useState(1);
  const { showToast } = useToast();

  const PAGE_SIZE = 10;

  const endpoint = activeTab === "hero" ? "/hero" : "/offers";
  const fetchData = () => {
    setLoading(true);
    api.get(endpoint).then((r) => setItems(Array.isArray(r) ? r : [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, [activeTab]);
  useEffect(() => { setPage(1); }, [search, statusFilter, activeTab]);

  const sorted = [...items]
    .filter(i => {
      if (statusFilter === "active" && !i.is_active) return false;
      if (statusFilter === "inactive" && i.is_active) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(i.title || "").toLowerCase().includes(q) && !(i.subtitle || "").toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const total = sorted.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const activeCount = items.filter(i => i.is_active).length;

  const openNew = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (item: SlideItem) => {
    setEditing(item);
    setForm({
      title: item.title || "", subtitle: item.subtitle || "", description: item.description || "",
      image: item.image || "", gradient: item.gradient || "", cta_text: item.cta_text || "",
      cta_link: item.cta_link || "", is_active: String(item.is_active ?? "1"),
      sort_order: String(item.sort_order ?? "1"),
      overlay_color: item.overlay_color || "#000000",
      overlay_opacity: String(item.overlay_opacity ?? 60)
    });
    setModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form, is_active: Number(form.is_active), sort_order: Number(form.sort_order),
        overlay_opacity: Number(form.overlay_opacity)
      };
      if (editing) { await api.put(`${endpoint}/${editing.id}`, payload); showToast("success", "Actualizado correctamente"); }
      else { await api.post(endpoint, payload); showToast("success", "Creado correctamente"); }
      setModal(false); fetchData();
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error al guardar"); }
  };

  const handleDelete = async (item: SlideItem) => {
    if (!confirm("¿Eliminar este slide?")) return;
    try { await api.delete(`${endpoint}/${item.id}`); showToast("success", "Eliminado correctamente"); fetchData(); }
    catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error al eliminar"); }
  };

  const handleToggleActive = async (item: SlideItem) => {
    try { await api.put(`${endpoint}/${item.id}`, { ...item, is_active: item.is_active ? 0 : 1 }); fetchData(); }
    catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
  };

  const handleDuplicate = async (item: SlideItem) => {
    try {
      const { id, ...rest } = item;
      await api.post(endpoint, { ...rest, sort_order: items.length, title: `${rest.title} (copia)` });
      showToast("success", "Slide duplicado");
      fetchData();
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error al duplicar"); }
  };

  const moveItemInList = async (idx: number, dir: "up" | "down") => {
    const newIdx = dir === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= sorted.length) return;
    const newSorted = [...sorted];
    [newSorted[idx], newSorted[newIdx]] = [newSorted[newIdx], newSorted[idx]];
    for (let i = 0; i < newSorted.length; i++) {
      await api.put(`${endpoint}/${newSorted[i].id}`, { sort_order: i }).catch(() => {});
    }
    fetchData();
  };

  const exportData = (type: "csv" | "xls") => {
    const data = items.map(i => ({ Titulo: i.title || "", Subtitulo: i.subtitle || "", Descripcion: i.description || "", "Texto CTA": i.cta_text || "", "Link CTA": i.cta_link || "", Orden: i.sort_order ?? 0, Estado: i.is_active ? "Activo" : "Inactivo" }));
    if (type === "csv") downloadCSV(data, `sliders-${activeTab}`); else downloadExcel(data, `sliders-${activeTab}`);
  };

  const getCardBackground = (item: SlideItem) => {
    if (item.image) return undefined;
    if (item.gradient) return item.gradient;
    return "linear-gradient(135deg, #1a1a2e, #16213e)";
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Slides / Carruseles"
        description="Administra los slides del Hero y las ofertas de tu sitio web."
        breadcrumbs={[{ label: "Contenido", to: "/" }, { label: "Sliders" }]}
        action={
          <button onClick={openNew} className="mp-btn-primary text-sm">
            <Plus size={15} /> Nuevo Slide
          </button>
        }
      />

      <div className="flex gap-1 mb-5 rounded-xl p-1 w-fit bg-[var(--mp-bg-elevated)]">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} type="button"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? "bg-[var(--mp-accent)] text-white shadow-sm" : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-secondary)]"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <KpiCard
          title={`Total en ${activeTab === "hero" ? "Hero" : "Ofertas"}`}
          value={items.length}
          icon={<Layers size={18} />}
          iconColor="blue"
          subtitle="Slides configurados"
        />
        <KpiCard
          title="Activos"
          value={activeCount}
          icon={<Eye size={18} />}
          iconColor="green"
          subtitle="Actualmente publicados"
        />
      </div>

      {loading ? (
        <div className="mp-card p-5">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-[var(--mp-bg-elevated)] animate-pulse">
                <div className="w-20 h-14 rounded-lg bg-[var(--mp-border)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[var(--mp-border)] rounded w-1/4" />
                  <div className="h-3 bg-[var(--mp-border)] rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : sorted.length === 0 ? (
        <div className="mp-card p-8 text-center">
          <Layers size={32} className="mx-auto mb-3 text-[var(--mp-text-tertiary)]" />
          <p className="text-sm font-semibold text-[var(--mp-text-primary)]">Sin slides aun</p>
          <p className="text-xs text-[var(--mp-text-tertiary)] mt-1 mb-4">
            {activeTab === "hero" ? "Los slides son las imagenes principales de tu pagina." : "Las ofertas promocionales destacan tus promociones."}
          </p>
          <button onClick={openNew} className="mp-btn-primary text-sm"><Plus size={15} /> Nuevo Slide</button>
        </div>
      ) : (
        <div className="mp-card">
          <div className="flex items-center justify-between p-4 border-b border-[var(--mp-border)]">
            <div>
              <h3 className="text-sm font-semibold text-[var(--mp-text-primary)]">Lista de slides ({activeTab === "hero" ? "Hero" : "Ofertas"})</h3>
              <p className="text-xs text-[var(--mp-text-tertiary)]">Arrastra para reordenar</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
                <input
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar slide..."
                  className="mp-input pl-8 text-xs w-48"
                />
              </div>
              <select
                value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="mp-input text-xs w-auto"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
              <div className="flex items-center border border-[var(--mp-border)] rounded-lg overflow-hidden">
                <button onClick={() => setViewMode("grid")} type="button"
                  className={`p-1.5 ${viewMode === "grid" ? "bg-[var(--mp-accent)] text-white" : "text-[var(--mp-text-tertiary)]"}`}>
                  <Grid3X3 size={14} />
                </button>
                <button onClick={() => setViewMode("list")} type="button"
                  className={`p-1.5 ${viewMode === "list" ? "bg-[var(--mp-accent)] text-white" : "text-[var(--mp-text-tertiary)]"}`}>
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginated.map((item, idx) => (
                  <div key={item.id} className="rounded-xl border border-[var(--mp-border)] bg-[var(--mp-bg-card)] overflow-hidden group hover:-translate-y-0.5 transition-all duration-300">
                    <div
                      className="h-40 relative flex items-end p-4"
                      style={{ background: getCardBackground(item) }}
                    >
                      {item.image && (
                        <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                      )}
                      {!item.image && !item.gradient && (
                        <Image size={32} className="absolute inset-0 m-auto text-white/20" />
                      )}
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        <button onClick={() => moveItemInList(idx, "up")} disabled={idx === 0}
                          className="w-6 h-6 rounded flex items-center justify-center bg-black/30 text-white/80 disabled:opacity-20 hover:bg-black/50">
                          <ChevronUp size={12} />
                        </button>
                        <button onClick={() => moveItemInList(idx, "down")} disabled={idx === paginated.length - 1}
                          className="w-6 h-6 rounded flex items-center justify-center bg-black/30 text-white/80 disabled:opacity-20 hover:bg-black/50">
                          <ChevronDown size={12} />
                        </button>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                          {item.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-[var(--mp-text-primary)] truncate">{item.title}</h3>
                      <p className="text-xs text-[var(--mp-text-tertiary)] mt-0.5 truncate">{item.subtitle}</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--mp-border)]">
                        <span className="text-[11px] text-[var(--mp-text-tertiary)]">#{item.sort_order}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleToggleActive(item)} className="p-1.5 rounded-lg hover:bg-[var(--mp-bg-elevated)] text-[var(--mp-text-tertiary)]" type="button">
                            {item.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
                          </button>
                          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-[var(--mp-bg-elevated)] text-[var(--mp-text-tertiary)] hover:text-[var(--mp-accent)]" type="button">
                            <Edit3 size={13} />
                          </button>
                          <button onClick={() => handleDuplicate(item)} className="p-1.5 rounded-lg hover:bg-[var(--mp-bg-elevated)] text-[var(--mp-text-tertiary)]" type="button">
                            <Copy size={13} />
                          </button>
                          <button onClick={() => handleDelete(item)} className="p-1.5 rounded-lg hover:bg-[rgba(239,68,68,0.08)] text-[var(--mp-text-tertiary)] hover:text-[var(--mp-danger)]" type="button">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--mp-border)]">
                    <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--mp-text-tertiary)] px-4 py-3">Slide</th>
                    <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--mp-text-tertiary)] px-4 py-3">Titulo</th>
                    <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--mp-text-tertiary)] px-4 py-3">Subtitulo</th>
                    <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--mp-text-tertiary)] px-4 py-3">Estado</th>
                    <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-[var(--mp-text-tertiary)] px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((item) => (
                    <tr key={item.id} className="border-b border-[var(--mp-border)] hover:bg-[var(--mp-bg-elevated)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <GripVertical size={14} className="text-[var(--mp-text-tertiary)] cursor-grab" />
                          <div
                            className="w-20 h-14 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                            style={{ background: getCardBackground(item) || "var(--mp-bg-elevated)" }}
                          >
                            {item.image ? (
                              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <Image size={16} className="text-white/30" />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-[var(--mp-text-primary)]">{item.title || "—"}</p>
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--mp-bg-elevated)] text-[var(--mp-text-tertiary)]">
                            {activeTab === "hero" ? "Hero" : "Oferta"}
                          </span>
                          <span className="text-[10px] text-[var(--mp-text-tertiary)] ml-1.5">ID: {item.id}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-[var(--mp-text-secondary)]">{item.subtitle || "—"}</p>
                        {item.description && <p className="text-[11px] text-[var(--mp-text-tertiary)] mt-0.5 truncate max-w-[200px]">{item.description}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggleActive(item)} type="button" className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                          style={{ background: item.is_active ? "var(--mp-accent)" : "var(--mp-border)" }}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.is_active ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button className="p-1.5 rounded-lg hover:bg-[var(--mp-bg-elevated)] text-[var(--mp-text-tertiary)]" type="button" title="Vista previa">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-[var(--mp-bg-elevated)] text-[var(--mp-text-tertiary)] hover:text-[var(--mp-accent)]" type="button" title="Editar">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => handleDuplicate(item)} className="p-1.5 rounded-lg hover:bg-[var(--mp-bg-elevated)] text-[var(--mp-text-tertiary)]" type="button" title="Duplicar">
                            <Copy size={14} />
                          </button>
                          <button onClick={() => handleDelete(item)} className="p-1.5 rounded-lg hover:bg-[rgba(239,68,68,0.08)] text-[var(--mp-text-tertiary)] hover:text-[var(--mp-danger)]" type="button" title="Eliminar">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--mp-border)]">
            <span className="text-xs text-[var(--mp-text-tertiary)]">
              Mostrando {paginated.length} de {total} slide{total !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--mp-text-tertiary)]">Mostrar</span>
              <select className="mp-input text-xs w-16 py-1">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span className="text-xs text-[var(--mp-text-tertiary)]">por pagina</span>
              {totalPages > 1 && (
                <Pagination page={page} perPage={PAGE_SIZE} total={total} onChange={setPage} />
              )}
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative w-full max-w-[920px] rounded-2xl bg-white shadow-2xl animate-scale-in max-h-[90vh] flex flex-col">

            <div className="flex items-center gap-3 px-6 pt-6 pb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(16,185,129,0.1)] text-[var(--mp-accent)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-gray-900">{editing ? "Editar Slide" : "Nuevo Slide"}</h3>
                <p className="text-xs text-gray-400">Crea un nuevo slide para tu sitio web.</p>
              </div>
              <button onClick={() => setModal(false)} type="button"
                className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                <div className="lg:col-span-3 space-y-4">

                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <h4 className="text-[13px] font-semibold text-gray-900 mb-3">Contenido</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                          Título del slide <span className="text-red-500">*</span>
                        </label>
                        <input className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)]"
                          placeholder="Escribe un título atractivo" value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value.slice(0, 60) })} />
                        <p className="text-[11px] text-gray-400 mt-1 text-right">{form.title.length}/60</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1.5 block">Subtítulo</label>
                        <input className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)]"
                          placeholder="Escribe un subtítulo (opcional)" value={form.subtitle}
                          onChange={(e) => setForm({ ...form, subtitle: e.target.value.slice(0, 100) })} />
                        <p className="text-[11px] text-gray-400 mt-1 text-right">{form.subtitle.length}/100</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1.5 block">Descripción</label>
                        <textarea className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)]"
                          rows={3} placeholder="Describe brevemente el contenido del slide (opcional)"
                          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value.slice(0, 160) })} />
                        <p className="text-[11px] text-gray-400 mt-1 text-right">{form.description.length}/160</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <h4 className="text-[13px] font-semibold text-gray-900 mb-3">Enlaces</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1.5 block">Texto del botón (CTA)</label>
                        <input className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)]"
                          placeholder="Ej: Ver más, Comprar ahora, Conocer más" value={form.cta_text}
                          onChange={(e) => setForm({ ...form, cta_text: e.target.value.slice(0, 30) })} />
                        <p className="text-[11px] text-gray-400 mt-1 text-right">{form.cta_text.length}/30</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1.5 block">URL del botón (CTA)</label>
                        <div className="relative">
                          <input className="w-full px-3 py-2 pl-9 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)]"
                            placeholder="Ej: /tienda, https://motopro.com" value={form.cta_link}
                            onChange={(e) => setForm({ ...form, cta_link: e.target.value })} />
                          <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Publicar slide</p>
                        <p className="text-xs text-gray-400">El slide será visible en el sitio web</p>
                      </div>
                      <button onClick={() => setForm({ ...form, is_active: form.is_active === "1" ? "0" : "1" })} type="button"
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                        style={{ background: form.is_active === "1" ? "var(--mp-accent)" : "#D1D5DB" }}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${form.is_active === "1" ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Orden</p>
                        <p className="text-xs text-gray-400">Posición del slide en el carrusel</p>
                      </div>
                      <input type="number" className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)]"
                        min={1} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
                    </div>
                  </div>

                </div>

                <div className="lg:col-span-2 space-y-4">

                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <h4 className="text-[13px] font-semibold text-gray-900 mb-3">Imagen del slide</h4>
                    {form.image ? (
                      <div className="relative">
                        <img src={form.image} alt="Preview" className="w-full h-44 object-cover rounded-lg" />
                        <button onClick={() => setForm({ ...form, image: "" })} type="button"
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[var(--mp-accent)] transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                        </div>
                        <p className="text-xs text-[var(--mp-text-secondary)] mb-1">Arrastra y suelta una imagen aquí</p>
                        <p className="text-xs text-[var(--mp-text-secondary)] mb-1">o haz clic para seleccionar</p>
                        <p className="text-[11px] text-[var(--mp-text-tertiary)] mt-2">Formatos: JPG, PNG, WebP</p>
                        <p className="text-[11px] text-[var(--mp-text-tertiary)]">Tamaño recomendado: 1920x1080px</p>
                        <label className="mt-3 inline-block px-4 py-2 rounded-lg border border-[var(--mp-border)] text-xs font-medium text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)] cursor-pointer transition-colors">
                          Seleccionar imagen
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const folder = activeTab === "hero" ? "taller-motos/hero" : "taller-motos/offers";
                            try {
                              const res = await uploadFile("/upload", file, folder);
                              const url = res.data?.url || res.url || res.image || "";
                              if (url) setForm({ ...form, image: url });
                            } catch { showToast("error", "Error al subir imagen"); }
                          }} />
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <h4 className="text-[13px] font-semibold text-gray-900 mb-3">Estilos</h4>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-2 block">Color de superposición</label>
                      <div className="flex items-center gap-2.5">
                        {overlayColors.map((c) => (
                          <button key={c} type="button" onClick={() => setForm({ ...form, overlay_color: c })}
                            className="w-8 h-8 rounded-full transition-all shrink-0"
                            style={{
                              background: c,
                              boxShadow: form.overlay_color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : "none"
                            }} />
                        ))}
                        <label className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[var(--mp-accent)] transition-colors shrink-0">
                          <Plus size={14} className="text-gray-400" />
                          <input type="color" className="hidden" value={form.overlay_color}
                            onChange={(e) => setForm({ ...form, overlay_color: e.target.value })} />
                        </label>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-gray-500">Opacidad</label>
                        <span className="text-xs font-semibold text-[var(--mp-accent)]">{form.overlay_opacity}%</span>
                      </div>
                      <input type="range" min={0} max={100} value={form.overlay_opacity}
                        onChange={(e) => setForm({ ...form, overlay_opacity: e.target.value })}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                        style={{ background: `linear-gradient(to right, var(--mp-accent) ${form.overlay_opacity}%, #E5E7EB ${form.overlay_opacity}%)` }} />
                    </div>
                  </div>

                </div>

              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={!form.title.trim()}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white flex items-center gap-2 disabled:opacity-50 transition-colors"
                style={{ background: "var(--mp-accent)" }}>
                <Check size={16} />
                Guardar Slide
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
