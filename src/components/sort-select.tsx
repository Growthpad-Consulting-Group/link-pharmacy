"use client";

/** Sort dropdown that submits its enclosing GET form when changed, so the list re-sorts immediately. */
export function SortSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-ink">
      Sort by
      <select
        name="sort"
        defaultValue={defaultValue}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
      >
        <option value="name-asc">Name (A-Z)</option>
        <option value="name-desc">Name (Z-A)</option>
        <option value="price-asc">Price (low to high)</option>
        <option value="price-desc">Price (high to low)</option>
      </select>
    </label>
  );
}
