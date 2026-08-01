import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Target, Eye, Star, Building2, Wrench, Camera, Users, Award } from "lucide-react";
import { SEO } from "@/components/SEO";
import { api } from "@/api/client";
import IconRenderer from "@/components/icons/IconRenderer";
import { BrandLogo } from "@/components/BrandLogo";
import { useCMS, useBrands, useValues } from "@/providers/CMSProvider";

const defaultTeamMembers = [
  {
    name: "Diego Ramírez",
    role: "Mecánico Senior",
    specialty: "Suspensión y Transmisión",
    experience: "12 años",
    bullets: ["Diagnóstico y Reparación", "Motores", "Especialista en inyección electrónica"],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
  },
  {
    name: "Camilo Torres",
    role: "Especialista en Motores",
    specialty: "Motores 2T y 4T",
    experience: "8 años",
    bullets: ["Más de 15 años de experiencia", "Repuestos de alta disponibilidad", "Formación técnica internacional"],
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
  },
  {
    name: "Andrés López",
    role: "Electrónica Automotriz",
    specialty: "Sistemas Eléctricos",
    experience: "7 años",
    bullets: ["Sistemas Eléctricos", "Frenos ABS", "Diagnóstico computarizado", "Inyección electrónica"],
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
  },
  {
    name: "Juan Morales",
    role: "Personalización",
    specialty: "Estética y Performance",
    experience: "6 años",
    bullets: ["Pintura y Performance", "Diseño", "Transformación de motos de alto cilindraje"],
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face",
  },
];

const iconMap: Record<string, React.ComponentType<any>> = {
  building: Building2, building2: Building2,
  wrench: Wrench, tool: Wrench,
  camera: Camera,
  users: Users, team: Users,
  award: Award,
  target: Target,
  eye: Eye,
  star: Star,
};

export default function Nosotros() {
  const [teamMembers, setTeamMembers] = useState(defaultTeamMembers);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const { brands } = useBrands();
  const { values } = useValues();
  const brandsRef = useRef<HTMLDivElement>(null);
  const brandsTrackRef = useRef<HTMLDivElement>(null);
  const brandsAnimRef = useRef<number>(0);
  const brandsPosRef = useRef(0);
  const [brandsPaused, setBrandsPaused] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/team").catch(() => []),
      api.get("/facilities").catch(() => []),
      api.get("/certifications").catch(() => []),
    ]).then(([teamData, facData, certData]) => {
      if (Array.isArray(teamData) && teamData.length > 0) {
        setTeamMembers(teamData.map((m: any) => ({
          name: m.name || "",
          role: m.role || m.specialty || "",
          specialty: m.specialty || "",
          experience: m.experience || "",
          bullets: m.description ? m.description.split(",").map((s: string) => s.trim()).filter(Boolean) : [m.specialty].filter(Boolean),
          image: m.image || m.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
        })));
      }
      if (Array.isArray(facData) && facData.length > 0) setFacilities(facData);
      if (Array.isArray(certData) && certData.length > 0) setCertifications(certData);
    });
  }, []);

  useEffect(() => {
    const track = brandsTrackRef.current;
    if (!track) return;
    let lastTime = performance.now();
    const speed = 40;

    const animate = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      if (!brandsPaused) {
        brandsPosRef.current -= speed * delta;
        const halfWidth = track.scrollWidth / 2;
        if (Math.abs(brandsPosRef.current) >= halfWidth) {
          brandsPosRef.current += halfWidth;
        }
        track.style.transform = `translateX(${brandsPosRef.current}px)`;
      }
      brandsAnimRef.current = requestAnimationFrame(animate);
    };
    brandsAnimRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(brandsAnimRef.current);
  }, [brandsPaused]);

  const scrollBrands = (dir: "left" | "right") => {
    setBrandsPaused(true);
    const amount = dir === "left" ? 250 : -250;
    brandsPosRef.current += amount;
    if (brandsTrackRef.current) {
      brandsTrackRef.current.style.transform = `translateX(${brandsPosRef.current}px)`;
    }
    setTimeout(() => setBrandsPaused(false), 2500);
  };

  return (
    <>
      <SEO title="Nosotros | MotoPro" description="Conoce nuestra historia y equipo de profesionales apasionados por las motos." />
      <main className="bg-surface-primary min-h-screen pt-16">

        {/* ── Hero ── */}
        <section className="relative py-20 lg:py-28 min-h-[400px] flex items-center bg-surface-primary overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1600&q=80" alt="" loading="lazy" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white">
              Nosotros
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="mt-3 text-lg text-white/70">
              Conoce nuestra historia y equipo
            </motion.p>
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-5 w-16 h-1 bg-gradient-to-r from-interactive-accent to-orange-400 rounded-full" />
          </div>
        </section>

        {/* ── Nuestra Historia ── */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-6">Nuestra Historia</h2>
                <div className="space-y-4 text-text-secondary leading-relaxed text-sm">
                  <p>MotoPro nació en 2015 de la pasión por las motocicletas y la necesidad de un taller que entendiera verdaderamente a los motociclistas colombianos. Fundado por Carlos Mendoza, mecánico de tercera generación, comenzó como un pequeño taller en un garage de 60m² en Bogotá.</p>
                  <p>Con dedicación, honestidad y calidad en cada reparación, MotoPro creció gracias al voz a voz de clientes satisfechos. En 2018 nos mudamos a nuestras instalaciones actuales de 500m², incorporando tecnología de diagnóstico computarizado y expandiendo nuestro equipo a 12 técnicos especializados.</p>
                  <p>Hoy, después de más de 5.000 motos reparadas y una calificación promedio de 4.9/5, seguimos siendo un taller familiar con los mismos valores que nos vieron nacer: transparencia, calidad y pasión por las dos ruedas.</p>
                </div>
              </div>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1621939514649-280e24295ff8?w=800&h=600&fit=crop" alt="Taller MotoPro" loading="lazy"
                    className="w-full h-auto object-cover" />
                </div>
                {/* Stats card */}
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 bg-surface-secondary border border-border-subtle rounded-2xl p-6 shadow-xl space-y-5">
                  {[
                    { icon: "🏪", value: "+5,000", label: "Motos reparadas" },
                    { icon: "⭐", value: "4.9/5", label: "Calificación promedio" },
                    { icon: "📅", value: "Desde 2015", label: "A tu servicio" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-3">
                      <span className="text-xl">{s.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-text-primary">{s.value}</p>
                        <p className="text-[11px] text-text-tertiary">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Misión, Visión y Valores ── */}
        <section className="py-16 md:py-20 border-t border-border-subtle">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-[11px] font-bold text-interactive-accent uppercase tracking-[0.2em]">Nuestra Filosofía</span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mt-2">Misión, Visión y Valores</h2>
              <div className="mt-4 mx-auto w-16 h-1 bg-gradient-to-r from-interactive-accent to-orange-400 rounded-full" />
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Misión */}
              <div className="rounded-2xl bg-surface-secondary border border-border-subtle p-8 text-center">
                <div className="w-14 h-14 rounded-xl bg-interactive-accent/10 flex items-center justify-center mx-auto mb-5">
                  <Target className="w-7 h-7 text-interactive-accent" />
                </div>
                <h3 className="text-lg font-heading font-bold text-text-primary mb-3">Misión</h3>
                <p className="text-text-secondary leading-relaxed text-sm">
                  Brindar servicios de mantenimiento y reparación de motocicletas con los más altos estándares de calidad, utilizando tecnología de punta y un equipo humano altamente calificado para garantizar la satisfacción y seguridad de nuestros clientes.
                </p>
              </div>
              {/* Visión */}
              <div className="rounded-2xl bg-surface-secondary border border-border-subtle p-8 text-center">
                <div className="w-14 h-14 rounded-xl bg-interactive-accent/10 flex items-center justify-center mx-auto mb-5">
                  <Eye className="w-7 h-7 text-interactive-accent" />
                </div>
                <h3 className="text-lg font-heading font-bold text-text-primary mb-3">Visión</h3>
                <p className="text-text-secondary leading-relaxed text-sm">
                  Ser el taller de motocicletas líder en Colombia, reconocido por nuestra excelencia en el servicio, innovación constante y compromiso con la comunidad motociclista para el año 2028.
                </p>
              </div>
              {/* Valores */}
              <div className="rounded-2xl bg-surface-secondary border border-border-subtle p-8 text-center">
                <div className="w-14 h-14 rounded-xl bg-interactive-accent/10 flex items-center justify-center mx-auto mb-5">
                  <Star className="w-7 h-7 text-interactive-accent" />
                </div>
                <h3 className="text-lg font-heading font-bold text-text-primary mb-3">Valores</h3>
                <ul className="text-text-secondary leading-relaxed text-sm space-y-2 text-left">
                  <li><strong className="text-text-primary">Honestidad:</strong> Transparencia en cada diagnóstico y presupuesto.</li>
                  <li><strong className="text-text-primary">Calidad:</strong> Excelencia en cada servicio y en cada detalle.</li>
                  <li><strong className="text-text-primary">Pasión:</strong> Amor por las motocicletas y por cada cliente.</li>
                  <li><strong className="text-text-primary">Compromiso:</strong> Cumplimos los tiempos acordados.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pasión por las motos ── */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="rounded-2xl overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1621939514649-280e24295ff8?w=800&h=600&fit=crop" alt="Mecánico trabajando" loading="lazy"
                    className="w-full h-auto object-cover" />
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-4">
                  Pasión por las <span className="text-transparent bg-clip-text bg-gradient-to-r from-interactive-accent to-orange-400">motos</span>
                </h2>
                <p className="text-text-secondary leading-relaxed mb-8">
                  Taller especializado en mantenimiento, reparación y personalización de motocicletas.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: "3+", label: "Sucursales" },
                    { value: "1+", label: "Marcas" },
                    { value: "100%", label: "Comprometidos" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-border-subtle bg-surface-secondary p-4 text-center">
                      <p className="text-xl font-bold text-interactive-accent">{stat.value}</p>
                      <p className="text-xs text-text-tertiary mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Nuestro Equipo ── */}
        <section className="py-16 md:py-20 border-t border-border-subtle">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-[11px] font-bold text-interactive-accent uppercase tracking-[0.2em]">Nuestro Equipo</span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mt-2">Profesionales apasionados por las motos</h2>
              <div className="mt-4 mx-auto w-16 h-1 bg-gradient-to-r from-interactive-accent to-orange-400 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, i) => (
                <motion.div key={member.name}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="group bg-surface-secondary border border-border-subtle rounded-2xl overflow-hidden hover:border-interactive-accent/30 hover:shadow-lg hover:shadow-interactive-accent/5 transition-all duration-300"
                >
                  <div className="aspect-square overflow-hidden">
                    <img src={member.image} alt={member.name} loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-heading font-bold text-text-primary">{member.name}</h3>
                    <p className="text-sm text-interactive-accent font-medium">{member.role}</p>
                    <ul className="mt-3 space-y-1.5">
                      {member.bullets.map((b, bi) => (
                        <li key={bi} className="flex items-center gap-2 text-xs text-text-secondary">
                          <span className="w-1.5 h-1.5 bg-interactive-accent rounded-full shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 pt-3 border-t border-border-subtle">
                      <a href="#" className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-interactive-accent transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        LinkedIn
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Nuestras Instalaciones ── */}
        {facilities.length > 0 && (
        <section className="py-16 md:py-20 border-t border-border-subtle">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-[11px] font-bold text-interactive-accent uppercase tracking-[0.2em]">Nuestras Instalaciones</span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mt-2">Conoce nuestro taller</h2>
              <div className="mt-4 mx-auto w-16 h-1 bg-gradient-to-r from-interactive-accent to-orange-400 rounded-full" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {facilities.map((item, i) => {
                const IconComp = iconMap[item.icon] || Building2;
                return (
                <motion.div key={item.id || i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="bg-surface-secondary border border-border-subtle rounded-2xl p-6 text-center hover:border-interactive-accent/30 transition-all"
                >
                  <div className="w-14 h-14 rounded-xl bg-interactive-accent/10 flex items-center justify-center mx-auto mb-4">
                    <IconComp className="w-7 h-7 text-interactive-accent" />
                  </div>
                  <h3 className="text-sm font-heading font-bold text-text-primary mb-1">{item.title || item.label}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{item.description || item.desc}</p>
                </motion.div>
                );
              })}
            </div>
          </div>
        </section>
        )}

        {/* ── Certificaciones ── */}
        {certifications.length > 0 && (
        <section className="py-16 md:py-20 border-t border-border-subtle">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-[11px] font-bold text-interactive-accent uppercase tracking-[0.2em]">Certificaciones</span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mt-2">Respaldo y calidad certificada</h2>
              <div className="mt-4 mx-auto w-16 h-1 bg-gradient-to-r from-interactive-accent to-orange-400 rounded-full" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {certifications.map((cert, i) => (
                <motion.div key={cert.id || i}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                  className="bg-surface-secondary border border-border-subtle rounded-2xl p-5 text-center hover:border-interactive-accent/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                    {cert.image ? (
                      <img src={cert.image} alt={cert.title} className="w-8 h-8 object-contain" />
                    ) : (
                      <Award className="w-6 h-6 text-amber-500" />
                    )}
                  </div>
                  <h3 className="text-sm font-heading font-bold text-text-primary">{cert.title}</h3>
                  <p className="text-[11px] text-text-secondary mt-1 leading-snug">{cert.issuer || cert.entity}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* ── Aliados Comerciales ── */}
        {brands.length > 0 && (
        <section className="py-16 md:py-20 border-t border-border-subtle overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-8 text-center">
            <span className="text-[11px] font-bold text-interactive-accent uppercase tracking-[0.2em]">Aliados Comerciales</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mt-2">Marcas que confían en nosotros</h2>
          </div>
          <div ref={brandsRef} className="relative group" onMouseEnter={() => setBrandsPaused(true)} onMouseLeave={() => setBrandsPaused(false)}>
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-surface-primary to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-surface-primary to-transparent z-10 pointer-events-none" />
            <div className="overflow-hidden">
              <div ref={brandsTrackRef} className="flex gap-14 items-center w-max">
                {[...brands, ...brands].map((brand: any, i: number) => (
                  <BrandLogo key={i} name={brand.name} image={brand.image} size="lg" showName={false} className="!px-0 !py-0 !border-0 !bg-transparent hover:!bg-transparent opacity-80 hover:opacity-100 transition-opacity" />
                ))}
              </div>
            </div>
            <button onClick={() => scrollBrands("left")} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-surface-secondary/90 backdrop-blur-sm border border-border text-text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-interactive-accent hover:text-white hover:border-interactive-accent shadow-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            <button onClick={() => scrollBrands("right")} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-surface-secondary/90 backdrop-blur-sm border border-border text-text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-interactive-accent hover:text-white hover:border-interactive-accent shadow-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </div>
        </section>
        )}

        {/* ── Nuestra Esencia ── */}
        <section className="py-16 md:py-20 border-t border-border-subtle">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <span className="text-[11px] font-bold text-interactive-accent uppercase tracking-[0.2em]">Nuestra Esencia</span>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mt-3 mb-4">
                  Comprometidos con la calidad y la pasión por las motos
                </h2>
                <p className="text-text-secondary leading-relaxed mb-8 text-sm">
                  Desde 2015 trabajamos para ofrecer el mejor servicio, utilizando tecnología avanzada, repuestos de calidad y un equipo altamente capacitado para garantizar tu satisfacción.
                </p>
                <div className="grid grid-cols-2 gap-5">
                  {(values.length > 0 ? values : [
                    { title: "Calidad Garantizada", description: "Excelencia en cada servicio", icon: "shield" },
                    { title: "Atención Personalizada", description: "Trato cercano y profesional", icon: "users" },
                    { title: "Tecnología Avanzada", description: "Equipos de última generación", icon: "zap" },
                    { title: "Siempre Contigo", description: "Compromiso total", icon: "heart" },
                  ]).map((val: any) => (
                    <div key={val.id || val.title} className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-lg bg-interactive-accent/10 flex items-center justify-center text-lg shrink-0">
                        <IconRenderer name={val.icon || "heart"} size={20} />
                      </span>
                      <div>
                        <span className="text-sm font-semibold text-text-primary">{val.title}</span>
                        {val.description && <p className="text-[10px] text-text-tertiary">{val.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="rounded-2xl overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1621939514649-280e24295ff8?w=800&h=600&fit=crop" alt="MotoPro Esencia" loading="lazy"
                    className="w-full h-auto object-cover" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
