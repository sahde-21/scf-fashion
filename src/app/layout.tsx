import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { AnnouncementTicker } from "@/components/layout/AnnouncementTicker";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Providers } from "@/components/layout/Providers";
import { CURRENCY_NOTE, STORE_NAME } from "@/lib/config";
import "./globals.css";

const display = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${STORE_NAME} — Premium streetwear`,
    template: `%s · ${STORE_NAME}`,
  },
  description:
    "SCF Fashion is a premium streetwear storefront with dual USD/IQD pricing and WhatsApp checkout.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: STORE_NAME,
    description:
      "Bold minimal streetwear essentials and WhatsApp ordering. Demo storefront for local development.",
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
            <AnnouncementTicker />
            <p className="sr-only">{CURRENCY_NOTE}</p>
          </div>
        </Providers>
      </body>
    </html>
  );
}
