import { ReactNode } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { GlassPanel } from "@/components/glass";
import { Code2, Layers3, BarChart3, Settings, Home } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dev Tools - InternetFriends",
  description: "Internal development tools and component explorer",
  robots: {
    index: false,
    follow: false,
  },
};

interface DevLayoutProps {
  children: ReactNode;
}

export default function DevLayout({ children }: DevLayoutProps) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 hover:opacity-70 transition-opacity"
              >
                <Home className="h-5 w-5" />
                <span className="text-sm text-muted-foreground">
                  ← Back to Site
                </span>
              </Link>

              <div className="w-px h-6 bg-border" />

              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-semibold">
                  InternetFriends Dev Tools
                </h1>
              </div>
            </div>

            <div className="text-xs text-muted-foreground font-mono">
              NODE_ENV: {process.env.NODE_ENV}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1">
            <NavLink href="/dev/component-map" icon={Layers3}>
              Component Map
            </NavLink>

            <NavLink href="/dev/tokens" icon={Settings}>
              Token Inspector
            </NavLink>

            <NavLink href="/dev/metrics" icon={BarChart3} disabled>
              Performance Metrics
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}

interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: ReactNode;
  disabled?: boolean;
}

function NavLink({
  href,
  icon: Icon,
  children,
  disabled = false,
}: NavLinkProps) {
  if (disabled) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground/50 cursor-not-allowed">
        <Icon className="h-4 w-4" />
        {children}
        <span className="text-xs">(Soon)</span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-accent/50 transition-colors rounded-t-md border-b-2 border-transparent hover:border-primary/30"
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}
