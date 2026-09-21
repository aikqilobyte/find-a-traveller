import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import { getCategories } from "@/lib/queries/categories";
import { CreateLuggagePostForm } from "@/components/posts/create-luggage-post-form";

export const metadata: Metadata = { title: "Share Luggage Space" };

export default async function NewLuggagePostPage() {
  await requireProfile("/dashboard/posts/new/trip");
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-foreground">Share your luggage space</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Publish your unused luggage capacity so shoppers on your route can book it.
      </p>
      <div className="mt-6">
        <CreateLuggagePostForm categories={categories} />
      </div>
    </div>
  );
}
