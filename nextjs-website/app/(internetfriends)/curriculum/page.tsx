import CompanyInfo from "@/app/(internetfriends)/components/company-info";
import { HeaderEngineering } from "@/components/organisms/header/header.engineering";
import Navigation from "@/app/(internetfriends)/components/navigation";
import SocialLinks from "@/app/(internetfriends)/components/social-links";
import content from "@/app/(internetfriends)/content.json";
import dynamic from "next/dynamic";

// Dynamic import for heavy ProfileCard component
const ProfileCard = dynamic(() => import("../components/profile/profile-card"), {
  loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded"></div>
});

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
      <HeaderEngineering
        logo={{
          text: "InternetFriends",
          href: "/",
        }}
        navigation={{
          items: [
            { label: "Home", href: "/" },
            { label: "Samples", href: "/samples" },
            { label: "Pricing", href: "/pricing" },
            { label: "Contact", href: "/contact" },
          ],
        }}
        actions={[
          { label: "Get Started", href: "/contact", variant: "primary" },
        ]}
      />

      <div className="container p-8">
        <h1 className="heading-1 mb-6">{content.curriculum.title}</h1>

        <div className="card p-6">
          <ProfileCard />
        </div>
      </div>

      <Navigation />
      <SocialLinks />
      <CompanyInfo />
    </main>
  );
}
