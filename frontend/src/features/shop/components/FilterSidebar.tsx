import { Star, SlidersHorizontal, RotateCcw, Bike, ChevronDown, X, Calendar } from "lucide-react";
import type { MotoBrand, Category } from "../types";

interface FilterSidebarProps {
  selectedCategory: string;
  searchQuery: string;
  searchCategory: string;
  selectedBrands: string[];
  selectedMotoBrand: string;
  selectedMotoModel: string;
  priceRange: [number, number];
  inStockOnly: boolean;
  minRating: number;
  motoFilterExpanded: boolean;
  brandsExpanded: boolean;
  availableBrands: [string, number][];
  maxPrice: number;
  selectedMotoModels: string[];
  hasActiveFilters: boolean;
  MOTO_BRANDS: MotoBrand[];
  storeCategories: Category[];
  onClearFilters: () => void;
  onSetSelectedCategory: (v: string) => void;
  onSetSearchQuery: (v: string) => void;
  onSetSearchCategory: (v: string) => void;
  onToggleBrand: (brand: string) => void;
  onSetSelectedMotoBrand: (v: string) => void;
  onSetSelectedMotoModel: (v: string) => void;
  onSetPriceRange: (v: [number, number]) => void;
  onSetInStockOnly: (v: boolean) => void;
  onSetMinRating: (v: number) => void;
  onSetSortBy: (v: string) => void;
  onSetMotoFilterExpanded: (v: boolean) => void;
  onSetBrandsExpanded: (v: boolean) => void;
}

export function FilterSidebar(props: FilterSidebarProps) {
  const {
    selectedCategory, selectedBrands, selectedMotoBrand, selectedMotoModel, priceRange, maxPrice,
    inStockOnly, minRating, motoFilterExpanded, brandsExpanded, availableBrands,
    selectedMotoModels, hasActiveFilters, MOTO_BRANDS, storeCategories,
    onClearFilters, onToggleBrand, onSetSelectedMotoBrand, onSetSelectedMotoModel,
    onSetPriceRange, onSetInStockOnly, onSetMinRating, onSetMotoFilterExpanded, onSetBrandsExpanded,
    onSetSelectedCategory,
  } = props;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <SlidersHorizontal size={14} /> Filtros
        </h2>
        {hasActiveFilters && (
          <button onClick={onClearFilters} className="text-xs text-interactive-accent hover:text-interactive-accent-hover flex items-center gap-1">
            <RotateCcw size={11} /> Limpiar todo
          </button>
        )}
      </div>

      {/* Step 1: Select your moto */}
      <div>
        <h3 className="text-xs font-bold text-text-primary mb-1">
          <span className="text-interactive-accent">1.</span> Selecciona tu moto
        </h3>
        <p className="text-[10px] text-text-tertiary mb-3">Elige tu moto para ver repuestos compatibles.</p>
        <div className="space-y-2">
          <div className="relative">
            <Bike size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <select value={selectedMotoBrand} onChange={(e) => { onSetSelectedMotoBrand(e.target.value); onSetSelectedMotoModel(""); }}
              className="w-full rounded-lg border border-border-subtle bg-surface-tertiary pl-9 pr-8 py-2.5 text-xs text-text-primary outline-none focus:border-interactive-accent appearance-none">
              <option value="">Selecciona marca</option>
              {MOTO_BRANDS.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
          </div>
          {selectedMotoBrand && (
            <div className="relative">
              <Bike size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <select value={selectedMotoModel} onChange={(e) => onSetSelectedMotoModel(e.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-surface-tertiary pl-9 pr-8 py-2.5 text-xs text-text-primary outline-none focus:border-interactive-accent appearance-none">
                <option value="">Selecciona modelo</option>
                {selectedMotoModels.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
            </div>
          )}
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <select className="w-full rounded-lg border border-border-subtle bg-surface-tertiary pl-9 pr-8 py-2.5 text-xs text-text-primary outline-none focus:border-interactive-accent appearance-none">
              <option value="">Selecciona año (opcional)</option>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Step 2: Categories */}
      <div>
        <h3 className="text-xs font-bold text-text-primary mb-3">
          <span className="text-interactive-accent">2.</span> Categorías
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => onSetSelectedCategory("")}
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
              !selectedCategory
                ? "bg-interactive-accent text-white"
                : "bg-surface-tertiary text-text-secondary hover:text-text-primary border border-border-subtle"
            }`}>
            Todas
          </button>
          {storeCategories.map(cat => (
            <button key={cat.id} onClick={() => onSetSelectedCategory(selectedCategory === cat.name ? "" : cat.name)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                selectedCategory === cat.name
                  ? "bg-interactive-accent text-white"
                  : "bg-surface-tertiary text-text-secondary hover:text-text-primary border border-border-subtle"
              }`}>
              {cat.name}
            </button>
          ))}
        </div>
        {storeCategories.length === 0 && (
          <p className="text-[10px] text-text-tertiary italic">No hay categorías disponibles</p>
        )}
      </div>

      {/* Step 3: Additional filters */}
      <div>
        <h3 className="text-xs font-bold text-text-primary mb-3">
          <span className="text-interactive-accent">3.</span> Filtros adicionales
        </h3>

        {/* Price */}
        <div className="mb-4">
          <label className="mb-1.5 block text-[11px] font-semibold text-text-secondary">Precio</label>
          <input type="range" min={0} max={maxPrice || 500000} value={priceRange[1]}
            onChange={(e) => onSetPriceRange([0, parseInt(e.target.value)])}
            className="w-full h-1.5 bg-surface-tertiary rounded-lg appearance-none cursor-pointer accent-interactive-accent" />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-text-tertiary">${priceRange[0].toLocaleString()}</span>
            <span className="text-[10px] text-text-tertiary font-medium">${priceRange[1].toLocaleString()}+</span>
          </div>
        </div>

        {/* Availability */}
        <div className="mb-4">
          <label className="mb-1.5 block text-[11px] font-semibold text-text-secondary">Disponibilidad</label>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input type="checkbox" checked={inStockOnly} onChange={(e) => onSetInStockOnly(e.target.checked)}
              className="w-4 h-4 rounded border-border text-interactive-accent focus:ring-interactive-accent bg-surface-tertiary" />
            <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors">Solo en stock</span>
          </label>
        </div>

        {/* Rating */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-text-secondary">Calificación mínima</label>
          <div className="grid grid-cols-2 gap-1.5">
            {[4, 3, 2, 1].map((r) => (
              <button key={r} onClick={() => onSetMinRating(minRating === r ? 0 : r)}
                className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg transition-all text-[11px] ${
                  minRating === r ? "bg-interactive-accent/10 border border-interactive-accent/30" : "border border-border-subtle hover:bg-surface-tertiary"
                }`}>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={10} className={i < r ? "text-amber-400 fill-amber-400" : "text-text-tertiary/30"} />
                  ))}
                </div>
                <span className={minRating === r ? "text-interactive-accent font-medium" : "text-text-tertiary"}>o más</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 4: Brands */}
      {availableBrands.length > 0 && (
      <div>
        <h3 className="text-xs font-bold text-text-primary mb-3">
          <span className="text-interactive-accent">4.</span> Marcas
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {availableBrands.slice(0, brandsExpanded ? availableBrands.length : 6).map(([brand, count]) => (
            <button key={brand} onClick={() => onToggleBrand(brand)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                selectedBrands.includes(brand)
                  ? "bg-interactive-accent text-white"
                  : "bg-surface-tertiary text-text-secondary hover:text-text-primary border border-border-subtle"
              }`}>
              {brand}
              <span className="text-[9px] opacity-70">({count})</span>
            </button>
          ))}
        </div>
        {availableBrands.length > 6 && (
          <button onClick={() => onSetBrandsExpanded(!brandsExpanded)}
            className="text-[11px] text-interactive-accent mt-2 hover:text-interactive-accent-hover flex items-center gap-1">
            {brandsExpanded ? "Ver menos" : `Ver más`}
            <ChevronDown size={10} className={brandsExpanded ? "rotate-180" : ""} />
          </button>
        )}
      </div>
      )}
    </div>
  );
}
