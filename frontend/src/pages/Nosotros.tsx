import { useState } from "react";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";

const categories = [
  { name: "Herramientas", icon: "🔧", image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=400&fit=crop" },
  { name: "Motos", icon: "🏍️", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=400&fit=crop" },
  { name: "Repuestos", icon: "⚙️", image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop" },
  { name: "Detalles", icon: "🔍", image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=400&fit=crop" },
];

const teamMembers = [
  {
    name: "Diego Ramírez",
    role: "Mecánico Senior",
    specialty: "Suspensión y Transmisión",
    experience: "12 años",
    description: "Especialista en setup de suspensión y transmisión.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
  },
  {
    name: "Camilo Torres",
    role: "Especialista en Motores",
    specialty: "Motores 2T y 4T",
    experience: "8 años",
    description: "Experto en diagnósticos y reparaciones de alto rendimiento.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
  },
  {
    name: "Andrés López",
    role: "Electrónica Avanzada",
    specialty: "Sistemas Eléctricos",
    experience: "7 años",
    description: "Especialista en inyección electrónica y centralitas.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
  },
  {
    name: "Juan Morales",
    role: "Personalización",
    specialty: "Estética y Performance",
    experience: "6 años",
    description: "Transformamos tu moto en algo único.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face",
  },
];

const brands = ["Yamaha", "Honda", "Kawasaki", "Suzuki", "BMW", "KTM", "Ducati", "Triumph", "Aprilia"];

const values = [
  { icon: "🛡️", title: "Calidad Garantizada" },
  { icon: "👤", title: "Atención Personalizada" },
  { icon: "⚡", title: "Tecnología Avanzada" },
  { icon: "🤝", title: "Siempre Contigo" },
];

export default function Nosotros() {
  const [activeTeam, setActiveTeam] = useState(0);

  return (
    <>
      <SEO title="Nosotros | MotoPro" description="Conoce nuestra historia y equipo de profesionales apasionados por las motos." />
      <Navbar />
      <main className="bg-surface-primary min-h-screen pt-16">
        {/* Hero */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&h=1080&fit=crop"
              alt="Taller"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-surface-primary" />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white"
            >
              Nosotros
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-lg text-white/70"
            >
              Conoce nuestra historia y equipo
            </motion.p>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-6 mx-auto w-16 h-1 bg-gradient-to-r bg-interactive-accent rounded-full"
            />
          </div>
        </section>

        {/* Categories */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative h-48 rounded-2xl overflow-hidden border border-border hover:border-border-accent transition-all duration-300"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-50 group-hover:opacity-70"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-interactive-accent flex items-center justify-center text-lg">
                      {cat.icon}
                    </span>
                    <span className="text-sm font-bold text-text-primary">{cat.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pasión por las motos */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1621939514649-280e24295ff8?w=800&h=600&fit=crop"
                    alt="Mecánico trabajando"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 left-6 right-6 grid grid-cols-3 gap-4">
                  {[
                    { value: "3+", label: "Servicios" },
                    { value: "1+", label: "Marcas" },
                    { value: "100%", label: "Compromiso" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-surface-secondary border border-border rounded-lg p-4 text-center">
                      <p className="text-xl font-bold text-interactive-accent">{stat.value}</p>
                      <p className="text-xs text-text-tertiary mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                  Pasión por las{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r bg-interactive-accent">
                    motos
                  </span>
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  Taller especializado en mantenimiento, reparación y personalización de motocicletas.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Nuestro Equipo */}
        <section className="py-16 border-t border-border">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-[11px] font-bold text-interactive-accent uppercase tracking-[0.2em]">Nuestro Equipo</span>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mt-2">
                Profesionales apasionados por las motos
              </h2>
              <div className="mt-4 mx-auto w-16 h-1 bg-gradient-to-r bg-interactive-accent rounded-full" />
            </div>
            <div className="relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {teamMembers.map((member, i) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`group relative bg-surface-secondary border rounded-2xl overflow-hidden transition-all duration-300 ${
                      activeTeam === i
                        ? "border-interactive-accent shadow-lg shadow-interactive-accent/10"
                        : "border-border hover:border-border-accent"
                    }`}
                    onClick={() => setActiveTeam(i)}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-text-primary">{member.name}</h3>
                      <p className="text-sm text-interactive-accent font-medium">{member.role}</p>
                      <div className="mt-3 space-y-1.5">
                        <p className="text-xs text-text-tertiary flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-interactive-accent rounded-full" />
                          {member.specialty}
                        </p>
                        <p className="text-xs text-text-tertiary flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-interactive-accent rounded-full" />
                          {member.experience}
                        </p>
                      </div>
                      <p className="mt-3 text-xs text-text-tertiary leading-relaxed">{member.description}</p>
                      <div className="mt-4 flex gap-2">
                        <a href="#" className="w-8 h-8 rounded-full bg-surface-tertiary flex items-center justify-center text-text-tertiary hover:bg-interactive-accent hover:text-white transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Brands */}
        <section className="py-16 border-t border-border">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <span className="text-[11px] font-bold text-interactive-accent uppercase tracking-[0.2em]">
              Trabajamos con las mejores marcas
            </span>
            <div className="mt-8 flex items-center justify-center gap-10 flex-wrap">
              {brands.map((brand) => (
                <span key={brand} className="text-xl font-bold text-text-tertiary hover:text-text-primary transition-colors cursor-default">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Nuestra Esencia */}
        <section className="py-16 border-t border-border">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1621939514649-280e24295ff8?w=800&h=600&fit=crop"
                    alt="MotoPro Taller"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-[11px] font-bold text-interactive-accent uppercase tracking-[0.2em]">Nuestra Esencia</span>
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mt-3 mb-4">
                  Comprometidos con la calidad y la pasión por las motos
                </h2>
                <p className="text-text-secondary leading-relaxed mb-8">
                  Desde 2018 trabajamos para ofrecer el mejor servicio, utilizando tecnología avanzada, repuestos de calidad y un equipo altamente capacitado para garantizar tu satisfacción.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  {values.map((val) => (
                    <div key={val.title} className="flex items-center gap-3">
                      <span className="w-12 h-12 rounded-lg bg-interactive-accent/10 flex items-center justify-center text-xl">
                        {val.icon}
                      </span>
                      <span className="text-sm font-semibold text-text-primary">{val.title}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />
      <WhatsAppFloat />
    </>
  );
}
