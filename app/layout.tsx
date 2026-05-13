import type { Metadata } from "next";
import { Inter, Tenor_Sans } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/query-provider";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const tenorSans = Tenor_Sans({
  weight: "400",
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yash Organics | Premium Herbal & Organic Products",
  description: "Experience the purity of nature with our handcrafted herbal oils, skincare, and premium nutrition.",
};

import AuthProvider from "@/components/providers/auth-provider";
import { CartSync } from "@/components/shared/cart-sync";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.variable} ${tenorSans.variable} min-h-full font-sans`}>
        <AuthProvider>
          <QueryProvider>
            <TooltipProvider>
              <CartSync />
              {children}
              <SonnerToaster position="top-center" richColors />
            </TooltipProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
