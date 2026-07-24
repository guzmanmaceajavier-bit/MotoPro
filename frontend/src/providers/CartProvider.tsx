import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartItem } from "@/types";
import { api } from "@/api/client";

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string | number) => void;
  decrementItem: (id: string | number) => void;
  updateQuantity: (id: string | number, qty: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
  subtotal: number;
  shipping: number;
  setShipping: (v: number) => void;
  discount: number;
  setDiscount: (v: number) => void;
  couponCode: string;
  setCouponCode: (v: string) => void;
  applyCoupon: () => Promise<boolean>;
}

const CartContext = createContext<CartContextType | null>(null);

function loadCart(): CartItem[] {
  try {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);
  const [shipping, setShipping] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");

  useEffect(() => { localStorage.setItem("cart", JSON.stringify(items)); }, [items]);

  const addItem = (product: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, quantity: i.quantity + (product.quantity || 1) }
            : i
        );
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
  };

  const removeItem = (id: string | number) => setItems((prev) => prev.filter((i) => i.id !== id));

  const decrementItem = (id: string | number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing && existing.quantity <= 1) return prev.filter((i) => i.id !== id);
      return prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i));
    });
  };

  const updateQuantity = (id: string | number, qty: number) => {
    if (qty < 1) { removeItem(id); return; }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
  };

  const clearCart = () => { setItems([]); setDiscount(0); setCouponCode(""); setShipping(0); };

  const applyCoupon = async () => {
    try {
      const res = await api.post("/coupons/validate", { code: couponCode, cartTotal: total });
      if (res?.discount != null) {
        setDiscount(Math.round(res.discount));
        return true;
      } else {
        setDiscount(0);
        return false;
      }
    } catch {
      setDiscount(0);
      return false;
    }
  };

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const subtotal = total;
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, decrementItem, updateQuantity, clearCart,
      total, count, subtotal, shipping, setShipping, discount, setDiscount,
      couponCode, setCouponCode, applyCoupon,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
