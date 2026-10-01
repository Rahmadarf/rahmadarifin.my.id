import { NavBar } from "@/components/site/nav-bar";
import { BackToTop } from "@/components/site/back-to-top";
import { SplashScreen } from "@/components/site/splash-screen";

// Public shell: floating pill navbar plus the fixed back-to-top button that the
// design puts on every page. The admin panel has its own shell, and no splash.
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* The navbar's entrance is rendered into the server HTML in its hidden
          state, so without JavaScript it would never become visible and the
          site would lose its navigation. The splash has the same problem in
          reverse: nothing would ever take it down. This handles both. */}
      <noscript>
        <style>
          {`[data-nav-shell]{opacity:1!important;transform:none!important;overflow:visible!important}.splash-overlay{display:none!important}`}
        </style>
      </noscript>

      <SplashScreen>
        <div id="page-top" className="flex flex-1 flex-col">
          <NavBar />
          <main className="flex flex-1 flex-col items-center">{children}</main>
          <BackToTop />
        </div>
      </SplashScreen>
    </>
  );
}
