/** Moyo, the Link mascot (transparent background). Shown on friendly empty and error states. */
export function Mascot({ message, size = "md" }: { message?: string; size?: "sm" | "md" }) {
  const width = size === "sm" ? "w-32" : "w-44 sm:w-56";
  return (
    <figure className="flex flex-col items-center gap-3 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/mascot/moyo-transparent.png" alt="Moyo, the Link mascot" loading="lazy" className={`${width} h-auto object-contain`} />
      {message && <figcaption className="max-w-xs text-sm font-semibold text-ink">{message}</figcaption>}
    </figure>
  );
}
