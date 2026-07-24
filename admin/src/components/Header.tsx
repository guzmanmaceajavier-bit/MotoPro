import { Bell, Sun, Moon, Search } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 flex items-center gap-3 px-5 border-b border-[var(--mp-border)] bg-[var(--mp-bg-surface)] shrink-0 header-glow">
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg text-[var(--mp-text-secondary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)] transition-colors" aria-label="Abrir menú">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 12h16M4 6h16M4 18h16" />
        </svg>
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] pointer-events-none" />
        <input type="text" placeholder="Buscar..."
          className="h-9 w-full rounded-lg border border-[var(--mp-border)] bg-[var(--mp-bg-elevated)] pl-9 pr-4 text-sm text-[var(--mp-text-primary)] placeholder:text-[var(--mp-text-tertiary)] focus:outline-none focus:border-[var(--mp-accent)] focus:ring-2 focus:ring-[var(--mp-accent-glow)] transition-all duration-150"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 rounded border border-[var(--mp-border)] bg-[var(--mp-bg-base)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--mp-text-tertiary)]">
          <span className="text-[11px]">⌘</span>K
        </kbd>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 ml-auto">
        <button className="p-2 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)] transition-colors" aria-label="Notificaciones">
          <Bell size={16} strokeWidth={1.5} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--mp-danger)] ring-2 ring-[var(--mp-bg-surface)]" />
        </button>
        <button onClick={toggleTheme} className="p-2 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)] transition-colors" aria-label="Cambiar tema">
          {theme === 'dark' ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
        </button>

        {/* User */}
        <div className="flex items-center gap-2.5 pl-3 ml-1 border-l border-[var(--mp-border)]">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-[var(--mp-text-primary)]">Admin</p>
            <p className="text-[10px] text-[var(--mp-text-tertiary)] font-medium">admin@motopro.com</p>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-[#14b8a6] to-[#0d9488] shadow-md shadow-[rgba(20,184,166,0.2)]">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}
