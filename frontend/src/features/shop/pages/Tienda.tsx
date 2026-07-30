import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Grid3X3, List, X, SlidersHorizontal, ChevronDown, MessageCircle, Bike } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useCart } from "@/providers/CartProvider";
import { useConfig } from "@/providers/CMSProvider";
import { api } from "@/api/client";
import IconRenderer from "@/components/icons/IconRenderer";
import { EmptyState } from "@/components/ui";
import { ProductCard } from "../components/ProductCard";
import { ProductCardSkeleton } from "@/components/ui";
import { QuickViewModal } from "../components/QuickViewModal";
import { FilterSidebar } from "../components/FilterSidebar";
import { MOTO_BRANDS, ITEMS_PER_PAGE } from "../constants";
import type { Product, Category } from "../types";

export default function Tienda() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [storeCategories, setStoreCategories] = useState<Category[]>([]);
  const [trustItems, setTrustItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const config = useConfig();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("categoria") || "");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [brandsExpanded, setBrandsExpanded] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [selectedMotoBrand, setSelectedMotoBrand] = useState(searchParams.get("moto_brand") || "");
  const [selectedMotoModel, setSelectedMotoModel] = useState("");
  const [motoFilterExpanded, setMotoFilterExpanded] = useState(true);
  const [searchCategory, setSearchCategory] = useState("");

  useEffect(() => {
    Promise.allSettled([
      api.get("/products?all=1"),
      api.get("/categories"),
      api.get("/trust-items?page=shop")
    ]).then(([prodRes, catRes, trustRes]) => {
      if (prodRes.status === "fulfilled") {
        const items = Array.isArray(prodRes.value) ? prodRes.value : prodRes.value?.data || [];
        setAllProducts(items.map((p: any) => ({
          id: p.id, name: p.name, category: p.category_name || "", category_id: p.category_id || "",
          brand: p.brand_name || "", sku: p.sku || "", price: p.price, compare_price: p.compare_price || 0,
          image: p.image || "", images: p.product_images?.map((img: any) => img.url) || [],
          slug: p.slug || `producto-${p.id}`, stock: p.stock ?? 0, rating: p.rating || 0, review_count: p.review_count || 0,
          warranty: p.warranty || "", quality_label: p.quality_label || "", compatibility_text: p.compatibility_text || "",
          vehicle_brand: p.vehicle_brand || "", vehicle_model: p.vehicle_model || "", compatible_with: p.compatible_with || "universal",
        })));
      }
      if (catRes.status === "fulfilled") {
        const cats = Array.isArray(catRes.value) ? catRes.value : catRes.value?.data || [];
        setStoreCategories(cats.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, image: c.image || "", icon: c.icon || "box", sort_order: c.sort_order || 0 })));
      }
      if (trustRes.status === "fulfilled") {
        const data = Array.isArray(trustRes.value) ? trustRes.value : [];
        setTrustItems(data);
      }
    }).catch((err) => console.warn("[fetch]", err)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("categoria", selectedCategory);
    if (selectedMotoBrand) params.set("moto_brand", selectedMotoBrand);
    if (selectedBrands.length > 0) params.set("brands", selectedBrands.join(","));
    setSearchParams(params, { replace: true });
  }, [selectedCategory, selectedMotoBrand, selectedBrands, setSearchParams]);

  useEffect(() => {
    const brand = searchParams.get("moto_brand");
    if (brand) setSelectedMotoBrand(brand);
    const cat = searchParams.get("categoria");
    if (cat) setSelectedCategory(cat);
    const brandsParam = searchParams.get("brands");
    if (brandsParam) setSelectedBrands(brandsParam.split(","));
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];
    if (selectedCategory) result = result.filter(p => p.category === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)));
    }
    if (searchCategory) result = result.filter(p => p.category === searchCategory);
    if (selectedBrands.length > 0) result = result.filter(p => selectedBrands.includes(p.brand));
    if (selectedMotoBrand) result = result.filter(p => !p.vehicle_brand || p.vehicle_brand.toLowerCase().includes(selectedMotoBrand.toLowerCase()) || p.compatible_with === "universal");
    if (selectedMotoModel) result = result.filter(p => !p.vehicle_model || p.vehicle_model.toLowerCase().includes(selectedMotoModel.toLowerCase()) || p.compatible_with === "universal");
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (inStockOnly) result = result.filter(p => (p.stock ?? 0) > 0);
    if (minRating > 0) result = result.filter(p => (p.rating ?? 0) >= minRating);
    switch (sortBy) {
      case "newest": result.sort((a, b) => b.id.localeCompare(a.id)); break;
      case "price-low": result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "name-az": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-za": result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case "rating": result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
    }
    return result;
  }, [allProducts, selectedCategory, searchQuery, searchCategory, selectedBrands, selectedMotoBrand, selectedMotoModel, priceRange, inStockOnly, minRating, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [selectedCategory, searchQuery, searchCategory, selectedBrands, selectedMotoBrand, selectedMotoModel, priceRange, inStockOnly, minRating, sortBy]);

  const availableBrands = useMemo(() => {
    const brandCounts: Record<string, number> = {};
    const products = selectedCategory ? allProducts.filter(p => p.category === selectedCategory) : allProducts;
    products.forEach(p => { if (p.brand) brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1; });
    return Object.entries(brandCounts).sort((a, b) => b[1] - a[1]);
  }, [allProducts, selectedCategory]);

  const maxPrice = useMemo(() => Math.max(...allProducts.map(p => p.price), 0), [allProducts]);

  const selectedMotoModels = useMemo(() => {
    const brand = MOTO_BRANDS.find(b => b.name === selectedMotoBrand);
    return brand ? brand.models : [];
  }, [selectedMotoBrand]);

  const handleAddToCart = (product: Product) => {
    addItem({ id: product.id, name: product.name, price: Math.round(product.price), quantity: 1, image: product.image, brand: product.brand, warranty: product.warranty, quality_label: product.quality_label, compatibility_text: product.compatibility_text });
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const clearFilters = () => {
    setSelectedCategory(""); setSearchQuery(""); setSelectedBrands([]); setSearchCategory("");
    setPriceRange([0, maxPrice]); setInStockOnly(false); setMinRating(0); setSortBy("featured");
    setSelectedMotoBrand(""); setSelectedMotoModel("");
  };

  const hasActiveFilters = !!(selectedCategory || searchQuery || searchCategory || selectedBrands.length > 0 || inStockOnly || minRating > 0 || selectedMotoBrand || selectedMotoModel);

  const filterSidebarProps = {
    selectedCategory, searchQuery, searchCategory, selectedBrands,
    selectedMotoBrand, selectedMotoModel, priceRange, inStockOnly, minRating,
    motoFilterExpanded, brandsExpanded, availableBrands, maxPrice, selectedMotoModels,
    hasActiveFilters, MOTO_BRANDS, storeCategories,
    onClearFilters: clearFilters,
    onSetSelectedCategory: setSelectedCategory,
    onSetSearchQuery: setSearchQuery,
    onSetSearchCategory: setSearchCategory,
    onToggleBrand: toggleBrand,
    onSetSelectedMotoBrand: setSelectedMotoBrand,
    onSetSelectedMotoModel: setSelectedMotoModel,
    onSetPriceRange: setPriceRange,
    onSetInStockOnly: setInStockOnly,
    onSetMinRating: setMinRating,
    onSetSortBy: setSortBy,
    onSetMotoFilterExpanded: setMotoFilterExpanded,
    onSetBrandsExpanded: setBrandsExpanded,
  };

  return (
    <>
      <SEO title="Tienda Online | MotoPro" description="Productos, repuestos y accesorios para tu moto." />
      <main className="bg-surface-primary min-h-screen pt-16">

        {/* ── Hero ── */}
        <section className="relative py-20 lg:py-28 min-h-[400px] flex items-center bg-surface-primary overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1600&q=80" alt="" loading="lazy" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl">
              <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs font-bold text-interactive-accent uppercase tracking-[0.2em]">
                Tienda
              </motion.span>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="mt-3 text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight">
                Todos los productos
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="mt-4 text-base text-white/70 leading-relaxed max-w-lg">
                Encuentra los mejores repuestos y accesorios para tu moto.
              </motion.p>
            </div>

            {/* Search bar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="mt-8 max-w-2xl">
              <div className="flex gap-2">
                <div className="relative">
                  <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}
                    className="h-12 pl-4 pr-9 rounded-xl border-0 bg-white text-sm text-text-primary appearance-none cursor-pointer focus:outline-none">
                    <option value="">Todas las categorías</option>
                    {storeCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                </div>
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input type="text" placeholder="Buscar por nombre, marca o SKU..."
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-11 pr-10 rounded-xl border-0 bg-white text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none" />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary">
                      <X size={15} />
                    </button>
                  )}
                </div>
                <button className="h-12 px-6 rounded-xl bg-interactive-accent text-white text-sm font-semibold hover:bg-interactive-accent-hover transition-all shrink-0">
                  Buscar
                </button>
              </div>
            </motion.div>

            {/* Trust badges */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="mt-8 flex flex-wrap gap-6">
              {[
                { icon: "package", label: "Productos originales", sub: "y garantizados" },
                { icon: "truck", label: "Envíos rápidos", sub: "a todo el país" },
                { icon: "shield", label: "Pagos seguros", sub: "y protegidos" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-interactive-accent">
                    <IconRenderer name={item.icon} size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-white/50">{item.sub}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Products Section ── */}
        <section className="py-8">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex gap-8">
              {/* Sidebar Filters - Desktop */}
              <aside className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-24">
                <FilterSidebar {...filterSidebarProps} />

                {/* Categories in mobile drawer */}
                <div className="mt-6 pt-6 border-t border-border-subtle">
                  <h3 className="text-xs font-bold text-text-primary mb-3">Categorías</h3>
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => { setSelectedCategory(""); }}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                        !selectedCategory
                          ? "bg-interactive-accent text-white"
                          : "bg-surface-tertiary text-text-secondary hover:text-text-primary border border-border-subtle"
                      }`}>
                      Todas
                    </button>
                    {storeCategories.map(cat => (
                      <button key={cat.id} onClick={() => setSelectedCategory(selectedCategory === cat.name ? "" : cat.name)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                          selectedCategory === cat.name
                            ? "bg-interactive-accent text-white"
                            : "bg-surface-tertiary text-text-secondary hover:text-text-primary border border-border-subtle"
                        }`}>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                </div>
              </aside>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Moto selection banner */}
                {!selectedMotoBrand && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex items-center gap-4 rounded-2xl border border-interactive-accent/20 bg-interactive-accent/5 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-interactive-accent/10 text-interactive-accent shrink-0">
                      <Bike size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-text-primary">Selecciona tu moto</p>
                      <p className="text-xs text-text-secondary">Elige la marca y modelo de tu moto para ver repuestos compatibles.</p>
                    </div>
                    <button onClick={() => { document.querySelector("aside")?.scrollIntoView({ behavior: "smooth" }); }}
                      className="px-4 py-2 rounded-xl bg-interactive-accent text-white text-xs font-semibold hover:bg-interactive-accent-hover transition-all shrink-0">
                      Seleccionar moto
                    </button>
                  </motion.div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-xl md:text-2xl font-heading font-bold text-text-primary">Todos los productos</h2>
                    <p className="text-sm text-text-secondary mt-0.5">{filteredProducts.length} productos encontrados</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowMobileFilters(true)}
                      className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-border-subtle text-sm text-text-secondary hover:border-interactive-accent/40 transition-colors">
                      <SlidersHorizontal size={14} /> Filtros
                      {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-interactive-accent" />}
                    </button>
                    <div className="relative">
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                        className="h-9 pl-3 pr-8 rounded-lg border border-border-subtle bg-surface-secondary text-sm text-text-primary appearance-none cursor-pointer focus:border-interactive-accent focus:outline-none">
                        <option value="featured">Más vendidos</option>
                        <option value="newest">Más recientes</option>
                        <option value="price-low">Menor precio</option>
                        <option value="price-high">Mayor precio</option>
                        <option value="name-az">Nombre A-Z</option>
                        <option value="name-za">Nombre Z-A</option>
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                    </div>
                    <div className="hidden sm:flex items-center gap-0.5 p-0.5 rounded-lg border border-border-subtle">
                      <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded ${viewMode === "grid" ? "bg-interactive-accent text-white" : "text-text-tertiary hover:text-text-primary"}`}>
                        <Grid3X3 size={15} />
                      </button>
                      <button onClick={() => setViewMode("list")} className={`p-1.5 rounded ${viewMode === "list" ? "bg-interactive-accent text-white" : "text-text-tertiary hover:text-text-primary"}`}>
                        <List size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active filter chips */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedCategory && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-interactive-accent/10 text-interactive-accent text-xs font-medium">
                        {selectedCategory}
                        <button onClick={() => setSelectedCategory("")} aria-label="Quitar filtro"><X size={12} /></button>
                      </span>
                    )}
                    {searchCategory && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-interactive-accent/10 text-interactive-accent text-xs font-medium">
                        Categoría: {searchCategory}
                        <button onClick={() => setSearchCategory("")} aria-label="Quitar filtro"><X size={12} /></button>
                      </span>
                    )}
                    {selectedBrands.map(b => (
                      <span key={b} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-interactive-accent/10 text-interactive-accent text-xs font-medium">
                        {b}
                        <button onClick={() => toggleBrand(b)} aria-label="Quitar filtro"><X size={12} /></button>
                      </span>
                    ))}
                    {selectedMotoBrand && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-interactive-accent/10 text-interactive-accent text-xs font-medium">
                        {selectedMotoBrand}{selectedMotoModel ? ` ${selectedMotoModel}` : ""}
                        <button onClick={() => { setSelectedMotoBrand(""); setSelectedMotoModel(""); }} aria-label="Quitar filtro"><X size={12} /></button>
                      </span>
                    )}
                    {inStockOnly && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-interactive-accent/10 text-interactive-accent text-xs font-medium">
                        En stock
                        <button onClick={() => setInStockOnly(false)} aria-label="Quitar filtro"><X size={12} /></button>
                      </span>
                    )}
                    {minRating > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-interactive-accent/10 text-interactive-accent text-xs font-medium">
                        {minRating}+ estrellas
                        <button onClick={() => setMinRating(0)} aria-label="Quitar filtro"><X size={12} /></button>
                      </span>
                    )}
                    <button onClick={clearFilters} className="text-xs text-text-tertiary hover:text-interactive-accent transition-colors ml-1">
                      Limpiar todo
                    </button>
                  </div>
                )}

                {/* Products */}
                {loading ? (
                  <div className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <ProductCardSkeleton key={i} />
                    ))}
                  </div>
                ) : paginatedProducts.length === 0 ? (
                  <EmptyState
                    title="Sin resultados"
                    description="No encontramos productos con esos filtros"
                    action={<button onClick={clearFilters} className="px-5 py-2.5 rounded-lg bg-interactive-accent text-white text-sm font-semibold hover:bg-interactive-accent-hover transition-all">Limpiar filtros</button>}
                  />
                ) : (
                  <div className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
                    {paginatedProducts.map((product, i) => (
                      <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                        <ProductCard product={product} onAddToCart={handleAddToCart} onQuickView={setQuickViewProduct} />
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} aria-label="Página anterior"
                      className="px-3 py-2 rounded-lg border border-border-subtle text-sm text-text-secondary hover:border-interactive-accent/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1">
                      <ChevronLeft size={14} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      let page: number;
                      if (totalPages <= 5) page = i + 1;
                      else if (currentPage <= 3) page = i + 1;
                      else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                      else page = currentPage - 2 + i;
                      return (
                        <button key={page} onClick={() => setCurrentPage(page)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${currentPage === page ? "bg-interactive-accent text-white" : "border border-border-subtle text-text-secondary hover:border-interactive-accent/40"}`}>
                          {page}
                        </button>
                      );
                    })}
                    {totalPages > 5 && <span className="text-text-tertiary text-sm">...</span>}
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} aria-label="Página siguiente"
                      className="px-3 py-2 rounded-lg border border-border-subtle text-sm text-text-secondary hover:border-interactive-accent/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust Bar ── */}
        {trustItems.length > 0 && (
        <section className="py-10 bg-surface-secondary border-t border-border-subtle">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {trustItems.map((item, i) => (
                <motion.div key={item.id || i}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-interactive-accent/10 text-interactive-accent shrink-0">
                    <IconRenderer name={item.icon} size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{item.title || item.label}</p>
                    <p className="text-xs text-text-tertiary">{item.description || item.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* ── CTA: No encuentras ── */}
        <section className="bg-surface-primary py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-surface-secondary to-surface-tertiary border border-border-subtle">
              <div className="absolute inset-0 opacity-10">
                <img src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&q=80" alt="" className="w-full h-full object-cover" />
              </div>
              <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-text-primary mb-3">¿No encuentras lo que buscas?</h2>
                  <p className="text-sm text-text-secondary mb-6">Te ayudamos a encontrar la pieza ideal para tu moto.</p>
                  <a href={`https://wa.me/${config.social_whatsapp || "573001234567"}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-5 py-3 text-sm font-semibold text-white hover:bg-green-600 transition-all shadow-lg shadow-green-500/25">
                    <MessageCircle size={18} />
                    Contactar por WhatsApp
                  </a>
                </div>
                <div className="shrink-0 hidden md:block">
                  <div className="w-48 h-48 rounded-full bg-interactive-accent/10 flex items-center justify-center">
                    <IconRenderer name="headphones" size={64} className="text-interactive-accent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Filter Drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
            <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-surface-primary border-l border-border-subtle overflow-y-auto">
              <div className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-bold text-text-primary">Filtros</h2>
                  <button onClick={() => setShowMobileFilters(false)} className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center hover:bg-surface-tertiary transition-colors">
                    <X size={16} className="text-text-secondary" />
                  </button>
                </div>
                <FilterSidebar {...filterSidebarProps} />
                <button onClick={() => setShowMobileFilters(false)}
                  className="w-full mt-6 py-3 rounded-xl bg-interactive-accent text-white text-sm font-semibold hover:bg-interactive-accent-hover transition-all">
                  Ver {filteredProducts.length} productos
                </button>
              </div>
            </div>
          </div>
        )}

        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} onAddToCart={handleAddToCart} />
      </main>
    </>
  );
}
