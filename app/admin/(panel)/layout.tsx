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
    <div className="flex min-h-dvh flex-1 flex-col bg-surface lg:flex-row">
      <AdminSidebar email={user.email ?? null} />
      <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 pb-20 sm:p-6 lg:max-w-[1200px] lg:gap-7 lg:px-12 lg:py-10">
        {children}
      </main>
    </div>
  );
}
