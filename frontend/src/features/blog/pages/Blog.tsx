import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { usePageSEO } from "@/hooks/usePageSEO";

import { Search } from "lucide-react";
import Pagination from "@/components/Pagination";
import { api } from "@/api/client";

interface BlogCategory { name: string; slug: string; color: string; }

const formatDate = (d: string) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
};

const PER_PAGE = 9;

const heroImages = [
  "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1600&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&q=80",
  "https://images.unsplash.com/photo-1626668893632-6f3a4466d22d?w=1600&q=80",
];

export default function Blog() {
  const seo = usePageSEO("blog");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState("Todos");
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [page, setPage] = useState(1);
  const [heroIdx, setHeroIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { const t = setInterval(() => setHeroIdx((p) => (p + 1) % heroImages.length), 4000); return () => clearInterval(t); }, []);

  useEffect(() => {
    api.get("/blog-categories").then((data) => {
      const arr = Array.isArray(data) ? data : [];
      setCategories(arr.map((c: any) => ({ name: c.name, slug: c.slug, color: c.color || "bg-surface-tertiary text-text-tertiary" })));
    }).catch((err) => console.warn("[fetch]", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    api.get("/blog?all=1").then((data) => {
      const items = data?.data || data || [];
      let arr = Array.isArray(items) ? items : [];
      if (activeCat !== "Todos") arr = arr.filter((p: any) => {
        const match = categories.find((c) => c.name === activeCat);
        return match ? p.category === activeCat || p.category?.toLowerCase() === activeCat.toLowerCase() : false;
      });
      setPosts(arr);
    }).catch(() => setPosts([])).finally(() => setLoading(false));
  }, [activeCat]);

  const catColors: Record<string, string> = {};
  categories.forEach((c) => { catColors[c.name] = c.color; });

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter((p) =>
      p.title?.toLowerCase().includes(q) || p.content?.toLowerCase().includes(q) || p.excerpt?.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  const totalPages = Math.ceil(filteredPosts.length / PER_PAGE);
  const paginated = filteredPosts.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const popularPosts = useMemo(() => {
    const sorted = [...posts].sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    return sorted.slice(0, 4);
  }, [posts]);

  return (
    <>
      <SEO title="Blog" description="Consejos, guías y noticias sobre motocicletas." pageSEO={seo} />
      <main className="pt-16">
          <section className="relative py-20 lg:py-28 min-h-[400px] flex items-center overflow-hidden bg-surface-primary">
          <div className="absolute inset-0">
            <img key={heroIdx} src={heroImages[heroIdx]} alt="Moto en carretera" loading="lazy"
              className="w-full h-full object-cover animate-fadeIn"
            />
            <div className="absolute inset-0 bg-black/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 w-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-h1 text-white">Consejos y <span className="text-transparent bg-clip-text bg-gradient-to-r from-interactive-accent to-orange-400">noticias</span></h1>
                <p className="mt-3 text-body text-white/70">Todo lo que necesitas saber sobre el mundo de las motocicletas.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {popularPosts.length > 0 && (
          <section className="py-8 bg-surface-primary border-b border-border-subtle">
            <div className="mx-auto max-w-7xl px-4">
              <h2 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-interactive-accent" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
                Más leídos
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {popularPosts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.id}`}
                    className="group shrink-0 w-56 rounded-lg border border-border bg-surface-secondary overflow-hidden hover:border-interactive-accent/40 transition-all"
                  >
                    <div className="h-28 overflow-hidden bg-surface-tertiary">
                      {post.image ? (
                        <img src={post.image} alt={post.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl opacity-30 text-text-tertiary">📝</div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-medium text-interactive-accent">{post.category}</p>
                      <h3 className="text-xs font-semibold text-text-primary group-hover:text-interactive-accent transition-colors line-clamp-2 mt-1">{post.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-6 bg-surface-primary sticky top-20 z-20 border-b border-border-subtle">
          <div className="mx-auto max-w-7xl px-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                placeholder="Buscar artículos..." 
                className="w-full rounded-lg bg-surface-tertiary border border-border pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-interactive-accent transition-colors"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {["Todos", ...categories.map((c) => c.name)].map((cat) => (
                <button key={cat} onClick={() => setActiveCat(cat)}
                  className={`shrink-0 rounded-sm px-5 py-2 text-body-sm font-medium transition-all duration-base ${
                    activeCat === cat
                      ? "bg-interactive-accent text-text-inverse shadow-sm"
                      : "bg-surface-tertiary text-text-tertiary hover:bg-surface-secondary hover:text-text-secondary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-surface-primary min-h-[40vh]">
          <div className="mx-auto max-w-7xl px-4">
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="rounded-lg bg-surface-secondary animate-pulse h-[360px]" />
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-body text-text-tertiary">{searchQuery ? "Sin resultados" : "No hay artículos en esta categoría."}</p>
              </div>
            ) : (
              <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paginated.map((post, i) => (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link to={`/blog/${post.id}`}
                      className="group block rounded-lg border border-border bg-surface-secondary overflow-hidden hover:border-interactive-accent/40 hover:shadow-lg transition-all duration-base h-full"
                    >
                      <div className="relative h-48 overflow-hidden bg-surface-tertiary">
                        {post.image ? (
<img src={post.image} alt={post.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl opacity-30 text-text-tertiary">📝</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-secondary via-transparent to-transparent" />
                        {post.category && (
                          <span className={`absolute top-3 left-3 font-bold text-tiny px-3 py-1.5 rounded-sm ${catColors[post.category] || "bg-surface-tertiary text-text-tertiary"}`}>
                            {post.category}
                          </span>
                        )}
                        {post.created_at && (
                          <span className="absolute top-3 right-3 bg-surface-primary/80 text-text-tertiary text-tiny px-2 py-1 rounded-sm">
                            {formatDate(post.created_at)}
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="text-body font-heading font-bold text-text-primary group-hover:text-interactive-accent transition-colors line-clamp-2 mb-2">
                          {post.title}
                        </h3>
                        <p className="text-body-sm text-text-tertiary line-clamp-2 leading-relaxed">
                          {post.excerpt || post.content?.slice(0, 150)}
                        </p>
                        <div className="mt-4 flex items-center gap-1 text-tiny font-medium text-interactive-accent opacity-0 group-hover:opacity-100 transition-opacity">
                          Leer más
                          <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </>
            )}
          </div>
        </section>
      </main>

    </>
  );
}
