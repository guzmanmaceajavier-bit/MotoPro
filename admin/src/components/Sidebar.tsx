import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "@/api/client";
import {
  LayoutDashboard, Package, Wrench, ShoppingCart, Users, Store, Image,
  Settings, FileText, MessageSquare, UserCog,
  BookOpen, FolderTree, Tags, Layers, HelpCircle, LogOut,
  Sliders, Grid3X3, X, Globe, Type,
  Calendar, Shield, Clock, ClipboardList, Car, ClipboardCheck, Truck, Wallet, CreditCard,
  MessageCircle, BarChart3, Award, Building2, Activity, RotateCcw, Mail, Bike, Heart
} from "lucide-react";

interface NavItem {
  label: string;
  to?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children?: NavItem[];
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: "Dashboard",
    items: [
      { label: "Dashboard", to: "/", icon: LayoutDashboard },
    ]
  },
  {
    label: "Operaciones",
    items: [
      { label: "Recepción", to: "/recepcion", icon: ClipboardCheck },
      { label: "Órdenes Taller", to: "/orders", icon: Layers },
      { label: "Servicios", to: "/services", icon: Wrench },
      { label: "Calendario", to: "/calendar", icon: Calendar },
      { label: "Mecánicos", to: "/mechanics", icon: Users },
      { label: "Timeline", to: "/timeline", icon: Clock },
      { label: "Diagnósticos", to: "/diagnostics", icon: ClipboardList },
      { label: "Cotizaciones", to: "/quotes", icon: FileText },
    ]
  },
  {
    label: "Comercial",
    items: [
      { label: "Punto de Venta", to: "/pos", icon: CreditCard },
      { label: "Caja", to: "/caja", icon: Wallet },
      { label: "Pedidos Tienda", to: "/pedidos-tienda", icon: Store },
      { label: "Clientes", to: "/clientes", icon: Users },
      { label: "Vehículos", to: "/vehiculos", icon: Car },
      { label: "Facturas", to: "/invoices", icon: ClipboardList },
      { label: "Garantías", to: "/warranties", icon: Shield },
      { label: "Devoluciones", to: "/returns", icon: RotateCcw },
    ]
  },
  {
    label: "Inventario",
    items: [
      { label: "Productos", to: "/products", icon: Package },
      { label: "Categorías", to: "/categories", icon: FolderTree },
      { label: "Marcas", to: "/brands", icon: Tags },
      { label: "Inventario Físico", to: "/inventario", icon: Grid3X3 },
      { label: "Proveedores", to: "/proveedores", icon: Truck },
      { label: "Compras", to: "/compras", icon: ShoppingCart },
    ]
  },
  {
    label: "Contenido",
    items: [
      { label: "Blog", to: "/blog", icon: BookOpen },
      { label: "Comentarios", to: "/comments", icon: MessageSquare },
      { label: "Testimonios", to: "/testimonials", icon: MessageSquare },
      { label: "Equipo", to: "/team", icon: Users },
      { label: "Valores", to: "/values", icon: Heart },
      { label: "Antes/Después", to: "/before-after", icon: Layers },
      { label: "Bahías", to: "/garage-bays", icon: Wrench },
      { label: "Procesos", to: "/process-steps", icon: Settings },
      { label: "Instalaciones", to: "/facilities", icon: Building2 },
      { label: "Certificaciones", to: "/certifications", icon: Award },
      { label: "Confianza", to: "/trust-items", icon: Shield },
      { label: "Galería", to: "/gallery", icon: Image },
      { label: "Sliders", to: "/sliders", icon: Sliders },
      { label: "Homepage", to: "/homepage", icon: Globe },
      { label: "Navbar", to: "/navbar", icon: Type },
      { label: "Footer", to: "/footer", icon: FileText },
      { label: "SEO", to: "/seo", icon: Globe },
      { label: "Contactos", to: "/contacts", icon: MessageSquare },
      { label: "FAQ", to: "/faq", icon: HelpCircle },
      { label: "Legales", to: "/legal", icon: BookOpen },
      { label: "Multimedia", to: "/multimedia", icon: Image },
      { label: "Newsletter", to: "/newsletter", icon: Mail },
    ]
  },
  {
    label: "Analítica",
    items: [
      { label: "Reportes", to: "/reportes", icon: BarChart3 },
      { label: "Fidelidad", to: "/fidelidad", icon: Award },
    ]
  },
  {
    label: "Configuración",
    items: [
      { label: "General", to: "/settings", icon: Settings },
      { label: "WhatsApp", to: "/whatsapp", icon: MessageCircle },
      { label: "Sucursales", to: "/sucursales", icon: Building2 },
      { label: "Monitoreo", to: "/logs", icon: Activity },
      { label: "Perfil", to: "/profile", icon: UserCog },
    ]
  },
];

function NavItemComponent({ item }: { item: NavItem }) {
  if (!item.to) return null;
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      className={({ isActive }) =>
        `relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group ${
          isActive
            ? 'text-[var(--mp-accent)] bg-[var(--mp-accent)]/12'
            : 'text-[var(--mp-text-secondary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--mp-accent)]" />
          )}
          <item.icon size={16} className={`shrink-0 ${isActive ? 'text-[var(--mp-accent)]' : 'text-[var(--mp-text-tertiary)]'}`} />
          <span className="flex-1">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [status, setStatus] = useState({ orders: 0, alerts: 0 });

  useEffect(() => {
    api.get("/orders?status=in_progress").then(d => setStatus(s => ({ ...s, orders: Array.isArray(d) ? d.length : 0 }))).catch(() => {});
    api.get("/products/alerts").then(d => setStatus(s => ({ ...s, alerts: Array.isArray(d) ? d.length : d?.count || 0 }))).catch(() => {});
  }, []);

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[240px] bg-[var(--mp-bg-elevated)] border-r border-[var(--mp-border)] flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 h-14 px-4 border-b border-[var(--mp-border)] shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--mp-accent)] shadow-lg shadow-[var(--mp-accent)]/20">
            <Bike size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-bold text-[var(--mp-text-primary)] tracking-tight">MOTOPRO</span>
            <span className="block text-[10px] text-[var(--mp-text-tertiary)] font-semibold tracking-wider">CONTROL CENTER</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-md text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-hover)] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-5 scrollbar-thin">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-1.5 text-[10px] font-bold text-[var(--mp-text-tertiary)] uppercase tracking-widest">{section.label}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavItemComponent key={item.to || item.label} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* System Status */}
        <div className="px-3 py-3 border-t border-[var(--mp-border)] shrink-0">
          <div className="rounded-lg bg-[var(--mp-bg-base)] p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--mp-success)]"></span>
              <span className="text-[10px] font-medium text-[var(--mp-text-tertiary)]">Sistema operativo</span>
            </div>
            <div className="flex items-center gap-2">
              <Bike size={12} className="text-[var(--mp-accent)]" />
              <span className="text-[10px] text-[var(--mp-text-tertiary)]">{status.orders} moto{status.orders !== 1 ? 's' : ''} en servicio</span>
            </div>
            {status.alerts > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--mp-warning)]"></span>
                <span className="text-[10px] text-[var(--mp-warning)]">{status.alerts} alertas de stock</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-[var(--mp-border)] shrink-0">
          <button className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-[var(--mp-text-tertiary)] hover:text-[var(--mp-danger)] hover:bg-[var(--mp-danger-bg)] transition-colors">
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
