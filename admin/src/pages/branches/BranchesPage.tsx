import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import { Building2, Plus, Pencil, Trash2, Loader2, MapPin, Clock, Phone } from "lucide-react";
import DataTable from "@/components/DataTable";

interface Branch { id: string; name: string; address: string; phone: string; email: string; manager: string; is_main: boolean; working_hours: string; lat: string; lng: string; }

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState({ name: "", address: "", phone: "", email: "", manager: "", is_main: false, working_hours: "", lat: "", lng: "" });
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    api.get("/system-config/branches/list").then((r) => setBranches(Array.isArray(r) ? r : [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: "", address: "", phone: "", email: "", manager: "", is_main: false, working_hours: "Lun-Vie: 8:00-18:00, Sab: 8:00-13:00", lat: "", lng: "" }); setFormOpen(true); };
  const openEdit = (b: Branch) => { setEditing(b); setForm({ name: b.name, address: b.address, phone: b.phone, email: b.email, manager: b.manager, is_main: b.is_main, working_hours: b.working_hours, lat: b.lat, lng: b.lng }); setFormOpen(true); };

  const save = async () => {
    if (!form.name.trim()) { showToast("error", "El nombre es obligatorio"); return; }
    try {
      if (editing) { await api.put(`/system-config/branches/${editing.id}`, form); showToast("success", "Sucursal actualizada"); }
      else { await api.post("/system-config/branches", form); showToast("success", "Sucursal creada"); }
      setFormOpen(false); load();
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
  };

  const remove = async (id: string) => {
    if (!confirm("Eliminar esta sucursal?")) return;
    try { await api.delete(`/system-config/branches/${id}`); showToast("success", "Sucursal eliminada"); load(); }
    catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
  };

  const columns = [
    { key: "name", label: "Sucursal", render: (v: unknown, row: any) => (
      <div className="flex items-center gap-2">
        <Building2 size={16} style={{ color: row.is_main ? "var(--mp-accent)" : "var(--mp-text-tertiary)" }} />
        <div>
          <span className="text-sm font-medium text-[var(--mp-text-primary)]">{String(v)}</span>
          {row.is_main && <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--mp-accent)]/10 text-[var(--mp-accent)]">PRINCIPAL</span>}
        </div>
      </div>
    )},
    { key: "address", label: "Direccion", render: (v: unknown) => <span className="text-xs flex items-center gap-1"><MapPin size={11} />{String(v || "-")}</span> },
    { key: "phone", label: "Telefono", render: (v: unknown) => <span className="text-xs flex items-center gap-1"><Phone size={11} />{String(v || "-")}</span> },
    { key: "working_hours", label: "Horario", render: (v: unknown) => <span className="text-xs flex items-center gap-1"><Clock size={11} />{String(v || "-")}</span> },
    { key: "actions", label: "", render: (_: unknown, row: any) => (
      <div className="flex items-center gap-2">
        <button onClick={() => openEdit(row)} className="text-[var(--mp-text-tertiary)] hover:text-[var(--mp-accent)]" type="button"><Pencil size={14} /></button>
        <button onClick={() => remove(row.id)} className="text-[var(--mp-text-tertiary)] hover:text-[#EF4444]" type="button"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center shadow-lg">
            <Building2 size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--mp-text-primary)]">Sucursales</h1>
            <p className="text-sm text-[var(--mp-text-tertiary)]">Gestion de sedes del negocio</p>
          </div>
        </div>
        <button onClick={openNew} className="mp-btn-primary text-sm" type="button"><Plus size={15} /> Nueva sucursal</button>
      </div>

      <DataTable columns={columns} data={branches} loading={loading} pageSize={10} />

      {formOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setFormOpen(false)}>
          <div className="bg-[var(--mp-bg-card)] rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[var(--mp-text-primary)] mb-4">{editing ? "Editar" : "Nueva"} sucursal</h3>
            <div className="space-y-3">
              {[
                { key: "name", label: "Nombre", required: true },
                { key: "address", label: "Direccion" },
                { key: "phone", label: "Telefono" },
                { key: "email", label: "Email" },
                { key: "manager", label: "Encargado" },
                { key: "working_hours", label: "Horario" },
                { key: "lat", label: "Latitud" },
                { key: "lng", label: "Longitud" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-[var(--mp-text-primary)] mb-1 block">{f.label}{f.required && " *"}</label>
                  <input type="text" className="mp-input text-sm w-full" value={(form as any)[f.key] || ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_main} onChange={(e) => setForm({ ...form, is_main: e.target.checked })} className="rounded" />
                <label className="text-xs font-medium text-[var(--mp-text-primary)]">Sucursal principal</label>
              </div>
              <div className="flex gap-3 pt-3">
                <button onClick={() => setFormOpen(false)} className="mp-btn-secondary text-sm flex-1" type="button">Cancelar</button>
                <button onClick={save} className="mp-btn-primary text-sm flex-1" type="button">{editing ? "Actualizar" : "Crear"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
