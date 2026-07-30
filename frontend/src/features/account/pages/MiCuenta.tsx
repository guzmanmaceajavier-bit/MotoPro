import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { Spinner } from '@/components/ui';

import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { useCart } from '@/providers/CartProvider';
import { api } from '@/api/client';
import { ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '@shared/components/ui/EmptyState';
import { ProfileForm } from '../components/ProfileForm';
import { DashboardResumen } from '../components/DashboardResumen';
import { VehicleManager } from '../components/VehicleManager';
import { NotificationsList } from '../components/NotificationsList';
import { NotificationPreferences } from '../components/NotificationPreferences';
import AddressManager from '../components/AddressManager';
import MaintenanceHistory from '../components/MaintenanceHistory';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
}

type Tab = 'resumen' | 'servicios' | 'compras' | 'citas' | 'facturas' | 'vehiculos' | 'garantias' | 'cotizaciones' | 'notificaciones' | 'preferencias' | 'direcciones' | 'perfil';

const TABS: { key: Tab; label: string }[] = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'servicios', label: 'Servicios' },
  { key: 'compras', label: 'Compras' },
  { key: 'citas', label: 'Citas' },
  { key: 'facturas', label: 'Facturas' },
  { key: 'vehiculos', label: 'Vehículos' },
  { key: 'garantias', label: 'Garantías' },
  { key: 'cotizaciones', label: 'Cotizaciones' },
  { key: 'notificaciones', label: 'Notificaciones' },
  { key: 'preferencias', label: 'Preferencias' },
  { key: 'direcciones', label: 'Direcciones' },
  { key: 'perfil', label: 'Perfil' },
];

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-surface-secondary border border-border rounded-lg p-5 ${className}`}>{children}</div>;
}

function TabContent({ items, renderItem, emptyMessage, emptyAction }: { items: any[]; renderItem: (item: any) => React.ReactNode; emptyMessage: string; emptyAction?: { label: string; to: string } }) {
  const navigate = useNavigate();
  if (items.length === 0) {
    const action = emptyAction ? { label: emptyAction.label, onClick: () => navigate(emptyAction.to) } : undefined;
    return <EmptyState title="Sin datos" message={emptyMessage} action={action} />;
  }
  return <div className="space-y-4">{items.map(renderItem)}</div>;
}

export default function MiCuenta() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const { addToast } = useToast();
  const { addItem, clearCart } = useCart();
  const [activeTab, setActiveTab] = useState<Tab>('resumen');
  const [services, setServices] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [warranties, setWarranties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const results = await Promise.allSettled([
      api.get('/customer-auth/orders').catch(() => []),
      api.get('/appointments/my').catch(() => []),
      api.get('/vehicles').catch(() => []),
      api.get('/warranties/my').catch(() => []),
      api.get('/invoices').catch(() => []),
    ]);
    const [ordersRes, appsRes, vehsRes, warrRes, invsRes] = results;
    if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value || []);
    if (appsRes.status === 'fulfilled') setAppointments(appsRes.value || []);
    if (vehsRes.status === 'fulfilled') setVehicles(vehsRes.value || []);
    if (warrRes.status === 'fulfilled') setWarranties(warrRes.value || []);
    if (invsRes.status === 'fulfilled') setInvoices(invsRes.value || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setProfileForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', address: user.address || '' });
    fetchAll();
  }, [user, navigate, fetchAll]);

  useEffect(() => { setServices(orders.filter((o: any) => o.type === 'service')); }, [orders]);
  const quotes = services.filter((s: any) => s.status === 'pending' || s.status === 'approved');

  const handleProfileSave = async () => {
    try { await updateProfile(profileForm); addToast('Perfil actualizado correctamente', 'success'); }
    catch { addToast('Error al actualizar perfil', 'error'); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const handleReorder = async (order: any) => {
    try {
      const detail = await api.get(`/checkout/${order.id}`);
      const orderItems = detail?.items || [];
      clearCart();
      for (const item of orderItems) {
        addItem({
          id: item.product_id || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || "",
        });
      }
      addToast("Productos agregados al carrito", "success");
      navigate("/cart");
    } catch {
      addToast("Error al procesar la orden", "error");
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      await api.put(`/appointments/${id}`, { status: "cancelled" });
      setAppointments(prev => prev.map((a: any) => a.id === id ? { ...a, status: "cancelled" } : a));
      addToast("Cita cancelada", "success");
    } catch { addToast("Error al cancelar cita", "error"); }
  };

  const dashboardStats = [
    { label: 'Servicios', value: services.length, icon: 'services', to: '#servicios' },
    { label: 'Pedidos', value: orders.length, icon: 'orders', to: '#compras' },
    { label: 'Citas', value: appointments.length, icon: 'appointments', to: '#citas' },
    { label: 'Vehículos', value: vehicles.length, icon: 'vehicles', to: '#vehiculos' },
    { label: 'Garantías', value: warranties.length, icon: 'warranty', to: '#garantias' },
  ];

  return (
    <>
      <SEO title="Mi Cuenta" description="Gestiona tus servicios, compras y citas desde tu cuenta." />
      <div className="min-h-screen bg-surface-primary flex flex-col">
        <main className="flex-1 pt-24 pb-16 px-4 max-w-6xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-text-primary">Mi Cuenta</h1>
                <p className="text-text-secondary mt-1">Hola, {user?.name || 'Usuario'}</p>
              </div>
              <button onClick={handleLogout}
                className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium">
                Cerrar Sesión
              </button>
            </div>

            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {TABS.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.key ? 'bg-interactive-accent text-black' : 'bg-surface-secondary text-text-secondary hover:text-text-primary border border-border'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {loading && activeTab !== 'vehiculos' ? (
              <Spinner size="md" className="py-20" />
            ) : (
              <>
                {activeTab === 'resumen' && (
                  <DashboardResumen stats={dashboardStats} services={services} orders={orders} vehicles={vehicles} user={user} />
                )}

                {activeTab === 'servicios' && (
                  <>
                    <TabContent items={services} emptyMessage="No tienes solicitudes de servicio." emptyAction={{ label: 'Explorar servicios', to: '/servicios' }}
                      renderItem={(s: any) => (
                        <div key={s.id} className="bg-surface-secondary border border-border rounded-lg p-5 hover:border-border-accent transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-text-primary font-medium">{s.title || `Servicio #${s.id?.slice(0,8)}`}</h3>
                              <p className="text-text-secondary text-sm mt-1">{s.description?.slice(0, 80)}{s.description?.length > 80 ? '...' : ''}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Link to={`/estado-servicio?id=${s.id}`} className="text-xs text-interactive-accent hover:underline">Ver estado</Link>
                              <StatusBadge status={s.status} />
                              <button onClick={() => setExpandedService(expandedService === s.id ? null : s.id)} className="text-text-tertiary hover:text-text-primary">
                                {expandedService === s.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            </div>
                          </div>
                          {expandedService === s.id && (
                            <div className="mt-4 pt-4 border-t border-border space-y-3">
                              <div>
                                <h4 className="text-xs font-semibold text-text-secondary uppercase mb-2">Facturas</h4>
                                {(s.invoices || []).length > 0 ? s.invoices.map((inv: any) => (
                                  <div key={inv.id} className="flex items-center justify-between text-sm py-1">
                                    <span className="text-text-secondary">{inv.number || `#${inv.id?.slice(0,8)}`}</span>
                                    <span className="text-text-primary font-medium">${Number(inv.total || 0).toLocaleString()}</span>
                                  </div>
                                )) : <p className="text-xs text-text-tertiary">Sin facturas asociadas</p>}
                              </div>
                              {(s.photos || []).length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-text-secondary uppercase mb-2">Fotos</h4>
                                  <div className="flex gap-2 overflow-x-auto">
                                    {s.photos.map((photo: string, i: number) => (
                                      <img key={i} src={photo} alt="" loading="lazy" className="w-16 h-16 rounded object-cover shrink-0" />
                                    ))}
                                  </div>
                                </div>
                              )}
                              {s.warranty && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Shield className="w-4 h-4 text-interactive-accent" />
                                  <span className="text-text-secondary">Garantía: </span>
                                  <span className="text-text-primary font-medium">{s.warranty}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    />
                    <div className="mt-6">
                      <h3 className="text-md font-bold text-text-primary mb-4">Historial de mantenimiento</h3>
                      <MaintenanceHistory />
                    </div>
                  </>
                )}

                {activeTab === 'compras' && (
                  <TabContent items={orders} emptyMessage="No tienes pedidos registrados."
                    renderItem={(o: any) => (
                      <Card key={o.id}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-text-primary font-medium">Pedido #{o.id}</h3>
                            <p className="text-text-secondary text-sm mt-1">{formatDate(o.created_at)}</p>
                          </div>
                          <div className="text-right">
                            <StatusBadge status={o.status} />
                            <p className="text-text-primary font-semibold mt-2">${Number(o.total).toLocaleString('es-CO')}</p>
                          </div>
                        </div>
                        <button onClick={() => handleReorder(o)}
                          className="text-xs text-interactive-accent hover:underline mt-2 inline-block">
                          Comprar de nuevo →
                        </button>
                      </Card>
                    )}
                  />
                )}

                {activeTab === 'citas' && (
                  <TabContent items={appointments} emptyMessage="No tienes citas programadas."
                    renderItem={(a: any) => (
                      <Card key={a.id}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-text-primary font-medium">{a.service_type || 'Cita'}</h3>
                            <p className="text-text-secondary text-sm mt-1">{formatDate(a.appointment_date || a.date)} · {a.start_time || a.time}</p>
                            {a.mechanic_name && <p className="text-xs text-text-tertiary mt-0.5">Mecánico: {a.mechanic_name}</p>}
                          </div>
                          <div className="flex items-center gap-3">
                            {(a.status === 'pending' || a.status === 'confirmed') && (
                              <button onClick={() => handleCancelAppointment(a.id)}
                                className="text-xs text-red-500 hover:text-red-400 border border-red-500/30 rounded px-2 py-1 hover:bg-red-500/10 transition-all">
                                Cancelar
                              </button>
                            )}
                            {a.status === 'cancelled' && (
                              <Link to="/agendar-cita" className="text-xs text-interactive-accent hover:underline">Reagendar</Link>
                            )}
                            <StatusBadge status={a.status} />
                          </div>
                        </div>
                      </Card>
                    )}
                  />
                )}

                {activeTab === 'facturas' && (
                  <TabContent items={invoices} emptyMessage="No tienes facturas registradas."
                    renderItem={(inv: any) => (
                      <Card key={inv.id}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-text-primary font-medium">{inv.invoice_number}</h3>
                            <p className="text-text-secondary text-sm mt-1">{formatDate(inv.created_at)}</p>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <StatusBadge status={inv.status} />
                            <p className="text-text-primary font-semibold">${Number(inv.total).toLocaleString('es-CO')}</p>
                          </div>
                        </div>
                      </Card>
                    )}
                  />
                )}

                {activeTab === 'vehiculos' && (
                  <VehicleManager vehicles={vehicles} onRefresh={fetchAll} />
                )}

                {activeTab === 'cotizaciones' && (
                  <TabContent items={quotes} emptyMessage="No tienes cotizaciones pendientes." emptyAction={{ label: 'Solicitar cotización', to: '/solicitar-servicio' }}
                    renderItem={(q: any) => (
                      <Card key={q.id}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-text-primary font-medium">Cotización #{q.id?.slice(0, 8).toUpperCase()}</h3>
                            <p className="text-text-secondary text-sm mt-1">{q.service_type || q.description?.slice(0, 60)}{q.description?.length > 60 ? '...' : ''}</p>
                          </div>
                          <StatusBadge status={q.status} />
                        </div>
                      </Card>
                    )}
                  />
                )}

                {activeTab === 'garantias' && (
                  <TabContent items={warranties} emptyMessage="No tienes garantías activas."
                    renderItem={(w: any) => (
                      <Card key={w.id}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-text-primary font-medium">{w.service_name || w.product_name}</h3>
                            <p className="text-text-secondary text-sm mt-1">Vence: {formatDate(w.end_date)}</p>
                          </div>
                          <StatusBadge status={w.status} />
                        </div>
                      </Card>
                    )}
                  />
                )}

                {activeTab === 'notificaciones' && <NotificationsList />}

                {activeTab === 'preferencias' && <NotificationPreferences />}

                {activeTab === 'direcciones' && <AddressManager />}

                {activeTab === 'perfil' && (
                  <ProfileForm form={profileForm} onChange={setProfileForm} onSave={handleProfileSave} />
                )}
              </>
            )}
          </motion.div>
        </main>

      </div>
    </>
  );
}
