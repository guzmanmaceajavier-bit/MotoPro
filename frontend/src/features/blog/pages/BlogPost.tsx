import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/api/client";
import { sanitizeHtml } from "@/lib/sanitize";
import { SEO, blogPostSchema } from "@/components/SEO";
import { usePageSEO } from "@/hooks/usePageSEO";

import { Skeleton } from "@/components/Skeleton";
import { ShareButtons } from "../components/ShareButtons";
import { useToast } from "@/providers/ToastProvider";

export default function BlogPost() {
  const seo = usePageSEO("blog");
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/blog/id/${id}`).then((data) => {
      setPost(data);
      if (data?.category) {
        api.get("/blog?all=1").then((all) => {
          const items = all?.data || all || [];
          const arr = Array.isArray(items) ? items : [];
          setRelated(arr.filter((p: any) => p.category === data.category && p.id !== data.id).slice(0, 3));
        }).catch((err) => console.warn("[fetch]", err));
      }
    }).catch((err) => { setPost(null); console.warn("[fetch]", err); }).finally(() => setLoading(false));
  }, [id]);

  const { addToast } = useToast();
  const [comments, setComments] = useState<any[]>([]);
  const [commentForm, setCommentForm] = useState({ name: "", email: "", content: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/blog-comments?post_id=${id}&is_approved=1`).then((data) => {
      setComments(Array.isArray(data) ? data : []);
    }).catch((err) => console.warn("[fetch]", err));
  }, [id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      await api.post("/blog-comments", { post_id: id, ...commentForm });
      addToast("Comentario enviado correctamente", "success");
      setCommentForm({ name: "", email: "", content: "" });
      const data = await api.get(`/blog-comments?post_id=${id}&is_approved=1`);
      setComments(Array.isArray(data) ? data : []);
    } catch {
      addToast("Error al enviar el comentario", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

  if (loading) {
    return (
      <>
        <SEO title="Blog" description="..." pageSEO={seo} />
        <main className="flex-1 pt-20">
          <div className="relative overflow-hidden bg-surface-primary py-16">
            <div className="mx-auto max-w-3xl px-4 text-center space-y-4">
              <Skeleton className="h-6 w-24 rounded-full mx-auto" />
              <Skeleton className="h-10 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
          </div>
          <div className="mx-auto max-w-3xl px-4 py-12 space-y-4">
            <Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" />
          </div>
        </main>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <SEO title="Artículo no encontrado" pageSEO={seo} />
        <main className="flex flex-1 items-center justify-center px-4 pt-20">
          <div className="text-center">
            <h1 className="text-4xl font-heading font-bold text-text-primary">Artículo no encontrado</h1>
            <Link to="/blog" className="mt-4 inline-block text-interactive-accent hover:underline">Volver al blog</Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SEO title={post.title} description={post.excerpt} pageSEO={seo}
          structuredData={blogPostSchema({
            title: post.title, description: post.excerpt, author: post.author_name,
            datePublished: post.created_at, image: post.image, url: window.location.href,
          })} />
        <main className="flex-1 pt-20">
        <div className="relative overflow-hidden bg-surface-primary py-16 md:py-24">
          <div className={`absolute inset-0 bg-gradient-to-br ${post.gradient || "from-interactive-accent/30 to-blue-900/30"}`} />
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative mx-auto max-w-3xl px-4 text-center">
            {post.category && (
              <span className="mb-4 inline-block rounded-full bg-interactive-accent/10 px-3 py-1 text-xs font-medium text-interactive-accent">
                {post.category}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-text-primary leading-tight">{post.title}</h1>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-text-secondary flex-wrap">
              {post.author && <><span>Por <strong className="text-text-primary">{post.author}</strong></span><span>•</span></>}
              <span>{formatDate(post.created_at)}</span>
              {post.read_time && <><span>•</span><span>{post.read_time} min lectura</span></>}
            </div>
            <div className="mt-6 flex justify-center">
              <ShareButtons url={window.location.href} title={post.title} />
            </div>
          </div>
        </div>

        <article className="mx-auto max-w-3xl px-4 py-12">
          {post.image && (
            <div className="mb-8 rounded-2xl overflow-hidden">
              <img src={post.image} alt={post.title} loading="lazy" className="w-full h-auto object-cover" />
            </div>
          )}
          {post.excerpt && (
            <p className="text-lg text-text-secondary leading-relaxed mb-8 italic border-l-4 border-interactive-accent pl-4">
              {post.excerpt}
            </p>
          )}
          <div
            className="prose prose-invert max-w-none text-text-secondary leading-relaxed space-y-4
              prose-headings:text-text-primary prose-headings:font-heading
              prose-a:text-interactive-accent prose-a:no-underline hover:prose-a:underline
              prose-strong:text-text-primary
              prose-code:text-interactive-accent prose-code:bg-interactive-accent/10 prose-code:px-1 prose-code:rounded
              prose-pre:bg-surface-tertiary prose-pre:border prose-pre:border-border"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content || post.excerpt || "") }}
          />

          {/* Gallery */}
          {post.gallery?.length > 0 && (
            <div className="mt-10">
              <h3 className="text-lg font-bold text-text-primary mb-4">Galería</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {post.gallery.map((img: string, i: number) => (
                  <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-surface-tertiary cursor-pointer hover:opacity-90 transition-opacity">
                    <img src={img} alt={`${post.title} - ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {post.videos?.length > 0 && (
            <div className="mt-10">
              <h3 className="text-lg font-bold text-text-primary mb-4">Videos</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {post.videos.map((url: string, i: number) => (
                  <div key={i} className="aspect-video rounded-lg overflow-hidden bg-black">
                    <iframe src={url.replace("watch?v=", "embed/")} className="w-full h-full" allowFullScreen title={`Video ${i + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio */}
          {post.author && (
            <div className="mt-12 p-6 rounded-2xl bg-surface-secondary border border-border flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-interactive-accent/10 flex items-center justify-center text-2xl font-bold text-interactive-accent shrink-0">
                {post.author.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">{post.author}</p>
                <p className="text-xs text-text-tertiary mt-1">{post.author_bio || `Escritor y entusiasta del motociclismo en MotoPro.`}</p>
              </div>
            </div>
          )}

          {/* Share */}
          <div className="mt-8 flex items-center justify-between border-t border-border pt-8">
            <Link to="/blog" className="text-interactive-accent hover:text-interactive-accent-hover transition-colors text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Volver al blog
            </Link>
            <ShareButtons url={window.location.href} title={post.title} />
          </div>
        </article>

        {/* Comments */}
        <section className="border-t border-border py-16 bg-surface-primary">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="text-xl font-heading font-bold text-text-primary mb-2">Comentarios</h2>
            <p className="text-sm text-text-tertiary mb-8">{comments.length} comentario{comments.length !== 1 ? "s" : ""}</p>

            {comments.length === 0 ? (
              <p className="text-sm text-text-tertiary text-center py-8">Sé el primero en comentar</p>
            ) : (
              <div className="space-y-6 mb-10">
                {comments.map((c) => (
                  <div key={c.id} className="bg-surface-secondary border border-border rounded-lg p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-interactive-accent/10 flex items-center justify-center text-sm font-bold text-interactive-accent">
                        {c.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{c.name}</p>
                        <p className="text-xs text-text-tertiary">{formatDate(c.created_at)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{c.content}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-surface-secondary border border-border rounded-lg p-6">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Deja un comentario</h3>
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nombre" value={commentForm.name} onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })} required
                    className="w-full rounded-lg bg-surface-tertiary border border-border px-3 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-interactive-accent transition-colors"
                  />
                  <input type="email" placeholder="Email" value={commentForm.email} onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })} required
                    className="w-full rounded-lg bg-surface-tertiary border border-border px-3 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-interactive-accent transition-colors"
                  />
                </div>
                <textarea placeholder="Escribe tu comentario..." rows={4} value={commentForm.content} onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })} required
                  className="w-full rounded-lg bg-surface-tertiary border border-border px-3 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-interactive-accent transition-colors resize-none"
                />
                <button type="submit" disabled={submitting}
                  className="px-6 py-2.5 rounded-lg bg-interactive-accent text-black text-sm font-semibold hover:bg-interactive-accent-hover transition-colors disabled:opacity-50"
                >
                  {submitting ? "Enviando..." : "Publicar comentario"}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Related Posts */}
        {related.length > 0 && (
          <section className="border-t border-border py-16 bg-surface-primary">
            <div className="mx-auto max-w-5xl px-4">
              <h2 className="text-xl font-heading font-bold text-text-primary mb-8 text-center">Artículos relacionados</h2>
              <div className="grid gap-6 sm:grid-cols-3">
                {related.map((rp: any) => (
                  <Link key={rp.id} to={`/blog/${rp.id}`}
                    className="group block rounded-lg border border-border bg-surface-secondary overflow-hidden hover:border-interactive-accent/40 hover:shadow-lg transition-all"
                  >
                    <div className="relative h-40 overflow-hidden bg-surface-tertiary">
                      {rp.image ? (
                        <img src={rp.image} alt={rp.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl opacity-30 text-text-tertiary">📝</div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-[11px] font-medium text-interactive-accent mb-1">{rp.category}</p>
                      <h3 className="text-sm font-semibold text-text-primary group-hover:text-interactive-accent transition-colors line-clamp-2">{rp.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

    </>
  );
}
