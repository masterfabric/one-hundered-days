'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SplashScreen } from '@/app/splash';
import { loadHomeData } from '@/utils/content-loader';
import type { HomeData } from '@/utils/types';

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false);
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Check if splash has already been shown in this session
    const splashShown = sessionStorage.getItem('splashShown') === 'true';
    
    // Only show splash on initial load if not already shown and enabled in config
    if (!splashShown) {
      try {
        const data = loadHomeData();
        setHomeData(data);
        
        if (data.splash.showOnLoad) {
          setShowSplash(true);
          // Mark splash as shown in session storage
          sessionStorage.setItem('splashShown', 'true');
        }
      } catch (error) {
        console.error('Failed to load home data:', error);
        setShowSplash(false);
      }
    } else {
      // If splash already shown, don't show it again
      setShowSplash(false);
    }
  }, []);

  // Ensure splash doesn't show on route changes
  useEffect(() => {
    // When pathname changes, ensure splash is hidden
    if (showSplash && pathname) {
      setShowSplash(false);
    }
  }, [pathname, showSplash]);

  return (
    <>
      {showSplash && homeData && (
        <SplashScreen 
          onComplete={() => {
            setShowSplash(false);
            sessionStorage.setItem('splashShown', 'true');
          }} 
          minDisplayTime={homeData.splash.minDisplayTime}
        />
      )}
      {children}
    </>
  );
}
