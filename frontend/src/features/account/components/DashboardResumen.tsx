import { Link } from "react-router-dom";

interface DashboardResumenProps {
  stats: { label: string; value: number; icon: string; to?: string }[];
  services: any[];
  orders: any[];
  vehicles: any[];
  user: any;
}

const iconMap: Record<string, React.ReactNode> = {
  services: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l2.05-2.05m0 0l2.05-2.05m-2.05 2.05l-2.05-2.05m2.05 2.05l2.05 2.05m-6.17-2.05L16.5 3.75 12 8.25m-5.17 8.5l-1.25 5.25 5.25-1.25L20.25 5.25 18 3l-12.5 12.5z" /></svg>,
  orders: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>,
  vehicles: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>,
  warranty: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
  appointments: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
};

export function DashboardResumen({ stats, user }: DashboardResumenProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.label}
            className="bg-surface-secondary border border-border rounded-xl p-4 hover:border-interactive-accent/30 transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-interactive-accent/10 flex items-center justify-center text-interactive-accent">
                {iconMap[s.icon]}
              </div>
              <span className="text-2xl font-bold text-text-primary">{s.value}</span>
            </div>
            <p className="text-xs text-text-tertiary">{s.label}</p>
            {s.to && (
              <Link to={s.to} className="text-[10px] text-interactive-accent hover:underline mt-1 inline-block">Ver todos</Link>
            )}
          </div>
        ))}
      </div>

      <div className="bg-surface-secondary border border-border rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-interactive-accent/10 flex items-center justify-center text-3xl font-bold text-interactive-accent">
            {user?.name?.charAt(0) || "?"}
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">{user?.name || "Usuario"}</h3>
            <p className="text-sm text-text-tertiary">{user?.email}</p>
            {user?.phone && <p className="text-sm text-text-tertiary">{user.phone}</p>}
            {user?.created_at && (
              <p className="text-xs text-text-tertiary/60 mt-1">Miembro desde {new Date(user.created_at).toLocaleDateString("es-ES", { year: "numeric", month: "long" })}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: "Servicios", to: "?tab=servicios" },
            { label: "Compras", to: "?tab=compras" },
            { label: "Vehículos", to: "?tab=vehiculos" },
            { label: "Perfil", to: "?tab=perfil" },
          ].map((link) => (
            <Link key={link.label} to={link.to}
              className="text-center text-xs font-semibold text-interactive-accent bg-interactive-accent/5 border border-interactive-accent/20 rounded-lg py-2 hover:bg-interactive-accent/10 transition-all"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
