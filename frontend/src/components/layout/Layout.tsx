import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { BackToTop } from "./BackToTop";
import { WhatsAppFloat } from "./WhatsAppFloat";

export function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <BackToTop />
      <WhatsAppFloat />
    </>
  );
}
