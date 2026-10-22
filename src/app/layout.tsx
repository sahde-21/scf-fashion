import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Providers } from "@/components/layout/Providers";
import { CURRENCY_NOTE, STORE_NAME } from "@/lib/config";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${STORE_NAME} — Modern fashion`,
    template: `%s · ${STORE_NAME}`,
  },
  description:
    "SCF Fashion is a premium, mobile-first fashion storefront with dual USD/IQD pricing and WhatsApp checkout.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: STORE_NAME,
    description:
      "Soft sky tones, polished essentials, and WhatsApp ordering. Demo storefront for local development.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:shadow"
            >
              Skip to content
            </a>
            <Header />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
            <p className="sr-only">{CURRENCY_NOTE}</p>
          </div>
        </Providers>
      </body>
    </html>
  );
}
