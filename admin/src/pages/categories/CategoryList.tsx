import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import {
  Plus, Trash2, Search, FolderTree, MoreHorizontal, Folder, FolderOpen,
  GripVertical, Download, Upload, ChevronDown, Eye, Pencil,
  Filter, LayoutList, LayoutGrid, Star, X
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { Category } from "@/types";
import { Pagination } from "@shared/components/ui/Pagination";
import PageHeader from "@/components/PageHeader";

const PAGE_SIZE = 10;

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "sin-nombre";
}

function getSubCount(c: Category) {
  return (c as any).subcategories?.length || 0;
}

function timeAgo(d: string) {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Ayer";
  if (days < 30) return `Hace ${days} días`;
  return `Hace ${Math.floor(days / 30)} mes${Math.floor(days / 30) > 1 ? "es" : ""}`;
}

type ViewMode = "list" | "grid";
type StatusFilter = "all" | "active" | "featured" | "hidden";

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<"newest" | "name" | "products">("newest");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchCats = () => {
    setLoading(true);
    api.get("/categories").then((r) => setCategories(r || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCats(); }, []);

  useEffect(() => {
    const handleClick = () => setOpenMenu(null);
    if (openMenu) document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [openMenu]);

  const stats = useMemo(() => {
    const total = categories.length;
    const withSubs = categories.filter(c => getSubCount(c) > 0).length;
    const withoutSubs = total - withSubs;
    const totalProducts = categories.reduce((s, c) => s + ((c as any).product_count || 0), 0);
    return { total, withSubs, withoutSubs, totalProducts };
  }, [categories]);

  const filtered = useMemo(() => {
    let result = categories;
    if (search.trim()) result = result.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter === "active") result = result.filter(c => (c as any).is_active !== false);
    if (statusFilter === "featured") result = result.filter(c => (c as any).is_featured);
    if (statusFilter === "hidden") result = result.filter(c => (c as any).is_active === false);
    switch (sortBy) {
      case "name": result = [...result].sort((a, b) => a.name.localeCompare(b.name)); break;
      case "products": result = [...result].sort((a, b) => ((b as any).product_count || 0) - ((a as any).product_count || 0)); break;
      default: result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [categories, search, statusFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/categories/${deleteId}`); showToast("success", "Categoría eliminada"); setDeleteId(null); fetchCats(); }
    catch { showToast("error", "Error al eliminar"); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Categorías"
        description="Organiza tus productos y servicios en categorías para una mejor gestión."
        breadcrumbs={[{ label: "Catálogo", to: "/categories" }, { label: "Categorías" }]}
        icon={<FolderTree size={20} />}
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/categories/new")} className="mp-btn-primary text-xs">
              <Plus size={14} /> Nueva categoría
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="mp-kpi group hover:border-[rgba(20,184,166,0.2)] transition-all">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-[var(--mp-text-tertiary)] uppercase tracking-wider">Total Categorías</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(20,184,166,0.1)] text-[var(--mp-accent)]">
              <FolderTree size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-[var(--mp-text-primary)]">{stats.total}</p>
          <p className="text-xs mt-1.5 flex items-center gap-1 text-[var(--mp-success)]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /></svg>
            12% vs. el mes pasado
          </p>
        </div>

        {/* Con subcategorías */}
        <div className="mp-kpi group hover:border-[rgba(20,184,166,0.2)] transition-all">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-[var(--mp-text-tertiary)] uppercase tracking-wider">Con Subcategorías</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(59,130,246,0.1)] text-[var(--mp-info)]">
              <Folder size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-[var(--mp-text-primary)]">{stats.withSubs}</p>
          <div className="mt-2">
            <p className="text-xs text-[var(--mp-text-tertiary)]">{stats.total > 0 ? Math.round((stats.withSubs / stats.total) * 100) : 0}% del total</p>
            <div className="mt-1.5 h-1.5 rounded-full bg-[var(--mp-bg-elevated)] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[var(--mp-info)] to-[var(--mp-accent)]" style={{ width: `${stats.total > 0 ? (stats.withSubs / stats.total) * 100 : 0}%` }} />
            </div>
          </div>
        </div>

        {/* Sin subcategorías */}
        <div className="mp-kpi group hover:border-[rgba(20,184,166,0.2)] transition-all">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-[var(--mp-text-tertiary)] uppercase tracking-wider">Sin Subcategorías</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(245,158,11,0.1)] text-[var(--mp-warning)]">
              <FolderOpen size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-[var(--mp-text-primary)]">{stats.withoutSubs}</p>
          <p className="text-xs mt-1.5 text-[var(--mp-warning)]">Requieren revisión</p>
        </div>

        {/* Productos asociados */}
        <div className="mp-kpi group hover:border-[rgba(20,184,166,0.2)] transition-all">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-[var(--mp-text-tertiary)] uppercase tracking-wider">Productos Asociados</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(139,92,246,0.1)] text-[#8b5cf6]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-[var(--mp-text-primary)]">{stats.totalProducts.toLocaleString()}</p>
          <p className="text-xs mt-1.5 text-[var(--mp-text-tertiary)]">En todas las categorías</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] pointer-events-none" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar categorías..." className="mp-input pl-9" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-secondary)]">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setPage(1); }}
            className="mp-select text-xs w-auto">
            <option value="all">Todas</option>
            <option value="active">Activas</option>
            <option value="featured">Destacadas</option>
            <option value="hidden">Ocultas</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="mp-select text-xs w-auto">
            <option value="newest">Más recientes</option>
            <option value="name">Nombre A-Z</option>
            <option value="products">Más productos</option>
          </select>

          <button className="mp-btn-secondary text-xs gap-1.5">
            <Filter size={13} /> Filtros <span className="bg-[var(--mp-accent)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">0</span>
          </button>

          <button className="mp-btn-secondary text-xs">
            <Download size={13} /> Importar
          </button>
          <button className="mp-btn-secondary text-xs">
            <Upload size={13} /> Exportar
          </button>

          <div className="flex gap-0.5 p-0.5 rounded-lg bg-[var(--mp-bg-elevated)] border border-[var(--mp-border)]">
            <button onClick={() => setViewMode("list")}
              className={`w-8 h-8 flex items-center justify-center rounded-md transition-all ${viewMode === "list" ? "bg-[var(--mp-bg-surface)] text-[var(--mp-accent)] shadow-sm" : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-secondary)]"}`}>
              <LayoutList size={14} />
            </button>
            <button onClick={() => setViewMode("grid")}
              className={`w-8 h-8 flex items-center justify-center rounded-md transition-all ${viewMode === "grid" ? "bg-[var(--mp-bg-surface)] text-[var(--mp-accent)] shadow-sm" : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-secondary)]"}`}>
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {viewMode === "list" ? (
        <div className="mp-card overflow-hidden">
          <div className="hidden sm:block overflow-x-auto">
            <table className="mp-table">
              <thead>
                <tr>
                  <th className="w-10"></th>
                  <th>Categoría</th>
                  <th className="text-center">Subcategorías</th>
                  <th className="text-center">Productos</th>
                  <th className="text-center">Estado</th>
                  <th>Creada</th>
                  <th className="text-right w-16">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-5 rounded bg-[var(--mp-bg-elevated)] animate-pulse" /></td></tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div className="py-12 text-center text-sm text-[var(--mp-text-tertiary)]">{search ? "Sin resultados" : "No hay categorías"}</div>
                  </td></tr>
                ) : (
                  paginated.map((cat) => {
                    const subCount = getSubCount(cat);
                    const productCount = (cat as any).product_count || 0;
                    const isFeatured = (cat as any).is_featured;
                    const isActive = (cat as any).is_active !== false;
                    return (
                      <tr key={cat.id}>
                        <td className="cursor-grab text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-secondary)]">
                          <GripVertical size={14} />
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${cat.color || '#F97316'}15` }}>
                              {cat.image ? <img src={cat.image} alt="" className="w-full h-full object-cover rounded-xl" /> : <FolderTree size={16} style={{ color: cat.color || '#F97316' }} />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[var(--mp-text-primary)]">{cat.name}</p>
                              <p className="text-xs text-[var(--mp-text-tertiary)] font-mono">/{cat.slug || slugify(cat.name)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <div>
                            <span className="text-sm font-semibold text-[var(--mp-text-primary)]">{subCount}</span>
                            <p className="text-[10px] text-[var(--mp-text-tertiary)]">subcategorías</p>
                          </div>
                        </td>
                        <td className="text-center">
                          <div>
                            <span className="text-sm font-semibold text-[var(--mp-text-primary)]">{productCount}</span>
                            <p className="text-[10px] text-[var(--mp-text-tertiary)]">productos</p>
                          </div>
                        </td>
                        <td className="text-center">
                          {isFeatured ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--mp-warning)] bg-[var(--mp-warning-bg)] px-2.5 py-1 rounded-full">
                              <Star size={10} fill="currentColor" /> Destacado
                            </span>
                          ) : !isActive ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--mp-text-tertiary)] bg-[var(--mp-bg-elevated)] px-2.5 py-1 rounded-full">
                              <Eye size={10} /> Oculto
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--mp-success)] bg-[var(--mp-success-bg)] px-2.5 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--mp-success)]" /> Activo
                            </span>
                          )}
                        </td>
                        <td>
                          <div>
                            <p className="text-xs text-[var(--mp-text-secondary)]">{new Date(cat.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</p>
                            <p className="text-[10px] text-[var(--mp-text-tertiary)]">{timeAgo(cat.created_at)}</p>
                          </div>
                        </td>
                        <td className="text-right">
                          <div className="inline-flex items-center justify-end relative" onClick={(e) => e.stopPropagation()}>
                            <button onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === cat.id ? null : cat.id); }}
                              className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)] transition-colors">
                              <MoreHorizontal size={16} />
                            </button>
                            {openMenu === cat.id && (
                              <div className="absolute right-0 top-9 w-44 rounded-xl border border-[var(--mp-border)] bg-[var(--mp-bg-elevated)] shadow-xl z-50 p-1 animate-scale-in">
                                <button onClick={() => { navigate(`/categories/${cat.id}/edit`); setOpenMenu(null); }}
                                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[var(--mp-text-secondary)] hover:bg-[var(--mp-bg-hover)] hover:text-[var(--mp-text-primary)] transition-colors text-left">
                                  <Pencil size={13} /> Editar
                                </button>
                                <button onClick={() => { setDeleteId(cat.id); setOpenMenu(null); }}
                                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[var(--mp-danger)] hover:bg-[var(--mp-danger-bg)] transition-colors text-left">
                                  <Trash2 size={13} /> Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="sm:hidden divide-y divide-[var(--mp-border-subtle)]">
            {paginated.map((cat) => {
              const catSubCount = getSubCount(cat);
              const productCount = (cat as any).product_count || 0;
              return (
                <div key={cat.id} className="p-4 hover:bg-[var(--mp-bg-hover)] transition-colors cursor-pointer" onClick={() => navigate(`/categories/${cat.id}/edit`)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${cat.color || '#F97316'}15` }}>
                      {cat.image ? <img src={cat.image} alt="" className="w-full h-full object-cover rounded-xl" /> : <FolderTree size={16} style={{ color: cat.color || '#F97316' }} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--mp-text-primary)]">{cat.name}</p>
                      <p className="text-xs text-[var(--mp-text-tertiary)]">{catSubCount} sub · {productCount} productos</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--mp-success)] bg-[var(--mp-success-bg)] px-2 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--mp-success)]" /> Activo
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((cat) => {
            const subCount = getSubCount(cat);
            const productCount = (cat as any).product_count || 0;
            return (
              <div key={cat.id} className="mp-card-hover p-5 cursor-pointer" onClick={() => navigate(`/categories/${cat.id}/edit`)}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${cat.color || '#F97316'}15` }}>
                    {cat.image ? <img src={cat.image} alt="" className="w-full h-full object-cover rounded-xl" /> : <FolderTree size={18} style={{ color: cat.color || '#F97316' }} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--mp-text-primary)]">{cat.name}</p>
                    <p className="text-xs text-[var(--mp-text-tertiary)] font-mono">/{cat.slug || slugify(cat.name)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-[var(--mp-text-tertiary)]">
                  <span>{subCount} subcategorías</span>
                  <span>{productCount} productos</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-[var(--mp-text-tertiary)]">
            Mostrando {(page - 1) * PAGE_SIZE + 1} a {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} categorías
          </span>
          <div className="flex items-center gap-3">
            <select className="mp-select text-xs w-auto" defaultValue={String(PAGE_SIZE)}>
              <option value="10">Mostrar 10 por página</option>
              <option value="25">Mostrar 25 por página</option>
              <option value="50">Mostrar 50 por página</option>
            </select>
            <Pagination page={page} perPage={PAGE_SIZE} total={filtered.length} onChange={setPage} />
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-[var(--mp-bg-elevated)] border border-[var(--mp-border)] p-6 animate-scale-in shadow-2xl">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--mp-danger-bg)] text-[var(--mp-danger)] mb-4">
              <Trash2 size={20} />
            </div>
            <h3 className="text-lg font-semibold text-[var(--mp-text-primary)] mb-1">Eliminar categoría</h3>
            <p className="text-sm text-[var(--mp-text-tertiary)] mb-6">¿Estás seguro? Las subcategorías asociadas también se eliminarán. Esta acción no se puede deshacer.</p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="mp-btn-ghost text-xs">Cancelar</button>
              <button onClick={handleDelete} className="mp-btn text-xs text-white bg-[var(--mp-danger)] hover:bg-[#dc2626]">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
