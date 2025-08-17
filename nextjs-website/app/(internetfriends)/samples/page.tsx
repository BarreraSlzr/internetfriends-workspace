import CompanyInfo from "@/app/(internetfriends)/components/company-info";
import { HeaderEngineering } from "@/components/organisms/header/header.engineering";
import HeroText from "@/app/(internetfriends)/components/hero-text";
import Navigation from "@/app/(internetfriends)/components/navigation";
import SocialLinks from "@/app/(internetfriends)/components/social-links";
import { PremiumContent, UserStatus } from "@/lib/permissions/components";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import content from "../content.json";

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
      <HeroText useGloo={false} backgroundStrategy="flat">
        <div className="flex justify-between items-start">
          <h1 className="text-5xl font-bold sm:pb-6 pb-4 md:pb-8">
            {content.samples.title}
          </h1>
          <UserStatus />
        </div>
        <div className="card sm:p-6 p-2 py-4 md:p-8">
          <p className="text-lg mb-2 max-w-2xl">
            {content.samples.description}
          </p>
        </div>
        
        {/* Free Projects */}
        <div className="card sm:p-6 p-2 py-4 md:p-8 pt-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Public Projects</h2>
          {projects.slice(0, 2).map((p, index) => (
            <Link
              key={p.href}
              href={p.href}
              title={p.title}
              referrerPolicy="origin"
              target="_blank"
              className="flex items-center sm:gap-4 gap-2 hover:brightness-75 transition-all p-2 border-t border-gray-200 text-gray-700"
            >
              <span className="font-mono font-bold mb-auto text-sm">0{index + 1}</span>
              <span className="flex-grow">{p.description}</span>
              <span className="flex flex-row items-center text-right font-medium">
                {p.title}
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </span>
            </Link>
          ))}
        </div>
        
        {/* Premium Projects */}
        <PremiumContent>
          <div className="card sm:p-6 p-2 py-4 md:p-8 pt-6 border-2 border-blue-200">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">🎯 Premium Project Portfolio</h2>
            <p className="text-blue-700 text-sm mb-4">Advanced projects and case studies available to premium members</p>
            {projects.slice(2).map((p, index) => (
              <Link
                key={p.href}
                href={p.href}
                title={p.title}
                referrerPolicy="origin"
                target="_blank"
                className="flex items-center sm:gap-4 gap-2 hover:brightness-75 transition-all p-2 border-t border-blue-200 text-blue-700"
              >
                <span className="font-mono font-bold mb-auto text-sm">0{index + 3}</span>
                <span className="flex-grow">{p.description}</span>
                <span className="flex flex-row items-center text-right font-medium">
                  {p.title}
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </span>
              </Link>
            ))}
          </div>
        </PremiumContent>
      </HeroText>
      <Navigation />
      <SocialLinks />
      <CompanyInfo />
    </main>
  );
}

