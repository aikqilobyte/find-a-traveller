import Link from "next/link";
import { Clock } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

/**
 * Shown in place of a feature that exists in the codebase but is not part
 * of the current launch (see src/lib/features.ts). Keeps URLs alive
 * instead of 404ing, so links shared before launch still land somewhere
 * sensible.
 */
export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center bg-surface-muted/40 px-4 py-20">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface p-8 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Clock className="size-6 text-primary" />
          </span>
          <h1 className="mt-4 text-xl font-semibold text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/find-a-sender">Browse packages to deliver</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Go home</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
