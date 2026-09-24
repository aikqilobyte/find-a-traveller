import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PartyIdentity, IdentityHiddenNote } from "@/components/common/party-identity";
import { BookingForm } from "@/components/booking/booking-form";
import { getTravellerPostById } from "@/lib/queries/traveller-post-detail";
import { getCategories } from "@/lib/queries/categories";
import { getReviewsForUser } from "@/lib/queries/reviews";
import { ReviewCard } from "@/components/reviews/review-card";
import { EmptyState } from "@/components/common/empty-state";
import { getCurrentProfile } from "@/lib/auth";
import { SignInGate } from "@/components/common/sign-in-gate";
import { getDictionary } from "@/lib/i18n";
import { formatCents } from "@/lib/money";

export const metadata: Metadata = { title: "Book Space" };

export default async function BookSpacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [profile, post, categories, t] = await Promise.all([
    getCurrentProfile(),
    getTravellerPostById(id),
    getCategories(),
    getDictionary(),
  ]);
  if (!post) notFound();

  const isOwnPost = post.traveller_id === profile?.id;
  const reviews = await getReviewsForUser(post.traveller_id, 3);
  const traveller = post.traveller!;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-surface-muted/40">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href={`/traveller/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> {t.detail.backToExplore}
          </Link>

          <div className="mt-4 grid gap-6 md:grid-cols-[320px_1fr]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-surface p-5">
                <PartyIdentity profile={traveller} revealed={false} />
                <IdentityHiddenNote className="mt-2" />
                <div className="mt-4 flex items-center justify-between rounded-lg bg-surface-muted p-3 text-sm">
                  <span className="font-semibold text-foreground">{post.remaining_capacity_kg} kg available</span>
                  <span className="font-semibold text-primary">{formatCents(post.price_per_kg_cents, post.currency)}/kg</span>
                </div>
                <p className="mt-3 text-xs font-medium uppercase text-primary">
                  {post.trip_type === "one_way" ? t.detail.oneWay : t.detail.roundWay}
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {post.origin_city} → {post.destination_city}
                </p>
                {post.notes && <p className="mt-2 text-xs text-muted-foreground">{post.notes}</p>}
              </div>

              {(post.rules || post.insurance_info) && (
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <ShieldCheck className="size-4 text-primary" /> {t.detail.policies}
                  </p>
                  {post.rules && <p className="mt-2 whitespace-pre-line text-xs text-muted-foreground">{post.rules}</p>}
                </div>
              )}

              <div className="rounded-2xl border border-border bg-surface p-5">
                <p className="text-sm font-semibold text-foreground">{t.detail.recentReviews}</p>
                <div className="mt-3 space-y-3">
                  {reviews.length === 0 ? (
                    <EmptyState title={t.detail.noReviews} />
                  ) : (
                    reviews.map((review) => <ReviewCard key={review.id} review={review} />)
                  )}
                </div>
              </div>
            </div>

            <div>
              {isOwnPost ? (
                <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">
                  {t.detail.cantBookOwn}
                </div>
              ) : post.status !== "active" ? (
                <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">
                  {t.detail.notAcceptingBookings}
                </div>
              ) : (
                <div className="space-y-4">
                  {!profile && (
                    <SignInGate
                      next={`/traveller/${id}/book`}
                      title={t.signIn.bookTitle}
                      body={t.signIn.bookBody}
                      signInLabel={t.signIn.signIn}
                      createAccountLabel={t.signIn.createAccount}
                    />
                  )}
                  <BookingForm post={post} categories={categories} isGuest={!profile} t={t.forms} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

