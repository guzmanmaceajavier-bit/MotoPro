import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import { Users, Plus, Pencil, Trash2, Loader2, Clock } from "lucide-react";
import Modal from "@/components/Modal";

interface Mechanic {
  id: string;
  name: string;
  role: string;
  specialty: string;
  experience: string;
  description: string;
  image?: string;
  availability: Record<string, { active: boolean; start: string; end: string }>;
  created_at: string;
}

const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const DAY_LABELS: Record<string, string> = {
  monday: "Lunes", tuesday: "Martes", wednesday: "Miércoles", thursday: "Jueves", friday: "Viernes", saturday: "Sábado",
};

const defaultAvailability = () => ({
  monday: { active: true, start: "08:00", end: "18:00" },
  tuesday: { active: true, start: "08:00", end: "18:00" },
  wednesday: { active: true, start: "08:00", end: "18:00" },
  thursday: { active: true, start: "08:00", end: "18:00" },
  friday: { active: true, start: "08:00", end: "18:00" },
  saturday: { active: false, start: "08:00", end: "14:00" },
});

export default function MechanicsPage() {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "", role: "", specialty: "", experience: "", description: "", image: "",
    availability: defaultAvailability(),
  });

  const fetchData = () => {
    setLoading(true);
    api.get("/mechanics").then((r) => {
      const list = (r || []).map((m: Mechanic) => ({
        ...m,
        availability: typeof m.availability === "string" ? JSON.parse(m.availability) : (m.availability || defaultAvailability()),
      }));
      setMechanics(list);
    }).catch(() => showToast("error", "Error al cargar mecánicos"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ name: "", role: "", specialty: "", experience: "", description: "", image: "", availability: defaultAvailability() });
    setEditId(null);
  };

  const openEdit = (m: Mechanic) => {
    setEditId(m.id);
    setForm({
      name: m.name, role: m.role, specialty: m.specialty, experience: m.experience,
      description: m.description, image: m.image || "",
      availability: m.availability || defaultAvailability(),
    });
    setShowModal(true);
  };

  const openCreate = () => { resetForm(); setShowModal(true); };

  const handleSave = async () => {
    try {
      const payload = { ...form, availability: form.availability };
      if (editId) {
        await api.put(`/mechanics/${editId}`, payload);
        showToast("success", "Mecánico actualizado");
      } else {
        await api.post("/mechanics", payload);
        showToast("success", "Mecánico creado");
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Error al guardar");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/mechanics/${id}`);
      showToast("success", "Mecánico eliminado");
      setDeleteConfirm(null);
      fetchData();
    } catch {
      showToast("error", "Error al eliminar");
    }
  };

  const toggleDay = (day: string) => {
    setForm((f) => ({
      ...f,
      availability: {
        ...f.availability,
        [day]: { ...f.availability[day], active: !f.availability[day]?.active },
      },
    }));
  };

  const updateDayTime = (day: string, field: "start" | "end", value: string) => {
    setForm((f) => ({
      ...f,
      availability: {
        ...f.availability,
        [day]: { ...f.availability[day], [field]: value },
      },
    }));
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
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(20,184,166,0.1)] text-[var(--mp-accent)]">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--mp-text-primary)]">Mecánicos</h1>
            <p className="text-sm text-[var(--mp-text-tertiary)]">Gestión del equipo de trabajo</p>
          </div>
        </div>
        <button onClick={openCreate} className="mp-btn-primary text-sm inline-flex items-center gap-1.5">
          <Plus size={15} /> Añadir mecánico
        </button>
      </div>

      {mechanics.length === 0 ? (
        <div className="mp-card p-12 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-[rgba(20,184,166,0.1)] text-[var(--mp-accent)]">
            <Users size={28} />
          </div>
          <h3 className="text-lg font-semibold text-[var(--mp-text-primary)] mb-1">Sin mecánicos registrados</h3>
          <p className="text-sm text-[var(--mp-text-tertiary)] mb-6 max-w-sm">
            Agrega a los miembros de tu equipo para asignarlos a órdenes de trabajo y citas.
          </p>
          <button onClick={openCreate} className="mp-btn-primary text-sm inline-flex items-center gap-1.5">
            <Plus size={15} /> Añadir mecánico
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {mechanics.map((m) => (
            <div key={m.id} className="mp-card p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--mp-accent)]/20 to-[var(--mp-accent)]/5 text-[var(--mp-accent)] font-bold text-lg shrink-0 overflow-hidden">
                  {m.image ? (
                    <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    m.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[var(--mp-text-primary)] truncate">{m.name}</h3>
                  {m.role && <p className="text-xs text-[var(--mp-text-tertiary)]">{m.role}</p>}
                  {m.specialty && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[rgba(20,184,166,0.1)] text-[var(--mp-accent)]">
                      {m.specialty}
                    </span>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-[var(--mp-bg-hover)] text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)]">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setDeleteConfirm(m.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--mp-text-tertiary)] hover:text-red-400">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {m.experience && (
                <p className="text-xs text-[var(--mp-text-secondary)] mb-2">{m.experience}</p>
              )}

              <div className="p-3 rounded-xl bg-[var(--mp-bg-elevated)]">
                <div className="flex items-center gap-1.5 mb-2 text-[11px] font-medium text-[var(--mp-text-tertiary)]">
                  <Clock size={11} /> Disponibilidad
                </div>
                <div className="space-y-1">
                  {Object.entries(m.availability || {}).map(([day, info]) => {
                    const d = info as { active: boolean; start: string; end: string };
                    return (
                      <div key={day} className="flex items-center justify-between text-[11px]">
                        <span className="text-[var(--mp-text-secondary)]">{DAY_LABELS[day] || day}</span>
                        <span className={d?.active ? "text-[var(--mp-text-primary)]" : "text-[var(--mp-text-tertiary)]"}>
                          {d?.active ? `${d.start} - ${d.end}` : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editId ? "Editar mecánico" : "Nuevo mecánico"} size="lg">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Nombre *</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mp-input text-sm w-full" placeholder="Nombre completo" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Rol</label>
              <input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="mp-input text-sm w-full" placeholder="Ej: Mecánico líder" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Especialidad</label>
              <input value={form.specialty} onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
                className="mp-input text-sm w-full" placeholder="Ej: Motores 4T" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Experiencia</label>
              <input value={form.experience} onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
                className="mp-input text-sm w-full" placeholder="Ej: 10 años" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Descripción</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mp-input text-sm w-full resize-none" rows={2} placeholder="Breve descripción" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">URL de imagen</label>
            <input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              className="mp-input text-sm w-full" placeholder="https://..." />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-[var(--mp-text-tertiary)]" />
              <span className="text-sm font-semibold text-[var(--mp-text-primary)]">Disponibilidad</span>
            </div>
            <div className="space-y-2">
              {DAYS_OF_WEEK.map((day) => {
                const d = form.availability[day] || { active: false, start: "08:00", end: "18:00" };
                return (
                  <div key={day} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--mp-bg-elevated)]">
                    <button onClick={() => toggleDay(day)} type="button"
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        d.active ? "bg-[var(--mp-accent)] border-[var(--mp-accent)]" : "border-white/20"
                      }`}
                    >
                      {d.active && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                    </button>
                    <span className={`text-sm w-20 font-medium ${d.active ? "text-[var(--mp-text-primary)]" : "text-[var(--mp-text-tertiary)]"}`}>
                      {DAY_LABELS[day]}
                    </span>
                    {d.active && (
                      <div className="flex items-center gap-2 ml-auto">
                        <input type="time" value={d.start}
                          onChange={(e) => updateDayTime(day, "start", e.target.value)}
                          className="mp-input text-xs w-24" />
                        <span className="text-xs text-[var(--mp-text-tertiary)]">a</span>
                        <input type="time" value={d.end}
                          onChange={(e) => updateDayTime(day, "end", e.target.value)}
                          className="mp-input text-xs w-24" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => { setShowModal(false); resetForm(); }}
              className="px-4 py-2 rounded-lg text-sm text-[var(--mp-text-secondary)] hover:bg-[var(--mp-bg-hover)]">
              Cancelar
            </button>
            <button onClick={handleSave} className="mp-btn-primary text-sm">
              {editId ? "Guardar cambios" : "Crear mecánico"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar eliminación" size="sm">
        <p className="text-sm text-[var(--mp-text-secondary)] mb-6">¿Estás seguro de eliminar este mecánico? Esta acción no se puede deshacer.</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-lg text-sm text-[var(--mp-text-secondary)] hover:bg-[var(--mp-bg-hover)]">
            Cancelar
          </button>
          <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            className="px-4 py-2 rounded-lg text-sm text-white bg-red-500 hover:bg-red-600">
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  );
}
