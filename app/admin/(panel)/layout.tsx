import { requireAdmin } from "@/lib/auth/admin";
import { AdminSidebar } from "@/components/admin/sidebar";

// The layout gate is convenience, not the security boundary: every page and
// every Server Action underneath calls requireAdmin() again, and the database
// checks owner_id through RLS on top of that.
export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-surface md:flex-row">
      <AdminSidebar email={user.email ?? null} />
      <main className="flex flex-1 flex-col gap-7 p-6 pb-20 md:max-w-[1200px] md:px-12 md:py-10">
        {children}
      </main>
    </div>
  );
}
