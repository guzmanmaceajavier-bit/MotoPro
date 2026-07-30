import { STAT_ICONS } from "../constants";
import type { HeroStats } from "../types";

interface HeroStatsProps {
  stats: HeroStats;
  fmt: (n: number) => string;
}

const items = [
  { key: "products", icon: STAT_ICONS.package, label: "Productos" },
  { key: "brands", icon: STAT_ICONS.flag, label: "Marcas" },
  { key: "reviews", icon: STAT_ICONS.star, label: "Reseñas" },
  { key: "testimonials", icon: STAT_ICONS.users, label: "Clientes Felices" },
] as const;

export function HeroStats({ stats, fmt }: HeroStatsProps) {
  return (
    <section className="mx-auto -mt-8 mb-20 max-w-5xl px-4">
      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-surface-elevated p-6 shadow-xl sm:p-8 md:grid-cols-4">
        {items.map(({ key, icon, label }) => (
          <div key={key} className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-interactive-accent/10 text-interactive-accent">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{fmt(stats[key])}</div>
              <div className="text-sm text-text-tertiary">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
