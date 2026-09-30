import Link from "next/link";

export function SiteFooter({
  note,
  variant = "full",
}: {
  note: string | null;
  variant?: "full" | "compact";
}) {
  return (
    <footer className="w-full border-t border-border py-10">
      <div className="mx-auto flex w-full max-w-[1080px] flex-col items-center gap-4 px-6 text-center sm:flex-row sm:justify-between sm:px-0 sm:text-left">
        <span className="text-[13px] text-text-tertiary">{note}</span>

        {variant === "full" ? (
          <nav className="flex gap-5" aria-label="Navigasi footer">
            {/* "Home" points at the home page, not at /#about as it used to.
                Unlike the navbar the footer carries no brand link, so a real
                Home entry earns its place here. */}
            {[
              { label: "Home", href: "/" },
              { label: "Projects", href: "/projects" },
              { label: "Skills", href: "/#skills" },
              { label: "Contact", href: "/#contact" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[13px] text-text-secondary hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : (
          <Link
            href="/projects"
            className="text-[13px] text-text-secondary hover:text-foreground"
          >
            ← All Projects
          </Link>
        )}
      </div>
    </footer>
  );
}
