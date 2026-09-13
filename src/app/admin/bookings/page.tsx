import type { Metadata } from "next";
import Link from "next/link";
import { getAllBookingsAdmin } from "@/lib/queries/admin";
import { StatusBadge } from "@/components/marketplace/status-badge";
import { formatCents } from "@/lib/money";

export const metadata: Metadata = { title: "Admin — Bookings" };

export default async function AdminBookingsPage() {
  const bookings = await getAllBookingsAdmin();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Bookings</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-4">Booking</th>
              <th className="p-4">Shopper</th>
              <th className="p-4">Traveller</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b border-border last:border-0">
                <td className="p-4">
                  <Link href={`/dashboard/orders/${booking.id}`} className="font-medium text-primary hover:underline">
                    {booking.booking_number}
                  </Link>
                </td>
                <td className="p-4">{booking.shopper?.full_name}</td>
                <td className="p-4">{booking.traveller?.full_name}</td>
                <td className="p-4">{formatCents(booking.total_cents, booking.currency)}</td>
                <td className="p-4">
                  <StatusBadge status={booking.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
