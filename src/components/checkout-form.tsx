"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useCart } from "@/context/cart-context";
import { formatMoney } from "@/lib/format";

type FieldErrors = Partial<Record<"name" | "email" | "phone" | "street" | "city" | "zip", string[]>>;

const FIELDS: { name: keyof FieldErrors; label: string; type?: string; autoComplete: string; span?: boolean }[] = [
  { name: "name", label: "Full name", autoComplete: "name", span: true },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
  { name: "street", label: "Street address", autoComplete: "street-address", span: true },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "zip", label: "Postal code", autoComplete: "postal-code" },
];

export function CheckoutForm() {
  const { items, ready, subtotal, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [confirmation, setConfirmation] = useState<{ reference: string; total: number; currency: string; demo: boolean } | null>(null);

  if (!ready) return <div className="h-96 animate-pulse rounded-2xl bg-slate-100" aria-hidden />;

  if (confirmation) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-brand bg-brand/15 p-10 text-center"
      >
        <Icon icon="lucide:circle-check-big" className="mx-auto h-14 w-14 text-ink" />
        <h2 className="mt-4 text-2xl font-bold text-ink">Thank you for your order</h2>
        <p className="mt-2 text-muted">
          Your order reference is <span className="font-semibold text-ink">{confirmation.reference}</span>.
        </p>
        <p className="mt-1 text-muted">Total: {formatMoney(confirmation.total, confirmation.currency)}</p>
        {confirmation.demo && (
          <p className="mt-4 text-sm text-amber-700">Demo mode: no order was created in Odoo.</p>
        )}
        <Link href="/shop" className="mt-6 inline-flex rounded-md bg-brand px-6 py-2.5 font-semibold text-ink hover:bg-brand-hover">
          Continue shopping
        </Link>
      </motion.div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">
        <p className="font-semibold text-ink">Your cart is empty</p>
        <Link href="/shop" className="mt-4 inline-block text-ink underline">Browse products</Link>
      </div>
    );
  }

  const currency = items[0].currency;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      customer: Object.fromEntries(FIELDS.map((f) => [f.name, String(form.get(f.name) ?? "")])),
      lines: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        if (data.issues) setFieldErrors(data.issues as FieldErrors);
        return;
      }

      setConfirmation(data.order);
      clear();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Delivery details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <label key={field.name} className={`block text-sm font-medium text-ink/80 ${field.span ? "sm:col-span-2" : ""}`}>
                {field.label}
                <input
                  name={field.name}
                  type={field.type ?? "text"}
                  autoComplete={field.autoComplete}
                  required
                  aria-invalid={Boolean(fieldErrors[field.name])}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/40 aria-[invalid=true]:border-rose-400"
                />
                {fieldErrors[field.name]?.[0] && (
                  <span className="mt-1 block text-xs text-rose-600">{fieldErrors[field.name]?.[0]}</span>
                )}
              </label>
            ))}
          </div>
        </section>

        {error && (
          <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-brand px-6 py-3.5 font-semibold text-ink shadow-md transition hover:bg-brand-hover disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? "Placing order…" : `Place order · ${formatMoney(subtotal, currency)}`}
        </button>
      </form>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold text-ink">Items</h2>
        <ul className="mt-4 divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-4 py-3 text-sm">
              <span className="text-ink/80">
                {item.name} <span className="text-muted">× {item.quantity}</span>
              </span>
              <span className="font-medium text-ink">{formatMoney(item.price * item.quantity, item.currency)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-slate-100 pt-4 text-xs text-muted">
          Final prices and taxes are confirmed by our team.
        </p>
      </aside>
    </div>
  );
}
