import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import { SEO, productSchema } from "@/components/SEO";
import { api } from "@/api/client";
import { useCart } from "@/providers/CartProvider";
import { useToast } from "@/providers/ToastProvider";
import { useAuth } from "@/providers/AuthProvider";

import { ProductImageGallery } from "../components/ProductImageGallery";
import { ProductInfo } from "../components/ProductInfo";
import { ProductTabs } from "../components/ProductTabs";
import { Breadcrumb } from "@/components/ui";
import { RelatedProducts } from "../components/RelatedProducts";

type TabId = "description" | "specs" | "reviews" | "compatibility" | "questions" | "video" | "spin" | "shipping" | "warranty_info";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabId>("description");
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [showZoom, setShowZoom] = useState(false);
  const [spinIndex, setSpinIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const spinRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    api.get(`/products/slug/${slug}`).then((data) => {
      const p = data?.data || data;
      setProduct(p || null);
    }).catch(() => setProduct(null)).finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!user || !product?.id) return;
    api.get("/customer-auth/wishlist").then((data) => {
      const items = Array.isArray(data) ? data : data?.data || [];
      setLiked(items.some((i: any) => String(i.product_id ?? i.id) === String(product.id)));
    }).catch(() => {});
  }, [user, product?.id]);

  const handleImageMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x, y });
  };

  const startSpin = (e: React.MouseEvent) => { setIsSpinning(true); spinRef.current && (spinRef.current.dataset.startX = String(e.clientX)); };
  const spinMove = (e: React.MouseEvent) => {
    if (!isSpinning || !spinImages.length) return;
    const diff = e.clientX - Number(spinRef.current?.dataset.startX || 0);
    if (Math.abs(diff) > 20) {
      const dir = diff > 0 ? 1 : -1;
      setSpinIndex(i => (i + dir + spinImages.length) % spinImages.length);
      spinRef.current && (spinRef.current.dataset.startX = String(e.clientX));
    }
  };
  const stopSpin = () => setIsSpinning(false);

  if (loading) {
    return (
      <>
        <SEO title="Cargando..." />
        <main className="bg-surface-primary min-h-screen pt-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-surface-tertiary rounded-2xl animate-pulse" />
              <div className="space-y-4">
                <div className="h-6 w-24 bg-surface-tertiary rounded animate-pulse" />
                <div className="h-8 w-3/4 bg-surface-tertiary rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-surface-tertiary rounded animate-pulse" />
                <div className="h-20 w-full bg-surface-tertiary rounded animate-pulse" />
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <SEO title="Producto no encontrado" />
        <main className="bg-surface-primary min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <span className="text-5xl block mb-4">🔍</span>
            <p className="text-text-primary text-lg font-semibold">Producto no encontrado</p>
            <Link to="/tienda" className="inline-block mt-4 text-interactive-accent hover:underline">Volver a la tienda</Link>
          </div>
        </main>
      </>
    );
  }

  const price = product.price || 0;
  const originalPrice = product.compare_price || product.original_price || 0;
  const hasDiscount = originalPrice > price;
  const images = [product.image, ...(product.images || []).map((img: any) => img.image_url || img.image)].filter(Boolean);
  const spinImages = product?.spin_images || [];
  const formatPrice = (val: number) => `$${Math.round(val).toLocaleString()}`;
  const specs = product.specifications || product.specs || [];
  const reviewsArr = Array.isArray(product.reviews) ? product.reviews : [];
  const relatedProducts = Array.isArray(product.related) ? product.related : [];
  const stock = product.stock ?? product.quantity ?? 0;
  const stockLevel = stock > 20 ? "high" : stock > 5 ? "medium" : stock > 0 ? "low" : "out";
  const stockColors: Record<string, string> = { high: "text-green-400 bg-green-500/10", medium: "text-amber-400 bg-amber-500/10", low: "text-orange-400 bg-orange-500/10", out: "text-red-400 bg-red-500/10" };
  const stockLabels: Record<string, string> = { high: "En stock", medium: "Stock medio", low: "Últimas unidades", out: "Agotado" };

  const toggleWishlist = async () => {
    try {
      if (liked) await api.delete(`/customer-auth/wishlist/${product.id}`);
      else await api.post("/customer-auth/wishlist", { product_id: product.id });
      setLiked(!liked);
      addToast(liked ? "Eliminado de favoritos" : "Agregado a favoritos", "success");
    } catch { addToast("Error al actualizar favoritos", "error"); }
  };

  const priceHistory = product.price_history || [];

  const tabs: { id: TabId; label: string }[] = [
    { id: "description", label: "Descripción" },
    { id: "specs", label: "Ficha Técnica" },
    { id: "compatibility", label: "Compatibilidad" },
    { id: "reviews", label: `Opiniones (${reviewsArr.length})` },
    { id: "questions", label: "Preguntas" },
    ...(product.video_url ? [{ id: "video" as TabId, label: "Video" }] : []),
    ...(product.spin_images?.length > 0 || product.has_spin ? [{ id: "spin" as TabId, label: "360°" }] : []),
    ...(product.shipping_info ? [{ id: "shipping" as TabId, label: "Envíos" }] : []),
    ...(product.warranty ? [{ id: "warranty_info" as TabId, label: "Garantía" }] : []),
  ];

  return (
    <>
      <SEO title={`${product.name} | MotoPro`} description={product.description}
        structuredData={productSchema({
          name: product.name, description: product.description, price: product.price,
          image: product.image || product.images?.[0], sku: product.sku, rating: product.rating, reviews: product.review_count,
        })} />
      <main className="bg-surface-primary min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Breadcrumb */}
          <Breadcrumb items={[
            { label: "Inicio", href: "/" },
            { label: "Tienda", href: "/tienda" },
            { label: product.name }
          ]} className="mb-6" />

          <div className="grid gap-12 lg:grid-cols-2">
            <ProductImageGallery
              images={images}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              product={product}
              hasDiscount={hasDiscount}
              price={price}
              originalPrice={originalPrice}
              handleImageMove={handleImageMove}
              showZoom={showZoom}
              setShowZoom={setShowZoom}
              zoomOrigin={zoomOrigin}
            />

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <ProductInfo
                product={product}
                liked={liked}
                toggleWishlist={toggleWishlist}
                formatPrice={formatPrice}
                priceHistory={priceHistory}
                stockLevel={stockLevel}
                stockColors={stockColors}
                stockLabels={stockLabels}
                price={price}
                originalPrice={originalPrice}
                hasDiscount={hasDiscount}
                quantity={quantity}
                setQuantity={setQuantity}
                stock={stock}
                addItem={addItem}
                addToast={addToast}
                images={images}
              >
                <ProductTabs
                  tabs={tabs}
                  selectedTab={selectedTab}
                  setSelectedTab={setSelectedTab}
                  product={product}
                  specs={specs}
                  reviewsArr={reviewsArr}
                  spinImages={spinImages}
                  spinIndex={spinIndex}
                  isSpinning={isSpinning}
                  spinRef={spinRef}
                  startSpin={startSpin}
                  spinMove={spinMove}
                  stopSpin={stopSpin}
                />
              </ProductInfo>
            </motion.div>
          </div>

          <RelatedProducts relatedProducts={relatedProducts} formatPrice={formatPrice} />
        </div>
      </main>

    </>
  );
}
