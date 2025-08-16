import React from "react";

/**
 * Engineering Interface Demo Page
 * Showcases the new sophisticated, minimal design system
 */
import Link from "next/link";

export default function EngineeringInterfacePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              InternetFriends
            </h1>
            <nav className="flex gap-1">
              <Link href="/" className="nav-item">
                Home
              </Link>
              <Link href="/contact" className="nav-item active">
                Contact
              </Link>
              <Link href="/pricing" className="nav-item">
                Pricing
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <div className="content-container">
          <div className="text-center mb-12">
            <h1 className="heading-1 mb-4">Engineering Interface</h1>
            <p className="text-secondary text-lg max-w-2xl mx-auto">
              Clean, minimal design language inspired by sophisticated
              engineering tools. Strategic use of color, purposeful spacing,
              functional aesthetics.
            </p>
          </div>

          {/* Component Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Buttons */}
            <div className="card p-6">
              <h2 className="heading-2 mb-4">Buttons</h2>
              <div className="flex flex-col gap-3">
                <button className="btn-primary">Primary Action</button>
                <button className="btn-secondary">Secondary Action</button>
              </div>
            </div>

            {/* Form Elements */}
            <div className="card p-6">
              <h2 className="heading-2 mb-4">Form Elements</h2>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="input"
                />
                <input
                  type="email"
                  placeholder="Email address"
                  className="input"
                />
              </div>
            </div>

            {/* Status Indicators */}
            <div className="card p-6">
              <h2 className="heading-2 mb-4">Status</h2>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-status-success"></div>
                  <span className="status-success">System operational</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-status-warning"></div>
                  <span className="status-warning">Minor delays</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-status-danger"></div>
                  <span className="status-danger">Service unavailable</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-system-blue"></div>
                  <span className="status-info">Information</span>
                </div>
              </div>
            </div>

            {/* Cards */}
            <div className="card-elevated p-6">
              <h2 className="heading-2 mb-2">Elevated Card</h2>
              <p className="body-text mb-4">
                This card has subtle elevation with minimal shadows. Perfect for
                containing related information.
              </p>
              <div className="text-small text-tertiary">
                Subtle visual hierarchy through typography.
              </div>
            </div>

            {/* Loading State */}
            <div className="card p-6">
              <h2 className="heading-2 mb-4">Loading</h2>
              <div className="flex items-center gap-3">
                <div className="loading-indicator"></div>
                <span className="body-text">Processing request...</span>
              </div>
            </div>

            {/* Typography Scale */}
            <div className="card p-6">
              <h2 className="heading-2 mb-4">Typography</h2>
              <div className="space-y-2">
                <div className="heading-1">Heading Large</div>
                <div className="heading-2">Heading Medium</div>
                <div className="body-text">Body text for regular content</div>
                <div className="text-small">Small text for secondary info</div>
              </div>
            </div>
          </div>

          {/* Hero Section Demo */}
          <div className="mt-16 p-12 border border-subtle rounded-lg text-center">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Clean Engineering Aesthetics
            </h1>
            <p className="text-xl text-secondary mb-8 max-w-3xl mx-auto">
              Strategic use of color draws attention to important actions and
              status. Everything else uses purposeful grays that create clear
              visual hierarchy without competing for attention.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="btn-primary">Get Started</button>
              <button className="btn-secondary">Learn More</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
