import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  accent: string;
  setAccent: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("client-theme");
    if (saved === "light" || saved === "dark") return saved;
    return "dark";
  });

  const [accent, setAccentState] = useState<string>(() => {
    return localStorage.getItem("client-accent") || "#0D9488";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("client-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
    document.documentElement.style.setProperty("--accent-light", accent === "#0D9488" ? "#14B8A6" : accent);
    document.documentElement.style.setProperty("--accent-glow", accent + "15");
    document.documentElement.style.setProperty("--accent-subtle", accent + "08");
    localStorage.setItem("client-accent", accent);
  }, [accent]);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        const config = data.data ?? data;
        if (config?.site_accent) {
          setAccentState(config.site_accent);
        }
      })
      .catch(() => {});
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const setAccent = (color: string) => setAccentState(color);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
