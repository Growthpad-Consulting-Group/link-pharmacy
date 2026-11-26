import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { collections } from "@/lib/db/collections";
import { notify } from "@/lib/notifications/service";
import { OrderError, placeOrder } from "@/lib/orders";

const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.email().max(200),
    phone: z.string().trim().min(6).max(40),
    street: z.string().trim().min(3).max(200),
    city: z.string().trim().min(2).max(100),
    zip: z.string().trim().min(3).max(20),
  }),
  lines: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(50),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    // Key messages by field name (last path segment) so the form can highlight the right input.
    const issues: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path.at(-1) ?? "form");
      (issues[key] ??= []).push(issue.message);
    }
    return NextResponse.json(
      { error: "Please check the highlighted fields and try again", issues },
      { status: 422 },
    );
  }

  try {
    const order = await placeOrder(parsed.data.customer, parsed.data.lines);
    // Keep a copy in our own database for the admin orders log. Odoo already has the order, so a failure here
    // must not fail the customer's checkout.
    await collections()
      .then(({ orders }) =>
        orders.insertOne({
          _id: randomUUID(),
          reference: order.reference,
          customer: parsed.data.customer,
          lines: parsed.data.lines,
          total: order.total,
          currency: order.currency,
          demo: order.demo,
          createdAt: new Date(),
        }),
      )
      .catch((error: unknown) => console.error("[checkout] could not save order copy:", error));
    await notify({
      type: "order",
      title: `New online order ${order.reference}`,
      body: `${parsed.data.customer.name} · ${order.total} ${order.currency}`,
      href: "/admin/orders",
      permission: "messages:read",
    });
    return NextResponse.json({ order });
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error("[checkout] Odoo order failed:", err);
    return NextResponse.json(
      { error: "We could not place your order right now. Please try again shortly." },
      { status: 502 },
    );
  }
}
