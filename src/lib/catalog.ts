import "server-only";
import { callKw, isOdooConfigured, odooConfig } from "./odoo";

export type Product = {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  stock: number; // units available (qty_available in Odoo)
  category: string;
  imageUrl: string | null; // first photo, used on cards
  imageUrls: string[]; // every photo, used in the product gallery
  sku: string | null;
  brand: string | null;
};

export const isDemoMode = !isOdooConfigured();

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Slugs end in the product id, so lookups stay stable even if the name changes. */
export function makeSlug(name: string, id: number): string {
  return `${slugify(name)}-${id}`;
}

export function idFromSlug(slug: string): number | null {
  const id = Number(slug.split("-").pop());
  return Number.isInteger(id) && id > 0 ? id : null;
}

/* ----------------------------- Odoo source ----------------------------- */

type OdooProductRow = {
  id: number;
  name: string;
  list_price: number;
  default_code: string | false;
  qty_available: number;
  categ_id: [number, string] | false;
  description_sale: string | false;
  product_tmpl_id: [number, string];
};

async function fetchFromOdoo(ids?: number[]): Promise<Product[]> {
  const domain: unknown[] = [
    ["sale_ok", "=", true],
    ["active", "=", true],
  ];
  if (ids?.length) domain.push(["id", "in", ids]);

  const rows = await callKw<OdooProductRow[]>("product.product", "search_read", [domain], {
    fields: [
      "name",
      "list_price",
      "default_code",
      "qty_available",
      "categ_id",
      "description_sale",
      "product_tmpl_id",
    ],
    limit: 200,
    order: "name asc",
  });

  // Extra photos live on product.image, linked to the product template.
  const tmplIds = [...new Set(rows.map((r) => r.product_tmpl_id[0]))];
  const extraRows = tmplIds.length
    ? await callKw<{ id: number; product_tmpl_id: [number, string] }[]>("product.image", "search_read", [[["product_tmpl_id", "in", tmplIds]]], {
        fields: ["id", "product_tmpl_id"],
        order: "sequence asc",
      })
    : [];
  const extrasByTmpl = new Map<number, string[]>();
  for (const e of extraRows) {
    const key = e.product_tmpl_id[0];
    extrasByTmpl.set(key, [...(extrasByTmpl.get(key) ?? []), `${odooConfig.url}/web/image/product.image/${e.id}/image_1024`]);
  }

  return rows.map((row) => {
    const categoryPath = row.categ_id ? row.categ_id[1] : "Uncategorized";
    return {
      id: row.id,
      slug: makeSlug(row.name, row.id),
      name: row.name,
      description: row.description_sale || "",
      price: row.list_price,
      currency: odooConfig.currency,
      stock: Math.max(0, Math.floor(row.qty_available ?? 0)),
      category: categoryPath.split(" / ").pop() ?? categoryPath,
      // Odoo serves product images from /web/image. The record must be readable by the public.
      imageUrl: `${odooConfig.url}/web/image/product.product/${row.id}/image_1024`,
      imageUrls: [
        `${odooConfig.url}/web/image/product.product/${row.id}/image_1024`,
        ...(extrasByTmpl.get(row.product_tmpl_id[0]) ?? []),
      ],
      sku: row.default_code || null,
      brand: null, // set from your Odoo brand field when one is configured
    };
  });
}

/* ----------------------------- Demo source ----------------------------- */

const DEMO_PRODUCTS: Omit<Product, "slug" | "currency" | "imageUrl" | "imageUrls" | "brand">[] = [
  { id: 7, name: "Body Lotion", description: "Nourishing daily body lotion for soft, hydrated skin, 400ml.", price: 13.5, stock: 35, category: "Personal Care", sku: "BLT-400" },
  { id: 1, name: "Vitamin C 1000mg Tablets", description: "Daily immune support, 60 tablets per bottle.", price: 12.5, stock: 40, category: "Vitamins & Supplements", sku: "VIT-C-1000" },
  { id: 2, name: "Omega-3 Fish Oil Capsules", description: "High-potency omega-3 for heart and brain health, 90 softgels.", price: 19.99, stock: 25, category: "Vitamins & Supplements", sku: "OMG-3-90" },
  { id: 3, name: "Hand Sanitizer 500ml", description: "Alcohol-based gel that kills 99.9% of common germs.", price: 6.75, stock: 120, category: "Personal Care", sku: "SAN-500" },
  { id: 4, name: "Digital Thermometer", description: "Fast, accurate readings in 10 seconds with a backlit display.", price: 14.0, stock: 0, category: "Medical Devices", sku: "THM-DIG" },
  { id: 5, name: "Electrolyte Hydration Sachets", description: "Orange-flavoured electrolytes, box of 20 sachets.", price: 17.25, stock: 18, category: "Wellness", sku: "ELE-20" },
  { id: 6, name: "Gentle Daily Facial Cleanser", description: "Fragrance-free cleanser suitable for sensitive skin, 150ml.", price: 9.9, stock: 60, category: "Personal Care", sku: "FCL-150" },
];

// Demo brands, keyed by demo product id.
const DEMO_BRANDS: Record<number, string> = {
  1: "NatureWell", 2: "NatureWell", 3: "CleanCare", 4: "MediTech", 5: "HydraPlus", 6: "Dermaline", 7: "Dermaline",
};

// Product photos in public/products, keyed by demo product id. The first photo is the main one.
const DEMO_IMAGES: Record<number, string[]> = {
  7: ["/products/1.png", "/products/4.png", "/products/2.png"], // Body Lotion
  1: ["/products/2.png", "/products/1.png", "/products/4.png"], // Vitamin C
  2: ["/products/3.png", "/products/2.png"], // Omega-3
  3: ["/products/4.png", "/products/3.png"], // Hand Sanitizer
};

function fetchDemo(ids?: number[]): Product[] {
  return DEMO_PRODUCTS.filter((p) => !ids?.length || ids.includes(p.id)).map((p) => ({
    ...p,
    slug: makeSlug(p.name, p.id),
    currency: odooConfig.currency,
    imageUrl: DEMO_IMAGES[p.id]?.[0] ?? null,
    imageUrls: DEMO_IMAGES[p.id] ?? [],
    brand: DEMO_BRANDS[p.id] ?? null,
  }));
}

/* ----------------------------- Public API ----------------------------- */

/** Fetch products, optionally limited to specific ids. Used for listing and for server-side price/stock checks. */
export async function getProducts(ids?: number[]): Promise<Product[]> {
  return isDemoMode ? fetchDemo(ids) : fetchFromOdoo(ids);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const id = idFromSlug(slug);
  if (!id) return null;
  const [product] = await getProducts([id]);
  return product && product.slug === slug ? product : null;
}

export function getCategories(products: Product[]): string[] {
  return [...new Set(products.map((p) => p.category))].sort();
}
