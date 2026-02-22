export const siteConfig = {
  name: "Finder Dev Project",
  radius: "0.5rem",
  themes: {
    light: {
      background: "0 0% 100%",        // Beyaz
      foreground: "222.2 84% 4.9%",   // Koyu gri yazı
      primary: "221.2 83.2% 53.3%",   // Mavi
      primaryForeground: "210 40% 98%",// Açık renk yazı
      card: "0 0% 100%",
      cardForeground: "222.2 84% 4.9%",
      border: "214.3 31.8% 91.4%",
      muted: "210 40% 96.1%",
      mutedForeground: "215.4 16.3% 46.9%"
    },
    dark: {
      background: "222.2 84% 4.9%",   // Koyu arka plan
      foreground: "210 40% 98%",      // Açık renk yazı
      primary: "217.2 91.2% 59.8%",   // Açık Mavi
      primaryForeground: "222.2 47.4% 11.2%",
      card: "222.2 84% 4.9%",
      cardForeground: "210 40% 98%",
      border: "217.2 32.6% 17.5%",
      muted: "217.2 32.6% 17.5%",
      mutedForeground: "215 20.2% 65.1%"
    },
  },
};

export type ThemeType=keyof typeof siteConfig.themes;
export type ThemeColors = typeof siteConfig.themes.light;
