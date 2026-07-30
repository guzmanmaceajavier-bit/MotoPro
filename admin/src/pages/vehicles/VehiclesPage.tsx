import { useState, useEffect, useCallback } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import {
  Plus, Search, Car, Wrench, Camera, FileText, Gauge, Edit, Trash2,
  X, ChevronDown, Phone, Mail, Calendar, Check, Upload, Download,
  AlertTriangle, Eye, User,
} from "lucide-react";

interface Vehicle {
  id: string; customer_id: string; customer_name: string; customer_phone: string;
  brand: string; model: string; year: string; plate: string; vin: string;
  color: string; mileage: number; observations: string;
  service_count: number; last_mileage: number;
  created_at: string; updated_at: string;
}
interface VehicleDetail extends Vehicle {
  service_history: any[]; work_orders: any[]; photos: any[];
  documents: any[]; mileage_history: any[]; current_mileage: number;
  customer_email: string;
}
interface Customer { id: string; name: string; email: string; phone: string; }

const BRANDS = ["Honda", "Yamaha", "Kawasaki", "Suzuki", "BMW", "Ducati", "KTM", "Harley-Davidson", "Aprilia", "Triumph", "Otra"];
const TABS = ["info", "service", "photos", "docs", "mileage"] as const;
const TAB_LABELS: Record<string, string> = { info: "Datos", service: "Historial", photos: "Fotos", docs: "Documentos", mileage: "Kilometraje" };
const DOC_TYPES = ["soat", "tecnomecanica", "seguro", "tarjeta_propiedad", "factura", "otro"];
const PHOTO_CATS = ["general", "frontal", "lateral", "trasera", "motor", "danos", "detalle"];

const emptyForm = { customer_id: "", brand: "", model: "", year: "", plate: "", vin: "", engine_number: "", chassis_number: "", color: "", mileage: "", observations: "" };

export default function VehiclesPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [detail, setDetail] = useState<VehicleDetail | null>(null);
  const [detailTab, setDetailTab] = useState<string>("info");
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Photo/Doc forms
  const [photoForm, setPhotoForm] = useState({ url: "", caption: "", category: "general" });
  const [docForm, setDocForm] = useState({ name: "", type: "soat", url: "", notes: "", expiry_date: "" });
  const [mileageForm, setMileageForm] = useState({ mileage: "", notes: "" });

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    Promise.all([
      api.get(`/vehicles${params}`),
      api.get("/customers"),
    ]).then(([v, c]) => {
      setVehicles(Array.isArray(v) ? v : (v?.data || []));
      setCustomers(Array.isArray(c) ? c : []);
    }).catch(() => { setVehicles([]); setCustomers([]); })
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDetail = async (v: Vehicle) => {
    try {
      const data = await api.get(`/vehicles/${v.id}`);
      setDetail(data);
      setDetailTab("info");
    } catch { showToast({ type: "error", message: "Error al cargar detalle" }); }
  };

  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({ customer_id: v.customer_id, brand: v.brand, model: v.model, year: v.year || "", plate: v.plate, vin: v.vin || "", engine_number: (v as any).engine_number || "", chassis_number: (v as any).chassis_number || "", color: v.color || "", mileage: String(v.mileage || ""), observations: v.observations || "" });
    setShowModal(true);
  };

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };

  const handleSave = async () => {
    if (!form.customer_id || !form.brand || !form.model || !form.plate) {
      showToast({ type: "error", message: "Cliente, marca, modelo y placa requeridos" }); return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form, mileage: form.mileage ? parseInt(form.mileage) : 0 };
      if (editing) { await api.put(`/vehicles/${editing.id}`, payload); showToast({ type: "success", message: "Vehiculo actualizado" }); }
      else { await api.post("/vehicles", payload); showToast({ type: "success", message: "Vehiculo creado" }); }
      setShowModal(false); fetchData();
    } catch (e: any) { showToast({ type: "error", message: e.message || "Error" }); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    try { await api.delete(`/vehicles/${id}`); showToast({ type: "success", message: "Eliminado" }); setDeleteConfirm(null); fetchData(); }
    catch { showToast({ type: "error", message: "Error al eliminar" }); }
  };

  const addPhoto = async () => {
    if (!photoForm.url || !detail) return;
    try {
      await api.post(`/vehicles/${detail.id}/photos`, photoForm);
      showToast({ type: "success", message: "Foto agregada" });
      setPhotoForm({ url: "", caption: "", category: "general" });
      openDetail(detail);
    } catch (e: any) { showToast({ type: "error", message: e.message }); }
  };

  const removePhoto = async (photoId: string) => {
    if (!detail) return;
    try { await api.delete(`/vehicles/${detail.id}/photos/${photoId}`); openDetail(detail); }
    catch { showToast({ type: "error", message: "Error" }); }
  };

  const addDoc = async () => {
    if (!docForm.name || !detail) return;
    try {
      await api.post(`/vehicles/${detail.id}/documents`, docForm);
      showToast({ type: "success", message: "Documento agregado" });
      setDocForm({ name: "", type: "soat", url: "", notes: "", expiry_date: "" });
      openDetail(detail);
    } catch (e: any) { showToast({ type: "error", message: e.message }); }
  };

  const removeDoc = async (docId: string) => {
    if (!detail) return;
    try { await api.delete(`/vehicles/${detail.id}/documents/${docId}`); openDetail(detail); }
    catch { showToast({ type: "error", message: "Error" }); }
  };

  const addMileage = async () => {
    if (!mileageForm.mileage || !detail) return;
    try {
      await api.post(`/vehicles/${detail.id}/mileage`, { mileage: parseInt(mileageForm.mileage), notes: mileageForm.notes });
      showToast({ type: "success", message: "Kilometraje registrado" });
      setMileageForm({ mileage: "", notes: "" });
      openDetail(detail);
    } catch (e: any) { showToast({ type: "error", message: e.message }); }
  };

  const brands = [...new Set(vehicles.map(v => v.brand).filter(Boolean))];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Vehiculos" description="Gestion de motocicletas registradas" breadcrumbs={[{ label: "Dashboard", to: "/" }, { label: "Vehiculos" }]} icon={<Car size={20} />}
        action={<button onClick={openNew} className="mp-btn-primary text-xs"><Plus size={14} /> Nuevo Vehiculo</button>} />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Vehiculos", value: vehicles.length, color: "teal" },
          { label: "Marcas", value: brands.length, color: "blue" },
          { label: "Servicios", value: vehicles.reduce((s, v) => s + (v.service_count || 0), 0), color: "orange" },
          { label: "Sin Servicio", value: vehicles.filter(v => !v.service_count).length, color: "amber" },
        ].map((kpi, i) => (
          <div key={kpi.label} className="mp-kpi" style={{ animation: `slideUp 200ms ${i * 50}ms var(--ease-out) both` }}>
            <span className="text-xs font-medium text-[var(--mp-text-tertiary)] uppercase tracking-wider">{kpi.label}</span>
            <p className="text-2xl font-bold text-[var(--mp-text-primary)] mt-2">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
        <input className="mp-input pl-9 pr-9" placeholder="Buscar por placa, marca, modelo..." value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={14} className="text-[var(--mp-text-tertiary)]" /></button>}
      </div>

      {/* Table */}
      {loading ? (
        <div className="mp-card p-4 space-y-3">{[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
      ) : vehicles.length === 0 ? (
        <div className="mp-card py-12 text-center">
          <Car size={40} className="mx-auto mb-3 text-[var(--mp-text-tertiary)]" />
          <p className="text-sm text-[var(--mp-text-secondary)]">{search ? "Sin resultados" : "No hay vehiculos registrados"}</p>
          {!search && <button onClick={openNew} className="mp-btn-primary text-xs mt-4"><Plus size={14} /> Registrar Vehiculo</button>}
        </div>
      ) : (
        <div className="mp-card overflow-hidden">
          <table className="mp-table">
            <thead>
              <tr>
                <th>VEHICULO</th><th>PROPIETARIO</th><th>PLACA</th><th>KM</th><th>SERVICIOS</th><th className="text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400"><Car size={14} /></div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--mp-text-primary)] cursor-pointer hover:opacity-70" onClick={() => openDetail(v)}>{v.brand} {v.model}</p>
                        <p className="text-[11px] text-[var(--mp-text-tertiary)]">{v.year} {v.color ? `· ${v.color}` : ""}</p>
                      </div>
                    </div>
                  </td>
                  <td><p className="text-xs text-[var(--mp-text-secondary)]">{v.customer_name || "—"}</p></td>
                  <td><span className="font-mono text-xs font-bold text-[var(--mp-text-primary)] bg-[var(--mp-bg-elevated)] px-2 py-1 rounded">{v.plate}</span></td>
                  <td><span className="text-xs text-[var(--mp-text-secondary)]">{(v.last_mileage || v.mileage || 0).toLocaleString()} km</span></td>
                  <td><span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400">{v.service_count || 0}</span></td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openDetail(v)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--mp-text-tertiary)] hover:text-teal-400 hover:bg-teal-500/10"><Eye size={13} /></button>
                      <button onClick={() => openEdit(v)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--mp-text-tertiary)] hover:text-amber-400 hover:bg-amber-500/10"><Edit size={13} /></button>
                      <button onClick={() => setDeleteConfirm(v.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--mp-text-tertiary)] hover:text-red-400 hover:bg-red-500/10"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create/Edit Modal ── */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Editar Vehiculo" : "Nuevo Vehiculo"} size="lg">
        <div className="p-5 space-y-4">
          <div><label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Propietario *</label>
            <select className="mp-select w-full" value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}>
              <option value="">Seleccionar cliente...</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.email}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Marca *</label>
              <select className="mp-select w-full" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })}>
                <option value="">Marca...</option>{BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Modelo *</label>
              <input className="mp-input w-full" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="Ej: CB 500F" />
            </div>
            <div><label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Año</label>
              <input className="mp-input w-full" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} placeholder="Ej: 2023" />
            </div>
            <div><label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Placa *</label>
              <input className="mp-input w-full font-mono uppercase" value={form.plate} onChange={e => setForm({ ...form, plate: e.target.value.toUpperCase() })} placeholder="ABC 123" />
            </div>
            <div><label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">VIN</label>
              <input className="mp-input w-full" value={form.vin} onChange={e => setForm({ ...form, vin: e.target.value })} placeholder="Número de serie (VIN)" />
            </div>
            <div><label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Motor</label>
              <input className="mp-input w-full" value={form.engine_number} onChange={e => setForm({ ...form, engine_number: e.target.value })} placeholder="Número de motor" />
            </div>
            <div><label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Chasis</label>
              <input className="mp-input w-full" value={form.chassis_number} onChange={e => setForm({ ...form, chassis_number: e.target.value })} placeholder="Número de chasis" />
            </div>
            <div><label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Color</label>
              <input className="mp-input w-full" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} placeholder="Ej: Negro" />
            </div>
            <div><label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Kilometraje</label>
              <input type="number" className="mp-input w-full" value={form.mileage} onChange={e => setForm({ ...form, mileage: e.target.value })} placeholder="0" />
            </div>
          </div>
          <div><label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Observaciones</label>
            <textarea className="mp-input w-full" rows={2} value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })} placeholder="Notas sobre el vehiculo..." />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--mp-border)]">
            <button onClick={() => setShowModal(false)} className="mp-btn-ghost text-sm">Cancelar</button>
            <button onClick={handleSave} disabled={submitting} className="mp-btn-primary text-sm">{submitting ? "Guardando..." : "Guardar"}</button>
          </div>
        </div>
      </Modal>

      {/* ── Detail Modal ── */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title={detail ? `${detail.brand} ${detail.model} - ${detail.plate}` : ""} size="xl">
        {detail && (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-lg bg-[var(--mp-bg-elevated)] border border-[var(--mp-border-subtle)]">
              {TABS.map(t => (
                <button key={t} onClick={() => setDetailTab(t)}
                  className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${detailTab === t ? "bg-[var(--mp-bg-surface)] text-teal-400 shadow-sm" : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-secondary)]"}`}>
                  {TAB_LABELS[t]}
                </button>
              ))}
            </div>

            {/* Info Tab */}
            {detailTab === "info" && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-teal-500/5 border border-teal-500/20">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400"><Car size={22} /></div>
                  <div>
                    <p className="text-base font-bold text-[var(--mp-text-primary)]">{detail.brand} {detail.model}</p>
                    <p className="text-xs text-[var(--mp-text-tertiary)]">{detail.year} {detail.color ? `· ${detail.color}` : ""} · VIN: {detail.vin || "N/A"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[var(--mp-bg-elevated)]">
                    <p className="text-[10px] text-[var(--mp-text-tertiary)] uppercase">Kilometraje Actual</p>
                    <p className="text-lg font-bold text-[var(--mp-text-primary)]">{(detail.current_mileage || 0).toLocaleString()} km</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--mp-bg-elevated)]">
                    <p className="text-[10px] text-[var(--mp-text-tertiary)] uppercase">Servicios Totales</p>
                    <p className="text-lg font-bold text-teal-400">{detail.service_history?.length || 0}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[var(--mp-bg-elevated)]">
                    <p className="text-[10px] text-[var(--mp-text-tertiary)] uppercase">Motor</p>
                    <p className="text-sm font-semibold text-[var(--mp-text-primary)]">{(detail as any).engine_number || "N/A"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--mp-bg-elevated)]">
                    <p className="text-[10px] text-[var(--mp-text-tertiary)] uppercase">Chasis</p>
                    <p className="text-sm font-semibold text-[var(--mp-text-primary)]">{(detail as any).chassis_number || "N/A"}</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--mp-bg-elevated)]">
                  <p className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 flex items-center gap-1"><User size={12} /> Propietario</p>
                  <p className="text-sm text-[var(--mp-text-primary)]">{detail.customer_name}</p>
                  {detail.customer_phone && <p className="text-xs text-[var(--mp-text-tertiary)] mt-0.5 flex items-center gap-1"><Phone size={10} /> {detail.customer_phone}</p>}
                  {detail.customer_email && <p className="text-xs text-[var(--mp-text-tertiary)] flex items-center gap-1"><Mail size={10} /> {detail.customer_email}</p>}
                </div>
                {detail.observations && (
                  <div className="p-3 rounded-lg bg-[var(--mp-bg-elevated)]">
                    <p className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1">Observaciones</p>
                    <p className="text-sm text-[var(--mp-text-tertiary)]">{detail.observations}</p>
                  </div>
                )}
              </div>
            )}

            {/* Service History Tab */}
            {detailTab === "service" && (
              <div className="space-y-3">
                {detail.work_orders?.length > 0 ? detail.work_orders.map((wo: any) => (
                  <div key={wo.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--mp-bg-elevated)]">
                    <div>
                      <p className="text-sm font-medium text-[var(--mp-text-primary)]">{wo.order_number}</p>
                      <p className="text-xs text-[var(--mp-text-tertiary)]">{wo.service_type || wo.description} {wo.mechanic_name ? `· ${wo.mechanic_name}` : ""}</p>
                      <p className="text-[10px] text-[var(--mp-text-tertiary)]">{wo.created_at ? new Date(wo.created_at).toLocaleDateString() : ""}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${wo.status === "delivered" ? "bg-emerald-500/15 text-emerald-400" : wo.status === "in_progress" ? "bg-orange-500/15 text-orange-400" : "bg-blue-500/15 text-blue-400"}`}>{wo.status}</span>
                      <p className="text-sm font-bold text-[var(--mp-text-primary)] mt-1">${(wo.total || 0).toLocaleString()}</p>
                    </div>
                  </div>
                )) : <p className="text-sm text-center text-[var(--mp-text-tertiary)] py-6">Sin historial de servicios</p>}
              </div>
            )}

            {/* Photos Tab */}
            {detailTab === "photos" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <select className="mp-select text-xs" value={photoForm.category} onChange={e => setPhotoForm({ ...photoForm, category: e.target.value })}>
                    {PHOTO_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input className="mp-input text-xs flex-1" placeholder="URL de la imagen" value={photoForm.url} onChange={e => setPhotoForm({ ...photoForm, url: e.target.value })} />
                  <input className="mp-input text-xs flex-1" placeholder="Caption" value={photoForm.caption} onChange={e => setPhotoForm({ ...photoForm, caption: e.target.value })} />
                  <button onClick={addPhoto} className="mp-btn-primary text-xs"><Upload size={12} /></button>
                </div>
                {detail.photos?.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {detail.photos.map((p: any) => (
                      <div key={p.id} className="relative group rounded-lg overflow-hidden border border-[var(--mp-border-subtle)]">
                        <img src={p.url} alt={p.caption} className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <span className="text-[10px] text-white bg-black/50 px-2 py-0.5 rounded">{p.category}</span>
                          <button onClick={() => removePhoto(p.id)} className="w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center text-white"><Trash2 size={10} /></button>
                        </div>
                        {p.caption && <p className="text-[10px] text-[var(--mp-text-tertiary)] px-2 py-1 truncate">{p.caption}</p>}
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-center text-[var(--mp-text-tertiary)] py-6">Sin fotos registradas</p>}
              </div>
            )}

            {/* Documents Tab */}
            {detailTab === "docs" && (
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <input className="mp-input text-xs" placeholder="Nombre" value={docForm.name} onChange={e => setDocForm({ ...docForm, name: e.target.value })} />
                  <select className="mp-select text-xs" value={docForm.type} onChange={e => setDocForm({ ...docForm, type: e.target.value })}>
                    {DOC_TYPES.map(t => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
                  </select>
                  <input type="date" className="mp-input text-xs" value={docForm.expiry_date} onChange={e => setDocForm({ ...docForm, expiry_date: e.target.value })} />
                  <button onClick={addDoc} className="mp-btn-primary text-xs"><Plus size={12} /> Agregar</button>
                </div>
                {detail.documents?.length > 0 ? (
                  <div className="space-y-2">
                    {detail.documents.map((d: any) => {
                      const expiring = d.expiry_date && new Date(d.expiry_date) < new Date(Date.now() + 30 * 86400000);
                      return (
                        <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--mp-bg-elevated)]">
                          <div className="flex items-center gap-3">
                            <FileText size={16} className={expiring ? "text-amber-400" : "text-[var(--mp-text-tertiary)]"} />
                            <div>
                              <p className="text-sm font-medium text-[var(--mp-text-primary)]">{d.name}</p>
                              <p className="text-[10px] text-[var(--mp-text-tertiary)]">{d.type.replace("_", " ")} {d.expiry_date ? `· Vence: ${new Date(d.expiry_date).toLocaleDateString()}` : ""}</p>
                            </div>
                          </div>
                          <button onClick={() => removeDoc(d.id)} className="text-[var(--mp-text-tertiary)] hover:text-red-400"><Trash2 size={12} /></button>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-sm text-center text-[var(--mp-text-tertiary)] py-6">Sin documentos registrados</p>}
              </div>
            )}

            {/* Mileage Tab */}
            {detailTab === "mileage" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input type="number" className="mp-input text-xs" placeholder="Kilometraje" value={mileageForm.mileage} onChange={e => setMileageForm({ ...mileageForm, mileage: e.target.value })} />
                  <input className="mp-input text-xs flex-1" placeholder="Notas" value={mileageForm.notes} onChange={e => setMileageForm({ ...mileageForm, notes: e.target.value })} />
                  <button onClick={addMileage} className="mp-btn-primary text-xs"><Plus size={12} /></button>
                </div>
                {detail.mileage_history?.length > 0 ? (
                  <div className="space-y-2">
                    {detail.mileage_history.map((m: any, i: number) => (
                      <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--mp-bg-elevated)]">
                        <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 text-xs font-bold">{i + 1}</div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[var(--mp-text-primary)]">{m.mileage.toLocaleString()} km</p>
                          <p className="text-[10px] text-[var(--mp-text-tertiary)]">{m.source} {m.notes ? `· ${m.notes}` : ""}</p>
                        </div>
                        <span className="text-[10px] text-[var(--mp-text-tertiary)]">{m.recorded_at ? new Date(m.recorded_at).toLocaleDateString() : ""}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-center text-[var(--mp-text-tertiary)] py-6">Sin registros de kilometraje</p>}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Eliminar vehiculo" size="sm">
        <div className="p-5">
          <p className="text-sm text-[var(--mp-text-secondary)] mb-4">Se eliminara el vehiculo y todo su historial. Esta accion no se puede deshacer.</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setDeleteConfirm(null)} className="mp-btn-ghost text-sm">Cancelar</button>
            <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="mp-btn text-sm text-red-400 bg-red-500/10 hover:bg-red-500/20">Eliminar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
