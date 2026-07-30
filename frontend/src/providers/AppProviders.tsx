import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { CMSProvider } from "@/providers/CMSProvider";
import { CartProvider } from "@/providers/CartProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { MotoProvider } from "@/providers/MotoProvider";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <HelmetProvider>
        <ThemeProvider>
          <AuthProvider>
            <CMSProvider>
              <CartProvider>
                <MotoProvider>
                  <ToastProvider>
                    {children}
                  </ToastProvider>
                </MotoProvider>
              </CartProvider>
            </CMSProvider>
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </BrowserRouter>
  );
}
