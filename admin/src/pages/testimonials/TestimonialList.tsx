import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { Plus, Pencil, Trash2, Search, Star, MessageSquare, Filter, Download, List, Grid, ChevronDown } from "lucide-react";
import { useToast } from "@/components/Toast";
import { Testimonial } from "@/types";
import { Modal } from "@shared/components/ui/Modal";
import { Pagination } from "@shared/components/ui/Pagination";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";

const PAGE_SIZE = 10;

export default function TestimonialList() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PAGE_SIZE);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchTestimonials = () => {
    setLoading(true);
    api.get("/testimonials?all=1")
      .then((r) => setTestimonials(r || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const stats = useMemo(() => {
    const total = testimonials.length;
    const active = testimonials.filter(t => t.is_active === 1).length;
    const inactive = total - active;
    const avgRating = total > 0 ? (testimonials.reduce((s, t) => s + (t.rating || 5), 0) / total).toFixed(1) : "0";
    return { total, active, inactive, avgRating };
  }, [testimonials]);

  const filtered = useMemo(() => {
    let result = testimonials;
    if (search.trim()) {
      result = result.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.content.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filter === "active") result = result.filter(t => t.is_active === 1);
    if (filter === "inactive") result = result.filter(t => t.is_active === 0);
    return [...result].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [testimonials, search, filter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/testimonials/${id}`);
      showToast("success", "Testimonio eliminado");
      setDeleteConfirm(null);
      fetchTestimonials();
    } catch {
      showToast("error", "Error al eliminar");
    }
  };

  const toggleActive = async (testimonial: Testimonial) => {
    try {
      await api.put(`/testimonials/${testimonial.id}`, {
        is_active: testimonial.is_active === 1 ? 0 : 1
      });
      showToast("success", testimonial.is_active === 1 ? "Testimonio desactivado" : "Testimonio activado");
      fetchTestimonials();
    } catch {
      showToast("error", "Error al actualizar");
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={12} className={i < rating ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Testimonios"
        description="Gestiona las reseñas y opiniones de tus clientes."
        breadcrumbs={[{ label: "Contenido", to: "/testimonials" }, { label: "Testimonios" }]}
        icon={<MessageSquare size={20} />}
        action={
          <button onClick={() => navigate("/testimonials/new")} className="mp-btn-primary text-xs">
            <Plus size={14} /> Nuevo Testimonio
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="mp-kpi">
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-bold text-[var(--mp-text-tertiary)] uppercase tracking-wider">Total</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(59,130,246,0.1)] text-[#3B82F6]"><MessageSquare size={18} /></div>
          </div>
          <p className="text-2xl font-bold text-[var(--mp-text-primary)]">{stats.total}</p>
        </div>
        <div className="mp-kpi">
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-bold text-[var(--mp-text-tertiary)] uppercase tracking-wider">Activos</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(16,185,129,0.1)] text-[var(--mp-success)]"><Star size={18} /></div>
          </div>
          <p className="text-2xl font-bold text-[var(--mp-text-primary)]">{stats.active}</p>
        </div>
        <div className="mp-kpi">
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-bold text-[var(--mp-text-tertiary)] uppercase tracking-wider">Inactivos</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(245,158,11,0.1)] text-[var(--mp-warning)]"><Star size={18} /></div>
          </div>
          <p className="text-2xl font-bold text-[var(--mp-text-primary)]">{stats.inactive}</p>
        </div>
        <div className="mp-kpi">
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-bold text-[var(--mp-text-tertiary)] uppercase tracking-wider">Rating Prom.</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(245,158,11,0.1)] text-amber-500"><Star size={18} className="fill-amber-400" /></div>
          </div>
          <p className="text-2xl font-bold text-[var(--mp-text-primary)]">{stats.avgRating}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] pointer-events-none" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar testimonios..." className="mp-input pl-9 text-sm" />
        </div>
        <div className="flex gap-1 p-0.5 rounded-xl bg-[var(--mp-bg-elevated)]">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "bg-[var(--mp-bg-card)] text-[var(--mp-accent)] shadow-sm border border-[var(--mp-border)]" : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-secondary)]"}`}>
              {f === "all" ? "Todos" : f === "active" ? "Activos" : "Inactivos"}
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
                  <th>Cliente</th>
                  <th className="text-center">Rating</th>
                  <th>Contenido</th>
                  <th className="hidden lg:table-cell">Estado</th>
                  <th className="text-right w-28">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-10 rounded-lg bg-[var(--mp-bg-elevated)] animate-pulse" /></td></tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={5}>
                    <EmptyState icon={MessageSquare} title={search ? "Sin resultados" : "No hay testimonios"} description={search ? `No hay testimonios que coincidan con "${search}"` : "Registra tu primer testimonio para comenzar."} actions={!search ? [{ label: "Nuevo Testimonio", onClick: () => navigate("/testimonials/new") }] : undefined} />
                  </td></tr>
                ) : (
                  paginated.map((t) => (
                    <tr key={t.id} className="cursor-pointer" onClick={() => navigate(`/testimonials/${t.id}/edit`)}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[var(--mp-info-bg)] flex items-center justify-center shrink-0 overflow-hidden">
                            {t.image ? <img src={t.image} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-[var(--mp-info)]">{t.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</span>}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--mp-text-primary)]">{t.name}</p>
                            <p className="text-xs text-[var(--mp-text-tertiary)]">{t.role || "Cliente"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">{renderStars(t.rating || 5)}</td>
                      <td>
                        <p className="text-sm text-[var(--mp-text-secondary)] line-clamp-2 max-w-xs">{t.content}</p>
                      </td>
                      <td className="hidden lg:table-cell">
                        <button onClick={(e) => { e.stopPropagation(); toggleActive(t); }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${t.is_active === 1 ? "bg-[rgba(16,185,129,0.1)] text-[var(--mp-success)]" : "bg-[rgba(239,68,68,0.1)] text-[var(--mp-danger)]"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${t.is_active === 1 ? "bg-[var(--mp-success)]" : "bg-[var(--mp-danger)]"}`} />
                          {t.is_active === 1 ? "Activo" : "Inactivo"}
                        </button>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => navigate(`/testimonials/${t.id}/edit`)} className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)]" title="Editar"><Pencil size={14} /></button>
                          <button onClick={() => setDeleteConfirm(t.id)} className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-danger)] hover:bg-[rgba(239,68,68,0.08)]" title="Eliminar"><Trash2 size={14} /></button>
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
            {paginated.map((t) => (
              <div key={t.id} className="p-4 hover:bg-[var(--mp-bg-hover)] transition-colors cursor-pointer" onClick={() => navigate(`/testimonials/${t.id}/edit`)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--mp-info-bg)] flex items-center justify-center shrink-0">
                    {t.image ? <img src={t.image} alt="" className="w-full h-full object-cover rounded-xl" /> : <span className="text-xs font-bold text-[var(--mp-info)]">{t.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--mp-text-primary)]">{t.name}</p>
                    <div className="flex items-center gap-2">{renderStars(t.rating || 5)}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-medium ${t.is_active === 1 ? "bg-[rgba(16,185,129,0.1)] text-[var(--mp-success)]" : "bg-[rgba(239,68,68,0.1)] text-[var(--mp-danger)]"}`}>
                    {t.is_active === 1 ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <div key={i} className="mp-card p-5 h-40 animate-pulse" />)
          ) : paginated.length === 0 ? (
            <div className="col-span-full"><EmptyState icon={MessageSquare} title="No hay testimonios" description="Registra tu primer testimonio." actions={[{ label: "Nuevo Testimonio", onClick: () => navigate("/testimonials/new") }]} /></div>
          ) : (
            paginated.map((t) => (
              <div key={t.id} className="mp-card p-5 cursor-pointer hover:border-[var(--mp-border-hover)] transition-all" onClick={() => navigate(`/testimonials/${t.id}/edit`)}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-[var(--mp-info-bg)] flex items-center justify-center shrink-0 overflow-hidden">
                    {t.image ? <img src={t.image} alt="" className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-[var(--mp-info)]">{t.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--mp-text-primary)]">{t.name}</p>
                    <p className="text-xs text-[var(--mp-text-tertiary)]">{t.role || "Cliente"}</p>
                  </div>
                </div>
                <div className="mb-3">{renderStars(t.rating || 5)}</div>
                <p className="text-sm text-[var(--mp-text-secondary)] line-clamp-3 mb-3">{t.content}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-medium ${t.is_active === 1 ? "bg-[rgba(16,185,129,0.1)] text-[var(--mp-success)]" : "bg-[rgba(239,68,68,0.1)] text-[var(--mp-danger)]"}`}>
                    {t.is_active === 1 ? "Activo" : "Inactivo"}
                  </span>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => navigate(`/testimonials/${t.id}/edit`)} className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)]"><Pencil size={13} /></button>
                    <button onClick={() => setDeleteConfirm(t.id)} className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-danger)] hover:bg-[rgba(239,68,68,0.08)]"><Trash2 size={13} /></button>
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
            Mostrando {(page - 1) * perPage + 1} a {Math.min(page * perPage, filtered.length)} de {filtered.length} testimonios
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
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Eliminar testimonio" size="sm">
        <p className="text-sm text-[var(--mp-text-secondary)] mb-4">¿Estás seguro de eliminar este testimonio? Esta acción no se puede deshacer.</p>
        <div className="flex items-center gap-3 justify-end">
          <button onClick={() => setDeleteConfirm(null)} className="mp-btn-ghost text-xs">Cancelar</button>
          <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="mp-btn text-xs text-[var(--mp-danger)] bg-[rgba(239,68,68,0.08)] hover:bg-[rgba(239,68,68,0.15)]">Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}
