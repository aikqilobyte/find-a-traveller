import Link from "next/link";
import { Plane } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ExploreMenu } from "@/components/layout/explore-menu";
import { UserMenu } from "@/components/layout/user-menu";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { CreatePostButton } from "@/components/create-post/create-post-button";
import { MobileNav } from "@/components/layout/mobile-nav";

export async function Navbar() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Plane className="size-5 text-primary" />
            <span>
              Find a <span className="text-primary">Traveller</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {profile ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-foreground hover:text-primary">
                  Dashboard
                </Link>
                <ExploreMenu label="Explore Posts" />
                <Link href="/dashboard/offers" className="text-sm font-medium text-foreground hover:text-primary">
                  Offers
                </Link>
                <Link href="/dashboard/orders" className="text-sm font-medium text-foreground hover:text-primary">
                  Orders
                </Link>
                <Link href="/travel-buddy" className="text-sm font-medium text-foreground hover:text-primary">
                  Travel Buddy
                </Link>
              </>
            ) : (
              <>
                <Link href="/" className="text-sm font-medium text-foreground hover:text-primary">
                  Home
                </Link>
                <ExploreMenu label="Explore post" />
                <Link href="/about" className="text-sm font-medium text-foreground hover:text-primary">
                  About us
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {profile ? (
            <>
              <CreatePostButton />
              <NotificationBell />
              <UserMenu profile={profile} />
            </>
          ) : (
            <>
              <Link href="/available-space" className="text-sm font-medium text-primary hover:underline">
                Post now — it&apos;s free
              </Link>
              <Button asChild>
                <Link href="/signup">Join Today</Link>
              </Button>
            </>
          )}
        </div>

        <MobileNav profile={profile} />
      </div>
    </header>
  );
}
