import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { Plus, Pencil, Trash2, Search, Tags } from "lucide-react";
import { useToast } from "@/components/Toast";
import { Modal } from "@shared/components/ui/Modal";
import { Pagination } from "@shared/components/ui/Pagination";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

const PAGE_SIZE = 10;

export default function ServiceCategoryList() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PAGE_SIZE);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<ServiceCategory | null>(null);
  const [editName, setEditName] = useState("");
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetch = () => {
    setLoading(true);
    api.get("/service-categories").then(r => setCategories(r || [])).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    return categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [categories, search]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = async (id: string) => {
    try { await api.delete(`/service-categories/${id}`); showToast("success", "Categoría eliminada"); setDeleteConfirm(null); fetch(); }
    catch { showToast("error", "Error al eliminar"); }
  };

  const handleEdit = async () => {
    if (!editName.trim()) return;
    try {
      await api.put(`/service-categories/${editModal!.id}`, { name: editName });
      showToast("success", "Categoría actualizada");
      setEditModal(null);
      fetch();
    } catch { showToast("error", "Error al actualizar"); }
  };

  const handleCreate = async () => {
    if (!editName.trim()) return;
    try {
      await api.post("/service-categories", { name: editName });
      showToast("success", "Categoría creada");
      setEditModal(null);
      fetch();
    } catch { showToast("error", "Error al crear"); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Categorías de Servicios"
        description="Administra las categorías para clasificar los servicios del taller."
        breadcrumbs={[{ label: "Catálogo", to: "/service-categories" }, { label: "Categorías" }]}
        icon={<Tags size={20} />}
        action={
          <button onClick={() => { setEditModal({ id: "", name: "", slug: "", sort_order: 0, created_at: "" }); setEditName(""); }}
            className="mp-btn-primary text-xs"><Plus size={14} /> Nueva Categoría</button>
        }
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] pointer-events-none" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar categorías..." className="mp-input pl-9 text-sm" />
        </div>
      </div>

      <div className="mp-card overflow-hidden">
        <table className="mp-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th className="hidden lg:table-cell">Slug</th>
              <th className="text-center" style={{width: 80}}>Orden</th>
              <th className="text-right" style={{width: 100}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-10 rounded-lg bg-[var(--mp-bg-elevated)] animate-pulse" /></td></tr>)
            ) : paginated.length === 0 ? (
              <tr><td colSpan={4}>
                <EmptyState icon={Tags} title={search ? "Sin resultados" : "No hay categorías"} description={search ? `No hay categorías que coincidan con "${search}"` : "Crea tu primera categoría de servicio."}
                  actions={!search ? [{ label: "Nueva Categoría", onClick: () => { setEditModal({ id: "", name: "", slug: "", sort_order: 0, created_at: "" }); setEditName(""); } }] : undefined} />
              </td></tr>
            ) : (
              paginated.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[rgba(255,107,0,0.1)] flex items-center justify-center text-interactive-accent"><Tags size={16} /></div>
                      <span className="text-sm font-semibold text-[var(--mp-text-primary)]">{c.name}</span>
                    </div>
                  </td>
                  <td className="hidden lg:table-cell px-4 py-3"><span className="text-sm text-[var(--mp-text-tertiary)]">/{c.slug}</span></td>
                  <td className="text-center px-4 py-3"><span className="text-sm text-[var(--mp-text-secondary)]">{c.sort_order}</span></td>
                  <td className="text-right px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditModal(c); setEditName(c.name); }}
                        className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)]"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteConfirm(c.id)}
                        className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-danger)] hover:bg-[rgba(239,68,68,0.08)]"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--mp-text-tertiary)]">Mostrando {paginated.length} de {filtered.length} categorías</span>
          <Pagination page={page} perPage={perPage} total={filtered.length} onChange={setPage} />
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={editModal?.id ? "Editar Categoría" : "Nueva Categoría"} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5">Nombre</label>
            <input value={editName} onChange={(e) => setEditName(e.target.value)}
              className="mp-input text-sm" placeholder="Ej: Mecánica" autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); editModal?.id ? handleEdit() : handleCreate(); } }} />
          </div>
          <div className="flex items-center gap-3 justify-end">
            <button onClick={() => setEditModal(null)} className="mp-btn-ghost text-xs">Cancelar</button>
            <button onClick={editModal?.id ? handleEdit : handleCreate} className="mp-btn-primary text-xs">
              {editModal?.id ? "Actualizar" : "Crear"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Eliminar categoría" size="sm">
        <p className="text-sm text-[var(--mp-text-secondary)] mb-4">¿Estás seguro? Los servicios con esta categoría quedarán sin categoría.</p>
        <div className="flex items-center gap-3 justify-end">
          <button onClick={() => setDeleteConfirm(null)} className="mp-btn-ghost text-xs">Cancelar</button>
          <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="mp-btn text-xs text-[var(--mp-danger)] bg-[rgba(239,68,68,0.08)] hover:bg-[rgba(239,68,68,0.15)]">Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}
