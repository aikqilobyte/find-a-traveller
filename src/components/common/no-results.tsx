"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PackageSearch, Plus, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Empty state for search/browse views. Always offers a way forward rather
 * than a dead end: post your own request, widen the search, or go home.
 */
export function NoResults({
  title,
  description,
  postHref = "/dashboard/posts/new/package",
  postLabel = "Post your request",
}: {
  title: string;
  description?: string;
  postHref?: string;
  postLabel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasFilters = searchParams.toString().length > 0;

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-muted/50 px-6 py-14 text-center">
      <PackageSearch className="size-10 text-muted-foreground" />
      <p className="mt-4 text-base font-semibold text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
        <Button asChild>
          <Link href={postHref}>
            <Plus /> {postLabel}
          </Link>
        </Button>
        <Button
          variant="outline"
          disabled={!hasFilters}
          onClick={() => router.push(pathname)}
          title={hasFilters ? undefined : "No filters are applied"}
        >
          <RotateCcw /> Search again
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/">
            <Home /> Go home
          </Link>
        </Button>
      </div>
    </div>
  );
}
