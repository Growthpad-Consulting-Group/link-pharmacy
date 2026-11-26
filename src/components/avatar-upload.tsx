"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Two letters from the name, used when there is no photo. */
export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** A profile photo in a circle, or the person's initials when they have not added one. */
export function Avatar({ src, name, size = "lg" }: { src: string | null; name: string; size?: "sm" | "lg" }) {
  const dimension = size === "lg" ? "h-24 w-24 text-2xl" : "h-10 w-10 text-sm";
  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand font-bold text-ink ${dimension}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden>{initialsOf(name)}</span>
      )}
    </span>
  );
}

/** Lets the signed-in person upload, replace or remove their profile photo. */
export function AvatarUpload({ src, name, endpoint, size = "lg" }: { src: string | null; name: string; endpoint: string; size?: "sm" | "lg" }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"upload" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(method: "PUT" | "DELETE", body?: FormData) {
    setBusy(method === "PUT" ? "upload" : "remove");
    setError(null);
    try {
      const res = await fetch(endpoint, { method, body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "The photo could not be saved. Please try again.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <Avatar src={src} name={name} size={size} />
      <div className="min-w-0 space-y-3">
        <div>
          <p className="font-semibold text-ink">Profile photo</p>
          <p className="text-sm text-muted">Shown next to your name. JPG, PNG, WebP or GIF, up to 5 MB.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label
            className={`inline-flex cursor-pointer items-center rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/85 ${
              busy ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {busy === "upload" ? "Uploading…" : src ? "Change photo" : "Upload photo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              disabled={busy !== null}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                const form = new FormData();
                form.append("file", file);
                void send("PUT", form);
              }}
            />
          </label>
          {src && (
            <button
              type="button"
              onClick={() => void send("DELETE")}
              disabled={busy !== null}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50 disabled:opacity-60"
            >
              {busy === "remove" ? "Removing…" : "Remove"}
            </button>
          )}
        </div>
        {error && (
          <p role="alert" className="text-sm text-rose-700">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
