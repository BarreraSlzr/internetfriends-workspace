import { generateStamp } from "@/lib/utils/timestamp";
"use client";
/**
 * client-wrapper.tsx - Client-side wrapper for GlooGlobal
 * Enables dynamic import with SSR disabled in Next.js App Router
 */

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import type { GlooGlobalProps } from "./types";

// Properly isolated dynamic import
const GlooGlobalDynamic = dynamic(
  () =>
    import("./global.organism").then((mod) => ({
      default: mod.GlooGlobalOrganism,
    })),
  {
    ssr: false,
    loading: () => null,
  },
);

export const GlooGlobalClient: React.FC<GlooGlobalProps> = (props) => {
  // Only render on client side
  if (typeof window === "undefined") {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <GlooGlobalDynamic {...props} />
    </Suspense>
  );
};

export default GlooGlobalClient;
