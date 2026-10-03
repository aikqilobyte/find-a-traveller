import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { Wallet, Lock, Banknote, Info, Plane } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getTravellerEarnings } from "@/lib/queries/earnings";
import { getDictionary } from "@/lib/i18n";
import { formatCents } from "@/lib/money";
import { StatusBadge } from "@/components/marketplace/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Earnings & Payouts" };

export default async function EarningsPage() {
  const profile = await requireProfile("/dashboard/earnings");
  const [earnings, t] = await Promise.all([getTravellerEarnings(profile.id), getDictionary()]);

  const cards = [
    {
      icon: Wallet,
      label: t.dashboard.earningsReleasable,
      hint: t.dashboard.earningsReleasableHint,
      value: earnings.releasableCents,
      accent: true,
    },
    {
      icon: Lock,
      label: t.dashboard.earningsEscrow,
      hint: t.dashboard.earningsEscrowHint,
      value: earnings.inEscrowCents,
    },
    {
      icon: Banknote,
      label: t.dashboard.earningsPaidOut,
      hint: t.dashboard.earningsPaidOutHint,
      value: earnings.paidOutCents,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">{t.dashboard.earningsTitle}</h1>
      <p className="text-sm text-muted-foreground">{t.dashboard.earningsIntro}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border p-5 ${
              card.accent ? "border-primary/30 bg-primary/5" : "border-border bg-surface"
            }`}
          >
            <card.icon className={`size-5 ${card.accent ? "text-primary" : "text-muted-foreground"}`} />
            <p className="mt-3 text-2xl font-semibold text-foreground">
              {formatCents(card.value, earnings.currency)}
            </p>
            <p className="text-sm font-medium text-foreground">{card.label}</p>
            <p className="text-xs text-muted-foreground">{card.hint}</p>
          </div>
        ))}
      </div>

      {/* Said plainly rather than left for someone to work out from a
          stuck balance: the money is recorded, it just cannot move yet. */}
      <div className="mt-4 flex gap-3 rounded-xl border border-warning/40 bg-warning-bg p-4">
        <Info className="mt-0.5 size-5 shrink-0 text-warning" />
        <div className="text-sm">
          <p className="font-semibold text-foreground">{t.dashboard.earningsPayoutsTitle}</p>
          <p className="mt-1 text-muted-foreground">{t.dashboard.earningsPayoutsBody}</p>
        </div>
      </div>

      {earnings.rows.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Wallet}
            title={t.dashboard.earningsEmpty}
            description={t.dashboard.earningsEmptyHint}
            action={
              <Button asChild size="sm">
                <Link href="/find-a-sender">
                  <Plane /> {t.dashboard.earningsFindWork}
                </Link>
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs text-muted-foreground">
                <tr>
                  <th className="p-4">{t.dashboard.earningsTableOrder}</th>
                  <th className="p-4">{t.dashboard.earningsTableItem}</th>
                  <th className="p-4">{t.dashboard.earningsTableStatus}</th>
                  <th className="p-4 text-right">{t.dashboard.earningsTableAmount}</th>
                </tr>
              </thead>
              <tbody>
                {earnings.rows.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                    <td className="p-4">
                      <Link
                        href={`/dashboard/orders/${row.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {row.booking_number}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(row.created_at), "dd MMM yyyy")}
                      </p>
                    </td>
                    <td className="max-w-48 truncate p-4 text-muted-foreground">{row.item_description}</td>
                    <td className="p-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="p-4 text-right font-semibold text-foreground">
                      {formatCents(row.item_price_cents, row.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{t.dashboard.earningsFeeNote}</p>
        </>
      )}
    </div>
  );
}
