"use client";

import React from 'react'
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const notFoundPage = () => {
    const pathname = usePathname();

    useEffect(() => {
      Sentry.captureException(new Error(`Page not found: ${pathname}`));
    }, [pathname]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-4xl font-bold mb-4">404 - Sayfa Bulunamadı</h2>
      <p className="text-gray-500 mb-6">Aradığınız sayfaya ulaşılamadı.</p>
      <Link href="/profile" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Profilime Dön
      </Link>
    </div>
  )
}

export default notFoundPage