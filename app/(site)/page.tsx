import { AboutSection } from "@/components/site/about-section";
import {
  ContactSection,
  HeroSection,
  JourneySection,
  ProjectsSection,
  SkillsSection,
} from "@/components/site/home-sections";
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
  const [profile, projects, skills, timeline, socialLinks] = await Promise.all([
    getPublicProfile(),
    getPublishedProjects(),
    getPublishedSkills(),
    getPublishedTimeline(),
    getPublishedSocialLinks(),
  ]);

  // The design gives one project a large card and two the standard grid. The
  // `is_featured` flag picks the lead; without one, the first by sort order
  // takes the slot so the layout never loses its anchor.
  const lead = projects.find((project) => project.is_featured) ?? projects[0];
  const grid = projects
    .filter((project) => project.id !== lead?.id)
    .slice(0, 2);

  return (
    <>
      <HeroSection profile={profile} socialLinks={socialLinks} />
      <AboutSection profile={profile} />
      <ProjectsSection lead={lead ?? null} grid={grid} />
      <SkillsSection skills={skills} />
      <JourneySection entries={timeline} />
      <ContactSection profile={profile} socialLinks={socialLinks} />
      <SiteFooter note={profile.footer_note} name={profile.full_name} />
    </>
  );
}
