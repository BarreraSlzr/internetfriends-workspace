import CompanyInfo from "@/app/(internetfriends)/components/company-info";
import { HeaderOrganism } from "@/components/organisms/header/header.organism";
import HeroText from "@/app/(internetfriends)/components/hero-text";
import Navigation from "@/app/(internetfriends)/components/navigation";
import SocialLinks from "@/app/(internetfriends)/components/social-links";
import content from "@/app/(internetfriends)/content.json";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ContactForm } from "../components/contact-form";
import { GlassRefinedAtomic } from "@/components/atomic/glass-refined";

/**
 * Contact Page
 *
 * Restored from legacy .bak and patched to use the new HeaderOrganism
 * Epic: glass-refinement-v1
 * Future: migrate to a dedicated template + organism composition (contact.section)
 */

const defaultProject = {
  title: "Let's talk",
  href: "mailto:hola@internetfriends.xyz",
  description: "hola@internetfriends.xyz",
};

const contact = [defaultProject];

export default function Page() {
  return (
    <main id="main-content">
      <HeaderOrganism
        variant="glass"
        size="md"
        announcement={{
          show: false,
        }}
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
        skipToMain={true}
      />
      <HeroText useGloo={false} backgroundStrategy="flat">
        <h1 className="text-5xl font-bold sm:pb-6 pb-4 md:pb-8">
          {content.contact.title}
        </h1>

        <GlassRefinedAtomic
          variant="card"
            /* Slightly stronger glass for the heading block */
          strength={0.45}
          noise={false}
          className="sm:p-6 p-2 py-4 md:p-8 flex flex-col"
        >
          <p className="text-lg mb-2 max-w-2xl">
            {content.contact.description}
          </p>
        </GlassRefinedAtomic>

        <GlassRefinedAtomic
          variant="card"
          strength={0.35}
          noise={false}
          className="sm:p-6 p-2 py-4 md:p-8 pt-0 flex flex-col"
        >
          {contact.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              title={c.title}
              className="flex items-center sm:gap-4 gap-2 hover:opacity-70 transition-opacity p-2 border-b-2 border-brand-blue-800 text-brand-blue-100"
            >
              <span className="flex-grow">{c.description}</span>
              <span className="flex flex-row items-center text-right">
                {c.title}
                <ArrowUpRight className="h-4 w-4 rotate" />
              </span>
            </Link>
          ))}

          <div className="flex items-center sm:gap-4 gap-2 p-2 border-brand-blue-800 text-brand-blue-100">
            <div className="flex-grow flex flex-col sm:pb-6 pb-4 md:pb-8">
              <p className="text-lg mb-2 max-w-2xl">
                Share Your Vision and Watch It Come to Life!
              </p>
              <ContactForm />
            </div>
          </div>
        </GlassRefinedAtomic>
      </HeroText>

      <Navigation />
      <SocialLinks />
      <CompanyInfo />
    </main>
  );
}

import { generateStamp } from "@/lib/utils/timestamp";