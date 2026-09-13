import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MarketplaceTabs } from "@/components/marketplace/marketplace-tabs";
import { TravellerFilterPanel } from "@/components/marketplace/traveller-filter-panel";
import { MobileFilterDrawer } from "@/components/marketplace/mobile-filter-drawer";
import { SortSelect } from "@/components/marketplace/sort-select";
import { TravellerCard } from "@/components/marketplace/traveller-card";
import { PaginationBar } from "@/components/common/pagination-bar";
import { EmptyState } from "@/components/common/empty-state";
import { searchTravellerPosts, type TravellerPostFilters } from "@/lib/queries/traveller-posts";
import { PackageSearch } from "lucide-react";

export const metadata: Metadata = { title: "Available Space" };

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Lowest Price" },
  { value: "capacity_desc", label: "Highest Capacity" },
  { value: "departure_date", label: "Departure Date" },
];

export default async function AvailableSpacePage({
  searchParams,
}: {
  searchParams: Promise<TravellerPostFilters>;
}) {
  const filters = await searchParams;
  const { posts, total, page, pageSize } = await searchTravellerPosts(filters);

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
            <MarketplaceTabs active="/available-space" />
            <div className="flex items-center gap-2">
              <MobileFilterDrawer>
                <TravellerFilterPanel />
              </MobileFilterDrawer>
              <SortSelect options={SORT_OPTIONS} />
            </div>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block">
              <TravellerFilterPanel />
            </aside>

            <div>
              {posts.length === 0 ? (
                <EmptyState
                  icon={PackageSearch}
                  title="No travellers found"
                  description="Try adjusting your filters or search a different route and date."
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
