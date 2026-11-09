"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  price: number; // display only, the server re-prices every order
  currency: string;
  imageUrl: string | null;
  stock: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "link-pharmacy-cart";
const EMPTY: CartItem[] = [];

/* ---------- tiny external store: localStorage is the source of truth ---------- */

let cache: CartItem[] | null = null;
const listeners = new Set<() => void>();

function readStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : EMPTY;
  } catch {
    return EMPTY; // storage unavailable or corrupt: start with an empty cart
  }
}

function getSnapshot(): CartItem[] {
  if (cache === null) cache = readStorage();
  return cache;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY;
}

function setItems(next: CartItem[]) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota or private mode: the cart still works for this page session */
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cache = readStorage();
      listener();
    }
  };
  window.addEventListener("storage", onStorage); // keep other open tabs in sync
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function subscribeNoop() {
  return () => {};
}

/* ------------------------------ provider ------------------------------ */

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // false during server render and hydration, true once the client has the stored cart.
  const ready = useSyncExternalStore(subscribeNoop, () => true, () => false);

  const addItem = useCallback<CartContextValue["addItem"]>((item, quantity = 1) => {
    const current = getSnapshot();
    const max = Math.max(0, item.stock);
    const existing = current.find((i) => i.productId === item.productId);
    if (existing) {
      setItems(
        current.map((i) =>
          i.productId === item.productId
            ? { ...i, stock: item.stock, quantity: Math.min(max, i.quantity + quantity) }
            : i,
        ),
      );
    } else {
      setItems([...current, { ...item, quantity: Math.min(max, quantity) }]);
    }
  }, []);

  const setQuantity = useCallback((productId: number, quantity: number) => {
    setItems(
      getSnapshot()
        .map((i) =>
          i.productId === productId ? { ...i, quantity: Math.min(i.stock, Math.max(0, quantity)) } : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems(getSnapshot().filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      ready,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [items, ready, addItem, setQuantity, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
