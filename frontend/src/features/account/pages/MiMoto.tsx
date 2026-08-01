import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Spinner, Badge } from "@/components/ui";
import { useMoto } from "@/providers/MotoProvider";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/api/client";
import { Wrench, Calendar, Clock, Shield, AlertCircle, CheckCircle, ArrowRight, Bike, Star, Plus, Settings } from "lucide-react";

export default function MiMoto() {
  const { user } = useAuth();
  const { vehicles, activeVehicle, setActiveVehicle, loading: vehLoading, refreshVehicles } = useMoto();
  const [serviceOrders, setServiceOrders] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeService, setActiveService] = useState<any>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoadingOrders(true);
    Promise.all([
      api.get("/customer-auth/orders").catch(() => []),
      api.get("/appointments/my").catch(() => []),
    ]).then(([orders, apps]) => {
      const ords = Array.isArray(orders) ? orders : orders?.data ? orders.data : [];
      const appts = Array.isArray(apps) ? apps : apps?.data ? apps.data : [];
      setServiceOrders(ords.filter((o: any) => o.type === "service" || o.type === "maintenance"));
      setAppointments(appts);
      const ongoing = ords.find((o: any) => o.status && !["completed", "cancelled", "delivered"].includes(o.status));
      if (ongoing) setActiveService(ongoing);
    }).finally(() => setLoadingOrders(false));
  }, [user]);

  const upcomingMaintenance = activeVehicle ? [
    { label: "Cambio de aceite", due: "1,000 km", icon: "🛢️", urgent: false },
    { label: "Revisión de frenos", due: "Cada 5,000 km", icon: "🔧", urgent: true },
    { label: "Limpieza de inyectores", due: "10,000 km", icon: "💉", urgent: false },
  ] : [];

  const stats = activeService
    ? [
        { label: "Servicio activo", value: activeService.service_type || "En taller", icon: Wrench },
        { label: "Estado", value: activeService.status || "—", icon: Settings },
        { label: "Ingreso", value: activeService.created_at ? new Date(activeService.created_at).toLocaleDateString("es-ES") : "—", icon: Calendar },
      ]
    : [];

  const recentServices = serviceOrders.slice(0, 3);

  return (
    <>
      <SEO title="Mi Moto | MotoPro" description="Panel de control de tu motocicleta" />
      <main className="min-h-screen pt-20 pb-16 bg-surface-primary">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary">Mi Moto</h1>
              <p className="text-sm text-text-secondary mt-1">Panel de control de tu motocicleta</p>
            </div>
            {user && (
              <Link to="/mi-cuenta?tab=vehiculos"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-secondary px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-tertiary transition-all">
                <Settings className="w-4 h-4" />
                Gestionar motos
              </Link>
            )}
          </div>

          {!user ? (
            <div className="bg-surface-secondary border border-border rounded-2xl p-12 text-center">
              <Bike className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <h2 className="text-xl font-bold text-text-primary mb-2">Regístrate para gestionar tu moto</h2>
              <p className="text-sm text-text-secondary mb-6">Crea una cuenta y registra tu motocicleta para acceder a servicios personalizados.</p>
              <div className="flex gap-3 justify-center">
                <Link to="/login" className="rounded-lg bg-interactive-accent px-6 py-3 text-sm font-bold text-black hover:bg-interactive-accent-hover transition-all">Iniciar sesión</Link>
                <Link to="/registro" className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-text-primary hover:bg-surface-tertiary transition-all">Crear cuenta</Link>
              </div>
            </div>
          ) : vehLoading ? (
            <Spinner size="md" className="py-16" />
          ) : vehicles.length === 0 ? (
            /* Empty state - register moto */
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-surface-secondary border border-border rounded-2xl p-12 text-center">
              <Bike className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <h2 className="text-xl font-bold text-text-primary mb-2">Registra tu motocicleta</h2>
              <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
                Agrega los datos de tu moto para recibir recomendaciones personalizadas, recordatorios de mantenimiento y acceder más rápido a tus servicios.
              </p>
              <Link to="/mi-cuenta?tab=vehiculos"
                className="inline-flex items-center gap-2 rounded-lg bg-interactive-accent px-6 py-3.5 text-sm font-bold text-black hover:bg-interactive-accent-hover transition-all">
                <Plus className="w-4 h-4" />
                Registrar mi moto
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Active Motorcycle Hero */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-interactive-accent/10 via-surface-secondary to-surface-secondary border border-border rounded-2xl p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-interactive-accent/20 flex items-center justify-center shrink-0">
                    <Bike className="w-10 h-10 text-interactive-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <span className="text-xs font-semibold text-interactive-accent uppercase tracking-wider">Moto activa</span>
                        <h2 className="text-2xl md:text-3xl font-bold text-text-primary mt-1">
                          {activeVehicle?.brand} {activeVehicle?.model}
                        </h2>
                        <p className="text-sm text-text-secondary mt-1">
                          {activeVehicle?.year && `${activeVehicle.year} · `}
                          {activeVehicle?.cilindraje && `${activeVehicle.cilindraje} cc`}
                          {activeVehicle?.plate && ` · Placa: ${activeVehicle.plate}`}
                          {activeVehicle?.color && ` · ${activeVehicle.color}`}
                        </p>
                      </div>
                      {vehicles.length > 1 && (
                        <select value={activeVehicle?.id || ""} onChange={(e) => {
                          const v = vehicles.find(v => v.id === e.target.value);
                          if (v) setActiveVehicle(v);
                        }}
                          className="bg-surface-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-interactive-accent">
                          {vehicles.map(v => (
                            <option key={v.id} value={v.id}>{v.brand} {v.model} {v.plate ? `(${v.plate})` : ""}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Active Service Alert */}
              {activeService && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-text-primary">Tienes un servicio en curso</p>
                    <p className="text-xs text-text-secondary mt-1">{activeService.service_type} — Estado: {activeService.status}</p>
                    <Link to={`/estado-servicio?order=${activeService.id}`}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-interactive-accent hover:underline">
                      Ver estado <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Stats Grid */}
              {activeService && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-surface-secondary border border-border rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-interactive-accent/10 flex items-center justify-center shrink-0">
                        <stat.icon className="w-5 h-5 text-interactive-accent" />
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary">{stat.label}</p>
                        <p className="text-sm font-bold text-text-primary">{stat.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {/* Service History */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="bg-surface-secondary border border-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-text-tertiary" />
                      Últimos servicios
                    </h3>
                    <Link to="/mi-cuenta?tab=servicios" className="text-xs text-interactive-accent hover:underline">Ver todos</Link>
                  </div>
                  {loadingOrders ? (
                    <Spinner size="sm" />
                  ) : recentServices.length > 0 ? (
                    <div className="space-y-3">
                      {recentServices.map((s: any, i: number) => (
                        <div key={s.id || i} className="flex items-center justify-between p-3 rounded-lg bg-surface-tertiary border border-border">
                          <div>
                            <p className="text-sm font-medium text-text-primary">{s.service_type || "Servicio"}</p>
                            <p className="text-xs text-text-tertiary">{s.created_at ? new Date(s.created_at).toLocaleDateString("es-ES") : ""}</p>
                          </div>
                          <Badge variant={s.status === "completed" || s.status === "delivered" ? "success" : s.status === "cancelled" ? "error" : "warning"}>
                            {s.status === "completed" ? "Completado" : s.status === "in_progress" ? "En curso" : s.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-tertiary text-center py-6">Aún no tienes servicios registrados.</p>
                  )}
                  <Link to="/agendar-cita"
                    className="mt-4 flex items-center justify-center gap-2 w-full rounded-lg bg-interactive-accent/10 border border-interactive-accent/30 py-2.5 text-sm font-semibold text-interactive-accent hover:bg-interactive-accent/20 transition-all">
                    <Calendar className="w-4 h-4" />
                    Agendar servicio
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>

                {/* Maintenance Recommendations */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="bg-surface-secondary border border-border rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-text-tertiary" />
                    Mantenimiento recomendado
                  </h3>
                  {activeVehicle ? (
                    <div className="space-y-3">
                      {upcomingMaintenance.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-surface-tertiary border border-border">
                          <span className="text-xl">{item.icon}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-text-primary">{item.label}</p>
                            <p className="text-xs text-text-tertiary">Cada {item.due}</p>
                          </div>
                          {item.urgent && (
                            <Badge variant="warning">Próximo</Badge>
                          )}
                        </div>
                      ))}
                      <Link to="/servicios"
                        className="mt-2 flex items-center justify-center gap-2 w-full rounded-lg border border-border py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-all">
                        <Wrench className="w-4 h-4" />
                        Ver servicios disponibles
                      </Link>
                    </div>
                  ) : (
                    <p className="text-sm text-text-tertiary text-center py-6">Registra tu moto para ver recomendaciones.</p>
                  )}
                </motion.div>
              </div>

              {/* Upcoming Appointments */}
              {appointments.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="bg-surface-secondary border border-border rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-text-tertiary" />
                    Próximas citas
                  </h3>
                  <div className="space-y-3">
                    {appointments.slice(0, 3).map((a: any, i: number) => (
                      <div key={a.id || i} className="flex items-center justify-between p-3 rounded-lg bg-surface-tertiary border border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-interactive-accent/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-interactive-accent" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">{a.service || a.service_type || "Cita programada"}</p>
                            <p className="text-xs text-text-tertiary">{a.date ? new Date(a.date).toLocaleDateString("es-ES", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : ""}</p>
                          </div>
                        </div>
                        <Badge variant={a.status === "confirmed" ? "success" : "warning"}>
                          {a.status === "confirmed" ? "Confirmada" : "Pendiente"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Quick Actions */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <h3 className="text-sm font-bold text-text-primary mb-4">Acciones rápidas</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Link to="/agendar-cita"
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-secondary border border-border hover:border-interactive-accent/30 hover:bg-surface-tertiary/30 transition-all text-center">
                    <Calendar className="w-6 h-6 text-interactive-accent" />
                    <span className="text-xs font-semibold text-text-primary">Agendar servicio</span>
                  </Link>
                  <Link to="/estado-servicio"
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-secondary border border-border hover:border-interactive-accent/30 hover:bg-surface-tertiary/30 transition-all text-center">
                    <Clock className="w-6 h-6 text-interactive-accent" />
                    <span className="text-xs font-semibold text-text-primary">Consultar estado</span>
                  </Link>
                  <Link to="/tienda"
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-secondary border border-border hover:border-interactive-accent/30 hover:bg-surface-tertiary/30 transition-all text-center">
                    <Bike className="w-6 h-6 text-interactive-accent" />
                    <span className="text-xs font-semibold text-text-primary">Repuestos compatibles</span>
                  </Link>
                  <Link to="/mi-cuenta?tab=garantias"
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-secondary border border-border hover:border-interactive-accent/30 hover:bg-surface-tertiary/30 transition-all text-center">
                    <Shield className="w-6 h-6 text-interactive-accent" />
                    <span className="text-xs font-semibold text-text-primary">Mis garantías</span>
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
