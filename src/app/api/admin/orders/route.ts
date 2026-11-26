import { NextResponse } from "next/server";
import { authorize } from "@/lib/admin/session";
import { PAGE_SIZE, pageFrom } from "@/lib/admin/views";
import { collections } from "@/lib/db/collections";

/** Orders placed through checkout, newest first. Read-only: order changes happen in Odoo. */
export async function GET(request: Request) {
  const auth = await authorize("messages:read");
  if ("response" in auth) return auth.response;

  const page = pageFrom(new URL(request.url));
  const { orders } = await collections();
  const [docs, total] = await Promise.all([
    orders.find({}).sort({ createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).toArray(),
    orders.estimatedDocumentCount(),
  ]);

  return NextResponse.json({
    orders: docs.map((doc) => ({
      id: doc._id,
      reference: doc.reference,
      customer: doc.customer,
      lines: doc.lines,
      total: doc.total,
      currency: doc.currency,
      demo: doc.demo,
      createdAt: doc.createdAt.toISOString(),
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
  });
}
