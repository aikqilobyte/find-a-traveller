import type { Metadata } from "next";
import Link from "next/link";
import { Plane, Package, Handshake, Wallet, ShoppingBag, ClipboardCheck, CheckCircle2 } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { FEATURES } from "@/lib/features";
import { getDashboardStats } from "@/lib/queries/dashboard";
import { getDictionary } from "@/lib/i18n";
import { formatCents } from "@/lib/money";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardOverviewPage() {
  const profile = await requireProfile();
  const [stats, t] = await Promise.all([getDashboardStats(profile.id), getDictionary()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t.dashboard.welcomeBack}, {profile.full_name.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">{t.dashboard.todaySummary}</p>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">{t.dashboard.asTraveller}</h2>
          <Button asChild size="sm" variant="outline">
            <Link href="/find-a-sender">{t.dashboard.findPackage}</Link>
          </Button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {FEATURES.bagSpacePosting && (
            <StatCard icon={Plane} label="Active Trips" value={stats.traveller.activePosts} />
          )}
          <StatCard icon={Package} label={t.dashboard.bookingRequests} value={stats.traveller.bookingRequests} />
          <StatCard icon={Handshake} label={t.dashboard.acceptedBookings} value={stats.traveller.acceptedBookings} />
          <StatCard icon={Wallet} label={t.dashboard.earnings} value={formatCents(stats.traveller.earningsCents)} />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">{t.dashboard.asReceiver}</h2>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/posts/new/package">{t.dashboard.postPackage}</Link>
          </Button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={ShoppingBag} label={t.dashboard.packagesPosted} value={stats.shopper.shipRequests} />
          <StatCard icon={Package} label={t.dashboard.totalOrders} value={stats.shopper.totalOrders} />
          <StatCard icon={ClipboardCheck} label={t.dashboard.activeOrders} value={stats.shopper.activeOrders} />
          <StatCard icon={CheckCircle2} label={t.dashboard.completedOrders} value={stats.shopper.completedOrders} />
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
