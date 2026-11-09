import { CartView } from "@/components/cart-view";

export const metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Your cart</h1>
      <CartView />
    </div>
  );
}
