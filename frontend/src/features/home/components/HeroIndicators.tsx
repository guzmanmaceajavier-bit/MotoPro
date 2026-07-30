interface HeroIndicatorsProps {
  total: number;
  current: number;
  onSelect: (i: number) => void;
}

export function HeroIndicators({ total, current, onSelect }: HeroIndicatorsProps) {
  return (
    <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-3">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Ir al slide ${i + 1}`}
          className={`h-3 rounded-full transition-all duration-300 ${
            i === current ? "w-8 bg-interactive-accent" : "w-3 bg-white/30 hover:bg-white/50"
          }`}
        />
      ))}
    </div>
  );
}
