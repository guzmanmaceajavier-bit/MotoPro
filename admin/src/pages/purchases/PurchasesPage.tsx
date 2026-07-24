import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import PageHeader from "@/components/PageHeader";
import { Badge } from "@shared/components/ui/Badge";
import { Pagination } from "@shared/components/ui/Pagination";
import KpiCard from "@shared/components/ui/KpiCard";
import {
  ShoppingCart, Plus, Search, Eye, Edit2, Trash2, Package,
  CheckCircle2, Clock, Truck, DollarSign, Calendar, FileText, Filter
} from "lucide-react";

interface Purchase {
  id: string; supplier: string; supplier_name: string; items: string;
  total: number; status: string; notes: string; invoice_number: string;
  purchase_date: string; expected_date: string; received_date: string;
  payment_status: string; payment_method: string; created_at: string;
}

interface Supplier { id: string; name: string; }
interface Product { id: string; name: string; sku: string; stock: number; purchase_price: number; }

const statusConfig: Record<string, { label: string; variant: "info" | "warning" | "success" | "danger" }> = {
  pending: { label: "Pendiente", variant: "warning" },
  ordered: { label: "Ordenada", variant: "info" },
  received: { label: "Recibida", variant: "success" },
  cancelled: { label: "Cancelada", variant: "danger" },
};

const PAGE_SIZE = 10;

export default function PurchasesPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [showForm, setShowForm] = useState(false);
  const [editPurchase, setEditPurchase] = useState<Purchase | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    supplier_id: "", invoice_number: "", purchase_date: new Date().toISOString().split("T")[0],
    expected_date: "", payment_method: "", notes: ""
  });
  const [items, setItems] = useState<{ product_id: string; name: string; quantity: number; unit_cost: number }[]>([]);
  const [itemInput, setItemInput] = useState({ product_id: "", name: "", quantity: 1, unit_cost: 0 });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, received: 0, totalSpent: 0, thisMonth: 0 });
  const [detailPurchase, setDetailPurchase] = useState<Purchase | null>(null);

  const loadPurchases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));
      const res = await api.get(`/purchases?${params.toString()}`);
      if (res?.data) { setPurchases(res.data); setPagination(res.pagination || { total: 0, totalPages: 0 }); }
      else setPurchases(Array.isArray(res) ? res : []);
    } catch { setPurchases([]); }
    finally { setLoading(false); }
  };

  const loadMeta = async () => {
    try {
      const [supRes, prodRes, statsRes] = await Promise.all([
        api.get("/suppliers"),
        api.get("/products?all=1"),
        api.get("/purchases/stats").catch(() => null),
      ]);
      setSuppliers(Array.isArray(supRes) ? supRes : supRes?.data || []);
      setProducts(Array.isArray(prodRes) ? prodRes : prodRes?.data || []);
      if (statsRes) setStats(statsRes);
    } catch {}
  };

  useEffect(() => { loadPurchases(); }, [search, statusFilter, page]);
  useEffect(() => { loadMeta(); }, []);

  const openCreate = () => {
    setEditPurchase(null);
    setForm({ supplier_id: "", invoice_number: "", purchase_date: new Date().toISOString().split("T")[0], expected_date: "", payment_method: "", notes: "" });
    setItems([]);
    setShowForm(true);
  };

  const openEdit = (p: Purchase) => {
    setEditPurchase(p);
    const parsedItems = typeof p.items === "string" ? JSON.parse(p.items || "[]") : p.items || [];
    setForm({
      supplier_id: p.supplier || "", invoice_number: p.invoice_number || "",
      purchase_date: p.purchase_date || "", expected_date: p.expected_date || "",
      payment_method: p.payment_method || "", notes: p.notes || ""
    });
    setItems(parsedItems.map((i: any) => ({ product_id: i.product_id || "", name: i.name || "", quantity: i.quantity || 1, unit_cost: i.unit_cost || 0 })));
    setShowForm(true);
  };

  const savePurchase = async () => {
    if (items.length === 0) { showToast("error", "Agrega al menos un item"); return; }
    setSaving(true);
    try {
      const data = { ...form, items };
      if (editPurchase) await api.put(`/purchases/${editPurchase.id}`, data);
      else await api.post("/purchases", data);
      showToast("success", editPurchase ? "Compra actualizada" : "Compra creada");
      setShowForm(false);
      loadPurchases();
      loadMeta();
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  const deletePurchase = async (id: string) => {
    if (!confirm("¿Eliminar esta compra?")) return;
    try { await api.delete(`/purchases/${id}`); showToast("success", "Compra eliminada"); loadPurchases(); loadMeta(); }
    catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
  };

  const receivePurchase = async (id: string) => {
    if (!confirm("¿Marcar como recibida? Se actualizará el stock automáticamente.")) return;
    try { await api.post(`/purchases/${id}/receive`); showToast("success", "Compra recibida y stock actualizado"); loadPurchases(); loadMeta(); }
    catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
  };

  const addItem = () => {
    if (!itemInput.name.trim() && !itemInput.product_id) return;
    setItems([...items, { ...itemInput, quantity: itemInput.quantity || 1, unit_cost: itemInput.unit_cost || 0 }]);
    setItemInput({ product_id: "", name: "", quantity: 1, unit_cost: 0 });
  };

  const removeItem = (i: number) => setItems(items.filter((_, j) => j !== i));
  const totalItems = items.reduce((s, i) => s + i.quantity * i.unit_cost, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Compras"
        description="Gestiona las compras de repuestos y productos al taller"
        breadcrumbs={[{ label: "Inventario" }, { label: "Compras" }]}
        icon={<ShoppingCart size={20} />}
        action={
          <button onClick={openCreate} className="mp-btn-primary text-xs">
            <Plus size={14} /> Nueva Compra
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard title="Total Compras" value={stats.total} icon={<ShoppingCart size={18} />} iconColor="purple" />
        <KpiCard title="Pendientes" value={stats.pending} icon={<Clock size={18} />} iconColor="orange" />
        <KpiCard title="Recibidas" value={stats.received} icon={<CheckCircle2 size={18} />} iconColor="green" />
        <KpiCard title="Total Gastado" value={`$${stats.totalSpent.toLocaleString()}`} icon={<DollarSign size={18} />} iconColor="blue" />
        <KpiCard title="Este Mes" value={`$${stats.thisMonth.toLocaleString()}`} icon={<Calendar size={18} />} iconColor="teal" />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar compra..." className="mp-input pl-9" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="mp-input max-w-[160px] text-xs">
          <option value="all">Todos los estados</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Purchase Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-[var(--mp-bg-primary)] rounded-xl border border-[var(--mp-border)] w-full max-w-3xl mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[var(--mp-text-primary)]">{editPurchase ? "Editar Compra" : "Nueva Compra"}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">Proveedor</label>
                <select value={form.supplier_id} onChange={e => setForm(p => ({ ...p, supplier_id: e.target.value }))} className="mp-input text-xs">
                  <option value="">Seleccionar...</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">N° Factura</label>
                <input value={form.invoice_number} onChange={e => setForm(p => ({ ...p, invoice_number: e.target.value }))} className="mp-input" placeholder="FAC-001" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">Fecha compra</label>
                <input type="date" value={form.purchase_date} onChange={e => setForm(p => ({ ...p, purchase_date: e.target.value }))} className="mp-input" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">Fecha esperada</label>
                <input type="date" value={form.expected_date} onChange={e => setForm(p => ({ ...p, expected_date: e.target.value }))} className="mp-input" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">Método de pago</label>
                <select value={form.payment_method} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))} className="mp-input text-xs">
                  <option value="">Seleccionar...</option>
                  <option value="cash">Efectivo</option>
                  <option value="transfer">Transferencia</option>
                  <option value="credit">Crédito</option>
                  <option value="card">Tarjeta</option>
                </select>
              </div>
              <div className="col-span-2 md:col-span-3">
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">Notas</label>
                <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="mp-input" placeholder="Notas..." />
              </div>
            </div>

            <div className="border-t border-[var(--mp-border-subtle)] pt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-[var(--mp-text-secondary)]">Items de la compra</p>
                <button onClick={addItem} className="mp-btn-ghost text-xs"><Package size={13} /> Agregar item</button>
              </div>
              <div className="flex gap-2 mb-3">
                <select value={itemInput.product_id} onChange={e => {
                  const prod = products.find(p => p.id === e.target.value);
                  setItemInput(p => ({ ...p, product_id: e.target.value, name: prod?.name || "", unit_cost: prod?.purchase_price || 0 }));
                }} className="mp-input flex-1 text-xs">
                  <option value="">Seleccionar producto...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
                </select>
                <input value={itemInput.name} onChange={e => setItemInput(p => ({ ...p, name: e.target.value }))} placeholder="O escribir nombre" className="mp-input flex-1 text-xs" />
                <input type="number" value={itemInput.quantity} onChange={e => setItemInput(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))} className="mp-input w-20 text-xs" min={1} />
                <input type="number" value={itemInput.unit_cost} onChange={e => setItemInput(p => ({ ...p, unit_cost: parseFloat(e.target.value) || 0 }))} className="mp-input w-28 text-xs" placeholder="$0" />
              </div>
              {items.length > 0 && (
                <div className="space-y-1">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs px-3 py-2 rounded bg-[var(--mp-bg-elevated)]">
                      <span className="flex-1">{item.name || "Sin nombre"} x{item.quantity}</span>
                      <span className="w-24 text-right font-medium">${(item.quantity * item.unit_cost).toLocaleString()}</span>
                      <button onClick={() => removeItem(i)} className="ml-2 text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                    </div>
                  ))}
                  <div className="flex justify-end text-sm font-bold pt-2 border-t border-[var(--mp-border-subtle)]">
                    Total: ${totalItems.toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowForm(false)} className="mp-btn-ghost text-xs">Cancelar</button>
              <button onClick={savePurchase} disabled={saving} className="mp-btn-primary text-xs">
                {saving ? "Guardando..." : editPurchase ? "Actualizar" : "Crear compra"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDetailPurchase(null)}>
          <div className="bg-[var(--mp-bg-primary)] rounded-xl border border-[var(--mp-border)] w-full max-w-lg mx-4 p-6 space-y-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--mp-text-primary)]">Detalle de Compra</h3>
              <button onClick={() => setDetailPurchase(null)} className="text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)]">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-[var(--mp-text-tertiary)] text-xs">Proveedor</span><p className="font-medium">{detailPurchase.supplier_name || detailPurchase.supplier || "—"}</p></div>
              <div><span className="text-[var(--mp-text-tertiary)] text-xs">Factura</span><p className="font-medium">{detailPurchase.invoice_number || "—"}</p></div>
              <div><span className="text-[var(--mp-text-tertiary)] text-xs">Fecha</span><p>{detailPurchase.purchase_date || "—"}</p></div>
              <div><span className="text-[var(--mp-text-tertiary)] text-xs">Estado</span><Badge variant={statusConfig[detailPurchase.status]?.variant || "info"}>{statusConfig[detailPurchase.status]?.label || detailPurchase.status}</Badge></div>
              <div className="col-span-2"><span className="text-[var(--mp-text-tertiary)] text-xs">Total</span><p className="text-lg font-bold">${detailPurchase.total?.toLocaleString()}</p></div>
            </div>
            {(() => {
              const parsedItems = typeof detailPurchase.items === "string" ? JSON.parse(detailPurchase.items || "[]") : detailPurchase.items || [];
              return parsedItems.length > 0 ? (
                <div className="pt-3 border-t border-[var(--mp-border-subtle)]">
                  <p className="text-xs font-medium text-[var(--mp-text-secondary)] mb-2">Items</p>
                  {parsedItems.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs px-3 py-2 rounded bg-[var(--mp-bg-elevated)] mb-1">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-medium">${(item.quantity * item.unit_cost).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="mp-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--mp-border)]">
              <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase">Proveedor</th>
              <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase hidden md:table-cell">Factura</th>
              <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase hidden lg:table-cell">Fecha</th>
              <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase">Estado</th>
              <th className="text-right text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase">Total</th>
              <th className="text-right text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map(p => (
              <tr key={p.id} className="border-b border-[var(--mp-border-subtle)] hover:bg-[var(--mp-bg-elevated)] transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-[var(--mp-text-primary)]">{p.supplier_name || p.supplier || "—"}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell"><span className="text-sm text-[var(--mp-text-secondary)]">{p.invoice_number || "—"}</span></td>
                <td className="px-4 py-3 hidden lg:table-cell"><span className="text-xs text-[var(--mp-text-tertiary)]">{p.purchase_date || "—"}</span></td>
                <td className="px-4 py-3"><Badge variant={statusConfig[p.status]?.variant || "info"}>{statusConfig[p.status]?.label || p.status}</Badge></td>
                <td className="px-4 py-3 text-right"><span className="text-sm font-bold">${p.total?.toLocaleString()}</span></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setDetailPurchase(p)} className="mp-btn-ghost text-xs py-1.5 px-2" title="Ver"><Eye size={14} /></button>
                    {p.status === "pending" && (
                      <>
                        <button onClick={() => openEdit(p)} className="mp-btn-ghost text-xs py-1.5 px-2" title="Editar"><Edit2 size={14} /></button>
                        <button onClick={() => receivePurchase(p.id)} className="mp-btn-ghost text-xs py-1.5 px-2 text-emerald-600" title="Recibir"><Truck size={14} /></button>
                      </>
                    )}
                    <button onClick={() => deletePurchase(p.id)} className="mp-btn-ghost text-xs py-1.5 px-2 text-red-500" title="Eliminar"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {purchases.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-[var(--mp-text-tertiary)]">No hay compras</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--mp-text-tertiary)]">Mostrando {purchases.length} de {pagination.total} compras</span>
        <Pagination page={page} perPage={PAGE_SIZE} total={pagination.total} onChange={setPage} />
      </div>
    </div>
  );
}
