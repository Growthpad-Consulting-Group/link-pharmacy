"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Icon } from "@iconify/react";
import { FieldError, inputClass, type FieldIssues } from "@/components/portal/form-ui";
import { Avatar } from "@/components/avatar-upload";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/admin/permissions";
import { ADMIN_ROLES, type AdminRole, type AdminView } from "@/lib/db/models";
import { useAdmin, can } from "./admin-context";
import { Alert, Panel, formatDateTime } from "./format";
import { ApiError, apiFetch, errorMessage } from "./api";
import { TableSkeleton, Spinner } from "./loading";

type Feedback = { tone: "error" | "success"; text: string } | null;

export function StaffManager() {
  const admin = useAdmin();
  const [staff, setStaff] = useState<AdminView[] | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [createIssues, setCreateIssues] = useState<FieldIssues>({});
  const [creating, setCreating] = useState(false);
  const [resetFor, setResetFor] = useState<string | null>(null);

  const allowed = can(admin, "admins:manage");

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    apiFetch<{ admins: AdminView[] }>("/api/admin/users")
      .then((result) => {
        if (!cancelled) setStaff(result.admins);
      })
      .catch((err: unknown) => {
        if (!cancelled) setFeedback({ tone: "error", text: errorMessage(err) });
      });
    return () => {
      cancelled = true;
    };
  }, [allowed]);

  if (!allowed) {
    return <Alert tone="error">Only doctors can manage staff accounts.</Alert>;
  }

  async function reload() {
    const result = await apiFetch<{ admins: AdminView[] }>("/api/admin/users");
    setStaff(result.admins);
  }

  async function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setCreateIssues({});
    setFeedback(null);
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      const result = await apiFetch<{ admin: AdminView }>("/api/admin/users", { body: data });
      form.reset();
      setFeedback({ tone: "success", text: `${result.admin.name} can now sign in as ${ROLE_LABELS[result.admin.role]}.` });
      await reload();
    } catch (err) {
      setFeedback({ tone: "error", text: errorMessage(err) });
      if (err instanceof ApiError) setCreateIssues(err.issues);
    } finally {
      setCreating(false);
    }
  }

  async function update(target: AdminView, body: { role?: AdminRole; active?: boolean; password?: string }, successText: string) {
    setFeedback(null);
    try {
      await apiFetch(`/api/admin/users/${encodeURIComponent(target.id)}`, { method: "PATCH", body });
      setFeedback({ tone: "success", text: successText });
      await reload();
    } catch (err) {
      setFeedback({ tone: "error", text: errorMessage(err) });
    }
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>, target: AdminView) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    await update(target, { password }, `Password reset for ${target.name}. Their existing sign-ins have ended.`);
    setResetFor(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Staff accounts</h1>
        <p className="text-sm text-muted">Give each person the role that matches their job. Changes take effect immediately.</p>
      </div>

      {feedback && <Alert tone={feedback.tone}>{feedback.text}</Alert>}

      <Panel title="Accounts">
        {!staff && <TableSkeleton rows={3} />}
        {staff && (
          <ul className="divide-y divide-slate-200">
            {staff.map((member) => {
              const isYou = member.id === admin.id;
              return (
                <li key={member.id} className="space-y-3 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar src={member.avatarUrl} name={member.name} size="sm" />
                      <div className="min-w-0">
                        <p className="font-semibold text-ink">
                          {member.name} {isYou && <span className="font-normal text-muted">(you)</span>}
                        </p>
                        <p className="truncate text-sm text-muted">
                          {member.email} · added {formatDateTime(member.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="sr-only" htmlFor={`role-${member.id}`}>
                        Role for {member.name}
                      </label>
                      <select
                        id={`role-${member.id}`}
                        value={member.role}
                        disabled={isYou}
                        onChange={(e) =>
                          update(member, { role: e.target.value as AdminRole }, `${member.name} is now ${ROLE_LABELS[e.target.value as AdminRole]}.`)
                        }
                        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-ink disabled:opacity-60"
                      >
                        {ADMIN_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={isYou}
                        onClick={() =>
                          update(member, { active: !member.active }, `${member.name} ${member.active ? "has been deactivated" : "can sign in again"}.`)
                        }
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-slate-100 disabled:opacity-50"
                      >
                        {member.active ? "Deactivate" : "Reactivate"}
                      </button>
                      <button
                        type="button"
                        disabled={isYou}
                        onClick={() => setResetFor(resetFor === member.id ? null : member.id)}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-slate-100 disabled:opacity-50"
                      >
                        Reset password
                      </button>
                    </div>
                  </div>

                  {!member.active && <p className="text-xs font-semibold text-rose-700">Deactivated: cannot sign in.</p>}
                  <p className="text-xs text-muted">{ROLE_DESCRIPTIONS[member.role]}</p>

                  {resetFor === member.id && (
                    <form onSubmit={(e) => resetPassword(e, member)} className="flex flex-col gap-2 sm:flex-row">
                      <label className="sr-only" htmlFor={`pw-${member.id}`}>
                        New password for {member.name}
                      </label>
                      <input
                        id={`pw-${member.id}`}
                        name="password"
                        type="password"
                        required
                        minLength={12}
                        autoComplete="new-password"
                        placeholder="New password (12+ characters)"
                        className={`${inputClass} mt-0 flex-1`}
                      />
                      <button type="submit" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/85">
                        Set password
                      </button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel title="Add a staff account">
        <form onSubmit={createAccount} noValidate className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium text-ink">
            Full name
            <input name="name" required aria-invalid={Boolean(createIssues.name)} className={inputClass} />
            <FieldError messages={createIssues.name} />
          </label>
          <label className="block text-sm font-medium text-ink">
            Email
            <input name="email" type="email" required aria-invalid={Boolean(createIssues.email)} className={inputClass} />
            <FieldError messages={createIssues.email} />
          </label>
          <label className="block text-sm font-medium text-ink">
            Role
            <select name="role" defaultValue="staff" className={inputClass}>
              {ADMIN_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
            <FieldError messages={createIssues.role} />
          </label>
          <label className="block text-sm font-medium text-ink">
            Starting password
            <input
              name="password"
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
              placeholder="At least 12 characters"
              aria-invalid={Boolean(createIssues.password)}
              className={inputClass}
            />
            <FieldError messages={createIssues.password} />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 font-semibold text-white transition hover:bg-ink/85 disabled:opacity-60"
            >
              {creating ? <Spinner /> : <Icon icon="lucide:user-plus" className="h-4 w-4 text-brand" aria-hidden />}
              {creating ? "Adding…" : "Add account"}
            </button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
