import { motion } from "framer-motion";
import IconRenderer from "@/components/icons/IconRenderer";
import { useValues } from "@/providers/CMSProvider";

export function WhyMotoPro() {
  const { values, loading } = useValues();
  if (loading || values.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-surface-primary py-30">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
            ¿Por qu\u00E9 <span className="bg-gradient-to-r from-interactive-accent to-blue-400 bg-clip-text text-transparent">MotoPro</span>?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-text-tertiary">
            La confianza de miles de motociclistas nos respalda
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((r, i) => (
            <motion.div key={r.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition-all duration-300 hover:border-interactive-accent/30 hover:bg-white/[0.06]"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-interactive-accent/10 text-interactive-accent transition-transform group-hover:scale-110">
                <IconRenderer name={r.icon || "heart"} size={20} />
              </div>
              <h3 className="mb-1.5 font-heading text-sm font-bold text-white">{r.title}</h3>
              <p className="text-xs leading-relaxed text-text-tertiary">{r.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
