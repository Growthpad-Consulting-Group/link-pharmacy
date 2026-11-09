import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stock and prices come live from Odoo on every request, so pages render dynamically
  // instead of being prerendered (Cache Components would require Suspense around each read).
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Product photos are served from your Odoo host (/web/image/...). If you switch from <img>
    // to next/image, add your ODOO_URL hostname here.
    remotePatterns: [],
  },
};

export default nextConfig;
