import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { Plus, Pencil, Trash2, Search, BookOpen } from "lucide-react";
import { useToast } from "@/components/Toast";
import { Modal } from "@shared/components/ui/Modal";
import { Pagination } from "@shared/components/ui/Pagination";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";

const PAGE_SIZE = 10;

export default function LegalList() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PAGE_SIZE);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetch = () => { setLoading(true); api.get("/legal?all=1").then(r => setPages(r || [])).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const filtered = useMemo(() => {
    let r = pages; if (search.trim()) { const q = search.toLowerCase(); r = r.filter(p => p.title.toLowerCase().includes(q)); } return r;
  }, [pages, search]);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = async (id: string) => {
    try { await api.delete(`/legal/${id}`); showToast("success", "Página eliminada"); setDeleteConfirm(null); fetch(); }
    catch { showToast("error", "Error al eliminar"); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Páginas Legales" description="Términos, políticas, avisos de privacidad." breadcrumbs={[{ label: "Contenido", to: "/legal" }, { label: "Legales" }]} icon={<BookOpen size={20} />}
        action={<button onClick={() => navigate("/legal/new")} className="mp-btn-primary text-xs"><Plus size={14} /> Nueva Página</button>} />
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] pointer-events-none" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar..." className="mp-input pl-9 text-sm" />
      </div>
      <div className="mp-card overflow-hidden">
        <table className="mp-table">
          <thead><tr><th>Título</th><th className="hidden lg:table-cell">Slug</th><th className="text-center">Estado</th><th className="text-right w-28">Acciones</th></tr></thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-10 rounded-lg bg-[var(--mp-bg-elevated)] animate-pulse" /></td></tr>)
            : paginated.length === 0 ? <tr><td colSpan={4}><EmptyState icon={BookOpen} title={search ? "Sin resultados" : "No hay páginas"} description={search ? `No hay páginas que coincidan` : "Crea tu primera página legal."} actions={!search ? [{ label: "Nueva Página", onClick: () => navigate("/legal/new") }] : undefined} /></td></tr>
            : paginated.map(p => (
              <tr key={p.id} className="cursor-pointer" onClick={() => navigate(`/legal/${p.id}/edit`)}>
                <td className="px-4 py-3"><span className="text-sm font-semibold text-[var(--mp-text-primary)]">{p.title}</span></td>
                <td className="hidden lg:table-cell px-4 py-3"><span className="text-xs text-[var(--mp-text-tertiary)]">/{p.slug}</span></td>
                <td className="text-center px-4 py-3"><span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${p.is_published ? "bg-[rgba(16,185,129,0.1)] text-[var(--mp-success)]" : "bg-[rgba(239,68,68,0.1)] text-[var(--mp-danger)]"}`}><span className={`w-1.5 h-1.5 rounded-full ${p.is_published ? "bg-[var(--mp-success)]" : "bg-[var(--mp-danger)]"}`} />{p.is_published ? "Publicado" : "Borrador"}</span></td>
                <td className="text-right px-4 py-3">
                  <div className="inline-flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => navigate(`/legal/${p.id}/edit`)} className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)]"><Pencil size={14} /></button>
                    <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-danger)] hover:bg-[rgba(239,68,68,0.08)]"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--mp-text-tertiary)]">Mostrando {(page - 1) * perPage + 1} a {Math.min(page * perPage, filtered.length)} de {filtered.length} páginas</span>
          <Pagination page={page} perPage={perPage} total={filtered.length} onChange={setPage} />
        </div>
      )}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Eliminar página" size="sm">
        <p className="text-sm text-[var(--mp-text-secondary)] mb-4">¿Estás seguro?</p>
        <div className="flex items-center gap-3 justify-end">
          <button onClick={() => setDeleteConfirm(null)} className="mp-btn-ghost text-xs">Cancelar</button>
          <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="mp-btn text-xs text-[var(--mp-danger)] bg-[rgba(239,68,68,0.08)] hover:bg-[rgba(239,68,68,0.15)]">Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}
