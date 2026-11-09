"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useCart } from "@/context/cart-context";
import type { Product } from "@/lib/catalog";

export function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const outOfStock = product.stock === 0;

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        currency: product.currency,
        imageUrl: product.imageUrl,
        stock: product.stock,
      },
      quantity,
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex items-center rounded-md border border-slate-300 bg-white">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={outOfStock}
          className="p-3 text-muted hover:text-ink disabled:opacity-40"
        >
          <Icon icon="lucide:minus" className="h-4 w-4" />
        </button>
        <span className="w-10 text-center font-semibold tabular-nums" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
          disabled={outOfStock || quantity >= product.stock}
          className="p-3 text-muted hover:text-ink disabled:opacity-40"
        >
          <Icon icon="lucide:plus" className="h-4 w-4" />
        </button>
      </div>

      <motion.button
        type="button"
        onClick={handleAdd}
        disabled={outOfStock}
        whileTap={{ scale: 0.97 }}
        className="relative inline-flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-md bg-brand px-6 py-3 font-semibold text-ink shadow-md transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={justAdded ? "added" : "idle"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-2"
          >
            {outOfStock ? (
              "Out of stock"
            ) : justAdded ? (
              <>
                <Icon icon="lucide:check" className="h-5 w-5" /> Added to cart
              </>
            ) : (
              <>
                <Icon icon="lucide:shopping-bag" className="h-5 w-5" /> Add to cart
              </>
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
