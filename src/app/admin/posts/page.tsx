import type { Metadata } from "next";
import { format } from "date-fns";
import { getAllTravellerPosts } from "@/lib/queries/admin";
import { Badge } from "@/components/ui/badge";
import { formatCents } from "@/lib/money";

export const metadata: Metadata = { title: "Admin — Traveller Posts" };

export default async function AdminPostsPage() {
  const posts = await getAllTravellerPosts();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Traveller Posts</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-4">Traveller</th>
              <th className="p-4">Route</th>
              <th className="p-4">Departure</th>
              <th className="p-4">Capacity</th>
              <th className="p-4">Price/kg</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-border last:border-0">
                <td className="p-4">{post.traveller?.full_name}</td>
                <td className="p-4">
                  {post.origin_city} → {post.destination_city}
                </td>
                <td className="p-4 text-muted-foreground">{format(new Date(post.departure_date), "dd MMM yyyy")}</td>
                <td className="p-4">
                  {post.remaining_capacity_kg}/{post.capacity_kg} kg
                </td>
                <td className="p-4">{formatCents(post.price_per_kg_cents, post.currency)}</td>
                <td className="p-4">
                  <Badge variant="outline" className="capitalize">
                    {post.status.replace("_", " ")}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
