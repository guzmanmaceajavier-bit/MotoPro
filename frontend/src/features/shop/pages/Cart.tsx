import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SEO } from "@/components/SEO";
import { EmptyCart } from "../components/EmptyCart";
import { CartItemRow } from "../components/CartItemRow";
import { useCart } from "@/providers/CartProvider";
import { useConfig } from "@/providers/CMSProvider";
import { api } from "@/api/client";

interface SuggestedProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  slug: string;
}

const FALLBACK_SUGGESTED: SuggestedProduct[] = [
  { id: 101, name: "Kit de Arrastre DID VX3", description: "Reforzado", price: 280000, image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=200&fit=crop", slug: "kit-arrastre-did-vx3" },
  { id: 102, name: "Casco HJC RPHA 11", description: "Negro mate", price: 1250000, image: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=200&h=200&fit=crop", slug: "casco-hjc-rpha-11" },
  { id: 103, name: "Guantes Alpinestars SP-8", description: "Negro / Rojo", price: 320000, image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=200&h=200&fit=crop", slug: "guantes-alpinestars-sp-8" },
  { id: 104, name: "Escape Akrapovic GP", description: "Titanio", price: 2450000, image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=200&h=200&fit=crop", slug: "escape-akrapovic-gp" },
];

const DOT_INDICES = [0, 1, 2, 3, 4, 5, 6];

export default function Cart() {
  const {
    items, count, total, subtotal, shipping, setShipping, discount,
    couponCode, setCouponCode, applyCoupon, removeItem, decrementItem, updateQuantity, clearCart,
  } = useCart();
  const { addItem   } = useCart();
  const config = useConfig();
  const [suggested, setSuggested] = useState<SuggestedProduct[]>([]);
  const [deliveryMode, setDeliveryMode] = useState<"envio" | "recoger" | "rastrear">("envio");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [department, setDepartment] = useState("");
  const [shippingMethod, setShippingMethod] = useState<"estandar" | "express">("estandar");
  const [pickupStore, setPickupStore] = useState("principal");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupPhone, setPickupPhone] = useState("");

  useEffect(() => {
    api.get("/products?all=1&limit=8")
      .then((data) => {
        const arr = Array.isArray(data) ? data : data?.data || [];
        setSuggested(arr.slice(0, 8).map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description?.substring(0, 40) || "",
          price: p.price,
          image: p.image || "",
          slug: p.slug || `producto-${p.id}`,
        })));
      })
      .catch((err) => console.warn("[fetch]", err));
  }, []);

  const handleCoupon = async () => {
    setCouponCode(couponInput);
    const ok = await applyCoupon();
    setCouponMsg(ok ? "Cupón aplicado" : "Código inválido o expirado");
    setTimeout(() => setCouponMsg(""), 3000);
  };

  const shippingCost = deliveryMode === "envio" 
    ? (shippingMethod === "express" ? 15000 : (subtotal >= 300000 ? 0 : 8000)) 
    : 0;
  const displayDiscount = discount;
  const grandTotal = subtotal + shippingCost - displayDiscount;

  const suggestedProducts: SuggestedProduct[] = suggested.length > 0 ? suggested : FALLBACK_SUGGESTED;

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <>
      <SEO title="Carrito de compras" />
      <main className="pt-20 min-h-screen bg-surface-primary">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-6 lg:py-8">
          {/* Title */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-interactive-accent/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Carrito de compras</h1>
                <p className="text-sm text-text-secondary mt-0.5">{count} producto{count !== 1 ? "s" : ""} en tu carrito</p>
              </div>
            </div>
            <button onClick={clearCart}
              className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Vaciar carrito
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Cart Items + Suggested */}
            <div className="flex-1 min-w-0">
              {/* Cart Items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onRemove={removeItem}
                    onDecrement={decrementItem}
                    onUpdateQuantity={updateQuantity}
                  />
                ))}
              </div>

              {/* Security Banner */}
              <div className="mt-6 flex items-center gap-3 p-4 rounded-xl border border-border bg-surface-secondary">
                <div className="w-10 h-10 rounded-lg bg-interactive-accent/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-text-primary">Compra 100% segura y protegida</p>
              </div>

              {/* Suggested Products */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                    <h3 className="text-lg font-bold text-text-primary">También te puede interesar</h3>
                  </div>
                  <Link to="/tienda" className="text-sm text-interactive-accent hover:text-interactive-accent-hover transition-colors">
                    Ver todos
                  </Link>
                </div>

                {/* Carousel */}
                <div className="relative">
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {suggestedProducts.map((product) => (
                      <Link
                        key={product.id}
                        to={`/tienda/${product.slug}`}
                        className="group flex-shrink-0 w-[180px] bg-surface-secondary border border-border rounded-xl overflow-hidden hover:border-border-accent transition-all duration-300"
                      >
                        <div className="aspect-square bg-surface-tertiary p-3 flex items-center justify-center">
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-3">
                          <h4 className="text-sm font-semibold text-text-primary line-clamp-1">{product.name}</h4>
                          <p className="text-xs text-text-tertiary mt-0.5">{product.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-bold text-interactive-accent">${product.price.toLocaleString()}</span>
                            <button aria-label="Agregar producto"
                              onClick={(e) => {
                                e.preventDefault();
                                addItem({
                                  id: product.id,
                                  name: product.name,
                                  price: product.price,
                                  image: product.image,
                                  quantity: 1,
                                });
                              }}
                              className="w-8 h-8 rounded-lg bg-interactive-accent flex items-center justify-center text-black hover:bg-interactive-accent-hover transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {/* Dots */}
                  <div className="flex justify-center gap-2 mt-4">
                    {DOT_INDICES.map((i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? "bg-interactive-accent" : "bg-text-tertiary/30"}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Summary Sidebar */}
            <div className="w-full lg:w-[380px] shrink-0">
              <div className="sticky top-24 space-y-4">
                {/* Resumen del pedido */}
                <div className="rounded-xl border border-border bg-surface-secondary p-5">
                  <div className="flex items-center gap-2 mb-5">
                    <svg className="w-5 h-5 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                    <h2 className="text-base font-bold text-text-primary">Resumen del pedido</h2>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-text-secondary">
                      <span>Subtotal ({count} producto{count !== 1 ? "s" : ""})</span>
                      <span className="text-text-primary font-medium">${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-text-secondary">
                      <span>Envío</span>
                      <span className={shippingCost === 0 ? "text-interactive-accent" : "text-text-primary"}>
                        {shippingCost === 0 ? "Gratis" : `$${shippingCost.toLocaleString()}`}
                      </span>
                    </div>
                    {displayDiscount > 0 && (
                      <div className="flex justify-between text-interactive-accent">
                        <span>Descuento</span>
                        <span>-${displayDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-border">
                      <div className="flex justify-between items-baseline">
                        <span className="text-base font-bold text-text-primary">Total</span>
                        <span className="text-2xl font-bold text-interactive-accent">
                          ${grandTotal.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-tertiary mt-0.5 text-right">IVA incluido</p>
                    </div>
                  </div>

                  {/* Delivery Options */}
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setDeliveryMode("envio")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 ${
                        deliveryMode === "envio"
                          ? "border-interactive-accent bg-interactive-accent/10"
                          : "border-border bg-surface-tertiary hover:border-border-accent"
                      }`}
                    >
                      <svg className={`w-6 h-6 ${deliveryMode === "envio" ? "text-interactive-accent" : "text-text-secondary"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                      </svg>
                      <span className={`text-sm font-semibold ${deliveryMode === "envio" ? "text-text-primary" : "text-text-secondary"}`}>Envío</span>
                      <span className="text-[10px] text-text-tertiary">Recibir en casa</span>
                    </button>
                    <button
                      onClick={() => setDeliveryMode("recoger")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 ${
                        deliveryMode === "recoger"
                          ? "border-interactive-accent bg-interactive-accent/10"
                          : "border-border bg-surface-tertiary hover:border-border-accent"
                      }`}
                    >
                      <svg className={`w-6 h-6 ${deliveryMode === "recoger" ? "text-interactive-accent" : "text-text-secondary"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                      </svg>
                      <span className={`text-sm font-semibold ${deliveryMode === "recoger" ? "text-text-primary" : "text-text-secondary"}`}>Recoger</span>
                      <span className="text-[10px] text-text-tertiary">En tienda</span>
                    </button>
                    <button
                      onClick={() => setDeliveryMode("rastrear")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 ${
                        deliveryMode === "rastrear"
                          ? "border-interactive-accent bg-interactive-accent/10"
                          : "border-border bg-surface-tertiary hover:border-border-accent"
                      }`}
                    >
                      <svg className={`w-6 h-6 ${deliveryMode === "rastrear" ? "text-interactive-accent" : "text-text-secondary"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span className={`text-sm font-semibold ${deliveryMode === "rastrear" ? "text-text-primary" : "text-text-secondary"}`}>Rastrear</span>
                      <span className="text-[10px] text-text-tertiary">Mi pedido</span>
                    </button>
                  </div>

                  {/* Shipping Form */}
                  {deliveryMode === "envio" && (
                    <div className="mt-4 space-y-3 pt-4 border-t border-border">
                      <div>
                        <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Dirección de envío *</label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Calle, número, colonia"
                          className="w-full rounded-lg border border-border bg-surface-tertiary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-accent transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Ciudad *</label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Ciudad"
                            className="w-full rounded-lg border border-border bg-surface-tertiary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-accent transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Departamento *</label>
                          <input
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="Departamento"
                            className="w-full rounded-lg border border-border bg-surface-tertiary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-accent transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-text-secondary mb-2 block">Método de envío</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setShippingMethod("estandar")}
                            className={`p-3 rounded-lg border text-left transition-all ${
                              shippingMethod === "estandar"
                                ? "border-interactive-accent bg-interactive-accent/10"
                                : "border-border bg-surface-tertiary hover:border-border-accent"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-text-primary">Estándar</span>
                              <span className="text-xs font-bold text-interactive-accent">
                                {subtotal >= 300000 ? "Gratis" : "$8.000"}
                              </span>
                            </div>
                            <p className="text-[10px] text-text-tertiary mt-0.5">2-3 días hábiles</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => setShippingMethod("express")}
                            className={`p-3 rounded-lg border text-left transition-all ${
                              shippingMethod === "express"
                                ? "border-interactive-accent bg-interactive-accent/10"
                                : "border-border bg-surface-tertiary hover:border-border-accent"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-text-primary">Express</span>
                              <span className="text-xs font-bold text-interactive-accent">$15.000</span>
                            </div>
                            <p className="text-[10px] text-text-tertiary mt-0.5">24 horas</p>
                          </button>
                        </div>
                      </div>
                      {subtotal >= 300000 && shippingMethod === "estandar" && (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-status-success/10 border border-status-success/20">
                          <svg className="w-4 h-4 text-status-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs font-medium text-status-success">¡Envío gratis por compra mayor a $300.000!</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pickup Form */}
                  {deliveryMode === "recoger" && (
                    <div className="mt-4 space-y-3 pt-4 border-t border-border">
                      <div>
                        <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Tienda para recoger *</label>
                        <select
                          value={pickupStore}
                          onChange={(e) => setPickupStore(e.target.value)}
                          className="w-full rounded-lg border border-border bg-surface-tertiary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-border-accent transition-colors"
                        >
                          <option value="principal">MotoPro - Sucursal Principal</option>
                          <option value="norte">MotoPro - Sucursal Norte</option>
                          <option value="sur">MotoPro - Sucursal Sur</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Fecha de recogida *</label>
                        <input
                          type="date"
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full rounded-lg border border-border bg-surface-tertiary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-border-accent transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Teléfono de contacto *</label>
                        <input
                          type="tel"
                          value={pickupPhone}
                          onChange={(e) => setPickupPhone(e.target.value)}
                          placeholder="Tu teléfono"
                          className="w-full rounded-lg border border-border bg-surface-tertiary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-accent transition-colors"
                        />
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-interactive-accent/10 border border-interactive-accent/20">
                        <svg className="w-4 h-4 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                        <span className="text-xs text-text-secondary">Recoger en tienda es <span className="font-semibold text-interactive-accent">sin costo</span></span>
                      </div>
                    </div>
                  )}

                  {/* Tracking Form */}
                  {deliveryMode === "rastrear" && (
                    <div className="mt-4 space-y-4 pt-4 border-t border-border">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-primary mb-1.5 block">Número de guía *</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Ej: MP-123456789-CO"
                            className="flex-1 rounded-lg border border-border bg-surface-tertiary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-accent transition-colors"
                          />
                          <button className="rounded-lg bg-interactive-accent px-4 py-2.5 text-sm font-semibold text-black hover:bg-interactive-accent-hover transition-colors whitespace-nowrap">
                            Rastrear
                          </button>
                        </div>
                      </div>
                      
                      {/* Tracking Info */}
                      <div className="p-4 rounded-xl bg-surface-tertiary border border-border">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-interactive-accent/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-text-primary">Tiempo de entrega estimado</h4>
                            <p className="text-xs text-text-secondary">Según tu ubicación</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-surface-secondary border border-border">
                            <p className="text-xs font-bold text-text-primary">Estándar</p>
                            <p className="text-lg font-bold text-interactive-accent">2-3 días</p>
                            <p className="text-[10px] text-text-tertiary">hábiles</p>
                          </div>
                          <div className="p-3 rounded-lg bg-surface-secondary border border-border">
                            <p className="text-xs font-bold text-text-primary">Express</p>
                            <p className="text-lg font-bold text-interactive-accent">24 horas</p>
                            <p className="text-[10px] text-text-tertiary">días hábiles</p>
                          </div>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="p-4 rounded-xl bg-surface-tertiary border border-border">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-interactive-accent/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-text-primary">¿Necesitas ayuda?</h4>
                            <p className="text-xs text-text-secondary">Contactar por WhatsApp</p>
                          </div>
                        </div>
                        <a
                          href={`https://wa.me/${config.social_whatsapp || "573001234567"}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-interactive-accent/10 border border-interactive-accent/30 text-sm font-semibold text-interactive-accent hover:bg-interactive-accent/20 transition-all"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          Contactar por WhatsApp
                        </a>
                      </div>

                      {/* PQRS */}
                      <div className="p-4 rounded-xl bg-surface-tertiary border border-border">
                        <h4 className="text-sm font-bold text-text-primary mb-2">PQRS (Peticiones, Quejas, Reclamos, Sugerencias)</h4>
                        <p className="text-xs text-text-secondary mb-3">Si tienes algún inconveniente con tu pedido, contáctanos directamente.</p>
                        <a
                          href={`mailto:${config.site_email || "servicio@motopro.com"}`}
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-border bg-surface-secondary text-sm font-semibold text-text-primary hover:border-border-accent transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                          </svg>
                          Enviar PQRS
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cupón */}
                <div className="rounded-xl border border-border bg-surface-secondary p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                    <h3 className="text-sm font-semibold text-text-primary">Cupón de descuento</h3>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Ingresa tu cupón"
                      className="flex-1 rounded-lg border border-border bg-surface-tertiary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-accent transition-colors"
                    />
                    <button onClick={handleCoupon}
                      className="rounded-lg bg-interactive-accent px-5 py-2.5 text-sm font-semibold text-black hover:bg-interactive-accent-hover transition-colors"
                    >
                      Aplicar
                    </button>
                  </div>
                  {couponMsg && <p className="text-xs text-interactive-accent mt-2">{couponMsg}</p>}
                </div>

                {/* Checkout Button */}
                <Link to="/checkout"
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-interactive-accent py-3.5 font-bold text-black hover:bg-interactive-accent-hover transition-all duration-300 shadow-elevation-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Proceder al pago
                </Link>
                <p className="text-center text-xs text-text-tertiary">Paga de forma segura con Mercado Pago</p>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-secondary border border-border">
                    <svg className="w-5 h-5 text-interactive-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-text-primary">Pago seguro</p>
                      <p className="text-[10px] text-text-tertiary">Tus pagos protegidos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-secondary border border-border">
                    <svg className="w-5 h-5 text-interactive-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-text-primary">Garantía</p>
                      <p className="text-[10px] text-text-tertiary">Productos originales</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-secondary border border-border">
                    <svg className="w-5 h-5 text-interactive-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-text-primary">Envío rápido</p>
                      <p className="text-[10px] text-text-tertiary">2-3 días hábiles</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-secondary border border-border">
                    <svg className="w-5 h-5 text-interactive-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-text-primary">Devoluciones</p>
                      <p className="text-[10px] text-text-tertiary">Hasta 7 días</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
