"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import content from "../content.json";

import { useTheme } from "@/hooks/use-theme";
import { GlassPanel } from "@/components/glass";
import { HeaderVignette } from "@/components/effects/dark-vignette";

export default function Header() {
  const { toggleTheme, isDark } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <GlassPanel
      as="header"
      depth={3}
      noise="weak"
      elevation={2}
      className={`
        sticky top-0 z-50 flex items-center justify-between sm:p-6 p-2 py-4 md:p-8
        border-b border-accent-medium rounded-t-lg
        transition-all duration-300 ease-in-out
        ${isScrolled ? "rounded-t-lg rounded-b-none shadow-sm" : "rounded-t-lg rounded-b-none"}
      `}
      data-scrolled={isScrolled}
    >
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
        <GlassPanel
          as="button"
          depth={2}
          noise="none"
          elevation={1}
          onClick={toggleTheme}
          className="p-2 rounded-md border border-accent-medium hover:border-accent-strong transition-all duration-200"
          title="Toggle theme"
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-yellow-400" />
          ) : (
            <Moon className="h-4 w-4 text-[color:var(--if-accent-primary)]" />
          )}
        </GlassPanel>
        <Link
          href="/samples"
          className="flex items-center gap-1 hover:opacity-70 transition-opacity"
        >
          Public work samples
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </GlassPanel>
  );
}
