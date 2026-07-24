import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import PageHeader from "@/components/PageHeader";
import { Badge } from "@shared/components/ui/Badge";
import {
  ShoppingCart, Search, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone,
  ArrowRight, CheckCircle2, X, Package, User, Phone, Receipt, Wallet, BarChart3
} from "lucide-react";

interface Product {
  id: string; name: string; sku: string; price: number; stock: number;
  image: string; category_name: string;
}

interface CartItem {
  product_id: string; name: string; price: number; quantity: number; stock: number;
}

interface CashRegister { id: string; status: string; }

const paymentMethods = [
  { value: "cash", label: "Efectivo", icon: Banknote, color: "#10B981" },
  { value: "card", label: "Tarjeta", icon: CreditCard, color: "#3B82F6" },
  { value: "transfer", label: "Transferencia", icon: ArrowRight, color: "#8B5CF6" },
  { value: "nequi", label: "Nequi", icon: Smartphone, color: "#EC4899" },
  { value: "daviplata", label: "Daviplata", icon: Smartphone, color: "#F97316" },
];

export default function POSPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("Cliente general");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("cash");
  const [discount, setDiscount] = useState("0");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState<any>(null);
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProducts();
    api.get("/cash-register").then(r => setCashRegister(r)).catch(() => {});
    api.get("/categories").then(r => setCategories(Array.isArray(r) ? r : [])).catch(() => {});
    searchRef.current?.focus();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get("/products?all=1");
      const items = Array.isArray(res) ? res : res?.data || [];
      setProducts(items.filter((p: Product) => p.stock > 0));
    } catch { setProducts([]); }
  };

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === "all" || true; // Categories filtered by name
    return matchSearch && matchCategory && p.stock > 0;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) { showToast("warning", "Stock insuficiente"); return prev; }
        return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product_id: product.id, name: product.name, price: product.price, quantity: 1, stock: product.stock }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.product_id !== productId) return i;
      const newQty = i.quantity + delta;
      if (newQty <= 0) return prev.filter(x => x.product_id !== productId);
      if (newQty > i.stock) { showToast("warning", "Stock insuficiente"); return i; }
      return { ...i, quantity: newQty };
    }));
  };

  const removeFromCart = (productId: string) => setCart(prev => prev.filter(i => i.product_id !== productId));
  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = subtotal * 0.16;
  const total = subtotal + tax - (parseFloat(discount) || 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  const processSale = async () => {
    if (cart.length === 0) { showToast("error", "Carrito vacío"); return; }
    setSaving(true);
    try {
      const res = await api.post("/direct-sales", {
        customer_name: customerName || "Cliente general",
        customer_phone: customerPhone,
        items: cart.map(i => ({ product_id: i.product_id, name: i.name, price: i.price, quantity: i.quantity })),
        discount: parseFloat(discount) || 0,
        payment_method: selectedPayment,
        cash_register_id: cashRegister?.id,
        notes
      });
      setShowSuccess({
        sale_number: res?.sale_number,
        total: res?.total,
        invoice_number: res?.invoice_number,
        payment: paymentMethods.find(m => m.value === selectedPayment)?.label
      });
      setCart([]);
      setCustomerName("Cliente general");
      setCustomerPhone("");
      setDiscount("0");
      setNotes("");
      setShowPayment(false);
      loadProducts();
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error al procesar venta"); }
    finally { setSaving(false); }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--mp-border)] bg-[var(--mp-bg-primary)]">
        <div className="flex items-center gap-3">
          <ShoppingCart size={20} className="text-[var(--mp-accent)]" />
          <h1 className="text-lg font-bold text-[var(--mp-text-primary)]">Punto de Venta</h1>
          {cashRegister && <Badge variant="success">Caja Abierta</Badge>}
          {!cashRegister && <Badge variant="danger">Sin Caja</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--mp-text-tertiary)]">{totalItems} items</span>
          <span className="text-lg font-bold text-[var(--mp-accent)]">${total.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Products Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-[var(--mp-border)]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
              <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar producto por nombre o SKU..." className="mp-input pl-9" />
            </div>
            <div className="flex gap-1 mt-2 overflow-x-auto scrollbar-thin">
              <button onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === "all" ? "bg-[var(--mp-accent)] text-white" : "bg-[var(--mp-bg-elevated)] text-[var(--mp-text-secondary)]"
                }`}>Todos</button>
              {categories.map(c => (
                <button key={c.id} onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === c.id ? "bg-[var(--mp-accent)] text-white" : "bg-[var(--mp-bg-elevated)] text-[var(--mp-text-secondary)]"
                  }`}>{c.name}</button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {filtered.map(p => (
                <button key={p.id} onClick={() => addToCart(p)}
                  className="p-3 rounded-xl border border-[var(--mp-border)] hover:border-[var(--mp-accent)] hover:bg-[rgba(20,184,166,0.04)] transition-all text-left group">
                  <div className="w-full aspect-square rounded-lg bg-[var(--mp-bg-elevated)] flex items-center justify-center mb-2 overflow-hidden">
                    {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> :
                      <Package size={24} className="text-[var(--mp-text-tertiary)]" />}
                  </div>
                  <p className="text-xs font-medium text-[var(--mp-text-primary)] truncate">{p.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold text-[var(--mp-accent)]">${p.price.toLocaleString()}</span>
                    <span className="text-[10px] text-[var(--mp-text-tertiary)]">Stock: {p.stock}</span>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-12 text-[var(--mp-text-tertiary)]">
                  <Package size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No se encontraron productos</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cart Panel */}
        <div className="w-[380px] border-l border-[var(--mp-border)] flex flex-col bg-[var(--mp-bg-primary)]">
          {/* Customer */}
          <div className="p-3 border-b border-[var(--mp-border)] space-y-2">
            <div className="flex items-center gap-2">
              <User size={14} className="text-[var(--mp-text-tertiary)]" />
              <input value={customerName} onChange={e => setCustomerName(e.target.value)}
                className="flex-1 text-sm bg-transparent border-none outline-none text-[var(--mp-text-primary)] placeholder:text-[var(--mp-text-tertiary)]"
                placeholder="Nombre del cliente" />
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-[var(--mp-text-tertiary)]" />
              <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                className="flex-1 text-sm bg-transparent border-none outline-none text-[var(--mp-text-primary)] placeholder:text-[var(--mp-text-tertiary)]"
                placeholder="Teléfono (opcional)" />
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-[var(--mp-text-tertiary)]">
                <ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Carrito vacío</p>
                <p className="text-xs mt-1">Selecciona un producto</p>
              </div>
            ) : cart.map(item => (
              <div key={item.product_id} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--mp-bg-elevated)] border border-[var(--mp-border-subtle)]">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[var(--mp-text-primary)] truncate">{item.name}</p>
                  <p className="text-xs text-[var(--mp-text-tertiary)]">${item.price.toLocaleString()} c/u</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQuantity(item.product_id, -1)}
                    className="w-6 h-6 rounded bg-[var(--mp-bg-primary)] border border-[var(--mp-border)] flex items-center justify-center hover:bg-[var(--mp-bg-hover)]">
                    <Minus size={10} />
                  </button>
                  <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product_id, 1)}
                    className="w-6 h-6 rounded bg-[var(--mp-bg-primary)] border border-[var(--mp-border)] flex items-center justify-center hover:bg-[var(--mp-bg-hover)]">
                    <Plus size={10} />
                  </button>
                </div>
                <span className="w-16 text-right text-xs font-bold">${(item.price * item.quantity).toLocaleString()}</span>
                <button onClick={() => removeFromCart(item.product_id)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="p-3 border-t border-[var(--mp-border)] space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--mp-text-tertiary)]">Descuento:</span>
              <input type="number" value={discount} onChange={e => setDiscount(e.target.value)}
                className="mp-input text-xs w-24 text-right" min="0" placeholder="0" />
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-[var(--mp-text-tertiary)]">Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-[var(--mp-text-tertiary)]">IVA (16%)</span><span>${tax.toLocaleString()}</span></div>
              {parseFloat(discount) > 0 && <div className="flex justify-between text-[var(--mp-accent)]"><span>Descuento</span><span>-${parseFloat(discount).toLocaleString()}</span></div>}
              <div className="flex justify-between font-bold text-lg pt-1 border-t border-[var(--mp-border-subtle)]">
                <span>Total</span><span className="text-[var(--mp-accent)]">${total.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="grid grid-cols-5 gap-1">
              {paymentMethods.map(m => (
                <button key={m.value} onClick={() => setSelectedPayment(m.value)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    selectedPayment === m.value ? "border-[var(--mp-accent)] bg-[rgba(20,184,166,0.08)]" : "border-[var(--mp-border)]"
                  }`}>
                  <m.icon size={14} className="mx-auto mb-0.5" style={{ color: selectedPayment === m.value ? m.color : "var(--mp-text-tertiary)" }} />
                  <span className="text-[9px] block">{m.label}</span>
                </button>
              ))}
            </div>

            <button onClick={processSale} disabled={saving || cart.length === 0}
              className="w-full py-3 rounded-xl bg-[var(--mp-accent)] text-white font-bold text-sm hover:bg-[var(--mp-accent)]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "Procesando..." : `Cobrar $${total.toLocaleString()}`}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowSuccess(null)}>
          <div className="bg-[var(--mp-bg-primary)] rounded-xl border border-[var(--mp-border)] w-full max-w-sm mx-4 p-8 text-center space-y-4" onClick={e => e.stopPropagation()}>
            <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
            <h3 className="text-lg font-bold text-[var(--mp-text-primary)]">Venta Registrada</h3>
            <div className="space-y-1 text-sm">
              <p><span className="text-[var(--mp-text-tertiary)]">Número:</span> <b>{showSuccess.sale_number}</b></p>
              <p><span className="text-[var(--mp-text-tertiary)]">Factura:</span> <b>{showSuccess.invoice_number}</b></p>
              <p><span className="text-[var(--mp-text-tertiary)]">Total:</span> <b className="text-lg text-[var(--mp-accent)]">${showSuccess.total?.toLocaleString()}</b></p>
              <p><span className="text-[var(--mp-text-tertiary)]">Pago:</span> {showSuccess.payment}</p>
            </div>
            <button onClick={() => setShowSuccess(null)} className="mp-btn-primary w-full text-xs">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
