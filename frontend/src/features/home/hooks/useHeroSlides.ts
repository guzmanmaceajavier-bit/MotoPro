import { useState, useEffect, useCallback } from "react";
import { api } from "@/api/client";
import { FALLBACK_SLIDES } from "../constants";
import type { HeroSlide } from "../types";

export function useHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>(FALLBACK_SLIDES);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    api.get("/hero")
      .then((data) => {
        const items = Array.isArray(data) ? data : data?.data || [];
        if (items.length > 0) {
          const mapped = items.map((s: any) => ({
            image: s.image || "",
            title: s.title || "",
            subtitle: s.subtitle || "",
            description: s.description || "",
            cta_text: s.cta_text || "Ver Servicios",
            cta_link: s.cta_link || "/servicios",
          }));
          setSlides(mapped);
        }
      })
      .catch((err) => console.warn("[fetch]", err));
  }, []);

  useEffect(() => {
    const id = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  const goTo = useCallback((i: number) => setCurrent(i), []);

  return { slides, current, goTo, setCurrent };
}
