// Live notifications for the staff admin.
//
// Runs as its own process next to `next dev` (npm run realtime). It watches the `notifications`
// collection with a MongoDB change stream and pushes each new notification to every connected admin
// who is allowed to see it. Connections are authenticated with the same signed admin cookie as the
// admin API, and a session that is signed out or deactivated is disconnected.

import { createHmac, timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { MongoClient, type ChangeStreamInsertDocument, type Db } from "mongodb";
import { WebSocket, WebSocketServer } from "ws";
import { permissionsFor, type Permission } from "../src/lib/admin/permissions";
import type { AdminDoc, NotificationDoc, SessionDoc } from "../src/lib/db/models";
import { toNotificationItem } from "../src/lib/notifications/item";

// Next.js loads .env.local on its own; this process has to do it itself.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local file: rely on the environment variables already set.
}

const PORT = Number(process.env.REALTIME_PORT ?? 4001);
const ADMIN_COOKIE = "admin_session";
const RECHECK_MS = 60_000;
const HEARTBEAT_MS = 30_000;
const allowedOrigins = new Set(
  (process.env.REALTIME_ALLOWED_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

const secret = process.env.SESSION_SECRET ?? process.env.PORTAL_SESSION_SECRET;
const mongoUri = process.env.MONGODB_URI;
if (!secret || !mongoUri) {
  console.error("[realtime] SESSION_SECRET and MONGODB_URI must be set (in .env.local). Not starting.");
  process.exit(1);
}

const mongo = new MongoClient(mongoUri, { appName: "realtime" });
await mongo.connect();
const db: Db = mongo.db(process.env.MONGODB_DB ?? "storefront");

type Connected = {
  socket: WebSocket;
  sessionId: string;
  adminId: string;
  permissions: Set<Permission>;
  alive: boolean;
};
const connected = new Set<Connected>();

/** The session id inside a signed cookie value, or null if the signature is wrong. Same rule as the admin API. */
function sessionIdFrom(value: string | undefined): string | null {
  if (!value) return null;
  const [id, signature] = value.split(".");
  if (!id || !signature) return null;
  const expected = createHmac("sha256", secret!).update(id).digest("base64url");
  const given = Buffer.from(signature);
  const want = Buffer.from(expected);
  return given.length === want.length && timingSafeEqual(given, want) ? id : null;
}

function cookieValue(header: string | undefined, name: string): string | undefined {
  for (const part of (header ?? "").split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return undefined;
}

/** Who a session belongs to and what they may see, or null if the session is missing, expired or deactivated. */
async function whoFor(sessionId: string): Promise<{ adminId: string; permissions: Permission[] } | null> {
  const session = await db.collection<SessionDoc>("sessions").findOne({ _id: sessionId, kind: "admin" });
  if (!session || session.expiresAt.getTime() <= Date.now()) return null;
  const admin = await db.collection<AdminDoc>("admins").findOne({ _id: session.subjectId }, { projection: { role: 1, active: 1 } });
  if (!admin || !admin.active) return null;
  return { adminId: session.subjectId, permissions: permissionsFor(admin.role) };
}

const httpServer = createServer((_request, response) => {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("realtime ok");
});
const wss = new WebSocketServer({ noServer: true });

// Authenticate before the WebSocket handshake completes. Rejected requests never get a connection.
httpServer.on("upgrade", (request: IncomingMessage, socket: Duplex, head: Buffer) => {
  void (async () => {
    const reject = (status: string) => {
      socket.write(`HTTP/1.1 ${status}\r\nConnection: close\r\n\r\n`);
      socket.destroy();
    };

    // Browsers send the Origin header on WebSocket requests. Refusing other origins stops a
    // malicious website from opening a live connection with the admin's cookie.
    const origin = request.headers.origin;
    if (!origin || !allowedOrigins.has(origin)) return reject("403 Forbidden");

    const sessionId = sessionIdFrom(cookieValue(request.headers.cookie, ADMIN_COOKIE));
    const who = sessionId ? await whoFor(sessionId) : null;
    if (!sessionId || !who) return reject("401 Unauthorized");

    wss.handleUpgrade(request, socket, head, (ws) => {
      const entry: Connected = {
        socket: ws,
        sessionId,
        adminId: who.adminId,
        permissions: new Set(who.permissions),
        alive: true,
      };
      connected.add(entry);
      ws.on("pong", () => {
        entry.alive = true;
      });
      ws.on("close", () => connected.delete(entry));
      ws.on("error", () => connected.delete(entry));
      ws.send(JSON.stringify({ type: "ready" }));
    });
  })().catch((error: unknown) => {
    console.error("[realtime] upgrade failed:", error);
    socket.destroy();
  });
});

// Pushes every new notification to the admins who may see it.
function watchNotifications(): void {
  const stream = db.collection<NotificationDoc>("notifications").watch([{ $match: { operationType: "insert" } }], {
    fullDocument: "updateLookup",
  });

  stream.on("change", (change) => {
    if (change.operationType !== "insert") return;
    const doc = (change as ChangeStreamInsertDocument<NotificationDoc>).fullDocument;
    for (const entry of connected) {
      if (!entry.permissions.has(doc.permission as Permission)) continue;
      if (entry.socket.readyState !== WebSocket.OPEN) continue;
      entry.socket.send(JSON.stringify({ type: "notification", item: toNotificationItem(doc, entry.adminId) }));
    }
  });

  // Change streams stop on network trouble or a failover. Reopen them rather than going silent.
  stream.on("error", (error: unknown) => {
    console.error("[realtime] change stream error, reconnecting:", error);
    void stream.close().catch(() => undefined);
    setTimeout(watchNotifications, 2000);
  });
}

// Heartbeat: drop connections that stopped answering pings (closed laptops, lost networks).
const heartbeat = setInterval(() => {
  for (const entry of connected) {
    if (!entry.alive) {
      entry.socket.terminate();
      connected.delete(entry);
      continue;
    }
    entry.alive = false;
    entry.socket.ping();
  }
}, HEARTBEAT_MS);

// Re-check sessions so signing out or deactivating a staff member takes effect within a minute.
const recheck = setInterval(() => {
  for (const entry of [...connected]) {
    void whoFor(entry.sessionId).then((who) => {
      if (!who) {
        entry.socket.close(4401, "Signed out");
        connected.delete(entry);
        return;
      }
      entry.permissions = new Set(who.permissions);
    });
  }
}, RECHECK_MS);

watchNotifications();
httpServer.listen(PORT, () => {
  console.log(`[realtime] listening on ws://localhost:${PORT}`);
});

function shutdown(): void {
  clearInterval(heartbeat);
  clearInterval(recheck);
  for (const entry of connected) entry.socket.close(1001, "Server stopping");
  httpServer.close();
  void mongo.close().finally(() => process.exit(0));
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
