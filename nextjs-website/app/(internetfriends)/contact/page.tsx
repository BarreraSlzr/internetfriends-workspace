import CompanyInfo from "@/app/(internetfriends)/components/company-info";
import { HeaderEngineering } from "@/components/organisms/header/header.engineering";
import Navigation from "@/app/(internetfriends)/components/navigation";
import SocialLinks from "@/app/(internetfriends)/components/social-links";
import content from "@/app/(internetfriends)/content.json";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ContactFormEngineering } from "../components/contact-form.engineering";
import { Suspense } from "react";

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
        <h1 className="heading-1 mb-6">{content.contact.title}</h1>

        <div className="card p-6 mb-6">
          <p className="body-text mb-4 max-w-2xl">
            {content.contact.description}
          </p>
        </div>

        <div className="card p-6">
          <div className="mb-6">
            <p className="body-text mb-4">
              Share Your Vision and Watch It Come to Life!
            </p>
            <Suspense
              fallback={
                <div className="text-small">Loading contact form...</div>
              }
            >
              <ContactFormEngineering />
            </Suspense>
          </div>

          <div
            className="border-t pt-4"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            {contact.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                title={c.title}
                className="flex items-center justify-between p-3 transition-colors rounded-md hover:brightness-90"
              >
                <span className="body-text">{c.description}</span>
                <span
                  className="flex items-center gap-2 text-small"
                  style={{ color: "var(--system-blue)" }}
                >
                  {c.title}
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Navigation />
      <SocialLinks />
      <CompanyInfo />
    </main>
  );
}
