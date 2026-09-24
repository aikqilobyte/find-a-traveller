import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MarketplaceTabs } from "@/components/marketplace/marketplace-tabs";
import { TravellerFilterPanel } from "@/components/marketplace/traveller-filter-panel";
import { MobileFilterDrawer } from "@/components/marketplace/mobile-filter-drawer";
import { SortSelect } from "@/components/marketplace/sort-select";
import { TravellerCard } from "@/components/marketplace/traveller-card";
import { PaginationBar } from "@/components/common/pagination-bar";
import { NoResults } from "@/components/common/no-results";
import { searchTravellerPosts, type TravellerPostFilters } from "@/lib/queries/traveller-posts";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = { title: "Find a Traveller" };

export default async function AvailableSpacePage({
  searchParams,
}: {
  searchParams: Promise<TravellerPostFilters>;
}) {
  const [filters, t] = await Promise.all([searchParams, getDictionary()]);
  const { posts, total, page, pageSize } = await searchTravellerPosts(filters);

  const sortOptions = [
    { value: "newest", label: t.marketplace.sortNewest },
    { value: "price_asc", label: t.marketplace.sortLowestPrice },
    { value: "capacity_desc", label: t.marketplace.sortHighestCapacity },
    { value: "departure_date", label: t.marketplace.sortDepartureDate },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-surface-muted">
          <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 lg:px-8">
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
              {t.marketplace.findTravellerTitle} <span className="text-primary">{t.marketplace.findTravellerAccent}</span>
            </h1>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <MarketplaceTabs active="/find-a-traveller" />
            <div className="flex items-center gap-2">
              <MobileFilterDrawer t={t.marketplace}>
                <TravellerFilterPanel t={t.marketplace} />
              </MobileFilterDrawer>
              <SortSelect options={sortOptions} />
            </div>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block">
              <TravellerFilterPanel t={t.marketplace} />
            </aside>

            <div>
              {posts.length === 0 ? (
                <NoResults
                  t={t.marketplace}
                  title={t.marketplace.noTravellers}
                  description={t.marketplace.noTravellersHint}
                />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {posts.map((post) => (
                    <TravellerCard key={post.id} post={post} />
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

