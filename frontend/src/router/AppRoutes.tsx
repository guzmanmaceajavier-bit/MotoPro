import { Routes, Route } from "react-router-dom";
import { Suspense, lazy, ComponentType, LazyExoticComponent } from "react";
import { PageLoader } from "@/components/ui/PageLoader";
import { PrivateRoute } from "./PrivateRoute";
import { Layout } from "@/components/layout/Layout";

function lazyLoad(factory: () => Promise<{ default: ComponentType<unknown> }>): LazyExoticComponent<ComponentType<unknown>> {
  return lazy(factory);
}

// Home
const Home = lazyLoad(() => import("@/pages/Home"));
const NotFound = lazyLoad(() => import("@/pages/NotFound"));

// Shop
const Tienda = lazyLoad(() => import("@/features/shop").then(m => ({ default: m.Tienda })));
const ProductDetail = lazyLoad(() => import("@/features/shop").then(m => ({ default: m.ProductDetail })));
const Cart = lazyLoad(() => import("@/features/shop").then(m => ({ default: m.Cart })));
const Checkout = lazyLoad(() => import("@/features/shop").then(m => ({ default: m.Checkout })));
const Comparar = lazyLoad(() => import("@/features/shop").then(m => ({ default: m.Comparar })));
const WishlistPage = lazyLoad(() => import("@/features/shop").then(m => ({ default: m.WishlistPage })));
const Promociones = lazyLoad(() => import("@/features/shop").then(m => ({ default: m.Promociones })));

// Services
const Servicios = lazyLoad(() => import("@/features/services").then(m => ({ default: m.Servicios })));
const ServicioDetail = lazyLoad(() => import("@/features/services").then(m => ({ default: m.ServicioDetail })));
const AgendarCita = lazyLoad(() => import("@/features/services").then(m => ({ default: m.AgendarCita })));
const SolicitarServicio = lazyLoad(() => import("@/features/services").then(m => ({ default: m.SolicitarServicio })));
const EstadoServicio = lazyLoad(() => import("@/features/services").then(m => ({ default: m.EstadoServicio })));

// Blog
const Blog = lazyLoad(() => import("@/features/blog").then(m => ({ default: m.Blog })));
const BlogPost = lazyLoad(() => import("@/features/blog").then(m => ({ default: m.BlogPost })));

// Auth
const LoginPage = lazyLoad(() => import("@/features/auth").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazyLoad(() => import("@/features/auth").then(m => ({ default: m.RegisterPage })));
const VerificarEmail = lazyLoad(() => import("@/features/auth").then(m => ({ default: m.VerificarEmail })));

// Account
const MiCuenta = lazyLoad(() => import("@/features/account").then(m => ({ default: m.MiCuenta })));
const Perfil = lazyLoad(() => import("@/features/account").then(m => ({ default: m.Perfil })));
const MiMoto = lazyLoad(() => import("@/features/account/pages/MiMoto"));

// Content
const Nosotros = lazyLoad(() => import("@/features/content").then(m => ({ default: m.Nosotros })));
const FAQ = lazyLoad(() => import("@/features/content").then(m => ({ default: m.FAQ })));
const Galeria = lazyLoad(() => import("@/features/content").then(m => ({ default: m.Galeria })));
const LegalPage = lazyLoad(() => import("@/features/content").then(m => ({ default: m.LegalPage })));
const Contacto = lazyLoad(() => import("@/features/content").then(m => ({ default: m.Contacto })));
const Consulta = lazyLoad(() => import("@/features/content").then(m => ({ default: m.Consulta })));
const Ayuda = lazyLoad(() => import("@/features/content").then(m => ({ default: m.Ayuda })));

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Services */}
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/servicios/:id" element={<ServicioDetail />} />
        <Route path="/agendar-cita" element={<AgendarCita />} />
        <Route path="/solicitar-servicio" element={<SolicitarServicio />} />
        <Route path="/estado-servicio" element={<EstadoServicio />} />
        <Route path="/estado" element={<EstadoServicio />} />

        {/* Shop */}
        <Route path="/tienda" element={<Tienda />} />
        <Route path="/tienda/:slug" element={<ProductDetail />} />
        <Route path="/producto/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/comparar" element={<Comparar />} />
        <Route path="/comparar/:ids" element={<Comparar />} />
        <Route path="/wishlist" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
        <Route path="/favoritos" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
        <Route path="/promociones" element={<Promociones />} />

        {/* Blog */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/verificar-email" element={<VerificarEmail />} />

        {/* Account */}
        <Route path="/mi-cuenta" element={<PrivateRoute><MiCuenta /></PrivateRoute>} />
        <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
        <Route path="/mi-moto" element={<PrivateRoute><MiMoto /></PrivateRoute>} />

        {/* Content */}
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/galeria" element={<Galeria />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/consulta" element={<Consulta />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/ayuda" element={<Ayuda />} />
        <Route path="/privacidad" element={<LegalPage />} />
        <Route path="/terminos" element={<LegalPage />} />
        <Route path="/legal/:slug" element={<LegalPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
