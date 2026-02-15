"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SplashScreen } from "./SplashScreen";

// Context ile splash durumunu paylaş
const SplashContext = createContext({ splashComplete: false });

export function useSplashComplete() {
  return useContext(SplashContext);
}

export function SplashScreenProvider({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [splashComplete, setSplashComplete] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Splash ekranı 2.5 saniye gösterilsin
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    // Sayfa animasyonu için biraz daha bekle
    const completeTimer = setTimeout(() => {
      setSplashComplete(true);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, []);

  // Hydration hatası önlemek için
  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <SplashContext.Provider value={{ splashComplete }}>
      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>

      {/* Sayfa açılış animasyonu */}
      <AnimatePresence>
        {!showSplash && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
              staggerChildren: 0.1
            }}
            className="min-h-screen"
          >
            {/* Üstten gelen ışık efekti */}
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent z-40 pointer-events-none origin-top"
              style={{ opacity: 0.6 }}
            />

            {/* İçerik fade-in */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {children}
            </motion.div>

            {/* Köşelerden gelen glow efekti */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="fixed inset-0 pointer-events-none z-30"
              style={{
                background: "radial-gradient(circle at top left, rgba(59, 130, 246, 0.1) 0%, transparent 30%), radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.1) 0%, transparent 30%)"
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </SplashContext.Provider>
  );
}
