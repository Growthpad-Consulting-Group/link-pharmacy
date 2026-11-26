"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState, type FormEvent } from "react";
import { inputClass } from "@/components/portal/form-ui";
import type { ManagedCategory, ManagedTag } from "@/lib/content/taxonomy";
import { Alert, Panel } from "./format";
import { Spinner, TableSkeleton } from "./loading";
import { apiFetch, errorMessage } from "./api";

/** Blog categories and tags: create, rename and delete. */
export function TopicsManager() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Categories & tags</h1>
        <p className="text-sm text-muted">
          Categories group articles on the blog. Tags are extra keywords readers can click to find related articles.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <CategoriesPanel />
        <TagsPanel />
      </div>
    </div>
  );
}

// ---- Shared row layout ----------------------------------------------------

type RowProps = {
  name: string;
  count: number;
  busy: boolean;
  deleteBlocked: boolean;
  blockedReason?: string;
  onRename: () => void;
  onDelete: () => void;
};

function Row({ name, count, busy, deleteBlocked, blockedReason, onRename, onDelete }: RowProps) {
  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink">{name}</p>
        <p className="text-xs text-muted">
          {count} {count === 1 ? "article" : "articles"}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={onRename}
          disabled={busy}
          aria-label={`Rename ${name}`}
          title="Rename"
          className="rounded-md p-2 text-muted transition hover:bg-slate-100 hover:text-ink disabled:opacity-40"
        >
          <Icon icon="lucide:pencil" className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy || deleteBlocked}
          aria-label={`Delete ${name}`}
          title={deleteBlocked ? blockedReason : "Delete"}
          className="rounded-md p-2 text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon icon="lucide:trash-2" className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </li>
  );
}

function InlineEdit({ value, busy, onChange, onSave, onCancel, label }: {
  value: string;
  busy: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  label: string;
}) {
  return (
    <form
      className="flex items-center gap-2 py-3"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        onSave();
      }}
    >
      <input aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputClass} py-2`} autoFocus />
      <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white hover:bg-ink/85 disabled:opacity-60">
        {busy && <Spinner />}
        Save
      </button>
      <button type="button" onClick={onCancel} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-ink hover:bg-slate-50">
        Cancel
      </button>
    </form>
  );
}

function AddForm({ label, placeholder, busy, onAdd }: { label: string; placeholder: string; busy: boolean; onAdd: (value: string) => Promise<boolean> }) {
  const [value, setValue] = useState("");
  return (
    <form
      className="flex gap-2"
      onSubmit={async (event) => {
        event.preventDefault();
        if (await onAdd(value)) setValue("");
      }}
    >
      <input aria-label={label} value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} className={`${inputClass} py-2`} />
      <button
        type="submit"
        disabled={busy || value.trim() === ""}
        className="inline-flex shrink-0 items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/85 disabled:opacity-60"
      >
        {busy && <Spinner />}
        Add
      </button>
    </form>
  );
}

// ---- Categories -----------------------------------------------------------

function CategoriesPanel() {
  const [items, setItems] = useState<ManagedCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);

  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ categories: ManagedCategory[] }>("/api/admin/categories")
      .then((result) => {
        if (!cancelled) setItems(result.categories);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  async function run(key: string, action: () => Promise<unknown>): Promise<boolean> {
    setBusy(key);
    setError(null);
    try {
      await action();
      setVersion((v) => v + 1);
      return true;
    } catch (err) {
      setError(errorMessage(err));
      return false;
    } finally {
      setBusy(null);
    }
  }

  return (
    <Panel title="Categories" action={items ? <span className="text-xs text-muted">{items.length} total</span> : undefined}>
      <div className="space-y-5">
        {error && <Alert tone="error">{error}</Alert>}
        <AddForm
          label="New category name"
          placeholder="For example: Travel health"
          busy={busy === "new"}
          onAdd={(name) => run("new", () => apiFetch("/api/admin/categories", { body: { name: name.trim() } }))}
        />

        {items === null ? (
          <TableSkeleton rows={4} />
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No categories yet. Add one above.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((category) =>
              editing?.id === category.id ? (
                <li key={category.id}>
                  <InlineEdit
                    label={`New name for ${category.name}`}
                    value={editing.name}
                    busy={busy === category.id}
                    onChange={(name) => setEditing({ id: category.id, name })}
                    onCancel={() => setEditing(null)}
                    onSave={async () => {
                      const ok = await run(category.id, () =>
                        apiFetch(`/api/admin/categories/${encodeURIComponent(category.id)}`, { method: "PATCH", body: { name: editing.name.trim() } }),
                      );
                      if (ok) setEditing(null);
                    }}
                  />
                </li>
              ) : (
                <Row
                  key={category.id}
                  name={category.name}
                  count={category.articleCount}
                  busy={busy !== null}
                  deleteBlocked={category.articleCount > 0}
                  blockedReason="Move its articles to another category before deleting it"
                  onRename={() => setEditing({ id: category.id, name: category.name })}
                  onDelete={() => {
                    if (!window.confirm(`Delete the category “${category.name}”?`)) return;
                    void run(category.id, () => apiFetch(`/api/admin/categories/${encodeURIComponent(category.id)}`, { method: "DELETE" }));
                  }}
                />
              ),
            )}
          </ul>
        )}
      </div>
    </Panel>
  );
}

// ---- Tags -----------------------------------------------------------------

function TagsPanel() {
  const [items, setItems] = useState<ManagedTag[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ name: string; value: string } | null>(null);

  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ tags: ManagedTag[] }>("/api/admin/tags")
      .then((result) => {
        if (!cancelled) setItems(result.tags);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  async function run(key: string, action: () => Promise<unknown>): Promise<boolean> {
    setBusy(key);
    setError(null);
    try {
      await action();
      setVersion((v) => v + 1);
      return true;
    } catch (err) {
      setError(errorMessage(err));
      return false;
    } finally {
      setBusy(null);
    }
  }

  return (
    <Panel title="Tags" action={items ? <span className="text-xs text-muted">{items.length} total</span> : undefined}>
      <div className="space-y-5">
        {error && <Alert tone="error">{error}</Alert>}
        <AddForm
          label="New tag"
          placeholder="For example: flu season"
          busy={busy === "new"}
          onAdd={(name) => run("new", () => apiFetch("/api/admin/tags", { body: { name: name.trim() } }))}
        />
        <p className="-mt-2 text-xs text-muted">Tags are stored in lower case. Renaming a tag to an existing one merges them.</p>

        {items === null ? (
          <TableSkeleton rows={4} />
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No tags yet. Add tags here or in the article editor.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((tag) =>
              editing?.name === tag.name ? (
                <li key={tag.name}>
                  <InlineEdit
                    label={`New name for ${tag.name}`}
                    value={editing.value}
                    busy={busy === tag.name}
                    onChange={(value) => setEditing({ name: tag.name, value })}
                    onCancel={() => setEditing(null)}
                    onSave={async () => {
                      const ok = await run(tag.name, () =>
                        apiFetch(`/api/admin/tags/${encodeURIComponent(tag.name)}`, { method: "PATCH", body: { name: editing.value.trim() } }),
                      );
                      if (ok) setEditing(null);
                    }}
                  />
                </li>
              ) : (
                <Row
                  key={tag.name}
                  name={`#${tag.name}`}
                  count={tag.articleCount}
                  busy={busy !== null}
                  deleteBlocked={false}
                  onRename={() => setEditing({ name: tag.name, value: tag.name })}
                  onDelete={() => {
                    const message = tag.articleCount > 0
                      ? `Remove the tag “${tag.name}” from ${tag.articleCount} ${tag.articleCount === 1 ? "article" : "articles"}?`
                      : `Delete the tag “${tag.name}”?`;
                    if (!window.confirm(message)) return;
                    void run(tag.name, () => apiFetch(`/api/admin/tags/${encodeURIComponent(tag.name)}`, { method: "DELETE" }));
                  }}
                />
              ),
            )}
          </ul>
        )}
      </div>
    </Panel>
  );
}
