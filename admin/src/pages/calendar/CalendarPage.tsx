import { useState, useEffect, useMemo } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import { Calendar, ChevronLeft, ChevronRight, Plus, X, Filter, Clock, Users, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Modal from "@/components/Modal";

interface Appointment {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  mechanic_id: string;
  mechanic_name?: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  notes?: string;
  created_at: string;
}

interface Mechanic {
  id: string;
  name: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  in_progress: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

const STATUS_BLOCK_COLORS: Record<string, string> = {
  pending: "bg-amber-500/60",
  confirmed: "bg-blue-500/60",
  in_progress: "bg-teal-500/60",
  completed: "bg-green-500/60",
  cancelled: "bg-red-500/60",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  in_progress: "En curso",
  completed: "Completada",
  cancelled: "Cancelada",
};

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filterMechanic, setFilterMechanic] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editAppointment, setEditAppointment] = useState<Appointment | null>(null);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "", phone: "", email: "", service: "", mechanic_id: "", date: "", time: "", notes: "",
  });

  useEffect(() => {
    Promise.all([
      api.get("/appointments").then((r) => setAppointments(r || [])),
      api.get("/mechanics").then((r) => setMechanics(r || [])),
    ]).catch(() => showToast("error", "Error al cargar datos"))
      .finally(() => setLoading(false));
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split("T")[0];

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [firstDay, daysInMonth]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (filterMechanic && a.mechanic_id !== filterMechanic) return false;
      if (filterStatus && a.status !== filterStatus) return false;
      return true;
    });
  }, [appointments, filterMechanic, filterStatus]);

  const selectedDateAppts = useMemo(() => {
    if (!selectedDate) return [];
    return filteredAppointments.filter((a) => a.date === selectedDate);
  }, [filteredAppointments, selectedDate]);

  const getApptsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return filteredAppointments.filter((a) => a.date === dateStr);
  };

  const todayCount = appointments.filter((a) => a.date === today).length;
  const pendingCount = appointments.filter((a) => a.status === "pending").length;
  const completedToday = appointments.filter((a) => a.date === today && a.status === "completed").length;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const resetForm = () => {
    setForm({ name: "", phone: "", email: "", service: "", mechanic_id: "", date: selectedDate || "", time: "", notes: "" });
  };

  const handleCreate = async () => {
    try {
      await api.post("/appointments", form);
      showToast("success", "Cita creada");
      setShowCreateModal(false);
      resetForm();
      const data = await api.get("/appointments");
      setAppointments(data || []);
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Error al crear");
    }
  };

  const handleEdit = async () => {
    if (!editAppointment) return;
    try {
      await api.put(`/appointments/${editAppointment.id}`, form);
      showToast("success", "Cita actualizada");
      setEditAppointment(null);
      resetForm();
      const data = await api.get("/appointments");
      setAppointments(data || []);
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Error al actualizar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta cita?")) return;
    try {
      await api.delete(`/appointments/${id}`);
      showToast("success", "Cita eliminada");
      setEditAppointment(null);
      const data = await api.get("/appointments");
      setAppointments(data || []);
    } catch {
      showToast("error", "Error al eliminar");
    }
  };

  const openEdit = (appt: Appointment) => {
    setEditAppointment(appt);
    setForm({
      name: appt.name,
      phone: appt.phone,
      email: appt.email,
      service: appt.service,
      mechanic_id: appt.mechanic_id,
      date: appt.date,
      time: appt.time,
      notes: appt.notes || "",
    });
  };

  const openCreate = () => {
    resetForm();
    if (selectedDate) setForm((f) => ({ ...f, date: selectedDate }));
    setShowCreateModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-[var(--mp-accent)]" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(255,107,0,0.1)] text-[var(--mp-accent)]">
            <Calendar size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--mp-text-primary)]">Calendario</h1>
            <p className="text-sm text-[var(--mp-text-tertiary)]">Gestión de citas del taller</p>
          </div>
        </div>
        <button onClick={openCreate} className="mp-btn-primary text-sm inline-flex items-center gap-1.5">
          <Plus size={15} /> Nueva cita
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="mp-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-400">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-xs text-[var(--mp-text-tertiary)]">Hoy</p>
            <p className="text-xl font-bold text-[var(--mp-text-primary)]">{todayCount}</p>
          </div>
        </div>
        <div className="mp-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-400">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs text-[var(--mp-text-tertiary)]">Pendientes</p>
            <p className="text-xl font-bold text-[var(--mp-text-primary)]">{pendingCount}</p>
          </div>
        </div>
        <div className="mp-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/10 text-green-400">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-xs text-[var(--mp-text-tertiary)]">Completadas hoy</p>
            <p className="text-xl font-bold text-[var(--mp-text-primary)]">{completedToday}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mp-card">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-[var(--mp-bg-hover)] text-[var(--mp-text-tertiary)]">
                  <ChevronLeft size={16} />
                </button>
                <h2 className="text-sm font-bold text-[var(--mp-text-primary)] min-w-[160px] text-center">
                  {MONTHS[month]} {year}
                </h2>
                <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-[var(--mp-bg-hover)] text-[var(--mp-text-tertiary)]">
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <select value={filterMechanic} onChange={(e) => setFilterMechanic(e.target.value)}
                  className="mp-select text-xs py-1.5 w-32">
                  <option value="">Todos mecánicos</option>
                  {mechanics.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                  className="mp-select text-xs py-1.5 w-28">
                  <option value="">Todos estados</option>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-white/10">
              {DAYS.map((d) => (
                <div key={d} className="p-2 text-center text-[11px] font-semibold text-[var(--mp-text-tertiary)] border-r border-white/5 last:border-r-0">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                if (day === null) return <div key={`e-${idx}`} className="min-h-[80px] bg-[var(--mp-bg-surface)]/30" />;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayAppts = getApptsForDay(day);
                const isToday = dateStr === today;
                const isSelected = dateStr === selectedDate;

                return (
                  <div key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`min-h-[80px] p-1.5 border-r border-b border-white/5 cursor-pointer transition-colors hover:bg-[var(--mp-bg-hover)] ${
                      isSelected ? "bg-[rgba(255,107,0,0.08)]" : ""
                    }`}
                  >
                    <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full mb-1 ${
                      isToday ? "bg-[var(--mp-accent)] text-white" : "text-[var(--mp-text-secondary)]"
                    }`}>
                      {day}
                    </span>
                    <div className="space-y-0.5">
                      {dayAppts.slice(0, 3).map((a) => (
                        <div key={a.id}
                          className={`text-[10px] px-1 py-0.5 rounded truncate text-white ${STATUS_BLOCK_COLORS[a.status] || "bg-gray-500/60"}`}
                          title={`${a.time} - ${a.name}`}
                        >
                          {a.time} {a.name}
                        </div>
                      ))}
                      {dayAppts.length > 3 && (
                        <div className="text-[10px] text-[var(--mp-text-tertiary)] px-1">+{dayAppts.length - 3} más</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="mp-card p-4">
            <h3 className="text-sm font-bold text-[var(--mp-text-primary)] mb-3">
              {selectedDate
                ? new Date(selectedDate + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })
                : "Selecciona un día"}
            </h3>

            {!selectedDate && (
              <div className="flex flex-col items-center py-10 text-center">
                <Calendar size={32} className="text-[var(--mp-text-tertiary)] mb-2" />
                <p className="text-sm text-[var(--mp-text-tertiary)]">Haz clic en un día del calendario</p>
              </div>
            )}

            {selectedDate && selectedDateAppts.length === 0 && (
              <div className="flex flex-col items-center py-8 text-center">
                <AlertCircle size={24} className="text-[var(--mp-text-tertiary)] mb-2" />
                <p className="text-sm text-[var(--mp-text-tertiary)] mb-3">Sin citas este día</p>
                <button onClick={openCreate} className="text-xs text-[var(--mp-accent)] hover:underline">Agendar cita</button>
              </div>
            )}

            {selectedDate && selectedDateAppts.length > 0 && (
              <div className="space-y-2">
                {selectedDateAppts.map((a) => (
                  <div key={a.id} onClick={() => openEdit(a)}
                    className="p-3 rounded-xl bg-[var(--mp-bg-elevated)] cursor-pointer hover:bg-[var(--mp-bg-hover)] transition-colors border border-white/5"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-[var(--mp-text-primary)]">{a.time}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${STATUS_COLORS[a.status] || ""}`}>
                        {STATUS_LABELS[a.status] || a.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[var(--mp-text-primary)]">{a.name}</p>
                    <p className="text-[11px] text-[var(--mp-text-tertiary)]">
                      {a.service}{a.mechanic_name ? ` · ${a.mechanic_name}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nueva cita" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Nombre *</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mp-input text-sm w-full" placeholder="Nombre del cliente" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Teléfono</label>
              <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="mp-input text-sm w-full" placeholder="+52 555 123 4567" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Email</label>
            <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="mp-input text-sm w-full" placeholder="cliente@email.com" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Servicio *</label>
            <input value={form.service} onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
              className="mp-input text-sm w-full" placeholder="Ej: Mantenimiento general" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Mecánico</label>
              <select value={form.mechanic_id} onChange={(e) => setForm((f) => ({ ...f, mechanic_id: e.target.value }))}
                className="mp-select text-sm w-full">
                <option value="">Sin asignar</option>
                {mechanics.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Fecha *</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="mp-input text-sm w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Hora *</label>
              <input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                className="mp-input text-sm w-full" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Notas</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="mp-input text-sm w-full resize-none" rows={2} placeholder="Notas opcionales" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-lg text-sm text-[var(--mp-text-secondary)] hover:bg-[var(--mp-bg-hover)]">
              Cancelar
            </button>
            <button onClick={handleCreate} className="mp-btn-primary text-sm">Crear cita</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!editAppointment} onClose={() => setEditAppointment(null)} title="Editar cita" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Nombre *</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mp-input text-sm w-full" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Teléfono</label>
              <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="mp-input text-sm w-full" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Email</label>
            <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="mp-input text-sm w-full" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Servicio *</label>
            <input value={form.service} onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
              className="mp-input text-sm w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Mecánico</label>
              <select value={form.mechanic_id} onChange={(e) => setForm((f) => ({ ...f, mechanic_id: e.target.value }))}
                className="mp-select text-sm w-full">
                <option value="">Sin asignar</option>
                {mechanics.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Fecha *</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="mp-input text-sm w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Hora *</label>
              <input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                className="mp-input text-sm w-full" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Estado</label>
              <select value={editAppointment?.status || "pending"}
                onChange={(e) => setEditAppointment((prev) => prev ? { ...prev, status: e.target.value as Appointment["status"] } : null)}
                className="mp-select text-sm w-full">
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Notas</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="mp-input text-sm w-full resize-none" rows={2} />
          </div>
          <div className="flex justify-between gap-2 pt-2">
            <button onClick={() => editAppointment && handleDelete(editAppointment.id)}
              className="px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10">
              Eliminar
            </button>
            <div className="flex gap-2">
              <button onClick={() => setEditAppointment(null)} className="px-4 py-2 rounded-lg text-sm text-[var(--mp-text-secondary)] hover:bg-[var(--mp-bg-hover)]">
                Cancelar
              </button>
              <button onClick={handleEdit} className="mp-btn-primary text-sm">Guardar cambios</button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
