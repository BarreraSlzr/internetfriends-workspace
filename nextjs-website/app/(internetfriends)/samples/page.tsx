import CompanyInfo from "@/app/(internetfriends)/components/company-info";
import Header from "@/app/(internetfriends)/components/header";
import HeroText from "@/app/(internetfriends)/components/hero-text";
import Navigation from "@/app/(internetfriends)/components/navigation";
import SocialLinks from "@/app/(internetfriends)/components/social-links";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import content from "../content.json";
import { GlassRefinedAtomic } from "@/components/atomic/glass-refined";

// Force dynamic rendering to bypass SSR hook issues
export const dynamic = "force-dynamic";

const defaultProject = {
  title: "LuxonFilms.com",
  href: "https://luxon.internetfriends.xyz",
  description: "Website",
};

const projects = [
  defaultProject,
  {
    title: "SofiaSalud",
    href: "https://sofia.internetfriends.xyz",
    description: "Chatbot, Agent AI, MVP",
  },
  {
    title: "Orders Managment",
    href: "https://orders.internetfriends.xyz/",
    description: "Progressive Web App, System",
  },
  {
    title: "Henah Real State",
    href: "https://henah.internetfriends.xyz/",
    description: "Website, MVP",
  },
  {
    title: "Curriculum Vitae",
    href: "https://barreraslzr.internetfriends.xyz/old",
    description: "Website",
  },
  {
    title: "SuPanchaMadre Restaurant",
    href: "https://supanchamadre.internetfriends.xyz/",
    description: "Website, MVP",
  },
  {
    title: "Domain Provider",
    href: "https://internetfriends.xyz/domains",
    description: "e-Commerce, API System",
  },
];

export default function Page() {
  return (
    <main>
      <Header />
      <HeroText useGloo={false} backgroundStrategy="flat">
        <h1 className="text-5xl font-bold sm:pb-6 pb-4 md:pb-8">
          {content.samples.title}
        </h1>
        <GlassRefinedAtomic
          variant="card"
          strength={0.45}
          noise={false}
          className="sm:p-6 p-2 py-4 md:p-8 flex flex-col"
        >
          <p className="text-lg mb-2 max-w-2xl">
            {content.samples.description}
          </p>
        </GlassRefinedAtomic>
        <GlassRefinedAtomic
          variant="card"
          strength={0.35}
          noise={false}
          className="sm:p-6 p-2 py-4 md:p-8 pt-0 flex flex-col"
        >
          {projects.map((p, index) => (
            <Link
              key={p.href}
              href={p.href}
              title={p.title}
              referrerPolicy="origin"
              target="_blank"
              className="flex items-center sm:gap-4 gap-2 hover:opacity-70 transition-opacity p-2 border-t-2 border-brand-blue-800 text-brand-blue-100"
            >
              <span className="font-mono font-bold mb-auto">0{index + 1}</span>
              <span className="flex-grow">{p.description}</span>
              <span className="flex flex-row items-center text-right">
                {p.title}
                <ArrowUpRight className="h-4 w-4 rotate" />
              </span>
            </Link>
          ))}
        </GlassRefinedAtomic>
      </HeroText>
      <Navigation />
      <SocialLinks />
      <CompanyInfo />
    </main>
  );
}

