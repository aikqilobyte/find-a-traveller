import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MarketplaceTabs } from "@/components/marketplace/marketplace-tabs";
import { ShipRequestFilterPanel } from "@/components/marketplace/ship-request-filter-panel";
import { MobileFilterDrawer } from "@/components/marketplace/mobile-filter-drawer";
import { SortSelect } from "@/components/marketplace/sort-select";
import { ShipRequestCard } from "@/components/marketplace/ship-request-card";
import { PaginationBar } from "@/components/common/pagination-bar";
import { NoResults } from "@/components/common/no-results";
import { searchShipRequests, type ShipRequestFilters } from "@/lib/queries/ship-requests";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = { title: "Browse Packages" };

export default async function ShipRequestsPage({
  searchParams,
}: {
  searchParams: Promise<ShipRequestFilters>;
}) {
  const [filters, t] = await Promise.all([searchParams, getDictionary()]);
  const { requests, total, page, pageSize } = await searchShipRequests(filters);

  const sortOptions = [
    { value: "newest", label: t.marketplace.sortNewest },
    { value: "budget_asc", label: t.marketplace.sortLowestBudget },
    { value: "budget_desc", label: t.marketplace.sortHighestBudget },
    { value: "deadline", label: t.marketplace.sortDeadline },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-surface-muted">
          <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 lg:px-8">
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
              {t.marketplace.findSenderTitle} <span className="text-primary">{t.marketplace.findSenderAccent}</span>
            </h1>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <MarketplaceTabs active="/find-a-sender" />
            <div className="flex items-center gap-2">
              <MobileFilterDrawer t={t.marketplace}>
                <ShipRequestFilterPanel t={t.marketplace} />
              </MobileFilterDrawer>
              <SortSelect options={sortOptions} />
            </div>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block">
              <ShipRequestFilterPanel t={t.marketplace} />
            </aside>

            <div>
              {requests.length === 0 ? (
                <NoResults
                  t={t.marketplace}
                  title={t.marketplace.noSenders}
                  description={t.marketplace.noSendersHint}
                  postIcon="plane"
                  postLabel={t.marketplace.exploreAsReceiverCta}
                  postHref="/find-a-traveller"
                />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {requests.map((request) => (
                    <ShipRequestCard key={request.id} request={request} />
                  ))}
                </div>
              )}

              <div className="mt-8 flex justify-center">
                <PaginationBar page={page} pageSize={pageSize} total={total} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
