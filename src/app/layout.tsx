import type { Metadata } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/context/cart-context";
import { IconProvider } from "@/components/icon-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CookieBanner } from "@/components/cookie-banner";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Link Pharmacy",
    template: "%s · Link Pharmacy",
  },
  description: "Everyday health, wellness and personal care essentials from Link Pharmacy.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col overflow-x-clip bg-slate-50 text-ink">
        <IconProvider />
        <CartProvider>
          <SiteHeader />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">{children}</main>
          <SiteFooter />
          <CookieBanner />
        </CartProvider>
      </body>
    </html>
  );
}
