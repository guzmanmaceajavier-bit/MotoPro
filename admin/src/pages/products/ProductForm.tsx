import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import ImageUpload from "@/components/ImageUpload";
import { useUnsavedChanges, useBeforeLeave } from "@/hooks/useUnsavedChanges";
import { Brand, Category } from "@/types";
import { Input } from "@shared/components/ui/Input";
import { Select } from "@shared/components/ui/Select";
import { Textarea } from "@shared/components/ui/Textarea";
import { Button } from "@shared/components/ui/Button";
import { Badge } from "@shared/components/ui/Badge";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import { Save, Package, Tag, Layers, Building2, Hash, Check, BarChart3, Bike, MapPin, Truck, Shield, Award, Star } from "lucide-react";

interface Supplier { id: string; name: string; }

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: "", sku: "", purchase_price: "", price: "", compare_price: "", stock: "0",
    description: "", image: "", category_id: "", subcategory_id: "", brand_id: "",
    is_active: "1",
    min_stock: "5", max_stock: "0", reorder_point: "0", location: "",
    vehicle_brand: "", vehicle_model: "", vehicle_year_start: "", vehicle_year_end: "",
    displacement: "", compatible_with: "universal", weight: "", supplier_id: "", barcode: "",
    warranty: "", quality_label: "", compatibility_text: ""
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [subcategories, setSubcategories] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "vehicle" | "stock">("info");
  useUnsavedChanges(dirty);
  useBeforeLeave(dirty);

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r || []));
    api.get("/brands?all=1").then((r) => setBrands(r || []));
    api.get("/suppliers").then((r) => setSuppliers(Array.isArray(r) ? r : r?.data || [])).catch(() => {});
    if (isEdit) {
      api.get(`/products/${id}`).then((p) => {
        setForm({
          name: p.name, sku: p.sku || "", purchase_price: String(p.purchase_price || 0),
          price: String(p.price), compare_price: String(p.compare_price || ""), stock: String(p.stock), description: p.description || "",
          image: p.image || "", category_id: p.category_id, subcategory_id: p.subcategory_id || "",
          brand_id: p.brand_id || "", is_active: String(p.is_active),
          min_stock: String(p.min_stock || 5), max_stock: String(p.max_stock || 0),
          reorder_point: String(p.reorder_point || 0), location: p.location || "",
          vehicle_brand: p.vehicle_brand || "", vehicle_model: p.vehicle_model || "",
          vehicle_year_start: p.vehicle_year_start || "", vehicle_year_end: p.vehicle_year_end || "",
          displacement: p.displacement || "", compatible_with: p.compatible_with || "universal",
          weight: String(p.weight || ""), supplier_id: p.supplier_id || "", barcode: p.barcode || "",
          warranty: p.warranty || "", quality_label: p.quality_label || "", compatibility_text: p.compatibility_text || ""
        });
        if (p.category_id) loadSubcategories(p.category_id);
      });
    }
  }, [id]);

  const loadSubcategories = async (catId: string) => {
    try { const r = await api.get(`/categories/${catId}/subcategories`); setSubcategories(r || []); } catch { setSubcategories([]); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setDirty(true);
    if (name === "category_id") { setForm(prev => ({ ...prev, subcategory_id: "" })); loadSubcategories(value); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return showToast("error", "El nombre del producto es obligatorio");
    const pPrice = parseFloat(form.purchase_price) || 0;
    const sPrice = parseFloat(form.price) || 0;
    if (pPrice > 0 && sPrice > 0 && sPrice <= pPrice) return showToast("error", "El precio de venta debe ser mayor al precio de compra");
    setSaving(true);
    try {
      const data = {
        ...form,
        purchase_price: pPrice, price: sPrice, compare_price: parseFloat(form.compare_price) || 0,
        stock: parseInt(form.stock) || 0,
        is_active: parseInt(form.is_active),
        min_stock: parseInt(form.min_stock) || 5, max_stock: parseInt(form.max_stock) || 0,
        reorder_point: parseInt(form.reorder_point) || 0,
        weight: parseFloat(form.weight) || 0,
        warranty: form.warranty, quality_label: form.quality_label, compatibility_text: form.compatibility_text
      };
      if (isEdit) await api.put(`/products/${id}`, data);
      else await api.post("/products", data);
      setDirty(false);
      showToast("success", isEdit ? "Producto actualizado" : "Producto creado");
      navigate("/products");
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); } finally { setSaving(false); }
  };

  const purchasePrice = parseFloat(form.purchase_price) || 0;
  const price = parseFloat(form.price) || 0;
  const stock = parseInt(form.stock) || 0;
  const profit = price - purchasePrice;
  const margin = purchasePrice > 0 ? ((profit / purchasePrice) * 100) : 0;

  const tabs = [
    { key: "info", label: "Información" },
    { key: "features", label: "Características" },
    { key: "vehicle", label: "Compatibilidad" },
    { key: "stock", label: "Stock y Ubicación" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Editar Producto" : "Nuevo Producto"}
        description={isEdit ? "Actualiza los datos del producto" : "Agrega un nuevo producto al catálogo"}
        backTo="/products"
        breadcrumbs={[{ label: "Productos", to: "/products" }, { label: isEdit ? "Editar" : "Nuevo" }]}
        icon={<Package size={20} />}
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="border-b border-[var(--mp-border)]">
              <div className="flex gap-1">
                {tabs.map(t => (
                  <button key={t.key} type="button" onClick={() => setActiveTab(t.key as typeof activeTab)}
                    className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
                      activeTab === t.key
                        ? "border-[var(--mp-accent)] text-[var(--mp-accent)]"
                        : "border-transparent text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-secondary)]"
                    }`}>{t.label}</button>
                ))}
              </div>
            </div>

            {/* Tab: Info */}
            {activeTab === "info" && (
              <div className="space-y-6">
                <SectionCard title="Nombre y código">
                  <div className="space-y-3">
                    <Input label="Nombre *" name="name" value={form.name} onChange={handleChange} required placeholder="Ej: Batería YTX7L-BS" leftIcon={<Tag size={16} />} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="SKU" name="sku" value={form.sku} onChange={handleChange} placeholder="SKU" leftIcon={<Hash size={16} />} />
                      <Input label="Código de barras" name="barcode" value={form.barcode} onChange={handleChange} placeholder="Barcode" />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Clasificación">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Select label="Categoría *" name="category_id" value={form.category_id} onChange={handleChange}
                      placeholder="Seleccionar..." options={categories.map(c => ({ value: c.id, label: c.name }))} />
                    <Select label="Subcategoría" name="subcategory_id" value={form.subcategory_id} onChange={handleChange}
                      placeholder="Seleccionar..." options={subcategories.map(s => ({ value: s.id, label: s.name }))} />
                    <Select label="Marca" name="brand_id" value={form.brand_id} onChange={handleChange}
                      placeholder="Seleccionar..." options={brands.map(b => ({ value: b.id, label: b.name }))} />
                    <Select label="Proveedor" name="supplier_id" value={form.supplier_id} onChange={handleChange}
                      placeholder="Seleccionar..." options={suppliers.map(s => ({ value: s.id, label: s.name }))} />
                  </div>
                </SectionCard>

                <SectionCard title="Precios">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <Input label="Precio compra" name="purchase_price" type="number" step="0.01" value={form.purchase_price} onChange={handleChange} placeholder="0.00" leftIcon={<span className="text-text-tertiary">$</span>} />
                    <Input label="Precio venta" name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required placeholder="0.00" leftIcon={<span className="text-text-tertiary">$</span>} />
                    <Input label="Precio anterior" name="compare_price" type="number" step="0.01" value={form.compare_price} onChange={handleChange} placeholder="0.00" helperText="Para mostrar descuento" />
                    <Input label="Peso (kg)" name="weight" type="number" step="0.01" value={form.weight} onChange={handleChange} placeholder="0.00" />
                  </div>
                  {purchasePrice > 0 && price > 0 && (
                    <div className="mt-3 p-3 rounded-lg flex items-center justify-between" style={{ background: profit > 0 ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)" }}>
                      <div className="flex items-center gap-1.5">
                        <BarChart3 size={14} style={{ color: profit > 0 ? "#10B981" : "#EF4444" }} />
                        <span className="text-xs font-semibold" style={{ color: profit > 0 ? "#10B981" : "#EF4444" }}>Ganancia/unidad</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold" style={{ color: profit > 0 ? "#10B981" : "#EF4444" }}>${profit.toFixed(2)}</span>
                        <span className="text-xs font-semibold ml-2" style={{ color: profit > 0 ? "#10B981" : "#EF4444" }}>({margin.toFixed(1)}%)</span>
                      </div>
                    </div>
                  )}
                </SectionCard>

                <SectionCard title="Descripción">
                  <Textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe el producto, características, compatibilidad..." />
                </SectionCard>
              </div>
            )}

            {/* Tab: Features */}
            {activeTab === "features" && (
              <div className="space-y-6">
                <SectionCard title="Características del producto" description="Información que se mostrará en el carrito y checkout">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 flex items-center gap-2">
                        <Shield size={14} className="text-[var(--mp-accent)]" />
                        Garantía
                      </label>
                      <input name="warranty" value={form.warranty} onChange={handleChange}
                        className="mp-input" placeholder="Ej: 3 meses, 1 año, Sin garantía" />
                      <p className="text-[10px] text-[var(--mp-text-tertiary)] mt-1">Ejemplo: 3 meses, 6 meses, 1 año</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 flex items-center gap-2">
                        <Award size={14} className="text-[var(--mp-accent)]" />
                        Etiqueta de calidad
                      </label>
                      <input name="quality_label" value={form.quality_label} onChange={handleChange}
                        className="mp-input" placeholder="Ej: Original, Genérica, Premium" />
                      <p className="text-[10px] text-[var(--mp-text-tertiary)] mt-1">Ejemplo: Original, Genérica, Premium, Profesional</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 flex items-center gap-2">
                        <Star size={14} className="text-[var(--mp-accent)]" />
                        Texto de compatibilidad
                      </label>
                      <input name="compatibility_text" value={form.compatibility_text} onChange={handleChange}
                        className="mp-input" placeholder="Ej: Universal, Honda, Yamaha" />
                      <p className="text-[10px] text-[var(--mp-text-tertiary)] mt-1">Texto breve que se muestra como compatibilidad del producto</p>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Vista previa">
                  <div className="p-4 rounded-lg border border-[var(--mp-border)] bg-[var(--mp-bg-elevated)]">
                    <p className="text-xs text-[var(--mp-text-tertiary)] mb-3">Así se verá en el carrito:</p>
                    <div className="flex items-center gap-6">
                      {form.warranty && (
                        <div className="flex items-center gap-2">
                          <Shield size={18} className="text-[var(--mp-accent)]" />
                          <div>
                            <p className="text-xs font-semibold text-[var(--mp-text-primary)]">Garantía</p>
                            <p className="text-[10px] text-[var(--mp-text-tertiary)]">{form.warranty}</p>
                          </div>
                        </div>
                      )}
                      {form.quality_label && (
                        <div className="flex items-center gap-2">
                          <Award size={18} className="text-[var(--mp-accent)]" />
                          <div>
                            <p className="text-xs font-semibold text-[var(--mp-text-primary)]">Calidad</p>
                            <p className="text-[10px] text-[var(--mp-text-tertiary)]">{form.quality_label}</p>
                          </div>
                        </div>
                      )}
                      {form.compatibility_text && (
                        <div className="flex items-center gap-2">
                          <Star size={18} className="text-[var(--mp-accent)]" />
                          <div>
                            <p className="text-xs font-semibold text-[var(--mp-text-primary)]">Compatibilidad</p>
                            <p className="text-[10px] text-[var(--mp-text-tertiary)]">{form.compatibility_text}</p>
                          </div>
                        </div>
                      )}
                      {!form.warranty && !form.quality_label && !form.compatibility_text && (
                        <p className="text-xs text-[var(--mp-text-tertiary)] italic">Completa los campos para ver la vista previa</p>
                      )}
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

            {/* Tab: Vehicle Compatibility */}
            {activeTab === "vehicle" && (
              <div className="space-y-6">
                <SectionCard title="Compatibilidad con vehículos" description="Especifica qué motocicletas son compatibles con este producto">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Tipo de compatibilidad</label>
                      <select name="compatible_with" value={form.compatible_with} onChange={handleChange} className="mp-input">
                        <option value="universal">Universal (todas las motos)</option>
                        <option value="specific">Específico (seleccionar marca/modelo)</option>
                      </select>
                    </div>

                    {form.compatible_with === "specific" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Marca de moto</label>
                          <div className="relative">
                            <Bike size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
                            <input name="vehicle_brand" value={form.vehicle_brand} onChange={handleChange}
                              className="mp-input pl-9" placeholder="Honda, Yamaha, Suzuki..." />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Modelo</label>
                          <input name="vehicle_model" value={form.vehicle_model} onChange={handleChange}
                            className="mp-input" placeholder="CBR 600, MT-09, GSX-R..." />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Año desde</label>
                          <input name="vehicle_year_start" value={form.vehicle_year_start} onChange={handleChange}
                            className="mp-input" placeholder="2015" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Año hasta</label>
                          <input name="vehicle_year_end" value={form.vehicle_year_end} onChange={handleChange}
                            className="mp-input" placeholder="2024" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Cilindraje</label>
                          <input name="displacement" value={form.displacement} onChange={handleChange}
                            className="mp-input" placeholder="600cc, 1000cc..." />
                        </div>
                      </div>
                    )}
                  </div>
                </SectionCard>
              </div>
            )}

            {/* Tab: Stock */}
            {activeTab === "stock" && (
              <div className="space-y-6">
                <SectionCard title="Stock actual">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input label="Stock actual" name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="0" />
                    <div className="flex items-end">
                      {stock > 0 ? (
                        <Badge variant={stock <= parseInt(form.min_stock) ? "warning" : "success"}>
                          {stock <= parseInt(form.min_stock) ? "Stock bajo" : "Stock OK"}
                        </Badge>
                      ) : (
                        <Badge variant="danger">Sin stock</Badge>
                      )}
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Niveles de stock" config="stock">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input label="Stock mínimo" name="min_stock" type="number" value={form.min_stock} onChange={handleChange}
                      placeholder="5" helperText="Alerta cuando stock baje de este nivel" />
                    <Input label="Stock máximo" name="max_stock" type="number" value={form.max_stock} onChange={handleChange}
                      placeholder="0 = sin límite" helperText="Capacidad máxima de almacenamiento" />
                    <Input label="Punto de reorden" name="reorder_point" type="number" value={form.reorder_point} onChange={handleChange}
                      placeholder="0" helperText="Cuándo sugerir nueva compra" />
                  </div>
                </SectionCard>

                <SectionCard title="Ubicación en almacén">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1.5 block">Ubicación</label>
                      <div className="relative">
                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
                        <input name="location" value={form.location} onChange={handleChange}
                          className="mp-input pl-9" placeholder="Ej: Estante A3, Pasillo 2" />
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SectionCard title="Imagen">
              <div className="w-full aspect-square max-w-[200px] mx-auto mb-4 rounded-lg overflow-hidden border border-[var(--mp-border)] bg-[var(--mp-bg-elevated)]">
                {form.image ? (
                  <img src={form.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <Package size={32} className="text-[var(--mp-text-tertiary)]" />
                    <span className="text-xs text-[var(--mp-text-tertiary)]">Sin imagen</span>
                  </div>
                )}
              </div>
              <ImageUpload folder="taller-motos/products" value={form.image} onChange={(url) => setForm(p => ({ ...p, image: url }))} />
            </SectionCard>

            <SectionCard title="Resumen">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[var(--mp-text-tertiary)]">Stock</span><span className="font-medium">{stock} uds</span></div>
                <div className="flex justify-between"><span className="text-[var(--mp-text-tertiary)]">Mínimo</span><span>{form.min_stock}</span></div>
                <div className="flex justify-between"><span className="text-[var(--mp-text-tertiary)]">Reorden</span><span>{form.reorder_point}</span></div>
                {form.location && <div className="flex justify-between"><span className="text-[var(--mp-text-tertiary)]">Ubicación</span><span>{form.location}</span></div>}
                {form.vehicle_brand && <div className="flex justify-between"><span className="text-[var(--mp-text-tertiary)]">Marca moto</span><span>{form.vehicle_brand}</span></div>}
                {form.displacement && <div className="flex justify-between"><span className="text-[var(--mp-text-tertiary)]">Cilindraje</span><span>{form.displacement}</span></div>}
              </div>
            </SectionCard>

            <SectionCard title="Estado">
              <div className="flex gap-2 mb-4">
                <button type="button" onClick={() => setForm(p => ({ ...p, is_active: "1" }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${form.is_active === "1" ? "bg-[var(--mp-accent)] text-white border-[var(--mp-accent)]" : "border-[var(--mp-border)] text-[var(--mp-text-secondary)]"}`}>
                  Activo
                </button>
                <button type="button" onClick={() => setForm(p => ({ ...p, is_active: "0" }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${form.is_active === "0" ? "bg-[var(--mp-accent)] text-white border-[var(--mp-accent)]" : "border-[var(--mp-border)] text-[var(--mp-text-secondary)]"}`}>
                  Inactivo
                </button>
              </div>
            </SectionCard>

            <div className="flex gap-3">
              <Button type="submit" disabled={saving || !form.name.trim()} loading={saving} fullWidth className="mp-btn-primary">
                <Save size={16} /> {isEdit ? "Actualizar" : "Crear Producto"}
              </Button>
              <Button type="button" variant="secondary" fullWidth onClick={() => navigate("/products")} className="mp-btn-ghost">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
