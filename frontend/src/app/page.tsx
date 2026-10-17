import {
  getHomePageData,
  getCapabilities,
  getProjects,
  getProjectBySlug,
  getTechnologies,
  getExperience,
  getExperiments,
  getNotes,
  getSiteSettings,
} from '@/lib/cms';
import { HeroSection } from '@/components/sections/HeroSection';
import { MarqueeSection } from '@/components/sections/MarqueeSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { CapabilitiesSection } from '@/components/sections/CapabilitiesSection';
import { FeaturedWorkSection } from '@/components/sections/FeaturedWorkSection';
import { ToolboxSection } from '@/components/sections/ToolboxSection';
import { JourneySection } from '@/components/sections/JourneySection';
import { LabSection } from '@/components/sections/LabSection';
import { NotesSection } from '@/components/sections/NotesSection';
import { ContactSection } from '@/components/sections/ContactSection';

export default async function HomePage() {
  const homeData = await getHomePageData();
  const settings = await getSiteSettings();
  const capabilities = await getCapabilities();
  const projects = await getProjects();
  const featuredHeroProject = await getProjectBySlug(homeData.hero.featuredProjectId);
  const technologies = await getTechnologies();
  const experience = await getExperience();
  const experiments = await getExperiments();
  const notes = await getNotes();

  return (
    <>
      {/* Section 02: Hero Poster */}
      <HeroSection
        data={homeData.hero}
        featuredProject={featuredHeroProject}
      />

      {/* Section 03: Marquee Ribbon */}
      <MarqueeSection items={homeData.marquee} />

      {/* Section 04: About / Short Manifesto */}
      <AboutSection data={homeData.manifesto} />

      {/* Section 05: Capabilities / What I Build */}
      <CapabilitiesSection items={capabilities} />

      {/* Section 06: Featured Work / Case Studies */}
      <FeaturedWorkSection projects={projects} />

      {/* Section 07: Toolbox / Engineering Shelf */}
      <ToolboxSection technologies={technologies} />

      {/* Section 08: Journey / Timeline */}
      <JourneySection items={experience} />

      {/* Section 09: Lab / Experiments Grid */}
      <LabSection experiments={experiments} />

      {/* Section 10: Notes / Field Logs */}
      <NotesSection notes={notes} />

      {/* Section 11: Contact / Final Poster */}
      <ContactSection settings={settings} />
    </>
  );
}
