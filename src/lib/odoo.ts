/**
 * Minimal Odoo client using the external JSON-RPC API (available on Odoo 16+ at /jsonrpc).
 * Server-only: never import this from a client component, the API key must stay on the server.
 */

type JsonRpcResponse<T> = {
  result?: T;
  error?: { message: string; data?: { message?: string } };
};

const url = process.env.ODOO_URL?.replace(/\/$/, "");
const db = process.env.ODOO_DB;
const username = process.env.ODOO_USERNAME;
const apiKey = process.env.ODOO_API_KEY;

export const odooConfig = {
  url,
  db,
  currency: process.env.ODOO_CURRENCY ?? "USD",
  confirmOrders: process.env.ODOO_CONFIRM_ORDERS === "true",
};

/**
 * Odoo is OFF by default. The storefront runs on demo data and creates no Odoo records
 * unless ODOO_ENABLED=true AND the connection variables are set.
 */
export function isOdooConfigured(): boolean {
  return process.env.ODOO_ENABLED === "true" && Boolean(url && db && username && apiKey);
}

async function rpc<T>(service: "common" | "object", method: string, args: unknown[]): Promise<T> {
  if (!url) throw new Error("ODOO_URL is not set");

  const res = await fetch(`${url}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: { service, method, args },
      id: Date.now(),
    }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Odoo responded with HTTP ${res.status}`);

  const json = (await res.json()) as JsonRpcResponse<T>;
  if (json.error) {
    throw new Error(json.error.data?.message ?? json.error.message);
  }
  return json.result as T;
}

let uidPromise: Promise<number> | null = null;

function getUid(): Promise<number> {
  if (!uidPromise) {
    uidPromise = rpc<number | false>("common", "authenticate", [db, username, apiKey, {}])
      .then((uid) => {
        if (!uid) throw new Error("Odoo authentication failed: check ODOO_DB, ODOO_USERNAME and ODOO_API_KEY");
        return uid;
      })
      .catch((err) => {
        uidPromise = null; // allow a retry on the next call
        throw err;
      });
  }
  return uidPromise;
}

/** Call any model method, e.g. callKw("product.product", "search_read", [domain], { fields, limit }). */
export async function callKw<T>(
  model: string,
  method: string,
  args: unknown[] = [],
  kwargs: Record<string, unknown> = {},
): Promise<T> {
  const uid = await getUid();
  return rpc<T>("object", "execute_kw", [db, uid, apiKey, model, method, args, kwargs]);
}
