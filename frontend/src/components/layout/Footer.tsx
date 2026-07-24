import { Link } from "react-router-dom";
import { useCMS } from "@/providers/CMSProvider";

export function Footer() {
  const { footer, config } = useCMS();
  const footerColumns = footer.length > 0 ? footer.sort((a, b) => a.column_number - b.column_number) : [];

  return (
    <footer className="border-t bg-surface-primary" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Logo + Description */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-interactive-accent">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <span className="text-xl font-heading font-bold text-text-primary tracking-tight">Moto<span className="text-interactive-accent">Pro</span></span>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed max-w-[240px]">
              {config.site_description || "Taller especializado en mantenimiento, reparación y personalización de motocicletas."}
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { name: "Facebook", href: config.social_facebook || "#", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" },
                { name: "Instagram", href: config.social_instagram || "#", path: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 010 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6z" },
                { name: "YouTube", href: config.social_youtube || "#", path: "M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.38.55A3.02 3.02 0 00.5 6.19 31.6 31.6 0 000 12a31.6 31.6 0 00.5 5.81 3.02 3.02 0 002.12 2.14c1.78.55 9.38.55 9.38.55s7.6 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.6 31.6 0 0024 12a31.6 31.6 0 00-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" },
                { name: "TikTok", href: config.social_tiktok || "#", path: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.17v-3.44a4.85 4.85 0 01-5.58-2.72V2.01h3.45l.01-.01-.01-.01h-.39z" },
              ].map(social => (
                <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border text-text-tertiary hover:border-interactive-accent/30 hover:text-interactive-accent transition-all"
                  aria-label={social.name}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Columns from CMS or defaults */}
          {footerColumns.length > 0 ? footerColumns.map(col => {
            const items = JSON.parse(col.items_json || "[]") as { label: string; link: string }[];
            return (
              <div key={col.column_number}>
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-5">{col.section_title}</h4>
                <ul className="space-y-3">
                  {items.map(item => (
                    <li key={item.label}>
                      <Link to={item.link} className="text-sm text-text-secondary hover:text-interactive-accent transition-colors">{item.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }) : (
            <>
              <div>
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-5">Servicios</h4>
                <ul className="space-y-3">
                  <li><Link to="/servicios" className="text-sm text-text-secondary hover:text-interactive-accent transition-colors">Mantenimiento</Link></li>
                  <li><Link to="/servicios" className="text-sm text-text-secondary hover:text-interactive-accent transition-colors">Reparaciones</Link></li>
                  <li><Link to="/servicios" className="text-sm text-text-secondary hover:text-interactive-accent transition-colors">Personalización</Link></li>
                  <li><Link to="/servicios" className="text-sm text-text-secondary hover:text-interactive-accent transition-colors">Diagnóstico</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-5">Tienda</h4>
                <ul className="space-y-3">
                  <li><Link to="/tienda" className="text-sm text-text-secondary hover:text-interactive-accent transition-colors">Repuestos</Link></li>
                  <li><Link to="/tienda" className="text-sm text-text-secondary hover:text-interactive-accent transition-colors">Accesorios</Link></li>
                  <li><Link to="/tienda" className="text-sm text-text-secondary hover:text-interactive-accent transition-colors">Equipamiento</Link></li>
                  <li><Link to="/tienda" className="text-sm text-text-secondary hover:text-interactive-accent transition-colors">Lubricantes</Link></li>
                  <li><Link to="/comparar" className="text-sm text-text-secondary hover:text-interactive-accent transition-colors">Comparar</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-5">MotoPro</h4>
                <ul className="space-y-3">
                  <li><Link to="/nosotros" className="text-sm text-text-secondary hover:text-interactive-accent transition-colors">Sobre nosotros</Link></li>
                  <li><Link to="/blog" className="text-sm text-text-secondary hover:text-interactive-accent transition-colors">Blog</Link></li>
                  <li><Link to="/galeria" className="text-sm text-text-secondary hover:text-interactive-accent transition-colors">Galería</Link></li>
                  <li><Link to="/faq" className="text-sm text-text-secondary hover:text-interactive-accent transition-colors">FAQ</Link></li>
                  <li><Link to="/promociones" className="text-sm text-text-secondary hover:text-interactive-accent transition-colors">Promociones</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-5">Contacto</h4>
                <ul className="space-y-3">
                  <li><Link to="/contacto" className="text-sm text-text-secondary hover:text-interactive-accent transition-colors">Formulario de contacto</Link></li>
                  <li><Link to="/agendar-cita" className="text-sm text-text-secondary hover:text-interactive-accent transition-colors">Agendar cita</Link></li>
                  <li><Link to="/estado-servicio" className="text-sm text-text-secondary hover:text-interactive-accent transition-colors">Consultar estado</Link></li>
                </ul>
              </div>
            </>
          )}
        </div>

        <div className="mt-16 border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: "var(--border-subtle)" }}>
          <p className="text-xs text-text-tertiary">
            &copy; 2026 {config.site_name || "MotoPro"}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacidad" className="text-xs text-text-tertiary hover:text-text-secondary transition-colors">
              Privacidad
            </Link>
            <Link to="/terminos" className="text-xs text-text-tertiary hover:text-text-secondary transition-colors">
              Términos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
