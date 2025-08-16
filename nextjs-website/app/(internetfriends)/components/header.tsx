"use client";

import { ArrowUpRight, Moon, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import content from "../content.json";

import { GlassCardAtomic } from "@/components/atomic/glass-card/glass-card.atomic";
import { HeaderVignette } from "@/components/effects/dark-vignette";
import { useHeaderOrbit } from "@/hooks/use-header-orbit";
import { useTheme } from "@/hooks/use-theme";

export default function Header() {
  const { toggleTheme, isDark } = useTheme();
  const { transform, isScrolled, headerRef } = useHeaderOrbit({
    radius: 3,
    scrollThreshold: 50,
    scrolledScale: 0.96,
    verticalCompression: 0.5,
    orbitDistance: 200,
  });

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 transition-all duration-300 ease-in-out"
      style={{
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
        willChange: "transform",
      }}
      data-scrolled={isScrolled}
    >
      <GlassCardAtomic
        variant="header"
        noise={false}
        hover={false}
        className="border-b border-accent-medium rounded-t-lg"
      >
        <div className="flex items-center justify-between p-4 sm:p-6 md:p-8">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center h-10 w-32 rounded overflow-hidden bg-[var(--if-surface-neutral-alt)] border border-[var(--if-hairline)] shadow-sm">
                <div
                  className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 mix-blend-overlay"
                  aria-hidden="true"
                >
                  <HeaderVignette />
                </div>
                <Image
                  className="relative z-10 select-none pointer-events-none"
                  alt={`${content.companyName}.xyz`}
                  width={600}
                  height={600}
                  src="/600x600.jpg"
                  priority
                />
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="transition-all duration-200"
              title="Toggle theme"
            >
              <GlassCardAtomic
                variant="default"
                strength={0.3}
                noise={false}
                hover={true}
                size="sm"
                className="p-2 border border-accent-medium hover:border-accent-strong"
              >
                {isDark ? (
                  <Sun className="h-4 w-4 text-yellow-400" />
                ) : (
                  <Moon className="h-4 w-4 text-[color:var(--if-accent-primary)]" />
                )}
              </GlassCardAtomic>
            </button>
            <Link
              href="/samples"
              className="flex items-center gap-1 hover:opacity-70 transition-opacity"
            >
              Public work samples
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </GlassCardAtomic>
    </header>
  );
}
