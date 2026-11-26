import "server-only";
import type { Article } from "@/lib/articles";
import type { Branch } from "@/lib/branches";
import { collections } from "@/lib/db/collections";
import { isDuplicateKeyError } from "@/lib/db/mongo";
import type { ArticleDoc, BranchDoc } from "@/lib/db/models";
import { blocksToHtml, sanitizeArticleHtml } from "./html";
import { ensureContentSeeded } from "./seed";
import { ensureTags } from "./taxonomy";

export { ensureContentSeeded };

export type ArticleInput = {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
  html: string;
  published: boolean;
};

export type BranchInput = {
  name: string;
  address: string;
  city: string;
  phone: string;
  hours: string;
  services: string[];
};

/** An article as shown on the blog: its text is sanitized HTML. */
export type ArticleContent = Omit<Article, "body"> & { html: string; tags: string[] };
export type ManagedArticle = ArticleContent & { published: boolean };

function toArticle(doc: ArticleDoc): ManagedArticle {
  return {
    slug: doc._id,
    title: doc.title,
    excerpt: doc.excerpt,
    category: doc.category,
    date: doc.date,
    readTime: doc.readTime,
    image: doc.image,
    tags: doc.tags ?? [],
    // Sanitized again on the way out, so content saved before sanitizing existed is also safe to show.
    html: sanitizeArticleHtml(doc.html ?? blocksToHtml(doc.body ?? [])),
    published: doc.published,
  };
}

function toBranch(doc: BranchDoc): Branch {
  return { id: doc._id, name: doc.name, address: doc.address, city: doc.city, phone: doc.phone, hours: doc.hours, services: doc.services };
}

// ---- Articles -----------------------------------------------------------

/** Published articles, newest first. Used by the public blog. */
export async function listPublishedArticles(): Promise<ArticleContent[]> {
  await ensureContentSeeded();
  const { articles } = await collections();
  const docs = await articles.find({ published: true }).sort({ date: -1 }).toArray();
  return docs.map(toArticle);
}

/** Every article including drafts, newest first. Used by the admin. */
export async function listAllArticles(): Promise<ManagedArticle[]> {
  await ensureContentSeeded();
  const { articles } = await collections();
  const docs = await articles.find({}).sort({ date: -1 }).toArray();
  return docs.map(toArticle);
}

export async function getPublishedArticle(slug: string): Promise<ArticleContent | null> {
  await ensureContentSeeded();
  const { articles } = await collections();
  const doc = await articles.findOne({ _id: slug, published: true });
  return doc ? toArticle(doc) : null;
}

export async function getArticleForEdit(slug: string): Promise<ManagedArticle | null> {
  await ensureContentSeeded();
  const { articles } = await collections();
  const doc = await articles.findOne({ _id: slug });
  return doc ? toArticle(doc) : null;
}

/** Creates an article. Returns false if the slug is already taken. */
export async function createArticle(slug: string, input: ArticleInput): Promise<boolean> {
  await ensureContentSeeded();
  const { articles } = await collections();
  const now = new Date();
  try {
    await articles.insertOne({ _id: slug, ...input, createdAt: now, updatedAt: now });
  } catch (error) {
    if (isDuplicateKeyError(error)) return false;
    throw error;
  }
  await ensureTags(input.tags);
  return true;
}

export async function updateArticle(slug: string, input: ArticleInput): Promise<boolean> {
  await ensureContentSeeded();
  const { articles } = await collections();
  // $unset drops the legacy block body once an article is saved in the editor.
  const result = await articles.updateOne({ _id: slug }, { $set: { ...input, updatedAt: new Date() }, $unset: { body: "" } });
  if (result.matchedCount === 0) return false;
  await ensureTags(input.tags);
  return true;
}

export async function deleteArticle(slug: string): Promise<boolean> {
  await ensureContentSeeded();
  const { articles } = await collections();
  const result = await articles.deleteOne({ _id: slug });
  return result.deletedCount > 0;
}

// ---- Branches -----------------------------------------------------------

export async function listBranches(): Promise<Branch[]> {
  await ensureContentSeeded();
  const { branches } = await collections();
  const docs = await branches.find({}).sort({ name: 1 }).toArray();
  return docs.map(toBranch);
}

export async function getBranch(id: string): Promise<Branch | null> {
  await ensureContentSeeded();
  const { branches } = await collections();
  const doc = await branches.findOne({ _id: id });
  return doc ? toBranch(doc) : null;
}

export async function createBranch(id: string, input: BranchInput): Promise<boolean> {
  await ensureContentSeeded();
  const { branches } = await collections();
  const now = new Date();
  try {
    await branches.insertOne({ _id: id, ...input, createdAt: now, updatedAt: now });
    return true;
  } catch (error) {
    if (isDuplicateKeyError(error)) return false;
    throw error;
  }
}

export async function updateBranch(id: string, input: BranchInput): Promise<boolean> {
  await ensureContentSeeded();
  const { branches } = await collections();
  const result = await branches.updateOne({ _id: id }, { $set: { ...input, updatedAt: new Date() } });
  return result.matchedCount > 0;
}

export async function deleteBranch(id: string): Promise<boolean> {
  await ensureContentSeeded();
  const { branches } = await collections();
  const result = await branches.deleteOne({ _id: id });
  return result.deletedCount > 0;
}
