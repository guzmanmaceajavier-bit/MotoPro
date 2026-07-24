import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AdminLayout from "./layouts/AdminLayout";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProductList = lazy(() => import("./pages/products/ProductList"));
const ProductForm = lazy(() => import("./pages/products/ProductForm"));
const CategoryList = lazy(() => import("./pages/categories/CategoryList"));
const CategoryForm = lazy(() => import("./pages/categories/CategoryForm"));
const BrandList = lazy(() => import("./pages/brands/BrandList"));
const BrandForm = lazy(() => import("./pages/brands/BrandForm"));
const SuppliersPage = lazy(() => import("./pages/suppliers/SuppliersPage"));
const PurchasesPage = lazy(() => import("./pages/purchases/PurchasesPage"));
const ServiceList = lazy(() => import("./pages/services/ServiceList"));
const ServiceForm = lazy(() => import("./pages/services/ServiceForm"));
const BlogList = lazy(() => import("./pages/blog/BlogList"));
const BlogForm = lazy(() => import("./pages/blog/BlogForm"));
const WorkshopOrders = lazy(() => import("./pages/orders/WorkshopOrders"));
const OrderForm = lazy(() => import("./pages/orders/OrderForm"));
const WorkOrderDetailPage = lazy(() => import("./pages/orders/WorkOrderDetailPage"));
const ReceptionPage = lazy(() => import("./pages/reception/ReceptionPage"));
const ContactList = lazy(() => import("./pages/contacts/ContactList"));
const GalleryPage = lazy(() => import("./pages/gallery/GalleryPage"));
const SlidersPage = lazy(() => import("./pages/sliders/SlidersPage"));
const SettingsPage = lazy(() => import("./pages/settings/SettingsPage"));
const CalendarPage = lazy(() => import("@/pages/calendar/AgendaPage"));
const MechanicsPage = lazy(() => import("@/pages/mechanics/MechanicsPage"));
const OrderTimelinePage = lazy(() => import("@/pages/timeline/OrderTimelinePage"));
const InvoicesPage = lazy(() => import("@/pages/invoices/InvoicesPage"));
const WarrantiesPage = lazy(() => import("@/pages/warranties/WarrantiesPage"));
const CajaPage = lazy(() => import("@/pages/caja/CajaPage"));
const POSPage = lazy(() => import("@/pages/pos/POSPage"));
const CustomersPage = lazy(() => import("./pages/customers/CustomersPage"));
const VehiclesPage = lazy(() => import("./pages/vehicles/VehiclesPage"));
const InventoryPage = lazy(() => import("./pages/inventory/InventoryPage"));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));
const StoreOrdersPage = lazy(() => import("./pages/store-orders/StoreOrdersPage"));
const MediaLibrary = lazy(() => import("./pages/media/MediaLibrary"));
const HomepageCMS = lazy(() => import("./pages/homepage/HomepageCMS"));
const NavbarCMS = lazy(() => import("./pages/navbar/NavbarCMS"));
const NavbarItemForm = lazy(() => import("./pages/navbar/NavbarItemForm"));
const FooterCMS = lazy(() => import("./pages/footer/FooterCMS"));
const FaqList = lazy(() => import("./pages/faqs/FaqList"));
const HomepageNewSection = lazy(() => import("./pages/homepage/HomepageNewSection"));
const WhatsAppConfigPage = lazy(() => import("./pages/whatsapp/WhatsAppConfigPage"));
const ReportsPage = lazy(() => import("./pages/reports/ReportsPage"));
const LoyaltyPage = lazy(() => import("./pages/loyalty/LoyaltyPage"));
const BranchesPage = lazy(() => import("./pages/branches/BranchesPage"));
const LogsPage = lazy(() => import("./pages/logs/LogsPage"));

const pageMeta: Record<string, { title: string; description?: string }> = {
  "/login": { title: "Iniciar Sesión" },
  "/": { title: "Dashboard", description: "Panel de control del taller MotoPro" },
  "/products": { title: "Productos", description: "Gestión de productos del catálogo" },
  "/products/new": { title: "Nuevo Producto" },
  "/categories": { title: "Categorías" },
  "/brands": { title: "Marcas" },
  "/proveedores": { title: "Proveedores", description: "Gestión de proveedores" },
  "/compras": { title: "Compras", description: "Gestión de compras y compras" },
  "/services": { title: "Servicios" },
  "/orders": { title: "Órdenes Taller", description: "Órdenes de servicio del taller" },
  "/recepcion": { title: "Recepción", description: "Recepción de vehículo al taller" },
  "/pedidos-tienda": { title: "Pedidos Tienda" },
  "/contacts": { title: "Contactos" },
  "/gallery": { title: "Galería" },
  "/sliders": { title: "Sliders" },
  "/settings": { title: "Configuración" },
  "/calendar": { title: "Calendario", description: "Gestión de citas del taller" },
  "/mechanics": { title: "Mecánicos", description: "Gestión del equipo de trabajo" },
  "/timeline": { title: "Timeline", description: "Historial de estados de órdenes" },
  "/invoices": { title: "Facturas", description: "Gestión de facturación" },
  "/warranties": { title: "Garantías", description: "Gestión de garantías" },
  "/caja": { title: "Caja", description: "Gestión de apertura, cierre y movimientos" },
  "/pos": { title: "Punto de Venta", description: "Venta rápida con carrito" },
  "/clientes": { title: "Clientes" },
  "/vehiculos": { title: "Vehiculos", description: "Gestion de motocicletas" },
  "/inventario": { title: "Inventario" },
  "/profile": { title: "Perfil" },
  "/multimedia": { title: "Multimedia" },
  "/homepage": { title: "Homepage CMS" },
  "/navbar": { title: "Navbar CMS" },
  "/navbar/new": { title: "Nuevo item de menu" },
  "/footer": { title: "Footer CMS" },
  "/faq": { title: "FAQ" },
  "/blog": { title: "Blog" },
  "/whatsapp": { title: "WhatsApp", description: "Configuracion de mensajeria WhatsApp" },
  "/reportes": { title: "Reportes", description: "Reportes y analitica del negocio" },
  "/fidelidad": { title: "Fidelidad", description: "Programa de puntos y recompensas" },
  "/sucursales": { title: "Sucursales", description: "Gestion de sedes" },
  "/logs": { title: "Logs", description: "Monitoreo y auditoria del sistema" },
};

function RouteMeta() {
  const { pathname } = useLocation();
  useEffect(() => {
    const meta = pageMeta[pathname] || pageMeta[pathname.replace(/\/\d+\/edit$/, "")];
    if (meta) document.title = `${meta.title} | MotoPro Admin`;
    else document.title = "MotoPro Admin";
  }, [pathname]);
  return null;
}

function SuspenseFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-surface-primary">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-interactive-accent" />
        <span className="text-caption text-text-tertiary">Cargando...</span>
      </div>
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-surface-primary">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-interactive-accent" />
    </div>
  );
  return user ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <>
      <RouteMeta />
      <Routes>
        <Route path="/login" element={<Suspense fallback={<SuspenseFallback />}><Login /></Suspense>} />
        <Route path="/" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
          <Route index element={<Suspense fallback={<SuspenseFallback />}><Dashboard /></Suspense>} />
          <Route path="products" element={<Suspense fallback={<SuspenseFallback />}><ProductList /></Suspense>} />
          <Route path="products/new" element={<Suspense fallback={<SuspenseFallback />}><ProductForm /></Suspense>} />
          <Route path="products/:id/edit" element={<Suspense fallback={<SuspenseFallback />}><ProductForm /></Suspense>} />
          <Route path="categories" element={<Suspense fallback={<SuspenseFallback />}><CategoryList /></Suspense>} />
          <Route path="categories/new" element={<Suspense fallback={<SuspenseFallback />}><CategoryForm /></Suspense>} />
          <Route path="categories/:id/edit" element={<Suspense fallback={<SuspenseFallback />}><CategoryForm /></Suspense>} />
          <Route path="brands" element={<Suspense fallback={<SuspenseFallback />}><BrandList /></Suspense>} />
          <Route path="brands/new" element={<Suspense fallback={<SuspenseFallback />}><BrandForm /></Suspense>} />
          <Route path="brands/:id/edit" element={<Suspense fallback={<SuspenseFallback />}><BrandForm /></Suspense>} />
          <Route path="proveedores" element={<Suspense fallback={<SuspenseFallback />}><SuppliersPage /></Suspense>} />
          <Route path="compras" element={<Suspense fallback={<SuspenseFallback />}><PurchasesPage /></Suspense>} />
          <Route path="services" element={<Suspense fallback={<SuspenseFallback />}><ServiceList /></Suspense>} />
          <Route path="services/new" element={<Suspense fallback={<SuspenseFallback />}><ServiceForm /></Suspense>} />
          <Route path="services/:id/edit" element={<Suspense fallback={<SuspenseFallback />}><ServiceForm /></Suspense>} />
          <Route path="blog" element={<Suspense fallback={<SuspenseFallback />}><BlogList /></Suspense>} />
          <Route path="blog/new" element={<Suspense fallback={<SuspenseFallback />}><BlogForm /></Suspense>} />
          <Route path="blog/:id/edit" element={<Suspense fallback={<SuspenseFallback />}><BlogForm /></Suspense>} />
          <Route path="orders" element={<Suspense fallback={<SuspenseFallback />}><WorkshopOrders /></Suspense>} />
          <Route path="orders/new" element={<Suspense fallback={<SuspenseFallback />}><OrderForm /></Suspense>} />
          <Route path="orders/:id" element={<Suspense fallback={<SuspenseFallback />}><WorkOrderDetailPage /></Suspense>} />
          <Route path="orders/:id/edit" element={<Suspense fallback={<SuspenseFallback />}><OrderForm /></Suspense>} />
          <Route path="recepcion" element={<Suspense fallback={<SuspenseFallback />}><ReceptionPage /></Suspense>} />
          <Route path="contacts" element={<Suspense fallback={<SuspenseFallback />}><ContactList /></Suspense>} />
          <Route path="gallery" element={<Suspense fallback={<SuspenseFallback />}><GalleryPage /></Suspense>} />
          <Route path="calendar" element={<Suspense fallback={<SuspenseFallback />}><CalendarPage /></Suspense>} />
          <Route path="mechanics" element={<Suspense fallback={<SuspenseFallback />}><MechanicsPage /></Suspense>} />
          <Route path="timeline" element={<Suspense fallback={<SuspenseFallback />}><OrderTimelinePage /></Suspense>} />
          <Route path="invoices" element={<Suspense fallback={<SuspenseFallback />}><InvoicesPage /></Suspense>} />
          <Route path="warranties" element={<Suspense fallback={<SuspenseFallback />}><WarrantiesPage /></Suspense>} />
          <Route path="caja" element={<Suspense fallback={<SuspenseFallback />}><CajaPage /></Suspense>} />
          <Route path="pos" element={<Suspense fallback={<SuspenseFallback />}><POSPage /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<SuspenseFallback />}><SettingsPage /></Suspense>} />
          <Route path="clientes" element={<Suspense fallback={<SuspenseFallback />}><CustomersPage /></Suspense>} />
          <Route path="vehiculos" element={<Suspense fallback={<SuspenseFallback />}><VehiclesPage /></Suspense>} />
          <Route path="inventario" element={<Suspense fallback={<SuspenseFallback />}><InventoryPage /></Suspense>} />
          <Route path="profile" element={<Suspense fallback={<SuspenseFallback />}><ProfilePage /></Suspense>} />
          <Route path="pedidos-tienda" element={<Suspense fallback={<SuspenseFallback />}><StoreOrdersPage /></Suspense>} />
          <Route path="sliders" element={<Suspense fallback={<SuspenseFallback />}><SlidersPage /></Suspense>} />
          <Route path="multimedia" element={<Suspense fallback={<SuspenseFallback />}><MediaLibrary /></Suspense>} />
          <Route path="homepage" element={<Suspense fallback={<SuspenseFallback />}><HomepageCMS /></Suspense>} />
          <Route path="homepage/new" element={<Suspense fallback={<SuspenseFallback />}><HomepageNewSection /></Suspense>} />
          <Route path="navbar" element={<Suspense fallback={<SuspenseFallback />}><NavbarCMS /></Suspense>} />
          <Route path="navbar/new" element={<Suspense fallback={<SuspenseFallback />}><NavbarItemForm /></Suspense>} />
          <Route path="navbar/:id/edit" element={<Suspense fallback={<SuspenseFallback />}><NavbarItemForm /></Suspense>} />
          <Route path="footer" element={<Suspense fallback={<SuspenseFallback />}><FooterCMS /></Suspense>} />
          <Route path="faq" element={<Suspense fallback={<SuspenseFallback />}><FaqList /></Suspense>} />
          <Route path="whatsapp" element={<Suspense fallback={<SuspenseFallback />}><WhatsAppConfigPage /></Suspense>} />
          <Route path="reportes" element={<Suspense fallback={<SuspenseFallback />}><ReportsPage /></Suspense>} />
          <Route path="fidelidad" element={<Suspense fallback={<SuspenseFallback />}><LoyaltyPage /></Suspense>} />
          <Route path="sucursales" element={<Suspense fallback={<SuspenseFallback />}><BranchesPage /></Suspense>} />
          <Route path="logs" element={<Suspense fallback={<SuspenseFallback />}><LogsPage /></Suspense>} />
        </Route>
      </Routes>
    </>
  );
}
