import "server-only";
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { collections } from "@/lib/db/collections";
import type { SessionKind } from "@/lib/db/models";

export type SessionPolicy = { cookieName: string; kind: SessionKind; maxAgeSeconds: number };

// Patients stay signed in for a week. Admins get a shorter session because they can see every record.
export const PATIENT_SESSION: SessionPolicy = { cookieName: "portal_session", kind: "patient", maxAgeSeconds: 60 * 60 * 24 * 7 };
export const ADMIN_SESSION: SessionPolicy = { cookieName: "admin_session", kind: "admin", maxAgeSeconds: 60 * 60 * 12 };

const globalForSecret = globalThis as typeof globalThis & { __devSessionSecret?: string };

function signingSecret(): string {
  const configured = process.env.SESSION_SECRET ?? process.env.PORTAL_SESSION_SECRET;
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production.");
  }
  // Development only: a random secret per process. Restarting the server signs everyone out.
  globalForSecret.__devSessionSecret ??= randomBytes(32).toString("hex");
  return globalForSecret.__devSessionSecret;
}

function sign(value: string): string {
  return createHmac("sha256", signingSecret()).update(value).digest("base64url");
}

function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/** The session id from a signed cookie value, or null if the signature does not match. */
function sessionIdFrom(value: string | undefined): string | null {
  if (!value) return null;
  const [id, signature] = value.split(".");
  if (!id || !signature) return null;
  const given = Buffer.from(signature);
  const expected = Buffer.from(sign(id));
  return given.length === expected.length && timingSafeEqual(given, expected) ? id : null;
}

/** Stores a new session in MongoDB and sets its signed cookie. The cookie holds only the random id. */
export async function startSession(response: NextResponse, policy: SessionPolicy, subjectId: string): Promise<void> {
  const id = randomUUID();
  const { sessions } = await collections();
  await sessions.insertOne({
    _id: id,
    kind: policy.kind,
    subjectId,
    expiresAt: new Date(Date.now() + policy.maxAgeSeconds * 1000),
  });
  response.cookies.set(policy.cookieName, `${id}.${sign(id)}`, cookieOptions(policy.maxAgeSeconds));
}

/** Deletes the session in MongoDB, so a copied cookie stops working, and clears the cookie. */
export async function endSession(response: NextResponse, policy: SessionPolicy): Promise<void> {
  const id = sessionIdFrom((await cookies()).get(policy.cookieName)?.value);
  if (id) {
    const { sessions } = await collections();
    await sessions.deleteOne({ _id: id, kind: policy.kind });
  }
  response.cookies.set(policy.cookieName, "", cookieOptions(0));
}

/** The user or admin id behind the current request's cookie, or null if signed out or expired. */
export async function currentSubjectId(policy: SessionPolicy): Promise<string | null> {
  const id = sessionIdFrom((await cookies()).get(policy.cookieName)?.value);
  if (!id) return null;
  const { sessions } = await collections();
  const session = await sessions.findOne({ _id: id, kind: policy.kind });
  if (!session || session.expiresAt.getTime() <= Date.now()) return null;
  return session.subjectId;
}
