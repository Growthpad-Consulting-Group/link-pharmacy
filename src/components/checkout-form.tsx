"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useCart } from "@/context/cart-context";
import { formatMoney } from "@/lib/format";
import { ProductImage } from "./product-image";

type FieldName = "name" | "email" | "phone" | "street" | "city" | "zip";
type FieldErrors = Partial<Record<FieldName, string[]>>;

const CONTACT_FIELDS: { name: FieldName; label: string; type?: string; autoComplete: string }[] = [
  { name: "name", label: "Full name", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
];

const ADDRESS_FIELDS: { name: FieldName; label: string; autoComplete: string; span?: boolean }[] = [
  { name: "street", label: "Street address", autoComplete: "street-address", span: true },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "zip", label: "Postal code", autoComplete: "postal-code" },
];

const inputClass =
  "mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-ink outline-none transition placeholder:text-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/40 aria-[invalid=true]:border-rose-400";

function Section({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sm border border-slate-200 bg-white p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-sm font-bold text-white">{step}</span>
        <h2 className="text-lg font-bold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function CheckoutForm() {
  const { items, ready, subtotal, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [confirmation, setConfirmation] = useState<{ reference: string; total: number; currency: string; demo: boolean } | null>(null);

  if (!ready) return <div className="h-96 animate-pulse rounded-sm bg-slate-100" aria-hidden />;

  if (confirmation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg rounded-sm border border-slate-200 bg-white p-10 text-center"
      >
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/20">
          <Icon icon="lucide:check" className="h-8 w-8 text-ink" aria-hidden />
        </span>
        <h2 className="mt-5 text-2xl font-bold text-ink">Thank you for your order</h2>
        <p className="mt-2 text-muted">
          Your order reference is <span className="font-semibold text-ink">{confirmation.reference}</span>.
        </p>
        <p className="mt-1 text-muted">Total: {formatMoney(confirmation.total, confirmation.currency)}</p>
        {confirmation.demo && (
          <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">Demo mode: no order was created in Odoo.</p>
        )}
        <Link
          href="/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 font-semibold text-white transition hover:bg-ink/85"
        >
          Continue shopping
          <Icon icon="lucide:arrow-right" className="h-4 w-4" aria-hidden />
        </Link>
      </motion.div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-sm border border-dashed border-slate-300 bg-white py-16 text-center">
        <Icon icon="lucide:shopping-bag" className="h-12 w-12 text-muted" aria-hidden />
        <h2 className="text-xl font-bold text-ink">Your cart is empty</h2>
        <Link href="/shop" className="font-semibold text-ink hover:underline">Browse products</Link>
      </div>
    );
  }

  const currency = items[0].currency;
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      customer: Object.fromEntries(
        [...CONTACT_FIELDS, ...ADDRESS_FIELDS].map((f) => [f.name, String(form.get(f.name) ?? "")]),
      ),
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
      <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
        <Section step={1} title="Contact details">
          <div className="grid gap-5 sm:grid-cols-2">
            {CONTACT_FIELDS.map((field) => (
              <label key={field.name} className={`block text-sm font-medium text-ink ${field.name === "name" ? "sm:col-span-2" : ""}`}>
                {field.label}
                <input
                  name={field.name}
                  type={field.type ?? "text"}
                  autoComplete={field.autoComplete}
                  required
                  aria-invalid={Boolean(fieldErrors[field.name])}
                  className={inputClass}
                />
                {fieldErrors[field.name]?.[0] && (
                  <span className="mt-1.5 block text-xs text-rose-600">{fieldErrors[field.name]?.[0]}</span>
                )}
              </label>
            ))}
          </div>
        </Section>

        <Section step={2} title="Delivery address">
          <div className="grid gap-5 sm:grid-cols-2">
            {ADDRESS_FIELDS.map((field) => (
              <label key={field.name} className={`block text-sm font-medium text-ink ${field.span ? "sm:col-span-2" : ""}`}>
                {field.label}
                <input
                  name={field.name}
                  autoComplete={field.autoComplete}
                  required
                  aria-invalid={Boolean(fieldErrors[field.name])}
                  className={inputClass}
                />
                {fieldErrors[field.name]?.[0] && (
                  <span className="mt-1.5 block text-xs text-rose-600">{fieldErrors[field.name]?.[0]}</span>
                )}
              </label>
            ))}
          </div>
        </Section>

        {error && (
          <p role="alert" className="flex items-start gap-3 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <Icon icon="lucide:circle-alert" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {error}
          </p>
        )}
      </form>

      <aside className="h-fit rounded-sm bg-[#F7F9F6] p-6 lg:sticky lg:top-24">
        <h2 className="text-lg font-bold text-ink">Order summary</h2>
        <ul className="mt-5 divide-y divide-slate-200">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-3 py-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-white">
                <ProductImage src={item.imageUrl} alt="" fit="contain" className="h-full w-full p-1" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                <p className="text-xs text-muted">Qty {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold text-ink">{formatMoney(item.price * item.quantity, item.currency)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
          <div className="flex justify-between text-muted">
            <dt>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</dt>
            <dd className="font-medium text-ink">{formatMoney(subtotal, currency)}</dd>
          </div>
          <div className="flex justify-between text-muted">
            <dt>Delivery</dt>
            <dd>Confirmed by our team</dd>
          </div>
        </dl>
        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="font-semibold text-ink">Total</span>
          <span className="text-xl font-bold text-ink">{formatMoney(subtotal, currency)}</span>
        </div>

        <button
          type="submit"
          form="checkout-form"
          disabled={submitting}
          className="mt-6 flex w-full items-center justify-between gap-3 rounded-md bg-ink px-5 py-3.5 font-semibold text-white transition hover:bg-ink/85 disabled:cursor-wait disabled:opacity-70"
        >
          <span className="flex items-center gap-2">
            <Icon icon="lucide:shopping-bag" className="h-4 w-4 text-brand" aria-hidden />
            {submitting ? "Placing order…" : "Place order"}
          </span>
          <Icon icon="lucide:arrow-right" className="h-4 w-4" aria-hidden />
        </button>
        <p className="mt-4 flex items-center gap-2 text-xs text-muted">
          <Icon icon="lucide:shield-check" className="h-4 w-4 shrink-0" aria-hidden />
          Your details are kept secure.
        </p>
      </aside>
    </div>
  );
}
