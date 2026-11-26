"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { FieldError, inputClass, type FieldIssues } from "@/components/portal/form-ui";
import { Icon } from "@iconify/react";
import type { ManagedArticle } from "@/lib/content/store";
import { TAG_MAX_LENGTH, normaliseTag } from "@/lib/content/names";
import { Alert, Panel } from "./format";
import { Spinner, DetailSkeleton } from "./loading";
import { ApiError, apiFetch, errorMessage } from "./api";
import { MediaPicker } from "./media-picker";
import { RichTextEditor } from "./rich-text-editor";

const DEFAULT_IMAGE = "/consultation-image.webp";

/** Category choices come from the Categories & tags screen, so the list is always current. */
function CategorySelect({ initial, error }: { initial: string; error?: string }) {
  const [value, setValue] = useState(initial);
  const [names, setNames] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ categories: { name: string }[] }>("/api/admin/categories")
      .then((result) => {
        if (!cancelled) setNames(result.categories.map((category) => category.name));
      })
      .catch(() => {
        if (!cancelled) setNames([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Keeps an article's current category selectable even if it is missing from the list.
  const options = names ? [...names] : [];
  if (value && !options.includes(value)) options.unshift(value);

  return (
    <label className="block text-sm font-medium text-ink">
      Category
      <select name="category" value={value} onChange={(e) => setValue(e.target.value)} required className={inputClass}>
        {!value && <option value="">Choose a category</option>}
        {options.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      {names !== null && names.length === 0 && (
        <span className="mt-1.5 block text-xs font-normal text-amber-700">No categories yet. Add one in Categories & tags.</span>
      )}
      <FieldError messages={error ? [error] : undefined} />
    </label>
  );
}

/** Tags are typed and confirmed with Enter or a comma. Existing tags are suggested as you type. */
function TagsField({ initial, error }: { initial: string[]; error?: string }) {
  const [tags, setTags] = useState(initial);
  const [draft, setDraft] = useState("");
  const [known, setKnown] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ tags: { name: string }[] }>("/api/admin/tags")
      .then((result) => {
        if (!cancelled) setKnown(result.tags.map((tag) => tag.name));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  function add(value: string) {
    const tag = normaliseTag(value);
    if (!tag || tag.length > TAG_MAX_LENGTH || tags.includes(tag) || tags.length >= 20) return;
    setTags([...tags, tag]);
    setDraft("");
  }

  return (
    <div className="block text-sm font-medium text-ink">
      <span>Tags</span>
      <div className={`mt-1.5 flex flex-wrap items-center gap-2 rounded-md border bg-white p-2 ${error ? "border-rose-400" : "border-slate-300"}`}>
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-[#F4F8D5] py-1 pl-2.5 pr-1 text-sm font-semibold text-ink">
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => setTags(tags.filter((item) => item !== tag))}
              className="rounded p-0.5 text-ink/60 hover:bg-white hover:text-ink"
            >
              <Icon icon="lucide:x" className="h-3.5 w-3.5" aria-hidden />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
              setTags(tags.slice(0, -1));
            }
          }}
          onBlur={() => add(draft)}
          list="article-tag-suggestions"
          placeholder={tags.length === 0 ? "Type a tag and press Enter" : ""}
          aria-label="Add a tag"
          maxLength={TAG_MAX_LENGTH}
          className="min-w-[10rem] flex-1 bg-transparent py-1 text-sm font-normal text-ink outline-none placeholder:text-muted"
        />
      </div>
      <datalist id="article-tag-suggestions">
        {known
          .filter((name) => !tags.includes(name))
          .map((name) => (
            <option key={name} value={name} />
          ))}
      </datalist>
      {tags.map((tag) => (
        <input key={tag} type="hidden" name="tags" value={tag} />
      ))}
      <span className="mt-1.5 block text-xs font-normal text-muted">Readers can click a tag to find related articles.</span>
      <FieldError messages={error ? [error] : undefined} />
    </div>
  );
}

/** The article's picture on the blog list and at the top of the article, chosen from the media library. */
function CoverImageField({ initial, error }: { initial: string; error?: string }) {
  const [image, setImage] = useState(initial);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="block text-sm font-medium text-ink">
      <span>Cover image</span>
      <input type="hidden" name="image" value={image} />
      <div className={`mt-1.5 flex items-center gap-3 rounded-md border bg-slate-50 p-3 ${error ? "border-rose-400" : "border-slate-300"}`}>
        <span className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="h-full w-full object-contain" />
        </span>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-slate-100"
        >
          <Icon icon="lucide:image" className="h-4 w-4" aria-hidden />
          Change image
        </button>
      </div>
      <FieldError messages={error ? [error] : undefined} />
      <MediaPicker
        open={pickerOpen}
        title="Choose a cover image"
        showAlt={false}
        onClose={() => setPickerOpen(false)}
        onPick={(picked) => {
          setImage(picked.url);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

/** Creates a new article when `slug` is undefined, otherwise edits the article with that slug. */
export function ArticleEditor({ slug }: { slug?: string }) {
  const router = useRouter();
  const isNew = slug === undefined;
  const [loaded, setLoaded] = useState<ManagedArticle | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<FieldIssues>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (slug === undefined) return;
    let cancelled = false;
    apiFetch<{ article: ManagedArticle }>(`/api/admin/articles/${encodeURIComponent(slug)}`)
      .then((result) => {
        if (!cancelled) setLoaded(result.article);
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
  }, [isNew, slug]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      ...(isNew ? { slug: String(form.get("slug") ?? "").trim() } : {}),
      title: String(form.get("title") ?? "").trim(),
      excerpt: String(form.get("excerpt") ?? "").trim(),
      category: String(form.get("category") ?? ""),
      date: String(form.get("date") ?? ""),
      readTime: String(form.get("readTime") ?? "").trim(),
      image: String(form.get("image") ?? "").trim(),
      html: String(form.get("html") ?? ""),
      tags: form.getAll("tags").map(String),
      published: form.get("published") === "on",
    };

    setSaving(true);
    setError(null);
    setIssues({});
    setMessage(null);
    try {
      if (slug === undefined) {
        const result = await apiFetch<{ slug: string }>("/api/admin/articles", { body: payload });
        router.push(`/admin/articles/${encodeURIComponent(result.slug)}`);
        return;
      }
      await apiFetch(`/api/admin/articles/${encodeURIComponent(slug)}`, { method: "PUT", body: payload });
      setMessage("Article saved.");
    } catch (err) {
      setError(errorMessage(err));
      if (err instanceof ApiError) setIssues(err.issues);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!slug || !window.confirm("Delete this article permanently? It will disappear from the blog.")) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/admin/articles/${encodeURIComponent(slug)}`, { method: "DELETE" });
      router.push("/admin/articles");
    } catch (err) {
      setError(errorMessage(err));
      setDeleting(false);
    }
  }

  if (loading) return <DetailSkeleton />;
  if (!isNew && !loaded) return <Alert tone="error">{error ?? "Article not found."}</Alert>;

  const article = loaded;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/articles" className="text-sm font-semibold text-muted hover:text-ink">
          ← Back to health blog
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-ink">{isNew ? "New article" : article?.title}</h1>
        {!isNew && article && (
          <p className="text-sm text-muted">
            Public address: <span className="font-semibold text-ink">/blog/{article.slug}</span>
            {" · "}
            <a href={`/blog/${article.slug}`} target="_blank" rel="noreferrer" className="font-semibold text-ink underline">
              View on site
            </a>
          </p>
        )}
      </div>

      {message && <Alert tone="success">{message}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      <form key={article?.slug ?? "new"} onSubmit={handleSubmit} noValidate className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Panel title="Content">
            <div className="space-y-5">
              <label className="block text-sm font-medium text-ink">
                Title
                <input name="title" defaultValue={article?.title ?? ""} required aria-invalid={Boolean(issues.title)} className={inputClass} />
                <FieldError messages={issues.title} />
              </label>
              <label className="block text-sm font-medium text-ink">
                Summary <span className="font-normal text-muted">(shown on the blog list)</span>
                <textarea name="excerpt" rows={2} defaultValue={article?.excerpt ?? ""} required aria-invalid={Boolean(issues.excerpt)} className={`${inputClass} resize-y`} />
                <FieldError messages={issues.excerpt} />
              </label>
              <div className="space-y-1.5">
                <span className="block text-sm font-medium text-ink">Article text</span>
                <RichTextEditor key={article?.slug ?? "new"} initialHtml={article?.html ?? ""} error={issues.html?.[0]} />
              </div>
            </div>
          </Panel>
        </div>

        <aside className="space-y-6">
          <Panel title="Publishing">
            <div className="space-y-5">
              {isNew && (
                <label className="block text-sm font-medium text-ink">
                  Web address
                  <input
                    name="slug"
                    required
                    placeholder="understanding-cholesterol"
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    aria-invalid={Boolean(issues.slug)}
                    className={`${inputClass} font-mono text-sm`}
                  />
                  <span className="mt-1.5 block text-xs text-muted">Lower-case letters, numbers and hyphens. Cannot be changed later.</span>
                  <FieldError messages={issues.slug} />
                </label>
              )}
              <label className="flex items-center gap-3 text-sm font-medium text-ink">
                <input name="published" type="checkbox" defaultChecked={article?.published ?? true} className="h-4 w-4 accent-ink" />
                Published (visible on the blog)
              </label>
              <CategorySelect initial={article?.category ?? ""} error={issues.category?.[0]} />
              <TagsField initial={article?.tags ?? []} error={issues.tags?.[0]} />
              <label className="block text-sm font-medium text-ink">
                Date
                <input name="date" type="date" defaultValue={article?.date ?? new Date().toISOString().slice(0, 10)} required className={inputClass} />
                <FieldError messages={issues.date} />
              </label>
              <label className="block text-sm font-medium text-ink">
                Read time
                <input name="readTime" defaultValue={article?.readTime ?? "5 min read"} required className={inputClass} />
                <FieldError messages={issues.readTime} />
              </label>
              <CoverImageField initial={article?.image ?? DEFAULT_IMAGE} error={issues.image?.[0]} />

            </div>
          </Panel>

          <button
            type="submit"
            disabled={saving || deleting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 font-semibold text-white transition hover:bg-ink/85 disabled:cursor-wait disabled:opacity-70"
          >
            {saving && <Spinner />}
            {saving ? "Saving…" : isNew ? "Create article" : "Save changes"}
          </button>

          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving || deleting}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-rose-300 px-5 py-3 font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
            >
              {deleting && <Spinner />}
              {deleting ? "Deleting…" : "Delete article"}
            </button>
          )}
        </aside>
      </form>
    </div>
  );
}
