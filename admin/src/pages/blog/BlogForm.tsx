import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import { Save, PenLine, User, Globe, Sparkles, Image as ImageIcon } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const accentOptions = [
  "#6366F1",
  "#8B5CF6",
  "#0EA5E9",
  "#10B981",
  "#F59E0B",
  "#EC4899",
  "#F97316",
  "#14B8A6",
];

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
}

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "sin-titulo"
  );
}

export default function BlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { showToast } = useToast();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    author: "",
    image: "",
    gradient: "",
    is_published: "1",
    accent: "#6366F1",
  });
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [manualSlug, setManualSlug] = useState(false);

  useEffect(() => {
    api
      .get("/blog-categories")
      .then((r) => setCategories(r?.data || r || []))
      .catch(() => {});
    if (isEdit) {
      api.get(`/blog/id/${id}`).then((p) => {
        const data = p?.data || p;
        setForm({
          title: data.title || "",
          slug: data.slug || "",
          excerpt: data.excerpt || "",
          content: data.content || "",
          category: data.category || "",
          author: data.author || "",
          image: data.image || "",
          gradient: data.gradient || "",
          is_published: String(data.is_published ?? "1"),
          accent: data.accent || "#6366F1",
        });
      });
    }
  }, [id, isEdit]);

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: manualSlug ? prev.slug : slugify(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, is_published: parseInt(form.is_published) };
      if (isEdit) await api.put(`/blog/${id}`, data);
      else await api.post("/blog", data);
      showToast("success", "Artículo guardado");
      navigate("/blog");
    } catch (err: unknown) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Error al guardar"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={isEdit ? "Editar Artículo" : "Nuevo Artículo"}
        description={
          isEdit
            ? "Actualiza el contenido del artículo"
            : "Escribe un nuevo artículo para el blog"
        }
        backTo="/blog"
        breadcrumbs={[
          { label: "Blog", to: "/blog" },
          { label: isEdit ? "Editar Artículo" : "Nuevo Artículo" },
        ]}
        action={
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              form.is_published === "1"
                ? "bg-[rgba(16,185,129,0.1)] text-[var(--mp-success)]"
                : "bg-[var(--mp-bg-elevated)] text-[var(--mp-text-tertiary)]"
            }`}
          >
            {form.is_published === "1" ? (
              <>
                <Sparkles size={11} /> Publicado
              </>
            ) : (
              "Borrador"
            )}
          </span>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="mp-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <PenLine
                  size={15}
                  style={{ color: form.accent }}
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--mp-text-tertiary)]">
                  Título del artículo
                </span>
              </div>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Escribe un título impactante..."
                className="mp-input text-base w-full"
                required
              />
              <div
                className="h-0.5 rounded-full mt-3 transition-all duration-300"
                style={{
                  width: `${Math.min(100, form.title.length * 3)}%`,
                  background: `linear-gradient(90deg, ${form.accent}, ${form.accent}44)`,
                }}
              />
            </div>

            <div className="mp-card p-5">
              <div className="mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--mp-text-tertiary)]">
                  Extracto
                </span>
                <p className="text-[11px] text-[var(--mp-text-tertiary)] mt-0.5">
                  Breve descripción para las tarjetas del listado
                </p>
              </div>
              <textarea
                value={form.excerpt}
                onChange={(e) =>
                  setForm({ ...form, excerpt: e.target.value })
                }
                rows={2}
                placeholder="Breve descripción para las tarjetas del listado..."
                className="mp-input text-sm w-full resize-none"
              />
            </div>

            <div className="mp-card overflow-hidden">
              <div className="px-5 py-3 border-b border-[var(--mp-border)] flex items-center gap-2">
                <PenLine size={13} style={{ color: form.accent }} />
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--mp-text-tertiary)]">
                  Cuerpo del artículo
                </span>
              </div>
              <div className="p-5">
                <textarea
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  rows={16}
                  placeholder="Escribe aquí el contenido completo del artículo..."
                  className="mp-input text-sm w-full min-h-[350px] leading-relaxed resize-y"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="mp-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Globe size={13} className="text-[var(--mp-text-tertiary)]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--mp-text-tertiary)]">
                  Slug
                </span>
              </div>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => {
                  setForm((p) => ({ ...p, slug: e.target.value }));
                  setManualSlug(true);
                }}
                placeholder="titulo-del-articulo"
                className="mp-input text-sm w-full"
              />
              {form.slug && (
                <p className="text-[11px] mt-1.5 font-mono text-[var(--mp-text-tertiary)]">
                  /blog/{form.slug}
                </p>
              )}
            </div>

            <div className="mp-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--mp-text-tertiary)]">
                  Categoría
                </span>
              </div>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                className="mp-input text-sm w-full"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mp-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <User size={13} className="text-[var(--mp-text-tertiary)]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--mp-text-tertiary)]">
                  Autor
                </span>
              </div>
              <input
                type="text"
                value={form.author}
                onChange={(e) =>
                  setForm({ ...form, author: e.target.value })
                }
                placeholder="Nombre del autor"
                className="mp-input text-sm w-full"
              />
            </div>

            <div className="mp-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon
                  size={13}
                  className="text-[var(--mp-text-tertiary)]"
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--mp-text-tertiary)]">
                  Imagen destacada
                </span>
              </div>
              <div className="border-2 border-dashed border-[var(--mp-border)] rounded-lg p-6 text-center hover:border-[var(--mp-accent)] transition-colors cursor-pointer">
                {form.image ? (
                  <div className="relative">
                    <img
                      src={form.image}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, image: "" }))}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center text-xs hover:bg-red-500 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon
                      size={28}
                      className="mx-auto mb-2 text-[var(--mp-text-tertiary)]"
                    />
                    <p className="text-xs text-[var(--mp-text-tertiary)] mb-2">
                      Arrastra una imagen o haz clic para subir
                    </p>
                    <label className="mp-btn-ghost text-xs cursor-pointer inline-flex items-center gap-1.5">
                      <ImageIcon size={12} /> Subir archivo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) =>
                              setForm((p) => ({
                                ...p,
                                image: ev.target?.result as string,
                              }));
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </>
                )}
              </div>
            </div>

            <div className="mp-card p-5">
              <div className="mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--mp-text-tertiary)]">
                  Apariencia
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-[var(--mp-text-secondary)] mb-1 block">
                    Gradiente CSS
                  </label>
                  <input
                    type="text"
                    value={form.gradient}
                    onChange={(e) =>
                      setForm({ ...form, gradient: e.target.value })
                    }
                    placeholder="linear-gradient(135deg,#0EA5E9,#06B6D4)"
                    className="mp-input text-sm w-full"
                  />
                  {form.gradient && (
                    <div
                      className="w-8 h-8 rounded-lg border border-[var(--mp-border)] mt-2 shrink-0"
                      style={{ background: form.gradient }}
                    />
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[var(--mp-text-secondary)] mb-2 block">
                    Color de acento
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {accentOptions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() =>
                          setForm((p) => ({ ...p, accent: c }))
                        }
                        className="w-7 h-7 rounded-lg border-none cursor-pointer transition-all active:scale-[0.97]"
                        style={{
                          background: c,
                          boxShadow:
                            form.accent === c
                              ? `0 0 0 2px ${c}, 0 0 0 4px var(--mp-bg-surface), 0 0 12px ${c}40`
                              : "none",
                          transform:
                            form.accent === c ? "scale(1.15)" : "scale(1)",
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="#6366F1"
                      maxLength={7}
                      value={form.accent}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, accent: e.target.value }))
                      }
                      className="mp-input text-sm w-24"
                    />
                    <label className="relative w-8 h-8 rounded-lg shrink-0 overflow-hidden cursor-pointer border-2 border-[var(--mp-border)]">
                      <input
                        type="color"
                        className="absolute inset-0 w-[200%] h-[200%] -left-1/2 -top-1/2 cursor-pointer border-none p-0"
                        value={form.accent}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, accent: e.target.value }))
                        }
                      />
                      <div
                        className="w-full h-full pointer-events-none rounded-lg"
                        style={{ background: form.accent }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mp-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--mp-text-tertiary)]">
                  Estado
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setForm((p) => ({ ...p, is_published: "1" }))
                  }
                  className="flex-1 py-2 rounded-lg text-xs font-medium border-none cursor-pointer transition-all active:scale-[0.97]"
                  style={{
                    background:
                      form.is_published === "1"
                        ? form.accent
                        : "var(--mp-bg-elevated)",
                    color:
                      form.is_published === "1"
                        ? "white"
                        : "var(--mp-text-secondary)",
                  }}
                >
                  Publicar
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm((p) => ({ ...p, is_published: "0" }))
                  }
                  className="flex-1 py-2 rounded-lg text-xs font-medium border-none cursor-pointer transition-all active:scale-[0.97]"
                  style={{
                    background:
                      form.is_published === "0"
                        ? form.accent
                        : "var(--mp-bg-elevated)",
                    color:
                      form.is_published === "0"
                        ? "white"
                        : "var(--mp-text-secondary)",
                  }}
                >
                  Borrador
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={saving || !form.title.trim()}
                className="mp-btn-primary text-sm w-full justify-center"
                style={{
                  background: `linear-gradient(135deg, ${form.accent}, ${form.accent}dd)`,
                }}
              >
                <Save size={16} />{" "}
                {saving ? "Guardando..." : isEdit ? "Actualizar" : "Publicar"}
              </button>
              <button
                type="button"
                className="mp-btn-ghost text-sm w-full justify-center"
                onClick={() => navigate("/blog")}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
