import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Calendar, Plus, Clock, CheckCircle, XCircle, AlertTriangle, ChevronDown } from "lucide-react";

interface Appointment {
  id: string; service_type: string; vehicle_description?: string; appointment_date: string;
  notes?: string; status: string; created_at: string;
}

const statusMeta: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending:    { label: "Pendiente",   color: "#F59E0B", bg: "rgba(245,158,11,0.1)", icon: Clock },
  confirmed:  { label: "Confirmada",  color: "#3B82F6", bg: "rgba(59,130,246,0.1)", icon: CheckCircle },
  in_progress:{ label: "En curso",    color: "#8B5CF6", bg: "rgba(139,92,246,0.1)", icon: AlertTriangle },
  completed:  { label: "Completada",  color: "#22C55E", bg: "rgba(34,197,94,0.1)", icon: CheckCircle },
  cancelled:  { label: "Cancelada",   color: "#EF4444", bg: "rgba(239,68,68,0.1)", icon: XCircle },
};

const serviceTypes = [
  "Mantenimiento preventivo", "Cambio de aceite", "Revisión general",
  "Reparación de motor", "Cambio de neumáticos", "Alineación y balanceo",
  "Servicio de frenos", "Reparación de transmisión", "Diagnóstico electrónico", "Otro"
];

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ service_type: "", vehicle_description: "", appointment_date: "", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/client/appointments").then((r) => {
      setAppointments(Array.isArray(r) ? r : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? appointments : appointments.filter((a) => a.status === filter);

  const createAppointment = async () => {
    if (!form.service_type || !form.appointment_date) return alert("Selecciona tipo de servicio y fecha");
    setSaving(true);
    try {
      await api.post("/client/appointments", form);
      setShowForm(false);
      setForm({ service_type: "", vehicle_description: "", appointment_date: "", notes: "" });
      const r = await api.get("/client/appointments");
      setAppointments(Array.isArray(r) ? r : []);
    } catch (err: any) { alert(err.message || "Error al agendar"); } finally { setSaving(false); }
  };

  const cancelAppointment = async (id: string) => {
    if (!confirm("¿Cancelar esta cita?")) return;
    try {
      await api.put(`/client/appointments/${id}/cancel`, {});
      setAppointments(appointments.map((a) => a.id === id ? { ...a, status: "cancelled" } : a));
    } catch (err: any) { alert(err.message || "Error al cancelar"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Mis Citas</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Agenda y gestiona tus citas en el taller</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary shadow-lg" style={{ boxShadow: "0 4px 14px rgba(13,148,136,0.3)" }} type="button">
          <Plus size={15} /> Nueva Cita
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl p-5 space-y-4" style={{ border: "1px solid var(--accent)", background: "var(--bg-card)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Agendar Nueva Cita</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Tipo de servicio *</label>
              <div className="relative">
                <select className="input pr-10 appearance-none" value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })}>
                  <option value="">Seleccionar...</option>
                  {serviceTypes.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
              </div>
            </div>
            <div>
              <label className="form-label">Vehículo</label>
              <input className="input" placeholder="Marca, modelo, placa" value={form.vehicle_description} onChange={(e) => setForm({ ...form, vehicle_description: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Fecha y hora *</label>
              <input className="input" type="datetime-local" value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Notas</label>
              <input className="input" placeholder="Detalles adicionales" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="btn btn-secondary btn-sm" type="button">Cancelar</button>
            <button onClick={createAppointment} disabled={saving} className="btn btn-primary btn-sm" type="button">
              {saving ? "Agendando..." : "Agendar Cita"}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[{ key: "all", label: "Todas" }, { key: "pending", label: "Pendientes" }, { key: "confirmed", label: "Confirmadas" }, { key: "completed", label: "Completadas" }, { key: "cancelled", label: "Canceladas" }].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-all"
            style={{
              background: filter === f.key ? "var(--accent-glow)" : "transparent",
              color: filter === f.key ? "var(--accent)" : "var(--text-secondary)",
              border: filter === f.key ? "1px solid var(--accent)" : "1px solid transparent",
            }} type="button">
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 w-full rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
          <Calendar size={48} className="mx-auto mb-4" style={{ color: "var(--text-tertiary)" }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text)" }}>Sin citas</h3>
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Agenda tu primera cita en el taller.</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary" type="button"><Plus size={15} /> Agendar Cita</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const meta = statusMeta[a.status] || { label: a.status, color: "var(--text-tertiary)", bg: "var(--bg-muted)", icon: AlertTriangle };
            const Icon = meta.icon;
            const date = new Date(a.appointment_date);
            const isPast = date < new Date();
            return (
              <div key={a.id} className="rounded-xl p-5 transition-all hover:shadow-sm" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center" style={{ background: meta.bg, color: meta.color }}>
                      <span className="text-[10px] font-bold uppercase">{date.toLocaleDateString("es-ES", { month: "short" })}</span>
                      <span className="text-base font-bold leading-none">{date.getDate()}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>{a.service_type}</h3>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{a.vehicle_description || "Sin vehículo especificado"}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium px-2.5 py-1 rounded-full" style={{ background: meta.bg, color: meta.color }}>
                      {meta.label}
                    </span>
                    {["pending", "confirmed"].includes(a.status) && (
                      <button onClick={() => cancelAppointment(a.id)} className="p-1.5 rounded-md hover:bg-red-50 transition-all" style={{ color: "#EF4444" }} title="Cancelar" type="button">
                        <XCircle size={14} />
                      </button>
                    )}
                  </div>
                </div>
                {a.notes && <p className="text-xs mt-2 pt-2 border-t" style={{ color: "var(--text-tertiary)", borderColor: "var(--border-light)" }}>{a.notes}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
