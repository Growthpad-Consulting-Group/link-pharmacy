"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useCart } from "@/context/cart-context";
import { formatMoney } from "@/lib/format";
import { ProductImage } from "./product-image";

export function CartView() {
  const { items, ready, subtotal, setQuantity, removeItem } = useCart();

  if (!ready) {
    return <div className="h-64 animate-pulse rounded-sm bg-slate-100" aria-hidden />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-sm border border-dashed border-slate-300 bg-white py-16 text-center">
        <Icon icon="lucide:shopping-bag" className="h-12 w-12 text-muted" aria-hidden />
        <h2 className="text-xl font-bold text-ink">Your cart is empty</h2>
        <p className="text-muted">Browse our products and add something you need.</p>
        <Link
          href="/shop"
          className="mt-2 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/85"
        >
          <Icon icon="lucide:shopping-bag" className="h-4 w-4 text-brand" aria-hidden />
          Shop products
          <Icon icon="lucide:arrow-right" className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    );
  }

  const currency = items[0].currency;
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <section aria-label="Cart items" className="lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </h2>
        </div>
        <ul className="divide-y divide-slate-200 rounded-sm border border-slate-200 bg-white">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={item.productId}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: 16 }}
                className="flex gap-4 p-4 sm:gap-6 sm:p-5"
              >
                <Link href={`/product/${item.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-sm bg-slate-50 sm:h-28 sm:w-28">
                  <ProductImage src={item.imageUrl} alt={item.name} fit="contain" className="h-full w-full p-2" />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link href={`/product/${item.slug}`} className="font-semibold leading-snug text-ink hover:underline">
                        {item.name}
                      </Link>
                      <p className="mt-1 text-sm text-muted">{formatMoney(item.price, item.currency)} each</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      aria-label={`Remove ${item.name}`}
                      className="shrink-0 rounded-md p-2 text-muted transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Icon icon="lucide:trash-2" className="h-4 w-4" aria-hidden />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center overflow-hidden rounded-md border border-slate-300">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQuantity(item.productId, item.quantity - 1)}
                        className="flex h-9 w-9 items-center justify-center text-ink transition hover:bg-slate-100"
                      >
                        <Icon icon="lucide:minus" className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <span className="flex h-9 w-10 items-center justify-center text-sm font-semibold tabular-nums text-ink">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        disabled={item.quantity >= item.stock}
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center text-ink transition hover:bg-slate-100 disabled:opacity-40"
                      >
                        <Icon icon="lucide:plus" className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                    <span className="text-base font-bold text-ink">
                      {formatMoney(item.price * item.quantity, item.currency)}
                    </span>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <Link href="/shop" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ink hover:underline">
          <Icon icon="lucide:arrow-left" className="h-4 w-4" aria-hidden />
          Continue shopping
        </Link>
      </section>

      <aside className="h-fit rounded-sm bg-[#F7F9F6] p-6 lg:sticky lg:top-24">
        <h2 className="text-lg font-bold text-ink">Order summary</h2>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between text-muted">
            <dt>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</dt>
            <dd className="font-medium text-ink">{formatMoney(subtotal, currency)}</dd>
          </div>
          <div className="flex justify-between text-muted">
            <dt>Delivery</dt>
            <dd>Calculated at checkout</dd>
          </div>
        </dl>
        <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5">
          <span className="font-semibold text-ink">Total</span>
          <span className="text-xl font-bold text-ink">{formatMoney(subtotal, currency)}</span>
        </div>
        <Link
          href="/checkout"
          className="mt-6 flex w-full items-center justify-between gap-3 rounded-md bg-ink px-5 py-3.5 font-semibold text-white transition hover:bg-ink/85"
        >
          <span className="flex items-center gap-2">
            <Icon icon="lucide:shopping-bag" className="h-4 w-4 text-brand" aria-hidden />
            Proceed to checkout
          </span>
          <Icon icon="lucide:arrow-right" className="h-4 w-4" aria-hidden />
        </Link>
        <p className="mt-4 flex items-center gap-2 text-xs text-muted">
          <Icon icon="lucide:shield-check" className="h-4 w-4 shrink-0" aria-hidden />
          Secure checkout. Final prices and taxes are confirmed by our team.
        </p>
      </aside>
    </div>
  );
}
