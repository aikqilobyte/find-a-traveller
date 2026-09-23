import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
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
      "Send a package with a verified traveller already heading your way — or earn from luggage space you aren't using.",
    siteName: "Find A Traveller",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster position="top-right" richColors />
        </TooltipProvider>
      </body>
    </html>
  );
}
