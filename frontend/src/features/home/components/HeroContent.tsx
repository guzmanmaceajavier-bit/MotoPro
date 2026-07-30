import { Link } from "react-router-dom";
import type { HeroSlide } from "../types";

interface HeroContentProps {
  slide: HeroSlide;
  index: number;
  total: number;
}

export function HeroContent({ slide, index, total }: HeroContentProps) {
  return (
    <div className="relative z-10 flex h-full flex-col items-start justify-center px-6 text-left sm:px-12 lg:px-20">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
        <span className="inline-block h-2 w-2 rounded-full bg-interactive-accent animate-pulse" />
        Tu taller de confianza
      </div>

      <h1 className="mb-4 max-w-2xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
        {slide.title || "Expertos en motocicletas"}
      </h1>

      <p className="mb-8 max-w-lg text-lg text-white/70">
        {slide.subtitle || "Mantenimiento, reparación y repuestos de calidad."}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to={slide.cta_link || "/solicitar-servicio"}
          className="inline-flex items-center gap-2 rounded-xl bg-interactive-accent px-8 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {slide.cta_text || "Agendar Servicio"}
        </Link>
        <Link
          to={slide.cta_link === "/solicitar-servicio" ? "/tienda" : slide.cta_link || "/tienda"}
          className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Ver Tienda
        </Link>
      </div>
    </div>
  );
}
