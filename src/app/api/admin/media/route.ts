import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/admin/audit";
import { authorize } from "@/lib/admin/session";
import { checkMediaFile, listMedia, uploadMedia } from "@/lib/media/service";

/** Recent uploads for the media library picker. */
export async function GET() {
  const auth = await authorize("content:manage");
  if ("response" in auth) return auth.response;
  return NextResponse.json({ media: await listMedia() });
}

/** Uploads one image to R2. Expects multipart form data with a `file` field. */
export async function POST(request: Request) {
  const auth = await authorize("content:manage");
  if ("response" in auth) return auth.response;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image to upload", issues: { file: ["Choose an image to upload"] } }, { status: 422 });
  }

  const problem = checkMediaFile(file);
  if (problem) {
    return NextResponse.json({ error: problem, issues: { file: [problem] } }, { status: 422 });
  }

  const result = await uploadMedia(file, auth.admin.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.message, issues: { file: [result.message] } }, { status: result.status });
  }

  await recordAudit(auth.admin.id, "media.upload", result.item.id, result.item.originalName);
  return NextResponse.json({ item: result.item }, { status: 201 });
}
