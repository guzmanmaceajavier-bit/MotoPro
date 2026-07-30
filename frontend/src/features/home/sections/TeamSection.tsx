import FadeIn from "@/components/ui/FadeIn";
import SectionTitle from "@/components/ui/SectionTitle";
import { useTeam } from "@/providers/CMSProvider";

export function TeamSection() {
  const { team, loading } = useTeam();

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-surface-primary">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-surface-secondary p-6 animate-pulse h-64" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (team.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-surface-primary">
      <div className="mx-auto max-w-7xl px-4">
        <SectionTitle title="Nuestro equipo" subtitle="Profesionales apasionados por las motos" light />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, i) => (
            <FadeIn key={member.id ?? member.name} delay={i * 0.1}>
              <div className="group rounded-2xl border border-white/10 bg-surface-secondary p-6 text-center hover:border-interactive-accent/40 hover:shadow-lg hover:shadow-interactive-accent/5 transition-all h-full flex flex-col">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-interactive-accent/20 to-blue-500/20 group-hover:scale-110 transition-transform">
                  {member.image ? (
                    <img src={member.image} alt={member.name} loading="lazy" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-interactive-accent">{member.name.charAt(0)}</span>
                  )}
                </div>
                <h3 className="text-lg font-heading font-bold text-white">{member.name}</h3>
                <p className="text-sm text-interactive-accent">{member.role}</p>
                <div className="mt-3 space-y-1 text-xs text-gray-400">
                  <p>{member.specialty}</p>
                  {member.experience && <p className="text-amber-400">{member.experience}</p>}
                </div>
                {member.description && (
                  <p className="mt-3 text-xs text-gray-500 leading-relaxed">{member.description}</p>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
