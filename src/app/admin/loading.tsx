import { AdminLoader } from "@/components/admin/loading";

// Shown while an admin page's data is being prepared on the server.
export default function AdminLoading() {
  return <AdminLoader label="Loading the staff admin…" />;
}
