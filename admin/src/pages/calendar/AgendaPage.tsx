import { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import {
  Calendar, ChevronLeft, ChevronRight, Plus, Clock, Users, Settings,
  Trash2, Edit, Ban,
} from "lucide-react";
import Modal from "@/components/Modal";

interface Apt {
  id: string; customer_name: string; customer_phone: string; customer_email: string;
  service_type: string; mechanic_id: string; mechanic_name?: string;
  appointment_date: string; start_time: string; end_time: string;
  status: string; notes?: string;
}
interface Mech { id: string; name: string; specialty?: string; }
interface Holiday { id: string; date: string; name: string; type: string; applies_to: string; mechanic_id?: string; }
interface SchedConfig {
  working_hours_start: string; working_hours_end: string; break_start: string; break_end: string;
  appointment_interval_minutes: string; daily_capacity: string; service_durations: string;
}

const SC: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400", confirmed: "bg-blue-500/15 text-blue-400",
  in_progress: "bg-teal-500/15 text-teal-400", completed: "bg-emerald-500/15 text-emerald-400",
  cancelled: "bg-red-500/15 text-red-400",
};
const SL: Record<string, string> = {
  pending: "Pendiente", confirmed: "Confirmada", in_progress: "En Progreso",
  completed: "Completada", cancelled: "Cancelada",
};
const DN = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
const MN = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export default function AgendaPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [curDate, setCurDate] = useState(new Date());
  const [selDate, setSelDate] = useState(new Date().toISOString().split("T")[0]);
  const [appts, setAppts] = useState<Record<string, Apt[]>>({});
  const [hols, setHols] = useState<Record<string, Holiday[]>>({});
  const [caps, setCaps] = useState<Record<string, number>>({});
  const [mechs, setMechs] = useState<Mech[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [showHolModal, setShowHolModal] = useState(false);
  const [showAptModal, setShowAptModal] = useState(false);
  const [editApt, setEditApt] = useState<Apt | null>(null);
  const [cfg, setCfg] = useState<SchedConfig>({
    working_hours_start: "09:00", working_hours_end: "18:00", break_start: "12:00", break_end: "13:00",
    appointment_interval_minutes: "60", daily_capacity: "10", service_durations: "{}",
  });
  const [holForm, setHolForm] = useState({ date: "", name: "", type: "holiday", applies_to: "all", mechanic_id: "" });
  const [aptForm, setAptForm] = useState({
    customer_name: "", customer_phone: "", customer_email: "", service_type: "",
    mechanic_id: "", appointment_date: "", start_time: "", notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const yr = curDate.getFullYear();
  const mo = curDate.getMonth();

  const loadData = useCallback(async () => {
    try {
      const sd = `${yr}-${String(mo + 1).padStart(2, "0")}-01`;
      const ld = new Date(yr, mo + 1, 0).getDate();
      const ed = `${yr}-${String(mo + 1).padStart(2, "0")}-${String(ld).padStart(2, "0")}`;
      const [cal, mec, c] = await Promise.all([
        api.get(`/appointments/calendar?start_date=${sd}&end_date=${ed}`),
        api.get("/mechanics"),
        api.get("/appointments/schedule-config"),
      ]);
      setAppts(cal.appointments || {});
      setHols(cal.holidays || {});
      setCaps(cal.capacity || {});
      setMechs(Array.isArray(mec) ? mec : []);
      if (c) setCfg(c);
    } catch { showToast({ type: "error", message: "Error al cargar agenda" }); }
    finally { setLoading(false); }
  }, [yr, mo]);

  useEffect(() => { loadData(); }, [loadData]);

  const calDays = useMemo(() => {
    const fd = new Date(yr, mo, 1).getDay();
    const dl = new Date(yr, mo + 1, 0).getDate();
    const d: (number | null)[] = [];
    for (let i = 0; i < fd; i++) d.push(null);
    for (let i = 1; i <= dl; i++) d.push(i);
    return d;
  }, [yr, mo]);

  const dayData = useMemo(() => {
    const a = appts[selDate] || [];
    const h = hols[selDate] || [];
    const cap = parseInt(cfg.daily_capacity) || 10;
    const used = caps[selDate] || a.length;
    return { appointments: a, holidays: h, capacity: { total: cap, used, remaining: Math.max(0, cap - used) } };
  }, [selDate, appts, hols, caps, cfg]);

  const saveHol = async () => {
    if (!holForm.date || !holForm.name) { showToast({ type: "error", message: "Fecha y nombre requeridos" }); return; }
    setSubmitting(true);
    try { await api.post("/holidays", holForm); showToast({ type: "success", message: "Evento creado" }); setShowHolModal(false); setHolForm({ date: "", name: "", type: "holiday", applies_to: "all", mechanic_id: "" }); loadData(); }
    catch (e: any) { showToast({ type: "error", message: e.message || "Error" }); }
    finally { setSubmitting(false); }
  };

  const delHol = async (id: string) => {
    if (!confirm("Eliminar este evento?")) return;
    try { await api.delete(`/holidays/${id}`); showToast({ type: "success", message: "Eliminado" }); loadData(); }
    catch { showToast({ type: "error", message: "Error" }); }
  };

  const saveApt = async () => {
    if (!aptForm.customer_name || !aptForm.customer_phone || !aptForm.appointment_date || !aptForm.start_time) {
      showToast({ type: "error", message: "Nombre, telefono, fecha y hora requeridos" }); return;
    }
    setSubmitting(true);
    try {
      if (editApt) { await api.put(`/appointments/${editApt.id}`, aptForm); showToast({ type: "success", message: "Cita actualizada" }); }
      else { await api.post("/appointments", aptForm); showToast({ type: "success", message: "Cita creada" }); }
      setShowAptModal(false); setEditApt(null);
      setAptForm({ customer_name: "", customer_phone: "", customer_email: "", service_type: "", mechanic_id: "", appointment_date: "", start_time: "", notes: "" });
      loadData();
    } catch (e: any) { showToast({ type: "error", message: e.message || "Error" }); }
    finally { setSubmitting(false); }
  };

  const delApt = async (id: string) => {
    if (!confirm("Eliminar esta cita?")) return;
    try { await api.delete(`/appointments/${id}`); showToast({ type: "success", message: "Eliminada" }); loadData(); }
    catch { showToast({ type: "error", message: "Error" }); }
  };

  const updateStatus = async (id: string, status: string) => {
    try { await api.put(`/appointments/${id}`, { status }); showToast({ type: "success", message: "Estado actualizado" }); loadData(); }
    catch { showToast({ type: "error", message: "Error" }); }
  };

  const openEdit = (a: Apt) => {
    setEditApt(a);
    setAptForm({ customer_name: a.customer_name, customer_phone: a.customer_phone, customer_email: a.customer_email || "", service_type: a.service_type || "", mechanic_id: a.mechanic_id || "", appointment_date: a.appointment_date, start_time: a.start_time, notes: a.notes || "" });
    setShowAptModal(true);
  };

  const openNew = () => {
    setEditApt(null);
    setAptForm({ customer_name: "", customer_phone: "", customer_email: "", service_type: "", mechanic_id: "", appointment_date: selDate, start_time: "", notes: "" });
    setShowAptModal(true);
  };

  const capColor = (u: number, t: number) => {
    const p = t > 0 ? u / t : 0;
    return p >= 1 ? "text-red-400 bg-red-500/15" : p >= 0.7 ? "text-amber-400 bg-amber-500/15" : "text-emerald-400 bg-emerald-500/15";
  };

  if (loading) return (
    <div className="space-y-6 animate-fade-in">
      <div className="skeleton h-12 w-64 rounded-lg" />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 skeleton h-96 rounded-xl" />
        <div className="skeleton h-96 rounded-xl" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-h2 font-bold text-text-primary tracking-tight flex items-center gap-3">
            <Calendar size={24} className="text-teal-400" /> Agenda Inteligente
          </h1>
          <p className="text-body-sm text-text-tertiary mt-1">Citas, horarios y disponibilidad</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowHolModal(true)} className="mp-btn mp-btn-secondary text-sm gap-2"><Ban size={14} /> Festivos</button>
          <button onClick={() => setShowConfig(true)} className="mp-btn mp-btn-secondary text-sm gap-2"><Settings size={14} /> Configurar</button>
          <button onClick={openNew} className="mp-btn mp-btn-primary text-sm gap-2"><Plus size={14} /> Nueva Cita</button>
        </div>
      </div>

      {/* Capacity bar */}
      <div className="flex items-center gap-4 px-5 py-3 rounded-xl border border-border bg-surface-secondary">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-teal-400" />
          <span className="text-sm text-text-secondary">Capacidad hoy:</span>
        </div>
        <div className="flex-1 h-2 rounded-full bg-surface-tertiary overflow-hidden max-w-xs">
          <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all"
            style={{ width: `${dayData.capacity.total > 0 ? (dayData.capacity.used / dayData.capacity.total) * 100 : 0}%` }} />
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${capColor(dayData.capacity.used, dayData.capacity.total)}`}>
          {dayData.capacity.used}/{dayData.capacity.total}
        </span>
        <span className="text-xs text-text-tertiary ml-auto">
          Horario: {cfg.working_hours_start} - {cfg.working_hours_end} | Descanso: {cfg.break_start}-{cfg.break_end}
        </span>
      </div>

      {/* Main grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Calendar */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface-secondary overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <button onClick={() => setCurDate(new Date(yr, mo - 1))} className="p-1.5 rounded-lg hover:bg-surface-tertiary transition-colors"><ChevronLeft size={18} className="text-text-secondary" /></button>
            <h2 className="text-caption font-semibold text-text-primary tracking-wide">{MN[mo]} {yr}</h2>
            <button onClick={() => setCurDate(new Date(yr, mo + 1))} className="p-1.5 rounded-lg hover:bg-surface-tertiary transition-colors"><ChevronRight size={18} className="text-text-secondary" /></button>
          </div>
          <div className="grid grid-cols-7 gap-px bg-border-subtle">
            {DN.map(d => <div key={d} className="bg-surface-secondary px-2 py-2 text-center text-[10px] font-semibold text-text-tertiary uppercase">{d}</div>)}
            {calDays.map((day, i) => {
              if (day === null) return <div key={`e${i}`} className="bg-surface-primary min-h-20" />;
              const ds = `${yr}-${String(mo + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const da = appts[ds] || [];
              const dh = hols[ds] || [];
              const dc = caps[ds] || 0;
              const tc = parseInt(cfg.daily_capacity) || 10;
              const isSel = ds === selDate;
              const isT = ds === new Date().toISOString().split("T")[0];
              const isF = dc >= tc;
              const isH = dh.length > 0;
              return (
                <div key={ds} onClick={() => setSelDate(ds)}
                  className={`bg-surface-primary min-h-20 px-2 py-1.5 cursor-pointer transition-colors relative ${isSel ? "ring-2 ring-teal-400/50 bg-teal-500/5" : "hover:bg-surface-secondary/50"} ${isH ? "bg-red-500/5" : ""}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${isT ? "w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center" : isH ? "text-red-400" : "text-text-secondary"}`}>{day}</span>
                    {isF && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                  </div>
                  {isH && <div className="text-[9px] text-red-400 font-medium truncate mb-0.5">{dh[0].name}</div>}
                  {da.slice(0, 3).map(a => (
                    <div key={a.id} onClick={e => { e.stopPropagation(); openEdit(a); }}
                      className={`text-[9px] px-1 py-0.5 rounded mb-0.5 truncate font-medium ${SC[a.status] || "bg-surface-tertiary text-text-secondary"}`}>
                      {a.start_time} {a.customer_name?.split(" ")[0]}
                    </div>
                  ))}
                  {da.length > 3 && <div className="text-[8px] text-text-tertiary">+{da.length - 3} mas</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface-secondary overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <h2 className="text-caption font-semibold text-text-primary">
                {new Date(selDate + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
              </h2>
              <button onClick={openNew} className="p-1.5 rounded-lg hover:bg-surface-tertiary text-teal-400 transition-colors"><Plus size={16} /></button>
            </div>
            <div className="px-5 py-3 border-b border-border-subtle">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-tertiary">Cupos del dia</span>
                <span className={`text-xs font-semibold ${dayData.capacity.remaining === 0 ? "text-red-400" : "text-emerald-400"}`}>{dayData.capacity.remaining} disponibles</span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: dayData.capacity.total }).map((_, i) => (
                  <div key={i} className={`h-2 flex-1 rounded-full ${i < dayData.capacity.used ? "bg-teal-500" : "bg-surface-tertiary"}`} />
                ))}
              </div>
            </div>
            {dayData.holidays.length > 0 && (
              <div className="mx-5 mt-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                <Ban size={14} className="text-red-400 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-red-400">{dayData.holidays[0].name}</p>
                  <p className="text-[10px] text-red-400/70">Dia bloqueado</p>
                </div>
              </div>
            )}
            <div className="divide-y divide-border-subtle max-h-96 overflow-y-auto">
              {dayData.appointments.length > 0 ? dayData.appointments.map(a => (
                <div key={a.id} className="px-5 py-3 hover:bg-surface-tertiary/50 transition-colors group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text-primary">{a.customer_name}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(a)} className="p-1 rounded hover:bg-surface-secondary text-text-tertiary hover:text-text-primary"><Edit size={12} /></button>
                      <button onClick={() => delApt(a.id)} className="p-1 rounded hover:bg-red-500/10 text-text-tertiary hover:text-red-400"><Trash2 size={12} /></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-tertiary">
                    <span className="flex items-center gap-1"><Clock size={10} /> {a.start_time} - {a.end_time}</span>
                    {a.mechanic_name && <span className="flex items-center gap-1"><Users size={10} /> {a.mechanic_name}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${SC[a.status]}`}>{SL[a.status]}</span>
                    {a.service_type && <span className="text-[10px] text-text-tertiary">{a.service_type}</span>}
                  </div>
                  <div className="flex gap-1 mt-2">
                    {a.status === "pending" && <button onClick={() => updateStatus(a.id, "confirmed")} className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">Confirmar</button>}
                    {a.status === "confirmed" && <button onClick={() => updateStatus(a.id, "in_progress")} className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 hover:bg-teal-500/20">Iniciar</button>}
                    {a.status === "in_progress" && <button onClick={() => updateStatus(a.id, "completed")} className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">Completar</button>}
                    {a.status !== "cancelled" && a.status !== "completed" && <button onClick={() => updateStatus(a.id, "cancelled")} className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20">Cancelar</button>}
                  </div>
                </div>
              )) : <div className="px-5 py-8 text-center text-sm text-text-tertiary">{dayData.holidays.length > 0 ? "Dia bloqueado" : "No hay citas"}</div>}
            </div>
          </div>

          {/* Mechanics */}
          <div className="rounded-xl border border-border bg-surface-secondary overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border"><h2 className="text-caption font-semibold text-text-primary tracking-wide">Mecanicos</h2></div>
            <div className="p-3 space-y-1">
              {mechs.map(m => {
                const ma = dayData.appointments.filter(a => a.mechanic_id === m.id);
                return (
                  <div key={m.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-tertiary transition-colors">
                    <div className="w-7 h-7 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 text-[10px] font-bold">{m.name?.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-primary font-medium truncate">{m.name}</p>
                      <p className="text-[10px] text-text-tertiary">{ma.length} cita{ma.length !== 1 ? "s" : ""}</p>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${ma.length > 0 ? "bg-orange-500/15 text-orange-400" : "bg-emerald-500/15 text-emerald-400"}`}>{ma.length > 0 ? "Ocupado" : "Libre"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Config Modal */}
      <Modal open={showConfig} onClose={() => setShowConfig(false)} title="Configuracion de Agenda" size="lg">
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Hora inicio</label><input type="time" value={cfg.working_hours_start} onChange={e => setCfg({ ...cfg, working_hours_start: e.target.value })} className="mp-input w-full" /></div>
            <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Hora fin</label><input type="time" value={cfg.working_hours_end} onChange={e => setCfg({ ...cfg, working_hours_end: e.target.value })} className="mp-input w-full" /></div>
            <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Descanso inicio</label><input type="time" value={cfg.break_start} onChange={e => setCfg({ ...cfg, break_start: e.target.value })} className="mp-input w-full" /></div>
            <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Descanso fin</label><input type="time" value={cfg.break_end} onChange={e => setCfg({ ...cfg, break_end: e.target.value })} className="mp-input w-full" /></div>
            <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Intervalo (min)</label><input type="number" value={cfg.appointment_interval_minutes} onChange={e => setCfg({ ...cfg, appointment_interval_minutes: e.target.value })} className="mp-input w-full" min="15" max="240" /></div>
            <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Capacidad diaria</label><input type="number" value={cfg.daily_capacity} onChange={e => setCfg({ ...cfg, daily_capacity: e.target.value })} className="mp-input w-full" min="1" max="100" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button onClick={() => setShowConfig(false)} className="mp-btn mp-btn-ghost text-sm">Cancelar</button>
            <button onClick={async () => {
              try { await api.put("/appointments/schedule-config", cfg); showToast({ type: "success", message: "Configuracion guardada" }); setShowConfig(false); loadData(); }
              catch { showToast({ type: "error", message: "Error al guardar" }); }
            }} className="mp-btn mp-btn-primary text-sm">Guardar</button>
          </div>
        </div>
      </Modal>

      {/* Holiday Modal */}
      <Modal open={showHolModal} onClose={() => setShowHolModal(false)} title="Agregar Festivo / Dia Bloqueado" size="md">
        <div className="p-5 space-y-4">
          <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Fecha</label><input type="date" value={holForm.date} onChange={e => setHolForm({ ...holForm, date: e.target.value })} className="mp-input w-full" /></div>
          <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Nombre</label><input type="text" value={holForm.name} onChange={e => setHolForm({ ...holForm, name: e.target.value })} className="mp-input w-full" placeholder="Ej: Dia de la Independencia" /></div>
          <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Tipo</label>
            <select value={holForm.type} onChange={e => setHolForm({ ...holForm, type: e.target.value })} className="mp-select w-full">
              <option value="holiday">Festivo</option><option value="blocked">Bloqueado</option><option value="maintenance">Mantenimiento</option>
            </select>
          </div>
          <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Aplica a</label>
            <select value={holForm.applies_to} onChange={e => setHolForm({ ...holForm, applies_to: e.target.value })} className="mp-select w-full">
              <option value="all">Todos los mecanicos</option><option value="mechanic">Mecanico especifico</option>
            </select>
          </div>
          {holForm.applies_to === "mechanic" && (
            <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Mecanico</label>
              <select value={holForm.mechanic_id} onChange={e => setHolForm({ ...holForm, mechanic_id: e.target.value })} className="mp-select w-full">
                <option value="">Seleccionar...</option>{mechs.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          )}
          {/* Existing holidays list */}
          <div className="pt-3 border-t border-border">
            <p className="text-xs font-medium text-text-secondary mb-2">Festivos existentes este mes:</p>
            {Object.entries(hols).filter(([d]) => d.startsWith(`${yr}-${String(mo + 1).padStart(2, "0")}`)).flatMap(([d, hs]) => hs.map(h => (
              <div key={h.id} className="flex items-center justify-between py-1.5 text-xs">
                <span className="text-text-secondary">{d} - <span className="text-text-primary">{h.name}</span></span>
                <button onClick={() => delHol(h.id)} className="p-1 rounded hover:bg-red-500/10 text-text-tertiary hover:text-red-400"><Trash2 size={11} /></button>
              </div>
            )))}
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button onClick={() => setShowHolModal(false)} className="mp-btn mp-btn-ghost text-sm">Cancelar</button>
            <button onClick={saveHol} disabled={submitting} className="mp-btn mp-btn-primary text-sm">{submitting ? "Guardando..." : "Crear"}</button>
          </div>
        </div>
      </Modal>

      {/* Appointment Modal */}
      <Modal open={showAptModal} onClose={() => setShowAptModal(false)} title={editApt ? "Editar Cita" : "Nueva Cita"} size="lg">
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Nombre *</label><input type="text" value={aptForm.customer_name} onChange={e => setAptForm({ ...aptForm, customer_name: e.target.value })} className="mp-input w-full" /></div>
            <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Telefono *</label><input type="tel" value={aptForm.customer_phone} onChange={e => setAptForm({ ...aptForm, customer_phone: e.target.value })} className="mp-input w-full" /></div>
            <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Email</label><input type="email" value={aptForm.customer_email} onChange={e => setAptForm({ ...aptForm, customer_email: e.target.value })} className="mp-input w-full" /></div>
            <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Servicio</label><input type="text" value={aptForm.service_type} onChange={e => setAptForm({ ...aptForm, service_type: e.target.value })} className="mp-input w-full" placeholder="Ej: Cambio de aceite" /></div>
            <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Fecha *</label><input type="date" value={aptForm.appointment_date} onChange={e => setAptForm({ ...aptForm, appointment_date: e.target.value })} className="mp-input w-full" /></div>
            <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Hora *</label><input type="time" value={aptForm.start_time} onChange={e => setAptForm({ ...aptForm, start_time: e.target.value })} className="mp-input w-full" /></div>
            <div className="col-span-2"><label className="block text-xs font-medium text-text-secondary mb-1.5">Mecanico</label>
              <select value={aptForm.mechanic_id} onChange={e => setAptForm({ ...aptForm, mechanic_id: e.target.value })} className="mp-select w-full">
                <option value="">Sin asignar</option>{mechs.map(m => <option key={m.id} value={m.id}>{m.name} - {m.specialty || "General"}</option>)}
              </select>
            </div>
            <div className="col-span-2"><label className="block text-xs font-medium text-text-secondary mb-1.5">Notas</label><textarea value={aptForm.notes} onChange={e => setAptForm({ ...aptForm, notes: e.target.value })} className="mp-input w-full" rows={2} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button onClick={() => setShowAptModal(false)} className="mp-btn mp-btn-ghost text-sm">Cancelar</button>
            <button onClick={saveApt} disabled={submitting} className="mp-btn mp-btn-primary text-sm">{submitting ? "Guardando..." : editApt ? "Actualizar" : "Crear"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
