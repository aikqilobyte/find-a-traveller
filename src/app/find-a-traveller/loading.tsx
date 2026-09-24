import { Navbar } from "@/components/layout/navbar";
import { CardGridSkeleton } from "@/components/common/page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-surface-muted">
          <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 lg:px-8">
            <Skeleton className="mx-auto h-9 w-2/3 max-w-lg" />
          </div>
        </section>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <Skeleton className="hidden h-[32rem] w-full rounded-2xl lg:block" />
            <CardGridSkeleton />
          </div>
        </div>
      </main>
    </div>
  );
}
