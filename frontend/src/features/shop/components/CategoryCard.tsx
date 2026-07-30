import IconRenderer from "@/components/icons/IconRenderer";
import type { Category } from "../types";

export function CategoryCard({ category, count, isSelected, onClick }: { category: Category; count: number; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 w-[150px] md:w-[165px] group rounded-2xl overflow-hidden transition-all duration-300 border ${
        isSelected
          ? "bg-surface-secondary border-interactive-accent shadow-lg shadow-interactive-accent/10"
          : "bg-surface-secondary/50 border-border-subtle hover:border-interactive-accent/30 hover:bg-surface-secondary"
      }`}
    >
      <div className="relative h-28 overflow-hidden">
        {category.image ? (
          <img src={category.image} alt={category.name} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-tertiary">
            <IconRenderer name={category.icon || "box"} size={36} className="text-interactive-accent/30" />
          </div>
        )}
        {isSelected && <div className="absolute inset-0 bg-interactive-accent/10" />}
      </div>
      <div className="p-3 text-center">
        <span className="text-sm font-semibold text-text-primary block truncate">{category.name}</span>
        <span className="text-[11px] text-text-tertiary">{count} productos</span>
      </div>
    </button>
  );
}
