import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { getDictionary, getLocale } from "@/lib/i18n";

export async function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-end bg-navy p-10 text-navy-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(61,94,252,0.35),_transparent_60%)]" />
        <div className="relative z-10 mb-auto">
          <Logo onDark />
        </div>
        <div className="relative z-10 space-y-3">
          <p className="text-2xl font-semibold leading-snug">
            Your connections are just a few steps away.
          </p>
          <p className="text-navy-foreground/70">
            Ship items across borders with travellers whose trips are already planned, or earn from
            luggage space you aren&rsquo;t using.
          </p>
        </div>
      </div>

      <div className="flex flex-col p-6 sm:p-10">
        {/* Signing up was a dead end: the only way back was the logo, which on
            a wide screen sits over in the dark panel. The language switch was
            missing here too, so a Bangla reader who reached signup had no way
            to stay in Bangla. */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            {t.auth.backToHome}
          </Link>
          <LanguageSwitcher locale={locale} />
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-1 text-center lg:text-left">
              <div className="flex justify-center lg:hidden">
                <Logo />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
