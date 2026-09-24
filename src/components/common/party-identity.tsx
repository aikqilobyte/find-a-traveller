import { Globe, ShieldCheck, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingStars } from "@/components/marketplace/rating-stars";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types/database";

type PartyProfile = Pick<
  Profile,
  "full_name" | "display_name" | "avatar_url" | "country" | "average_rating" | "total_reviews" | "verification_status"
>;

/**
 * Renders a counterparty. Before payment (`revealed = false`) the name and
 * avatar are withheld — rating and country still show, since those are
 * what the other side actually needs to decide whether to deal.
 */
export function PartyIdentity({
  profile,
  revealed,
  size = "md",
  className,
}: {
  profile: PartyProfile | null | undefined;
  revealed: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const avatarSize = size === "sm" ? "size-8" : size === "lg" ? "size-12" : "size-9";
  const name = profile?.display_name ?? profile?.full_name ?? "User";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {revealed ? (
        <Avatar className={avatarSize}>
          <AvatarImage src={profile?.avatar_url ?? undefined} alt={name} />
          <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      ) : (
        <span
          className={cn(
            avatarSize,
            "flex shrink-0 items-center justify-center rounded-full bg-surface-muted text-muted-foreground",
          )}
        >
          <UserRound className="size-4" />
        </span>
      )}

      <div className="min-w-0">
        <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground">
          {revealed ? name : "Anonymous"}
          {/* Verified is a trust signal, not an identifier, so it shows
              even while the name is withheld. */}
          {profile?.verification_status === "verified" && (
            <ShieldCheck className="size-3.5 shrink-0 text-success" />
          )}
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <RatingStars rating={profile?.average_rating ?? 0} reviews={profile?.total_reviews ?? 0} />
          {profile?.country && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Globe className="size-3" />
              {profile.country}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Short note explaining why a name is hidden, for detail pages. */
export function IdentityHiddenNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      Names stay private until payment is complete. You&apos;ll see each other&apos;s details as soon as
      the booking is paid.
    </p>
  );
}
