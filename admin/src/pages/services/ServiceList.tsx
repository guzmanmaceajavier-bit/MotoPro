import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { Plus, Wrench, Pencil, Trash2, Clock, DollarSign, Power, PowerOff, Search, Grid3X3, List, Tags } from "lucide-react";
import { useToast } from "@/components/Toast";
import { Service } from "@/types";
import { Modal } from "@shared/components/ui/Modal";
import { Badge } from "@shared/components/ui/Badge";
import { Pagination } from "@shared/components/ui/Pagination";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@shared/components/ui/KpiCard";

const serviceColors = ["#6366F1", "#0D9488", "#F59E0B", "#EC4899", "#EF4444", "#8B5CF6", "#0EA5E9", "#10B981"];
const PAGE_SIZE = 9;

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => `${(i / (data.length - 1 || 1)) * 60},${24 - (v / max) * 20}`).join(" ");
  return (
    <svg width="60" height="24" viewBox="0 0 60 24" fill="none">
      <polyline points={points} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ServiceList() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [categories, setCategories] = useState<{id: string; name: string}[]>([]);
  const [catManagerOpen, setCatManagerOpen] = useState(false);
  const [catEditModal, setCatEditModal] = useState<{id?: string; name: string} | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get("/services?all=1"),
      api.get("/service-categories").catch(() => []),
    ]).then(([svcData, cats]) => {
      const items = Array.isArray(svcData) ? svcData : [];
      setServices(items.map((s: Service) => ({ ...s, features: typeof s.features === "string" ? JSON.parse(s.features) : s.features })));
      if (Array.isArray(cats)) setCategories(cats);
    }).finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string) => {
    try { await api.delete(`/services/${id}`); showToast("success", "Servicio eliminado"); setDeleteConfirm(null); fetchData(); }
    catch { showToast("error", "Error al eliminar"); }
  };

  const handleSaveCategory = async () => {
    if (!catEditModal?.name.trim()) return;
    try {
      if (catEditModal.id) {
        await api.put(`/service-categories/${catEditModal.id}`, { name: catEditModal.name });
        showToast("success", "Categoría actualizada");
      } else {
        await api.post("/service-categories", { name: catEditModal.name });
        showToast("success", "Categoría creada");
      }
      setCatEditModal(null);
      fetchData();
    } catch { showToast("error", "Error al guardar categoría"); }
  };

  const handleDeleteCategory = async (id: string) => {
    try { await api.delete(`/service-categories/${id}`); showToast("success", "Categoría eliminada"); fetchData(); }
    catch { showToast("error", "Error al eliminar categoría"); }
  };

  const filtered = useMemo(() => {
    let result = services;
    if (search.trim()) { const q = search.toLowerCase(); result = result.filter(s => s.title.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)); }
    if (filter === "active") result = result.filter(s => s.is_active);
    if (filter === "inactive") result = result.filter(s => !s.is_active);
    if (categoryFilter) result = result.filter(s => (s.category || "").toLowerCase() === categoryFilter.toLowerCase());
    return result;
  }, [services, search, filter, categoryFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCount = services.filter(s => s.is_active).length;
  const inactiveCount = services.length - activeCount;
  const avgPrice = services.length > 0 ? services.reduce((s, sv) => s + (sv.price || 0), 0) / services.length : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Servicios"
        description="Administra los servicios ofrecidos en el taller"
        breadcrumbs={[{ label: "Servicios", to: "/services" }, { label: "Lista" }]}
        icon={<Wrench size={20} />}
        action={<button onClick={() => navigate("/services/new")} className="mp-btn-primary text-xs"><Plus size={14} /> Nuevo Servicio</button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Servicios"
          value={services.length}
          icon={<Wrench size={18} />}
          iconColor="purple"
          sparkline={<Sparkline data={services.map(() => 1)} color="#8B5CF6" />}
        />
        <KpiCard
          title="Activos"
          value={activeCount}
          icon={<Power size={18} />}
          iconColor="green"
          sparkline={<Sparkline data={services.map(s => s.is_active ? 1 : 0)} color="#10B981" />}
        />
        <KpiCard
          title="Inactivos"
          value={inactiveCount}
          icon={<PowerOff size={18} />}
          iconColor="red"
          sparkline={<Sparkline data={services.map(s => s.is_active ? 0 : 1)} color="#EF4444" />}
        />
        <KpiCard
          title="Precio Promedio"
          value={`$${avgPrice.toFixed(0)}`}
          icon={<DollarSign size={18} />}
          iconColor="orange"
          sparkline={<Sparkline data={services.map(s => s.price || 0)} color="#F59E0B" />}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] pointer-events-none" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar servicios..." className="mp-input pl-9" />
        </div>
        <div className="flex gap-1 p-0.5 rounded-lg bg-[var(--mp-bg-elevated)] border border-[var(--mp-border)]">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === f ? "bg-[var(--mp-bg-surface)] text-[var(--mp-accent)] shadow-sm" : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-secondary)]"}`}>
              {f === "all" ? "Todos" : f === "active" ? "Activos" : "Inactivos"}
            </button>
          ))}
        </div>
        <div className="flex gap-1 p-0.5 rounded-lg bg-[var(--mp-bg-elevated)] border border-[var(--mp-border)]">
          <button onClick={() => setView("grid")} className={`p-1.5 rounded-md transition-all ${view === "grid" ? "bg-[var(--mp-bg-surface)] text-[var(--mp-accent)] shadow-sm" : "text-[var(--mp-text-tertiary)]"}`}>
            <Grid3X3 size={14} />
          </button>
          <button onClick={() => setView("list")} className={`p-1.5 rounded-md transition-all ${view === "list" ? "bg-[var(--mp-bg-surface)] text-[var(--mp-accent)] shadow-sm" : "text-[var(--mp-text-tertiary)]"}`}>
            <List size={14} />
          </button>
        </div>
        <button onClick={() => setCatManagerOpen(true)} className="mp-btn-ghost text-xs shrink-0"><Tags size={13} /> Categorías</button>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button onClick={() => { setCategoryFilter(""); setPage(1); }}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!categoryFilter ? "bg-interactive-accent text-white" : "bg-[var(--mp-bg-elevated)] text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)]"}`}>
            Todas
          </button>
          {categories.map(c => (
            <button key={c.id} onClick={() => { setCategoryFilter(c.name); setPage(1); }}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${categoryFilter === c.name ? "bg-interactive-accent text-white" : "bg-[var(--mp-bg-elevated)] text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)]"}`}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="mp-card p-5 space-y-3"><div className="h-5 rounded bg-[var(--mp-bg-elevated)] animate-pulse w-3/4" /><div className="h-4 rounded bg-[var(--mp-bg-elevated)] animate-pulse w-1/2" /></div>)}
        </div>
      ) : paginated.length === 0 ? (
        <EmptyState icon={<Wrench size={22} />} title={search || filter !== "all" ? "Sin resultados" : "Comienza aquí"} message={search || filter !== "all" ? "No hay servicios que coincidan" : "Define tus primeros servicios."}
          action={!search && filter === "all" ? { label: "Crear Servicio", onClick: () => navigate("/services/new") } : undefined} />
      ) : view === "grid" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((s, idx) => {
              const color = serviceColors[idx % serviceColors.length];
              return (
                  <div key={s.id} className="mp-card-hover p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15`, color }}>
                      <Wrench size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-[var(--mp-text-primary)] truncate">{s.title}</h3>
                        <Badge variant={s.is_active ? "success" : "danger"}>{s.is_active ? "Activo" : "Inactivo"}</Badge>
                      </div>
                      <p className="text-sm font-bold mt-1" style={{ color }}>{s.price ? `$${s.price}` : "A consultar →"}</p>
                    </div>
                  </div>
                  {s.category && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--mp-bg-elevated)] text-[var(--mp-text-secondary)] mb-2"><Tags size={10} />{s.category}</span>}
                  <p className="text-xs text-[var(--mp-text-tertiary)] line-clamp-2 mb-3">{s.description || "Sin descripción"}</p>
                  {s.features && s.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {s.features.slice(0, 3).map((f, i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--mp-bg-elevated)] text-[var(--mp-text-secondary)]">{f}</span>)}
                      {s.features.length > 3 && <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--mp-bg-elevated)] text-[var(--mp-text-tertiary)]">+{s.features.length - 3}</span>}
                    </div>
                  )}
                  <div className="flex items-center justify-end pt-3 gap-1.5 border-t border-[var(--mp-border-subtle)]">
                    <button onClick={() => navigate(`/services/${s.id}/edit`)} className="mp-btn-ghost text-xs py-1.5 px-2.5"><Pencil size={12} /> Editar</button>
                    <button onClick={() => setDeleteConfirm(s.id)} className="mp-btn text-xs py-1.5 px-2.5 text-[var(--mp-danger)] bg-[var(--mp-danger-bg)] hover:bg-[rgba(239,68,68,0.2)]"><Trash2 size={12} /> Eliminar</button>
                  </div>
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[var(--mp-border)]">
              <span className="text-xs text-[var(--mp-text-tertiary)]">Mostrando {(page - 1) * PAGE_SIZE + 1} a {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} servicios</span>
              <Pagination page={page} perPage={PAGE_SIZE} total={filtered.length} onChange={setPage} />
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mp-card overflow-hidden">
            <table className="w-full">
              <thead>
                  <tr className="border-b border-[var(--mp-border)]">
                    <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3">Servicio</th>
                    <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 hidden md:table-cell">Precio</th>
                    <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 hidden lg:table-cell">Categoría</th>
                    <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 hidden lg:table-cell">Duración</th>
                    <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3">Estado</th>
                    <th className="text-right text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3">Acciones</th>
                  </tr>
              </thead>
              <tbody>
                {paginated.map((s, idx) => {
                  const color = serviceColors[idx % serviceColors.length];
                  return (
                    <tr key={s.id} className="border-b border-[var(--mp-border-subtle)] hover:bg-[var(--mp-bg-elevated)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}15`, color }}>
                            <Wrench size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[var(--mp-text-primary)]">{s.title}</p>
                            <p className="text-xs text-[var(--mp-text-tertiary)] line-clamp-1">{s.description || "Sin descripción"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm font-bold" style={{ color }}>{s.price ? `$${s.price}` : "A consultar"}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-[var(--mp-text-secondary)] flex items-center gap-1"><Tags size={10} /> {s.category || "—"}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-[var(--mp-text-secondary)] flex items-center gap-1"><Clock size={10} /> {s.duration || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={s.is_active ? "success" : "danger"}>{s.is_active ? "Activo" : "Inactivo"}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/services/${s.id}/edit`)} className="mp-btn-ghost text-xs py-1.5 px-2"><Pencil size={12} /></button>
                          <button onClick={() => setDeleteConfirm(s.id)} className="mp-btn text-xs py-1.5 px-2 text-[var(--mp-danger)] bg-[var(--mp-danger-bg)] hover:bg-[rgba(239,68,68,0.2)]"><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[var(--mp-border)]">
              <span className="text-xs text-[var(--mp-text-tertiary)]">Mostrando {(page - 1) * PAGE_SIZE + 1} a {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} servicios</span>
              <Pagination page={page} perPage={PAGE_SIZE} total={filtered.length} onChange={setPage} />
            </div>
          )}
        </>
      )}

      {/* Category Manager Modal */}
      <Modal open={catManagerOpen} onClose={() => setCatManagerOpen(false)} title="Gestionar Categorías" size="md">
        <div className="space-y-4">
          <button onClick={() => setCatEditModal({ name: "" })}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-[var(--mp-border)] text-xs font-medium text-[var(--mp-text-tertiary)] hover:border-interactive-accent hover:text-interactive-accent transition-all">
            <Plus size={14} /> Nueva Categoría
          </button>
          {categories.length === 0 ? (
            <p className="text-xs text-[var(--mp-text-tertiary)] text-center py-4">No hay categorías creadas</p>
          ) : (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {categories.map(c => (
                <div key={c.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--mp-bg-elevated)] transition-colors">
                  <div className="flex items-center gap-2">
                    <Tags size={14} className="text-[var(--mp-text-tertiary)]" />
                    <span className="text-sm text-[var(--mp-text-primary)]">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCatEditModal({ id: c.id, name: c.name })}
                      className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)]"><Pencil size={13} /></button>
                    <button onClick={() => handleDeleteCategory(c.id)}
                      className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-danger)] hover:bg-[rgba(239,68,68,0.08)]"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Category Edit/Create Modal */}
      <Modal open={!!catEditModal} onClose={() => setCatEditModal(null)} title={catEditModal?.id ? "Editar Categoría" : "Nueva Categoría"} size="sm">
        <div className="space-y-4">
          <input value={catEditModal?.name || ""} onChange={(e) => setCatEditModal(p => p ? { ...p, name: e.target.value } : null)}
            className="mp-input text-sm" placeholder="Nombre de la categoría" autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSaveCategory(); } }} />
          <div className="flex items-center gap-3 justify-end">
            <button onClick={() => setCatEditModal(null)} className="mp-btn-ghost text-xs">Cancelar</button>
            <button onClick={handleSaveCategory} className="mp-btn-primary text-xs">
              {catEditModal?.id ? "Actualizar" : "Crear"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Eliminar servicio" size="sm">
        <p className="text-sm text-[var(--mp-text-secondary)] mb-4">¿Estás seguro de eliminar este servicio?</p>
        <div className="flex items-center gap-3 justify-end">
          <button onClick={() => setDeleteConfirm(null)} className="mp-btn-ghost text-xs">Cancelar</button>
          <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="mp-btn text-xs text-[var(--mp-danger)] bg-[var(--mp-danger-bg)] hover:bg-[rgba(239,68,68,0.2)]">Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}