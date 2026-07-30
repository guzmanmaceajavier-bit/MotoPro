import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  LayoutDashboard, Car, Wrench, ShoppingCart, FileText, Heart,
  User, Shield, Settings, Bell, Menu, X, LogOut, Sun, Moon, ChevronDown, Bike,
  Calendar, ClipboardList, ShieldCheck,
} from "lucide-react";

const navLinks = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/" },
  { label: "Mis Vehículos", icon: Car, to: "/vehiculos" },
  { label: "Mis Servicios", icon: Wrench, to: "/servicios" },
  { label: "Cotizaciones", icon: ClipboardList, to: "/cotizaciones" },
  { label: "Mis Citas", icon: Calendar, to: "/citas" },
  { label: "Mis Compras", icon: ShoppingCart, to: "/compras" },
  { label: "Mis Facturas", icon: FileText, to: "/facturas" },
  { label: "Garantías", icon: ShieldCheck, to: "/garantias" },
  { label: "Favoritos", icon: Heart, to: "/favoritos" },
  { label: "Notificaciones", icon: Bell, to: "/notificaciones" },
  { label: "Perfil", icon: User, to: "/perfil" },
];

export default function ClientLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    if (userMenuOpen) {
      setTimeout(() => document.addEventListener("mousedown", handler), 0);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [userMenuOpen]);

  const a = "var(--accent)";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 flex flex-col h-screen w-56 shrink-0 transition-all duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
        style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
      >
        <div className="flex items-center gap-2.5 h-13 px-4 border-b shrink-0" style={{ borderColor: "var(--sidebar-border)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-extrabold shrink-0"
            style={{ background: "linear-gradient(135deg, #E05E00, #FF6B00)" }}>
            <Bike size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold truncate tracking-tight" style={{ color: "var(--text)" }}>MotoPro</div>
            <div className="text-[9px] font-medium uppercase tracking-wider truncate" style={{ color: "var(--text-tertiary)" }}>Portal del Cliente</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-md" style={{ color: "var(--text-tertiary)" }} type="button">
            <X size={15} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"} onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all relative group"
              style={({ isActive }: { isActive: boolean }) => ({
                color: isActive ? a : "var(--text-secondary)",
                background: isActive ? "var(--accent-glow)" : "transparent",
              }) as React.CSSProperties}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains("active")) e.currentTarget.style.background = "var(--sidebar-hover)";
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.classList.contains("active")) e.currentTarget.style.background = "transparent";
              }}
            >
              {({ isActive }: { isActive: boolean }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full" style={{ background: a }} />
                  )}
                  <link.icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
                  <span className={`truncate flex-1 ${isActive ? "font-bold" : ""}`}>{link.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t px-2 py-2 space-y-px shrink-0" style={{ borderColor: "var(--sidebar-border)" }}>
          <button onClick={toggleTheme}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-all"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--sidebar-hover)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            type="button"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === "dark" ? "Modo Claro" : "Modo Oscuro"}</span>
          </button>

          <div className="relative" ref={ref}>
            <button onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-all"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--sidebar-hover)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              type="button"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                style={{ background: "linear-gradient(135deg, #E05E00, #FF6B00)" }}>
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-medium truncate" style={{ color: "var(--text)" }}>{user?.name || "Usuario"}</div>
              </div>
              <ChevronDown size={11} className={`shrink-0 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} style={{ color: "var(--text-tertiary)" }} />
            </button>
            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 rounded-xl border p-1 z-50 animate-scale-in"
                style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", boxShadow: "var(--shadow-lg)" }}>
                <button onClick={() => { navigate("/perfil"); setUserMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs transition-all"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-muted)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  type="button">
                  <User size={12} /> Perfil
                </button>
                <button onClick={() => { logout(); setUserMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-500/10 transition-all"
                  type="button">
                  <LogOut size={12} /> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 flex items-center gap-2 px-4 border-b shrink-0 lg:hidden" style={{ background: "var(--bg)", borderColor: "var(--border)" }}>
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-md transition-all" style={{ color: "var(--text-secondary)" }} type="button">
            <Menu size={16} />
          </button>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[9px] font-extrabold shrink-0"
              style={{ background: "linear-gradient(135deg, #E05E00, #FF6B00)" }}>
              <Bike size={14} />
            </div>
            <div className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>MotoPro</div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggleTheme} className="p-1.5 rounded-md transition-all" style={{ color: "var(--text-secondary)" }} type="button">
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button onClick={() => navigate("/perfil")} className="p-1.5 rounded-md transition-all" style={{ color: "var(--text-secondary)" }} type="button">
              <User size={15} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto py-5 px-4 md:px-6 lg:px-8 max-w-[1440px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
