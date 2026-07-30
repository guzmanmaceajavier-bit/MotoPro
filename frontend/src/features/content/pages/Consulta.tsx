
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { ServiceInquiry } from "@/features/consulta/ServiceInquiry";
import { Search, Clock, Bell } from "lucide-react";

export default function Consulta() {

  return (
    <>
      <SEO title="Consultar servicio" description="Consulta el estado de tu servicio en nuestro taller" />
      <main className="bg-surface-primary min-h-screen pt-16">
        <section className="relative py-20 lg:py-28 min-h-[400px] flex items-center bg-surface-primary overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&q=80" alt="" loading="lazy" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl">
              <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs font-semibold text-interactive-accent uppercase tracking-widest">
                Seguimiento de servicios
              </motion.span>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="mt-4 text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight">
                Consulta el estado de{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-interactive-accent to-orange-400">tu servicio</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="mt-5 text-base text-white/70 leading-relaxed max-w-lg">
                Busca por número de orden, placa o cédula y conoce el estado actual de tu moto en nuestro taller.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="mt-8 flex flex-wrap gap-6">
                {[
                  { icon: Search, label: "Consulta en línea", sub: "Disponible 24/7" },
                  { icon: Clock, label: "Actualización en tiempo real", sub: "Estado al instante" },
                  { icon: Bell, label: "Notificaciones automáticas", sub: "Cuando haya cambios" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-interactive-accent">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-white/50">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
        <ServiceInquiry />
      </main>
    </>
  );
}
