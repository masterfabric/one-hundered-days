"use client";

import { useTheme } from "@/context/ThemeContext";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Hydration uyumsuzluğunu önlemek için
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Yüklenene kadar aynı boyutlarda yer tutucu
    return <div className="w-[104px] h-10 bg-zinc-900 rounded-sm opacity-50" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label="Sistem Temasını Değiştir"
      // Dış Kasa: Sert mat siyah, içeri çökük gölge (inset shadow) ile fiziksel bir yuva hissi
      className="group relative flex items-center justify-between w-[104px] h-10 px-[6px] bg-zinc-950 border border-zinc-800 rounded-md shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all"
    >
      
      {/* Arka Plan Durum Metinleri & LED Işıklar (JetBrains Mono fontu devrede) */}
      <div className="flex w-full justify-between items-center z-10 font-mono text-[11px] font-bold tracking-widest uppercase pointer-events-none select-none px-1">
        {/* LIGHT MODE LED & TEXT */}
        <div className="flex flex-col items-center gap-[2px]">
          <span className={`h-1 w-4 rounded-full transition-all duration-500 ${!isDark ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-zinc-800 shadow-none'}`} />
          <span className={`transition-colors duration-300 ${!isDark ? 'text-cyan-400' : 'text-zinc-600'}`}>
            LGT
          </span>
        </div>

        {/* DARK MODE LED & TEXT */}
        <div className="flex flex-col items-center gap-[2px]">
          <span className={`h-1 w-4 rounded-full transition-all duration-500 ${isDark ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-zinc-800 shadow-none'}`} />
          <span className={`transition-colors duration-300 ${isDark ? 'text-amber-400' : 'text-zinc-600'}`}>
            DRK
          </span>
        </div>
      </div>

      {/* Fiziksel Kaydırma Düğmesi (The Switch) */}
      <div
        className={`
          absolute top-[4px] left-[4px] w-[44px] h-[32px] rounded-sm shadow-md 
          transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] 
          flex flex-col items-center justify-center gap-[3px] border-b-2
          ${isDark 
            ? 'translate-x-[52px] bg-zinc-800 border-zinc-900' 
            : 'translate-x-0 bg-zinc-200 border-zinc-400'
          }
        `}
      >
        {/* Düğme üzerindeki fiziksel tutuş (grip) çizgileri */}
        <div className={`w-4 h-[2px] rounded-full opacity-30 ${isDark ? 'bg-black' : 'bg-zinc-600'}`} />
        <div className={`w-4 h-[2px] rounded-full opacity-30 ${isDark ? 'bg-black' : 'bg-zinc-600'}`} />
        <div className={`w-4 h-[2px] rounded-full opacity-30 ${isDark ? 'bg-black' : 'bg-zinc-600'}`} />
      </div>
    </button>
  );
}