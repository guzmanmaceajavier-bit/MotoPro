import { useState } from "react";
import { api } from "@/api/client";
import { useNavigate, Link } from "react-router-dom";
import { Car, Plus, ArrowLeft, Bike } from "lucide-react";

export default function VehiclesNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ brand: "", model: "", year: new Date().getFullYear(), plate: "", vin: "", color: "", notes: "", mileage: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (key: string, value: string | number) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/client/vehicles", form);
      navigate("/vehiculos");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link to="/vehiculos" className="inline-flex items-center gap-1 text-xs transition-colors mb-2.5" style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--text)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>
          <ArrowLeft size={12} /> Volver a mis vehículos
        </Link>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Añadir Vehículo</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Registra un nuevo vehículo en tu cuenta</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl p-6 space-y-5" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444" }}>
            <div className="w-1 h-1 rounded-full bg-[#EF4444] mt-1.5 shrink-0" />{error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Marca *</label>
            <div className="relative">
              <Bike size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
              <input className="input pl-10" value={form.brand} onChange={(e) => handleChange("brand", e.target.value)} placeholder="Ej: Yamaha" required />
            </div>
          </div>
          <div>
            <label className="form-label">Modelo *</label>
            <input className="input" value={form.model} onChange={(e) => handleChange("model", e.target.value)} placeholder="Ej: MT-07" required />
          </div>
          <div>
            <label className="form-label">Año *</label>
            <input className="input" type="number" value={form.year} onChange={(e) => handleChange("year", parseInt(e.target.value) || new Date().getFullYear())} required />
          </div>
          <div>
            <label className="form-label">Placa *</label>
            <input className="input" value={form.plate} onChange={(e) => handleChange("plate", e.target.value)} placeholder="Ej: ABC-123" required />
          </div>
          <div>
            <label className="form-label">VIN (Número de serie)</label>
            <input className="input" value={form.vin} onChange={(e) => handleChange("vin", e.target.value)} placeholder="Opcional" />
          </div>
          <div>
            <label className="form-label">Color</label>
            <input className="input" value={form.color} onChange={(e) => handleChange("color", e.target.value)} placeholder="Ej: Negro" />
          </div>
          <div>
            <label className="form-label">Kilometraje</label>
            <input className="input" type="number" value={form.mileage} onChange={(e) => handleChange("mileage", e.target.value)} placeholder="0 km" />
          </div>
        </div>

        <div>
          <label className="form-label">Notas adicionales</label>
          <textarea className="input" rows={3} value={form.notes} onChange={(e) => handleChange("notes", e.target.value)} placeholder="Observaciones, kilometraje, etc." />
        </div>

        <div className="flex items-center gap-3 justify-end pt-2">
          <Link to="/vehiculos" className="btn btn-secondary">Cancelar</Link>
          <button type="submit" disabled={saving} className="btn btn-primary shadow-lg" style={{ boxShadow: "0 4px 14px rgba(13,148,136,0.3)" }}>
            {saving ? (
              <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Guardando...</span>
            ) : (
              <><Plus size={16} /> Guardar Vehículo</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
