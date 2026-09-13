import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import { getCategories } from "@/lib/queries/categories";
import { CreateShipRequestForm } from "@/components/posts/create-ship-request-form";

export const metadata: Metadata = { title: "New Ship Request" };

export default async function NewShipRequestPage() {
  await requireProfile("/dashboard/posts/new/ship-request");
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-foreground">Request an item</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tell travellers what you need, from where, and how much you&apos;re willing to pay.
      </p>
      <div className="mt-6">
        <CreateShipRequestForm categories={categories} />
      </div>
    </div>
  );
}
