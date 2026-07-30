import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { api } from "@/api/client";
import { useCMS } from "@/providers/CMSProvider";

function Counter({ value, suffix }: { value: string; suffix: string }) {
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !done.current) {
          done.current = true;
          const isDecimal = value.includes(".");
          const target = parseFloat(value.replace(/[^0-9.]/g, ""));
          if (isNaN(target) || target <= 1) {
            setDisplay(value);
            return;
          }
          const duration = 2000;
          const steps = 30;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setDisplay(isDecimal ? target.toFixed(1) : String(Math.floor(target)));
              clearInterval(timer);
            } else {
              setDisplay(isDecimal ? current.toFixed(1) : String(Math.floor(current)));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl md:text-4xl font-heading font-bold text-white">{display}{suffix}</p>
    </div>
  );
}

const STAT_LABELS: { value: string; suffix: string; label: string; icon: string; key: "products" | "brands" | "testimonials" | "static" }[] = [
  { value: "4.9", suffix: "", label: "Calificación Google", icon: "star", key: "static" },
  { value: "", suffix: "+", label: "Clientes satisfechos", icon: "users", key: "testimonials" },
  { value: "", suffix: "+", label: "Productos disponibles", icon: "package", key: "products" },
  { value: "", suffix: "+", label: "Marcas atendidas", icon: "flag", key: "brands" },
  { value: "100", suffix: "%", label: "Garantía", icon: "shield", key: "static" },
];

const icons: Record<string, React.ReactNode> = {
  star: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
  users: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  package: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>,
  flag: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" /></svg>,
  shield: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
};

export function StatsSection() {
  const { brands, testimonials } = useCMS();
  const [counts, setCounts] = useState({ products: "0", brands: "0", testimonials: "0" });

  useEffect(() => {
    api.get("/products").then((r) => {
      const c = String(Array.isArray(r) ? r.length : r?.data?.length || 0);
      setCounts({ products: c, brands: String(brands.length), testimonials: String(testimonials.length) });
    }).catch(() => setCounts({ products: "0", brands: String(brands.length), testimonials: String(testimonials.length) }));
  }, [brands.length, testimonials.length]);

  const stats = STAT_LABELS.map((s) => ({
    ...s,
    value: s.key === "products" ? counts.products : s.key === "brands" ? counts.brands : s.key === "testimonials" ? counts.testimonials : s.value,
  }));

  return (
    <section className="relative py-10 bg-gradient-to-b from-transparent via-surface-primary/50 to-surface-primary">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap justify-center gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group w-[170px] sm:w-[200px] md:w-[220px] rounded-[18px] border border-white/5 bg-white/5 backdrop-blur-xl px-4 sm:px-5 py-4 sm:py-5 hover:bg-white/[0.08] hover:border-interactive-accent/30 hover:shadow-lg hover:shadow-interactive-accent/5 transition-all duration-300"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-interactive-accent/10 flex items-center justify-center text-interactive-accent group-hover:bg-interactive-accent/20 transition-colors">
                  {icons[s.icon]}
                </div>
                {s.value.includes(".") || s.value === "100" ? (
                  <span className="text-xl font-heading font-bold text-white">{s.value}</span>
                ) : (
                  <Counter value={s.value} suffix={s.suffix} />
                )}
              </div>
              <p className="text-xs text-gray-400">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
