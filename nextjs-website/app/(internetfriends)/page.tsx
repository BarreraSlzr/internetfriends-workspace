import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { CustomCard } from "@/app/(internetfriends)/components/custom-card";
import CompanyInfo from "@/app/(internetfriends)/components/company-info";
import HeaderSimple from "@/app/(internetfriends)/components/header-simple";
import HeroText from "@/app/(internetfriends)/components/hero-text";
import Navigation from "@/app/(internetfriends)/components/navigation";
import SocialLinks from "@/app/(internetfriends)/components/social-links";
import { EmailSubscriptionForm } from "@/app/(internetfriends)/components/email-subscription-form";

// Force dynamic rendering to bypass SSR hook issues
export const dynamic = "force-dynamic";

const mainIdeas = [
  {
    subtitle: "Creative Projects",
    title: "Got a Big Idea?",
    description:
      "Whether it's a website, an app, or something wild and new, we help bring your vision to life—no idea is too crazy for us.",
    project_scope: "Let's create a Creative Project",
    cta_word: "Let's Build",
    className:
      "bg-gradient-to-tr from-brand-blue-300 via-brand-blue-300 to-brand-blue-500 text-white dark:text-foreground",
  },
  {
    subtitle: "Ready for Anything",
    title: "Need a Hand with Your Project?",
    description:
      "This page may not exist... but your project absolutely can. Let's talk and create something truly unique for you!",
    project_scope: "Let's create a Random Fun Project",
    cta_word: "Let's Talk",
    className:
      "bg-gradient-to-br from-purple-300 via-purple-300 to-purple-500 text-white dark:text-foreground",
  },
];

const randomIdea = [
  {
    subtitle: "Tailored Solutions",
    title: "Simplify Your Workflows",
    description:
      "Let's remove the clutter! We'll streamline your processes so you can focus on the creative stuff (or that morning coffee).",
    project_scope: "Let's create a project about Workflow Optimization",
    cta_word: "Let's Dive In",
  },
  {
    subtitle: "Quick Wins",
    title: "Automate Your Tasks",
    description:
      "Let's free up your time by automating those repetitive tasks. More time for the fun stuff and better results!",
    project_scope: "Let's create a project about Task Automation",
    cta_word: "Automate Now",
  },
  {
    subtitle: "Business Growth",
    title: "Achieve Project Success",
    description:
      "Ready to crush your project goals? We'll equip you with the tools and experience for successful execution.",
    project_scope: "Let's create a project about Project Management",
    cta_word: "Make It Happen",
  },
  {
    subtitle: "Digital Magic",
    title: "Web Development Services",
    description:
      "Build a powerful online presence with a website that works as hard as you do. Let's code something amazing together.",
    project_scope: "Let's create a project about Web Development",
    cta_word: "Start Building",
  },
  {
    subtitle: "Design That Works",
    title: "Transform Your Brand",
    description:
      "Your brand deserves to shine. We'll help you design creative solutions that leave a lasting impression.",
    project_scope: "Let's create a project about Brand Design",
    cta_word: "Revamp Now",
  },
  {
    subtitle: "Optimized Operations",
    title: "Automate Your Business",
    description:
      "From workflows to management, automate everything for smoother operations and happier teams.",
    project_scope: "Let's create a project about Business Automation",
    cta_word: "Optimize Today",
  },
  {
    subtitle: "Innovation First",
    title: "Content Creation and Distribution",
    description:
      "Want to distribute engaging content? We'll help you create, share, and optimize across all channels.",
    project_scope: "Let's create a project about Content Distribution",
    cta_word: "Get Started",
  },
];

export default function Page() {
  const randomMessage =
    randomIdea[Math.floor(Math.random() * randomIdea.length)];
  
  // Random Gloo enablement for visual variety
  const enableGlooOnFirstCard = Math.random() > 0.5;
  const enableGlooOnSecondCard = Math.random() > 0.5;
  const enableGlooOnRandomCard = Math.random() > 0.3;

  // Random color rotation presets - favor normal and subtle
  const colorRotationOptions: Array<'realtime' | 'subtle' | 'normal' | 'dynamic'> = 
    ['realtime', 'subtle', 'normal', 'dynamic'];
  
  const getRandomColorRotation = () => {
    const weights = [0.15, 0.35, 0.35, 0.15]; // Favor subtle and normal
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (let i = 0; i < weights.length; i++) {
      cumulativeWeight += weights[i];
      if (random <= cumulativeWeight) {
        return colorRotationOptions[i];
      }
    }
    return 'normal'; // fallback
  };

  const heroColorRotation = getRandomColorRotation();
  const firstCardColorRotation = getRandomColorRotation();
  const secondCardColorRotation = getRandomColorRotation();
  const randomCardColorRotation = getRandomColorRotation();

  return (
    <main className="pb-12">
      <HeaderSimple />
      <CompanyInfo />
      <Navigation />
      <SocialLinks />
      <section className="relative min-h-[60vh] min-h-fit">
        <HeroText 
          useGloo={true} 
          backgroundStrategy="gloo"
          speed={Math.random() * 0.5 + 0.2} // Random speed between 0.2-0.7
          colorRotation={heroColorRotation}
        />
      </section>
      <div className="card sm:p-6 p-2 md:p-8 space-y-6 py-6">
        <div className="grid md:grid-cols-2 gap-6">
          {mainIdeas.map((i, index) => (
            <Link
              key={i.title}
              href={`/contact?project_scope=${encodeURIComponent(i.project_scope)}`}
            >
              <CustomCard
                subtitle={i.subtitle}
                title={i.title}
                description={i.description}
                className={i.className}
                gridSize={Math.random() * 0.3 + 0.1} // Random grid size 0.1-0.4
                useGloo={index === 0 ? enableGlooOnFirstCard : enableGlooOnSecondCard}
                glooIntensity={Math.random() * 0.2 + 0.05} // Random intensity 0.05-0.25
                colorRotation={index === 0 ? firstCardColorRotation : secondCardColorRotation}
                cta={
                  <div className="flex items-center gap-1 hover:opacity-70 transition-opacity">
                    {i.cta_word}
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                }
              />
            </Link>
          ))}
        </div>
        <CustomCard
          subtitle={randomMessage.title}
          title={randomMessage.subtitle}
          description={randomMessage.description}
          className="bg-gradient-to-tl from-amber-300 via-amber-300 to-secondary text-foreground dark:text-foreground"
          gridSize={Math.random() * 0.3 + 0.15} // Random grid size 0.15-0.45
          useGloo={enableGlooOnRandomCard}
          glooIntensity={Math.random() * 0.25 + 0.1} // Random intensity 0.1-0.35
          colorRotation={randomCardColorRotation}
          cta={
            <EmailSubscriptionForm
              url={`/contact?project_scope=${encodeURIComponent(randomMessage.project_scope)}`}
            >
              {randomMessage.cta_word}
            </EmailSubscriptionForm>
          }
        />
      </div>
    </main>
  );
}

