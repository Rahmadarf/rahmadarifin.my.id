import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ADMIN_HOME_PATH, checkAdmin } from "@/lib/auth/admin";
import { MONOGRAM } from "@/lib/content/defaults";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Admin Login" };

const NOTICES: Record<string, string> = {
  forbidden: "Akun ini tidak terdaftar sebagai pemilik portofolio.",
  "no-owner-list":
    "ADMIN_USER_IDS masih kosong. Isi UUID pemilik di .env.local lalu restart dev server.",
  unconfigured:
    "Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
};

export default async function AdminLoginPage(
  props: PageProps<"/admin/login">,
) {
  const [{ error }, check] = await Promise.all([
    props.searchParams,
    checkAdmin(),
  ]);

  // Already signed in as an owner: no reason to show the form again.
  if (check.ok) redirect(ADMIN_HOME_PATH);

  const errorKey = Array.isArray(error) ? error[0] : error;
  const notice = errorKey ? (NOTICES[errorKey] ?? null) : null;

  return (
    <div className="relative flex min-h-dvh flex-1 items-center justify-center bg-surface p-6">
      <Link
        href="/"
        className="absolute left-6 top-8 flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-foreground md:left-10"
      >
        <ArrowLeft className="size-3.5" strokeWidth={2.4} />
        Back to portfolio
      </Link>

      <div className="flex w-full max-w-100 flex-col items-center gap-5.5 rounded-2xl border border-border bg-background p-10 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
        <div className="flex size-[46px] items-center justify-center rounded-full border border-primary/30 bg-accent font-mono text-[15px] font-semibold text-primary">
          {MONOGRAM}
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold tracking-[-0.02em]">Admin Login</h1>
          <p className="text-sm text-text-tertiary">
            Manage your portfolio content
          </p>
        </div>

        <LoginForm notice={notice} />

        <p className="text-center text-xs leading-relaxed text-text-tertiary">
          This area is private — only you should have access.
        </p>
      </div>
    </div>
  );
}
