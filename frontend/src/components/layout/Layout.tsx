import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { BackToTop } from "./BackToTop";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { HelpFloat } from "./HelpFloat";

export function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <BackToTop />
      <WhatsAppFloat />
      <HelpFloat />
    </>
  );
}
