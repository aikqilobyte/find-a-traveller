import type { Metadata } from "next";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/common/empty-state";
import { Bell } from "lucide-react";
import type { Notification } from "@/lib/types/database";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const profile = await requireProfile("/dashboard/notifications");
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const notifications = (data as Notification[]) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Bell} title="No notifications yet" />
        </div>
      ) : (
        <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
          {notifications.map((notification) => (
            <Link
              key={notification.id}
              href={notification.link ?? "#"}
              className={cn("block p-4 hover:bg-surface-muted", !notification.is_read && "bg-info-bg/40")}
            >
              <p className="font-medium text-foreground">{notification.title}</p>
              {notification.body && <p className="text-sm text-muted-foreground">{notification.body}</p>}
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
