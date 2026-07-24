import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { SEO } from "@/components/SEO";
import { useCart } from "@/providers/CartProvider";
import { useToast } from "@/providers/ToastProvider";
import { api } from "@/api/client";

const shippingOptions = [
  { id: "estandar", label: "Envío estándar", desc: "2-3 días hábiles", price: 8000, icon: "🚚" },
  { id: "express", label: "Envío express", desc: "24 horas", price: 15000, icon: "⚡" },
  { id: "recoger", label: "Recoger en tienda", desc: "Sin costo", price: 0, icon: "📦" },
];

const paymentMethods = [
  { id: "mercadopago", label: "MercadoPago", desc: "Tarjeta crédito, débito o efectivo", icon: "https://www.mercadopago.com/favicon.ico" },
  { id: "transferencia", label: "Transferencia bancaria", desc: "Bancolombia, Nequi, Daviplata", icon: "🏦" },
  { id: "contraentrega", label: "Pago contraentrega", desc: "Pagas al recibir tu pedido", icon: "💵" },
];

export default function Checkout() {
  const { items, subtotal, shipping, total, discount, couponCode, setCouponCode, applyCoupon, clearCart } = useCart();
  const { addToast } = useToast();
  const [step, setStep] = useState(items.length === 0 ? 3 : 0);
  const [submitting, setSubmitting] = useState(false);
  const [shippingMethod, setShippingMethod] = useState("estandar");
  const [paymentMethod, setPaymentMethod] = useState("mercadopago");
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", direccion: "", ciudad: "", departamento: "" });

  const shippingCost = shippingMethod === "estandar" ? 8000 : shippingMethod === "express" ? 15000 : 0;
  const displayDiscount = discount;
  const grandTotal = subtotal + shippingCost - displayDiscount;

  const handleCoupon = async () => {
    setCouponCode(couponInput);
    const ok = await applyCoupon();
    setCouponMsg(ok ? "Cupón aplicado" : "Código inválido o expirado");
    setTimeout(() => setCouponMsg(""), 3000);
  };

  const createOrder = async () => {
    if (items.length === 0) return null;
    setSubmitting(true);
    try {
      const res = await api.post("/checkout", {
        customer_name: form.nombre || "Cliente",
        customer_email: form.email || "cliente@email.com",
        customer_phone: form.telefono || "",
        items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })),
        shipping_address: `${form.direccion}, ${form.ciudad}, ${form.departamento}`,
        shipping_method: shippingMethod,
        shipping_cost: shippingCost,
        payment_method: paymentMethod,
        subtotal: subtotal,
        discount: displayDiscount,
        total: grandTotal,
      });
      return res?.id || res?.data?.id;
    } catch {
      addToast("Error al crear la orden", "error");
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (step === 2) {
      if (paymentMethod === "mercadopago") {
        const orderId = await createOrder();
        if (orderId) {
          const mpRes = await api.post("/mercadopago/create-preference", {
            items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })),
            customer: { name: form.nombre, email: form.email },
            orderId, total: grandTotal,
          });
          if (mpRes?.initPoint) {
            clearCart();
            window.open(mpRes.initPoint, "_blank");
            setStep(3);
            addToast("Redirigiendo a MercadoPago...", "success");
          } else {
            addToast("Error al conectar con MercadoPago", "error");
          }
        }
        return;
      }
      const orderId = await createOrder();
      if (orderId) { clearCart(); setStep(3); addToast("Compra confirmada", "success"); }
      return;
    }
    setStep(s => s + 1);
  };

  if (items.length === 0 && step < 3) {
    return (
      <>
        <SEO title="Checkout" />
        <Navbar />
        <main className="bg-surface-primary min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <span className="text-5xl block mb-4">🛒</span>
            <h2 className="text-xl font-bold text-text-primary mb-2">Tu carrito está vacío</h2>
            <Link to="/tienda" className="text-interactive-accent hover:underline">Ir a la tienda</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO title="Checkout | MotoPro" />
      <Navbar />
      <main className="bg-surface-primary min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Stepper */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {[
              { id: 0, label: "Carrito" },
              { id: 1, label: "Envío" },
              { id: 2, label: "Pago" },
              { id: 3, label: "Confirmación" },
            ].map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 ${s.id <= step ? "text-interactive-accent" : "text-text-tertiary"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    s.id < step ? "bg-interactive-accent text-white" : s.id === step ? "border-2 border-interactive-accent text-interactive-accent" : "border-2 border-border text-text-tertiary"
                  }`}>
                    {s.id < step ? "✓" : s.id + 1}
                  </div>
                  <span className={`text-sm font-medium hidden md:inline ${s.id === step ? "text-text-primary" : ""}`}>{s.label}</span>
                </div>
                {i < 3 && <div className={`w-12 h-px ${s.id < step ? "bg-interactive-accent" : "bg-surface-tertiary"}`} />}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                {step === 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-text-primary mb-4">Carrito de compras</h2>
                    {items.map(item => (
                      <div key={item.id} className="flex items-center gap-4 bg-surface-secondary border border-border rounded-lg p-4">
                        <div className="w-20 h-20 rounded-lg bg-surface-tertiary flex items-center justify-center shrink-0 overflow-hidden">
                          {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-3xl opacity-40">🛵</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                          <p className="text-xs text-text-tertiary">Cant: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-interactive-accent">${(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-text-primary mb-4">Dirección de envío</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-text-secondary mb-1.5">Nombre completo</label>
                        <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                          className="w-full rounded-lg border border-border bg-surface-tertiary px-4 py-3 text-sm text-text-primary outline-none focus:border-border-accent transition-colors" placeholder="Juan Pérez" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-1.5">Email</label>
                        <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                          className="w-full rounded-lg border border-border bg-surface-tertiary px-4 py-3 text-sm text-text-primary outline-none focus:border-border-accent transition-colors" placeholder="correo@email.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-1.5">Teléfono</label>
                        <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })}
                          className="w-full rounded-lg border border-border bg-surface-tertiary px-4 py-3 text-sm text-text-primary outline-none focus:border-border-accent transition-colors" placeholder="+57 300 123 4567" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-text-secondary mb-1.5">Dirección</label>
                        <input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })}
                          className="w-full rounded-lg border border-border bg-surface-tertiary px-4 py-3 text-sm text-text-primary outline-none focus:border-border-accent transition-colors" placeholder="Calle 123 #45-67" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-1.5">Ciudad</label>
                        <input value={form.ciudad} onChange={e => setForm({ ...form, ciudad: e.target.value })}
                          className="w-full rounded-lg border border-border bg-surface-tertiary px-4 py-3 text-sm text-text-primary outline-none focus:border-border-accent transition-colors" placeholder="Medellín" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-1.5">Departamento</label>
                        <input value={form.departamento} onChange={e => setForm({ ...form, departamento: e.target.value })}
                          className="w-full rounded-lg border border-border bg-surface-tertiary px-4 py-3 text-sm text-text-primary outline-none focus:border-border-accent transition-colors" placeholder="Antioquia" />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-text-primary mt-6 mb-4">Método de envío</h3>
                    <div className="space-y-3">
                      {shippingOptions.map(opt => (
                        <button key={opt.id} onClick={() => setShippingMethod(opt.id)}
                          className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                            shippingMethod === opt.id ? "border-interactive-accent bg-interactive-accent/10" : "border-border bg-surface-secondary hover:border-border-accent"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{opt.icon}</span>
                            <div className="text-left">
                              <p className={`text-sm font-semibold ${shippingMethod === opt.id ? "text-text-primary" : "text-text-secondary"}`}>{opt.label}</p>
                              <p className="text-xs text-text-tertiary">{opt.desc}</p>
                            </div>
                          </div>
                          <span className={`text-sm font-bold ${shippingMethod === opt.id ? "text-interactive-accent" : "text-text-secondary"}`}>
                            {opt.price === 0 ? "Gratis" : `$${opt.price.toLocaleString()}`}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-text-primary mb-4">Método de pago</h2>
                    <div className="space-y-3">
                      {paymentMethods.map(m => (
                        <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${
                            paymentMethod === m.id ? "border-interactive-accent bg-interactive-accent/10" : "border-border bg-surface-secondary hover:border-border-accent"
                          }`}
                        >
                          <span className="text-2xl">{typeof m.icon === "string" && m.icon.startsWith("http") ? "" : m.icon}</span>
                          <div className="text-left flex-1">
                            <p className="text-sm font-semibold text-text-primary">{m.label}</p>
                            <p className="text-xs text-text-tertiary">{m.desc}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === m.id ? "border-interactive-accent" : "border-border-subtle"
                          }`}>
                            {paymentMethod === m.id && <div className="w-2.5 h-2.5 rounded-full bg-interactive-accent" />}
                          </div>
                        </button>
                      ))}
                    </div>

                    {paymentMethod === "transferencia" && (
                      <div className="bg-surface-secondary border border-border rounded-lg p-4 mt-4">
                        <p className="text-sm text-text-secondary mb-2">Realiza la transferencia a:</p>
                        <div className="space-y-1 text-sm text-text-primary">
                          <p>Banco: <span className="font-medium">Bancolombia</span></p>
                          <p>Cuenta: <span className="font-medium">000-123456-78</span></p>
                          <p>Titular: <span className="font-medium">MotoPro Taller</span></p>
                          <p>NIT: <span className="font-medium">901.123.456-7</span></p>
                        </div>
                        <p className="text-xs text-text-tertiary mt-2">Envía el comprobante a info@motopro.com</p>
                      </div>
                    )}

                    {paymentMethod === "contraentrega" && (
                      <div className="bg-surface-secondary border border-border rounded-lg p-4 mt-4">
                        <p className="text-sm text-text-secondary">Pagas en efectivo o tarjeta al momento de recibir tu pedido. Válido para entregas en Medellín y área metropolitana.</p>
                      </div>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="text-center py-12">
                    <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-interactive-accent/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">¡Compra confirmada!</h2>
                    <p className="text-text-secondary mb-6 max-w-md mx-auto">Te hemos enviado un resumen de tu orden a tu correo electrónico.</p>
                    <div className="flex items-center justify-center gap-4">
                      <Link to="/" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r bg-interactive-accent px-6 py-3 font-semibold text-white hover:bg-interactive-accent-hover transition-all">
                        Volver al inicio
                      </Link>
                      <Link to="/mi-cuenta" className="inline-flex items-center gap-2 rounded-lg border border-interactive-accent px-6 py-3 font-semibold text-interactive-accent hover:bg-interactive-accent/10 transition-all">
                        Ver mis pedidos
                      </Link>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar Summary */}
            {step < 3 && (
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                  <div className="bg-surface-secondary border border-border rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-text-primary mb-4">Resumen</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between text-text-secondary">
                        <span>Subtotal ({items.length} producto{items.length !== 1 ? "s" : ""})</span>
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
                          <span className="font-bold text-text-primary">Total</span>
                          <span className="text-xl font-bold text-interactive-accent">${grandTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Coupon */}
                    {step === 1 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <h4 className="text-xs font-semibold text-text-secondary uppercase mb-2">Cupón</h4>
                        <div className="flex gap-2">
                          <input value={couponInput} onChange={e => setCouponInput(e.target.value)}
                            placeholder="CÓDIGO"
                            className="flex-1 rounded-lg border border-border bg-surface-tertiary px-3 py-2 text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-accent uppercase"
                          />
                          <button onClick={handleCoupon}
                            className="rounded-lg bg-interactive-accent px-4 py-2 text-xs font-semibold text-white hover:bg-interactive-accent-hover transition-colors">
                            Aplicar
                          </button>
                        </div>
                        {couponMsg && <p className="text-xs text-interactive-accent mt-1">{couponMsg}</p>}
                      </div>
                    )}
                  </div>

                  {/* Trust */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: "🔒", title: "Pago seguro" },
                      { icon: "🛡️", title: "Garantía" },
                      { icon: "🚚", title: "Envío rápido" },
                      { icon: "🔄", title: "Devoluciones" },
                    ].map(b => (
                      <div key={b.title} className="bg-surface-secondary border border-border rounded-lg p-3 text-center">
                        <span className="text-lg">{b.icon}</span>
                        <p className="text-xs font-semibold text-text-primary mt-1">{b.title}</p>
                      </div>
                    ))}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    {step > 0 ? (
                      <button onClick={() => setStep(s => s - 1)} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                        ← Atrás
                      </button>
                    ) : (
                      <Link to="/tienda" className="text-sm text-interactive-accent hover:text-interactive-accent-hover">← Seguir comprando</Link>
                    )}
                    <button onClick={handleNext} disabled={submitting}
                      className="flex items-center gap-2 rounded-lg bg-gradient-to-r bg-interactive-accent px-6 py-3 text-sm font-bold text-white hover:bg-interactive-accent-hover transition-all shadow-elevation-2 disabled:opacity-50"
                    >
                      {submitting ? "Procesando..." : step === 2 ? `Pagar $${grandTotal.toLocaleString()}` : "Continuar"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <BackToTop />
      <WhatsAppFloat />
    </>
  );
}
