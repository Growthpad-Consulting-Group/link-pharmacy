import "server-only";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

type R2Connection = { client: S3Client; bucket: string; publicUrl: string };

let connection: R2Connection | null | undefined;

/**
 * Cloudflare R2 through its S3-compatible API. Configured with environment variables, so the same code
 * works locally and in production. Returns null when any setting is missing.
 */
function getConnection(): R2Connection | null {
  if (connection !== undefined) return connection;

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    connection = null;
    return connection;
  }

  connection = {
    client: new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    }),
    bucket,
    publicUrl: publicUrl.replace(/\/+$/, ""),
  };
  return connection;
}

export function isObjectStorageConfigured(): boolean {
  return getConnection() !== null;
}

/** The object key behind a public address produced by putPublicObject, or null if it is not one of ours. */
export function objectKeyFromUrl(url: string): string | null {
  const conn = getConnection();
  if (!conn) return null;
  const prefix = `${conn.publicUrl}/`;
  return url.startsWith(prefix) ? url.slice(prefix.length) : null;
}

export async function deletePublicObject(key: string): Promise<void> {
  const conn = getConnection();
  if (!conn) return;
  await conn.client.send(new DeleteObjectCommand({ Bucket: conn.bucket, Key: key }));
}

/** Uploads an object and returns its public address. Keys must be unique; files are never overwritten. */
export async function putPublicObject(key: string, body: Buffer, contentType: string): Promise<string> {
  const conn = getConnection();
  if (!conn) throw new Error("Object storage is not configured");

  await conn.client.send(
    new PutObjectCommand({
      Bucket: conn.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return `${conn.publicUrl}/${key}`;
}
