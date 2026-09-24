import type { Metadata } from "next";
import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { getMyBookings } from "@/lib/queries/my-bookings";
import { StatusBadge } from "@/components/marketplace/status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { formatCents } from "@/lib/money";
import { Handshake } from "lucide-react";

export const metadata: Metadata = { title: "Offers" };

export default async function OffersPage() {
  const profile = await requireProfile("/dashboard/offers");
  const bookings = await getMyBookings(profile.id, ["requested", "offer_pending"]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Offers</h1>
      <p className="text-sm text-muted-foreground">Requests and counter-offers awaiting a decision.</p>

      {bookings.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Handshake}
            title="No active offers"
            description="New booking requests and counter-offers will appear here."
            action={
              <Button asChild size="sm">
                <Link href="/find-a-sender">Browse packages to carry</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {bookings.map((booking) => {
            const other = booking.shopper_id === profile.id ? booking.traveller : booking.shopper;
            return (
              <Link
                key={booking.id}
                href={`/dashboard/orders/${booking.id}`}
                className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 hover:bg-surface-muted"
              >
                <div>
                  <p className="font-medium text-foreground">{booking.item_description}</p>
                  <p className="text-sm text-muted-foreground">with {other?.full_name ?? "user"}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{formatCents(booking.total_cents, booking.currency)}</p>
                  <StatusBadge status={booking.status} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
