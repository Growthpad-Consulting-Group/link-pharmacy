import { CartView } from "@/components/cart-view";
import { PageRibbon } from "@/components/page-ribbon";

export const metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <div className="space-y-10">
      <PageRibbon crumbs={[{ label: "Home", href: "/" }, { label: "Cart" }]} title="Your cart" />
      <CartView />
    </div>
  );
}
