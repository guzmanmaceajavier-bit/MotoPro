import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/api/client";
import { SEO } from "@/components/SEO";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { Skeleton } from "@/components/Skeleton";

interface BlogPostData {
  id: string; title: string; slug: string; excerpt: string; content: string;
  category: string; author: string; image?: string; gradient: string;
  is_published: number; created_at: string;
}

export default function BlogPost() {
  const seo = usePageSEO("blog");
  const { id } = useParams();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.get(`/blog/id/${id}`).then((data) => setPost(data)).catch(() => setPost(null)).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <SEO title="Blog" description="Consejos, guías y noticias sobre motocicletas." pageSEO={seo} />
        <Navbar />
        <main className="flex-1 pt-20">
          <div className="relative overflow-hidden bg-surface-primary py-16">
            <div className="mx-auto max-w-3xl px-4 text-center space-y-4">
              <Skeleton className="h-6 w-24 rounded-full mx-auto" />
              <Skeleton className="h-10 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
          </div>
          <div className="mx-auto max-w-3xl px-4 py-12 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <SEO title="Artículo no encontrado" pageSEO={seo} />
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4 pt-20">
          <div className="text-center">
            <h1 className="text-4xl font-heading font-bold text-[var(--color-text)]">Artículo no encontrado</h1>
            <Link to="/blog" className="mt-4 inline-block text-interactive-accent hover:underline">Volver al blog</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <>
      <SEO title={post.title} description={post.excerpt} pageSEO={seo} />
      <Navbar />
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
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-text-secondary">
              {post.author && <><span>Por <strong className="text-text-primary">{post.author}</strong></span><span>•</span></>}
              <span>{formatDate(post.created_at)}</span>
            </div>
          </div>
        </div>
        <article className="mx-auto max-w-3xl px-4 py-12">
          {post.image && (
            <div className="mb-8 rounded-2xl overflow-hidden">
              <img src={post.image} alt={post.title} className="w-full h-auto object-cover" />
            </div>
          )}
          {post.excerpt && (
            <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed mb-8 italic border-l-4 border-interactive-accent pl-4">
              {post.excerpt}
            </p>
          )}
          <div
            className="prose prose-invert max-w-none text-[var(--color-text-secondary)] leading-relaxed space-y-4
              prose-headings:text-[var(--color-text)] prose-headings:font-heading
              prose-a:text-interactive-accent prose-a:no-underline hover:prose-a:underline
              prose-strong:text-[var(--color-text)]
              prose-code:text-interactive-accent prose-code:bg-interactive-accent/10 prose-code:px-1 prose-code:rounded
              prose-pre:bg-surface-tertiary prose-pre:border prose-pre:border-[var(--color-card-border)]"
            dangerouslySetInnerHTML={{ __html: post.content || post.excerpt || "" }}
          />
          <div className="mt-12 border-t border-[var(--color-card-border)] pt-8 flex items-center justify-between">
            <Link to="/blog" className="text-interactive-accent hover:text-interactive-accent transition-colors text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Volver al blog
            </Link>
          </div>
        </article>
      </main>
      <Footer /><BackToTop /><WhatsAppFloat />
    </>
  );
}
