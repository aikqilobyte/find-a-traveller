import { Star } from "lucide-react";

export function RatingStars({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <Star className="size-3.5 fill-warning text-warning" />
      <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
      {typeof reviews === "number" && <span className="text-muted-foreground">({reviews} reviews)</span>}
    </span>
  );
}
