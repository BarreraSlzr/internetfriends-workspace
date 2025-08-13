import CompanyInfo from "@/app/(internetfriends)/components/company-info";
import { HeaderOrganism } from "@/components/organisms/header/header.organism";
import HeroText from "@/app/(internetfriends)/components/hero-text";
import Navigation from "@/app/(internetfriends)/components/navigation";
import SocialLinks from "@/app/(internetfriends)/components/social-links";
import content from "@/app/(internetfriends)/content.json";
import ProfileCard from "../components/profile/profile-card";
import { GlassRefinedAtomic } from "@/components/atomic/glass-refined";

/**
 * Curriculum Page
 *
 * Restored from legacy backup (.bak) and upgraded to use the new HeaderOrganism.
 * Epic: glass-refinement-v1
 * Future:
 *  - Extract profile display into an organism (profile.section)
 *  - Add structured metadata + JSON-LD for resume indexing
 */

export default function Page() {
  return (
    <main id="main-content">
      <HeaderOrganism
        variant="glass"
        size="md"
        navigation={{
          items: [],
        }}
        themeToggle={{
          show: true,
          showLabels: false,
        }}
        languageSelector={{
          show: false,
        }}
        skipToMain
      />
      <HeroText
        className="min-h-fit"
        useGloo={false}
        backgroundStrategy="subtle"
      >
        <h1 className="text-5xl font-bold sm:pb-6 pb-4 md:pb-8">
          {content.curriculum.title}
        </h1>

        <GlassRefinedAtomic
          variant="card"
          strength={0.4}
          noise={false}
          className="sm:px-6 px-2 md:px-8 py-12 pt-6"
        >
          <ProfileCard />
        </GlassRefinedAtomic>
      </HeroText>
      <Navigation />
      <SocialLinks />
      <CompanyInfo />
    </main>
  );
}

import { generateStamp } from "@/lib/utils/timestamp";