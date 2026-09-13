import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MarketplaceTabs } from "@/components/marketplace/marketplace-tabs";
import { ShipRequestFilterPanel } from "@/components/marketplace/ship-request-filter-panel";
import { MobileFilterDrawer } from "@/components/marketplace/mobile-filter-drawer";
import { SortSelect } from "@/components/marketplace/sort-select";
import { ShipRequestCard } from "@/components/marketplace/ship-request-card";
import { PaginationBar } from "@/components/common/pagination-bar";
import { EmptyState } from "@/components/common/empty-state";
import { searchShipRequests, type ShipRequestFilters } from "@/lib/queries/ship-requests";
import { PackageSearch } from "lucide-react";

export const metadata: Metadata = { title: "Ship Requests" };

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "budget_asc", label: "Lowest Budget" },
  { value: "budget_desc", label: "Highest Budget" },
  { value: "deadline", label: "Deadline" },
];

export default async function ShipRequestsPage({
  searchParams,
}: {
  searchParams: Promise<ShipRequestFilters>;
}) {
  const filters = await searchParams;
  const { requests, total, page, pageSize } = await searchShipRequests(filters);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-surface-muted">
          <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 lg:px-8">
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Explore the easiest way to <span className="text-primary">shop, send, or share luggage</span>
            </h1>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <MarketplaceTabs active="/ship-requests" />
            <div className="flex items-center gap-2">
              <MobileFilterDrawer>
                <ShipRequestFilterPanel />
              </MobileFilterDrawer>
              <SortSelect options={SORT_OPTIONS} />
            </div>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block">
              <ShipRequestFilterPanel />
            </aside>

            <div>
              {requests.length === 0 ? (
                <EmptyState
                  icon={PackageSearch}
                  title="No ship requests found"
                  description="Try adjusting your filters, or check back soon as new requests are posted daily."
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
