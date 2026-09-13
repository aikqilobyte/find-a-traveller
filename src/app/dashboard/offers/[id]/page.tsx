import { redirect } from "next/navigation";

// Offers and bookings share one unified record (see ARCHITECTURE.md), so
// the offer detail view is the same order detail page.
export default async function OfferDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/dashboard/orders/${id}`);
}
