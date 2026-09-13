import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MarketplaceTabs } from "@/components/marketplace/marketplace-tabs";
import { TravelBuddyFilterPanel } from "@/components/marketplace/travel-buddy-filter-panel";
import { MobileFilterDrawer } from "@/components/marketplace/mobile-filter-drawer";
import { TravelBuddyCard } from "@/components/marketplace/travel-buddy-card";
import { PaginationBar } from "@/components/common/pagination-bar";
import { EmptyState } from "@/components/common/empty-state";
import { searchTravelBuddyPosts, type TravelBuddyFilters } from "@/lib/queries/travel-buddy";
import { Users } from "lucide-react";

export const metadata: Metadata = { title: "Travel Buddy" };

export default async function TravelBuddyPage({
  searchParams,
}: {
  searchParams: Promise<TravelBuddyFilters>;
}) {
  const filters = await searchParams;
  const { posts, total, page, pageSize } = await searchTravelBuddyPosts(filters);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-surface-muted">
          <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 lg:px-8">
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Never travel alone — <span className="text-primary">find your travel buddy</span>
            </h1>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <MarketplaceTabs active="/travel-buddy" />
            <MobileFilterDrawer>
              <TravelBuddyFilterPanel />
            </MobileFilterDrawer>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block">
              <TravelBuddyFilterPanel />
            </aside>

            <div>
              {posts.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No travel buddies found"
                  description="Try a different route or date, or be the first to post your trip."
                />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {posts.map((post) => (
                    <TravelBuddyCard key={post.id} post={post} />
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
