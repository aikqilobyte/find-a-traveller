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
    default: "Find A Traveller — Trusted Travellers Make Your Shopping, Shipping & Sharing",
    template: "%s | Find A Traveller",
  },
  description:
    "Find A Traveller connects shoppers and travellers so you can share unused luggage space, ship items across borders, and find a travel buddy — safely and affordably.",
  openGraph: {
    title: "Find A Traveller",
    description:
      "Connect with verified travellers to share luggage space, ship items, or find a travel buddy.",
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
