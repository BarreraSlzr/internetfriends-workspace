"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Sun, Moon, Monitor } from "lucide-react";
import content from "../content.json";
import NoiseFilter from "./backgrounds/noise-filter-div";
import { getRandomColors } from "../lib/color-palette";
import { BgGoo } from "./backgrounds/gloo";
import { useTheme } from "@/hooks/use-theme";

export default function Header() {
  const randomColors = getRandomColors();
  const { theme, toggleTheme, isDark } = useTheme();
  return (
    <header className="flex items-center justify-between sm:p-6 p-2 py-4 md:p-8 rounded-t-lg surface-glass border-accent-medium">
      <Link href="/">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center h-10 w-32 rounded bg-gradient-to-br from-orange-500 to-pink-500 overflow-hidden">
            <div
              className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 mix-blend-overlay"
              aria-hidden="true"
            >
              <NoiseFilter className="opacity-40 mix-blend-color" />
              <BgGoo
                speed={0.2}
                resolution={1.0}
                depth={3}
                seed={0.4}
                color1={randomColors[0]}
                color2={randomColors[1]}
                color3={randomColors[2]}
              />
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
          className="glass-stack glass-noise-overlay glass-layer-3 p-2 rounded-md border border-accent-medium hover:border-accent-strong transition-all duration-200"
          title="Toggle theme"
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-yellow-400" />
          ) : (
            <Moon className="h-4 w-4 text-blue-400" />
          )}
        </button>
        <Link
          href="/samples"
          className="flex items-center gap-1 hover:opacity-70 transition-opacity"
        >
          Public work samples
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
