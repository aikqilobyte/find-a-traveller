import type { Metadata } from "next";
import { Inter, Outfit, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { HelpWidget } from "@/components/support/help-widget";
import { getDictionary } from "@/lib/i18n";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Headings get their own voice. Inter is a fine reading face but using it
// for both body and headings leaves a page with no hierarchy of character,
// only of size — which is most of why the site read as plainer than the
// competitor it was compared against.
const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

// Inter contains no Bengali glyphs, so every Bangla heading was falling
// back to whatever the visitor's device happened to have — Nirmala UI on
// Windows, something else on Android, something else again on iOS. For a
// product where half the audience reads Bangla, that is the first
// impression, and it was being left to chance.
const hindSiliguri = Hind_Siliguri({
  variable: "--font-bengali",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Find A Traveller — Transform Transit into Trust",
    template: "%s | Find A Traveller",
  },
  description:
    "Find A Traveller connects people receiving packages with verified travellers who have unused luggage space, so parcels travel cheaper, faster and with payment protected until delivery.",
  openGraph: {
    title: "Find A Traveller",
    description:
      "Send a package with a verified traveller whose trip is already planned — or earn from luggage space you aren't using.",
    siteName: "Find A Traveller",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const t = await getDictionary();

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${hindSiliguri.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider delayDuration={200}>
          {children}
          {/* Sits on every page: the questions people need answered are
              mostly asked mid-task, not from the help page. */}
          <HelpWidget t={t.help} />
          <Toaster position="top-right" richColors />
        </TooltipProvider>
      </body>
    </html>
  );
}
