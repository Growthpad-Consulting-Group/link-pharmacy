import "server-only";
import { collections } from "@/lib/db/collections";

/** Records who viewed or changed health data. Every admin read of a patient or file goes through here. */
export async function recordAudit(adminId: string, action: string, target: string, detail = ""): Promise<void> {
  const { auditLog } = await collections();
  await auditLog.insertOne({ at: new Date(), adminId, action, target, detail });
}
