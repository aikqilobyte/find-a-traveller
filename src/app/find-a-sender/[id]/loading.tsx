import { Navbar } from "@/components/layout/navbar";
import { DetailSkeleton } from "@/components/common/page-skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-surface-muted/40">
        <DetailSkeleton />
      </main>
    </div>
  );
}
