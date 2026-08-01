import { useMemo } from "react";
import { MOTO_BRANDS, getBrandModels } from "@/lib/motorcycles";

const CUSTOM = "__custom__";

interface BrandModelFieldsProps {
  brand: string;
  model: string;
  onBrandChange: (brand: string) => void;
  onModelChange: (model: string) => void;
  extraBrands?: string[];
  size?: "md" | "sm";
  brandLabel?: string;
  modelLabel?: string;
  brandPlaceholder?: string;
  modelPlaceholder?: string;
}

export function BrandModelFields({
  brand,
  model,
  onBrandChange,
  onModelChange,
  extraBrands = [],
  size = "md",
  brandLabel = "Marca",
  modelLabel = "Modelo",
  brandPlaceholder = "Selecciona marca...",
  modelPlaceholder = "Selecciona modelo...",
}: BrandModelFieldsProps) {
  const brandOptions = useMemo(() => {
    const set = new Set<string>([...MOTO_BRANDS.map(b => b.name), ...extraBrands.filter(Boolean)]);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [extraBrands]);

  const knownModels = useMemo(() => getBrandModels(brand), [brand]);
  const brandIsCustom = brand !== "" && !brandOptions.includes(brand);
  const modelIsCustom = model !== "" && !knownModels.includes(model);

  const selectCls =
    size === "sm"
      ? "w-full bg-surface-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-interactive-accent"
      : "w-full rounded-lg border border-border bg-surface-tertiary px-4 py-3 text-sm text-text-primary outline-none focus:border-border-accent";
  const labelCls = size === "sm"
    ? "block text-xs font-semibold text-text-secondary mb-1"
    : "block text-sm font-semibold text-text-secondary mb-1.5";

  const handleBrandSelect = (value: string) => {
    if (value === CUSTOM) {
      onBrandChange(brandIsCustom ? brand : "");
      return;
    }
    onBrandChange(value);
    if (!getBrandModels(value).includes(model)) onModelChange("");
  };

  return (
    <>
      <div>
        <label className={labelCls}>{brandLabel}</label>
        <select value={brandIsCustom ? CUSTOM : brand} onChange={e => handleBrandSelect(e.target.value)} className={selectCls}>
          <option value="">{brandPlaceholder}</option>
          {brandOptions.map(b => <option key={b} value={b}>{b}</option>)}
          <option value={CUSTOM}>Otra marca</option>
        </select>
        {brandIsCustom && (
          <input
            value={brand}
            onChange={e => onBrandChange(e.target.value)}
            placeholder="Escribe la marca..."
            className={`${selectCls} mt-2`}
          />
        )}
      </div>

      <div>
        <label className={labelCls}>{modelLabel}</label>
        {brand === "" ? (
          <input
            value={model}
            onChange={e => onModelChange(e.target.value)}
            placeholder="Selecciona primero una marca"
            disabled
            className={`${selectCls} opacity-50 cursor-not-allowed`}
          />
        ) : knownModels.length > 0 ? (
          <>
            <select value={modelIsCustom ? CUSTOM : model} onChange={e => { if (e.target.value !== CUSTOM) onModelChange(e.target.value); }} className={selectCls}>
              <option value="">{modelPlaceholder}</option>
              {knownModels.map(m => <option key={m} value={m}>{m}</option>)}
              <option value={CUSTOM}>Otro modelo</option>
            </select>
            {modelIsCustom && (
              <input
                value={model}
                onChange={e => onModelChange(e.target.value)}
                placeholder="Escribe el modelo..."
                className={`${selectCls} mt-2`}
              />
            )}
          </>
        ) : (
          <input
            value={model}
            onChange={e => onModelChange(e.target.value)}
            placeholder="Escribe el modelo..."
            className={selectCls}
          />
        )}
      </div>
    </>
  );
}
