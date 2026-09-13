import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, MapPin, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/marketplace/rating-stars";
import { MessageButton } from "@/components/marketplace/message-button";
import { getTravelBuddyPostById } from "@/lib/queries/travel-buddy-detail";
import { getCurrentProfile } from "@/lib/auth";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await getTravelBuddyPostById(id);
  if (!post) return { title: "Travel Buddy post not found" };
  return { title: `${post.origin_city} to ${post.destination_city} — Travel Buddy` };
}

export default async function TravelBuddyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, viewer] = await Promise.all([getTravelBuddyPostById(id), getCurrentProfile()]);
  if (!post) notFound();

  const user = post.user!;
  const isOwnPost = viewer?.id === user.id;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-surface-muted/40">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/travel-buddy" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Back to explore
          </Link>

          <div className="mt-4 grid gap-6 md:grid-cols-[1fr_280px]">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarImage src={user.avatar_url ?? undefined} />
                  <AvatarFallback>{user.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="flex items-center gap-1.5 font-semibold text-foreground">
                    {user.display_name ?? user.full_name}
                    {user.verification_status === "verified" && <ShieldCheck className="size-4 text-success" />}
                  </p>
                  <RatingStars rating={user.average_rating} reviews={user.total_reviews} />
                </div>
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

              <p className="mt-4 text-sm text-muted-foreground">
                Travelling {format(new Date(post.travel_date), "dd MMM yyyy")}
                {post.return_date && ` – returning ${format(new Date(post.return_date), "dd MMM yyyy")}`}
              </p>

              <div className="mt-3">
                <Badge variant="secondary" className="capitalize">
                  {post.transport_type}
                </Badge>
              </div>

              {post.preferences && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-foreground">Travel preferences</p>
                  <p className="text-sm text-muted-foreground">{post.preferences}</p>
                </div>
              )}

              {post.description && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-foreground">About this trip</p>
                  <p className="text-sm text-muted-foreground">{post.description}</p>
                </div>
              )}
            </div>

            <aside className="h-fit rounded-2xl border border-border bg-surface p-6">
              {isOwnPost ? (
                <p className="text-sm text-muted-foreground">This is your travel buddy post.</p>
              ) : viewer ? (
                <MessageButton postId={post.id} otherUserId={user.id} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  <Link href={`/login?next=/travel-buddy/${post.id}`} className="text-primary hover:underline">
                    Sign in
                  </Link>{" "}
                  to message this traveller.
                </p>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
