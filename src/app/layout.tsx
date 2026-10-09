import type { Metadata, Viewport } from "next";
import { Archivo, Big_Shoulders } from "next/font/google";
import { CartDrawer } from "@/components/CartDrawer";
import { Cursor } from "@/components/Cursor";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Intro } from "@/components/Intro";
import { Providers } from "@/components/Providers";
import { SmoothScroll } from "@/components/SmoothScroll";
import { site } from "@/data/site";
import "./globals.css";

const display = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
  fallback: ["Arial Narrow", "sans-serif"],
  adjustFontFallback: false,
});

const body = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: `${site.name} / Unisex streetwear`, template: `%s / ${site.name}` },
  description: "Unisex streetwear, released in drops. Prices in KSh.",
  metadataBase: new URL(`https://${site.domain}`),
};

export const viewport: Viewport = {
  themeColor: "#edeae2",
};

// Runs before first paint so returning visitors in the same session skip the intro.
const introFlag = `try{if(sessionStorage.getItem("dz-intro")==="1")document.documentElement.dataset.introSeen=""}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introFlag }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-[80] bg-acid px-4 py-3 font-semibold text-ink focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
        >
          Skip to content
        </a>
        <Providers>
          {site.preview && (
            <p className="bg-ink px-4 py-2 text-center text-xs text-bone">
              Preview build: photos, products and the drop date are placeholders.
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
