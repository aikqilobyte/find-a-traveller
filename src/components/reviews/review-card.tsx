import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingStars } from "@/components/marketplace/rating-stars";
import type { Review } from "@/lib/types/database";

export function ReviewCard({ review }: { review: Review }) {
  const reviewer = review.reviewer;
  const initials = reviewer?.full_name?.slice(0, 2).toUpperCase() ?? "U";

  return (
    <div className="border-b border-border pb-4 last:border-0 last:pb-0">
      <div className="flex items-center gap-2">
        <Avatar className="size-8">
          <AvatarImage src={reviewer?.avatar_url ?? undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-foreground">{reviewer?.full_name ?? "User"}</p>
          <p className="text-xs text-muted-foreground">{format(new Date(review.created_at), "MMM yyyy")}</p>
        </div>
        <div className="ml-auto">
          <RatingStars rating={review.rating} />
        </div>
      </div>
      {review.comment && <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>}
    </div>
  );
}
