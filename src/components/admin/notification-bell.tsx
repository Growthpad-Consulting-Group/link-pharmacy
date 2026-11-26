"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { NotificationItem } from "@/lib/notifications/item";
import { formatDateTime } from "./format";
import { apiFetch } from "./api";

const ICONS: Record<NotificationItem["type"], string> = {
  prescription: "lucide:file-text",
  message: "lucide:mail",
  appointment: "lucide:calendar-check",
  order: "lucide:shopping-bag",
  subscriber: "lucide:mails",
};

// The live feed is a separate process (npm run realtime). Override the address when it is not on this machine.
function realtimeUrl(): string {
  return process.env.NEXT_PUBLIC_REALTIME_URL ?? `ws://${window.location.hostname}:4001`;
}

/** Bell in the staff admin: a list of recent events, updated live over a WebSocket. */
export function NotificationBell() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [live, setLive] = useState(false);
  const [toast, setToast] = useState<NotificationItem | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Recent notifications on first load.
  useEffect(() => {
    let cancelled = false;
    apiFetch<{ items: NotificationItem[] }>("/api/admin/notifications")
      .then((result) => {
        if (!cancelled) setItems(result.items);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Live feed. Reconnects with a growing delay if the connection drops.
  useEffect(() => {
    let socket: WebSocket | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;
    let stopped = false;

    const connect = () => {
      socket = new WebSocket(realtimeUrl());
      socket.onopen = () => {
        attempt = 0;
        setLive(true);
      };
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(String(event.data)) as { type: string; item?: NotificationItem };
          if (message.type !== "notification" || !message.item) return;
          const item = message.item;
          setItems((current) => (current.some((existing) => existing.id === item.id) ? current : [item, ...current].slice(0, 30)));
          setToast(item);
        } catch {
          // Ignore messages that are not notifications.
        }
      };
      socket.onclose = () => {
        setLive(false);
        if (!stopped) {
          timer = setTimeout(connect, Math.min(30_000, 1000 * 2 ** attempt));
          attempt += 1;
        }
      };
    };

    connect();
    return () => {
      stopped = true;
      clearTimeout(timer);
      socket?.close();
    };
  }, []);

  // Hide the toast after a few seconds.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Close the list on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const unread = items.filter((item) => !item.read).length;

  async function markRead(ids: string[] | null) {
    setItems((current) => current.map((item) => (ids === null || ids.includes(item.id) ? { ...item, read: true } : item)));
    await apiFetch("/api/admin/notifications/read", { body: ids ? { ids } : {} }).catch(() => undefined);
  }

  function openItem(item: NotificationItem) {
    setOpen(false);
    setToast(null);
    void markRead([item.id]);
    router.push(item.href);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        className="relative rounded-md p-2 text-ink transition hover:bg-slate-100"
      >
        <Icon icon="lucide:bell" className="h-5 w-5" aria-hidden />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div role="dialog" aria-label="Notifications" className="absolute right-0 z-40 mt-2 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-ink">Notifications</h2>
              <span className={`flex items-center gap-1 text-xs ${live ? "text-emerald-700" : "text-muted"}`}>
                <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${live ? "bg-emerald-500" : "bg-slate-400"}`} />
                {live ? "Live" : "Reconnecting…"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => void markRead(null)}
              disabled={unread === 0}
              className="text-xs font-semibold text-ink underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
            >
              Mark all read
            </button>
          </div>

          {!loaded ? (
            <p className="px-4 py-8 text-center text-sm text-muted">Loading…</p>
          ) : items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">Nothing yet. New prescriptions, messages and appointments appear here.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => openItem(item)}
                    className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${item.read ? "" : "bg-brand/10"}`}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white shadow-sm ring-1 ring-slate-200">
                      <Icon icon={ICONS[item.type]} className="h-4 w-4 text-ink" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-sm ${item.read ? "text-ink" : "font-semibold text-ink"}`}>{item.title}</span>
                      <span className="line-clamp-2 block text-xs text-muted">{item.body}</span>
                      <span className="mt-1 block text-[11px] text-muted">{formatDateTime(item.createdAt)}</span>
                    </span>
                    {!item.read && <span aria-label="Unread" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-600" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {toast && (
        <div role="status" className="fixed bottom-5 right-5 z-50 w-[min(320px,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="flex items-start gap-3">
            <button type="button" onClick={() => openItem(toast)} className="min-w-0 flex-1 text-left">
              <span className="block text-xs font-semibold uppercase tracking-wide text-muted">New</span>
              <span className="block truncate font-semibold text-ink">{toast.title}</span>
              <span className="line-clamp-2 block text-sm text-muted">{toast.body}</span>
            </button>
            <button type="button" onClick={() => setToast(null)} aria-label="Dismiss" className="rounded p-1 text-muted hover:bg-slate-100 hover:text-ink">
              <Icon icon="lucide:x" className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
