import type { Metadata, Viewport } from "next";
import { Archivo, Jacquarda_Bastarda_9, Tiny5 } from "next/font/google";
import { CartDrawer } from "@/components/CartDrawer";
import { Cursor } from "@/components/Cursor";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Intro } from "@/components/Intro";
import { Providers } from "@/components/Providers";
import { SmoothScroll } from "@/components/SmoothScroll";
import { site } from "@/data/site";
import "./globals.css";

const display = Tiny5({
  variable: "--font-tiny5",
  subsets: ["latin"],
  weight: "400",
  fallback: ["ui-monospace", "monospace"],
  adjustFontFallback: false,
});

const script = Jacquarda_Bastarda_9({
  variable: "--font-jacquarda",
  subsets: ["latin"],
  weight: "400",
  fallback: ["serif"],
  adjustFontFallback: false,
});

const body = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: `${site.name} / Unisex streetwear`, template: `%s / ${site.name}` },
  description: `${site.tagline}. Unisex streetwear in all sizes, released in drops. Prices in KSh.`,
  metadataBase: new URL(`https://${site.domain}`),
};

export const viewport: Viewport = {
  themeColor: "#0c0c10",
};

// Runs before first paint so returning visitors in the same session skip the intro.
const introFlag = `try{if(sessionStorage.getItem("ci-intro")==="1")document.documentElement.dataset.introSeen=""}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${script.variable} ${body.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introFlag }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-[80] bg-chalk px-4 py-3 font-semibold text-void focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
        >
          Skip to content
        </a>
        <Providers>
          {site.preview && (
            <p className="bg-studio px-4 py-2 text-center text-xs text-void">
              Preview build: most product photos and details, and the drop date, are placeholders.
            </p>
          )}
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <CartDrawer />
          <Cursor />
          <Intro />
          <SmoothScroll />
        </Providers>
      </body>
    </html>
  );
}
