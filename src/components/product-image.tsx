import { Icon } from "@iconify/react";

/**
 * Product photo from Odoo or public/products, or an Iconify placeholder when none exists.
 * fit="cover" fills the frame (cropping edges); fit="contain" shows the whole product.
 */
export function ProductImage({
  src,
  alt,
  className = "",
  fit = "cover",
}: {
  src: string | null;
  alt: string;
  className?: string;
  fit?: "cover" | "contain";
}) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-brand/15 text-ink ${className}`}>
        <Icon icon="lucide:pill" className="h-1/3 w-1/3" aria-hidden />
      </div>
    );
  }
  const fitClass = fit === "contain" ? "object-contain" : "object-cover";
  // Odoo images are served from the ERP host, so next/image remotePatterns would need a fixed host.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" className={`${fitClass} ${className}`} />;
}
