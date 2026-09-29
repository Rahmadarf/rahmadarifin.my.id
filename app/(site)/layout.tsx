import { NavBar } from "@/components/site/nav-bar";
import { BackToTop } from "@/components/site/back-to-top";

// Public shell: floating pill navbar plus the fixed back-to-top button that the
// design puts on every page. The admin panel has its own shell.
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div id="page-top" className="flex flex-1 flex-col">
      <NavBar />
      <main className="flex flex-1 flex-col items-center">{children}</main>
      <BackToTop />
    </div>
  );
}
