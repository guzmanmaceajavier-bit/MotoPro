import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCMS } from "@/providers/CMSProvider";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useMoto } from "@/providers/MotoProvider";
import { api } from "@/api/client";
import { ChevronDown, ChevronRight, X, Menu, Search, ShoppingCart, User, Bike, Wrench, CircleDot, Zap, Droplets, Disc } from "lucide-react";
import { Spinner } from "@/components/ui";

const fallbackLinks = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/tienda", label: "Tienda" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

interface MegaMenuItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: { label: string; href: string }[];
}

const MEGA_MENU_DATA: MegaMenuItem[] = [
  {
    label: "Por Motos",
    icon: <Bike size={16} />,
    children: [
      { label: "AKT", href: "/tienda?moto_brand=AKT" },
      { label: "BAJAJ", href: "/tienda?moto_brand=BAJAJ" },
      { label: "HONDA", href: "/tienda?moto_brand=HONDA" },
      { label: "YAMAHA", href: "/tienda?moto_brand=YAMAHA" },
      { label: "SUZUKI", href: "/tienda?moto_brand=SUZUKI" },
      { label: "KTM", href: "/tienda?moto_brand=KTM" },
      { label: "KAWASAKI", href: "/tienda?moto_brand=KAWASAKI" },
      { label: "BENELLI", href: "/tienda?moto_brand=BENELLI" },
      { label: "TVS", href: "/tienda?moto_brand=TVS" },
      { label: "HERO", href: "/tienda?moto_brand=HERO" },
      { label: "KYMCO", href: "/tienda?moto_brand=KYMCO" },
      { label: "ROYAL ENFIELD", href: "/tienda?moto_brand=ROYAL ENFIELD" },
    ],
  },
  {
    label: "Repuestos",
    icon: <Wrench size={16} />,
    children: [
      { label: "Amortiguadores", href: "/tienda?categoria=Amortiguadores" },
      { label: "Balineras / Canastillas", href: "/tienda?categoria=Balineras" },
      { label: "Cables / Guayas", href: "/tienda?categoria=Cables" },
      { label: "Carburador", href: "/tienda?categoria=Carburador" },
      { label: "Correas / Poleas", href: "/tienda?categoria=Correas" },
      { label: "Empaques", href: "/tienda?categoria=Empaques" },
      { label: "Filtros", href: "/tienda?categoria=Filtros" },
      { label: "Mofles", href: "/tienda?categoria=Mofles" },
      { label: "Motor", href: "/tienda?categoria=Motor" },
      { label: "Tapas / Plásticos", href: "/tienda?categoria=Tapas" },
    ],
  },
  {
    label: "Llantas",
    icon: <Disc size={16} />,
    children: [
      { label: "Doble Propósito", href: "/tienda?categoria=Llantas&segment=doble" },
      { label: "Enduro", href: "/tienda?categoria=Llantas&segment=enduro" },
      { label: "Scooter", href: "/tienda?categoria=Llantas&segment=scooter" },
      { label: "Neumático", href: "/tienda?categoria=Llantas&tipo=neumatico" },
      { label: "Sellomatic", href: "/tienda?categoria=Llantas&tipo=sellomatic" },
    ],
  },
  {
    label: "Aceites",
    icon: <Droplets size={16} />,
    children: [
      { label: "2 Tiempos", href: "/tienda?categoria=Aceites&tipo=2t" },
      { label: "4 Tiempos", href: "/tienda?categoria=Aceites&tipo=4t" },
      { label: "Cadena", href: "/tienda?categoria=Aceites&tipo=cadena" },
      { label: "Motor", href: "/tienda?categoria=Aceites&tipo=motor" },
      { label: "Refrigerante", href: "/tienda?categoria=Aceites&tipo=refrigerante" },
      { label: "Transmisión", href: "/tienda?categoria=Aceites&tipo=transmision" },
      { label: "Sintético", href: "/tienda?categoria=Aceites&visc=sintetico" },
      { label: "Semisintético", href: "/tienda?categoria=Aceites&visc=semisintetico" },
      { label: "Mineral", href: "/tienda?categoria=Aceites&visc=mineral" },
    ],
  },
  {
    label: "Sistema Eléctrico",
    icon: <Zap size={16} />,
    children: [
      { label: "Bujías", href: "/tienda?categoria=Bujias" },
      { label: "Baterías", href: "/tienda?categoria=Baterias" },
      { label: "Farolas", href: "/tienda?categoria=Farolas" },
      { label: "Motor de Arranque", href: "/tienda?categoria=Motor+Arranque" },
      { label: "Comandos / Switch", href: "/tienda?categoria=Comandos" },
      { label: "Direccionales / Stop", href: "/tienda?categoria=Direccionales" },
      { label: "Velocímetros / Tacómetros", href: "/tienda?categoria=Velocimetros" },
      { label: "Instalación Eléctrica", href: "/tienda?categoria=Instalacion" },
    ],
  },
];

export function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { navbar } = useCMS();
  const { count, items, total, removeItem } = useCart();
  const { user, logout } = useAuth();
  const { activeVehicle } = useMoto();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState<string | null>(null);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const megaRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<any>(null);

  const navLinks = navbar.length > 0
    ? navbar.filter(n => n.is_visible).map(n => ({ href: n.link, label: n.label }))
    : fallbackLinks;

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setCartOpen(false);
    setUserMenuOpen(false);
    setMegaOpen(null);
  }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) setCartOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(prev => !prev);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!query.trim()) { setSearchResults([]); setSearching(false); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setSearchResults(data?.results || []);
        setSearchOpen(true);
      } catch { setSearchResults([]); } finally { setSearching(false); }
    }, 300);
  };

  const goToResult = (item: any) => {
    setSearchOpen(false);
    setSearchQuery("");
    if (item.type === "product") navigate(`/tienda/${item.slug}`);
    else if (item.type === "service") navigate(`/servicios/${item.slug}`);
    else if (item.type === "post") navigate(`/blog/${item.id}`);
  };

  const handleLogout = () => { logout(); setUserMenuOpen(false); navigate("/"); };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const userMenuItems = [
    { to: "/mi-cuenta?tab=perfil", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z", label: "Mi perfil" },
    { to: "/mi-cuenta?tab=vehiculos", icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.152-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12", label: "Mis motocicletas" },
    { to: "/mi-cuenta?tab=servicios", icon: "M11.42 15.17l2.05-2.05m0 0l2.05-2.05m-2.05 2.05l-2.05-2.05m2.05 2.05l2.05 2.05m-6.17-2.05L16.5 3.75 12 8.25m-5.17 8.5l-1.25 5.25 5.25-1.25L20.25 5.25 18 3l-12.5 12.5z", label: "Mis servicios" },
    { to: "/mi-cuenta?tab=citas", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5", label: "Mis citas" },
    { to: "/mi-cuenta?tab=facturas", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z", label: "Facturas" },
    { to: "/mi-cuenta?tab=compras", icon: "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z", label: "Compras" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-dropdown border-b"
      style={{
        backgroundColor: "var(--navbar-bg)",
        borderColor: "var(--navbar-border)",
        boxShadow: "var(--navbar-shadow)",
        height: "64px",
      }}
    >
      <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-interactive-accent">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <span className="text-lg font-heading font-bold text-text-primary tracking-tight">Moto<span className="text-interactive-accent">Pro</span></span>
        </Link>

        {/* Desktop Nav with Mega Menu */}
        <nav className="hidden lg:flex items-center gap-0.5" ref={megaRef}>
          {navLinks.map(link => {
            const megaItem = MEGA_MENU_DATA.find(m => m.label === link.label);
            if (megaItem) {
              return (
                <div key={link.href} className="relative"
                  onMouseEnter={() => setMegaOpen(megaItem.label)}
                  onMouseLeave={() => setMegaOpen(null)}>
                  <button
                    className={`relative flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md ${
                      megaOpen === megaItem.label
                        ? "text-interactive-accent bg-surface-tertiary/50"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-tertiary/50"
                    }`}
                  >
                    {megaItem.label}
                    <ChevronDown size={14} className={`transition-transform ${megaOpen === megaItem.label ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {megaOpen === megaItem.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full pt-2"
                      >
                        <div className="bg-surface-secondary border border-border rounded-xl shadow-elevation-3 p-4 min-w-[200px]"
                          style={{ borderColor: "var(--border)" }}>
                          <div className="grid grid-cols-2 gap-1">
                            {megaItem.children?.map((child) => (
                              <Link
                                key={child.href}
                                to={child.href}
                                onClick={() => setMegaOpen(null)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-tertiary/50 transition-colors whitespace-nowrap"
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link
                key={link.href}
                to={link.href}
                className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md ${
                  isActive(link.href)
                    ? "text-interactive-accent"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-tertiary/50"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-interactive-accent"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-0.5">
          {/* Search */}
          <div ref={searchRef} className="relative hidden md:block">
            <button onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); }}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-tertiary/50 transition-all" aria-label="Buscar">
              <Search size={18} />
            </button>
            <AnimatePresence>
              {searchOpen && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-surface-secondary shadow-elevation-3 overflow-hidden"
                  style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center border-b" style={{ borderColor: "var(--border)" }}>
                    <Search size={16} className="ml-3 text-text-tertiary shrink-0" />
                    <input ref={searchInputRef} type="text" value={searchQuery} onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Buscar productos, servicios..."
                      className="h-10 w-full bg-transparent px-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none" />
                    {searchQuery && (
                      <button onClick={() => { setSearchQuery(""); setSearchResults([]); searchInputRef.current?.focus(); }}
                        className="mr-2 p-1 text-text-tertiary hover:text-text-primary" aria-label="Limpiar">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {searching && <Spinner size="sm" />}
                    {!searching && searchQuery && searchResults.length === 0 && (
                      <div className="py-8 text-center">
                        <Search size={24} className="mx-auto text-text-tertiary mb-2" />
                        <p className="text-sm text-text-tertiary">Sin resultados para "{searchQuery}"</p>
                        <p className="text-xs text-text-tertiary mt-1">Intenta con otros términos</p>
                      </div>
                    )}
                    {!searching && searchQuery && searchResults.length > 0 && (() => {
                      const grouped: Record<string, any[]> = {};
                      searchResults.forEach((item: any) => {
                        const type = item.type === "product" ? "product" : item.type === "service" ? "service" : "post";
                        if (!grouped[type]) grouped[type] = [];
                        grouped[type].push(item);
                      });
                      const typeInfo: Record<string, { label: string; icon: string }> = {
                        product: { label: "Productos", icon: "🛒" },
                        service: { label: "Servicios", icon: "🔧" },
                        post: { label: "Blog", icon: "📄" },
                      };
                      return (
                        <div>
                          {Object.entries(grouped).map(([type, items]) => (
                            <div key={type}>
                              <div className="px-4 py-1.5 text-[10px] font-bold text-text-tertiary uppercase tracking-wider bg-surface-tertiary/30" style={{ borderBottom: "1px solid var(--border)", borderTop: "1px solid var(--border)" }}>
                                {typeInfo[type]?.icon} {typeInfo[type]?.label} ({items.length})
                              </div>
                              {items.slice(0, 3).map((item: any, i: number) => (
                                <button key={i} onClick={() => goToResult(item)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-tertiary/50 transition-colors">
                                  {item.image && <img src={item.image} alt="" className="h-10 w-10 rounded object-cover shrink-0" />}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm text-text-primary truncate">{item.name || item.title}</p>
                                    <p className="text-xs text-text-tertiary">
                                      {type === "product" && item.price && `$${Number(item.price).toLocaleString()}`}
                                      {type === "product" && item.brand && ` · ${item.brand}`}
                                      {type === "service" && item.duration && `${item.duration}`}
                                    </p>
                                  </div>
                                </button>
                              ))}
                              {items.length > 3 && (
                                <Link to={`/${type === "product" ? "tienda" : type === "service" ? "servicios" : "blog"}?search=${encodeURIComponent(searchQuery)}`}
                                  onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                                  className="block px-4 py-1.5 text-center text-[11px] font-medium text-interactive-accent hover:bg-surface-tertiary/30 transition-colors">
                                  Ver todos los {typeInfo[type]?.label.toLowerCase()} ({items.length})
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Consultar estado */}
          <Link to="/estado-servicio" className={`hidden lg:flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-medium transition-all mr-0.5 ${
            pathname === "/consulta" || pathname === "/estado-servicio"
              ? "text-interactive-accent border-interactive-accent/30 bg-interactive-accent/10"
              : "text-text-secondary hover:text-text-primary hover:border-border-accent"
          }`}
            style={{ borderColor: pathname === "/consulta" || pathname === "/estado-servicio" ? undefined : "var(--border-subtle)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            Consultar estado
          </Link>

          {/* Agendar servicio */}
          <Link to="/agendar-cita" className="hidden md:flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-interactive-accent text-xs font-semibold text-white hover:bg-interactive-accent-hover transition-all mr-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            Agendar servicio
          </Link>

          {/* Cart */}
          <div ref={cartRef} className="relative">
            <button onClick={() => setCartOpen(!cartOpen)} className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
              pathname === "/cart"
                ? "text-interactive-accent bg-interactive-accent/10"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-tertiary/50"
            }`} aria-label="Carrito">
              <ShoppingCart size={18} />
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-interactive-accent px-1 text-[9px] font-bold text-white"
                >
                  {count > 99 ? "99+" : count}
                </motion.span>
              )}
            </button>
            <AnimatePresence>
              {cartOpen && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-surface-secondary shadow-elevation-3 overflow-hidden"
                  style={{ borderColor: "var(--border)" }}>
                  <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}><p className="text-sm font-semibold text-text-primary">Mi carrito ({count})</p></div>
                  {items.length === 0 ? (
                    <div className="p-6 text-center">
                      <svg className="w-10 h-10 mx-auto text-text-tertiary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" /></svg>
                      <p className="text-sm text-text-tertiary mb-3">Tu carrito esta vacio</p>
                      <Link to="/tienda" onClick={() => setCartOpen(false)} className="inline-flex items-center gap-2 rounded-lg bg-interactive-accent px-5 py-2.5 text-sm font-semibold text-black hover:bg-interactive-accent-hover transition-all">
                        Ver tienda
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-64 overflow-y-auto">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                            {item.image && <img src={item.image} alt="" className="h-12 w-12 rounded object-cover shrink-0" />}
                            <div className="flex-1 min-w-0"><p className="text-sm text-text-primary truncate">{item.name}</p><p className="text-xs text-text-tertiary">x{item.quantity} · ${Number(item.price).toLocaleString()}</p></div>
                            <button onClick={() => removeItem(item.id)} aria-label="Eliminar producto" className="text-text-tertiary hover:text-status-error transition-colors shrink-0"><X size={14} /></button>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
                        <div className="flex justify-between text-sm mb-3"><span className="text-text-secondary">Total</span><span className="text-text-primary font-bold">${total.toLocaleString()}</span></div>
                        <Link to="/cart" onClick={() => setCartOpen(false)} className="block w-full rounded-lg bg-interactive-accent py-2.5 text-center text-sm font-semibold text-white hover:bg-interactive-accent-hover transition-all">Ir al carrito</Link>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mi Moto */}
          {user && activeVehicle && (
            <Link to="/mi-moto"
              className="hidden lg:flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-medium transition-all mr-0.5 text-interactive-accent border-interactive-accent/30 bg-interactive-accent/10 hover:bg-interactive-accent/20"
            >
              <Bike size={14} />
              Mi Moto
            </Link>
          )}

          {/* User */}
          <div ref={userRef} className="relative hidden md:block">
            {user ? (
              <>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} aria-label="Menú de usuario" className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white transition-all ${
                  pathname.startsWith("/mi-cuenta") || pathname.startsWith("/perfil")
                    ? "ring-2 ring-interactive-accent ring-offset-2 ring-offset-surface-primary"
                    : "bg-interactive-accent hover:opacity-90"
                }`}>
                  {user.name?.charAt(0).toUpperCase()}
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-full mt-2 w-56 rounded-lg border bg-surface-secondary shadow-elevation-3 overflow-hidden"
                      style={{ borderColor: "var(--border)" }}>
                      <div className="p-3 border-b" style={{ borderColor: "var(--border)" }}><p className="text-sm font-semibold text-text-primary">{user.name}</p><p className="text-xs text-text-tertiary truncate">{user.email}</p></div>
                      <div className="p-1.5">
                        {userMenuItems.map((item) => (
                          <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-surface-tertiary/50 transition-all">
                            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
                            {item.label}
                          </Link>
                        ))}
                      </div>
                      <div className="p-1.5 border-t" style={{ borderColor: "var(--border)" }}>
                        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm text-status-error hover:bg-status-error-bg transition-all">
                          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                          Cerrar sesion
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Link to="/login" aria-label="Iniciar sesion" className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
                pathname === "/login"
                  ? "text-interactive-accent bg-interactive-accent/10"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-tertiary/50"
              }`}>
                <User size={18} />
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-text-primary hover:bg-surface-tertiary/50 transition-colors" aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t bg-surface-secondary lg:hidden max-h-[80vh] overflow-y-auto"
            style={{ borderColor: "var(--border)" }}>
            <div className="px-4 py-4 space-y-1">
              {/* Regular nav links */}
              {navLinks.filter(l => !MEGA_MENU_DATA.find(m => m.label === l.label)).map(link => (
                <Link key={link.href} to={link.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-interactive-accent/10 text-interactive-accent"
                      : "text-text-secondary hover:bg-surface-tertiary/50 hover:text-text-primary"
                  }`}>
                  {link.label}
                  {isActive(link.href) && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-interactive-accent" />}
                </Link>
              ))}

              {/* Mega menu accordion items */}
              {MEGA_MENU_DATA.map((mega) => (
                <div key={mega.label}>
                  <button
                    onClick={() => setMobileAccordion(mobileAccordion === mega.label ? null : mega.label)}
                    className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-text-secondary hover:bg-surface-tertiary/50 hover:text-text-primary transition-colors"
                  >
                    {mega.icon}
                    {mega.label}
                    <ChevronRight size={14} className={`ml-auto transition-transform ${mobileAccordion === mega.label ? "rotate-90" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {mobileAccordion === mega.label && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-8 pb-2 space-y-0.5">
                          <Link to={`/tienda?${mega.label === "Por Motos" ? "moto_brand=" : "categoria="}`}
                            onClick={() => setMobileOpen(false)}
                            className="block px-3 py-2 rounded-lg text-xs font-semibold text-interactive-accent hover:bg-surface-tertiary/50 transition-colors">
                            Ver todos
                          </Link>
                          {mega.children?.map((child) => (
                            <Link
                              key={child.href}
                              to={child.href}
                              onClick={() => setMobileOpen(false)}
                              className="block px-3 py-2 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-surface-tertiary/50 transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Action buttons */}
              <div className="flex gap-2 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                <Link to={user ? "/mi-cuenta" : "/login"} className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  pathname === "/login"
                    ? "bg-interactive-accent/10 text-interactive-accent"
                    : "bg-surface-tertiary/50 text-text-secondary hover:text-text-primary"
                }`}>
                  <User size={16} />
                  {user ? "Mi cuenta" : "Iniciar sesion"}
                </Link>
              </div>
              <Link to="/agendar-cita" className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-interactive-accent px-5 py-3 text-sm font-semibold text-white hover:bg-interactive-accent-hover transition-all">Agendar servicio</Link>
              <Link to="/estado-servicio" className={`mt-2 flex items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-medium transition-colors ${
                pathname === "/consulta" || pathname === "/estado-servicio"
                  ? "border-interactive-accent/30 bg-interactive-accent/10 text-interactive-accent"
                  : "text-text-secondary hover:text-text-primary"
              }`}
                style={{ borderColor: pathname === "/consulta" || pathname === "/estado-servicio" ? undefined : "var(--border)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                Consultar estado
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
