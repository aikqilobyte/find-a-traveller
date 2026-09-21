import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { getDictionary, getLocale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { ExploreMenu } from "@/components/layout/explore-menu";
import { UserMenu } from "@/components/layout/user-menu";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { CreatePostButton } from "@/components/create-post/create-post-button";
import { MobileNav } from "@/components/layout/mobile-nav";

export async function Navbar() {
  const [profile, t, locale] = await Promise.all([getCurrentProfile(), getDictionary(), getLocale()]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />

          <nav className="hidden items-center gap-6 md:flex">
            {profile ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-foreground hover:text-primary">
                  {t.nav.dashboard}
                </Link>
                <ExploreMenu
                  label={t.nav.explorePosts}
                  travellerLabel={t.nav.exploreAsTraveller}
                  travellerHint={t.nav.exploreAsTravellerHint}
                  senderLabel={t.nav.exploreAsSender}
                  senderHint={t.nav.exploreAsSenderHint}
                />
                <Link href="/dashboard/offers" className="text-sm font-medium text-foreground hover:text-primary">
                  {t.nav.offers}
                </Link>
                <Link href="/dashboard/orders" className="text-sm font-medium text-foreground hover:text-primary">
                  {t.nav.orders}
                </Link>
              </>
            ) : (
              <>
                <Link href="/" className="text-sm font-medium text-foreground hover:text-primary">
                  {t.nav.home}
                </Link>
                <ExploreMenu
                  label={t.nav.explorePosts}
                  travellerLabel={t.nav.exploreAsTraveller}
                  travellerHint={t.nav.exploreAsTravellerHint}
                  senderLabel={t.nav.exploreAsSender}
                  senderHint={t.nav.exploreAsSenderHint}
                />
                <Link href="/about" className="text-sm font-medium text-foreground hover:text-primary">
                  {t.nav.about}
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher locale={locale} />
          {profile ? (
            <>
              <CreatePostButton label={t.nav.createPost} />
              <NotificationBell />
              <UserMenu profile={profile} />
            </>
          ) : (
            <>
              <Link href="/find-a-traveller" className="px-1 text-sm font-medium text-primary hover:underline">
                {t.nav.postNowFree}
              </Link>
              <Button asChild>
                <Link href="/signup">{t.nav.joinToday}</Link>
              </Button>
            </>
          )}
        </div>

        <MobileNav profile={profile} t={t.nav} locale={locale} />
      </div>
    </header>
  );
}
