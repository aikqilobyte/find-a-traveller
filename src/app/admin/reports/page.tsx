import type { Metadata } from "next";
import { format } from "date-fns";
import { getAllReports } from "@/lib/queries/admin";
import { Badge } from "@/components/ui/badge";
import { ReportActions } from "@/components/admin/report-actions";
import { EmptyState } from "@/components/common/empty-state";
import { Flag } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Reports" };

export default async function AdminReportsPage() {
  const reports = await getAllReports();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Reports</h1>

      {reports.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Flag} title="No reports filed" />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground">
                    {report.reason} <span className="text-muted-foreground">· {report.target_type}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Reported by {(report.reporter as unknown as { full_name: string } | null)?.full_name ?? "user"} on{" "}
                    {format(new Date(report.created_at), "dd MMM yyyy")}
                  </p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {report.status}
                </Badge>
              </div>
              {report.description && <p className="mt-2 text-sm text-muted-foreground">{report.description}</p>}
              <div className="mt-3">
                <ReportActions reportId={report.id} status={report.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
