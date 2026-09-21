import { Logo } from "@/components/layout/logo";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
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
            Share luggage space, ship items across borders, and find a travel buddy — with verified,
            trusted travellers.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
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
  );
}
