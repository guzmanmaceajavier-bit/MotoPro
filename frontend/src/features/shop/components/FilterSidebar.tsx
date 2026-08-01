import { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, RotateCcw, Bike, ChevronDown, Search, X } from "lucide-react";
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
  onSetSortBy: (v: string) => void;
  onSetMotoFilterExpanded: (v: boolean) => void;
  onSetBrandsExpanded: (v: boolean) => void;
}

export function FilterSidebar(props: FilterSidebarProps) {
  const {
    selectedCategory, selectedBrands, selectedMotoBrand, selectedMotoModel, priceRange, maxPrice,
    inStockOnly, motoFilterExpanded, brandsExpanded, availableBrands,
    selectedMotoModels, hasActiveFilters, MOTO_BRANDS, storeCategories,
    onClearFilters, onToggleBrand, onSetSelectedMotoBrand, onSetSelectedMotoModel,
    onSetPriceRange, onSetInStockOnly, onSetMotoFilterExpanded, onSetBrandsExpanded,
    onSetSelectedCategory,
  } = props;

  const [catsOpen, setCatsOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [motoOpen, setMotoOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [showCustomBrand, setShowCustomBrand] = useState(false);
  const [showCustomModel, setShowCustomModel] = useState(false);
  const catsRef = useRef<HTMLDivElement>(null);
  const brandsRef = useRef<HTMLDivElement>(null);
  const motoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catsRef.current && !catsRef.current.contains(e.target as Node)) setCatsOpen(false);
      if (brandsRef.current && !brandsRef.current.contains(e.target as Node)) setBrandsOpen(false);
      if (motoRef.current && !motoRef.current.contains(e.target as Node)) setMotoOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredBrandList = availableBrands.filter(([name]) => name.toLowerCase().includes(brandSearch.toLowerCase()));
  const sortedCategories = storeCategories.slice().sort((a, b) => a.name.localeCompare(b.name));

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

      {/* Step 1: Categorías */}
      <div ref={catsRef}>
        <h3 className="text-xs font-bold text-text-primary mb-3">
          <span className="text-interactive-accent">1.</span> Categorías
        </h3>
        {storeCategories.length > 0 ? (
          <div className="relative">
            <button onClick={() => setCatsOpen(!catsOpen)}
              className="w-full flex items-center justify-between rounded-xl border border-border-subtle bg-surface-tertiary px-4 py-2.5 text-xs text-text-primary hover:border-interactive-accent/30 transition-all"
              aria-haspopup="listbox" aria-expanded={catsOpen}>
              <span className={selectedCategory ? "text-text-primary" : "text-text-tertiary"}>
                {selectedCategory || "Todas las categorías"}
              </span>
              <ChevronDown size={14} className={`text-text-tertiary transition-transform ${catsOpen ? "rotate-180" : ""}`} />
            </button>
            {catsOpen && (
              <div className="absolute z-20 mt-2 w-full rounded-xl border border-border-subtle bg-surface-secondary shadow-xl" role="listbox">
                <div className="p-2 max-h-48 overflow-y-auto">
                  <label className="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-surface-tertiary/50 transition-colors">
                    <input type="checkbox" checked={!selectedCategory}
                      onChange={() => onSetSelectedCategory("")}
                      className="w-4 h-4 rounded border-border text-interactive-accent focus:ring-interactive-accent bg-surface-tertiary" />
                    <span className="text-xs text-text-secondary">Todas</span>
                  </label>
                  {sortedCategories.map(cat => (
                    <label key={cat.id}
                      className="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-surface-tertiary/50 transition-colors">
                      <input type="checkbox" checked={selectedCategory === cat.name}
                        onChange={() => onSetSelectedCategory(selectedCategory === cat.name ? "" : cat.name)}
                        className="w-4 h-4 rounded border-border text-interactive-accent focus:ring-interactive-accent bg-surface-tertiary" />
                      <span className="text-xs text-text-primary">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-[10px] text-text-tertiary italic">No hay categorías disponibles</p>
        )}
        {selectedCategory && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-interactive-accent/10 text-interactive-accent text-[11px] font-medium">
              {selectedCategory}
              <button onClick={() => onSetSelectedCategory("")} aria-label="Quitar"><X size={10} /></button>
            </span>
          </div>
        )}
      </div>

      {/* Step 2: Marcas */}
      {availableBrands.length > 0 && (
      <div ref={brandsRef}>
        <h3 className="text-xs font-bold text-text-primary mb-3">
          <span className="text-interactive-accent">2.</span> Marcas
        </h3>
        <div className="relative">
          <button onClick={() => setBrandsOpen(!brandsOpen)}
            className="w-full flex items-center justify-between rounded-xl border border-border-subtle bg-surface-tertiary px-4 py-2.5 text-xs text-text-primary hover:border-interactive-accent/30 transition-all"
            aria-haspopup="listbox" aria-expanded={brandsOpen}>
            <span className={selectedBrands.length > 0 ? "text-text-primary" : "text-text-tertiary"}>
              {selectedBrands.length > 0 ? `${selectedBrands.length} marca${selectedBrands.length > 1 ? "s" : ""} seleccionada${selectedBrands.length > 1 ? "s" : ""}` : "Selecciona una o varias marcas"}
            </span>
            <ChevronDown size={14} className={`text-text-tertiary transition-transform ${brandsOpen ? "rotate-180" : ""}`} />
          </button>
          {brandsOpen && (
            <div className="absolute z-20 mt-2 w-full rounded-xl border border-border-subtle bg-surface-secondary shadow-xl" role="listbox">
              <div className="p-3 border-b border-border-subtle">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input type="text" placeholder="Buscar marca..." value={brandSearch} onChange={e => setBrandSearch(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-tertiary pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:border-interactive-accent focus:outline-none"
                    autoFocus />
                </div>
              </div>
              <div className="p-2 max-h-48 overflow-y-auto">
                <label className="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-surface-tertiary/50 transition-colors">
                  <input type="checkbox" checked={selectedBrands.length === availableBrands.length && availableBrands.length > 0}
                    onChange={() => {
                      if (selectedBrands.length === availableBrands.length) onToggleBrand("__clear__");
                      else availableBrands.forEach(([b]) => { if (!selectedBrands.includes(b)) onToggleBrand(b); });
                    }}
                    className="w-4 h-4 rounded border-border text-interactive-accent focus:ring-interactive-accent bg-surface-tertiary" />
                  <span className="text-xs text-text-secondary">Seleccionar todas</span>
                </label>
                {filteredBrandList.map(([brand, count]) => (
                  <label key={brand}
                    className="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-surface-tertiary/50 transition-colors">
                    <input type="checkbox" checked={selectedBrands.includes(brand)}
                      onChange={() => onToggleBrand(brand)}
                      className="w-4 h-4 rounded border-border text-interactive-accent focus:ring-interactive-accent bg-surface-tertiary" />
                    <span className="text-xs text-text-primary">{brand}</span>
                    <span className="text-[9px] text-text-tertiary ml-auto">({count})</span>
                  </label>
                ))}
                {filteredBrandList.length === 0 && (
                  <p className="text-xs text-text-tertiary text-center py-3">No se encontraron marcas</p>
                )}
              </div>
            </div>
          )}
        </div>
        {selectedBrands.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selectedBrands.map(name => (
              <span key={name}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-interactive-accent/10 text-interactive-accent text-[11px] font-medium">
                {name}
                <button onClick={() => onToggleBrand(name)} className="hover:text-interactive-accent-hover" aria-label={`Quitar ${name}`}>
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Step 3: Tu moto */}
      <div ref={motoRef}>
        <h3 className="text-xs font-bold text-text-primary mb-3">
          <span className="text-interactive-accent">3.</span> Tu moto
        </h3>
        <div className="space-y-2">
          <div className="relative">
            <button onClick={() => setMotoOpen(!motoOpen)}
              className="w-full flex items-center justify-between rounded-xl border border-border-subtle bg-surface-tertiary px-4 py-2.5 text-xs text-text-primary hover:border-interactive-accent/30 transition-all"
              aria-haspopup="listbox" aria-expanded={motoOpen}>
              <span className={selectedMotoBrand ? "text-text-primary" : "text-text-tertiary"}>
                {selectedMotoBrand || "Selecciona marca de tu moto"}
              </span>
              <ChevronDown size={14} className={`text-text-tertiary transition-transform ${motoOpen ? "rotate-180" : ""}`} />
            </button>
            {motoOpen && (
              <div className="absolute z-20 mt-2 w-full rounded-xl border border-border-subtle bg-surface-secondary shadow-xl" role="listbox">
                <div className="p-2 max-h-48 overflow-y-auto">
                  <label className="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-surface-tertiary/50 transition-colors">
                    <input type="radio" name="moto-brand" checked={!selectedMotoBrand && !showCustomBrand}
                      onChange={() => { onSetSelectedMotoBrand(""); onSetSelectedMotoModel(""); setShowCustomBrand(false); setShowCustomModel(false); }}
                      className="w-4 h-4 border-border text-interactive-accent focus:ring-interactive-accent bg-surface-tertiary" />
                    <span className="text-xs text-text-secondary">Todas</span>
                  </label>
                  {MOTO_BRANDS.map(b => (
                    <label key={b.name}
                      className="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-surface-tertiary/50 transition-colors">
                      <input type="radio" name="moto-brand" checked={selectedMotoBrand === b.name && !showCustomBrand}
                        onChange={() => { onSetSelectedMotoBrand(b.name); onSetSelectedMotoModel(""); setShowCustomBrand(false); setShowCustomModel(false); }}
                        className="w-4 h-4 border-border text-interactive-accent focus:ring-interactive-accent bg-surface-tertiary" />
                      <span className="text-xs text-text-primary">{b.name}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-surface-tertiary/50 transition-colors">
                    <input type="radio" name="moto-brand"
                      checked={showCustomBrand || (selectedMotoBrand !== "" && !MOTO_BRANDS.some(b => b.name === selectedMotoBrand))}
                      onChange={() => { setShowCustomBrand(true); onSetSelectedMotoModel(""); setShowCustomModel(false); }}
                      className="w-4 h-4 border-border text-interactive-accent focus:ring-interactive-accent bg-surface-tertiary" />
                    <span className="text-xs text-text-primary">Otra marca...</span>
                  </label>
                </div>
              </div>
            )}
          </div>
          {(showCustomBrand || (selectedMotoBrand !== "" && !MOTO_BRANDS.some(b => b.name === selectedMotoBrand))) && (
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-text-secondary">Escribe tu marca</label>
              <input value={selectedMotoBrand} onChange={(e) => onSetSelectedMotoBrand(e.target.value)}
                placeholder="Ej: Daytona, Morini..."
                className="w-full rounded-lg border border-border-subtle bg-surface-tertiary px-3 py-2.5 text-xs text-text-primary outline-none focus:border-interactive-accent" />
            </div>
          )}
          {selectedMotoBrand && selectedMotoModels.length > 0 && !showCustomModel && (
            <div className="relative">
              <select value={showCustomModel ? "__custom__" : selectedMotoModel}
                onChange={(e) => {
                  if (e.target.value === "__custom__") { setShowCustomModel(true); onSetSelectedMotoModel(""); }
                  else onSetSelectedMotoModel(e.target.value);
                }}
                className="w-full rounded-lg border border-border-subtle bg-surface-tertiary pl-3 pr-8 py-2.5 text-xs text-text-primary outline-none focus:border-interactive-accent appearance-none">
                <option value="">Todos los modelos</option>
                {selectedMotoModels.map(m => <option key={m} value={m}>{m}</option>)}
                <option value="__custom__">Otro modelo...</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
            </div>
          )}
          {showCustomModel && (
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-text-secondary">Escribe el modelo</label>
              <input value={selectedMotoModel} onChange={(e) => onSetSelectedMotoModel(e.target.value)}
                placeholder="Ej: Street 125"
                className="w-full rounded-lg border border-border-subtle bg-surface-tertiary px-3 py-2.5 text-xs text-text-primary outline-none focus:border-interactive-accent" />
            </div>
          )}
          {(selectedMotoBrand || selectedMotoModel) && (
            <div className="flex flex-wrap gap-1.5">
              {selectedMotoBrand && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-interactive-accent/10 text-interactive-accent text-[11px] font-medium">
                  {selectedMotoBrand}
                  <button onClick={() => { onSetSelectedMotoBrand(""); onSetSelectedMotoModel(""); }} aria-label="Quitar"><X size={10} /></button>
                </span>
              )}
              {selectedMotoModel && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-interactive-accent/10 text-interactive-accent text-[11px] font-medium">
                  {selectedMotoModel}
                  <button onClick={() => onSetSelectedMotoModel("")} aria-label="Quitar"><X size={10} /></button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Step 4: Filtros adicionales */}
      <div>
        <h3 className="text-xs font-bold text-text-primary mb-3">
          <span className="text-interactive-accent">4.</span> Filtros adicionales
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
        <div>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input type="checkbox" checked={inStockOnly} onChange={(e) => onSetInStockOnly(e.target.checked)}
              className="w-4 h-4 rounded border-border text-interactive-accent focus:ring-interactive-accent bg-surface-tertiary" />
            <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors">Solo en stock</span>
          </label>
        </div>
      </div>
    </div>
  );
}
