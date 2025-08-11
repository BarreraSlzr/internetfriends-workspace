"use client";

import { PropsWithChildren, useMemo } from "react";
import content from "../content.json";
import NoiseFilter from "./backgrounds/noise-filter-div";
import { motion } from "framer-motion";

import { HeroVignette } from "@/components/effects/dark-vignette";

const DefaultHero = () => (
  <div className="text-3xl md:text-4xl lg:text-5xl leading-relaxed text-foreground">
    <h1
      className="font-bold font-[family:var(--font-display)] tracking-tight"
      style={{ letterSpacing: "var(--letter-spacing-display, -0.015em)" }}
    >
      {content.hero.title}
    </h1>
    <p className="text-lg mb-6 font-mono text-muted-foreground">
      {content.hero.description}
    </p>
  </div>
);

type Props = {
  className?: string;
};

export default function HeroText({
  children = <DefaultHero />,
  className,
}: PropsWithChildren<Props>) {
  return (
    <section className={`relative min-h-[60vh] ${className}`}>
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 glass-stack">
        {/* Single ambient noise for entire page */}
        <NoiseFilter
          className="mix-blend-overlay"
          role="ambient"
          strength="normal"
        />

        <HeroVignette />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/50 to-background/70 backdrop-blur-[1px]" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative sm:px-6 px-2 md:px-8 py-12 max-w-4xl text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
      >
        {children}
      </motion.div>
    </section>
  );
}
