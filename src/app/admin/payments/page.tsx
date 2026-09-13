import type { Metadata } from "next";
import { format } from "date-fns";
import { getAllPaymentsAdmin } from "@/lib/queries/admin";
import { Badge } from "@/components/ui/badge";
import { formatCents } from "@/lib/money";

export const metadata: Metadata = { title: "Admin — Payments" };

export default async function AdminPaymentsPage() {
  const payments = await getAllPaymentsAdmin();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Payments</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-4">Booking</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Method</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-border last:border-0">
                <td className="p-4">{(payment.booking as unknown as { booking_number: string } | null)?.booking_number}</td>
                <td className="p-4">{formatCents(payment.amount_cents, payment.currency)}</td>
                <td className="p-4 capitalize">{payment.payment_method.replace("_", " ")}</td>
                <td className="p-4">
                  <Badge variant="outline" className="capitalize">
                    {payment.status}
                  </Badge>
                </td>
                <td className="p-4 text-muted-foreground">{format(new Date(payment.created_at), "dd MMM yyyy")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
