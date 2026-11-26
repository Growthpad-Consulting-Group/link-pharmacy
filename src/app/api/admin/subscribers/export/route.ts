import { recordAudit } from "@/lib/admin/audit";
import { authorize } from "@/lib/admin/session";
import { collections } from "@/lib/db/collections";

// Spreadsheets treat cells that start with these characters as formulas, so they are prefixed with a quote.
function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** Downloads subscribers as a CSV file. Every export is recorded in the audit log. */
export async function GET() {
  const auth = await authorize("messages:manage");
  if ("response" in auth) return auth.response;

  const { subscribers } = await collections();
  const docs = await subscribers.find({}).sort({ createdAt: 1 }).toArray();
  const rows = [
    ["email", "status", "source", "subscribed_on"].join(","),
    ...docs.map((doc) =>
      [csvCell(doc.email), csvCell(doc.status), csvCell(doc.source), csvCell(doc.createdAt.toISOString().slice(0, 10))].join(","),
    ),
  ];

  await recordAudit(auth.admin.id, "subscribers.export", "subscribers", String(docs.length));
  const date = new Date().toISOString().slice(0, 10);
  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="newsletter-subscribers-${date}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
