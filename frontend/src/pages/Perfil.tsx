import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { AuthModal } from "@/components/layout/AuthModal";
import { Modal } from "@/components/Modal";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { api } from "@/api/client";

const formatDate = (d: string) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400",
  processing: "bg-blue-500/10 text-blue-400",
  completed: "bg-green-500/10 text-green-400",
  cancelled: "bg-red-500/10 text-red-400",
};

function Tabs({ tabs, active, onChange }: { tabs: { key: string; label: string; count?: number }[]; active: string; onChange: (key: string) => void }) {
  return (
    <div className="flex gap-1 border-b border-border-subtle overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-[1px] ${
            active === tab.key
              ? "border-interactive-accent text-interactive-accent"
              : "border-transparent text-text-tertiary hover:text-text-secondary hover:border-gray-500/30"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              active === tab.key ? "bg-interactive-accent/15 text-interactive-accent" : "bg-surface-tertiary/50 text-text-tertiary"
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export default function Perfil() {
  const { user, logout, updateProfile, loading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", nit: "" });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [authOpen, setAuthOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({ name: "", address: "", city: "", state: "", zip: "", phone: "", is_default: false });
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const orderIdParam = searchParams.get("order");
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("actividades");
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [warranties, setWarranties] = useState<any[]>([]);
  const [warrantiesLoading, setWarrantiesLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || "", phone: user.phone || "", address: user.address || "", nit: user.nit || "" });
      setOrdersLoading(true);
      api.get("/customer-auth/orders").then((res) => {
        setOrders(res?.data || []);
      }).catch(() => {}).finally(() => setOrdersLoading(false));
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      api.get("/customer-auth/addresses").then(setAddresses).catch(() => {});
      api.get("/customer-auth/wishlist").then(setWishlist).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setVehiclesLoading(true);
    api.get("/customer-auth/me").then((profile: any) => {
      if (profile?.vehicles) setVehicles(profile.vehicles);
    }).catch(() => {}).finally(() => setVehiclesLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setInvoicesLoading(true);
    api.get("/customer-auth/orders").then((data) => {
      setInvoices(Array.isArray(data) ? data : []);
    }).catch(() => setInvoices([])).finally(() => setInvoicesLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setWarrantiesLoading(true);
    api.get("/customer-auth/orders").then((data) => {
      setWarranties(Array.isArray(data) ? data : []);
    }).catch(() => setWarranties([])).finally(() => setWarrantiesLoading(false));
  }, [user]);

  const saveAddress = async () => {
    try {
      if (editingAddress) { await api.put("/customer-auth/addresses/" + editingAddress, addressForm); addToast("Dirección actualizada", "success"); }
      else { await api.post("/customer-auth/addresses", addressForm); addToast("Dirección guardada", "success"); }
      setShowAddressForm(false); setEditingAddress(null); setAddressForm({ name: "", address: "", city: "", state: "", zip: "", phone: "", is_default: false });
      api.get("/customer-auth/addresses").then(setAddresses).catch(() => {});
    } catch { addToast("Error al guardar", "error"); }
  };

  const deleteAddress = async (id: string) => {
    if (!confirm("¿Eliminar dirección?")) return;
    try { await api.delete("/customer-auth/addresses/" + id); addToast("Eliminada", "success"); api.get("/customer-auth/addresses").then(setAddresses).catch(() => {}); } catch { addToast("Error", "error"); }
  };

  const removeWishlist = async (productId: string) => {
    try { await api.delete("/customer-auth/wishlist/" + productId); setWishlist(p => p.filter((w: any) => w.product_id !== productId)); addToast("Eliminado de favoritos", "success"); } catch { addToast("Error", "error"); }
  };

  useEffect(() => {
    if (orderIdParam && user) {
      setDetailLoading(true);
      api.get(`/customer-auth/orders/${orderIdParam}`).then((data) => {
        setOrderDetail(data || null);
      }).catch(() => {
        setOrderDetail(null);
      }).finally(() => setDetailLoading(false));
    } else {
      setOrderDetail(null);
    }
  }, [orderIdParam, user]);

  const handleSave = async () => {
    try {
      await updateProfile(form);
      setEditing(false);
      addToast("Perfil actualizado", "success");
    } catch {
      addToast("Error al actualizar", "error");
    }
  };

  if (loading) {
    return (
      <>
        <SEO title="Mi cuenta" />
        <Navbar />
        <main className="pt-20 min-h-screen bg-surface-primary flex items-center justify-center">
          <p className="text-text-secondary">Cargando...</p>
        </main>
        <Footer /><BackToTop /><WhatsAppFloat />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <SEO title="Mi cuenta" />
        <Navbar />
        <main className="pt-20 min-h-screen bg-surface-primary flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
            <div className="mx-auto mb-6 w-20 h-20 rounded-3xl bg-gradient-to-br from-interactive-accent/20 to-blue-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h1 className="text-2xl font-heading font-bold text-text-primary">Inicia sesión</h1>
            <p className="mt-2 text-text-secondary text-sm">Accede a tu cuenta para ver tus pedidos y datos.</p>
            <button onClick={() => setAuthOpen(true)}
              className="inline-flex items-center gap-2 mt-6 rounded-lg bg-gradient-to-r from-interactive-accent-hover to-interactive-accent px-7 py-3 font-semibold text-white shadow-lg shadow-interactive-accent/25 hover:shadow-interactive-accent/50 transition-all"
            >
              Iniciar sesión
            </button>
            <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
          </motion.div>
        </main>
        <Footer /><BackToTop /><WhatsAppFloat />
      </>
    );
  }

  return (
    <>
      <SEO title="Mi cuenta" />
      <Navbar />
      <main className="pt-20 min-h-screen bg-surface-primary">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="flex items-center gap-2 text-xs text-text-tertiary mb-6">
            <Link to="/" className="hover:text-interactive-accent transition-colors">Inicio</Link>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-text-primary">Mi cuenta</span>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-2xl border border-border bg-surface-secondary p-6 md:p-8 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-interactive-accent/20 to-blue-500/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-interactive-accent">{user.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-heading font-bold text-text-primary">{user.name}</h1>
                  <p className="text-sm text-text-secondary">{user.email}</p>
                  {(user as any).email_verified === 0 && (
                    <p className="text-[10px] text-amber-400 mt-1 cursor-pointer hover:text-amber-300" onClick={async () => {
                      try { await api.post("/customer-auth/resend-verification"); addToast("Correo de verificación enviado", "success"); } catch { addToast("Error al enviar", "error"); }
                    }}>⚡ Email no verificado — Haz clic para reenviar</p>
                  )}
                </div>
                {!editing && (
                  <button onClick={() => setEditing(true)}
                    className="p-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-tertiary/50 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                )}
              </div>

              {editing ? (
                <div className="space-y-3">
                  <input type="text" placeholder="Nombre" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-border bg-surface-tertiary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-interactive-accent/50"
                  />
                  <input type="tel" placeholder="Teléfono" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-lg border border-border bg-surface-tertiary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-interactive-accent/50"
                  />
                  <input type="text" placeholder="Dirección" value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full rounded-lg border border-border bg-surface-tertiary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-interactive-accent/50"
                  />
                  <input type="text" placeholder="NIT / Cédula" value={form.nit}
                    onChange={(e) => setForm({ ...form, nit: e.target.value })}
                    className="w-full rounded-lg border border-border bg-surface-tertiary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-interactive-accent/50"
                  />
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleSave}
                      className="flex-1 rounded-lg bg-gradient-to-r from-interactive-accent-hover to-interactive-accent py-3 font-semibold text-white shadow-lg shadow-interactive-accent/25 hover:shadow-interactive-accent/50 transition-all"
                    >
                      Guardar cambios
                    </button>
                    <button onClick={() => { setEditing(false); setForm({ name: user.name, phone: user.phone || "", address: user.address || "", nit: user.nit || "" }); }}
                      className="flex-1 rounded-lg border border-border bg-surface-tertiary/50 py-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Teléfono", value: user.phone || "—" },
                    { label: "Dirección", value: user.address || "—" },
                    { label: "NIT / Cédula", value: user.nit || "—" },
                    { label: "Pedidos", value: user.total_orders ?? orders.length },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-border bg-surface-tertiary/30 p-4">
                      <p className="text-[10px] text-text-tertiary uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm text-text-primary mt-1">{String(item.value)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-surface-secondary p-6 md:p-8 mb-6">
              <h2 className="text-lg font-heading font-bold text-text-primary mb-4">Seguridad</h2>
              {showPasswordForm ? (
                <div className="space-y-3">
                  <input type="password" placeholder="Contraseña actual" value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="w-full rounded-lg border border-border bg-surface-tertiary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-interactive-accent/50" />
                  <input type="password" placeholder="Nueva contraseña" value={passwordForm.newPass}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                    className="w-full rounded-lg border border-border bg-surface-tertiary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-interactive-accent/50" />
                  <input type="password" placeholder="Confirmar nueva contraseña" value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    className="w-full rounded-lg border border-border bg-surface-tertiary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-interactive-accent/50" />
                  <div className="flex gap-3 pt-2">
                    <button onClick={async () => {
                      if (!passwordForm.current || !passwordForm.newPass) { addToast("Completa todos los campos", "error"); return; }
                      if (passwordForm.newPass.length < 6) { addToast("Mínimo 6 caracteres", "error"); return; }
                      if (passwordForm.newPass !== passwordForm.confirm) { addToast("Las contraseñas no coinciden", "error"); return; }
                      try {
                        await api.put("/customer-auth/profile", { currentPassword: passwordForm.current, newPassword: passwordForm.newPass });
                        addToast("Contraseña actualizada", "success");
                        setShowPasswordForm(false);
                        setPasswordForm({ current: "", newPass: "", confirm: "" });
                      } catch { addToast("Error al cambiar contraseña", "error"); }
                    }}
                      className="flex-1 rounded-lg bg-gradient-to-r from-interactive-accent-hover to-interactive-accent py-3 font-semibold text-white shadow-lg shadow-interactive-accent/25 hover:shadow-interactive-accent/50 transition-all">
                      Cambiar contraseña
                    </button>
                    <button onClick={() => { setShowPasswordForm(false); setPasswordForm({ current: "", newPass: "", confirm: "" }); }}
                      className="flex-1 rounded-lg border border-border bg-surface-tertiary/50 py-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-all">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowPasswordForm(true)}
                  className="rounded-lg border border-border bg-surface-tertiary/50 px-5 py-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-all">
                  Cambiar contraseña
                </button>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-surface-secondary p-6 md:p-8 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading font-bold text-text-primary">Mis direcciones</h2>
                <button onClick={() => { setEditingAddress(null); setAddressForm({ name: "", address: "", city: "", state: "", zip: "", phone: "", is_default: false }); setShowAddressForm(true); }}
                  className="text-xs font-medium text-interactive-accent hover:text-interactive-accent-hover">+ Agregar</button>
              </div>
              {addresses.length === 0 ? (
                <p className="text-text-secondary text-sm">No tienes direcciones guardadas.</p>
              ) : (
                <div className="space-y-2">
                  {addresses.map((addr: any) => (
                    <div key={addr.id} className="flex items-start justify-between rounded-lg border border-border bg-surface-tertiary/30 p-3">
                      <div>
                        <p className="text-sm text-text-primary font-medium">{addr.name} {addr.is_default ? <span className="text-[10px] text-interactive-accent">(Predeterminada)</span> : ""}</p>
                        <p className="text-xs text-text-secondary">{addr.address}, {addr.city} {addr.state}, {addr.zip}</p>
                        {addr.phone && <p className="text-[10px] text-text-tertiary">{addr.phone}</p>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingAddress(addr.id); setAddressForm(addr); setShowAddressForm(true); }} className="text-[10px] text-text-tertiary hover:text-text-primary">Editar</button>
                        <button onClick={() => deleteAddress(addr.id)} className="text-[10px] text-red-400 hover:text-red-300">Eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {showAddressForm && (
              <div className="rounded-2xl border border-border bg-surface-secondary p-6 md:p-8 mb-6">
                <h3 className="text-sm font-heading font-bold text-text-primary mb-4">{editingAddress ? "Editar" : "Nueva"} dirección</h3>
                <div className="space-y-3">
                  <input className="w-full rounded-lg border border-border bg-surface-tertiary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-interactive-accent/50" placeholder="Nombre de la dirección (Ej: Casa, Trabajo)" value={addressForm.name} onChange={(e) => setAddressForm({...addressForm, name: e.target.value})} />
                  <input className="w-full rounded-lg border border-border bg-surface-tertiary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-interactive-accent/50" placeholder="Dirección" value={addressForm.address} onChange={(e) => setAddressForm({...addressForm, address: e.target.value})} />
                  <div className="grid grid-cols-3 gap-3">
                    <input className="rounded-lg border border-border bg-surface-tertiary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-interactive-accent/50" placeholder="Ciudad" value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} />
                    <input className="rounded-lg border border-border bg-surface-tertiary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-interactive-accent/50" placeholder="Estado" value={addressForm.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} />
                    <input className="rounded-lg border border-border bg-surface-tertiary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-interactive-accent/50" placeholder="CP" value={addressForm.zip} onChange={(e) => setAddressForm({...addressForm, zip: e.target.value})} />
                  </div>
                  <input className="w-full rounded-lg border border-border bg-surface-tertiary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-interactive-accent/50" placeholder="Teléfono" value={addressForm.phone} onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})} />
                  <label className="flex items-center gap-2 text-sm text-text-secondary"><input type="checkbox" checked={addressForm.is_default} onChange={(e) => setAddressForm({...addressForm, is_default: e.target.checked})} className="rounded border-border-subtle" /> Dirección predeterminada</label>
                  <div className="flex gap-2">
                    <button onClick={saveAddress} className="flex-1 rounded-lg bg-gradient-to-r from-interactive-accent-hover to-interactive-accent py-3 text-sm font-semibold text-white">Guardar</button>
                    <button onClick={() => setShowAddressForm(false)} className="rounded-lg border border-border bg-surface-tertiary/50 px-5 py-3 text-sm text-text-secondary">Cancelar</button>
                  </div>
                </div>
              </div>
            )}

            {wishlist.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface-secondary p-6 md:p-8 mb-6">
                <h2 className="text-lg font-heading font-bold text-text-primary mb-4">Favoritos ({wishlist.length})</h2>
                <div className="space-y-2">
                  {wishlist.map((w: any) => (
                    <div key={w.wish_id} className="flex items-center justify-between rounded-lg border border-border bg-surface-tertiary/30 p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-tertiary/50 flex items-center justify-center text-lg">🔧</div>
                        <div>
                          <Link to={`/tienda/${w.product_id}`} className="text-sm text-text-primary font-medium hover:text-interactive-accent">{w.name}</Link>
                          <p className="text-xs text-text-tertiary">${(w.price || 0).toLocaleString()}</p>
                        </div>
                      </div>
                      <button onClick={() => removeWishlist(w.product_id)} className="text-[10px] text-red-400 hover:text-red-300">Eliminar</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs Section */}
            <div className="rounded-2xl border border-border bg-surface-secondary overflow-hidden">
              <Tabs
                tabs={[
                  { key: "actividades", label: "Mis actividades", count: orders.length },
                  { key: "vehiculos", label: "Mis Vehículos", count: vehicles.length },
                  { key: "facturas", label: "Mis Facturas", count: invoices.length },
                  { key: "garantias", label: "Mis Garantías", count: warranties.length },
                ]}
                active={activeTab}
                onChange={setActiveTab}
              />

              <div className="p-6 md:p-8">
                {/* Mis actividades */}
                {activeTab === "actividades" && (
                  <>
                    {ordersLoading ? (
                      <p className="text-text-secondary text-sm">Cargando...</p>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-text-secondary text-sm">No tienes pedidos ni servicios aún.</p>
                        <Link to="/tienda"
                          className="inline-block mt-3 text-sm font-medium text-interactive-accent hover:text-interactive-accent-hover transition-colors"
                        >Ir a la tienda</Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((item: any) => {
                          const isService = item.type === "service";
                          return (
                            <div key={item.id} className="rounded-lg border border-border bg-surface-tertiary/30 p-4 flex items-center justify-between cursor-pointer hover:bg-surface-tertiary/50 transition-all"
                              onClick={() => isService ? navigate(`/estado-servicio?q=${item.id}`) : navigate(`/perfil?order=${item.id}`)}>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs">{isService ? "🔧" : "🛒"}</span>
                                  <p className="text-xs text-text-tertiary">#{item.id.slice(0, 8)}</p>
                                  {isService && <span className="text-[9px] text-interactive-accent font-medium">Servicio</span>}
                                  {!isService && <span className="text-[9px] text-emerald-400 font-medium">Tienda</span>}
                                </div>
                                {isService ? (
                                  <p className="text-sm text-text-primary font-medium">{item.service_type || item.name || "Servicio de taller"}</p>
                                ) : (
                                  <p className="text-sm text-text-primary font-medium">${(item.total || 0).toLocaleString()}</p>
                                )}
                                <p className="text-[10px] text-text-tertiary">{formatDate(item.created_at)}</p>
                              </div>
                              <div className="text-right space-y-1">
                                <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full ${statusColors[item.status] || "bg-surface-tertiary/50 text-text-secondary"}`}>
                                  {item.status === "pending" ? "Pendiente" : item.status === "processing" ? "Procesando" : item.status === "completed" || item.status === "delivered" ? "Completado" : item.status === "cancelled" ? "Cancelado" : item.status === "paid" ? "Pagado" : item.status === "shipped" ? "Enviado" : item.status}
                                </span>
                                {!isService && <p className="text-[10px] text-text-tertiary">{item.payment_method}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                {/* Mis Vehículos */}
                {activeTab === "vehiculos" && (
                  <>
                    {vehiclesLoading ? (
                      <p className="text-text-secondary text-sm">Cargando...</p>
                    ) : vehicles.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="mx-auto mb-3 w-12 h-12 rounded-lg bg-surface-tertiary/50 flex items-center justify-center">
                          <svg className="w-6 h-6 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        </div>
                        <p className="text-text-secondary text-sm">No tienes vehículos registrados.</p>
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {vehicles.map((v: any, idx: number) => (
                          <motion.div
                            key={v.id || idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="rounded-lg border border-border bg-surface-tertiary/30 p-4"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-interactive-accent/20 to-blue-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-text-primary">{v.brand} {v.model}</p>
                                {v.year && <p className="text-[10px] text-text-tertiary">{v.year}</p>}
                              </div>
                              {v.plate && (
                                <span className="ml-auto text-[10px] font-mono font-bold px-2 py-1 rounded bg-surface-tertiary/50 text-interactive-accent border border-interactive-accent/20 uppercase tracking-wider">
                                  {v.plate}
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {v.mileage && (
                                <div>
                                  <span className="text-text-tertiary">Kilometraje</span>
                                  <p className="text-text-secondary font-medium">{v.mileage.toLocaleString()} km</p>
                                </div>
                              )}
                              {v.color && (
                                <div>
                                  <span className="text-text-tertiary">Color</span>
                                  <p className="text-text-secondary font-medium capitalize">{v.color}</p>
                                </div>
                              )}
                            </div>
                            {v.vin && <p className="text-[10px] text-text-tertiary mt-2">VIN: {v.vin}</p>}
                            {v.services && v.services.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-border-subtle">
                                <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2">Historial de servicios</p>
                                <div className="space-y-1">
                                  {v.services.map((svc: any, si: number) => (
                                    <div key={si} className="flex items-center justify-between text-[10px]">
                                      <span className="text-text-secondary">{svc.service_type || svc.description || "Servicio"}</span>
                                      <span className="text-text-tertiary">{svc.date ? formatDate(svc.date) : ""}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Mis Facturas */}
                {activeTab === "facturas" && (
                  <>
                    {invoicesLoading ? (
                      <p className="text-text-secondary text-sm">Cargando...</p>
                    ) : invoices.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="mx-auto mb-3 w-12 h-12 rounded-lg bg-surface-tertiary/50 flex items-center justify-center">
                          <svg className="w-6 h-6 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                          </svg>
                        </div>
                        <p className="text-text-secondary text-sm">No tienes facturas disponibles.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {invoices.map((inv: any) => {
                          const isExpanded = expandedInvoice === inv.id;
                          return (
                            <motion.div
                              key={inv.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="rounded-lg border border-border overflow-hidden"
                            >
                              <button
                                onClick={() => setExpandedInvoice(isExpanded ? null : inv.id)}
                                className="w-full flex items-center justify-between p-4 bg-surface-tertiary/30 hover:bg-surface-tertiary/50 transition-all text-left"
                              >
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-text-primary">{inv.invoice_number || `#${inv.id?.slice(0, 8)}`}</p>
                                  <p className="text-[10px] text-text-tertiary">{inv.date ? formatDate(inv.date) : formatDate(inv.created_at)}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-semibold text-text-primary">${(inv.total || 0).toLocaleString()}</span>
                                  <span className={`inline-block text-[10px] font-semibold px-2 py-1 rounded-full ${
                                    inv.status === "paid" ? "bg-green-500/10 text-green-400" :
                                    inv.status === "pending" ? "bg-amber-500/10 text-amber-400" :
                                    inv.status === "cancelled" ? "bg-red-500/10 text-red-400" :
                                    "bg-surface-tertiary/50 text-text-secondary"
                                  }`}>
                                    {inv.status === "paid" ? "Pagada" : inv.status === "pending" ? "Pendiente" : inv.status === "cancelled" ? "Cancelada" : inv.status}
                                  </span>
                                  <svg className={`w-4 h-4 text-text-tertiary transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                  </svg>
                                </div>
                              </button>

                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  className="border-t border-border bg-surface-tertiary p-4"
                                >
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                      <div>
                                        <p className="text-[10px] text-text-tertiary">Cliente</p>
                                        <p className="text-xs text-text-secondary">{user.name}</p>
                                        <p className="text-[10px] text-text-tertiary">{user.nit ? `NIT: ${user.nit}` : ""}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-[10px] text-text-tertiary">Fecha de emisión</p>
                                        <p className="text-xs text-text-secondary">{inv.date ? formatDate(inv.date) : formatDate(inv.created_at)}</p>
                                      </div>
                                    </div>

                                    {inv.items && inv.items.length > 0 && (
                                      <div>
                                        <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2">Detalle</p>
                                        <div className="space-y-1">
                                          {inv.items.map((item: any, ii: number) => (
                                            <div key={ii} className="flex items-center justify-between py-1 text-xs">
                                              <div className="flex-1">
                                                <span className="text-text-secondary">{item.name || item.description || "Ítem"}</span>
                                                {item.quantity && <span className="text-text-tertiary ml-1">x{item.quantity}</span>}
                                              </div>
                                              <span className="text-text-secondary font-medium ml-4">
                                                ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    <div className="border-t border-border-subtle pt-2 space-y-1">
                                      {(inv.subtotal !== undefined) && (
                                        <div className="flex justify-between text-xs">
                                          <span className="text-text-tertiary">Subtotal</span>
                                          <span className="text-text-secondary">${Number(inv.subtotal).toLocaleString()}</span>
                                        </div>
                                      )}
                                      {(inv.tax !== undefined) && (
                                        <div className="flex justify-between text-xs">
                                          <span className="text-text-tertiary">IVA</span>
                                          <span className="text-text-secondary">${Number(inv.tax).toLocaleString()}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between text-sm font-bold">
                                        <span className="text-text-secondary">Total</span>
                                        <span className="text-text-primary">${(inv.total || 0).toLocaleString()}</span>
                                      </div>
                                    </div>

                                    {inv.status !== "cancelled" && (
                                      <a
                                        href={`/api/invoices/${inv.id}/pdf`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 mt-2 text-xs text-interactive-accent hover:text-interactive-accent-hover transition-colors"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                        </svg>
                                        Descargar PDF
                                      </a>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                {/* Mis Garantías */}
                {activeTab === "garantias" && (
                  <>
                    {warrantiesLoading ? (
                      <p className="text-text-secondary text-sm">Cargando...</p>
                    ) : warranties.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="mx-auto mb-3 w-12 h-12 rounded-lg bg-surface-tertiary/50 flex items-center justify-center">
                          <svg className="w-6 h-6 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                          </svg>
                        </div>
                        <p className="text-text-secondary text-sm">No tienes garantías registradas.</p>
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {warranties.map((w: any, idx: number) => {
                          const startDate = w.start_date ? new Date(w.start_date) : null;
                          const endDate = w.end_date ? new Date(w.end_date) : null;
                          const now = new Date();
                          const isExpired = endDate ? endDate < now : false;
                          const daysRemaining = endDate && !isExpired
                            ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                            : 0;
                          return (
                            <motion.div
                              key={w.id || idx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="rounded-lg border border-border bg-surface-tertiary/30 p-4"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    isExpired
                                      ? "bg-red-500/10"
                                      : "bg-green-500/10"
                                  }`}>
                                    <svg className={`w-5 h-5 ${isExpired ? "text-red-400" : "text-green-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-text-primary">{w.service_name || w.product_name || "Garantía"}</p>
                                    <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                      isExpired
                                        ? "bg-red-500/10 text-red-400"
                                        : "bg-green-500/10 text-green-400"
                                    }`}>
                                      {isExpired ? "Expirada" : "Activa"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-1.5 text-xs">
                                {startDate && (
                                  <div className="flex justify-between">
                                    <span className="text-text-tertiary">Inicio</span>
                                    <span className="text-text-secondary">{formatDate(w.start_date)}</span>
                                  </div>
                                )}
                                {endDate && (
                                  <div className="flex justify-between">
                                    <span className="text-text-tertiary">Fin</span>
                                    <span className="text-text-secondary">{formatDate(w.end_date)}</span>
                                  </div>
                                )}
                                {!isExpired && daysRemaining > 0 && (
                                  <div className="flex justify-between pt-1 border-t border-border-subtle">
                                    <span className="text-interactive-accent font-medium">Días restantes</span>
                                    <span className="text-interactive-accent font-bold">{daysRemaining} días</span>
                                  </div>
                                )}
                                {isExpired && (
                                  <div className="flex justify-between pt-1 border-t border-border-subtle">
                                    <span className="text-red-400 font-medium">Estado</span>
                                    <span className="text-red-400">Garantía expirada</span>
                                  </div>
                                )}
                              </div>

                              {w.terms && (
                                <div className="mt-3 pt-3 border-t border-border-subtle">
                                  <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">Términos y condiciones</p>
                                  <p className="text-[10px] text-text-secondary leading-relaxed">{w.terms}</p>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Modal open={!!orderIdParam} onClose={() => { setOrderDetail(null); setSearchParams({}); }} title="Detalle del Pedido" size="md">
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-interactive-accent border-t-transparent rounded-full" />
          </div>
        ) : orderDetail ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-tertiary">#{orderDetail.id?.slice(0, 8)}</p>
              <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full ${statusColors[orderDetail.status] || "bg-surface-tertiary/50 text-text-secondary"}`}>
                {orderDetail.status === "pending" ? "Pendiente" : orderDetail.status === "processing" ? "Procesando" : orderDetail.status === "paid" ? "Pagado" : orderDetail.status === "shipped" ? "Enviado" : orderDetail.status === "delivered" ? "Entregado" : orderDetail.status === "completed" ? "Completado" : orderDetail.status === "cancelled" ? "Cancelado" : orderDetail.status}
              </span>
            </div>

            {(orderDetail.status === "pending" || orderDetail.status === "paid" || orderDetail.status === "shipped" || orderDetail.status === "delivered") && (
              <div className="py-3">
                <div className="flex items-center justify-between">
                  {["pending", "paid", "shipped", "delivered"].map((s, i) => {
                    const steps = ["pending", "paid", "shipped", "delivered"];
                    const labels = ["Pendiente", "Pagado", "Enviado", "Entregado"];
                    const currentIdx = steps.indexOf(orderDetail.status);
                    const isActive = i <= currentIdx;
                    return (
                      <div key={s} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? "bg-interactive-accent text-white" : "bg-surface-tertiary/50 text-text-tertiary"}`}>
                          {isActive ? "✓" : i + 1}
                        </div>
                        <p className={`text-[9px] mt-1 ${isActive ? "text-interactive-accent" : "text-text-tertiary"}`}>{labels[i]}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-text-tertiary text-xs">Fecha</p><p className="text-text-primary">{formatDate(orderDetail.created_at)}</p></div>
              <div><p className="text-text-tertiary text-xs">Método de pago</p><p className="text-text-primary capitalize">{orderDetail.payment_method || "—"}</p></div>
              <div><p className="text-text-tertiary text-xs">Estado</p><p className="text-text-primary capitalize">{orderDetail.status}</p></div>
              <div><p className="text-text-tertiary text-xs">Total</p><p className="text-text-primary font-bold">${(Number(orderDetail.total) || 0).toLocaleString()}</p></div>
            </div>
            {orderDetail.shipping_address && (
              <div><p className="text-text-tertiary text-xs mb-1">Dirección de envío</p><p className="text-text-primary text-sm">{orderDetail.shipping_address}</p></div>
            )}
            <div>
              <p className="text-text-tertiary text-xs mb-2">Productos</p>
              <div className="space-y-2">
                {(Array.isArray(orderDetail.items) ? orderDetail.items : []).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-border-subtle">
                    <div>
                      <p className="text-sm text-text-primary">{item.name || item.product_name || "Producto"}</p>
                      <p className="text-[10px] text-text-tertiary">Qty: {item.quantity || 1}</p>
                    </div>
                    <p className="text-sm text-text-primary font-medium">${((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
            {orderDetail.status !== "cancelled" && orderDetail.status !== "delivered" && (
              <button onClick={() => {
                if (confirm("¿Cancelar este pedido?")) {
                  api.put(`/store-orders/${orderDetail.id}/status`, { status: "cancelled" }).then(() => {
                    addToast("Pedido cancelado", "success");
                    setSearchParams({});
                  }).catch(() => addToast("Error al cancelar", "error"));
                }
              }} className="w-full rounded-lg border border-red-500/20 bg-red-500/5 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
                Cancelar pedido
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-text-secondary text-sm">Pedido no encontrado</p>
          </div>
        )}
      </Modal>

      <Footer /><BackToTop /><WhatsAppFloat />
    </>
  );
}
