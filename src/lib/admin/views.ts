import "server-only";
import { collections } from "@/lib/db/collections";
import { toPrescriptionView, type PrescriptionDoc, type PrescriptionView, type StatusEntry } from "@/lib/db/models";

export type Contact = { name: string; email: string; phone: string };

export type AdminPrescriptionView = PrescriptionView & {
  patientId: string | null;
  source: "portal" | "guest";
  contact: Contact;
  statusHistory: { status: StatusEntry["status"]; note: string; by: string; at: string }[];
};

/** Loads name, email and phone for the patients behind a list of prescriptions, in one query. */
export async function loadContacts(patientIds: (string | null)[]): Promise<Map<string, Contact>> {
  const ids = [...new Set(patientIds.filter((id): id is string => id !== null))];
  const contacts = new Map<string, Contact>();
  if (ids.length === 0) return contacts;

  const { users } = await collections();
  const docs = await users.find({ _id: { $in: ids } }, { projection: { name: 1, email: 1, phone: 1 } }).toArray();
  for (const doc of docs) {
    contacts.set(doc._id, { name: doc.name, email: doc.email, phone: doc.phone });
  }
  return contacts;
}

export function contactFor(doc: PrescriptionDoc, patients: Map<string, Contact>): Contact {
  if (doc.patientId) {
    return patients.get(doc.patientId) ?? { name: "(account removed)", email: "", phone: "" };
  }
  return doc.guest ?? { name: "", email: "", phone: "" };
}

export function toAdminPrescriptionView(doc: PrescriptionDoc, contact: Contact): AdminPrescriptionView {
  return {
    ...toPrescriptionView(doc),
    patientId: doc.patientId,
    source: doc.patientId ? "portal" : "guest",
    contact,
    statusHistory: doc.statusHistory.map((entry) => ({
      status: entry.status,
      note: entry.note,
      by: entry.by,
      at: entry.at.toISOString(),
    })),
  };
}

/** Escapes text typed into a search box so it is matched literally, not as a regular expression. */
export function searchPattern(text: string): { $regex: string; $options: string } {
  return { $regex: text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
}

export const PAGE_SIZE = 50;

export function pageFrom(url: URL): number {
  return Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
}
