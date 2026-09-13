import type { Metadata } from "next";
import { Users, Plane, Package, ClipboardList, CheckCircle2, Wallet } from "lucide-react";
import { getAdminMetrics } from "@/lib/queries/admin";
import { formatCents } from "@/lib/money";

export const metadata: Metadata = { title: "Admin Overview" };

export default async function AdminOverviewPage() {
  const metrics = await getAdminMetrics();

  const cards = [
    { icon: Users, label: "Total Users", value: metrics.totalUsers },
    { icon: Plane, label: "Active Travellers", value: metrics.activeTravellers },
    { icon: Package, label: "Active Posts", value: metrics.activePosts },
    { icon: ClipboardList, label: "Bookings", value: metrics.bookings },
    { icon: CheckCircle2, label: "Completed Orders", value: metrics.completedOrders },
    { icon: Wallet, label: "Platform Revenue", value: formatCents(metrics.platformRevenueCents) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Admin Overview</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-border bg-surface p-4">
            <card.icon className="size-5 text-primary" />
            <p className="mt-2 text-xl font-semibold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
