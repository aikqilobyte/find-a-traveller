import { Navbar } from "@/components/layout/navbar";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { requireProfile } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [, t] = await Promise.all([requireProfile("/dashboard"), getDictionary()]);

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted/40">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
        <DashboardSidebar t={t.dashboard} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
