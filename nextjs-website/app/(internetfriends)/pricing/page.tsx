import CompanyInfo from "@/app/(internetfriends)/components/company-info";
import { HeaderOrganism } from "@/components/organisms/header/header.organism";
import HeroText from "@/app/(internetfriends)/components/hero-text";
import Navigation from "@/app/(internetfriends)/components/navigation";
import SocialLinks from "@/app/(internetfriends)/components/social-links";
import content from "@/app/(internetfriends)/content.json";
import engagementOptions from "@/app/(internetfriends)/lib/engagementOptions";
import { Badge } from "@/components/ui/badge";
import { GlassRefinedAtomic } from "@/components/atomic/glass-refined";

/**
 * Pricing Page
 *
 * Restored from legacy .bak and upgraded to use the new HeaderOrganism.
 * Epic: glass-refinement-v1
 * Future: extract pricing tiers into a dedicated data module & organism (pricing.section)
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
      <HeroText useGloo={false} backgroundStrategy="flat">
        <h1 className="text-5xl font-bold sm:pb-6 pb-4 md:pb-8">
          {content.pricing.title}
        </h1>

        {/* Intro / description block */}
        <GlassRefinedAtomic
          variant="card"
          strength={0.45}
          noise={false}
          className="sm:p-6 p-2 py-4 md:p-8 flex flex-col"
        >
          <p className="text-lg mb-2 max-w-2xl">
            {content.pricing.description}
          </p>
        </GlassRefinedAtomic>

        {/* Engagement options */}
        <GlassRefinedAtomic
          variant="card"
          strength={0.35}
          noise={false}
          className="sm:p-6 p-2 py-4 md:p-8 pt-0 flex flex-col"
        >
          {engagementOptions.map(
            (
              option: {
                duration: string;
                price: string;
                short_description: string;
                title?: string;
              },
              index: number,
            ) => (
              <div
                key={option.title ?? index}
                className="flex items-center sm:gap-4 gap-2 hover:opacity-70 transition-opacity p-2 border-t-2 border-brand-blue-800 text-brand-blue-100"
              >
                <span className="font-mono font-bold mb-auto">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col flex-grow">
                  <span className="flex flex-row gap-2 justify-between items-center">
                    <Badge className="text-nowrap border-2 border-brand-blue-800 text-brand-blue">
                      {option.duration}
                    </Badge>
                    <span className="font-mono font-bold">{option.price}</span>
                  </span>
                  <span className="flex flex-row items-center">
                    {option.short_description}
                  </span>
                </div>
              </div>
            ),
          )}
          <div className="p-2 border-t-2 border-brand-blue-800 text-brand-blue-100 font-mono text-xs">
            * Nonrefundable upfront payment
          </div>
        </GlassRefinedAtomic>
      </HeroText>

      <Navigation />
      <SocialLinks />
      <CompanyInfo />
    </main>
  );
}
