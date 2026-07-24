import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { Plus, FileText, Eye, Clock, Search, Grid3X3, List, Calendar, User } from "lucide-react";
import { useToast } from "@/components/Toast";
import { BlogPost } from "@/types";
import { Pagination } from "@shared/components/ui/Pagination";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@shared/components/ui/KpiCard";
import { Modal } from "@shared/components/ui/Modal";

const PAGE_SIZE = 12;

const gradients = [
  "linear-gradient(135deg,#0EA5E9,#06B6D4)",
  "linear-gradient(135deg,#6366F1,#818CF8)",
  "linear-gradient(135deg,#F59E0B,#F97316)",
  "linear-gradient(135deg,#10B981,#34D399)",
  "linear-gradient(135deg,#EC4899,#F472B6)",
  "linear-gradient(135deg,#8B5CF6,#A78BFA)",
];

const categoryColors: Record<string, string> = {
  Mantenimiento: "#10B981",
  Seguridad: "#3B82F6",
  Consejos: "#F59E0B",
  General: "#8B5CF6",
};

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetch = () => {
    setLoading(true);
    api
      .get("/blog?all=1")
      .then((r) => setPosts(r?.data || r || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, sortOrder]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/blog/${id}`);
      showToast("success", "Artículo eliminado");
      setDeleteId(null);
      fetch();
    } catch {
      showToast("error", "Error al eliminar");
      setDeleteId(null);
    }
  };

  const uniqueCategories = Array.from(
    new Set(posts.map((p) => p.category).filter(Boolean))
  );

  const filtered = posts
    .filter(
      (p) =>
        !search ||
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.author?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((p) => categoryFilter === "all" || p.category === categoryFilter)
    .sort((a, b) => {
      if (sortOrder === "oldest")
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      if (sortOrder === "title")
        return (a.title || "").localeCompare(b.title || "");
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  const published = posts.filter((p) => p.is_published === 1).length;
  const drafts = posts.filter((p) => p.is_published === 0).length;

  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Blog"
        description="Crea contenido para atraer clientes"
        breadcrumbs={[
          { label: "Dashboard", to: "/" },
          { label: "Blog" },
        ]}
        action={
          <button
            onClick={() => navigate("/blog/new")}
            className="mp-btn-primary text-sm"
          >
            <Plus size={15} /> Nuevo Artículo
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <KpiCard
          title="Total de artículos"
          value={posts.length}
          icon={<FileText size={18} />}
          iconColor="green"
          subtitle="Artículos publicados"
        />
        <KpiCard
          title="Publicados"
          value={published}
          icon={<Eye size={18} />}
          iconColor="purple"
          subtitle="Visibles en el sitio"
        />
        <KpiCard
          title="Borradores"
          value={drafts}
          icon={<Clock size={18} />}
          iconColor="orange"
          subtitle="Pendientes por publicar"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, autor o categoría..."
            className="mp-input pl-9 text-sm"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="mp-input text-sm w-auto min-w-[160px]"
        >
          <option value="all">Todas las categorías</option>
          {uniqueCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="mp-input text-sm w-auto min-w-[150px]"
        >
          <option value="newest">Ordenar: Más recientes</option>
          <option value="oldest">Más antiguos</option>
          <option value="title">Título A-Z</option>
        </select>

        <div className="flex items-center border border-[var(--mp-border)] rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 transition-colors ${
              viewMode === "grid"
                ? "bg-[var(--mp-accent)] text-white"
                : "bg-[var(--mp-bg-surface)] text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-secondary)]"
            }`}
            type="button"
            title="Vista cuadrícula"
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 transition-colors ${
              viewMode === "list"
                ? "bg-[var(--mp-accent)] text-white"
                : "bg-[var(--mp-bg-surface)] text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-secondary)]"
            }`}
            type="button"
            title="Vista lista"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="mp-card overflow-hidden">
              <div className="h-44 bg-[var(--mp-bg-elevated)] animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-[var(--mp-bg-elevated)] rounded animate-pulse w-1/3" />
                <div className="h-5 bg-[var(--mp-bg-elevated)] rounded animate-pulse w-3/4" />
                <div className="h-3 bg-[var(--mp-bg-elevated)] rounded animate-pulse w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center rounded-lg border border-[var(--mp-border)] bg-[var(--mp-bg-surface)]">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 bg-[rgba(16,185,129,0.1)] text-[var(--mp-success)]">
            <FileText size={24} />
          </div>
          <h3 className="text-lg font-semibold text-[var(--mp-text-primary)] mb-1.5">
            Crea tu primer artículo
          </h3>
          <p className="text-sm text-[var(--mp-text-tertiary)] mb-6">
            Los artículos del blog ayudan a atraer clientes y posicionar tu
            negocio en buscadores.
          </p>
          <button
            onClick={() => navigate("/blog/new")}
            className="mp-btn-primary text-sm"
          >
            <Plus size={14} /> Crear Artículo
          </button>
        </div>
      ) : filtered.length === 0 && search ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center rounded-lg border border-[var(--mp-border)] bg-[var(--mp-bg-surface)]">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 bg-[rgba(16,185,129,0.1)] text-[var(--mp-success)]">
            <FileText size={24} />
          </div>
          <h3 className="text-lg font-semibold text-[var(--mp-text-primary)] mb-1.5">
            Sin resultados
          </h3>
          <p className="text-sm text-[var(--mp-text-tertiary)] mb-6">
            No hay artículos que coincidan con "{search}"
          </p>
          <button
            onClick={() => setSearch("")}
            className="mp-btn-ghost text-sm"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-[var(--mp-text-secondary)]">
              {filtered.length} artículos
            </span>
            <span className="text-xs text-[var(--mp-text-tertiary)]">
              Mostrando {paginated.length} de {filtered.length}
            </span>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginated.map((post, idx) => (
                <article
                  key={post.id}
                  className="mp-card overflow-hidden group hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/blog/${post.id}/edit`)}
                >
                  <div
                    className="h-44 relative flex items-end p-5"
                    style={{
                      background:
                        post.image || gradients[idx % gradients.length],
                    }}
                  >
                    {post.image && (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    <span
                      className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg text-white/95 backdrop-blur-sm z-10"
                      style={{
                        background:
                          categoryColors[post.category || "General"] ||
                          "#8B5CF6",
                      }}
                    >
                      {post.category || "General"}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-sm leading-tight text-[var(--mp-text-primary)] line-clamp-2 mb-2 group-hover:text-[var(--mp-accent)] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-[var(--mp-text-tertiary)] line-clamp-2 mb-4">
                      {post.excerpt ||
                        (post.content
                          ? post.content.replace(/<[^>]*>/g, "").slice(0, 120)
                          : "Sin contenido")}
                    </p>
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-[var(--mp-border)] text-[var(--mp-text-secondary)]">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-5 h-5 rounded-full bg-[var(--mp-accent)] text-white flex items-center justify-center text-[10px] font-bold"
                        >
                          {(post.author || "A").charAt(0).toUpperCase()}
                        </span>
                        {post.author || "Admin"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={11} />
                        {new Date(post.created_at).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--mp-border)]">
                      <span className="text-[11px] text-[var(--mp-text-tertiary)]">
                        {Math.max(
                          1,
                          Math.ceil(
                            (post.content || "").split(/\s+/).length / 200
                          )
                        )}{" "}
                        min de lectura
                      </span>
                      <button
                        type="button"
                        className="text-[var(--mp-text-tertiary)] hover:text-[var(--mp-accent)] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        title="Guardar"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {paginated.map((post) => (
                <article
                  key={post.id}
                  className="mp-card flex items-center gap-5 p-4 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/blog/${post.id}/edit`)}
                >
                  <div
                    className="w-16 h-16 rounded-lg shrink-0 flex items-center justify-center text-white text-xs font-bold"
                    style={{
                      background:
                        post.image || "linear-gradient(135deg,#0EA5E9,#06B6D4)",
                    }}
                  >
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      post.title?.charAt(0) || "A"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-[var(--mp-text-primary)] truncate">
                      {post.title}
                    </h3>
                    <p className="text-xs text-[var(--mp-text-tertiary)] truncate mt-0.5">
                      {post.excerpt ||
                        (post.content
                          ? post.content.replace(/<[^>]*>/g, "").slice(0, 80)
                          : "")}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[var(--mp-text-tertiary)]">
                      <span className="flex items-center gap-1">
                        <User size={10} /> {post.author || "Admin"}
                      </span>
                      <span>
                        {new Date(post.created_at).toLocaleDateString("es-ES", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white"
                        style={{
                          background:
                            categoryColors[post.category || "General"] ||
                            "#8B5CF6",
                        }}
                      >
                        {post.category || "General"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        post.is_published === 1
                          ? "bg-[rgba(16,185,129,0.1)] text-[var(--mp-success)]"
                          : "bg-[rgba(245,158,11,0.1)] text-[var(--mp-warning)]"
                      }`}
                    >
                      {post.is_published === 1 ? "Publicado" : "Borrador"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}

          {filtered.length > PAGE_SIZE && (
            <div className="mt-6">
              <Pagination
                page={page}
                perPage={PAGE_SIZE}
                total={filtered.length}
                onChange={setPage}
              />
            </div>
          )}
        </>
      )}

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Eliminar artículo"
        size="sm"
      >
        <p className="text-sm text-[var(--mp-text-secondary)] mb-4">
          ¿Estás seguro de eliminar este artículo? Esta acción no se puede
          deshacer.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setDeleteId(null)}
            className="mp-btn-ghost text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={() => deleteId && handleDelete(deleteId)}
            className="mp-btn-danger text-sm"
          >
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  );
}
