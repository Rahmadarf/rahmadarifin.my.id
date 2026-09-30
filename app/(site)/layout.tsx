import { NavBar } from "@/components/site/nav-bar";
import { BackToTop } from "@/components/site/back-to-top";
import { EntranceProvider } from "@/components/site/entrance-context";

// Public shell: floating pill navbar plus the fixed back-to-top button that the
// design puts on every page. The admin panel has its own shell.
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The provider reports "ready" for now, so the navbar animates on mount.
    // The splash screen will pass a stage through it later, which is why it is
    // mounted here already rather than being added with the splash.
    <EntranceProvider>
      {/* The navbar's entrance is rendered into the server HTML in its hidden
          state, so without JavaScript it would never become visible and the
          site would lose its navigation. This puts it back. */}
      <noscript>
        <style>
          {`[data-nav-shell]{opacity:1!important;transform:none!important;overflow:visible!important}`}
        </style>
      </noscript>

      <div id="page-top" className="flex flex-1 flex-col">
        <NavBar />
        <main className="flex flex-1 flex-col items-center">{children}</main>
        <BackToTop />
      </div>
    </EntranceProvider>
  );
}
