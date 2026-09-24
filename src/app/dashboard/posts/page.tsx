import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { requireProfile } from "@/lib/auth";
import { FEATURES } from "@/lib/features";
import { getMyTravellerPosts, getMyShipRequests } from "@/lib/queries/my-posts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PostStatusControls } from "@/components/posts/post-status-controls";
import { EmptyState } from "@/components/common/empty-state";
import { formatCents } from "@/lib/money";
import { Package, Plus } from "lucide-react";

export const metadata: Metadata = { title: "My Posts" };

export default async function MyPostsPage() {
  const profile = await requireProfile("/dashboard/posts");
  const [travellerPosts, shipRequests] = await Promise.all([
    getMyTravellerPosts(profile.id),
    getMyShipRequests(profile.id),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">My Posts</h1>
      </div>

      <Tabs defaultValue={FEATURES.bagSpacePosting ? "trips" : "packages"} className="mt-6">
        <TabsList>
          {FEATURES.bagSpacePosting && (
            <TabsTrigger value="trips">My Trips ({travellerPosts.length})</TabsTrigger>
          )}
          <TabsTrigger value="packages">My Packages ({shipRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="trips" className="space-y-3 pt-4">
          {travellerPosts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No trips posted yet"
              action={
                <Button asChild size="sm">
                  <Link href="/dashboard/posts/new/trip">
                    <Plus /> Post a Trip
                  </Link>
                </Button>
              }
            />
          ) : (
            travellerPosts.map((post) => (
              <div key={post.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
                <div>
                  <p className="font-medium text-foreground">
                    {post.origin_city} → {post.destination_city}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(post.departure_date), "dd MMM yyyy")} · {post.remaining_capacity_kg}/{post.capacity_kg} kg left ·{" "}
                    {formatCents(post.price_per_kg_cents, post.currency)}/kg
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="capitalize">
                    {post.status.replace("_", " ")}
                  </Badge>
                  <PostStatusControls postId={post.id} status={post.status} />
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="packages" className="space-y-3 pt-4">
          {shipRequests.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No packages posted yet"
              action={
                <Button asChild size="sm">
                  <Link href="/dashboard/posts/new/package">
                    <Plus /> Post a Package
                  </Link>
                </Button>
              }
            />
          ) : (
            shipRequests.map((request) => (
              <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
                <div>
                  <p className="font-medium text-foreground">{request.item_description}</p>
                  <p className="text-sm text-muted-foreground">
                    {request.origin_city} → {request.destination_city} · {formatCents(request.proposed_payment_cents, request.currency)}
                  </p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {request.status.replace("_", " ")}
                </Badge>
              </div>
            ))
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
}
