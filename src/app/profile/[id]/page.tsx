import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShieldCheck, MapPin } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/marketplace/rating-stars";
import { ReviewCard } from "@/components/reviews/review-card";
import { EmptyState } from "@/components/common/empty-state";
import { ReportDialog } from "@/components/reports/report-dialog";
import { createClient } from "@/lib/supabase/server";
import { getReviewsForUser } from "@/lib/queries/reviews";
import { getCurrentProfile } from "@/lib/auth";
import type { Profile } from "@/lib/types/database";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("full_name").eq("id", id).maybeSingle();
  return { title: data?.full_name ?? "Profile" };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!profile) notFound();

  const p = profile as Profile;
  const viewer = await getCurrentProfile();
  const reviews = await getReviewsForUser(id, 10);

  const { count: completedCount } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .or(`shopper_id.eq.${id},traveller_id.eq.${id}`)
    .eq("status", "completed");

  const { data: activePosts } = await supabase
    .from("traveller_posts")
    .select("id, origin_city, destination_city, departure_date")
    .eq("traveller_id", id)
    .eq("status", "active");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-surface-muted/40">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarImage src={p.avatar_url ?? undefined} />
                <AvatarFallback>{p.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  {p.display_name ?? p.full_name}
                  {p.verification_status === "verified" && <ShieldCheck className="size-4 text-success" />}
                </p>
                <RatingStars rating={p.average_rating} reviews={p.total_reviews} />
                {(p.city || p.country) && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-3.5" /> {[p.city, p.country].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            </div>

            {p.bio && <p className="mt-4 text-sm text-muted-foreground">{p.bio}</p>}

            {viewer && viewer.id !== p.id && (
              <div className="mt-2">
                <ReportDialog targetType="user" targetId={p.id} />
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="secondary">{completedCount ?? 0} completed transactions</Badge>
              <Badge variant="secondary" className="capitalize">
                {p.verification_status}
              </Badge>
            </div>

            {activePosts && activePosts.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-foreground">Active trips</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {activePosts.map((post) => (
                    <Badge key={post.id} variant="outline">
                      {post.origin_city} → {post.destination_city}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
            <p className="font-semibold text-foreground">Reviews</p>
            <div className="mt-4 space-y-4">
              {reviews.length === 0 ? <EmptyState title="No reviews yet" /> : reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
