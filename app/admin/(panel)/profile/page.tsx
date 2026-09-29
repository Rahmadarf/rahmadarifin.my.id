import { requireAdmin } from "@/lib/auth/admin";
import { getOwnProfile } from "@/lib/data/admin";
import { PanelHeader } from "@/components/admin/panel-header";
import { ProfileForm } from "@/components/admin/profile-form";

export const metadata = { title: "Profile — Admin" };

export default async function AdminProfilePage() {
  const { user } = await requireAdmin();
  const { profile, photoUrl } = await getOwnProfile();

  return (
    <>
      <PanelHeader
        title="Profile"
        subtitle="Hero, About, and Contact copy for the public site."
      />
      <ProfileForm
        ownerId={user.id}
        profile={profile}
        photoUrl={photoUrl}
      />
    </>
  );
}
