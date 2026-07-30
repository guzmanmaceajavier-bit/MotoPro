import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { api, uploadFile } from "@/api/client";
import { Modal } from "@shared/components/ui/Modal";
import { Badge } from "@shared/components/ui/Badge";
import { useToast } from "@/components/Toast";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@shared/components/ui/KpiCard";
import { Pagination } from "@shared/components/ui/Pagination";
import {
  Plus, Search, Users, User, Mail, ShoppingBag, DollarSign, Pencil, Trash2,
  UserPlus, Calendar, Download, Phone, MessageCircle, X, ChevronLeft,
  ChevronRight, ArrowUpDown, Upload, TrendingUp, MapPin, Info, Image,
  Check, Tag
} from "lucide-react";
import { downloadCSV, downloadExcel } from "@/utils/export";
import { shareWhatsAppItem } from "@/utils/share";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  total_orders: number;
  total_spent: number;
  is_registered: number;
  created_at: string;
  customer_type?: string;
  notes?: string;
}

const emptyForm = { name: "", email: "", phone: "", address: "", avatar: "", customer_type: "", notes: "" };
const avatarColors = ["#0D9488", "#6366F1", "#F59E0B", "#EC4899", "#3B82F6", "#8B5CF6", "#F97316", "#10B981"];
const PAGE_SIZE = 10;

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function SparkLine({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const w = 60, h = 20;
  const points = data.map((v, i) => `${(i / (data.length - 1 || 1)) * w},${h - (v / max) * (h - 2)}`).join(" ");
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

export default function CustomersPage() {
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "orders" | "spent" | "date">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchParams] = useSearchParams();
  const [registeredFilter, setRegisteredFilter] = useState(searchParams.get("registered") || "");
  const { showToast } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (registeredFilter) params.set("registered", registeredFilter);
    const qs = params.toString();
    api.get("/customers" + (qs ? "?" + qs : "")).then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
  }, [search, registeredFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setRegisteredFilter(searchParams.get("registered") || ""); }, [searchParams]);

  const sorted = [...items].sort((a, b) => {
    let cmp = 0;
    if (sortBy === "name") cmp = a.name.localeCompare(b.name);
    else if (sortBy === "orders") cmp = (a.total_orders || 0) - (b.total_orders || 0);
    else if (sortBy === "spent") cmp = (a.total_spent || 0) - (b.total_spent || 0);
    else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return sortDir === "desc" ? -cmp : cmp;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalOrders = items.reduce((s, c) => s + (c.total_orders || 0), 0);
  const totalSpent = items.reduce((s, c) => s + (c.total_spent || 0), 0);
  const avgSpent = items.length > 0 ? totalSpent / items.length : 0;

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(field); setSortDir("desc"); }
  };

  const openNew = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (s: Customer) => {
    setEditing(s);
    setForm({ name: s.name, email: s.email, phone: s.phone || "", address: s.address || "", avatar: s.avatar || "", customer_type: s.customer_type || "", notes: s.notes || "" });
    setModal(true);
  };
  const openDetail = (c: Customer) => {
    setDetailCustomer(c);
    setCustomerOrders([]);
    setOrdersLoading(true);
    api.get("/direct-sales").then((orders) => {
      const arr = Array.isArray(orders) ? orders : [];
      setCustomerOrders(arr.filter((o: any) => o.customer_email?.toLowerCase() === c.email?.toLowerCase()));
    }).catch(() => {}).finally(() => setOrdersLoading(false));
  };

  const handleSave = async () => {
    try {
      if (editing) { await api.put("/customers/" + editing.id, form); showToast("success", "Cliente actualizado"); }
      else { await api.post("/customers", form); showToast("success", "Cliente creado"); }
      setModal(false); fetchData();
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
  };

  const handleDelete = async (id: string) => {
    try { await api.delete("/customers/" + id); showToast("success", "Cliente eliminado"); setDeleteConfirm(null); fetchData(); }
    catch { showToast("error", "Error al eliminar"); }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      await Promise.all([...selectedIds].map(id => api.delete("/customers/" + id)));
      showToast("success", `${selectedIds.size} cliente${selectedIds.size > 1 ? "s" : ""} eliminado${selectedIds.size > 1 ? "s" : ""}`);
      setSelectedIds(new Set()); fetchData();
    } catch { showToast("error", "Error al eliminar"); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const exportData = (type: "csv" | "xls") => {
    const data = items.map(c => ({
      Nombre: c.name, Email: c.email, Telefono: c.phone || "", Direccion: c.address || "",
      Tipo: c.customer_type || "", Pedidos: c.total_orders || 0,
      Gastado: `$${(c.total_spent || 0).toFixed(2)}`,
      Registro: c.created_at ? new Date(c.created_at).toLocaleDateString() : "",
    }));
    if (type === "csv") downloadCSV(data, "clientes");
    else downloadExcel(data, "clientes");
  };

  const shareList = () => shareWhatsAppItem("Clientes - Taller Motos", `Total: ${items.length} clientes\nPedidos: ${totalOrders}\nGastado total: $${totalSpent.toFixed(2)}\n\nPanel de administración`, window.location.href);

  const allSelected = paginated.length > 0 && paginated.every(c => selectedIds.has(c.id));
  const SparkData = { orders: items.slice(0, 8).map(c => c.total_orders || 0), spent: items.slice(0, 8).map(c => c.total_spent || 0) };

  const startIdx = sorted.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(page * PAGE_SIZE, sorted.length);

  const filterTabs = [
    { key: "", label: "Todos" },
    { key: "1", label: "Registrados" },
    { key: "0", label: "Manuales" },
  ];

  const customerTypes = ["Particular", "Empresa", "Distribuidor", "Mecánico", "Frecuente"];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Clientes"
        description="CRM - Gestión de clientes del taller"
        breadcrumbs={[{ label: "Dashboard", to: "/" }, { label: "Clientes" }]}
        icon={<Users size={20} />}
        action={
          <div className="flex items-center gap-2">
            <button onClick={shareList} className="mp-btn-ghost text-xs" title="Compartir"><MessageCircle size={14} /></button>
            <button onClick={() => exportData("csv")} className="mp-btn-ghost text-xs" title="Exportar CSV"><Download size={14} /></button>
            <button onClick={openNew} className="mp-btn-primary text-xs"><Plus size={14} /> Nuevo Cliente</button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Clientes" value={items.length} icon={<Users size={18} />} iconColor="teal" subtitle="Registrados" sparkline={<SparkLine data={SparkData.orders} color="#FF6B00" />} />
        <KpiCard title="Total Pedidos" value={totalOrders} icon={<ShoppingBag size={18} />} iconColor="purple" sparkline={<SparkLine data={SparkData.orders} color="#8B5CF6" />} />
        <KpiCard title="Ingresos Totales" value={`$${totalSpent.toLocaleString()}`} icon={<DollarSign size={18} />} iconColor="orange" sparkline={<SparkLine data={SparkData.spent} color="#F59E0B" />} />
        <KpiCard title="Promedio por Cliente" value={`$${avgSpent.toFixed(0)}`} icon={<TrendingUp size={18} />} iconColor="pink" sparkline={<SparkLine data={SparkData.spent} color="#EC4899" />} />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] pointer-events-none" />
          <input className="mp-input pl-9 pr-9" placeholder="Buscar por nombre o email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)]"><X size={14} /></button>}
        </div>
        <div className="flex gap-1 p-0.5 rounded-lg bg-[var(--mp-bg-elevated)] border border-[var(--mp-border)]">
          {filterTabs.map((f) => (
            <button key={f.key} onClick={() => { setRegisteredFilter(f.key); setPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${registeredFilter === f.key ? "bg-[var(--mp-bg-surface)] text-[var(--mp-accent)] shadow-sm" : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-secondary)]"}`}>
              {f.label}
            </button>
          ))}
        </div>
        {selectedIds.size > 0 && (
          <button onClick={handleBatchDelete} className="mp-btn text-xs text-[var(--mp-danger)] bg-[var(--mp-danger-bg)] hover:bg-[rgba(239,68,68,0.2)]">
            <Trash2 size={12} /> Eliminar {selectedIds.size}
          </button>
        )}
        <span className="text-xs text-[var(--mp-text-tertiary)] ml-auto">{sorted.length} clientes</span>
      </div>

      {loading ? (
        <div className="mp-card overflow-hidden">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-[var(--mp-border-subtle)]">
              <div className="skeleton w-9 h-9 rounded-full" />
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-4 w-40" />
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-4 w-16" />
            </div>
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div className="mp-card py-12 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-[rgba(255,107,0,0.1)]">
            <Users size={28} className="text-[#FF6B00]" />
          </div>
          <h3 className="text-base font-semibold mb-1 text-[var(--mp-text-primary)]">{search ? "Sin resultados" : "Comienza aquí"}</h3>
          <p className="text-sm mb-5 text-[var(--mp-text-secondary)]">{search ? "No hay clientes que coincidan con la búsqueda" : "Registra tu primer cliente para empezar."}</p>
          {!search && (
            <button onClick={openNew} className="mp-btn-primary text-xs"><UserPlus size={14} /> Registrar Cliente</button>
          )}
        </div>
      ) : (
        <>
          <div className="mp-card overflow-hidden">
            <table className="mp-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <button onClick={() => setSelectedIds(allSelected ? new Set() : new Set(paginated.map(c => c.id)))}
                      className="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                      style={{ borderColor: allSelected ? "#FF6B00" : "var(--mp-border)", background: allSelected ? "#FF6B00" : "transparent" }}>
                      {allSelected && <Check size={10} className="text-white" />}
                    </button>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => toggleSort("name")}>
                    <span className="flex items-center gap-1">CLIENTE <ArrowUpDown size={10} /></span>
                  </th>
                  <th>CONTACTO</th>
                  <th className="cursor-pointer select-none" onClick={() => toggleSort("orders")}>
                    <span className="flex items-center gap-1">PEDIDOS <ArrowUpDown size={10} /></span>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => toggleSort("spent")}>
                    <span className="flex items-center gap-1">GASTADO <ArrowUpDown size={10} /></span>
                  </th>
                  <th className="text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((c, idx) => {
                  const isSelected = selectedIds.has(c.id);
                  return (
                    <tr key={c.id} className={isSelected ? "bg-[rgba(255,107,0,0.04)]" : ""}>
                      <td>
                        <button onClick={() => toggleSelect(c.id)}
                          className="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                          style={{ borderColor: isSelected ? "#FF6B00" : "var(--mp-border)", background: isSelected ? "#FF6B00" : "transparent" }}>
                          {isSelected && <Check size={10} className="text-white" />}
                        </button>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ background: `${avatarColors[idx % avatarColors.length]}18`, color: avatarColors[idx % avatarColors.length] }}>
                            {c.avatar ? <img src={c.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : getInitials(c.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold truncate cursor-pointer hover:opacity-70 text-[var(--mp-text-primary)]" onClick={() => openDetail(c)}>{c.name}</p>
                              {c.is_registered === 1 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[rgba(255,107,0,0.1)] text-[#FF6B00]">Web</span>}
                            </div>
                            <p className="text-[11px] text-[var(--mp-text-tertiary)] flex items-center gap-1"><Calendar size={9} /> {c.created_at ? new Date(c.created_at).toLocaleDateString("es-CO") : ""}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="text-xs text-[var(--mp-text-secondary)] flex items-center gap-1 truncate"><Mail size={10} /> {c.email}</p>
                        {c.phone && <p className="text-[11px] text-[var(--mp-text-tertiary)] flex items-center gap-1 mt-0.5"><Phone size={10} /> {c.phone}</p>}
                      </td>
                      <td>
                        <Badge variant="info">{c.total_orders || 0} pedidos</Badge>
                      </td>
                      <td>
                        <span className="text-sm font-bold text-[var(--mp-text-primary)]">${(c.total_spent || 0).toLocaleString()}</span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(c)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--mp-text-tertiary)] hover:text-[#F59E0B] hover:bg-[rgba(245,158,11,0.1)] transition-all" title="Editar">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => setDeleteConfirm(c.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--mp-text-tertiary)] hover:text-[var(--mp-danger)] hover:bg-[var(--mp-danger-bg)] transition-all" title="Eliminar">
                            <Trash2 size={13} />
                          </button>
                          {c.phone && (
                            <a href={`https://wa.me/${c.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--mp-text-tertiary)] hover:text-[#25D366] hover:bg-[rgba(37,211,102,0.1)] transition-all" title="WhatsApp">
                              <MessageCircle size={13} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-[var(--mp-text-tertiary)]">Mostrando {startIdx} a {endIdx} de {sorted.length} clientes</span>
            <Pagination page={page} perPage={PAGE_SIZE} total={sorted.length} onChange={setPage} />
          </div>
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} size="lg"
        title={editing ? "Editar Cliente" : "Nuevo Cliente"}
        description="Completa la información para registrar un nuevo cliente."
        footer={
          <>
            <button onClick={() => setModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--mp-text-secondary)] border border-[var(--mp-border)] hover:bg-[var(--mp-bg-hover)] transition-all">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={!form.name.trim() || !form.email.trim()}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-[#FF6B00] hover:bg-[#E05E00] transition-all flex items-center gap-2 shadow-lg shadow-[rgba(255,107,0,0.3)] disabled:opacity-50">
              <Check size={16} /> Guardar Cliente
            </button>
          </>
        }>
        <div className="space-y-5">
          {/* Información personal */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[rgba(139,92,246,0.1)]">
                <User size={14} className="text-[#8B5CF6]" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--mp-text-primary)]">Información personal</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Nombre completo *</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
                  <input className="mp-input pl-9" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Ej: Juan Pérez" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Email *</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
                  <input type="email" className="mp-input pl-9" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="Ej: juan.perez@correo.com" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Teléfono</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
                  <input className="mp-input pl-9" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Ej: +57 300 123 4567" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Dirección</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
                  <input className="mp-input pl-9" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Ej: Calle 123 #45-67, Bogotá" />
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[rgba(59,130,246,0.1)]">
                <Info size={14} className="text-[#3B82F6]" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--mp-text-primary)]">Información adicional</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Tipo de cliente</label>
                <select className="mp-input" value={form.customer_type} onChange={(e) => setForm({ ...form, customer_type: e.target.value })}>
                  <option value="">Seleccionar tipo</option>
                  {customerTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Notas</label>
                <textarea className="mp-input resize-none" rows={3} maxLength={200} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Información adicional sobre el cliente..." />
                <div className="flex justify-end mt-1"><span className="text-[10px] text-[var(--mp-text-tertiary)]">{form.notes?.length || 0}/200</span></div>
              </div>
            </div>
          </div>

          {/* Imagen del cliente */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[rgba(249,115,22,0.1)]">
                <Image size={14} className="text-[#F97316]" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--mp-text-primary)]">Imagen del cliente</h3>
            </div>
            <label className="block text-center py-5 rounded-xl border-2 border-dashed border-[var(--mp-border)] bg-[var(--mp-bg-elevated)] hover:border-[var(--mp-accent)] transition-colors cursor-pointer">
              {form.avatar ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={form.avatar} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-[var(--mp-border)]" />
                  <span className="text-xs text-[var(--mp-text-tertiary)]">Cambiar imagen</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <Upload size={22} className="text-[var(--mp-text-tertiary)]" />
                  <p className="text-xs text-[var(--mp-text-secondary)] font-medium">Arrastra una imagen aquí o haz clic para seleccionar</p>
                  <p className="text-[10px] text-[var(--mp-text-tertiary)]">JPG, PNG o GIF. Máx. 2MB</p>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const res = await uploadFile("/upload", file, "taller-motos/customers");
                  const url = res.data?.url || res.url || res.image || "";
                  if (url) setForm(f => ({ ...f, avatar: url }));
                } catch { showToast("error", "Error al subir avatar"); }
              }} />
            </label>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detailCustomer} onClose={() => setDetailCustomer(null)} size="md"
        title={detailCustomer?.name || "Detalle del Cliente"}>
        {detailCustomer && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[rgba(255,107,0,0.04)] border border-[rgba(255,107,0,0.15)]">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                style={{ background: `${avatarColors[7]}18`, color: avatarColors[7] }}>
                {detailCustomer.avatar ? <img src={detailCustomer.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : getInitials(detailCustomer.name)}
              </div>
              <div>
                <p className="text-base font-bold text-[var(--mp-text-primary)]">{detailCustomer.name}</p>
                <p className="text-xs text-[var(--mp-text-tertiary)]">{detailCustomer.email}</p>
                {detailCustomer.phone && <p className="text-xs text-[var(--mp-text-secondary)] mt-0.5">{detailCustomer.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-[var(--mp-bg-elevated)]">
                <p className="text-lg font-bold text-[var(--mp-text-primary)]">{detailCustomer.total_orders || 0}</p>
                <p className="text-[10px] text-[var(--mp-text-tertiary)]">Pedidos</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-[var(--mp-bg-elevated)]">
                <p className="text-lg font-bold text-[#F59E0B]">${(detailCustomer.total_spent || 0).toLocaleString()}</p>
                <p className="text-[10px] text-[var(--mp-text-tertiary)]">Gastado</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-[var(--mp-bg-elevated)]">
                <p className="text-lg font-bold text-[#FF6B00]">{detailCustomer.created_at ? new Date(detailCustomer.created_at).toLocaleDateString("es-CO") : "—"}</p>
                <p className="text-[10px] text-[var(--mp-text-tertiary)]">Registro</p>
              </div>
            </div>

            <h4 className="text-sm font-semibold flex items-center gap-2 text-[var(--mp-text-primary)]">
              <ShoppingBag size={14} /> Historial de Pedidos
              <span className="text-xs font-normal text-[var(--mp-text-tertiary)]">({customerOrders.length})</span>
            </h4>

            {ordersLoading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
            ) : customerOrders.length === 0 ? (
              <div className="rounded-xl py-8 px-6 text-center border border-dashed border-[var(--mp-border)]">
                <ShoppingBag size={24} className="mx-auto mb-2 text-[var(--mp-text-tertiary)]" />
                <p className="text-sm text-[var(--mp-text-secondary)]">Este cliente no tiene pedidos.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {customerOrders.map((order: any) => {
                  const st: any = { pending: { color: "#F59E0B", variant: "warning" }, paid: { color: "#10B981", variant: "success" }, shipped: { color: "#8B5CF6", variant: "info" }, delivered: { color: "#22C55E", variant: "success" }, cancelled: { color: "#EF4444", variant: "danger" } };
                  const s = st[order.status] || st.pending;
                  return (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--mp-bg-elevated)]">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate text-[var(--mp-text-primary)]">#{order.id?.slice(0, 8)}</p>
                        <p className="text-[11px] text-[var(--mp-text-tertiary)]">{order.created_at ? new Date(order.created_at).toLocaleDateString() : ""} · {Array.isArray(order.items) ? order.items.length : 0} items</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold">${(Number(order.total) || 0).toLocaleString()}</span>
                        <Badge variant={s.variant}>{order.status === "pending" ? "Pendiente" : order.status === "paid" ? "Pagado" : order.status === "shipped" ? "Enviado" : order.status === "delivered" ? "Entregado" : "Cancelado"}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} size="sm"
        title="Eliminar cliente"
        footer={
          <>
            <button onClick={() => setDeleteConfirm(null)} className="mp-btn-ghost text-xs">Cancelar</button>
            <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="mp-btn text-xs text-[var(--mp-danger)] bg-[var(--mp-danger-bg)] hover:bg-[rgba(239,68,68,0.2)]">Eliminar</button>
          </>
        }>
        <p className="text-sm text-[var(--mp-text-secondary)]">¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.</p>
      </Modal>
    </div>
  );
}
