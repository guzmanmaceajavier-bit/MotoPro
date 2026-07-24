import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { Search, Plus, Package, Download, Upload, Pencil, Copy, MoreHorizontal, Filter, SlidersHorizontal } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@shared/components/ui/KpiCard";
import { Badge } from "@shared/components/ui/Badge";
import { Pagination } from "@shared/components/ui/Pagination";

interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  categoryColor: string;
  price: number;
  stock: number;
  stockStatus: string;
  status: 'active' | 'inactive';
  image?: string;
}

const categoryColorMap: Record<string, string> = {
  Accesorios: "blue", Lubricantes: "green", Repuestos: "orange",
  Transmisión: "purple", Frenos: "red", Suspensión: "teal",
  Manejo: "info", Escape: "warning", Llantas: "accent",
};

const categoryBadgeColor: Record<string, 'info' | 'accent' | 'success' | 'warning' | 'danger' | 'default'> = {
  Accesorios: 'info', Lubricantes: 'success', Repuestos: 'warning', Transmisión: 'accent',
  Frenos: 'danger', Suspensión: 'info', Manejo: 'accent', Escape: 'warning', Llantas: 'default',
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    api.get("/products?all=1").then((r) => {
      const items = Array.isArray(r) ? r : [];
      setProducts(items.map((p: any): Product => ({
        id: String(p.id),
        name: p.name || "",
        description: p.description || "",
        sku: p.sku || "",
        category: p.category_name || "",
        categoryColor: categoryColorMap[p.category_name] || "default",
        price: Number(p.price) || 0,
        stock: Number(p.stock) || 0,
        stockStatus: Number(p.stock) === 0 ? "Agotado" : `${Number(p.stock)} disponibles`,
        status: p.is_active ? "active" : "inactive",
        image: p.image,
      })));
    }).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    products.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === "all" || p.category === categoryFilter;
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    }), [search, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const activeCount = products.filter(p => p.status === 'active').length;
  const outOfStock = products.filter(p => p.stock === 0).length;

  if (loading) return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-xl border border-border bg-surface-secondary p-5">
            <div className="skeleton h-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Productos"
        description="Gestiona el catálogo de productos de MotoPro"
        breadcrumbs={[{ label: "Catálogo", to: "/products" }, { label: "Productos" }]}
        icon={<Package size={20} />}
        action={
          <div className="flex items-center gap-2">
            <button className="mp-btn-secondary text-xs">
              <Download size={14} /> Exportar
            </button>
            <button className="mp-btn-secondary text-xs">
              <Upload size={14} /> Importar
            </button>
            <Link to="/products/new" className="mp-btn-primary text-xs">
              <Plus size={14} /> Nuevo producto
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Productos" value={products.length.toLocaleString()} change={{ value: "+12.5% vs. el mes pasado", positive: true }} icon={<Package size={18} />} iconColor="teal" />
        <KpiCard title="Stock Total" value={totalStock.toLocaleString() + " un."} change={{ value: "unidades en inventario", positive: true }} icon={<Package size={18} />} iconColor="blue" />
        <KpiCard title="Productos Activos" value={activeCount} change={{ value: `del ${(activeCount/products.length*100).toFixed(1)}%`, positive: true }} icon={<Package size={18} />} iconColor="green" />
        <KpiCard title="Sin Stock" value={outOfStock} change={{ value: "+5.2% vs. el mes pasado", positive: false }} icon={<Package size={18} />} iconColor="red" />
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] pointer-events-none" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por nombre, SKU o código..."
            className="mp-input pl-9"
          />
        </div>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
          className="mp-select text-xs w-full sm:w-auto">
          <option value="all">Categoría: Todas</option>
          <option value="Accesorios">Accesorios</option>
          <option value="Lubricantes">Lubricantes</option>
          <option value="Repuestos">Repuestos</option>
          <option value="Transmisión">Transmisión</option>
          <option value="Frenos">Frenos</option>
          <option value="Suspensión">Suspensión</option>
          <option value="Manejo">Manejo</option>
          <option value="Escape">Escape</option>
          <option value="Llantas">Llantas</option>
        </select>
        <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)}
          className="mp-select text-xs w-full sm:w-auto">
          <option value="all">Marca: Todas</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="mp-select text-xs w-full sm:w-auto">
          <option value="all">Estado: Todos</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
        <button className="mp-btn-ghost text-xs">
          <SlidersHorizontal size={14} /> Más filtros
        </button>
      </div>

      {/* Table */}
      <div className="mp-card overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="mp-table">
            <thead>
              <tr>
                <th className="w-12 px-4">
                  <input type="checkbox" className="rounded cursor-pointer accent-[var(--mp-accent)]" />
                </th>
                <th>Producto</th>
                <th className="hidden lg:table-cell">SKU</th>
                <th className="hidden lg:table-cell">Categoría</th>
                <th className="text-right">Precio</th>
                <th>Stock</th>
                <th className="hidden lg:table-cell">Estado</th>
                <th className="text-right w-24">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((p) => (
                <tr key={p.id}>
                  <td className="px-4">
                    <input type="checkbox" className="rounded cursor-pointer accent-[var(--mp-accent)]" />
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--mp-bg-elevated)] flex items-center justify-center text-[var(--mp-text-tertiary)] shrink-0">
                        <Package size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--mp-text-primary)] truncate">{p.name}</p>
                        <p className="text-xs text-[var(--mp-text-tertiary)] truncate">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden lg:table-cell">
                    <span className="text-xs text-[var(--mp-text-secondary)] font-mono">{p.sku}</span>
                  </td>
                  <td className="hidden lg:table-cell">
                    <Badge variant={categoryBadgeColor[p.category] || 'default'}>{p.category}</Badge>
                  </td>
                  <td className="text-right">
                    <span className="text-sm font-semibold text-[var(--mp-text-primary)]">${p.price.toLocaleString()}</span>
                  </td>
                  <td>
                    <div>
                      <span className={`text-sm font-semibold ${p.stock === 0 ? 'text-[var(--mp-danger)]' : p.stock <= 5 ? 'text-[var(--mp-warning)]' : 'text-[var(--mp-text-primary)]'}`}>{p.stock}</span>
                      <p className={`text-xs ${p.stock === 0 ? 'text-[var(--mp-danger)]' : p.stock <= 5 ? 'text-[var(--mp-warning)]' : 'text-[var(--mp-text-tertiary)]'}`}>{p.stockStatus}</p>
                    </div>
                  </td>
                  <td className="hidden lg:table-cell">
                    <Badge variant={p.status === 'active' ? 'success' : 'danger'} dot>{p.status === 'active' ? 'Activo' : 'Inactivo'}</Badge>
                  </td>
                  <td className="text-right">
                    <div className="inline-flex items-center gap-1 justify-end">
                      <button className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)] transition-colors" title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)] transition-colors" title="Duplicar">
                        <Copy size={14} />
                      </button>
                      <button className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)] transition-colors" title="Más">
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden divide-y divide-[var(--mp-border-subtle)]">
          {paged.map((p) => (
            <div key={p.id} className="p-4 hover:bg-[var(--mp-bg-hover)] transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[var(--mp-bg-elevated)] flex items-center justify-center text-[var(--mp-text-tertiary)] shrink-0">
                  <Package size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--mp-text-primary)] truncate">{p.name}</p>
                  <p className="text-xs text-[var(--mp-text-tertiary)]">{p.sku}</p>
                </div>
                <Badge variant={p.status === 'active' ? 'success' : 'danger'} dot>{p.status === 'active' ? 'Activo' : 'Inactivo'}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <Badge variant={categoryBadgeColor[p.category] || 'default'}>{p.category}</Badge>
                <span className="font-semibold text-[var(--mp-text-primary)]">${p.price.toLocaleString()}</span>
                <span className={p.stock === 0 ? 'text-[var(--mp-danger)]' : 'text-[var(--mp-text-tertiary)]'}>Stock: {p.stock}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-[var(--mp-text-tertiary)]">
          Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, filtered.length)} de {filtered.length} resultados
        </span>
        <div className="flex items-center gap-3">
          <select className="mp-select text-xs w-auto" defaultValue="10">
            <option value="10">Mostrando 10 por página</option>
            <option value="25">Mostrando 25 por página</option>
            <option value="50">Mostrando 50 por página</option>
          </select>
          <Pagination page={page} perPage={pageSize} total={filtered.length} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
