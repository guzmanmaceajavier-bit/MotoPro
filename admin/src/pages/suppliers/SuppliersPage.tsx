import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import PageHeader from "@/components/PageHeader";
import { Badge } from "@shared/components/ui/Badge";
import { Pagination } from "@shared/components/ui/Pagination";
import KpiCard from "@shared/components/ui/KpiCard";
import {
  Truck, Plus, Search, Eye, Edit2, Trash2, Phone, Mail, MapPin,
  Building2, MoreHorizontal, Filter, Download, Package
} from "lucide-react";

interface Supplier {
  id: string; name: string; contact_name: string; email: string;
  phone: string; address: string; city: string; nit: string;
  notes: string; is_active: number; created_at: string;
}

const PAGE_SIZE = 10;

export default function SuppliersPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name: "", contact_name: "", email: "", phone: "", address: "", city: "", nit: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [detailSupplier, setDetailSupplier] = useState<Supplier | null>(null);
  const [supplierPurchases, setSupplierPurchases] = useState<any[]>([]);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await api.get(`/suppliers${params}`);
      setSuppliers(Array.isArray(res) ? res : res?.data || []);
    } catch { setSuppliers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadSuppliers(); }, [search]);

  const openCreate = () => {
    setEditSupplier(null);
    setForm({ name: "", contact_name: "", email: "", phone: "", address: "", city: "", nit: "", notes: "" });
    setShowForm(true);
  };

  const openEdit = (s: Supplier) => {
    setEditSupplier(s);
    setForm({ name: s.name, contact_name: s.contact_name, email: s.email, phone: s.phone, address: s.address, city: s.city, nit: s.nit, notes: s.notes });
    setShowForm(true);
  };

  const saveSupplier = async () => {
    if (!form.name.trim()) { showToast("error", "Nombre requerido"); return; }
    setSaving(true);
    try {
      if (editSupplier) await api.put(`/suppliers/${editSupplier.id}`, form);
      else await api.post("/suppliers", form);
      showToast("success", editSupplier ? "Proveedor actualizado" : "Proveedor creado");
      setShowForm(false);
      loadSuppliers();
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  const deleteSupplier = async (id: string) => {
    if (!confirm("¿Eliminar este proveedor?")) return;
    try { await api.delete(`/suppliers/${id}`); showToast("success", "Proveedor eliminado"); loadSuppliers(); }
    catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
  };

  const viewDetail = async (s: Supplier) => {
    setDetailSupplier(s);
    try {
      const res = await api.get(`/suppliers/${s.id}`);
      setSupplierPurchases(res?.purchases || []);
    } catch { setSupplierPurchases([]); }
  };

  const active = suppliers.filter(s => s.is_active).length;
  const inactive = suppliers.filter(s => !s.is_active).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Proveedores"
        description="Gestiona los proveedores del taller y tienda"
        breadcrumbs={[{ label: "Inventario" }, { label: "Proveedores" }]}
        icon={<Truck size={20} />}
        action={
          <button onClick={openCreate} className="mp-btn-primary text-xs">
            <Plus size={14} /> Nuevo Proveedor
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard title="Total Proveedores" value={suppliers.length} icon={<Truck size={18} />} iconColor="blue" />
        <KpiCard title="Activos" value={active} icon={<Building2 size={18} />} iconColor="green" />
        <KpiCard title="Inactivos" value={inactive} icon={<MoreHorizontal size={18} />} iconColor="red" />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar proveedor..." className="mp-input pl-9" />
        </div>
      </div>

      {/* Supplier Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-[var(--mp-bg-primary)] rounded-xl border border-[var(--mp-border)] w-full max-w-lg mx-4 p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[var(--mp-text-primary)]">{editSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">Nombre *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mp-input" placeholder="Nombre del proveedor" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">Contacto</label>
                <input value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))} className="mp-input" placeholder="Persona de contacto" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">NIT</label>
                <input value={form.nit} onChange={e => setForm(p => ({ ...p, nit: e.target.value }))} className="mp-input" placeholder="NIT" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="mp-input" placeholder="correo@proveedor.com" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">Teléfono</label>
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="mp-input" placeholder="+57 300 123 4567" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">Dirección</label>
                <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className="mp-input" placeholder="Dirección" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">Ciudad</label>
                <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="mp-input" placeholder="Ciudad" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">Notas</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} className="mp-input resize-none" placeholder="Notas adicionales..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowForm(false)} className="mp-btn-ghost text-xs">Cancelar</button>
              <button onClick={saveSupplier} disabled={saving} className="mp-btn-primary text-xs">
                {saving ? "Guardando..." : editSupplier ? "Actualizar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDetailSupplier(null)}>
          <div className="bg-[var(--mp-bg-primary)] rounded-xl border border-[var(--mp-border)] w-full max-w-2xl mx-4 p-6 space-y-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--mp-text-primary)]">{detailSupplier.name}</h3>
              <button onClick={() => setDetailSupplier(null)} className="text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)]">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2"><Building2 size={14} className="text-[var(--mp-text-tertiary)]" /><span>{detailSupplier.contact_name || "—"}</span></div>
              <div className="flex items-center gap-2"><span className="text-[var(--mp-text-tertiary)]">NIT:</span> {detailSupplier.nit || "—"}</div>
              <div className="flex items-center gap-2"><Mail size={14} className="text-[var(--mp-text-tertiary)]" /><span>{detailSupplier.email || "—"}</span></div>
              <div className="flex items-center gap-2"><Phone size={14} className="text-[var(--mp-text-tertiary)]" /><span>{detailSupplier.phone || "—"}</span></div>
              <div className="flex items-center gap-2 col-span-2"><MapPin size={14} className="text-[var(--mp-text-tertiary)]" /><span>{detailSupplier.address || "—"}, {detailSupplier.city || ""}</span></div>
            </div>
            {supplierPurchases.length > 0 && (
              <div className="pt-3 border-t border-[var(--mp-border-subtle)]">
                <p className="text-xs font-medium text-[var(--mp-text-secondary)] mb-2">Últimas compras</p>
                <div className="space-y-2">
                  {supplierPurchases.slice(0, 5).map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--mp-bg-elevated)] text-xs">
                      <span className="font-medium">{p.invoice_number || p.id.slice(0, 8)}</span>
                      <span className="text-[var(--mp-text-tertiary)]">${p.total?.toLocaleString()}</span>
                      <Badge variant={p.status === "received" ? "success" : "warning"}>{p.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="mp-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--mp-border)]">
              <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase">Proveedor</th>
              <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase hidden md:table-cell">Contacto</th>
              <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase hidden lg:table-cell">Teléfono</th>
              <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase hidden lg:table-cell">Ciudad</th>
              <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase">Estado</th>
              <th className="text-right text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(s => (
              <tr key={s.id} className="border-b border-[var(--mp-border-subtle)] hover:bg-[var(--mp-bg-elevated)] transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--mp-text-primary)]">{s.name}</p>
                    <p className="text-xs text-[var(--mp-text-tertiary)]">{s.nit || "Sin NIT"}</p>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell"><span className="text-sm text-[var(--mp-text-secondary)]">{s.contact_name || "—"}</span></td>
                <td className="px-4 py-3 hidden lg:table-cell"><span className="text-sm text-[var(--mp-text-secondary)]">{s.phone || "—"}</span></td>
                <td className="px-4 py-3 hidden lg:table-cell"><span className="text-sm text-[var(--mp-text-secondary)]">{s.city || "—"}</span></td>
                <td className="px-4 py-3"><Badge variant={s.is_active ? "success" : "danger"}>{s.is_active ? "Activo" : "Inactivo"}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => viewDetail(s)} className="mp-btn-ghost text-xs py-1.5 px-2" title="Ver detalle"><Eye size={14} /></button>
                    <button onClick={() => openEdit(s)} className="mp-btn-ghost text-xs py-1.5 px-2" title="Editar"><Edit2 size={14} /></button>
                    <button onClick={() => deleteSupplier(s.id)} className="mp-btn-ghost text-xs py-1.5 px-2 text-red-500 hover:text-red-700" title="Eliminar"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-[var(--mp-text-tertiary)]">No hay proveedores</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--mp-text-tertiary)]">Mostrando {Math.min((page - 1) * PAGE_SIZE + 1, suppliers.length)} a {Math.min(page * PAGE_SIZE, suppliers.length)} de {suppliers.length}</span>
        <Pagination page={page} perPage={PAGE_SIZE} total={suppliers.length} onChange={setPage} />
      </div>
    </div>
  );
}
