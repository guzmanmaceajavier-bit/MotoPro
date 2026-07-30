import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { Plus, Pencil, Trash2, Search, Settings, Filter } from "lucide-react";
import { useToast } from "@/components/Toast";
import { Modal } from "@shared/components/ui/Modal";
import { Pagination } from "@shared/components/ui/Pagination";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";

interface ProcessStep {
  id: string; title: string; description: string; icon: string; color: string;
  is_active: number; sort_order: number;
}

const PAGE_SIZE = 10;

export default function ProcessStepList() {
  const [items, setItems] = useState<ProcessStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PAGE_SIZE);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetch = () => { setLoading(true); api.get("/process-steps?all=1").then(r => setItems(r || [])).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const filtered = useMemo(() => {
    let r = items;
    if (search.trim()) { const q = search.toLowerCase(); r = r.filter(v => v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q)); }
    return r;
  }, [items, search]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = async (id: string) => {
    try { await api.delete(`/process-steps/${id}`); showToast("success", "Paso eliminado"); setDeleteConfirm(null); fetch(); }
    catch { showToast("error", "Error al eliminar"); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Pasos del Proceso" description="Pasos del proceso de atención al cliente." breadcrumbs={[{ label: "Contenido", to: "/process-steps" }, { label: "Pasos" }]} icon={<Settings size={20} />}
        action={<button onClick={() => navigate("/process-steps/new")} className="mp-btn-primary text-xs"><Plus size={14} /> Nuevo Paso</button>} />
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] pointer-events-none" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar pasos..." className="mp-input pl-9 text-sm" />
        </div>
      </div>
      <div className="mp-card overflow-hidden">
        <table className="mp-table">
          <thead><tr><th>Paso</th><th className="hidden lg:table-cell">Icono</th><th className="text-center">Orden</th><th className="text-center">Estado</th><th className="text-right w-28">Acciones</th></tr></thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-10 rounded-lg bg-[var(--mp-bg-elevated)] animate-pulse" /></td></tr>)
            : paginated.length === 0 ? <tr><td colSpan={5}><EmptyState icon={Settings} title={search ? "Sin resultados" : "No hay pasos"} description={search ? `No hay pasos que coincidan con "${search}"` : "Crea tu primer paso."} actions={!search ? [{ label: "Nuevo Paso", onClick: () => navigate("/process-steps/new") }] : undefined} /></td></tr>
            : paginated.map(v => (
              <tr key={v.id} className="cursor-pointer" onClick={() => navigate(`/process-steps/${v.id}/edit`)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div style={{ backgroundColor: v.color + "20", color: v.color }} className="w-9 h-9 rounded-lg flex items-center justify-center"><Settings size={16} /></div>
                    <div><p className="text-sm font-semibold text-[var(--mp-text-primary)]">{v.title}</p><p className="text-xs text-[var(--mp-text-tertiary)] line-clamp-1">{v.description}</p></div>
                  </div>
                </td>
                <td className="hidden lg:table-cell px-4 py-3"><span className="text-xs text-[var(--mp-text-tertiary)]">{v.icon || "settings"}</span></td>
                <td className="text-center px-4 py-3"><span className="text-sm text-[var(--mp-text-secondary)]">{v.sort_order}</span></td>
                <td className="text-center px-4 py-3"><span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${v.is_active ? "bg-[rgba(16,185,129,0.1)] text-[var(--mp-success)]" : "bg-[rgba(239,68,68,0.1)] text-[var(--mp-danger)]"}`}><span className={`w-1.5 h-1.5 rounded-full ${v.is_active ? "bg-[var(--mp-success)]" : "bg-[var(--mp-danger)]"}`} />{v.is_active ? "Activo" : "Inactivo"}</span></td>
                <td className="text-right px-4 py-3">
                  <div className="inline-flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => navigate(`/process-steps/${v.id}/edit`)} className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)]"><Pencil size={14} /></button>
                    <button onClick={() => setDeleteConfirm(v.id)} className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-danger)] hover:bg-[rgba(239,68,68,0.08)]"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--mp-text-tertiary)]">Mostrando {(page - 1) * perPage + 1} a {Math.min(page * perPage, filtered.length)} de {filtered.length} pasos</span>
          <Pagination page={page} perPage={perPage} total={filtered.length} onChange={setPage} />
        </div>
      )}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Eliminar paso" size="sm">
        <p className="text-sm text-[var(--mp-text-secondary)] mb-4">¿Estás seguro de eliminar este paso?</p>
        <div className="flex items-center gap-3 justify-end">
          <button onClick={() => setDeleteConfirm(null)} className="mp-btn-ghost text-xs">Cancelar</button>
          <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="mp-btn text-xs text-[var(--mp-danger)] bg-[rgba(239,68,68,0.08)] hover:bg-[rgba(239,68,68,0.15)]">Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}
