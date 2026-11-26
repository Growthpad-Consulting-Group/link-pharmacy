"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { FieldError, inputClass, type FieldIssues } from "@/components/portal/form-ui";
import { SERVICES, type Branch } from "@/lib/branches";
import { Alert, Panel } from "./format";
import { ApiError, apiFetch, errorMessage } from "./api";
import { DetailSkeleton, Spinner } from "./loading";

/** Creates a branch when `id` is undefined, otherwise edits the branch with that id. */
export function BranchEditor({ id }: { id?: string }) {
  const router = useRouter();
  const isNew = id === undefined;
  const [loaded, setLoaded] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<FieldIssues>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id === undefined) return;
    let cancelled = false;
    apiFetch<{ branch: Branch }>(`/api/admin/branches/${encodeURIComponent(id)}`)
      .then((result) => {
        if (!cancelled) setLoaded(result.branch);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isNew, id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      ...(isNew ? { id: String(form.get("id") ?? "").trim() } : {}),
      name: String(form.get("name") ?? "").trim(),
      address: String(form.get("address") ?? "").trim(),
      city: String(form.get("city") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      hours: String(form.get("hours") ?? "").trim(),
      services: form.getAll("services").map(String),
    };

    setSaving(true);
    setError(null);
    setIssues({});
    setMessage(null);
    try {
      if (id === undefined) {
        const result = await apiFetch<{ id: string }>("/api/admin/branches", { body: payload });
        router.push(`/admin/branches/${encodeURIComponent(result.id)}`);
        return;
      }
      await apiFetch(`/api/admin/branches/${encodeURIComponent(id)}`, { method: "PUT", body: payload });
      setMessage("Branch saved.");
    } catch (err) {
      setError(errorMessage(err));
      if (err instanceof ApiError) setIssues(err.issues);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id || !window.confirm("Remove this branch from the website?")) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/admin/branches/${encodeURIComponent(id)}`, { method: "DELETE" });
      router.push("/admin/branches");
    } catch (err) {
      setError(errorMessage(err));
      setDeleting(false);
    }
  }

  if (loading) return <DetailSkeleton />;
  if (!isNew && !loaded) return <Alert tone="error">{error ?? "Branch not found."}</Alert>;

  const branch = loaded;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/branches" className="text-sm font-semibold text-muted hover:text-ink">
          ← Back to branches
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-ink">{isNew ? "New branch" : branch?.name}</h1>
      </div>

      {message && <Alert tone="success">{message}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      <form key={branch?.id ?? "new"} onSubmit={handleSubmit} noValidate className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Panel title="Branch details">
          <div className="grid gap-5 sm:grid-cols-2">
            {isNew && (
              <label className="block text-sm font-medium text-ink sm:col-span-2">
                Short code <span className="font-normal text-muted">(lower-case, used in the address; cannot be changed later)</span>
                <input name="id" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="south" aria-invalid={Boolean(issues.id)} className={`${inputClass} font-mono text-sm`} />
                <FieldError messages={issues.id} />
              </label>
            )}
            <label className="block text-sm font-medium text-ink sm:col-span-2">
              Name
              <input name="name" defaultValue={branch?.name ?? ""} required aria-invalid={Boolean(issues.name)} className={inputClass} />
              <FieldError messages={issues.name} />
            </label>
            <label className="block text-sm font-medium text-ink sm:col-span-2">
              Street address
              <input name="address" defaultValue={branch?.address ?? ""} required aria-invalid={Boolean(issues.address)} className={inputClass} />
              <FieldError messages={issues.address} />
            </label>
            <label className="block text-sm font-medium text-ink">
              City
              <input name="city" defaultValue={branch?.city ?? ""} required aria-invalid={Boolean(issues.city)} className={inputClass} />
              <FieldError messages={issues.city} />
            </label>
            <label className="block text-sm font-medium text-ink">
              Phone
              <input name="phone" type="tel" defaultValue={branch?.phone ?? ""} required aria-invalid={Boolean(issues.phone)} className={inputClass} />
              <FieldError messages={issues.phone} />
            </label>
            <label className="block text-sm font-medium text-ink sm:col-span-2">
              Opening hours
              <input name="hours" defaultValue={branch?.hours ?? ""} required aria-invalid={Boolean(issues.hours)} className={inputClass} />
              <FieldError messages={issues.hours} />
            </label>
            <fieldset className="sm:col-span-2">
              <legend className="text-sm font-medium text-ink">Services</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {SERVICES.map((service) => (
                  <label key={service} className="flex items-center gap-3 text-sm text-ink">
                    <input
                      type="checkbox"
                      name="services"
                      value={service}
                      defaultChecked={branch?.services.includes(service) ?? false}
                      className="h-4 w-4 accent-ink"
                    />
                    {service}
                  </label>
                ))}
              </div>
              <FieldError messages={issues.services} />
            </fieldset>
          </div>
        </Panel>

        <aside className="space-y-4">
          <button
            type="submit"
            disabled={saving || deleting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 font-semibold text-white transition hover:bg-ink/85 disabled:cursor-wait disabled:opacity-70"
          >
            {saving && <Spinner />}
            {saving ? "Saving…" : isNew ? "Create branch" : "Save changes"}
          </button>
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving || deleting}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-rose-300 px-5 py-3 font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
            >
              {deleting && <Spinner />}
              {deleting ? "Removing…" : "Remove branch"}
            </button>
          )}
        </aside>
      </form>
    </div>
  );
}
