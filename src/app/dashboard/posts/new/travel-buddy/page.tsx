import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import { CreateTravelBuddyForm } from "@/components/posts/create-travel-buddy-form";

export const metadata: Metadata = { title: "New Travel Buddy Post" };

export default async function NewTravelBuddyPage() {
  await requireProfile("/dashboard/posts/new/travel-buddy");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-foreground">Find a travel buddy</h1>
      <p className="mt-1 text-sm text-muted-foreground">Share your upcoming trip and connect with people travelling your route.</p>
      <div className="mt-6">
        <CreateTravelBuddyForm />
      </div>
    </div>
  );
}
