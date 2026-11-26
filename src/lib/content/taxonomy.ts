import "server-only";
import { collections } from "@/lib/db/collections";
import { isDuplicateKeyError } from "@/lib/db/mongo";
import { categorySlug, normaliseTag } from "./names";
import { ensureContentSeeded } from "./seed";

export type CategoryOption = { id: string; name: string };
export type ManagedCategory = CategoryOption & { articleCount: number };
export type ManagedTag = { name: string; articleCount: number };

export type TaxonomyResult = { ok: true } | { ok: false; status: 404 | 409 | 422; message: string };

const fail = (status: 404 | 409 | 422, message: string): TaxonomyResult => ({ ok: false, status, message });

// ---- Categories ---------------------------------------------------------

/** Categories for the public blog and the article form, sorted by name. */
export async function listCategories(): Promise<CategoryOption[]> {
  await ensureContentSeeded();
  const { articleCategories } = await collections();
  const docs = await articleCategories.find({}).sort({ name: 1 }).toArray();
  return docs.map((doc) => ({ id: doc._id, name: doc.name }));
}

export async function listManagedCategories(): Promise<ManagedCategory[]> {
  const categories = await listCategories();
  const { articles } = await collections();
  const counts = await articles
    .aggregate<{ _id: string; count: number }>([{ $group: { _id: "$category", count: { $sum: 1 } } }])
    .toArray();
  const byName = new Map(counts.map((row) => [row._id, row.count]));
  return categories.map((category) => ({ ...category, articleCount: byName.get(category.name) ?? 0 }));
}

export async function categoryExists(name: string): Promise<boolean> {
  await ensureContentSeeded();
  const { articleCategories } = await collections();
  return (await articleCategories.countDocuments({ name }, { limit: 1 })) > 0;
}

export async function createCategory(name: string): Promise<TaxonomyResult> {
  await ensureContentSeeded();
  const id = categorySlug(name);
  if (!id) return fail(422, "Use letters or numbers in the name");

  const { articleCategories } = await collections();
  const now = new Date();
  try {
    await articleCategories.insertOne({ _id: id, name, createdAt: now, updatedAt: now });
    return { ok: true };
  } catch (error) {
    if (isDuplicateKeyError(error)) return fail(409, "A category with this name already exists");
    throw error;
  }
}

/** Renames a category and moves every article in it to the new name. The category's id stays the same. */
export async function renameCategory(id: string, name: string): Promise<TaxonomyResult> {
  await ensureContentSeeded();
  const { articleCategories, articles } = await collections();
  const current = await articleCategories.findOne({ _id: id });
  if (!current) return fail(404, "Category not found");
  if (current.name === name) return { ok: true };

  const newSlug = categorySlug(name);
  if (!newSlug) return fail(422, "Use letters or numbers in the name");
  if (newSlug !== id && (await articleCategories.findOne({ _id: newSlug }))) {
    return fail(409, "A category with this name already exists");
  }

  await articleCategories.updateOne({ _id: id }, { $set: { name, updatedAt: new Date() } });
  await articles.updateMany({ category: current.name }, { $set: { category: name } });
  return { ok: true };
}

/** Deletes a category. Refused while articles still use it, so no article is left without a category. */
export async function deleteCategory(id: string): Promise<TaxonomyResult> {
  await ensureContentSeeded();
  const { articleCategories, articles } = await collections();
  const current = await articleCategories.findOne({ _id: id });
  if (!current) return fail(404, "Category not found");

  const inUse = await articles.countDocuments({ category: current.name });
  if (inUse > 0) {
    return fail(409, `${inUse} ${inUse === 1 ? "article uses" : "articles use"} this category. Move ${inUse === 1 ? "it" : "them"} to another category first.`);
  }
  await articleCategories.deleteOne({ _id: id });
  return { ok: true };
}

// ---- Tags ---------------------------------------------------------------

export async function listManagedTags(): Promise<ManagedTag[]> {
  await ensureContentSeeded();
  const { articleTags, articles } = await collections();
  const tags = await articleTags.find({}).sort({ name: 1 }).toArray();
  const counts = await articles
    .aggregate<{ _id: string; count: number }>([{ $unwind: "$tags" }, { $group: { _id: "$tags", count: { $sum: 1 } } }])
    .toArray();
  const byName = new Map(counts.map((row) => [row._id, row.count]));
  return tags.map((tag) => ({ name: tag.name, articleCount: byName.get(tag.name) ?? 0 }));
}

/** Makes sure each tag exists in the tag list. Called whenever an article is saved. */
export async function ensureTags(names: string[]): Promise<void> {
  if (names.length === 0) return;
  const { articleTags } = await collections();
  const now = new Date();
  for (const name of names) {
    await articleTags
      .updateOne({ _id: name }, { $setOnInsert: { name, createdAt: now } }, { upsert: true })
      .catch((error: unknown) => {
        if (!isDuplicateKeyError(error)) throw error;
      });
  }
}

export async function createTag(input: string): Promise<TaxonomyResult> {
  await ensureContentSeeded();
  const name = normaliseTag(input);
  if (!name) return fail(422, "Enter a tag");

  const { articleTags } = await collections();
  if (await articleTags.findOne({ _id: name })) return fail(409, "This tag already exists");
  await ensureTags([name]);
  return { ok: true };
}

/**
 * Renames a tag on every article. If the new name is already a tag, the two are merged.
 * Tags are identified by their name, so the id in the URL is the current name.
 */
export async function renameTag(oldName: string, input: string): Promise<TaxonomyResult> {
  await ensureContentSeeded();
  const newName = normaliseTag(input);
  if (!newName) return fail(422, "Enter a tag");

  const { articleTags, articles } = await collections();
  if (!(await articleTags.findOne({ _id: oldName }))) return fail(404, "Tag not found");
  if (newName === oldName) return { ok: true };

  await ensureTags([newName]);
  await articles.updateMany({ tags: oldName }, { $addToSet: { tags: newName } });
  await articles.updateMany({ tags: oldName }, { $pull: { tags: oldName } });
  await articleTags.deleteOne({ _id: oldName });
  return { ok: true };
}

export async function deleteTag(name: string): Promise<TaxonomyResult> {
  await ensureContentSeeded();
  const { articleTags, articles } = await collections();
  if (!(await articleTags.findOne({ _id: name }))) return fail(404, "Tag not found");

  await articles.updateMany({ tags: name }, { $pull: { tags: name } });
  await articleTags.deleteOne({ _id: name });
  return { ok: true };
}
