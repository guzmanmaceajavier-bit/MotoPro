import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/api/client";
import IconRenderer from "@/components/icons/IconRenderer";

interface ValueItem {
  id: string; title: string; description: string; icon: string; image?: string;
  sort_order: number;
}

const fallbackValues: ValueItem[] = [
  { id: "fb1", title: "Experiencia y Confianza", description: "Más de 10 años de experiencia en mantenimiento y reparación de motocicletas de todas las marcas.", icon: "award", sort_order: 1 },
  { id: "fb2", title: "Repuestos Originales", description: "Solo trabajamos con repuestos originales y de la más alta calidad para garantizar el mejor rendimiento.", icon: "check", sort_order: 2 },
  { id: "fb3", title: "Diagnóstico Preciso", description: "Utilizamos equipo de diagnóstico especializado para identificar fallas con precisión y rapidez.", icon: "search", sort_order: 3 },
  { id: "fb4", title: "Garantía en Todos los Trabajos", description: "Todos nuestros servicios y repuestos cuentan con garantía por escrito. Tu tranquilidad es lo primero.", icon: "shield", sort_order: 4 },
  { id: "fb5", title: "Atención Personalizada", description: "Te asesoramos de principio a fin, explicando cada detalle del trabajo a realizar en tu moto.", icon: "messageCircle", sort_order: 5 },
  { id: "fb6", title: "Entrega a Tiempo", description: "Cumplimos con los tiempos acordados para que vuelvas a rodar lo antes posible.", icon: "clock", sort_order: 6 },
];

export function WhyMotoPro() {
  const [values, setValues] = useState<ValueItem[]>(fallbackValues);

  useEffect(() => {
    api.get("/values").then((r) => { const d = Array.isArray(r) ? r : []; if (d.length > 0) setValues(d); }).catch(() => {});
  }, []);

  if (values.length === 0) return null;

  return (
    <section className="py-30 relative overflow-hidden bg-surface-primary">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="mx-auto max-w-7xl px-4 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">
            ¿Por qué <span className="text-transparent bg-clip-text bg-gradient-to-r from-interactive-accent to-blue-400">MotoPro</span>?
          </h2>
          <p className="mt-3 text-gray-400 max-w-xl mx-auto text-sm">
            La confianza de miles de motociclistas nos respalda
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {values.map((r, i) => (
            <motion.div key={r.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group p-5 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-interactive-accent/30 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-interactive-accent/10 flex items-center justify-center text-interactive-accent mb-3 group-hover:scale-110 transition-transform">
                <IconRenderer name={r.icon || "heart"} size={20} />
              </div>
              <h3 className="text-sm font-heading font-bold text-white mb-1.5">{r.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{r.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
