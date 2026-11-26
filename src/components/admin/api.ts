export class ApiError extends Error {
  status: number;
  issues: Record<string, string[]>;

  constructor(message: string, status: number, issues: Record<string, string[]> = {}) {
    super(message);
    this.status = status;
    this.issues = issues;
  }
}

/** Calls the admin API. Throws ApiError with the server's message, status and field issues. */
export async function apiFetch<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const hasBody = options.body !== undefined;
  // FormData (file uploads) is sent as-is so the browser sets the multipart boundary.
  const form = options.body instanceof FormData ? options.body : null;
  const res = await fetch(path, {
    method: options.method ?? (hasBody ? "POST" : "GET"),
    headers: hasBody && !form ? { "Content-Type": "application/json" } : undefined,
    body: form ?? (hasBody ? JSON.stringify(options.body) : undefined),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error ?? "Something went wrong", res.status, data.issues ?? {});
  }
  return data as T;
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Network error. Please check your connection and try again.";
}
