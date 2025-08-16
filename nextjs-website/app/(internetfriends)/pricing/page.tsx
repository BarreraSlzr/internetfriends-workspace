import CompanyInfo from "@/app/(internetfriends)/components/company-info";
import { HeaderEngineering } from "@/components/organisms/header/header.engineering";
import Navigation from "@/app/(internetfriends)/components/navigation";
import SocialLinks from "@/app/(internetfriends)/components/social-links";
import content from "@/app/(internetfriends)/content.json";
import engagementOptions from "@/lib/data/engagement-options";
import { PremiumContent, UserStatus, AdminOnly } from "@/lib/permissions/components";

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
        <div className="flex justify-between items-start mb-6">
          <h1 className="heading-1">{content.pricing.title}</h1>
          <UserStatus />
        </div>

        <div className="card p-6 mb-6">
          <p className="body-text max-w-2xl">{content.pricing.description}</p>
        </div>

        {/* Premium Features Section */}
        <PremiumContent>
          <div className="card mb-6 border-2 border-blue-200">
            <div className="p-6 bg-blue-50">
              <h2 className="heading-2 text-blue-800 mb-4">🎯 Premium Client Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  <span className="text-blue-700">Priority support response</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  <span className="text-blue-700">Advanced analytics dashboard</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  <span className="text-blue-700">Custom integration options</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  <span className="text-blue-700">Extended project timelines</span>
                </div>
              </div>
            </div>
          </div>
        </PremiumContent>

        {/* Admin Pricing Controls */}
        <AdminOnly>
          <div className="card mb-6 border-2 border-red-200">
            <div className="p-6 bg-red-50">
              <h2 className="heading-2 text-red-800 mb-4">⚙️ Admin Pricing Controls</h2>
              <div className="flex gap-3">
                <button className="btn-secondary text-sm">Edit Pricing</button>
                <button className="btn-secondary text-sm">View Analytics</button>
                <button className="btn-secondary text-sm">Client Dashboard</button>
              </div>
            </div>
          </div>
        </AdminOnly>

        <div className="card">
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
                className="flex items-center gap-4 p-4 border-b border-var(--border-subtle) last:border-0 hover:bg-var(--surface-elevated) transition-colors"
              >
                <span className="text-small font-mono font-bold text-var(--text-tertiary) w-8">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="btn-secondary text-xs px-2 py-1">
                      {option.duration}
                    </span>
                    <span className="font-mono font-bold text-var(--system-blue)">
                      {option.price}
                    </span>
                  </div>
                  <p className="body-text">{option.short_description}</p>
                </div>
              </div>
            ),
          )}
          <div className="p-4 border-t border-var(--border-subtle) bg-var(--surface-elevated)">
            <p className="text-small text-var(--text-secondary)">
              * Nonrefundable upfront payment
            </p>
          </div>
        </div>
      </div>

      <Navigation />
      <SocialLinks />
      <CompanyInfo />
    </main>
  );
}
