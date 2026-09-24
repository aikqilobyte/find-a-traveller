import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CreateOfferForm } from "@/components/booking/create-offer-form";
import { getShipRequestById } from "@/lib/queries/ship-request-detail";
import { getCurrentProfile } from "@/lib/auth";
import { SignInGate } from "@/components/common/sign-in-gate";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = { title: "Make an Offer" };

export default async function MakeOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [profile, request, t] = await Promise.all([getCurrentProfile(), getShipRequestById(id), getDictionary()]);
  if (!request) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-surface-muted/40">
        <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href={`/find-a-sender/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> {t.detail.backToRequest}
          </Link>

          {request.shopper_id === profile?.id ? (
            <p className="mt-4 rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">
              {t.detail.cantOfferOwn}
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {!profile && (
                <SignInGate
                  next={`/find-a-sender/${id}/offer`}
                  title={t.signIn.offerTitle}
                  body={t.signIn.offerBody}
                  signInLabel={t.signIn.signIn}
                  createAccountLabel={t.signIn.createAccount}
                />
              )}
              <CreateOfferForm request={request} isGuest={!profile} t={t.forms} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
