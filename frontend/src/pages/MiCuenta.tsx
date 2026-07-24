import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BackToTop } from '@/components/layout/BackToTop';
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { api } from '@/api/client';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  in_progress: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  approved: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  completed: 'bg-green-500/10 text-green-400 border border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En Progreso',
  approved: 'Aprobado',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

type Tab = 'servicios' | 'compras' | 'citas' | 'facturas' | 'vehiculos' | 'garantias' | 'cotizaciones' | 'perfil';

export default function MiCuenta() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('servicios');
  const [services, setServices] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [appointments] = useState<any[]>([]);
  const [invoices] = useState<any[]>([]);
  const [vehicles] = useState<any[]>([]);
  const [warranties] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehicleForm, setVehicleForm] = useState({ brand: "", model: "", year: "", plate: "", vin: "", color: "" });
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setProfileForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
    });
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    async function fetchData() {
      try {
        const [ordersRes] = await Promise.allSettled([
          api.get('/customer-auth/orders'),
        ]);
        if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    setQuotes(services.filter(s => s.status === 'pending' || s.status === 'approved'));
  }, [services]);
  const tabs: { key: Tab; label: string }[] = [
    { key: 'servicios', label: 'Servicios' },
    { key: 'compras', label: 'Compras' },
    { key: 'citas', label: 'Citas' },
    { key: 'facturas', label: 'Facturas' },
    { key: 'vehiculos', label: 'Vehículos' },
    { key: 'garantias', label: 'Garantías' },
    { key: 'cotizaciones', label: 'Cotizaciones' },
    { key: 'perfil', label: 'Perfil' },
  ];

  const handleProfileSave = async () => {
    try {
      await updateProfile(profileForm);
      addToast('Perfil actualizado correctamente', 'success');
    } catch {
      addToast('Error al actualizar perfil', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <SEO
        title="Mi Cuenta"
        description="Gestiona tus servicios, compras y citas desde tu cuenta."
      />
      <div className="min-h-screen bg-surface-primary flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 px-4 max-w-6xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-text-primary">Mi Cuenta</h1>
                <p className="text-text-secondary mt-1">
                  Hola, {user?.name || 'Usuario'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.key
                      ? 'bg-interactive-accent text-black'
                      : 'bg-surface-secondary text-text-secondary hover:text-text-primary border border-border'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-interactive-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Servicios */}
                {activeTab === 'servicios' && (
                  <div className="space-y-4">
                    {services.length === 0 ? (
                      <div className="bg-surface-secondary border border-border rounded-lg p-10 text-center">
                        <p className="text-text-secondary">
                          No tienes solicitudes de servicio.
                        </p>
                        <Link
                          to="/servicios"
                          className="inline-block mt-4 text-interactive-accent hover:underline text-sm"
                        >
                          Explorar servicios
                        </Link>
                      </div>
                    ) : (
                      services.map((s) => (
                        <Link
                          key={s.id}
                          to={`/estado-servicio?id=${s.id}`}
                          className="block bg-surface-secondary border border-border rounded-lg p-5 hover:border-border-accent transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-text-primary font-medium">
                                {s.title || `Servicio #${s.id}`}
                              </h3>
                              <p className="text-text-secondary text-sm mt-1">
                                {s.description?.slice(0, 80)}
                                {s.description?.length > 80 ? '...' : ''}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                statusColors[s.status] || 'bg-surface-tertiary/50 text-text-secondary'
                              }`}
                            >
                              {statusLabels[s.status] || s.status}
                            </span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                )}

                {/* Compras */}
                {activeTab === 'compras' && (
                  <div className="space-y-4">
                    {orders.length === 0 ? (
                      <div className="bg-surface-secondary border border-border rounded-lg p-10 text-center">
                        <p className="text-text-secondary">No tienes pedidos registrados.</p>
                      </div>
                    ) : (
                      orders.map((o) => (
                        <div
                          key={o.id}
                          className="bg-surface-secondary border border-border rounded-lg p-5"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-text-primary font-medium">
                                Pedido #{o.id}
                              </h3>
                              <p className="text-text-secondary text-sm mt-1">
                                {formatDate(o.created_at)}
                              </p>
                            </div>
                            <div className="text-right">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  statusColors[o.status] || 'bg-surface-tertiary/50 text-text-secondary'
                                }`}
                              >
                                {statusLabels[o.status] || o.status}
                              </span>
                              <p className="text-text-primary font-semibold mt-2">
                                ${Number(o.total).toLocaleString('es-CO')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Citas */}
                {activeTab === 'citas' && (
                  <div className="space-y-4">
                    {appointments.length === 0 ? (
                      <div className="bg-surface-secondary border border-border rounded-lg p-10 text-center">
                        <p className="text-text-secondary">No tienes citas programadas.</p>
                      </div>
                    ) : (
                      appointments.map((a) => (
                        <div
                          key={a.id}
                          className="bg-surface-secondary border border-border rounded-lg p-5"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-text-primary font-medium">
                                {a.service_type || 'Cita'}
                              </h3>
                              <p className="text-text-secondary text-sm mt-1">
                                {formatDate(a.appointment_date || a.date)} · {a.start_time || a.time}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                statusColors[a.status] || 'bg-surface-tertiary/50 text-text-secondary'
                              }`}
                            >
                              {statusLabels[a.status] || a.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Facturas */}
                {activeTab === 'facturas' && (
                  <div className="space-y-4">
                    {invoices.length === 0 ? (
                      <div className="bg-surface-secondary border border-border rounded-lg p-10 text-center">
                        <p className="text-text-secondary">No tienes facturas registradas.</p>
                      </div>
                    ) : (
                      invoices.map((inv) => (
                        <div key={inv.id} className="bg-surface-secondary border border-border rounded-lg p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-text-primary font-medium">{inv.invoice_number}</h3>
                              <p className="text-text-secondary text-sm mt-1">{formatDate(inv.created_at)}</p>
                            </div>
                            <div className="text-right flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                inv.status === 'paid' ? 'bg-green-500/10 text-green-400' :
                                inv.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                                'bg-amber-500/10 text-amber-400'
                              }`}>
                                {inv.status === 'paid' ? 'Pagada' : inv.status === 'cancelled' ? 'Anulada' : 'Pendiente'}
                              </span>
                              <p className="text-text-primary font-semibold">${Number(inv.total).toLocaleString('es-CO')}</p>
                              <a href={`/api/invoices/${inv.id}/pdf`} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-interactive-accent hover:underline">PDF</a>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Vehículos */}
                {activeTab === 'vehiculos' && (
                  <div className="space-y-4">
                    {vehicles.length === 0 ? (
                      <div className="bg-surface-secondary border border-border rounded-lg p-8 text-center">
                        <p className="text-text-secondary">No tienes motos registradas.</p>
                      </div>
                    ) : (
                      vehicles.map((v) => (
                        <div key={v.id} className="bg-surface-secondary border border-border rounded-lg p-5">
                          <div className="flex items-center gap-4">
                            <span className="text-3xl">🏍️</span>
                            <div className="flex-1">
                              <h3 className="text-text-primary font-medium">{v.brand} {v.model} {v.year ? `(${v.year})` : ''}</h3>
                              <p className="text-text-secondary text-sm">Placa: {v.plate} {v.vin ? `· VIN: ${v.vin}` : ''}</p>
                              {v.color && <p className="text-text-tertiary text-xs">Color: {v.color}</p>}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <button onClick={() => setActiveTab('perfil')} className="text-sm text-interactive-accent hover:underline">Agregar vehículo desde perfil</button>
                  </div>
                )}

                {/* Cotizaciones */}
                {activeTab === 'cotizaciones' && (
                  <div className="space-y-4">
                    {quotes.length === 0 ? (
                      <div className="bg-surface-secondary border border-border rounded-lg p-10 text-center">
                        <p className="text-text-secondary">No tienes cotizaciones pendientes.</p>
                        <Link to="/solicitar-servicio" className="inline-block mt-4 text-sm text-interactive-accent hover:underline">Solicitar cotización</Link>
                      </div>
                    ) : (
                      quotes.map((q) => (
                        <div key={q.id} className="bg-surface-secondary border border-border rounded-lg p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-text-primary font-medium">Cotización #{q.id?.slice(0, 8).toUpperCase()}</h3>
                              <p className="text-text-secondary text-sm mt-1">{q.service_type || q.description?.slice(0, 60)}{q.description?.length > 60 ? '...' : ''}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[q.status] || 'bg-surface-tertiary/50 text-text-secondary'}`}>
                              {statusLabels[q.status] || q.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Garantías */}
                {activeTab === 'garantias' && (
                  <div className="space-y-4">
                    {warranties.length === 0 ? (
                      <div className="bg-surface-secondary border border-border rounded-lg p-10 text-center">
                        <p className="text-text-secondary">No tienes garantías activas.</p>
                      </div>
                    ) : (
                      warranties.map((w) => (
                        <div key={w.id} className="bg-surface-secondary border border-border rounded-lg p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-text-primary font-medium">{w.service_name || w.product_name}</h3>
                              <p className="text-text-secondary text-sm mt-1">Vence: {formatDate(w.end_date)}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              w.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-surface-tertiary/50 text-text-secondary'
                            }`}>
                              {w.status === 'active' ? 'Activa' : 'Expirada'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Perfil */}
                {activeTab === 'perfil' && (
                  <div className="bg-surface-secondary border border-border rounded-lg p-8 max-w-lg">
                    <h2 className="text-xl font-semibold text-text-primary mb-6">
                      Información Personal
                    </h2>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-1.5">
                          Nombre
                        </label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, name: e.target.value })
                          }
                          className="w-full bg-surface-tertiary border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-interactive-accent transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-1.5">
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, email: e.target.value })
                          }
                          className="w-full bg-surface-tertiary border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-interactive-accent transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-1.5">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, phone: e.target.value })
                          }
                          className="w-full bg-surface-tertiary border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-interactive-accent transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-1.5">
                          Dirección
                        </label>
                        <input
                          type="text"
                          value={profileForm.address}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              address: e.target.value,
                            })
                          }
                          className="w-full bg-surface-tertiary border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-interactive-accent transition-colors"
                        />
                      </div>
                      <button
                        onClick={handleProfileSave}
                        className="w-full bg-interactive-accent text-black font-semibold py-2.5 rounded-lg hover:bg-interactive-accent/90 transition-colors"
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </main>
        <Footer />
        <BackToTop />
        <WhatsAppFloat />
      </div>
    </>
  );
}
