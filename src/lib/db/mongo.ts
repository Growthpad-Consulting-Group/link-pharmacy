import "server-only";
import { MongoClient, type Db } from "mongodb";

// One client per server process, reused across requests and hot reloads.
const globalForMongo = globalThis as typeof globalThis & {
  __mongoClient?: Promise<MongoClient>;
  __mongoIndexes?: Promise<void>;
};

function connect(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add your MongoDB Atlas connection string to .env.local.");
  }
  if (!globalForMongo.__mongoClient) {
    globalForMongo.__mongoClient = new MongoClient(uri, { appName: "storefront", maxPoolSize: 10 })
      .connect()
      .catch((error: unknown) => {
        // Allow a retry on the next request instead of caching a failed connection forever.
        globalForMongo.__mongoClient = undefined;
        throw error;
      });
  }
  return globalForMongo.__mongoClient;
}

async function ensureIndexes(db: Db): Promise<void> {
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("admins").createIndex({ email: 1 }, { unique: true }),
    // MongoDB deletes sessions once expiresAt has passed.
    db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("prescriptions").createIndex({ reference: 1 }, { unique: true }),
    db.collection("prescriptions").createIndex({ patientId: 1, createdAt: -1 }),
    db.collection("prescriptions").createIndex({ status: 1, createdAt: -1 }),
    db.collection("audit_log").createIndex({ at: -1 }),
    db.collection("rate_limits").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("articles").createIndex({ published: 1, date: -1 }),
    db.collection("contact_messages").createIndex({ status: 1, createdAt: -1 }),
    db.collection("appointments").createIndex({ status: 1, createdAt: -1 }),
    db.collection("subscribers").createIndex({ status: 1, createdAt: -1 }),
    db.collection("orders").createIndex({ createdAt: -1 }),
    // Admin notifications are kept for 30 days, then removed by MongoDB.
    db.collection("notifications").createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 }),
    db.collection("notifications").createIndex({ permission: 1, createdAt: -1 }),
  ]);
}

export async function getDb(): Promise<Db> {
  const client = await connect();
  const db = client.db(process.env.MONGODB_DB ?? "storefront");
  if (!globalForMongo.__mongoIndexes) {
    globalForMongo.__mongoIndexes = ensureIndexes(db).catch((error: unknown) => {
      globalForMongo.__mongoIndexes = undefined;
      throw error;
    });
  }
  await globalForMongo.__mongoIndexes;
  return db;
}

/** MongoDB error code for a unique index violation (for example, an email already registered). */
export function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: unknown }).code === 11000;
}
