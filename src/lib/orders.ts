import "server-only";
import { callKw, isOdooConfigured, odooConfig } from "./odoo";
import { getProducts } from "./catalog";

export type Customer = {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  zip: string;
};

export type OrderLineInput = { productId: number; quantity: number };

export type PlacedOrder = {
  reference: string;
  total: number;
  currency: string;
  demo: boolean;
};

export class OrderError extends Error {}

/**
 * Validates lines against live Odoo data (prices and stock are never trusted from the client),
 * then creates a partner and a sales order in Odoo.
 */
export async function placeOrder(customer: Customer, lines: OrderLineInput[]): Promise<PlacedOrder> {
  const products = await getProducts(lines.map((l) => l.productId));
  const byId = new Map(products.map((p) => [p.id, p]));

  const resolved = lines.map((line) => {
    const product = byId.get(line.productId);
    if (!product) throw new OrderError(`Product ${line.productId} is no longer available`);
    if (product.stock < line.quantity) {
      throw new OrderError(
        product.stock === 0
          ? `${product.name} is out of stock`
          : `Only ${product.stock} of ${product.name} left in stock`,
      );
    }
    return { product, quantity: line.quantity };
  });

  const total = resolved.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  const currency = odooConfig.currency;

  if (!isOdooConfigured()) {
    return { reference: `DEMO-${Date.now().toString(36).toUpperCase()}`, total, currency, demo: true };
  }

  const partnerIds = await callKw<number[]>("res.partner", "create", [
    [
      {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        street: customer.street,
        city: customer.city,
        zip: customer.zip,
        customer_rank: 1,
      },
    ],
  ]);

  const orderIds = await callKw<number[]>("sale.order", "create", [
    [
      {
        partner_id: partnerIds[0],
        origin: "Online storefront",
        order_line: resolved.map(({ product, quantity }) => [
          0,
          0,
          { product_id: product.id, product_uom_qty: quantity },
        ]),
      },
    ],
  ]);
  const orderId = orderIds[0];

  if (odooConfig.confirmOrders) {
    await callKw("sale.order", "action_confirm", [[orderId]]);
  }

  const [order] = await callKw<{ name: string; amount_total: number }[]>("sale.order", "read", [
    [orderId],
    ["name", "amount_total"],
  ]);

  return {
    reference: order.name,
    total: order.amount_total,
    currency,
    demo: false,
  };
}
