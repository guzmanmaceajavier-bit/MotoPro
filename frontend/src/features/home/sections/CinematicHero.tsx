import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";

const HUD_LINES = [
  { label: "ENGINE STATUS", value: "98%", color: "var(--status-success)" },
  { label: "OIL PRESSURE", value: "OK", color: "var(--status-success)" },
  { label: "BATTERY", value: "12.4V", color: "var(--status-success)" },
  { label: "RPM", value: "1,200", color: "var(--interactive-accent)" },
];

const WORDS = ["Tu", "moto", "merece", "lo", "mejor"];

const STATS = [
  { value: "4.9", label: "Calificación" },
  { value: "800+", label: "Clientes" },
  { value: "15+", label: "Años" },
  { value: "100%", label: "Garantía" },
];

export function CinematicHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const bgBrightness = useTransform(scrollYProgress, [0, 0.3], [0.3, 1]);
  const bgScale = useTransform(scrollYProgress, [0, 0.4], [1.15, 1]);
  const bgY = useTransform(scrollYProgress, [0, 0.5], [0, 120]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.25], [0.8, 0]);
  const gradientOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const hudOpacity = useTransform(scrollYProgress, [0.08, 0.2], [0, 1]);
  const hudY = useTransform(scrollYProgress, [0.08, 0.2], [20, 0]);

  const titleOpacity = useTransform(scrollYProgress, [0.2, 0.35], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0.2, 0.35], [40, 0]);

  const subtitleOpacity = useTransform(scrollYProgress, [0.3, 0.45], [0, 1]);

  const ctaOpacity = useTransform(scrollYProgress, [0.4, 0.55], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.4, 0.55], [30, 0]);

  const statsOpacity = useTransform(scrollYProgress, [0.5, 0.7], [0, 1]);
  const statsY = useTransform(scrollYProgress, [0.5, 0.7], [40, 0]);

  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const bgFilter = useTransform(bgBrightness, (v) => `brightness(${v})`);

  const badgeText = "Taller especializado en motocicletas";

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[200vh] bg-surface-primary"
    >
      {/* ── Sticky container ── */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Capa 1: Background Image */}
        <motion.div
          style={{ scale: bgScale, y: bgY, filter: bgFilter }}
          className="absolute inset-0"
        >
          <img
            src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1600&q=80"
            alt=""
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Capa 2: Dark overlay that fades */}
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 bg-black"
        />

        {/* Capa 3: Gradient overlay */}
        <motion.div
          style={{ opacity: gradientOpacity }}
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
        />

        {/* Capa 4: Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "256px 256px",
          }}
        />

        {/* Capa 5: HUD Overlay */}
        <motion.div
          style={{ opacity: hudOpacity, y: hudY }}
          className="absolute top-24 right-8 space-y-2 text-right"
        >
          {HUD_LINES.map((line) => (
            <div key={line.label} className="flex items-center gap-3 justify-end">
              <span className="text-[10px] font-mono font-semibold text-text-tertiary tracking-[0.15em]">
                {line.label}
              </span>
              <span
                className="text-xs font-mono font-bold"
                style={{ color: line.color }}
              >
                {line.value}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Capa 6: Main Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl">
              {/* Badge */}
              <motion.div
                style={{ opacity: titleOpacity, y: titleY }}
                className="inline-flex items-center gap-2 border border-interactive-accent/20 text-interactive-accent text-xs font-semibold px-4 py-2 rounded-full mb-6"
              >
                <span className="w-1.5 h-1.5 bg-interactive-accent rounded-full animate-pulse" />
                {badgeText.split("").map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.5 + i * 0.02 }}
                    className="inline-block"
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </motion.div>

              {/* Title with word reveal */}
              <motion.h1
                style={{ opacity: titleOpacity, y: titleY }}
                className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold text-text-primary leading-[1.05]"
              >
                {WORDS.map((word, i) => (
                  <motion.span
                    key={word}
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.8 + i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-block mr-[0.3em]"
                  >
                    {word === "mejor" ? (
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-interactive-accent to-emerald-400">
                        {word}
                      </span>
                    ) : (
                      word
                    )}
                  </motion.span>
                ))}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                style={{ opacity: subtitleOpacity }}
                className="mt-6 text-base md:text-lg text-text-secondary leading-relaxed max-w-lg"
              >
                Taller con más de 15 años de experiencia en mantenimiento, reparación y personalización de motocicletas.
              </motion.p>

              {/* CTA */}
              <motion.div
                style={{ opacity: ctaOpacity, y: ctaY }}
                className="mt-10 flex flex-wrap gap-4"
              >
                <Link
                  to="/agendar-cita"
                  className="group relative overflow-hidden rounded-lg bg-interactive-accent px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-interactive-accent/25 hover:shadow-interactive-accent/40 transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Agendar cita
                  </span>
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500" />
                </Link>
                <Link
                  to="/tienda"
                  className="rounded-lg border border-border bg-surface-secondary/50 backdrop-blur-sm px-8 py-4 text-sm font-semibold text-text-primary hover:border-interactive-accent/40 transition-all"
                >
                  Ver tienda
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Capa 7: Stats bar at bottom */}
        <motion.div
          style={{ opacity: statsOpacity, y: statsY }}
          className="absolute bottom-0 left-0 right-0 border-t border-border-subtle bg-surface-primary/60 backdrop-blur-md"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="py-5 text-center border-r border-border-subtle last:border-r-0"
                >
                  <p className="text-2xl font-heading font-bold text-interactive-accent">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-text-tertiary mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Capa 8: Scroll progress bar */}
        <motion.div
          style={{ width: progressWidth }}
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-interactive-accent to-emerald-400"
        />

      </div>
    </section>
  );
}
