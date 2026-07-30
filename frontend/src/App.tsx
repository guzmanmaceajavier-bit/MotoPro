import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { ScrollToTop } from "@/components/ScrollToTop";
import { FloatingThemeToggle } from "@/components/layout/FloatingThemeToggle";
import { AppRoutes } from "@/router/AppRoutes";
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
      <AppRoutes />
    </>
  );
}
