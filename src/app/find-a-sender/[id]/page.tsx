import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, MapPin } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PartyIdentity, IdentityHiddenNote } from "@/components/common/party-identity";
import { getShipRequestById } from "@/lib/queries/ship-request-detail";
import { formatCents } from "@/lib/money";
import { getDictionary } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const request = await getShipRequestById(id);
  if (!request) return { title: "Request not found" };
  return { title: `${request.item_description} — Ship Request` };
}

export default async function ShipRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [request, t] = await Promise.all([getShipRequestById(id), getDictionary()]);
  if (!request) notFound();

  const shopper = request.shopper!;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-surface-muted/40">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/find-a-sender" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> {t.detail.backToExplore}
          </Link>

          <div className="mt-4 rounded-2xl border border-border bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* No booking exists at browse time, so the receiver stays
                  anonymous until this deal is agreed and paid for. */}
              <PartyIdentity profile={shopper} revealed={false} />
              <IdentityHiddenNote className="max-w-xs" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Info
                label={t.marketplace.deadline}
                value={request.deadline ? format(new Date(request.deadline), "dd MMM yyyy") : t.marketplace.flexible}
              />
              <Info label={t.detail.itemWeight} value={`${request.weight_kg} kg`} />
              <Info label={t.detail.quantity} value={String(request.quantity)} />
              <Info label={t.marketplace.paying} value={formatCents(request.proposed_payment_cents, request.currency)} />
            </div>

            <div className="mt-6 flex flex-col gap-2 rounded-lg bg-surface-muted p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-2 font-medium text-foreground">
                <MapPin className="size-4 text-primary" /> {request.origin_city}, {request.origin_country}
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="flex items-center gap-2 font-medium text-foreground">
                <MapPin className="size-4 text-primary" /> {request.destination_city}, {request.destination_country}
              </span>
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium text-foreground">{t.detail.itemDescription}</p>
              <p className="text-sm text-muted-foreground">{request.item_description}</p>
            </div>

            {request.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-foreground">{t.detail.note}</p>
                <p className="text-sm text-muted-foreground">{request.notes}</p>
              </div>
            )}

            {request.categories && request.categories.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {request.categories.map((c) => (
                  <Badge key={c.id} variant="secondary">
                    {c.name}
                  </Badge>
                ))}
              </div>
            )}

            <Button asChild size="lg" className="mt-6 w-full">
              <Link href={`/find-a-sender/${request.id}/offer`}>{t.marketplace.makeOffer}</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">{value}</p>
    </div>
  );
}
