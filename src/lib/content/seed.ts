import "server-only";
import { ARTICLE_CATEGORIES, ARTICLES } from "@/lib/articles";
import { BRANCHES } from "@/lib/branches";
import { collections } from "@/lib/db/collections";
import { getDb, isDuplicateKeyError } from "@/lib/db/mongo";
import { categorySlug } from "./names";

let seeding: Promise<void> | null = null;

/**
 * Copies the built-in content into MongoDB. Each part runs once per database, recorded by a flag, so
 * content an admin deletes does not come back on the next request.
 */
export function ensureContentSeeded(): Promise<void> {
  seeding ??= seedOnce().catch((error: unknown) => {
    seeding = null;
    throw error;
  });
  return seeding;
}

async function seedOnce(): Promise<void> {
  // Categories were added after the first release, so they have their own flag. Existing installs get them on first run.
  await runOnce("taxonomy-seeded", seedCategories);
  await runOnce("content-seeded", seedArticlesAndBranches);
}

async function runOnce(flag: string, task: () => Promise<void>): Promise<void> {
  const flags = (await getDb()).collection<{ _id: string; at: Date }>("site_meta");
  if (await flags.countDocuments({ _id: flag }, { limit: 1 })) return;
  await task();
  try {
    await flags.insertOne({ _id: flag, at: new Date() });
  } catch (error) {
    if (!isDuplicateKeyError(error)) throw error;
  }
}

async function seedCategories(): Promise<void> {
  const { articleCategories } = await collections();
  const now = new Date();
  await articleCategories
    .insertMany(
      ARTICLE_CATEGORIES.map((name) => ({ _id: categorySlug(name), name, createdAt: now, updatedAt: now })),
      { ordered: false },
    )
    .catch(ignoreDuplicates);
}

async function seedArticlesAndBranches(): Promise<void> {
  const { articles, branches } = await collections();
  const now = new Date();
  await articles
    .insertMany(
      ARTICLES.map(({ slug, ...article }) => ({ _id: slug, ...article, published: true, createdAt: now, updatedAt: now })),
      { ordered: false },
    )
    .catch(ignoreDuplicates);
  await branches
    .insertMany(
      BRANCHES.map(({ id, ...branch }) => ({ _id: id, ...branch, createdAt: now, updatedAt: now })),
      { ordered: false },
    )
    .catch(ignoreDuplicates);
}

function ignoreDuplicates(error: unknown): void {
  if (!isDuplicateKeyError(error)) throw error;
}
