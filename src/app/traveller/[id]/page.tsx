import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { MapPin, CalendarDays, Plane, ShieldCheck, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/marketplace/rating-stars";
import { ReviewCard } from "@/components/reviews/review-card";
import { EmptyState } from "@/components/common/empty-state";
import { getTravellerPostById } from "@/lib/queries/traveller-post-detail";
import { getReviewsForUser } from "@/lib/queries/reviews";
import { formatCents } from "@/lib/money";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await getTravellerPostById(id);
  if (!post) return { title: "Traveller not found" };
  return { title: `${post.origin_city} to ${post.destination_city} — Available Space` };
}

export default async function TravellerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getTravellerPostById(id);
  if (!post) notFound();

  const reviews = await getReviewsForUser(post.traveller_id, 5);
  const traveller = post.traveller!;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-surface-muted/40">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/find-a-traveller" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Back to explore
          </Link>

          <div className="mt-4 grid gap-6 md:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-surface p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12">
                      <AvatarImage src={traveller.avatar_url ?? undefined} />
                      <AvatarFallback>{traveller.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="flex items-center gap-1.5 font-semibold text-foreground">
                        {traveller.display_name ?? traveller.full_name}
                        {traveller.verification_status === "verified" && (
                          <ShieldCheck className="size-4 text-success" />
                        )}
                      </p>
                      <RatingStars rating={traveller.average_rating} reviews={traveller.total_reviews} />
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {post.trip_type.replace("_", " ")}
                  </Badge>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Info label="Available Space" value={`${post.remaining_capacity_kg} kg`} />
                  <Info label="Charge" value={`${formatCents(post.price_per_kg_cents, post.currency)}/kg`} />
                  <Info label="Transport" value={post.transport_type} className="capitalize" />
                  <Info label="Departure" value={format(new Date(post.departure_date), "dd MMM yyyy")} />
                </div>

                <div className="mt-6 flex flex-col gap-2 rounded-lg bg-surface-muted p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <MapPin className="size-4 text-primary" /> {post.origin_city}, {post.origin_country}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <MapPin className="size-4 text-primary" /> {post.destination_city}, {post.destination_country}
                  </span>
                </div>

                {post.return_date && (
                  <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="size-4" /> Return: {format(new Date(post.return_date), "dd MMM yyyy")}
                  </p>
                )}

                {post.categories && post.categories.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {post.categories.map((c) => (
                      <Badge key={c.id} variant="secondary">
                        {c.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {post.notes && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-foreground">Note</p>
                    <p className="text-sm text-muted-foreground">{post.notes}</p>
                  </div>
                )}
              </div>

              {(post.rules || post.insurance_info) && (
                <div className="rounded-2xl border border-border bg-surface p-6">
                  <p className="flex items-center gap-2 font-semibold text-foreground">
                    <ShieldCheck className="size-4 text-primary" /> Policies &amp; Guidelines
                  </p>
                  {post.rules && <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{post.rules}</p>}
                  {post.insurance_info && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Insurance: </span>
                      {post.insurance_info}
                    </p>
                  )}
                </div>
              )}

              <div className="rounded-2xl border border-border bg-surface p-6">
                <p className="font-semibold text-foreground">Recent Reviews</p>
                <div className="mt-4 space-y-4">
                  {reviews.length === 0 ? (
                    <EmptyState title="No reviews yet" description="Be the first to book and leave a review." />
                  ) : (
                    reviews.map((review) => <ReviewCard key={review.id} review={review} />)
                  )}
                </div>
              </div>
            </div>

            <aside className="h-fit space-y-4 rounded-2xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Available</span>
                <span className="font-semibold text-foreground">{post.remaining_capacity_kg} kg</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="text-lg font-semibold text-primary">
                  {formatCents(post.price_per_kg_cents, post.currency)}/kg
                </span>
              </div>
              <Button asChild size="lg" className="w-full">
                <Link href={`/traveller/${post.id}/book`}>Book Space</Link>
              </Button>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Plane className="size-3.5" /> You won&apos;t be charged until your booking is confirmed.
              </p>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Info({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-semibold text-foreground ${className ?? ""}`}>{value}</p>
    </div>
  );
}
