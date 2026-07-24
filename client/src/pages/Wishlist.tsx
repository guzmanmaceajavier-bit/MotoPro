import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Heart, ShoppingCart, Trash2, Package, Bike } from "lucide-react";

interface Favorite {
  id: string; product_id: string; product_name?: string; product_price?: number;
  product_image?: string; product_brand?: string;
}

export default function Wishlist() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/customer-auth/wishlist").then((r) => {
      const d = Array.isArray(r) ? r : [];
      setFavorites(d);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const remove = async (productId: string) => {
    try {
      await api.delete(`/customer-auth/wishlist/${productId}`);
      setFavorites((prev) => prev.filter((f) => f.product_id !== productId));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Favoritos</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Productos que te han gustado</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl p-5" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <div className="skeleton h-32 w-full rounded-lg mb-3" />
              <div className="skeleton h-4 w-32 mb-2" />
              <div className="skeleton h-3 w-20" />
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
          <Heart size={48} style={{ color: "var(--text-tertiary)" }} className="mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text)" }}>Sin favoritos</h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Agrega productos a tu lista de favoritos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((fav) => (
            <div key={fav.id} className="rounded-xl overflow-hidden transition-all hover:shadow-sm"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <div className="h-36 flex items-center justify-center" style={{ background: "var(--bg-muted)" }}>
                {fav.product_image ? (
                  <img src={fav.product_image} alt={fav.product_name} className="w-full h-full object-cover" />
                ) : (
                  <Package size={36} style={{ color: "var(--text-tertiary)" }} />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>{fav.product_name || "Producto"}</h3>
                    {fav.product_brand && (
                      <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{fav.product_brand}</p>
                    )}
                  </div>
                  <button onClick={() => remove(fav.product_id)} className="p-1.5 rounded-md hover:bg-red-50 transition-all shrink-0" style={{ color: "#EF4444" }} title="Eliminar" type="button">
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: "var(--border-light)" }}>
                  <span className="text-sm font-bold" style={{ color: "var(--text)" }}>
                    ${fav.product_price?.toLocaleString() || "0"}
                  </span>
                  <button className="btn btn-primary btn-xs" type="button">
                    <ShoppingCart size={11} /> Añadir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
