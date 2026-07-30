import { useState } from "react";
import { api } from "@/api/client";
import { useToast } from "@/providers/ToastProvider";
import { EmptyState } from "@/components/ui";

const VEHICLE_BRANDS = [
  { name: "AKT", models: ["AK 100", "AK 125", "CR5", "EVO", "FLEX", "JET", "NKD", "SM", "SPECIAL", "TT", "TTR", "XM"] },
  { name: "BAJAJ", models: ["BOXER", "CALIBER", "DISCOVER", "DOMINAR", "PULSAR"] },
  { name: "HONDA", models: ["CB", "CLICK", "DIO", "NAVI", "WAVE", "XR", "XRE", "BIZ", "C-70", "C-90"] },
  { name: "YAMAHA", models: ["AXIS", "BWS", "CRYPTON", "FZ", "FINO", "MT", "N-MAX", "R-15", "XTZ"] },
  { name: "SUZUKI", models: ["AX", "BEST", "DR", "GN", "GIXXER", "GS", "HAYATE"] },
  { name: "KTM", models: ["DUKE"] },
  { name: "KAWASAKI", models: ["GTO", "KLX", "NINJA", "VERSYS"] },
  { name: "TVS", models: ["DAZZ", "FLAME", "NEO", "NTORQ", "RAIDER", "RTR", "SPORT"] },
  { name: "HERO", models: ["DASH", "ECO", "GLAMOUR", "HUNK", "IGNITOR", "SPLENDOR", "XPULSE"] },
  { name: "ROYAL ENFIELD", models: ["CLASSIC", "HIMALAYAN", "HNTR", "INTERCEPTOR", "METEOR"] },
];

function VehicleForm({ onSave, onCancel, initial }: { onSave: (data: any) => void; onCancel: () => void; initial?: any }) {
  const [form, setForm] = useState({ brand: initial?.brand || "", model: initial?.model || "", year: initial?.year || "", plate: initial?.plate || "", vin: initial?.vin || "", color: initial?.color || "", cilindraje: initial?.cilindraje || "" });
  const selectedBrand = VEHICLE_BRANDS.find(b => b.name === form.brand);

  return (
    <div className="bg-surface-secondary border border-border rounded-lg p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">Marca</label>
          <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value, model: "" })}
            className="w-full bg-surface-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-interactive-accent">
            <option value="">Seleccionar</option>
            {VEHICLE_BRANDS.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">Modelo</label>
          <select value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })}
            className="w-full bg-surface-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-interactive-accent">
            <option value="">Seleccionar</option>
            {selectedBrand?.models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">Año</label>
          <input type="text" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}
            className="w-full bg-surface-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-interactive-accent" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">Placa</label>
          <input type="text" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })}
            className="w-full bg-surface-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-interactive-accent" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">VIN</label>
          <input type="text" value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })}
            className="w-full bg-surface-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-interactive-accent" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">Color</label>
          <input type="text" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="w-full bg-surface-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-interactive-accent" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">Cilindraje (cc)</label>
          <input type="number" value={form.cilindraje} onChange={(e) => setForm({ ...form, cilindraje: e.target.value })}
            className="w-full bg-surface-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-interactive-accent" placeholder="150" />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => onSave(form)}
          className="px-5 py-2 rounded-lg bg-interactive-accent text-black text-sm font-semibold hover:bg-interactive-accent-hover transition-all">
          Guardar vehículo
        </button>
        <button onClick={onCancel}
          className="px-5 py-2 rounded-lg border border-border text-text-secondary text-sm font-medium hover:text-text-primary transition-all">
          Cancelar
        </button>
      </div>
    </div>
  );
}

export function VehicleManager({ vehicles, onRefresh }: { vehicles: any[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleSave = async (data: any) => {
    try {
      if (editingId) {
        await api.put(`/vehicles/${editingId}`, data);
        addToast("Vehículo actualizado", "success");
      } else {
        await api.post("/vehicles", data);
        addToast("Vehículo registrado", "success");
      }
      setShowForm(false);
      setEditingId(null);
      onRefresh();
    } catch {
      addToast("Error al guardar vehículo", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/vehicles/${id}`);
      addToast("Vehículo eliminado", "success");
      onRefresh();
    } catch {
      addToast("Error al eliminar vehículo", "error");
    }
  };

  if (vehicles.length === 0 && !showForm) {
    return (
      <div className="space-y-4">
        <EmptyState
          title="No tienes motos registradas"
          action={
            <button onClick={() => setShowForm(true)} className="rounded-lg bg-interactive-accent px-6 py-3 text-sm font-semibold text-black hover:bg-interactive-accent-hover transition-all">
              Agregar vehículo
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{vehicles.length} vehículo(s) registrado(s)</p>
        <button onClick={() => { setShowForm(true); setEditingId(null); }}
          className="px-4 py-2 rounded-lg bg-interactive-accent text-black text-sm font-semibold hover:bg-interactive-accent-hover transition-all">
          + Agregar
        </button>
      </div>

      {showForm && (
        <VehicleForm
          initial={editingId ? vehicles.find(v => v.id === editingId) : undefined}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingId(null); }}
        />
      )}

      {vehicles.map((v: any) => (
        <div key={v.id} className="bg-surface-secondary border border-border rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-3xl">🏍️</span>
              <div>
                <h3 className="text-text-primary font-medium">{v.brand} {v.model} {v.year ? `(${v.year})` : ''} {v.cilindraje ? `· ${v.cilindraje} cc` : ''}</h3>
                <p className="text-text-secondary text-sm">Placa: {v.plate} {v.vin ? `· VIN: ${v.vin}` : ''}</p>
                {v.color && <p className="text-text-tertiary text-xs">Color: {v.color}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditingId(v.id); setShowForm(true); }}
                className="text-xs text-interactive-accent hover:underline">Editar</button>
              <button onClick={() => handleDelete(v.id)}
                className="text-xs text-red-400 hover:underline">Eliminar</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
