import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useToast } from "@/providers/ToastProvider";
import { Spinner, EmptyState, Badge } from "@/components/ui";

interface Address {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip?: string;
  phone: string;
  is_default: boolean;
}

export default function AddressManager() {
  const { addToast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", city: "", state: "", zip: "", phone: "", is_default: false });

  const fetchAddresses = async () => {
    try {
      const data = await api.get("/customer-auth/addresses");
      setAddresses(Array.isArray(data) ? data : []);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAddresses(); }, []);

  const resetForm = () => {
    setForm({ name: "", address: "", city: "", state: "", zip: "", phone: "", is_default: false });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (addr: Address) => {
    setEditing(addr);
    setForm({ name: addr.name, address: addr.address, city: addr.city, state: addr.state, zip: addr.zip || "", phone: addr.phone, is_default: addr.is_default });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/customer-auth/addresses/${editing.id}`, form);
        addToast("Dirección actualizada", "success");
      } else {
        await api.post("/customer-auth/addresses", form);
        addToast("Dirección agregada", "success");
      }
      resetForm();
      fetchAddresses();
    } catch {
      addToast("Error al guardar dirección", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/customer-auth/addresses/${id}`);
      addToast("Dirección eliminada", "success");
      fetchAddresses();
    } catch {
      addToast("Error al eliminar dirección", "error");
    }
  };

  if (loading) {
    return <Spinner size="md" className="py-16" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-text-primary">Mis Direcciones</h3>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-lg bg-interactive-accent text-black text-sm font-semibold hover:bg-interactive-accent-hover transition-colors"
          >
            Agregar dirección
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface-secondary border border-border rounded-lg p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-tertiary mb-1">Nombre completo</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="w-full rounded-lg bg-surface-tertiary border border-border px-3 py-2 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-interactive-accent transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-tertiary mb-1">Teléfono</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required
                className="w-full rounded-lg bg-surface-tertiary border border-border px-3 py-2 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-interactive-accent transition-colors" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-text-tertiary mb-1">Dirección</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required
                className="w-full rounded-lg bg-surface-tertiary border border-border px-3 py-2 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-interactive-accent transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-tertiary mb-1">Ciudad</label>
              <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required
                className="w-full rounded-lg bg-surface-tertiary border border-border px-3 py-2 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-interactive-accent transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-tertiary mb-1">Estado / Departamento</label>
              <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required
                className="w-full rounded-lg bg-surface-tertiary border border-border px-3 py-2 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-interactive-accent transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-tertiary mb-1">Código Postal</label>
              <input type="text" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })}
                className="w-full rounded-lg bg-surface-tertiary border border-border px-3 py-2 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-interactive-accent transition-colors" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
              className="rounded border-border bg-surface-tertiary text-interactive-accent focus:ring-interactive-accent" />
            <span className="text-sm text-text-secondary">Dirección predeterminada</span>
          </label>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="px-4 py-2 rounded-lg bg-interactive-accent text-black text-sm font-semibold hover:bg-interactive-accent-hover transition-colors disabled:opacity-50"
            >
              {saving ? "Guardando..." : editing ? "Actualizar" : "Guardar"}
            </button>
            <button type="button" onClick={resetForm}
              className="px-4 py-2 rounded-lg border border-border text-text-secondary text-sm hover:text-text-primary transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <EmptyState
          title="No tienes direcciones guardadas"
          action={
            <button onClick={() => setShowForm(true)} className="rounded-lg bg-interactive-accent px-6 py-3 text-sm font-semibold text-black hover:bg-interactive-accent-hover transition-all">
              Agregar dirección
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-surface-secondary border border-border rounded-lg p-5 relative">
              {addr.is_default && (
                <Badge variant="accent" className="absolute top-3 right-3">Predeterminada</Badge>
              )}
              <h4 className="text-sm font-semibold text-text-primary">{addr.name}</h4>
              <p className="text-xs text-text-secondary mt-1">{addr.address}</p>
              <p className="text-xs text-text-secondary">{addr.city}, {addr.state} {addr.zip ? `- ${addr.zip}` : ""}</p>
              <p className="text-xs text-text-secondary mt-1">{addr.phone}</p>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                <button onClick={() => handleEdit(addr)}
                  className="text-xs font-medium text-interactive-accent hover:text-interactive-accent-hover transition-colors"
                >
                  Editar
                </button>
                <button onClick={() => handleDelete(addr.id)}
                  className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
