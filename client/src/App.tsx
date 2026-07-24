import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ClientLayout from "./layouts/ClientLayout";
import AuthGuard from "./components/AuthGuard";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Vehicles = lazy(() => import("./pages/Vehicles"));
const VehiclesNew = lazy(() => import("./pages/VehiclesNew"));
const Services = lazy(() => import("./pages/Services"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const Quotes = lazy(() => import("./pages/Quotes"));
const Appointments = lazy(() => import("./pages/Appointments"));
const Purchases = lazy(() => import("./pages/Purchases"));
const Invoices = lazy(() => import("./pages/Invoices"));
const Warranties = lazy(() => import("./pages/Warranties"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Profile = lazy(() => import("./pages/Profile"));
const Security = lazy(() => import("./pages/Security"));
const Settings = lazy(() => import("./pages/Settings"));
const Notifications = lazy(() => import("./pages/Notifications"));

function SuspenseFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
        <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>Cargando...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Suspense fallback={<SuspenseFallback />}><Login /></Suspense>} />
      <Route path="/register" element={<Suspense fallback={<SuspenseFallback />}><Register /></Suspense>} />
      <Route
        path="/"
        element={
          <AuthGuard>
            <ClientLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Suspense fallback={<SuspenseFallback />}><Dashboard /></Suspense>} />
        <Route path="vehiculos" element={<Suspense fallback={<SuspenseFallback />}><Vehicles /></Suspense>} />
        <Route path="vehiculos/nuevo" element={<Suspense fallback={<SuspenseFallback />}><VehiclesNew /></Suspense>} />
        <Route path="servicios" element={<Suspense fallback={<SuspenseFallback />}><Services /></Suspense>} />
        <Route path="servicios/:id" element={<Suspense fallback={<SuspenseFallback />}><ServiceDetail /></Suspense>} />
        <Route path="cotizaciones" element={<Suspense fallback={<SuspenseFallback />}><Quotes /></Suspense>} />
        <Route path="citas" element={<Suspense fallback={<SuspenseFallback />}><Appointments /></Suspense>} />
        <Route path="compras" element={<Suspense fallback={<SuspenseFallback />}><Purchases /></Suspense>} />
        <Route path="facturas" element={<Suspense fallback={<SuspenseFallback />}><Invoices /></Suspense>} />
        <Route path="garantias" element={<Suspense fallback={<SuspenseFallback />}><Warranties /></Suspense>} />
        <Route path="favoritos" element={<Suspense fallback={<SuspenseFallback />}><Wishlist /></Suspense>} />
        <Route path="perfil" element={<Suspense fallback={<SuspenseFallback />}><Profile /></Suspense>} />
        <Route path="seguridad" element={<Suspense fallback={<SuspenseFallback />}><Security /></Suspense>} />
        <Route path="configuracion" element={<Suspense fallback={<SuspenseFallback />}><Settings /></Suspense>} />
        <Route path="notificaciones" element={<Suspense fallback={<SuspenseFallback />}><Notifications /></Suspense>} />
      </Route>
    </Routes>
  );
}
