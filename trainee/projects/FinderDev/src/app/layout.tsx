import type { Metadata } from "next";
import "./globals.css";
import { SplashScreenProvider } from "@/components/layout/SplashScreenProvider";

export const metadata: Metadata = {
  title: "FinderDev",
  description: "Find developers, discover projects, and build amazing things together",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SplashScreenProvider>{children}</SplashScreenProvider>
      </body>
    </html>
  );
}

