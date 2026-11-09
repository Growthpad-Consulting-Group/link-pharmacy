import { CheckoutForm } from "@/components/checkout-form";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
