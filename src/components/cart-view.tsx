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
    return <div className="h-64 animate-pulse rounded-2xl bg-slate-100" aria-hidden />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-300 py-20 text-center">
        <Icon icon="lucide:shopping-bag" className="h-12 w-12 text-muted/70" />
        <p className="text-lg font-semibold text-ink">Your cart is empty</p>
        <Link href="/shop" className="rounded-md bg-brand px-6 py-2.5 font-semibold text-ink hover:bg-brand-hover">
          Browse products
        </Link>
      </div>
    );
  }

  const currency = items[0].currency;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <ul className="space-y-4 lg:col-span-2">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.li
              key={item.productId}
              layout
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4"
            >
              <Link href={`/product/${item.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                <ProductImage src={item.imageUrl} alt={item.name} className="h-full w-full" />
              </Link>
              <div className="flex flex-1 flex-col justify-between gap-2">
                <div className="flex items-start justify-between gap-4">
                  <Link href={`/product/${item.slug}`} className="font-semibold text-ink hover:text-ink">
                    {item.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${item.name}`}
                    className="rounded-md p-1.5 text-muted/70 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Icon icon="lucide:trash" className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center rounded-md border border-slate-300">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      className="p-2 text-muted hover:text-ink"
                    >
                      <Icon icon="lucide:minus" className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      disabled={item.quantity >= item.stock}
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      className="p-2 text-muted hover:text-ink disabled:opacity-40"
                    >
                      <Icon icon="lucide:plus" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-bold text-ink">
                    {formatMoney(item.price * item.quantity, item.currency)}
                  </span>
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold text-ink">Order summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-muted">
            <dt>Subtotal</dt>
            <dd className="font-medium text-ink">{formatMoney(subtotal, currency)}</dd>
          </div>
          <div className="flex justify-between text-muted">
            <dt>Taxes and delivery</dt>
            <dd>Calculated at checkout</dd>
          </div>
        </dl>
        <Link
          href="/checkout"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-brand px-6 py-3 font-semibold text-ink shadow-md hover:bg-brand-hover"
        >
          Proceed to checkout <Icon icon="lucide:arrow-right" className="h-4 w-4" />
        </Link>
      </aside>
    </div>
  );
}
