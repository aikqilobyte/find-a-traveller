import Link from "next/link";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Guests can browse and see the full picture; signing in is only required
 * at the point of committing (booking, offering, paying, posting).
 */
export function SignInGate({ next, title, body, signInLabel, createAccountLabel }: { next: string; title: string; body: string; signInLabel: string; createAccountLabel: string }) {
  const encoded = encodeURIComponent(next);

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link href={`/login?next=${encoded}`}>
            <LogIn /> {signInLabel}
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={`/signup?next=${encoded}`}>{createAccountLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
