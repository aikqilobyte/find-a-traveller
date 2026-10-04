import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getCategories } from "@/lib/queries/categories";
import { CreateShipRequestForm } from "@/components/posts/create-ship-request-form";

export const metadata: Metadata = { title: "Post a Package" };

/**
 * Posting without an account.
 *
 * Public on purpose: asking somebody to register before they have seen the
 * product do anything is where most of them leave. The account is still
 * created, from the email they give, but behind the form rather than in
 * front of it.
 */
export default async function PostAPackagePage() {
  const categories = await getCategories();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-foreground">Post a package</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us what needs moving and where. No account needed — travellers on your route can
            make you an offer, and we will email them to you.
          </p>
          <div className="mt-8">
            <CreateShipRequestForm categories={categories} guest />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
