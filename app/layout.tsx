import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import Script from "next/script";
import { Providers } from "@/components/providers";
import { splashDecisionScript } from "@/lib/splash";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Rahmad Arifin Susilo — Portfolio",
    template: "%s | Rahmad Arifin Susilo",
  },
  description:
    "Portfolio Rahmad Arifin Susilo: web development, UI/UX, dan proyek full-stack.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${firaCode.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        {/* Decides whether this visit gets a splash, before anything is
            painted. `beforeInteractive` puts it in the document rather than in
            the React tree — React never runs a <script> it rendered on the
            client, and warns about it. The root layout is the only place that
            strategy is honoured, so the script scopes itself away from /admin
            rather than relying on where it sits. */}
        <Script id="splash-decision" strategy="beforeInteractive">
          {splashDecisionScript()}
        </Script>

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
