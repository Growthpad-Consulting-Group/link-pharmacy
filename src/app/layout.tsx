import type { Metadata } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import { IconProvider } from "@/components/icon-provider";
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

// Only the document shell lives here. The public site (header, footer, cart) is in app/(site),
// and the staff admin screens in app/admin have their own layout.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col overflow-x-clip bg-slate-50 text-ink">
        <IconProvider />
        {children}
      </body>
    </html>
  );
}
