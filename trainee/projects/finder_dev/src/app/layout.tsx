import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { loadSiteData } from '@/utils/content-loader';
import { SplashProvider } from '@/components/layout/SplashProvider';
import { Toaster } from 'sonner';

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export function generateMetadata(): Metadata {
  const siteData = loadSiteData();
  
  return {
    title: siteData.siteName,
    description: siteData.siteDescription,
    openGraph: {
      title: siteData.meta.ogTitle,
      description: siteData.meta.ogDescription,
      type: 'website',
    },
    twitter: {
      card: siteData.meta.twitterCard as 'summary' | 'summary_large_image',
      title: siteData.meta.ogTitle,
      description: siteData.meta.ogDescription,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={jetbrainsMono.variable}>
        <SplashProvider>
          {children}
        </SplashProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
