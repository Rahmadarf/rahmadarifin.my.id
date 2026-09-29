import {
  AboutSection,
  ContactSection,
  FeaturedProjectsSection,
  HeroSection,
  TimelineSection,
} from "@/components/site/home-sections";
import { SkillsSection } from "@/components/site/skills-section";
import { SiteFooter } from "@/components/site/site-footer";
import {
  getPublicProfile,
  getPublishedProjects,
  getPublishedSkills,
  getPublishedSocialLinks,
  getPublishedTimeline,
} from "@/lib/data/portfolio";

// All reads go through the anon client and RLS, so this page can only ever
// render published content.
export const revalidate = 300;

export default async function HomePage() {
  const [profile, featured, skills, timeline, socialLinks] = await Promise.all([
    getPublicProfile(),
    getPublishedProjects({ featuredOnly: true, limit: 3 }),
    getPublishedSkills(),
    getPublishedTimeline(),
    getPublishedSocialLinks(),
  ]);

  return (
    <>
      <HeroSection profile={profile} socialLinks={socialLinks} />
      <AboutSection profile={profile} />
      <FeaturedProjectsSection projects={featured} />
      <SkillsSection skills={skills} />
      <TimelineSection entries={timeline} />
      <ContactSection profile={profile} socialLinks={socialLinks} />
      <SiteFooter note={profile.footer_note} />
    </>
  );
}
