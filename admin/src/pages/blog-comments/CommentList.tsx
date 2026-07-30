import { useState, useEffect, useMemo } from "react";
import { api } from "@/api/client";
import { Search, Check, Trash2, MessageSquare, ExternalLink } from "lucide-react";
import { useToast } from "@/components/Toast";
import { Modal } from "@shared/components/ui/Modal";
import { Pagination } from "@shared/components/ui/Pagination";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";

const PAGE_SIZE = 20;

export default function CommentList() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetch = () => {
    setLoading(true);
    api.get(`/blog-comments?all=1&limit=1000`).then(r => {
      const data = r?.data || r || [];
      setComments(Array.isArray(data) ? data : []);
    }).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const filtered = useMemo(() => {
    let r = comments;
    if (filter === "pending") r = r.filter(c => !c.is_approved);
    if (filter === "approved") r = r.filter(c => c.is_approved);
    if (search.trim()) { const q = search.toLowerCase(); r = r.filter(c => c.author_name?.toLowerCase().includes(q) || c.content?.toLowerCase().includes(q)); }
    return r;
  }, [comments, search, filter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleApprove = async (id: string) => {
    try { await api.put(`/blog-comments/${id}/approve`); showToast("success", "Comentario aprobado"); fetch(); }
    catch { showToast("error", "Error al aprobar"); }
  };

  const handleDelete = async (id: string) => {
    try { await api.delete(`/blog-comments/${id}`); showToast("success", "Comentario eliminado"); setDeleteConfirm(null); fetch(); }
    catch { showToast("error", "Error al eliminar"); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Comentarios" description="Modera los comentarios de los artículos del blog." breadcrumbs={[{ label: "Blog", to: "/comments" }, { label: "Comentarios" }]} icon={<MessageSquare size={20} />} />
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] pointer-events-none" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar comentarios..." className="mp-input pl-9 text-sm" />
        </div>
        <div className="flex gap-1 p-0.5 rounded-xl bg-[var(--mp-bg-elevated)]">
          {(["pending", "approved", "all"] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "bg-[var(--mp-bg-card)] text-[var(--mp-accent)] shadow-sm" : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-secondary)]"}`}>
              {f === "all" ? "Todos" : f === "pending" ? "Pendientes" : "Aprobados"}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {loading ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="mp-card p-4 animate-pulse"><div className="h-4 rounded bg-[var(--mp-bg-elevated)] w-1/3 mb-2" /><div className="h-3 rounded bg-[var(--mp-bg-elevated)] w-2/3" /></div>)
        : paginated.length === 0 ? <EmptyState icon={MessageSquare} title={filter === "pending" ? "No hay comentarios pendientes" : "Sin resultados"} description={filter === "pending" ? "Todos los comentarios han sido moderados." : undefined} />
        : paginated.map(c => (
          <div key={c.id} className={`mp-card p-4 border-l-4 ${c.is_approved ? "border-l-[var(--mp-success)]" : "border-l-amber-400"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-[var(--mp-text-primary)]">{c.author_name}</span>
                  <span className="text-xs text-[var(--mp-text-tertiary)]">{c.author_email || "—"}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.is_approved ? "bg-[rgba(16,185,129,0.1)] text-[var(--mp-success)]" : "bg-[rgba(245,158,11,0.1)] text-amber-500"}`}>{c.is_approved ? "Aprobado" : "Pendiente"}</span>
                </div>
                <p className="text-sm text-[var(--mp-text-secondary)] mb-2">{c.content}</p>
                <p className="text-[10px] text-[var(--mp-text-tertiary)]">{new Date(c.created_at).toLocaleString("es-ES")}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!c.is_approved && <button onClick={() => handleApprove(c.id)} className="p-2 rounded-lg text-[var(--mp-success)] hover:bg-[rgba(16,185,129,0.1)]" title="Aprobar"><Check size={16} /></button>}
                <button onClick={() => setDeleteConfirm(c.id)} className="p-2 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-danger)] hover:bg-[rgba(239,68,68,0.08)]" title="Eliminar"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--mp-text-tertiary)]">Mostrando {paginated.length} de {filtered.length}</span>
          <Pagination page={page} perPage={PAGE_SIZE} total={filtered.length} onChange={setPage} />
        </div>
      )}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Eliminar comentario" size="sm">
        <p className="text-sm text-[var(--mp-text-secondary)] mb-4">¿Estás seguro?</p>
        <div className="flex items-center gap-3 justify-end">
          <button onClick={() => setDeleteConfirm(null)} className="mp-btn-ghost text-xs">Cancelar</button>
          <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="mp-btn text-xs text-[var(--mp-danger)] bg-[rgba(239,68,68,0.08)] hover:bg-[rgba(239,68,68,0.15)]">Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}
