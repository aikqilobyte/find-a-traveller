import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { NotificationToggle } from "@/components/profile/notification-toggle";

export const metadata: Metadata = { title: "Profile Settings" };

export default async function ProfileSettingsPage() {
  const profile = await requireProfile("/dashboard/profile");

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profile Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your public profile, password, and notification preferences.</p>
      </div>

      <section>
        <h2 className="mb-3 font-semibold text-foreground">Edit Profile</h2>
        <EditProfileForm profile={profile} />
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-foreground">Change Password</h2>
        <ChangePasswordForm />
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-foreground">Notification Settings</h2>
        <NotificationToggle initialEnabled={profile.email_notifications_enabled} />
      </section>
    </div>
  );
}
