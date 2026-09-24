import type { Metadata } from "next";
import { getAllShipRequests } from "@/lib/queries/admin";
import { Badge } from "@/components/ui/badge";
import { formatCents } from "@/lib/money";

export const metadata: Metadata = { title: "Admin — Ship Requests" };

export default async function AdminShipRequestsPage() {
  const requests = await getAllShipRequests();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Ship Requests</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-4">Package Owner</th>
              <th className="p-4">Item</th>
              <th className="p-4">Route</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-b border-border last:border-0">
                <td className="p-4">{request.shopper?.full_name}</td>
                <td className="max-w-48 truncate p-4">{request.item_description}</td>
                <td className="p-4">
                  {request.origin_city} → {request.destination_city}
                </td>
                <td className="p-4">{formatCents(request.proposed_payment_cents, request.currency)}</td>
                <td className="p-4">
                  <Badge variant="outline" className="capitalize">
                    {request.status.replace("_", " ")}
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
