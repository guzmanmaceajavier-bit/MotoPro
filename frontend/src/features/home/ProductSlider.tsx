import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "@/api/client";
import { useCart } from "@/providers/CartProvider";
import { useToast } from "@/providers/ToastProvider";

const bgGradients: Record<string, string> = {
  tire: "from-blue-500/10 to-cyan-500/10", chain: "from-orange-500/10 to-red-500/10",
  brake: "from-red-500/10 to-rose-500/10", filter: "from-green-500/10 to-emerald-500/10",
  battery: "from-yellow-500/10 to-amber-500/10", engine: "from-gray-500/10 to-slate-500/10",
  oil: "from-amber-500/10 to-yellow-500/10", helmet: "from-interactive-accent/10 to-pink-500/10",
  lights: "from-cyan-500/10 to-blue-500/10", gloves: "from-rose-500/10 to-red-500/10",
  jacket: "from-indigo-500/10 to-interactive-accent/10", paint: "from-fuchsia-500/10 to-interactive-accent/10",
};
const productIcons: Record<string, string> = {
  tire: "🔘", chain: "⛓️", brake: "🛞", filter: "🔧", battery: "🔋",
  engine: "⚙️", oil: "🛢️", helmet: "🪖", lights: "💡", gloves: "🧤", jacket: "🧥", paint: "🎨",
};

const formatPrice = (p: number) => "$" + p.toLocaleString();

const fallbackProducts = [
  { id: "fb1", name: "Aceite Sintético 10W40", price: 45000, image: "oil", categoryName: "Lubricantes", is_active: 1 },
  { id: "fb2", name: "Kit de Arrastre Reforzado", price: 120000, image: "chain", categoryName: "Transmisión", is_active: 1 },
  { id: "fb3", name: "Pastillas de Freno Cerámicas", price: 35000, image: "brake", categoryName: "Frenos", is_active: 1 },
  { id: "fb4", name: "Batería Libre de Mantenimiento", price: 98000, image: "battery", categoryName: "Eléctrico", is_active: 1 },
  { id: "fb5", name: "Filtro de Aire Deportivo", price: 28000, image: "filter", categoryName: "Admisión", is_active: 1 },
  { id: "fb6", name: "Casco Integral Deportivo", price: 180000, image: "helmet", categoryName: "Accesorios", is_active: 1 },
  { id: "fb7", name: "Guantes de Protección", price: 65000, image: "gloves", categoryName: "Accesorios", is_active: 1 },
  { id: "fb8", name: "Chaqueta Impermeable", price: 250000, image: "jacket", categoryName: "Accesorios", is_active: 1 },
];

export function ProductSlider() {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/products/featured").then((data) => {
      const items = data?.data || data || [];
      const filtered = (Array.isArray(items) ? items : []).filter((p: any) => p.is_active !== 0);
      setProducts(filtered.length > 0 ? filtered : fallbackProducts);
    }).catch(() => setProducts(fallbackProducts)).finally(() => setLoading(false));
  }, []);

  const handleAdd = (product: any) => {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image });
    addToast(`${product.name} agregado al carrito`, "success");
  };

  if (loading) {
    return (
      <section className="py-20 bg-surface-primary">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="rounded-2xl bg-white/5 animate-pulse h-[280px]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-30 relative overflow-hidden bg-surface-primary">
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="mx-auto max-w-7xl px-4 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">
              Productos <span className="text-transparent bg-clip-text bg-gradient-to-r from-interactive-accent to-blue-400">destacados</span>
            </h2>
            <p className="mt-2 text-gray-400 text-sm">Lo más vendido de la semana</p>
          </div>
          <Link to="/tienda"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-interactive-accent hover:text-interactive-accent-hover transition-colors"
          >
            Ver todo <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.slice(0, 8).map((product, i) => (
            <motion.div key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-2xl border border-white/5 bg-surface-secondary overflow-hidden hover:border-interactive-accent/40 hover:shadow-lg hover:shadow-interactive-accent/5 transition-all duration-300"
            >
              <div className={`h-36 flex items-center justify-center bg-gradient-to-br ${bgGradients[product.image] || "from-gray-500/10 to-slate-500/10"} relative overflow-hidden`}>
                <span className="text-5xl opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-300">{productIcons[product.image] || "🔧"}</span>
                {product.price < 1000 && (
                  <span className="absolute top-2 left-2 bg-red-500/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    Oferta
                  </span>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-red-400 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </button>
                  <button className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-blue-400 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[10px] text-interactive-accent font-medium">{product.categoryName || "General"}</span>
                </div>
                <h3 className="text-sm font-medium text-white truncate">{product.name}</h3>
                <div className="flex items-center gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-interactive-accent">{formatPrice(product.price)}</span>
                  <button onClick={() => handleAdd(product)}
                    className="rounded-lg bg-interactive-accent/10 hover:bg-interactive-accent px-3 py-1.5 text-xs font-semibold text-interactive-accent hover:text-white transition-all"
                  >
                    + Carrito
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to="/tienda"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-interactive-accent hover:text-interactive-accent-hover transition-colors"
          >
            Ver todos los productos <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
