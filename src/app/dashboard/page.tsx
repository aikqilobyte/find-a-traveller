import type { Metadata } from "next";
import Link from "next/link";
import { Plane, Package, Handshake, Wallet, ShoppingBag, ClipboardCheck, CheckCircle2 } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getDashboardStats } from "@/lib/queries/dashboard";
import { formatCents } from "@/lib/money";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardOverviewPage() {
  const profile = await requireProfile();
  const stats = await getDashboardStats(profile.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Welcome back, {profile.full_name.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your account today.</p>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">As a Traveller</h2>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/posts/new/trip">Post a Trip</Link>
          </Button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={Plane} label="Active Trips" value={stats.traveller.activePosts} />
          <StatCard icon={Package} label="Booking Requests" value={stats.traveller.bookingRequests} />
          <StatCard icon={Handshake} label="Accepted Bookings" value={stats.traveller.acceptedBookings} />
          <StatCard icon={Wallet} label="Earnings" value={formatCents(stats.traveller.earningsCents)} />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">As a Sender</h2>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/posts/new/package">Post a Package</Link>
          </Button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={ShoppingBag} label="Packages Posted" value={stats.shopper.shipRequests} />
          <StatCard icon={Package} label="Total Orders" value={stats.shopper.totalOrders} />
          <StatCard icon={ClipboardCheck} label="Active Orders" value={stats.shopper.activeOrders} />
          <StatCard icon={CheckCircle2} label="Completed Orders" value={stats.shopper.completedOrders} />
        </div>
      </section>

    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <Icon className="size-5 text-primary" />
      <p className="mt-2 text-xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
