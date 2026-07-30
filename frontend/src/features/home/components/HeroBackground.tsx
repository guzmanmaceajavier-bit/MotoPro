import type { HeroSlide } from "../types";

interface HeroBackgroundProps {
  slides: HeroSlide[];
  current: number;
}

export function HeroBackground({ slides, current }: HeroBackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {slides.map((s, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? "opacity-100" : "opacity-0"}`}>
          <img
            src={s.image}
            alt={s.title || `Slide ${i + 1}`}
            className="h-full w-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
    </div>
  );
}
