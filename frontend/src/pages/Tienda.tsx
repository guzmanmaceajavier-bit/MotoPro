import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { useCart } from "@/providers/CartProvider";
import { api } from "@/api/client";
import IconRenderer from "@/components/icons/IconRenderer";
import { Search, ChevronLeft, ChevronRight, Grid3X3, List, Star, X, SlidersHorizontal, ChevronDown, ShoppingCart, RotateCcw, Eye, Bike } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  category_id?: string;
  brand: string;
  sku?: string;
  price: number;
  compare_price?: number;
  image: string;
  images?: string[];
  slug: string;
  stock?: number;
  rating?: number;
  review_count?: number;
  warranty?: string;
  quality_label?: string;
  compatibility_text?: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  compatible_with?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  icon?: string;
  sort_order: number;
}

interface MotoBrand {
  name: string;
  models: string[];
}

const MOTO_BRANDS: MotoBrand[] = [
  { name: "AKT", models: ["AK 100", "AK 125", "AK 125 SL", "CR5", "EVO 125", "EVO 150", "FLEX 125", "JET 4", "JET 5", "NKD 125", "SM 200", "SPECIAL 110", "TT 250", "TTR 150", "XM 200"] },
  { name: "BAJAJ", models: ["BOXER 100", "BOXER 125", "BOXER 150", "CALIBER", "DISCOVER 100", "DISCOVER 125", "DISCOVER 135", "DISCOVER 150", "DOMINAR 250", "DOMINAR 400", "PULSAR 125", "PULSAR 150", "PULSAR 160", "PULSAR 180", "PULSAR 200", "PULSAR 220"] },
  { name: "HONDA", models: ["BIZ", "C-70", "C-90", "CB 110", "CB 125", "CB 150", "CB 160", "CB 190R", "CLICK", "DIO 110", "NAVI 110", "WAVE 100", "XR 125", "XR 150", "XR 190", "XR 250", "XRE 190", "XRE 300"] },
  { name: "YAMAHA", models: ["AXIS", "BWS 100", "BWS 125", "CRYPTON", "FZ 15", "FZ 16", "FINO", "MT 03", "MT 07", "MT 09", "N-MAX", "R-15", "XTZ 125", "XTZ 150", "XTZ 250"] },
  { name: "SUZUKI", models: ["AX 100", "BEST 125", "DR 150", "DR 200", "GN 125", "GIXXER 150", "GIXXER 250", "GS 125", "HAYATE 110"] },
  { name: "KTM", models: ["DUKE 200", "DUKE 250", "DUKE 390"] },
  { name: "KAWASAKI", models: ["GTO 125", "KLX 150", "NINJA 250", "NINJA 300", "VERSYS 300", "VERSYS 650"] },
  { name: "BENELLI", models: ["180S", "251S", "302S", "752S", "LEONCINO", "TNT", "TRK"] },
  { name: "TVS", models: ["DAZZ", "FLAME", "NEO", "NTORQ", "RAIDER 125", "RTR 160", "RTR 200", "SPORT 100"] },
  { name: "HERO", models: ["DASH 110", "DASH 125", "ECO 100", "GLAMOUR", "HUNK 160", "HUNK 190", "IGNITOR 125", "SPLENDOR", "XPULSE 200"] },
  { name: "KYMCO", models: ["ACTIV 110", "AGILITY 125", "DOWNTOWN 300", "FLY 125", "LIKE 125", "TOP BOY 100", "X-TOWN 300"] },
  { name: "ROYAL ENFIELD", models: ["CLASSIC", "HIMALAYAN", "HNTR", "INTERCEPTOR", "METEOR"] },
];

const ITEMS_PER_PAGE = 12;

function CategoryCard({ category, count, isSelected, onClick }: { category: Category; count: number; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 w-[140px] sm:w-[155px] md:w-[165px] group rounded-2xl overflow-hidden transition-all duration-300 border ${
        isSelected
          ? "bg-surface-secondary border-interactive-accent shadow-lg shadow-interactive-accent/10"
          : "bg-surface-secondary/50 border-border hover:border-border-accent/50 hover:bg-surface-secondary"
      }`}
    >
      <div className="relative h-24 sm:h-28 overflow-hidden">
        {category.image ? (
          <img src={category.image} alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-tertiary">
            <IconRenderer name={category.icon || "box"} size={32} className="text-interactive-accent/30" />
          </div>
        )}
        {isSelected && <div className="absolute inset-0 bg-interactive-accent/10" />}
      </div>
      <div className="p-3 text-center">
        <span className="text-xs sm:text-sm font-semibold text-text-primary block truncate">{category.name}</span>
        <span className="text-[10px] sm:text-[11px] text-text-tertiary">{count} productos</span>
        <p className="text-[10px] sm:text-xs text-interactive-accent font-medium mt-1 group-hover:underline">Ver productos</p>
      </div>
    </button>
  );
}

function ProductCard({ product, onAddToCart, onQuickView }: { product: Product; onAddToCart: (p: Product) => void; onQuickView: (p: Product) => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const discount = product.compare_price && product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-surface-secondary border border-border rounded-2xl overflow-hidden hover:border-border-accent/50 transition-all duration-300 relative"
    >
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-md bg-red-500 text-white text-[10px] font-bold">
          -{discount}%
        </div>
      )}

      {/* Brand Badge */}
      {product.brand && (
        <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-md bg-surface-primary/80 backdrop-blur-sm border border-border text-[10px] font-bold text-text-primary">
          {product.brand}
        </div>
      )}

      {/* Quick View Button */}
      <button
        onClick={(e) => { e.preventDefault(); onQuickView(product); }}
        className="absolute top-12 right-3 z-10 w-8 h-8 rounded-full bg-surface-primary/80 backdrop-blur-sm border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-interactive-accent hover:text-white hover:border-interactive-accent"
      >
        <Eye size={14} />
      </button>

      <Link to={`/tienda/${product.slug}`} className="block">
        <div className="relative aspect-square bg-surface-tertiary overflow-hidden">
          {product.image ? (
            <>
              <img src={product.image} alt={product.name}
                className={`w-full h-full object-cover transition-all duration-500 ${isHovered && product.images?.length ? "opacity-0 scale-105" : "scale-100"}`} />
              {product.images && product.images.length > 0 && (
                <img src={product.images[0]} alt={product.name}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"}`} />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <IconRenderer name="package" size={40} className="text-text-tertiary/20" />
            </div>
          )}
        </div>
      </Link>

      <div className="p-3 sm:p-4">
        <Link to={`/tienda/${product.slug}`}>
          <h3 className="text-xs sm:text-sm font-medium text-text-primary line-clamp-2 min-h-[32px] sm:min-h-[40px] group-hover:text-interactive-accent transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-[10px] sm:text-[11px] text-text-tertiary mt-1 truncate">{product.sku || ""}</p>

        {/* Reviews */}
        <div className="flex items-center gap-0.5 mt-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={10} className={i < (product.rating || 0) ? "text-amber-400 fill-amber-400" : "text-text-tertiary/30"} />
          ))}
          {product.review_count !== undefined && product.review_count > 0 && (
            <span className="text-[9px] sm:text-[10px] text-text-tertiary ml-1">({product.review_count})</span>
          )}
        </div>

        <div className="flex items-end justify-between mt-2 sm:mt-3">
          <div>
            {discount > 0 && product.compare_price && (
              <span className="text-[10px] sm:text-xs text-text-tertiary line-through">${Math.round(product.compare_price).toLocaleString()}</span>
            )}
            <span className="text-base sm:text-lg font-bold text-interactive-accent block">${Math.round(product.price).toLocaleString()}</span>
          </div>
          <button
            onClick={() => onAddToCart(product)}
            disabled={(product.stock ?? 0) <= 0}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-interactive-accent/10 text-interactive-accent flex items-center justify-center hover:bg-interactive-accent hover:text-white transition-all shrink-0 disabled:opacity-30"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function QuickViewModal({ product, onClose, onAddToCart }: { product: Product | null; onClose: () => void; onAddToCart: (p: Product) => void }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const allImages = [product.image, ...(product.images || [])].filter(Boolean);
  const discount = product.compare_price && product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-surface-secondary rounded-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-surface-primary/80 border border-border flex items-center justify-center hover:bg-surface-tertiary transition-colors">
            <X size={16} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Images */}
            <div className="bg-surface-tertiary rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none p-4">
              <div className="aspect-square rounded-xl overflow-hidden mb-3">
                {allImages.length > 0 ? (
                  <img src={allImages[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <IconRenderer name="package" size={60} className="text-text-tertiary/20" />
                  </div>
                )}
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {allImages.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImage(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${selectedImage === i ? "border-interactive-accent" : "border-transparent hover:border-border"}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-5 flex flex-col">
              {product.brand && (
                <span className="text-[10px] font-bold text-interactive-accent uppercase tracking-wider">{product.brand}</span>
              )}
              <h2 className="text-lg font-bold text-text-primary mt-1">{product.name}</h2>

              {/* Reviews */}
              <div className="flex items-center gap-1 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < (product.rating || 0) ? "text-amber-400 fill-amber-400" : "text-text-tertiary/30"} />
                ))}
                {product.review_count !== undefined && (
                  <span className="text-xs text-text-tertiary ml-1">({product.review_count} reseñas)</span>
                )}
              </div>

              {/* Price */}
              <div className="mt-4">
                {discount > 0 && product.compare_price && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-tertiary line-through">${Math.round(product.compare_price).toLocaleString()}</span>
                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-xs font-bold">-{discount}%</span>
                  </div>
                )}
                <span className="text-2xl font-bold text-interactive-accent">${Math.round(product.price).toLocaleString()}</span>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-3 mt-4">
                {product.warranty && (
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <svg className="w-4 h-4 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    {product.warranty}
                  </div>
                )}
                {product.quality_label && (
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <svg className="w-4 h-4 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.014 6.014 0 01-2.27.408m0 0c-.51 0-1.01-.064-1.49-.183M16.27 9.728a6.014 6.014 0 00-2.27-.408m0 0c-1.125 0-2.17-.31-3.08-.85m0 0a6.014 6.014 0 01-1.49-.183" />
                    </svg>
                    {product.quality_label}
                  </div>
                )}
                {product.compatibility_text && (
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <svg className="w-4 h-4 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                    {product.compatibility_text}
                  </div>
                )}
              </div>

              {/* Stock */}
              <div className="mt-4">
                {(product.stock ?? 0) > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-status-success">
                    <span className="w-2 h-2 rounded-full bg-status-success"></span>
                    En stock ({product.stock} disponibles)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    Agotado
                  </span>
                )}
              </div>

              {/* Quantity + Add to Cart */}
              <div className="mt-auto pt-4 flex items-center gap-3">
                <div className="flex items-center border border-border rounded-lg">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
                  </button>
                  <span className="w-10 h-9 flex items-center justify-center text-sm font-bold text-text-primary border-x border-border">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(10, q + 1))}
                    className="w-9 h-9 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" /></svg>
                  </button>
                </div>
                <button
                  onClick={() => { onAddToCart({ ...product, quantity }); onClose(); }}
                  disabled={(product.stock ?? 0) <= 0}
                  className="flex-1 h-10 rounded-lg bg-interactive-accent text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-interactive-accent-hover transition-all disabled:opacity-30"
                >
                  <ShoppingCart size={16} /> Agregar al carrito
                </button>
              </div>

              <Link to={`/tienda/${product.slug}`} className="mt-3 text-center text-xs text-interactive-accent hover:underline">
                Ver producto completo
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Tienda() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [storeCategories, setStoreCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const carouselRef = useRef<HTMLDivElement>(null);

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

  // Por tu moto filter
  const [selectedMotoBrand, setSelectedMotoBrand] = useState(searchParams.get("moto_brand") || "");
  const [selectedMotoModel, setSelectedMotoModel] = useState("");
  const [motoFilterExpanded, setMotoFilterExpanded] = useState(false);

  // Search category filter
  const [searchCategory, setSearchCategory] = useState("");

  useEffect(() => {
    Promise.allSettled([
      api.get("/products?all=1"),
      api.get("/categories")
    ]).then(([prodRes, catRes]) => {
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
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("categoria", selectedCategory);
    setSearchParams(params, { replace: true });
  }, [selectedCategory, setSearchParams]);

  const getCategoryCount = (catName: string) => allProducts.filter(p => p.category === catName).length;

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

  useEffect(() => {
    const brand = searchParams.get("moto_brand");
    if (brand) setSelectedMotoBrand(brand);
  }, [searchParams]);

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

  const scrollCarousel = (dir: number) => {
    if (carouselRef.current) carouselRef.current.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const clearFilters = () => {
    setSelectedCategory(""); setSearchQuery(""); setSelectedBrands([]); setSearchCategory("");
    setPriceRange([0, maxPrice]); setInStockOnly(false); setMinRating(0); setSortBy("featured");
    setSelectedMotoBrand(""); setSelectedMotoModel("");
  };

  const hasActiveFilters = selectedCategory || searchQuery || searchCategory || selectedBrands.length > 0 || inStockOnly || minRating > 0 || selectedMotoBrand || selectedMotoModel;

  const FilterPanel = ({ className = "" }: { className?: string }) => (
    <div className={`space-y-5 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <SlidersHorizontal size={14} /> Filtros
        </h2>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs text-interactive-accent hover:text-interactive-accent-hover flex items-center gap-1">
            <RotateCcw size={11} /> Limpiar
          </button>
        )}
      </div>

      {/* Por tu moto */}
      <div className="border border-border rounded-xl p-3 bg-surface-secondary/50">
        <button onClick={() => setMotoFilterExpanded(!motoFilterExpanded)}
          className="w-full flex items-center justify-between">
          <h3 className="text-xs font-semibold text-text-primary flex items-center gap-2">
            <Bike size={14} className="text-interactive-accent" /> Por tu moto
          </h3>
          <ChevronDown size={14} className={`text-text-tertiary transition-transform ${motoFilterExpanded ? "rotate-180" : ""}`} />
        </button>
        {motoFilterExpanded && (
          <div className="mt-3 space-y-2">
            <select value={selectedMotoBrand} onChange={(e) => { setSelectedMotoBrand(e.target.value); setSelectedMotoModel(""); }}
              className="w-full rounded-lg border border-border bg-surface-tertiary px-3 py-2 text-xs text-text-primary outline-none focus:border-interactive-accent">
              <option value="">Todas las marcas</option>
              {MOTO_BRANDS.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
            </select>
            {selectedMotoBrand && (
              <select value={selectedMotoModel} onChange={(e) => setSelectedMotoModel(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-tertiary px-3 py-2 text-xs text-text-primary outline-none focus:border-interactive-accent">
                <option value="">Todos los modelos</option>
                {selectedMotoModels.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            )}
            {(selectedMotoBrand || selectedMotoModel) && (
              <button onClick={() => { setSelectedMotoBrand(""); setSelectedMotoModel(""); }}
                className="text-[10px] text-interactive-accent hover:underline">
                Limpiar selección
              </button>
            )}
          </div>
        )}
      </div>

      {/* Marca */}
      <div>
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2.5">Marca del producto</h3>
        <div className="space-y-1.5">
          {availableBrands.slice(0, brandsExpanded ? availableBrands.length : 5).map(([brand, count]) => (
            <label key={brand} className="flex items-center gap-2.5 cursor-pointer group py-0.5">
              <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)}
                className="w-4 h-4 rounded border-border text-interactive-accent focus:ring-interactive-accent bg-surface-tertiary" />
              <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors flex-1">{brand}</span>
              <span className="text-[11px] text-text-tertiary">({count})</span>
            </label>
          ))}
        </div>
        {availableBrands.length > 5 && (
          <button onClick={() => setBrandsExpanded(!brandsExpanded)}
            className="text-xs text-interactive-accent mt-2 hover:text-interactive-accent-hover flex items-center gap-1">
            {brandsExpanded ? "Ver menos" : `Ver más (${availableBrands.length - 5})`}
          </button>
        )}
      </div>

      {/* Precio */}
      <div>
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2.5">Precio</h3>
        <input type="range" min={0} max={maxPrice || 500000} value={priceRange[1]}
          onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
          className="w-full h-1.5 bg-surface-tertiary rounded-lg appearance-none cursor-pointer accent-interactive-accent" />
        <div className="flex justify-between mt-1.5">
          <span className="text-[11px] text-text-tertiary">${priceRange[0].toLocaleString()}</span>
          <span className="text-[11px] text-text-tertiary font-medium">${priceRange[1].toLocaleString()}+</span>
        </div>
      </div>

      {/* Disponibilidad */}
      <div>
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2.5">Disponibilidad</h3>
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 rounded border-border text-interactive-accent focus:ring-interactive-accent bg-surface-tertiary" />
          <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Solo en stock</span>
          <span className="text-[11px] text-text-tertiary">({allProducts.filter(p => (p.stock ?? 0) > 0).length})</span>
        </label>
      </div>

      {/* Calificación */}
      <div>
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2.5">Calificación</h3>
        <div className="space-y-1.5">
          {[4, 3, 2, 1].map((r) => (
            <button key={r} onClick={() => setMinRating(minRating === r ? 0 : r)}
              className={`w-full flex items-center gap-2 py-1 px-1 rounded-lg transition-all ${minRating === r ? "bg-interactive-accent/10" : "hover:bg-surface-tertiary"}`}>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} className={i < r ? "text-amber-400 fill-amber-400" : "text-text-tertiary/30"} />
                ))}
              </div>
              <span className={`text-xs ${minRating === r ? "text-interactive-accent font-medium" : "text-text-tertiary"}`}>y más</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SEO title="Tienda Online | MotoPro" description="Productos, repuestos y accesorios para tu moto." />
      <Navbar />
      <main className="bg-surface-primary min-h-screen pt-16">

        {/* Hero */}
        <section className="pt-12 sm:pt-16 pb-6 sm:pb-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
            <span className="text-[10px] sm:text-xs font-bold text-interactive-accent uppercase tracking-[0.2em]">Categorías</span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mt-2 sm:mt-3">
              Encuentra por <span className="text-interactive-accent">categoría</span>
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-2 sm:mt-3 max-w-lg mx-auto px-4">
              Explora nuestras categorías y encuentra los mejores repuestos y accesorios para tu moto.
            </p>
          </div>
        </section>

        {/* Search with Category Dropdown */}
        <section className="pb-6 sm:pb-8">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="flex gap-2 sm:gap-3">
              <div className="relative">
                <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}
                  className="h-11 sm:h-12 pl-3 pr-8 rounded-xl border border-border bg-surface-secondary text-xs sm:text-sm text-text-primary appearance-none cursor-pointer focus:border-interactive-accent focus:outline-none">
                  <option value="">Todas</option>
                  {storeCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
              </div>
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input type="text" placeholder="Buscar por nombre, marca o SKU..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 sm:h-12 pl-10 pr-10 rounded-xl border border-border bg-surface-secondary text-sm text-text-primary placeholder:text-text-tertiary focus:border-interactive-accent focus:outline-none transition-colors" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary">
                    <X size={15} />
                  </button>
                )}
              </div>
              <button className="h-11 sm:h-12 px-5 sm:px-6 rounded-xl bg-interactive-accent text-white text-sm font-semibold hover:bg-interactive-accent-hover transition-all shrink-0">
                Buscar
              </button>
            </div>
          </div>
        </section>

        {/* Category Carousel */}
        <section className="pb-8 sm:pb-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="relative group/carousel">
              <button onClick={() => scrollCarousel(-1)}
                className="absolute -left-1 sm:left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-surface-secondary/90 border border-border flex items-center justify-center hover:border-interactive-accent/50 hover:bg-surface-secondary transition-all shadow-lg opacity-0 group-hover/carousel:opacity-100"
                style={{ transform: "translateX(-50%) translateY(-50%)" }}>
                <ChevronLeft size={18} className="text-text-secondary" />
              </button>

              <div ref={carouselRef} className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide px-1" style={{ scrollbarWidth: "none", scrollSnapType: "x mandatory" }}>
                {storeCategories.map((cat) => (
                  <div key={cat.id} className="snap-start">
                    <CategoryCard category={cat} count={getCategoryCount(cat.name)}
                      isSelected={selectedCategory === cat.name}
                      onClick={() => setSelectedCategory(selectedCategory === cat.name ? "" : cat.name)} />
                  </div>
                ))}
              </div>

              <button onClick={() => scrollCarousel(1)}
                className="absolute -right-1 sm:right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-surface-secondary/90 border border-border flex items-center justify-center hover:border-interactive-accent/50 hover:bg-surface-secondary transition-all shadow-lg opacity-0 group-hover/carousel:opacity-100"
                style={{ transform: "translateX(50%) translateY(-50%)" }}>
                <ChevronRight size={18} className="text-text-secondary" />
              </button>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-6 sm:py-8 border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex gap-6 lg:gap-8">

              {/* Sidebar Filters - Desktop */}
              <aside className="hidden lg:block w-60 shrink-0">
                <div className="sticky top-24">
                  <FilterPanel />
                </div>
              </aside>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                      {selectedCategory || "Todos los productos"}
                    </h2>
                    <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                      {filteredProducts.length} productos encontrados
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button onClick={() => setShowMobileFilters(true)}
                      className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-xs sm:text-sm text-text-secondary hover:border-interactive-accent/40 transition-colors">
                      <SlidersHorizontal size={14} /> Filtros
                      {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-interactive-accent" />}
                    </button>

                    <div className="relative">
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                        className="h-9 pl-3 pr-8 rounded-lg border border-border bg-surface-secondary text-xs sm:text-sm text-text-primary appearance-none cursor-pointer focus:border-interactive-accent focus:outline-none">
                        <option value="featured">Más vendidos</option>
                        <option value="newest">Más recientes</option>
                        <option value="price-low">Menor precio</option>
                        <option value="price-high">Mayor precio</option>
                        <option value="name-az">Nombre A-Z</option>
                        <option value="name-za">Nombre Z-A</option>
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                    </div>

                    <div className="hidden sm:flex items-center gap-0.5 p-0.5 rounded-lg border border-border">
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
                        <button onClick={() => setSelectedCategory("")}><X size={12} /></button>
                      </span>
                    )}
                    {searchCategory && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-interactive-accent/10 text-interactive-accent text-xs font-medium">
                        Categoría: {searchCategory}
                        <button onClick={() => setSearchCategory("")}><X size={12} /></button>
                      </span>
                    )}
                    {selectedBrands.map(b => (
                      <span key={b} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-interactive-accent/10 text-interactive-accent text-xs font-medium">
                        {b}
                        <button onClick={() => toggleBrand(b)}><X size={12} /></button>
                      </span>
                    ))}
                    {selectedMotoBrand && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-interactive-accent/10 text-interactive-accent text-xs font-medium">
                        <Bike size={12} /> {selectedMotoBrand}{selectedMotoModel ? ` ${selectedMotoModel}` : ""}
                        <button onClick={() => { setSelectedMotoBrand(""); setSelectedMotoModel(""); }}><X size={12} /></button>
                      </span>
                    )}
                    {inStockOnly && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-interactive-accent/10 text-interactive-accent text-xs font-medium">
                        En stock
                        <button onClick={() => setInStockOnly(false)}><X size={12} /></button>
                      </span>
                    )}
                    {minRating > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-interactive-accent/10 text-interactive-accent text-xs font-medium">
                        {minRating}+ estrellas
                        <button onClick={() => setMinRating(0)}><X size={12} /></button>
                      </span>
                    )}
                    <button onClick={clearFilters} className="text-xs text-text-tertiary hover:text-interactive-accent transition-colors ml-1">
                      Limpiar todo
                    </button>
                  </div>
                )}

                {/* Products */}
                {loading ? (
                  <div className={`grid gap-4 sm:gap-5 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="bg-surface-secondary border border-border rounded-2xl overflow-hidden animate-pulse">
                        <div className={`bg-surface-tertiary ${viewMode === "grid" ? "aspect-square" : "h-40"}`} />
                        <div className="p-4 space-y-3">
                          <div className="h-3 bg-surface-tertiary rounded w-1/3" />
                          <div className="h-4 bg-surface-tertiary rounded w-full" />
                          <div className="h-5 bg-surface-tertiary rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : paginatedProducts.length === 0 ? (
                  <div className="text-center py-16 sm:py-20">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-2xl bg-surface-secondary flex items-center justify-center">
                      <IconRenderer name="search" size={28} className="text-text-tertiary" />
                    </div>
                    <p className="text-base sm:text-lg font-bold text-text-primary">Sin resultados</p>
                    <p className="text-xs sm:text-sm text-text-tertiary mt-1 mb-5">No encontramos productos con esos filtros</p>
                    <button onClick={clearFilters} className="px-5 py-2.5 rounded-lg bg-interactive-accent text-white text-sm font-semibold hover:bg-interactive-accent-hover transition-all">
                      Limpiar filtros
                    </button>
                  </div>
                ) : (
                  <div className={`grid gap-4 sm:gap-5 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
                    {paginatedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} onQuickView={setQuickViewProduct} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-8 sm:mt-10">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                      className="px-2.5 sm:px-3 py-2 rounded-lg border border-border text-xs sm:text-sm text-text-secondary hover:border-interactive-accent/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1">
                      <ChevronLeft size={14} /> <span className="hidden sm:inline">Anterior</span>
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      let page: number;
                      if (totalPages <= 5) page = i + 1;
                      else if (currentPage <= 3) page = i + 1;
                      else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                      else page = currentPage - 2 + i;
                      return (
                        <button key={page} onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs sm:text-sm font-medium transition-all ${currentPage === page ? "bg-interactive-accent text-white" : "border border-border text-text-secondary hover:border-interactive-accent/40"}`}>
                          {page}
                        </button>
                      );
                    })}

                    {totalPages > 5 && <span className="text-text-tertiary text-sm">...</span>}

                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                      className="px-2.5 sm:px-3 py-2 rounded-lg border border-border text-xs sm:text-sm text-text-secondary hover:border-interactive-accent/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1">
                      <span className="hidden sm:inline">Siguiente</span> <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Filter Drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
            <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-surface-primary border-l border-border overflow-y-auto">
              <div className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-bold text-text-primary">Filtros</h2>
                  <button onClick={() => setShowMobileFilters(false)} className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center hover:bg-surface-tertiary transition-colors">
                    <X size={16} className="text-text-secondary" />
                  </button>
                </div>
                <FilterPanel />
                <button onClick={() => setShowMobileFilters(false)}
                  className="w-full mt-6 py-3 rounded-xl bg-interactive-accent text-white text-sm font-semibold hover:bg-interactive-accent-hover transition-all">
                  Ver {filteredProducts.length} productos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick View Modal */}
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} onAddToCart={handleAddToCart} />
      </main>
      <Footer />
      <BackToTop />
      <WhatsAppFloat />
    </>
  );
}
