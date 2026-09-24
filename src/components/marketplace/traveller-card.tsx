import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, Heart, Plane } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PartyIdentity } from "@/components/common/party-identity";
import { formatCents } from "@/lib/money";
import type { TravellerPost } from "@/lib/types/database";

export function TravellerCard({ post }: { post: TravellerPost }) {
  const traveller = post.traveller;

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        {/* Browsing happens before any booking exists, so the traveller is
            always anonymous here — the same rule as the receiver side. */}
        <PartyIdentity profile={traveller} revealed={false} />
        <Heart className="size-4 text-muted-foreground" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-surface-muted p-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Available Space</p>
          <p className="font-semibold text-foreground">{post.remaining_capacity_kg} kg</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Charge</p>
          <p className="font-semibold text-primary">{formatCents(post.price_per_kg_cents, post.currency)}/kg</p>
        </div>
      </div>

      {post.notes && <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{post.notes}</p>}

      {post.categories && post.categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.categories.slice(0, 3).map((category) => (
            <Badge key={category.id} variant="secondary" className="font-normal">
              {category.name}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <span>{post.origin_city}</span>
          <ArrowRight className="size-3.5 text-muted-foreground" />
          <span>{post.destination_city}</span>
        </div>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Plane className="size-3.5" />
          {format(new Date(post.departure_date), "dd MMM yyyy")}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="outline" asChild>
          <Link href={`/traveller/${post.id}`}>View Details</Link>
        </Button>
        <Button asChild>
          <Link href={`/traveller/${post.id}/book`}>Book Space</Link>
        </Button>
      </div>
    </div>
  );
}
