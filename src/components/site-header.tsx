"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useCart } from "@/context/cart-context";
import { CategoryNav, SHOP_CATEGORIES } from "./category-nav";

function SearchBar() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <form
      ref={ref}
      action="/shop"
      role="search"
      className="relative flex min-w-0 flex-1 items-center"
      onBlur={(event) => {
        // Closes when tabbing away. relatedTarget is null for mouse clicks, which the listener above handles.
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <label className="flex w-full min-w-0 items-center gap-2 rounded-md border border-slate-300 bg-ink/5 py-1 pl-4 pr-1 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/40">
        <span className="sr-only">Search products and brands</span>
        <input
          type="search"
          name="q"
          placeholder="search products and brands"
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted/70"
        />
        <button
          type="submit"
          aria-label="Search"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ink text-white transition hover:bg-ink/85"
        >
          <Icon icon="lucide:search" className="h-4 w-4" aria-hidden />
        </button>
      </label>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Product categories"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-lg"
          >
            <p className="px-4 py-1.5 text-sm font-bold text-ink">Browse Categories</p>
            <ul className="grid grid-cols-2">
              {SHOP_CATEGORIES.map((category) => (
                <li key={category.label} className="min-w-0">
                  <Link
                    href={category.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-ink hover:bg-brand/25"
                  >
                    {category.label}
                    <Icon icon="lucide:arrow-right" className="h-4 w-4 shrink-0" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </form>
  );
}

export function SiteHeader() {
  const { count, ready } = useCart();

  return (
    <>
      <div className="bg-slate-50 text-ink">
        <nav aria-label="Utility" className="mx-auto flex h-9 max-w-6xl items-center justify-end gap-4 px-4 text-xs sm:gap-6 sm:text-sm">
          <Link href="/find-a-pharmacy" aria-label="Find a pharmacy" className="flex items-center gap-1.5 font-medium text-ink/80 hover:text-ink hover:underline underline-offset-4">
            <Icon icon="lucide:map-pin" className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Find a pharmacy</span>
          </Link>
          <Link href="/patient-portal" aria-label="Patient portal" className="flex items-center gap-1.5 font-medium text-ink/80 hover:text-ink hover:underline underline-offset-4">
            <Icon icon="lucide:user-round" className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Patient portal</span>
          </Link>
        </nav>
      </div>
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-3 sm:px-4 md:h-20 md:gap-4">
        <Link href="/" aria-label="Link Pharmacy home" className="shrink-0">
          {/* The logo is an SVG in /public. Its height is set here so the header stays compact. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/link-logo.svg" alt="Link Pharmacy" className="h-8 w-auto md:h-10" />
        </Link>

        <SearchBar />

        <Link
          href="/account"
          aria-label="Account"
          className="flex shrink-0 items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-ink hover:bg-slate-100 md:px-3"
        >
          <Icon icon="lucide:user-round" className="h-6 w-6" aria-hidden />
          <span className="hidden md:inline">Account</span>
        </Link>

        <Link
          href="/cart"
          aria-label={`Cart${ready && count > 0 ? `, ${count} items` : ""}`}
          className="relative flex shrink-0 items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-ink hover:bg-slate-100 md:px-3"
        >
          <Icon icon="lucide:shopping-bag" className="h-6 w-6" aria-hidden />
          <span className="hidden md:inline">Cart</span>
          {ready && count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-xs font-bold text-white">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
      <CategoryNav />
    </>
  );
}
