"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import { ROLE_LABELS, type Permission } from "@/lib/admin/permissions";
import { Avatar } from "@/components/avatar-upload";
import { AdminProvider, can, type AdminSession } from "./admin-context";
import { apiFetch } from "./api";
import { NotificationBell } from "./notification-bell";

const NAV: { href: string; label: string; icon: string; permission: Permission }[] = [
  { href: "/admin/overview", label: "Overview", icon: "lucide:layout-dashboard", permission: "prescriptions:read" },
  { href: "/admin", label: "Prescriptions", icon: "lucide:clipboard-list", permission: "prescriptions:read" },
  { href: "/admin/patients", label: "Patients", icon: "lucide:users", permission: "patients:read" },
  { href: "/admin/appointments", label: "Appointments", icon: "lucide:calendar-check", permission: "messages:read" },
  { href: "/admin/messages", label: "Messages", icon: "lucide:mail", permission: "messages:read" },
  { href: "/admin/subscribers", label: "Subscribers", icon: "lucide:mails", permission: "messages:read" },
  { href: "/admin/orders", label: "Orders", icon: "lucide:shopping-bag", permission: "messages:read" },
  { href: "/admin/articles", label: "Health blog", icon: "lucide:newspaper", permission: "content:manage" },
  { href: "/admin/topics", label: "Categories & tags", icon: "lucide:tags", permission: "content:manage" },
  { href: "/admin/branches", label: "Branches", icon: "lucide:map-pin", permission: "content:manage" },
  { href: "/admin/staff", label: "Staff accounts", icon: "lucide:shield-check", permission: "admins:manage" },
];

// The sidebar's width choice is remembered in this browser only. It is a display preference, not data.
const SIDEBAR_KEY = "admin-sidebar-collapsed";
const SIDEBAR_EVENT = "admin-sidebar-change";

function subscribeSidebar(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(SIDEBAR_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SIDEBAR_EVENT, onChange);
  };
}

function readSidebarCollapsed(): boolean {
  try {
    return window.localStorage.getItem(SIDEBAR_KEY) === "1";
  } catch {
    return false;
  }
}

/** Whether the sidebar is minimized to icons. Reads the browser's saved choice without a flash on load. */
function useSidebarCollapsed(): [boolean, (value: boolean) => void] {
  const collapsed = useSyncExternalStore(subscribeSidebar, readSidebarCollapsed, () => false);
  function set(value: boolean) {
    try {
      window.localStorage.setItem(SIDEBAR_KEY, value ? "1" : "0");
    } catch {
      // Storage can be blocked; the choice then lasts only until the page is reloaded.
    }
    window.dispatchEvent(new Event(SIDEBAR_EVENT));
  }
  return [collapsed, set];
}

export function AdminShell({ admin, children }: { admin: AdminSession; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [collapsed, setCollapsed] = useSidebarCollapsed();

  async function signOut() {
    setSigningOut(true);
    await apiFetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    router.refresh();
  }

  const items = NAV.filter((item) => can(admin, item.permission));

  return (
    <AdminProvider admin={admin}>
      <div className="flex min-h-screen w-full flex-col bg-slate-50 md:flex-row">
        <aside
          className={`border-b border-slate-200 bg-white transition-[width] duration-200 md:shrink-0 md:border-b-0 md:border-r ${
            collapsed ? "md:w-20" : "md:w-64"
          }`}
        >
          <div className={`flex flex-col gap-6 p-5 md:sticky md:top-0 md:h-screen ${collapsed ? "md:items-center md:px-3" : ""}`}>
            <div className={`flex items-start gap-3 ${collapsed ? "md:flex-col md:items-center" : "justify-between"}`}>
              <div className={`space-y-2 ${collapsed ? "md:hidden" : ""}`}>
                <img src="/link-logo.svg" alt="Link Pharmacy" className="h-9 w-auto" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Staff admin</p>
              </div>
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? "Expand sidebar" : "Minimize sidebar"}
                aria-expanded={!collapsed}
                title={collapsed ? "Expand sidebar" : "Minimize sidebar"}
                className="hidden rounded-md p-2 text-muted transition hover:bg-slate-100 hover:text-ink md:inline-flex"
              >
                <Icon icon={collapsed ? "lucide:panel-left-open" : "lucide:panel-left-close"} className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <nav aria-label="Admin sections" className={`flex flex-wrap gap-2 md:flex-col ${collapsed ? "md:items-center" : ""}`}>
              {items.map((item) => {
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    aria-label={collapsed ? item.label : undefined}
                    title={collapsed ? item.label : undefined}
                    className={`inline-flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${
                      collapsed ? "md:justify-center md:px-0" : ""
                    } ${active ? "bg-ink text-white" : "text-ink hover:bg-slate-100"}`}
                  >
                    <Icon icon={item.icon} className={`h-4 w-4 shrink-0 ${active ? "text-brand" : ""}`} aria-hidden />
                    <span className={collapsed ? "md:hidden" : ""}>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className={`mt-auto space-y-3 border-t border-slate-200 pt-4 text-sm ${collapsed ? "md:w-full md:text-center" : ""}`}>
              <Link
                href="/admin/profile"
                title={collapsed ? `${admin.name} · ${ROLE_LABELS[admin.role]}` : undefined}
                className={`flex items-center gap-3 rounded-md p-1 -m-1 hover:bg-slate-100 ${collapsed ? "md:justify-center" : ""}`}
              >
                <Avatar src={admin.avatarUrl} name={admin.name} size="sm" />
                <div className={`min-w-0 ${collapsed ? "md:hidden" : ""}`}>
                  <p className="truncate font-semibold text-ink">{admin.name}</p>
                  <p className="text-muted">{ROLE_LABELS[admin.role]}</p>
                </div>
              </Link>
              <button
                type="button"
                onClick={signOut}
                disabled={signingOut}
                aria-label="Sign out"
                title="Sign out"
                className={`inline-flex items-center gap-2 font-semibold text-ink hover:underline disabled:opacity-60 ${
                  collapsed ? "md:mx-auto md:no-underline md:hover:text-muted" : ""
                }`}
              >
                <Icon icon="lucide:log-out" className="h-4 w-4 shrink-0" aria-hidden />
                <span className={collapsed ? "md:hidden" : ""}>{signingOut ? "Signing out…" : "Sign out"}</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-end gap-4 border-b border-slate-200 bg-white/90 px-5 py-3 backdrop-blur md:px-8">
            <NotificationBell />
            <Link href="/admin/profile" className="flex items-center gap-2.5 rounded-md p-1 hover:bg-slate-100">
              <Avatar src={admin.avatarUrl} name={admin.name} size="sm" />
              <span className="hidden text-sm sm:block">
                <span className="block font-semibold text-ink">{admin.name}</span>
                <span className="block text-xs text-muted">{ROLE_LABELS[admin.role]}</span>
              </span>
            </Link>
          </header>

          <main className="min-w-0 flex-1 p-5 md:p-8">{children}</main>
        </div>
      </div>
    </AdminProvider>
  );
}
