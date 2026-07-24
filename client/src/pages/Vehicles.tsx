import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Link } from "react-router-dom";
import { Car, Plus, Bike, Pencil, Trash2, Calendar, Hash, Gauge } from "lucide-react";

interface Vehicle {
  id: string; brand: string; model: string; year: number; plate: string;
  vin?: string; color?: string; notes?: string; mileage?: number;
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ brand: "", model: "", year: "", plate: "", vin: "", color: "", notes: "", mileage: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/client/vehicles").then((r) => {
      const d = Array.isArray(r) ? r : r?.data || [];
      setVehicles(d);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const startEdit = (v: Vehicle) => {
    setEditing(v.id);
    setForm({ brand: v.brand, model: v.model, year: String(v.year), plate: v.plate, vin: v.vin || "", color: v.color || "", notes: v.notes || "", mileage: String(v.mileage || "") });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ brand: "", model: "", year: "", plate: "", vin: "", color: "", notes: "", mileage: "" });
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await api.put(`/client/vehicles/${editing}`, { ...form, year: parseInt(form.year) });
      cancelEdit();
      load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  const deleteVehicle = async (id: string) => {
    if (!confirm("¿Eliminar este vehículo?")) return;
    try {
      await api.delete(`/client/vehicles/${id}`);
      load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Mis Vehículos</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Gestiona los vehículos registrados en tu cuenta</p>
        </div>
        <Link to="/vehiculos/nuevo" className="btn btn-primary shadow-lg" style={{ boxShadow: "0 4px 14px rgba(13,148,136,0.3)" }}>
          <Plus size={15} /> Añadir Vehículo
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl p-5" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <div className="skeleton h-4 w-32 mb-3" />
              <div className="skeleton h-3 w-24 mb-2" />
              <div className="skeleton h-3 w-20" />
            </div>
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
          <Car size={48} style={{ color: "var(--text-tertiary)" }} className="mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text)" }}>No tienes vehículos registrados</h3>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>Añade tu primer vehículo para comenzar.</p>
          <Link to="/vehiculos/nuevo" className="btn btn-primary" style={{ boxShadow: "0 4px 14px rgba(13,148,136,0.3)" }}>
            <Plus size={15} /> Añadir Vehículo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((v) => (
            <div key={v.id} className="rounded-xl p-5 transition-all hover:shadow-sm" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              {editing === v.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="form-label">Marca</label>
                      <input className="input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                    </div>
                    <div>
                      <label className="form-label">Modelo</label>
                      <input className="input" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
                    </div>
                    <div>
                      <label className="form-label">Año</label>
                      <input className="input" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
                    </div>
                    <div>
                      <label className="form-label">Placa</label>
                      <input className="input" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} />
                    </div>
                    <div>
                      <label className="form-label">VIN</label>
                      <input className="input" value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} />
                    </div>
                    <div>
                      <label className="form-label">Color</label>
                      <input className="input" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
                    </div>
                    <div>
                      <label className="form-label">Kilometraje</label>
                      <input className="input" type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} placeholder="0" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Notas</label>
                    <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={cancelEdit} className="btn btn-secondary btn-sm" type="button">Cancelar</button>
                    <button onClick={saveEdit} disabled={saving} className="btn btn-primary btn-sm" type="button">
                      {saving ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(14,165,233,0.1)", color: "#0EA5E9" }}>
                        <Bike size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>{v.brand} {v.model}</h3>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{v.plate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEdit(v)} className="p-1.5 rounded-md hover:bg-[var(--bg-muted)] transition-all" style={{ color: "var(--text-secondary)" }} title="Editar" type="button">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => deleteVehicle(v.id)} className="p-1.5 rounded-md hover:bg-red-50 transition-all" style={{ color: "#EF4444" }} title="Eliminar" type="button">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-tertiary)" }}>
                    <span className="flex items-center gap-1"><Calendar size={11} /> {v.year}</span>
                    {v.mileage !== undefined && v.mileage > 0 && <span className="flex items-center gap-1"><Gauge size={11} /> {v.mileage.toLocaleString()} km</span>}
                    {v.color && <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: v.color.toLowerCase() }} /> {v.color}</span>}
                    {v.vin && <span className="flex items-center gap-1"><Hash size={11} /> {v.vin.slice(0, 8)}...</span>}
                  </div>
                  {v.notes && (
                    <p className="text-xs mt-2 pt-2 border-t" style={{ color: "var(--text-tertiary)", borderColor: "var(--border-light)" }}>{v.notes}</p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
