"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { inputClass } from "@/components/portal/form-ui";
import type { MediaItem } from "@/lib/media/types";
import { Alert } from "./format";
import { Spinner } from "./loading";
import { apiFetch, errorMessage } from "./api";

export type PickedImage = { url: string; alt: string };

type Props = {
  open: boolean;
  title: string;
  /** Show the alt text field. Needed for pictures inside an article; not for a cover image. */
  showAlt?: boolean;
  onClose: () => void;
  onPick: (image: PickedImage) => void;
};

/** A dialog to upload a new image to R2 or pick one from the media library. */
export function MediaPicker({ open, title, showAlt = true, onClose, onPick }: Props) {
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [alt, setAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    apiFetch<{ media: MediaItem[] }>("/api/admin/media")
      .then((result) => {
        if (!cancelled) setItems(result.media);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const result = await apiFetch<{ item: MediaItem }>("/api/admin/media", { body: form });
      setItems((current) => [result.item, ...(current ?? [])]);
      setSelected(result.item);
      setTab("library");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="media-picker-title" className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 id="media-picker-title" className="text-lg font-bold text-ink">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1.5 text-muted hover:bg-slate-100 hover:text-ink">
            <Icon icon="lucide:x" className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div role="tablist" aria-label="Image source" className="flex gap-1 border-b border-slate-200 px-6 pt-3">
          {(["library", "upload"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={`-mb-px border-b-2 px-3 pb-3 text-sm font-semibold transition ${
                tab === value ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {value === "library" ? "Media library" : "Upload new"}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {error && <Alert tone="error">{error}</Alert>}

          {tab === "upload" ? (
            <label
              className={`mt-2 flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center transition hover:border-ink/40 hover:bg-white ${
                uploading ? "pointer-events-none opacity-70" : ""
              }`}
            >
              {uploading ? <Spinner /> : <Icon icon="lucide:image-plus" className="h-8 w-8 text-ink" aria-hidden />}
              <span className="font-semibold text-ink">{uploading ? "Uploading…" : "Choose an image to upload"}</span>
              <span className="text-xs text-muted">JPG, PNG, WebP or GIF, up to 5 MB</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(e) => {
                  void handleFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
          ) : items === null ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : items.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted">No images yet. Use “Upload new” to add one.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    aria-pressed={selected?.id === item.id}
                    className={`block w-full overflow-hidden rounded-lg border-2 bg-slate-50 text-left transition ${
                      selected?.id === item.id ? "border-ink shadow-md" : "border-transparent hover:border-slate-300"
                    }`}
                  >
                    <span className="flex aspect-square items-center justify-center p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.url} alt="" loading="lazy" className="h-full w-full object-contain" />
                    </span>
                    <span className="block truncate px-2 pb-2 text-xs text-muted">{item.originalName}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-end sm:justify-between">
          {showAlt ? (
            <label className="block flex-1 text-sm font-medium text-ink">
              Description (alt text)
              <input
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="For example: a pharmacist checking a prescription"
                className={`${inputClass} mt-1.5`}
              />
              <span className="mt-1 block text-xs font-normal text-muted">Read aloud by screen readers. Leave blank for decoration.</span>
            </label>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="button"
              disabled={!selected}
              onClick={() => {
                if (selected) onPick({ url: selected.url, alt: showAlt ? alt.trim() : "" });
              }}
              className="rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Use this image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
