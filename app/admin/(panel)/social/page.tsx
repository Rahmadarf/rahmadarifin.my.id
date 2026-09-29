import { listOwnSocialLinks } from "@/lib/data/admin";
import { PanelHeader } from "@/components/admin/panel-header";
import { SocialForm } from "@/components/admin/social-form";

export const metadata = { title: "Social Links — Admin" };

export default async function AdminSocialPage() {
  const links = await listOwnSocialLinks();

  return (
    <>
      <PanelHeader
        title="Social Links"
        subtitle="Update the contact and social links shown across your site."
      />
      <SocialForm links={links} />
    </>
  );
}
