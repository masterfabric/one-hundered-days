"use client";

import { createContext, useState, useEffect, useContext } from "react";
import type { ThemeType, ThemeColors } from "@/config/site";
import { siteConfig } from "@/config/site";

interface ThemeContextProps {
  theme: ThemeType;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("app-theme") as ThemeType;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("app-theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Config dosyasından aktif temanın renklerini çekiyoruz
  const colors = siteConfig.themes[theme];

  const cssVariables = `
    :root {
    --background: ${siteConfig.themes.light.background};
        --foreground: ${siteConfig.themes.light.foreground};
        --primary: ${siteConfig.themes.light.primary};
        --primary-foreground: ${siteConfig.themes.light.primaryForeground};
        --card: ${siteConfig.themes.light.card};
        --card-foreground: ${siteConfig.themes.light.cardForeground};
        --border: ${siteConfig.themes.light.border};
        --muted: ${siteConfig.themes.light.muted};
        --muted-foreground: ${siteConfig.themes.light.mutedForeground};
        --radius: ${siteConfig.radius};
    }
        .dark {
        --background: ${siteConfig.themes.dark.background};
        --foreground: ${siteConfig.themes.dark.foreground};
        --primary: ${siteConfig.themes.dark.primary};
        --primary-foreground: ${siteConfig.themes.dark.primaryForeground};
        --card: ${siteConfig.themes.dark.card};
        --card-foreground: ${siteConfig.themes.dark.cardForeground};
        --border: ${siteConfig.themes.dark.border};
        --muted: ${siteConfig.themes.dark.muted};
        --muted-foreground: ${siteConfig.themes.dark.mutedForeground};
        }
        `;
  
  const content = !mounted ? (
    <div style={{ visibility: "hidden" }}>{children}</div>
  ) : (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVariables }}></style>
      {children}
    </>
  );

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {content}
    </ThemeContext.Provider>
  );
}
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
