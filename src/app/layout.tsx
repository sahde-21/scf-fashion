import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { AnnouncementTicker } from "@/components/layout/AnnouncementTicker";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Providers } from "@/components/layout/Providers";
import { CURRENCY_NOTE, STORE_NAME } from "@/lib/config";
import { loadStorefrontCatalogBootstrap } from "@/lib/catalog/load-storefront-catalog";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${STORE_NAME} — Quiet luxury`,
    template: `%s · ${STORE_NAME}`,
  },
  description:
    "SCF Fashion — quiet luxury fashion with an editorial identity, dual USD/IQD pricing, and WhatsApp checkout.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: STORE_NAME,
    description:
      "Quiet luxury fashion. Editorial looks, dual-currency pricing, WhatsApp ordering.",
    type: "website",
    images: [{ url: "/editorial/hero.jpg", width: 2000, height: 1333, alt: STORE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: STORE_NAME,
    description:
      "Quiet luxury fashion. Editorial looks, dual-currency pricing, WhatsApp ordering.",
    images: ["/editorial/hero.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Phase B2: flag off → seed mode (no DB). Flag on → Neon or error (no seed fallback).
  const catalogBootstrap = await loadStorefrontCatalogBootstrap();

  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <Providers catalogBootstrap={catalogBootstrap}>
          <div className="flex min-h-screen flex-col">
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-[var(--background)] focus:px-3 focus:py-2 focus:shadow"
            >
              Skip to content
            </a>
            <AnnouncementBar />
            <Header />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
            <AnnouncementTicker />
            <p className="sr-only">{CURRENCY_NOTE}</p>
          </div>
        </Providers>
      </body>
    </html>
  );
}
