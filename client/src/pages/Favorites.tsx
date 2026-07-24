import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";

interface WishlistItem {
  wish_id: string; product_id: string; name: string; price: number; image?: string; stock?: number; created_at: string;
}

export default function Favorites() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/customer-auth/wishlist").then((r) => {
      setItems(Array.isArray(r) ? r : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const removeItem = async (productId: string) => {
    try {
      await api.delete(`/customer-auth/wishlist/${productId}`);
      setItems(items.filter((i) => i.product_id !== productId));
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Favoritos</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Productos guardados en tu lista de deseos</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-48 w-full rounded-xl" />)}</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
          <Heart size={48} className="mx-auto mb-4" style={{ color: "var(--text-tertiary)" }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text)" }}>Sin favoritos</h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Los productos que guardes aparecerán aquí.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.wish_id} className="rounded-xl p-4 transition-all hover:shadow-sm" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <div className="aspect-square rounded-lg mb-3 flex items-center justify-center" style={{ background: "var(--bg-muted)" }}>
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Heart size={32} style={{ color: "var(--text-tertiary)" }} />
                )}
              </div>
              <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>{item.name}</h3>
              <p className="text-base font-bold mt-1" style={{ color: "var(--accent)" }}>${item.price.toLocaleString()}</p>
              {item.stock !== undefined && (
                <p className="text-xs mt-1" style={{ color: item.stock > 0 ? "#22C55E" : "#EF4444" }}>
                  {item.stock > 0 ? `${item.stock} en stock` : "Agotado"}
                </p>
              )}
              <div className="flex gap-2 mt-3">
                <a href={`/tienda`} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-white transition-all"
                  style={{ background: "var(--accent)" }}>
                  <ShoppingCart size={13} /> Ver tienda
                </a>
                <button onClick={() => removeItem(item.product_id)}
                  className="p-2 rounded-lg hover:bg-red-50 transition-all" style={{ color: "#EF4444" }} title="Eliminar" type="button">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
