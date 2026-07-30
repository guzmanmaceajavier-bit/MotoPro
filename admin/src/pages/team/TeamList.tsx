import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { Plus, Pencil, Trash2, Search, Users, Award, Filter, List, Grid } from "lucide-react";
import { useToast } from "@/components/Toast";
import { Modal } from "@shared/components/ui/Modal";
import { Pagination } from "@shared/components/ui/Pagination";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  experience: string;
  description: string;
  image?: string;
  sort_order: number;
  created_at: string;
}

const PAGE_SIZE = 10;

export default function TeamList() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PAGE_SIZE);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchMembers = () => {
    setLoading(true);
    api.get("/team")
      .then((r) => setMembers(r || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMembers(); }, []);

  const stats = useMemo(() => {
    const total = members.length;
    const specialties = [...new Set(members.map(m => m.specialty).filter(Boolean))].length;
    return { total, specialties };
  }, [members]);

  const filtered = useMemo(() => {
    let result = members;
    if (search.trim()) {
      result = result.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.role.toLowerCase().includes(search.toLowerCase()) ||
        m.specialty.toLowerCase().includes(search.toLowerCase())
      );
    }
    return [...result].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [members, search]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/team/${id}`);
      showToast("success", "Miembro eliminado");
      setDeleteConfirm(null);
      fetchMembers();
    } catch {
      showToast("error", "Error al eliminar");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Equipo"
        description="Gestiona los miembros de tu equipo técnico."
        breadcrumbs={[{ label: "Contenido", to: "/team" }, { label: "Equipo" }]}
        icon={<Users size={20} />}
        action={
          <button onClick={() => navigate("/team/new")} className="mp-btn-primary text-xs">
            <Plus size={14} /> Nuevo Miembro
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="mp-kpi">
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-bold text-[var(--mp-text-tertiary)] uppercase tracking-wider">Total Miembros</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(59,130,246,0.1)] text-[#3B82F6]"><Users size={18} /></div>
          </div>
          <p className="text-2xl font-bold text-[var(--mp-text-primary)]">{stats.total}</p>
        </div>
        <div className="mp-kpi">
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-bold text-[var(--mp-text-tertiary)] uppercase tracking-wider">Especialidades</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(255,107,0,0.1)] text-[var(--mp-accent)]"><Award size={18} /></div>
          </div>
          <p className="text-2xl font-bold text-[var(--mp-text-primary)]">{stats.specialties}</p>
        </div>
        <div className="mp-kpi">
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-bold text-[var(--mp-text-tertiary)] uppercase tracking-wider">Con Foto</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(16,185,129,0.1)] text-[var(--mp-success)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" /></svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--mp-text-primary)]">{members.filter(m => m.image).length}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] pointer-events-none" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar miembros..." className="mp-input pl-9 text-sm" />
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
                  <th>Miembro</th>
                  <th>Especialidad</th>
                  <th className="hidden lg:table-cell">Experiencia</th>
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
                    <EmptyState icon={Users} title={search ? "Sin resultados" : "No hay miembros"} description={search ? `No hay miembros que coincidan con "${search}"` : "Agrega tu primer miembro del equipo."} actions={!search ? [{ label: "Nuevo Miembro", onClick: () => navigate("/team/new") }] : undefined} />
                  </td></tr>
                ) : (
                  paginated.map((m) => (
                    <tr key={m.id} className="cursor-pointer" onClick={() => navigate(`/team/${m.id}/edit`)}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[var(--mp-info-bg)] flex items-center justify-center shrink-0 overflow-hidden">
                            {m.image ? <img src={m.image} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-[var(--mp-info)]">{m.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</span>}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--mp-text-primary)]">{m.name}</p>
                            <p className="text-xs text-[var(--mp-text-tertiary)]">{m.role || "Sin rol"}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-[rgba(255,107,0,0.1)] text-[var(--mp-accent)]">
                          {m.specialty || "General"}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell">
                        <span className="text-sm text-[var(--mp-text-secondary)]">{m.experience || "—"}</span>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => navigate(`/team/${m.id}/edit`)} className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)]" title="Editar"><Pencil size={14} /></button>
                          <button onClick={() => setDeleteConfirm(m.id)} className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-danger)] hover:bg-[rgba(239,68,68,0.08)]" title="Eliminar"><Trash2 size={14} /></button>
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
            {paginated.map((m) => (
              <div key={m.id} className="p-4 hover:bg-[var(--mp-bg-hover)] transition-colors cursor-pointer" onClick={() => navigate(`/team/${m.id}/edit`)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--mp-info-bg)] flex items-center justify-center shrink-0">
                    {m.image ? <img src={m.image} alt="" className="w-full h-full object-cover rounded-xl" /> : <span className="text-xs font-bold text-[var(--mp-info)]">{m.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--mp-text-primary)]">{m.name}</p>
                    <p className="text-xs text-[var(--mp-text-tertiary)]">{m.specialty || "General"}</p>
                  </div>
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
            <div className="col-span-full"><EmptyState icon={Users} title="No hay miembros" description="Agrega tu primer miembro." actions={[{ label: "Nuevo Miembro", onClick: () => navigate("/team/new") }]} /></div>
          ) : (
            paginated.map((m) => (
              <div key={m.id} className="mp-card p-5 cursor-pointer hover:border-[var(--mp-border-hover)] transition-all" onClick={() => navigate(`/team/${m.id}/edit`)}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 rounded-xl bg-[var(--mp-info-bg)] flex items-center justify-center shrink-0 overflow-hidden">
                    {m.image ? <img src={m.image} alt="" className="w-full h-full object-cover" /> : <span className="text-lg font-bold text-[var(--mp-info)]">{m.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--mp-text-primary)]">{m.name}</p>
                    <p className="text-xs text-[var(--mp-text-tertiary)]">{m.role || "Sin rol"}</p>
                  </div>
                </div>
                <div className="mb-3">
                  <span className="px-2 py-1 rounded-lg text-xs font-medium bg-[rgba(255,107,0,0.1)] text-[var(--mp-accent)]">
                    {m.specialty || "General"}
                  </span>
                </div>
                <p className="text-sm text-[var(--mp-text-secondary)] line-clamp-2 mb-3">{m.description || "Sin descripción"}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--mp-text-tertiary)]">{m.experience || "Sin experiencia"}</span>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => navigate(`/team/${m.id}/edit`)} className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)]"><Pencil size={13} /></button>
                    <button onClick={() => setDeleteConfirm(m.id)} className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-danger)] hover:bg-[rgba(239,68,68,0.08)]"><Trash2 size={13} /></button>
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
            Mostrando {(page - 1) * perPage + 1} a {Math.min(page * perPage, filtered.length)} de {filtered.length} miembros
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
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Eliminar miembro" size="sm">
        <p className="text-sm text-[var(--mp-text-secondary)] mb-4">¿Estás seguro de eliminar este miembro? Esta acción no se puede deshacer.</p>
        <div className="flex items-center gap-3 justify-end">
          <button onClick={() => setDeleteConfirm(null)} className="mp-btn-ghost text-xs">Cancelar</button>
          <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="mp-btn text-xs text-[var(--mp-danger)] bg-[rgba(239,68,68,0.08)] hover:bg-[rgba(239,68,68,0.15)]">Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}
