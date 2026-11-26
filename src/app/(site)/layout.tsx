import { CartProvider } from "@/context/cart-context";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CookieBanner } from "@/components/cookie-banner";
import { MoyoChat } from "@/components/moyo-chat";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <CartProvider>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">{children}</main>
      <SiteFooter />
      <CookieBanner />
      <MoyoChat />
    </CartProvider>
  );
}
