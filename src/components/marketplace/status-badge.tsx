import { Badge } from "@/components/ui/badge";
import { BOOKING_STATUS_LABELS, STATUS_TONE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const TONE_CLASSES: Record<string, string> = {
  success: "bg-success-bg text-success border-transparent",
  warning: "bg-warning-bg text-warning border-transparent",
  error: "bg-error-bg text-error border-transparent",
  info: "bg-info-bg text-info border-transparent",
  pending: "bg-pending-bg text-pending border-transparent",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = STATUS_TONE[status] ?? "info";
  const label = BOOKING_STATUS_LABELS[status] ?? status.replace(/_/g, " ");

  return (
    <Badge variant="outline" className={cn(TONE_CLASSES[tone], "capitalize", className)}>
      {label}
    </Badge>
  );
}
