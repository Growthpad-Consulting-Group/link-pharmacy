"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PatientView } from "@/lib/db/models";

const PatientContext = createContext<PatientView | null>(null);

export function PatientProvider({ patient, children }: { patient: PatientView; children: ReactNode }) {
  return <PatientContext.Provider value={patient}>{children}</PatientContext.Provider>;
}

/** The signed-in patient. Only valid inside the portal shell. */
export function usePatient(): PatientView {
  const patient = useContext(PatientContext);
  if (!patient) throw new Error("usePatient must be used inside the patient portal");
  return patient;
}
