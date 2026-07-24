import { Routes, Route } from "react-router-dom";
import { useEffect, useRef, Suspense, lazy } from "react";
import Lenis from "lenis";
import { ScrollToTop } from "@/components/ScrollToTop";
import { FloatingThemeToggle } from "@/components/layout/FloatingThemeToggle";

const Home = lazy(() => import("@/pages/Home"));
const Servicios = lazy(() => import("@/pages/Servicios"));
const ServicioDetail = lazy(() => import("@/pages/ServicioDetail"));
const Tienda = lazy(() => import("@/pages/Tienda"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const Contacto = lazy(() => import("@/pages/Contacto"));
const Nosotros = lazy(() => import("@/pages/Nosotros"));
const Galeria = lazy(() => import("@/pages/Galeria"));
const EstadoServicio = lazy(() => import("@/pages/EstadoServicio"));
const SolicitarServicio = lazy(() => import("@/pages/SolicitarServicio"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Perfil = lazy(() => import("@/pages/Perfil"));
const Consulta = lazy(() => import("@/pages/Consulta"));
const VerificarEmail = lazy(() => import("@/pages/VerificarEmail"));
const LegalPage = lazy(() => import("@/pages/LegalPage"));
const Promociones = lazy(() => import("@/pages/Promociones"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const Comparar = lazy(() => import("@/pages/Comparar"));
const WishlistPage = lazy(() => import("@/pages/WishlistPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const MiCuenta = lazy(() => import("@/pages/MiCuenta"));
const AgendarCita = lazy(() => import("@/pages/AgendarCita"));

export default function App() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenisRef.current = lenis;
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => { lenis.destroy(); };
  }, []);

  useEffect(() => {
    const handleAnchor = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor && anchor.hash && anchor.hash.startsWith("#")) {
        e.preventDefault();
        const el = document.querySelector(anchor.hash);
        if (el && lenisRef.current) lenisRef.current.scrollTo(el as HTMLElement);
      }
    };
    document.addEventListener("click", handleAnchor);
    return () => document.removeEventListener("click", handleAnchor);
  }, []);

  return (
    <>
      <ScrollToTop />
      <FloatingThemeToggle />
      <Suspense fallback={<LoadingFallback />}>
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/servicios" element={<Servicios />} />
      <Route path="/servicios/:id" element={<ServicioDetail />} />
      <Route path="/tienda" element={<Tienda />} />
      <Route path="/tienda/:slug" element={<ProductDetail />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:id" element={<BlogPost />} />
       <Route path="/contacto" element={<Contacto />} />
       <Route path="/perfil" element={<Perfil />} />
       <Route path="/favoritos" element={<WishlistPage />} />
      <Route path="/nosotros" element={<Nosotros />} />
      <Route path="/galeria" element={<Galeria />} />
       <Route path="/estado-servicio" element={<EstadoServicio />} />
       <Route path="/estado" element={<EstadoServicio />} />
       <Route path="/solicitar-servicio" element={<SolicitarServicio />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/consulta" element={<Consulta />} />
        <Route path="/verificar-email" element={<VerificarEmail />} />
        <Route path="/privacidad" element={<LegalPage />} />
        <Route path="/terminos" element={<LegalPage />} />
        <Route path="/legal/:slug" element={<LegalPage />} />
        <Route path="/producto/:slug" element={<ProductDetail />} />
        <Route path="/promociones" element={<Promociones />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/comparar" element={<Comparar />} />
        <Route path="/comparar/:ids" element={<Comparar />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/agendar-cita" element={<AgendarCita />} />
        <Route path="/mi-cuenta" element={<MiCuenta />} />
        <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "var(--surface-primary)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-interactive-accent border-t-transparent" />
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>Cargando...</p>
      </div>
    </div>
  );
}
