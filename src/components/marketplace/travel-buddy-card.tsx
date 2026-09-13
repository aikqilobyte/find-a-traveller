import Link from "next/link";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/marketplace/rating-stars";
import type { TravelBuddyPost } from "@/lib/types/database";

export function TravelBuddyCard({ post }: { post: TravelBuddyPost }) {
  const user = post.user;
  const initials = user?.full_name?.slice(0, 2).toUpperCase() ?? "TB";

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2">
        <Avatar className="size-9">
          <AvatarImage src={user?.avatar_url ?? undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground">{user?.display_name ?? user?.full_name ?? "Traveller"}</p>
          <RatingStars rating={user?.average_rating ?? 0} reviews={user?.total_reviews ?? 0} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-surface-muted p-3 text-sm font-medium text-foreground">
        <span>{post.origin_city}</span>
        <span className="text-muted-foreground">→</span>
        <span>{post.destination_city}</span>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Travelling {format(new Date(post.travel_date), "dd MMM yyyy")}
        {post.return_date && ` – ${format(new Date(post.return_date), "dd MMM yyyy")}`}
      </p>

      {post.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.description}</p>}

      <div className="mt-3">
        <Badge variant="secondary" className="font-normal capitalize">
          {post.transport_type}
        </Badge>
      </div>

      <Button asChild className="mt-4">
        <Link href={`/travel-buddy/${post.id}`}>View &amp; Message</Link>
      </Button>
    </div>
  );
}
