import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
};

// Prescriptions are health data. They are stored OUTSIDE the public folder and never served by the website.
// In production, replace this with encrypted object storage or your Odoo attachments.
const UPLOAD_DIR = process.env.PRESCRIPTION_UPLOAD_DIR ?? path.join(process.cwd(), ".prescription-uploads");

const fieldsSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  phone: z.string().trim().min(6).max(40),
  notes: z.string().trim().max(1000).optional().default(""),
  consent: z.literal("true"),
});

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const parsed = fieldsSchema.safeParse({
    name: form.get("name"),
    email: form.get("email"),
    phone: form.get("phone"),
    notes: form.get("notes") ?? "",
    consent: form.get("consent"),
  });
  if (!parsed.success) {
    const issues: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path.at(-1) ?? "form");
      (issues[key] ??= []).push(issue.message === "Invalid input: expected \"true\"" ? "Please confirm consent to continue" : issue.message);
    }
    return NextResponse.json({ error: "Please check the highlighted fields", issues }, { status: 422 });
  }

  const file = form.get("prescription");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Please choose your prescription file", issues: { prescription: ["Choose a file"] } }, { status: 422 });
  }
  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "This file type is not supported", issues: { prescription: ["Upload a JPG, PNG or PDF"] } },
      { status: 422 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "The file is too large", issues: { prescription: ["Files must be 10 MB or smaller"] } },
      { status: 422 },
    );
  }

  const reference = `RX-${randomUUID().slice(0, 8).toUpperCase()}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, `${reference}.${extension}`), bytes);

  // TODO: notify the pharmacy team and log the request against the customer record.
  console.info("[prescriptions] received", reference, "from", parsed.data.email);

  return NextResponse.json({ reference });
}
