import { Icon } from "@iconify/react";

export const inputClass =
  "mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-ink outline-none transition placeholder:text-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/40 aria-[invalid=true]:border-rose-400";

export type FieldIssues = Record<string, string[] | undefined>;

export function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.[0]) return null;
  return <span className="mt-1.5 block text-xs text-rose-600">{messages[0]}</span>;
}

export function FormAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-start gap-3 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      <Icon icon="lucide:circle-alert" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

export function FormSuccess({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="status" className="flex items-start gap-3 rounded-md border border-brand/40 bg-[#F4F8D5] px-4 py-3 text-sm text-ink">
      <Icon icon="lucide:circle-check" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      {message}
    </p>
  );
}
