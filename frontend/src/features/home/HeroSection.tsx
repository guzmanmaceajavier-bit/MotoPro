import { useCMS } from "@/providers/CMSProvider";
import { useHeroSlides } from "./hooks/useHeroSlides";
import { useHeroStats } from "./hooks/useHeroStats";
import { HeroBackground } from "./components/HeroBackground";
import { HeroContent } from "./components/HeroContent";
import { HeroIndicators } from "./components/HeroIndicators";

export function HeroSection() {
  const { getSection } = useCMS();
  const heroSection = getSection("hero");
  const { slides, current, goTo } = useHeroSlides();
  const { stats, fmt } = useHeroStats();

  const heroTitle = heroSection?.title || "";
  const heroDesc = heroSection?.description || "";
  const cta1Text = heroSection?.button_text || "";
  const cta1Link = heroSection?.button_link || "";

  return (
    <section className="relative min-h-[600px] overflow-hidden md:min-h-[650px] lg:min-h-[750px]">
      <HeroBackground slides={slides} current={current} />

      {heroTitle && (
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-4 pt-24 pb-56 md:px-6 md:pt-28 md:pb-52 lg:pb-48">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-interactive-accent" />
            {slides[current]?.title || "Tu taller de confianza"}
          </div>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            {heroTitle.includes("<br/>") ? (
              <>
                {heroTitle.split("<br/>")[0]}
                <br />
                <span className="bg-gradient-to-r from-interactive-accent to-blue-400 bg-clip-text text-transparent">{heroTitle.split("<br/>")[1]}</span>
              </>
            ) : (
              <span className="bg-gradient-to-r from-interactive-accent to-blue-400 bg-clip-text text-transparent">{heroTitle}</span>
            )}
          </h1>
          {heroDesc && <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">{heroDesc}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={cta1Link || "/solicitar-servicio"}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-interactive-accent-hover to-interactive-accent px-7 py-3.5 font-semibold text-white shadow-lg shadow-interactive-accent/30 transition-all duration-300 hover:scale-105 hover:shadow-interactive-accent/60"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {cta1Text || "Agendar Servicio"}
            </a>
            <a href="/tienda"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-7 py-3.5 font-semibold text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Ver Tienda
            </a>
          </div>
        </div>
      )}

      {!heroTitle && slides[current] && (
        <HeroContent slide={slides[current]} index={current} total={slides.length} />
      )}

      <div className="absolute bottom-0 left-0 right-0 z-20 pb-8 md:pb-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 lg:justify-start">
            {[
              { value: "4.9", label: "Calificaci\u00F3n Google", icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" },
              { value: fmt(stats.testimonials), label: "Clientes satisfechos", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
              { value: fmt(stats.products), label: "Productos disponibles", icon: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" },
              { value: fmt(stats.brands), label: "Marcas atendidas", icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" },
              { value: "100%", label: "Garant\u00EDa", icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((s, i) => (
              <div key={s.label}
                className="flex min-w-[140px] items-center gap-2.5 rounded-2xl border border-white/10 bg-surface-primary/80 px-4 py-3 shadow-lg backdrop-blur-xl md:min-w-[160px]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-interactive-accent/20 to-blue-500/20">
                  <svg className="h-4 w-4 text-interactive-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold leading-none text-white">{s.value}</p>
                  <p className="mt-0.5 text-[10px] leading-tight text-white/40">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <HeroIndicators total={slides.length} current={current} onSelect={goTo} />
    </section>
  );
}
