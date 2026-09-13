import Link from "next/link";
import { format } from "date-fns";
import { Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/marketplace/rating-stars";
import { formatCents } from "@/lib/money";
import type { ShipRequest } from "@/lib/types/database";

export function ShipRequestCard({ request }: { request: ShipRequest }) {
  const shopper = request.shopper;
  const initials = shopper?.full_name?.slice(0, 2).toUpperCase() ?? "SH";

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="size-9">
            <AvatarImage src={shopper?.avatar_url ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">{shopper?.display_name ?? shopper?.full_name ?? "Shopper"}</p>
            <RatingStars rating={shopper?.average_rating ?? 0} reviews={shopper?.total_reviews ?? 0} />
          </div>
        </div>
        <Heart className="size-4 text-muted-foreground" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-surface-muted p-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Deadline</p>
          <p className="font-semibold text-foreground">
            {request.deadline ? format(new Date(request.deadline), "dd MMM") : "Flexible"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Weight</p>
          <p className="font-semibold text-foreground">{request.weight_kg} kg</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Paying</p>
          <p className="font-semibold text-primary">{formatCents(request.proposed_payment_cents, request.currency)}</p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm font-medium text-foreground">{request.item_description}</p>
      {request.notes && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{request.notes}</p>}

      {request.categories && request.categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {request.categories.slice(0, 3).map((category) => (
            <Badge key={category.id} variant="secondary" className="font-normal">
              {category.name}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm font-medium text-foreground">
        <span>{request.origin_city}</span>
        <span className="text-muted-foreground">→</span>
        <span>{request.destination_city}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="outline" asChild>
          <Link href={`/ship-requests/${request.id}`}>View</Link>
        </Button>
        <Button asChild>
          <Link href={`/ship-requests/${request.id}/offer`}>Make Offer</Link>
        </Button>
      </div>
    </div>
  );
}
