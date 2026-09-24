import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { requireProfile } from "@/lib/auth";
import { getMyBookings } from "@/lib/queries/my-bookings";
import { StatusBadge } from "@/components/marketplace/status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { formatCents } from "@/lib/money";
import { ClipboardList } from "lucide-react";

export const metadata: Metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const profile = await requireProfile("/dashboard/orders");
  const bookings = await getMyBookings(profile.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">My Orders</h1>

      {bookings.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={ClipboardList}
            title="No orders yet"
            description="Book a listing or accept an offer to see it here."
            action={
              <Button asChild size="sm">
                <Link href="/find-a-traveller">Find a traveller</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Product</th>
                <th className="p-4">Role</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                  <td className="p-4">
                    <Link href={`/dashboard/orders/${booking.id}`} className="font-medium text-primary hover:underline">
                      {booking.booking_number}
                    </Link>
                  </td>
                  <td className="max-w-48 truncate p-4">{booking.item_description}</td>
                  <td className="p-4 capitalize">{booking.shopper_id === profile.id ? "Receiver" : "Traveller"}</td>
                  <td className="p-4">{formatCents(booking.total_cents, booking.currency)}</td>
                  <td className="p-4">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="p-4 text-muted-foreground">{format(new Date(booking.created_at), "dd MMM yyyy")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
