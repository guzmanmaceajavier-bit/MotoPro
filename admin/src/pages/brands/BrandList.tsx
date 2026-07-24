import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { Plus, Pencil, Trash2, Search, Tags, Car, MoreHorizontal, Filter, Download, List, Grid, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/components/Toast";
import { Brand } from "@/types";
import { Modal } from "@shared/components/ui/Modal";
import { Pagination } from "@shared/components/ui/Pagination";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";

function parseModels(m: unknown): string[] {
  try { const p = JSON.parse(String(m)); return Array.isArray(p) ? p : []; } catch { return []; }
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function relativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) return `Hace ${Math.floor(days / 7)} sem`;
  return `Hace ${Math.floor(days / 30)} mes`;
}

const PAGE_SIZE = 10;

export default function BrandList() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "with_models" | "without_models">("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PAGE_SIZE);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchBrands = () => { setLoading(true); api.get("/brands").then((r) => setBrands(r || [])).finally(() => setLoading(false)); };
  useEffect(() => { fetchBrands(); }, []);

  const enriched = useMemo(() => brands.map((b) => ({ ...b, _models: parseModels(b.models), _vehicleCount: (b as any).vehicle_count || 0 })), [brands]);

  const stats = useMemo(() => {
    const total = enriched.length;
    const totalModels = enriched.reduce((s, b) => s + b._models.length, 0);
    const withModels = enriched.filter(b => b._models.length > 0).length;
    const withoutModels = enriched.filter(b => b._models.length === 0).length;
    const withModelsPct = total > 0 ? Math.round((withModels / total) * 100) : 0;
    const withoutModelsPct = total > 0 ? Math.round((withoutModels / total) * 100) : 0;
    return { total, totalModels, withModels, withoutModels, withModelsPct, withoutModelsPct };
  }, [enriched]);

  const filtered = useMemo(() => {
    let result = enriched;
    if (search.trim()) result = result.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
    if (filter === "with_models") result = result.filter(b => b._models.length > 0);
    if (filter === "without_models") result = result.filter(b => b._models.length === 0);
    return [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [enriched, search, filter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = async (id: string) => {
    try { await api.delete(`/brands/${id}`); showToast("success", "Marca eliminada"); setDeleteConfirm(null); fetchBrands(); }
    catch { showToast("error", "Error al eliminar"); }
  };

  const exportData = (type: "csv" | "xls") => {
    const data = filtered.map(b => ({
      Marca: b.name, Modelos: parseModels(b.models).length, Vehículos: (b as any).vehicle_count || 0,
      Creada: new Date(b.created_at).toLocaleDateString("es-ES"),
    }));
    const blob = new Blob([Object.keys(data[0] || {}).join(",") + "\n" + data.map(r => Object.values(r).join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `marcas.${type === "csv" ? "csv" : "xlsx"}`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Marcas"
        description="Administra las marcas de vehículos registradas en el sistema."
        breadcrumbs={[{ label: "Catálogo", to: "/brands" }, { label: "Marcas" }]}
        icon={<Tags size={20} />}
        action={<button onClick={() => navigate("/brands/new")} className="mp-btn-primary text-xs"><Plus size={14} /> Nueva Marca</button>}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Marcas */}
        <div className="mp-kpi group">
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-bold text-[var(--mp-text-tertiary)] uppercase tracking-wider">Total Marcas</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(59,130,246,0.1)] text-[#3B82F6]"><Tags size={18} /></div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-[var(--mp-text-primary)]">{stats.total}</p>
          <p className="text-[11px] text-[var(--mp-success)] mt-1">↑ 12% vs. el mes pasado</p>
        </div>

        {/* Total Modelos */}
        <div className="mp-kpi group">
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-bold text-[var(--mp-text-tertiary)] uppercase tracking-wider">Total Modelos</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(20,184,166,0.1)] text-[var(--mp-accent)]"><Car size={18} /></div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-[var(--mp-text-primary)]">{stats.totalModels}</p>
          <p className="text-[11px] text-[var(--mp-text-tertiary)] mt-1">En todas las marcas</p>
        </div>

        {/* Con Modelos */}
        <div className="mp-kpi group">
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-bold text-[var(--mp-text-tertiary)] uppercase tracking-wider">Con Modelos</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(16,185,129,0.1)] text-[var(--mp-success)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></svg>
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-[var(--mp-text-primary)]">{stats.withModels}</p>
          <p className="text-[11px] text-[var(--mp-text-tertiary)] mt-1">{stats.withModelsPct}% del total</p>
          <div className="w-full h-1.5 rounded-full bg-[var(--mp-bg-elevated)] mt-3 overflow-hidden">
            <div className="h-full rounded-full bg-[var(--mp-success)] transition-all duration-500" style={{ width: `${stats.withModelsPct}%` }} />
          </div>
        </div>

        {/* Sin Modelos */}
        <div className="mp-kpi group">
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-bold text-[var(--mp-text-tertiary)] uppercase tracking-wider">Sin Modelos</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(245,158,11,0.1)] text-[var(--mp-warning)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></svg>
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-[var(--mp-text-primary)]">{stats.withoutModels}</p>
          <p className="text-[11px] text-[var(--mp-text-tertiary)] mt-1">{stats.withoutModelsPct}% del total</p>
          <div className="w-full h-1.5 rounded-full bg-[var(--mp-bg-elevated)] mt-3 overflow-hidden">
            <div className="h-full rounded-full bg-[var(--mp-warning)] transition-all duration-500" style={{ width: `${stats.withoutModelsPct}%` }} />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] pointer-events-none" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar marcas..." className="mp-input pl-9 text-sm" />
        </div>
        <div className="flex gap-1 p-0.5 rounded-xl bg-[var(--mp-bg-elevated)]">
          {(["all", "with_models", "without_models"] as const).map((f) => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "bg-[var(--mp-bg-card)] text-[var(--mp-accent)] shadow-sm border border-[var(--mp-border)]" : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-secondary)]"}`}>
              {f === "all" ? "Todas" : f === "with_models" ? "Con modelos" : "Sin modelos"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button className="mp-btn-ghost text-xs"><Filter size={13} /> Filtros</button>
          <div className="relative group">
            <button className="mp-btn-ghost text-xs"><Download size={13} /> Exportar <ChevronDown size={12} /></button>
            <div className="absolute right-0 top-full mt-1 w-36 py-1 rounded-xl bg-[var(--mp-bg-card)] border border-[var(--mp-border)] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button onClick={() => exportData("csv")} className="w-full text-left px-3 py-2 text-xs text-[var(--mp-text-secondary)] hover:bg-[var(--mp-bg-hover)]">Exportar CSV</button>
              <button onClick={() => exportData("xls")} className="w-full text-left px-3 py-2 text-xs text-[var(--mp-text-secondary)] hover:bg-[var(--mp-bg-hover)]">Exportar Excel</button>
            </div>
          </div>
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
                  <th>Marca</th>
                  <th className="text-center">Modelos</th>
                  <th className="text-center hidden lg:table-cell">Vehículos</th>
                  <th className="hidden lg:table-cell">Estado</th>
                  <th className="hidden lg:table-cell">Creada</th>
                  <th className="text-right w-28">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-10 rounded-lg bg-[var(--mp-bg-elevated)] animate-pulse" /></td></tr>)
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={6}>
                    <EmptyState icon={Tags} title={search ? "Sin resultados" : "No hay marcas"} description={search ? `No hay marcas que coincidan con "${search}"` : "Registra tu primera marca para comenzar."} actions={!search ? [{ label: "Nueva Marca", onClick: () => navigate("/brands/new") }] : undefined} />
                  </td></tr>
                ) : (
                  paginated.map((brand) => {
                    const models = parseModels(brand.models);
                    const vehicleCount = (brand as any).vehicle_count || 0;
                    const hasModels = models.length > 0;
                    return (
                      <tr key={brand.id} className="cursor-pointer" onClick={() => navigate(`/brands/${brand.id}/edit`)}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--mp-info-bg)] flex items-center justify-center shrink-0 overflow-hidden">
                              {brand.image ? <img src={brand.image} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-[var(--mp-info)]">{getInitials(brand.name)}</span>}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[var(--mp-text-primary)]">{brand.name}</p>
                              <p className="text-xs text-[var(--mp-text-tertiary)]">/{brand.name.toLowerCase().replace(/\s+/g, "-")}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="text-sm font-semibold text-[var(--mp-text-primary)]">{models.length}</span>
                          <p className="text-[10px] text-[var(--mp-text-tertiary)]">modelos</p>
                        </td>
                        <td className="text-center hidden lg:table-cell">
                          <span className="text-sm font-semibold text-[var(--mp-text-primary)]">{vehicleCount}</span>
                          <p className="text-[10px] text-[var(--mp-text-tertiary)]">vehículos</p>
                        </td>
                        <td className="hidden lg:table-cell">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${hasModels ? "bg-[rgba(16,185,129,0.1)] text-[var(--mp-success)]" : "bg-[rgba(245,158,11,0.1)] text-[var(--mp-warning)]"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${hasModels ? "bg-[var(--mp-success)]" : "bg-[var(--mp-warning)]"}`} />
                            {hasModels ? "Activa" : "Sin modelos"}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell">
                          <div>
                            <p className="text-xs text-[var(--mp-text-secondary)]">{new Date(brand.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</p>
                            <p className="text-[10px] text-[var(--mp-text-tertiary)]">{relativeTime(brand.created_at)}</p>
                          </div>
                        </td>
                        <td className="text-right">
                          <div className="inline-flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => navigate(`/brands/${brand.id}/edit`)} className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)] transition-colors" title="Editar"><Pencil size={14} /></button>
                            <button onClick={() => setDeleteConfirm(brand.id)} className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-danger)] hover:bg-[rgba(239,68,68,0.08)] transition-colors" title="Eliminar"><Trash2 size={14} /></button>
                            <button className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)] transition-colors" title="Más"><MoreHorizontal size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="sm:hidden divide-y divide-[var(--mp-border-subtle)]">
            {paginated.map((brand) => {
              const models = parseModels(brand.models);
              const hasModels = models.length > 0;
              return (
                <div key={brand.id} className="p-4 hover:bg-[var(--mp-bg-hover)] transition-colors cursor-pointer" onClick={() => navigate(`/brands/${brand.id}/edit`)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--mp-info-bg)] flex items-center justify-center shrink-0">
                      {brand.image ? <img src={brand.image} alt="" className="w-full h-full object-cover rounded-xl" /> : <span className="text-xs font-bold text-[var(--mp-info)]">{getInitials(brand.name)}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--mp-text-primary)]">{brand.name}</p>
                      <p className="text-xs text-[var(--mp-text-tertiary)]">{models.length} modelos · {(brand as any).vehicle_count || 0} vehículos</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium ${hasModels ? "bg-[rgba(16,185,129,0.1)] text-[var(--mp-success)]" : "bg-[rgba(245,158,11,0.1)] text-[var(--mp-warning)]"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${hasModels ? "bg-[var(--mp-success)]" : "bg-[var(--mp-warning)]"}`} />
                      {hasModels ? "Activa" : "Sin modelos"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <div key={i} className="mp-card p-5 h-40 animate-pulse" />)
          ) : paginated.length === 0 ? (
            <div className="col-span-full"><EmptyState icon={Tags} title="No hay marcas" description="Registra tu primera marca." actions={[{ label: "Nueva Marca", onClick: () => navigate("/brands/new") }]} /></div>
          ) : (
            paginated.map((brand) => {
              const models = parseModels(brand.models);
              const vehicleCount = (brand as any).vehicle_count || 0;
              return (
                <div key={brand.id} className="mp-card p-5 cursor-pointer hover:border-[var(--mp-border-hover)] transition-all" onClick={() => navigate(`/brands/${brand.id}/edit`)}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-[var(--mp-info-bg)] flex items-center justify-center shrink-0 overflow-hidden">
                      {brand.image ? <img src={brand.image} alt="" className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-[var(--mp-info)]">{getInitials(brand.name)}</span>}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--mp-text-primary)]">{brand.name}</p>
                      <p className="text-xs text-[var(--mp-text-tertiary)]">/{brand.name.toLowerCase().replace(/\s+/g, "-")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[var(--mp-text-secondary)] mb-3">
                    <span>{models.length} modelos</span>
                    <span>{vehicleCount} vehículos</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium ${models.length > 0 ? "bg-[rgba(16,185,129,0.1)] text-[var(--mp-success)]" : "bg-[rgba(245,158,11,0.1)] text-[var(--mp-warning)]"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${models.length > 0 ? "bg-[var(--mp-success)]" : "bg-[var(--mp-warning)]"}`} />
                      {models.length > 0 ? "Activa" : "Sin modelos"}
                    </span>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => navigate(`/brands/${brand.id}/edit`)} className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)]"><Pencil size={13} /></button>
                      <button onClick={() => setDeleteConfirm(brand.id)} className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-danger)] hover:bg-[rgba(239,68,68,0.08)]"><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <span className="text-xs text-[var(--mp-text-tertiary)]">
            Mostrando {(page - 1) * perPage + 1} a {Math.min(page * perPage, filtered.length)} de {filtered.length} marcas
          </span>
          <div className="flex items-center gap-4">
            <Pagination page={page} perPage={perPage} total={filtered.length} onChange={setPage} />
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--mp-text-tertiary)]">Mostrar</span>
              <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                className="mp-select text-xs py-1 px-2 w-16">
                {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span className="text-xs text-[var(--mp-text-tertiary)]">por página</span>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Eliminar marca" size="sm">
        <p className="text-sm text-[var(--mp-text-secondary)] mb-4">¿Estás seguro de eliminar esta marca? Esta acción no se puede deshacer.</p>
        <div className="flex items-center gap-3 justify-end">
          <button onClick={() => setDeleteConfirm(null)} className="mp-btn-ghost text-xs">Cancelar</button>
          <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="mp-btn text-xs text-[var(--mp-danger)] bg-[rgba(239,68,68,0.08)] hover:bg-[rgba(239,68,68,0.15)]">Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}
