import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CreateOfferForm } from "@/components/booking/create-offer-form";
import { getShipRequestById } from "@/lib/queries/ship-request-detail";
import { requireProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "Make an Offer" };

export default async function MakeOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile(`/ship-requests/${id}/offer`);
  const request = await getShipRequestById(id);
  if (!request) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-surface-muted/40">
        <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href={`/ship-requests/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Back to request
          </Link>

          {request.shopper_id === profile.id ? (
            <p className="mt-4 rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">
              You can&apos;t make an offer on your own request.
            </p>
          ) : (
            <div className="mt-4">
              <CreateOfferForm request={request} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
