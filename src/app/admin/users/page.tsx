import type { Metadata } from "next";
import { format } from "date-fns";
import { getAllUsers } from "@/lib/queries/admin";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "@/components/admin/user-actions";
import type { Profile } from "@/lib/types/database";

export const metadata: Metadata = { title: "Admin — Users" };

export default async function AdminUsersPage() {
  const users = (await getAllUsers()) as Profile[];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Users</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Verification</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border last:border-0">
                <td className="p-4 font-medium text-foreground">
                  {user.full_name} {user.is_suspended && <Badge variant="destructive" className="ml-2">Suspended</Badge>}
                </td>
                <td className="p-4 text-muted-foreground">{user.email}</td>
                <td className="p-4">
                  <Badge variant="outline" className="capitalize">
                    {user.verification_status}
                  </Badge>
                </td>
                <td className="p-4">{user.average_rating.toFixed(1)} ({user.total_reviews})</td>
                <td className="p-4 text-muted-foreground">{format(new Date(user.created_at), "dd MMM yyyy")}</td>
                <td className="p-4">
                  <UserActions user={user} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
