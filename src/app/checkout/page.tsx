import { CheckoutForm } from "@/components/checkout-form";
import { PageRibbon } from "@/components/page-ribbon";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="space-y-10">
      <PageRibbon
        crumbs={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout" }]}
        title="Checkout"
      />
      <CheckoutForm />
    </div>
  );
}
