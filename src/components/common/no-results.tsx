"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PackageSearch, Plus, Plane, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

// Named rather than passed as a component: NoResults is a Client Component
// and the browse pages that render it are Server Components, which cannot
// send a function across the boundary.
const POST_ICONS = { plus: Plus, plane: Plane };

/**
 * Empty state for search/browse views. Always offers a way forward rather
 * than a dead end: post your own request, widen the search, or go home.
 *
 * The primary action is per-page, because what helps depends on who is
 * looking: a receiver with no travellers should post a request, while a
 * traveller with no packages has nothing to post while trip posting is
 * hidden, so they are pointed at the other side of the marketplace.
 */
export function NoResults({
  title,
  description,
  postHref = "/dashboard/posts/new/package",
  postLabel = "Post your request",
  postIcon = "plus",
}: {
  title: string;
  description?: string;
  postHref?: string;
  postLabel?: string;
  postIcon?: keyof typeof POST_ICONS;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasFilters = searchParams.toString().length > 0;
  const PostIcon = POST_ICONS[postIcon];

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-muted/50 px-6 py-14 text-center">
      <PackageSearch className="size-10 text-muted-foreground" />
      <p className="mt-4 text-base font-semibold text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
        <Button asChild>
          <Link href={postHref}>
            <PostIcon /> {postLabel}
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
