import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { Plus, Pencil, Trash2, Search, Layers, Filter, List, Grid } from "lucide-react";
import { useToast } from "@/components/Toast";
import { Modal } from "@shared/components/ui/Modal";
import { Pagination } from "@shared/components/ui/Pagination";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";

interface BeforeAfter {
  id: string;
  title: string;
  before_image: string;
  after_image: string;
  description: string;
  is_active: number;
  sort_order: number;
  created_at: string;
}

const PAGE_SIZE = 10;

export default function BeforeAfterList() {
  const [items, setItems] = useState<BeforeAfter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PAGE_SIZE);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchItems = () => {
    setLoading(true);
    api.get("/before-after?all=1")
      .then((r) => setItems(r || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter(i => i.is_active === 1).length;
    return { total, active, inactive: total - active };
  }, [items]);

  const filtered = useMemo(() => {
    let result = items;
    if (search.trim()) {
      result = result.filter(i => i.title.toLowerCase().includes(search.toLowerCase()));
    }
    if (filter === "active") result = result.filter(i => i.is_active === 1);
    if (filter === "inactive") result = result.filter(i => i.is_active === 0);
    return [...result].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [items, search, filter]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/before-after/${id}`);
      showToast("success", "Comparación eliminada");
      setDeleteConfirm(null);
      fetchItems();
    } catch {
      showToast("error", "Error al eliminar");
    }
  };

  const toggleActive = async (item: BeforeAfter) => {
    try {
      await api.put(`/before-after/${item.id}`, { is_active: item.is_active === 1 ? 0 : 1 });
      showToast("success", item.is_active === 1 ? "Desactivado" : "Activado");
      fetchItems();
    } catch {
      showToast("error", "Error al actualizar");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Antes / Después"
        description="Gestiona las comparaciones de trabajos realizados."
        breadcrumbs={[{ label: "Contenido", to: "/before-after" }, { label: "Antes/Después" }]}
        icon={<Layers size={20} />}
        action={
          <button onClick={() => navigate("/before-after/new")} className="mp-btn-primary text-xs">
            <Plus size={14} /> Nueva Comparación
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="mp-kpi">
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-bold text-[var(--mp-text-tertiary)] uppercase tracking-wider">Total</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(59,130,246,0.1)] text-[#3B82F6]"><Layers size={18} /></div>
          </div>
          <p className="text-2xl font-bold text-[var(--mp-text-primary)]">{stats.total}</p>
        </div>
        <div className="mp-kpi">
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-bold text-[var(--mp-text-tertiary)] uppercase tracking-wider">Activos</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(16,185,129,0.1)] text-[var(--mp-success)]"><Layers size={18} /></div>
          </div>
          <p className="text-2xl font-bold text-[var(--mp-text-primary)]">{stats.active}</p>
        </div>
        <div className="mp-kpi">
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-bold text-[var(--mp-text-tertiary)] uppercase tracking-wider">Inactivos</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(245,158,11,0.1)] text-[var(--mp-warning)]"><Layers size={18} /></div>
          </div>
          <p className="text-2xl font-bold text-[var(--mp-text-primary)]">{stats.inactive}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] pointer-events-none" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar comparaciones..." className="mp-input pl-9 text-sm" />
        </div>
        <div className="flex gap-1 p-0.5 rounded-xl bg-[var(--mp-bg-elevated)]">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "bg-[var(--mp-bg-card)] text-[var(--mp-accent)] shadow-sm border border-[var(--mp-border)]" : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-secondary)]"}`}>
              {f === "all" ? "Todas" : f === "active" ? "Activas" : "Inactivas"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex gap-0.5 p-0.5 rounded-lg bg-[var(--mp-bg-elevated)] border border-[var(--mp-border)]">
            <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-[var(--mp-bg-card)] text-[var(--mp-accent)] shadow-sm" : "text-[var(--mp-text-tertiary)]"}`}><List size={14} /></button>
            <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-[var(--mp-bg-card)] text-[var(--mp-accent)] shadow-sm" : "text-[var(--mp-text-tertiary)]"}`}><Grid size={14} /></button>
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
                  <th>Título</th>
                  <th className="text-center">Imágenes</th>
                  <th className="hidden lg:table-cell">Estado</th>
                  <th className="text-right w-28">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-10 rounded-lg bg-[var(--mp-bg-elevated)] animate-pulse" /></td></tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={4}>
                    <EmptyState icon={Layers} title={search ? "Sin resultados" : "No hay comparaciones"} description={search ? `No hay comparaciones que coincidan con "${search}"` : "Crea tu primera comparación antes/después."} actions={!search ? [{ label: "Nueva Comparación", onClick: () => navigate("/before-after/new") }] : undefined} />
                  </td></tr>
                ) : (
                  paginated.map((item) => (
                    <tr key={item.id} className="cursor-pointer" onClick={() => navigate(`/before-after/${item.id}/edit`)}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[var(--mp-info-bg)] flex items-center justify-center shrink-0 overflow-hidden">
                            {item.before_image ? <img src={item.before_image} alt="" className="w-full h-full object-cover" /> : <Layers size={16} className="text-[var(--mp-info)]" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--mp-text-primary)]">{item.title}</p>
                            <p className="text-xs text-[var(--mp-text-tertiary)] line-clamp-1">{item.description || "Sin descripción"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-12 h-8 rounded overflow-hidden bg-[var(--mp-bg-elevated)]">
                            {item.before_image && <img src={item.before_image} alt="Antes" className="w-full h-full object-cover" />}
                          </div>
                          <span className="text-xs text-[var(--mp-text-tertiary)]">→</span>
                          <div className="w-12 h-8 rounded overflow-hidden bg-[var(--mp-bg-elevated)]">
                            {item.after_image && <img src={item.after_image} alt="Después" className="w-full h-full object-cover" />}
                          </div>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell">
                        <button onClick={(e) => { e.stopPropagation(); toggleActive(item); }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${item.is_active === 1 ? "bg-[rgba(16,185,129,0.1)] text-[var(--mp-success)]" : "bg-[rgba(239,68,68,0.1)] text-[var(--mp-danger)]"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.is_active === 1 ? "bg-[var(--mp-success)]" : "bg-[var(--mp-danger)]"}`} />
                          {item.is_active === 1 ? "Activo" : "Inactivo"}
                        </button>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => navigate(`/before-after/${item.id}/edit`)} className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)]" title="Editar"><Pencil size={14} /></button>
                          <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-danger)] hover:bg-[rgba(239,68,68,0.08)]" title="Eliminar"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Mobile */}
          <div className="sm:hidden divide-y divide-[var(--mp-border-subtle)]">
            {paginated.map((item) => (
              <div key={item.id} className="p-4 hover:bg-[var(--mp-bg-hover)] transition-colors cursor-pointer" onClick={() => navigate(`/before-after/${item.id}/edit`)}>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-12 h-12 rounded overflow-hidden bg-[var(--mp-bg-elevated)]">
                      {item.before_image && <img src={item.before_image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="w-12 h-12 rounded overflow-hidden bg-[var(--mp-bg-elevated)]">
                      {item.after_image && <img src={item.after_image} alt="" className="w-full h-full object-cover" />}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--mp-text-primary)]">{item.title}</p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${item.is_active === 1 ? "bg-[rgba(16,185,129,0.1)] text-[var(--mp-success)]" : "bg-[rgba(239,68,68,0.1)] text-[var(--mp-danger)]"}`}>
                      {item.is_active === 1 ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <div key={i} className="mp-card p-5 h-48 animate-pulse" />)
          ) : paginated.length === 0 ? (
            <div className="col-span-full"><EmptyState icon={Layers} title="No hay comparaciones" description="Crea tu primera comparación." actions={[{ label: "Nueva Comparación", onClick: () => navigate("/before-after/new") }]} /></div>
          ) : (
            paginated.map((item) => (
              <div key={item.id} className="mp-card p-4 cursor-pointer hover:border-[var(--mp-border-hover)] transition-all" onClick={() => navigate(`/before-after/${item.id}/edit`)}>
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 h-24 rounded-lg overflow-hidden bg-[var(--mp-bg-elevated)]">
                    {item.before_image && <img src={item.before_image} alt="Antes" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 h-24 rounded-lg overflow-hidden bg-[var(--mp-bg-elevated)]">
                    {item.after_image && <img src={item.after_image} alt="Después" className="w-full h-full object-cover" />}
                  </div>
                </div>
                <p className="text-sm font-bold text-[var(--mp-text-primary)] mb-1">{item.title}</p>
                <p className="text-xs text-[var(--mp-text-secondary)] line-clamp-2 mb-3">{item.description || "Sin descripción"}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-medium ${item.is_active === 1 ? "bg-[rgba(16,185,129,0.1)] text-[var(--mp-success)]" : "bg-[rgba(239,68,68,0.1)] text-[var(--mp-danger)]"}`}>
                    {item.is_active === 1 ? "Activo" : "Inactivo"}
                  </span>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => navigate(`/before-after/${item.id}/edit`)} className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)]"><Pencil size={13} /></button>
                    <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-danger)] hover:bg-[rgba(239,68,68,0.08)]"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <span className="text-xs text-[var(--mp-text-tertiary)]">
            Mostrando {(page - 1) * perPage + 1} a {Math.min(page * perPage, filtered.length)} de {filtered.length} comparaciones
          </span>
          <div className="flex items-center gap-4">
            <Pagination page={page} perPage={perPage} total={filtered.length} onChange={setPage} />
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--mp-text-tertiary)]">Mostrar</span>
              <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="mp-select text-xs py-1 px-2 w-16">
                {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span className="text-xs text-[var(--mp-text-tertiary)]">por página</span>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Eliminar comparación" size="sm">
        <p className="text-sm text-[var(--mp-text-secondary)] mb-4">¿Estás seguro de eliminar esta comparación? Esta acción no se puede deshacer.</p>
        <div className="flex items-center gap-3 justify-end">
          <button onClick={() => setDeleteConfirm(null)} className="mp-btn-ghost text-xs">Cancelar</button>
          <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="mp-btn text-xs text-[var(--mp-danger)] bg-[rgba(239,68,68,0.08)] hover:bg-[rgba(239,68,68,0.15)]">Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}
