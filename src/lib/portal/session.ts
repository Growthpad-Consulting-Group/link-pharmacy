import "server-only";
import { PATIENT_SESSION, currentSubjectId } from "@/lib/auth/sessions";
import { collections } from "@/lib/db/collections";
import { toPatientView, type PatientView } from "@/lib/db/models";

export function getSessionUserId(): Promise<string | null> {
  return currentSubjectId(PATIENT_SESSION);
}

/** The signed-in patient, or null. Used by server components and route handlers. */
export async function getCurrentPatient(): Promise<PatientView | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const { users } = await collections();
  const doc = await users.findOne({ _id: userId }, { projection: { passwordHash: 0 } });
  return doc ? toPatientView(doc) : null;
}
