import { generateStamp } from "@/lib/utils/timestamp";
"use client";
/**
 * client-layout.tsx - Client-side wrapper for layout components
 *
 * Handles client-only components that can't be imported directly in Server Components:
 * - ClientRUMWrapper (performance monitoring)
 * - Clean, flat UI approach by default
 * - Gloo backgrounds only where strategically placed
 */

import { ClientRUMWrapper } from "@/components/perf/client-rum-wrapper";

export function ClientLayout() {
  return (
    <>
      {/* Subtle base layer that allows gloo backgrounds to show through */}
      <div
        className="fixed inset-0 -z-50"
        style={{
          background:
            "linear-gradient(135deg, rgba(var(--background-rgb, 255,255,255), 0.95) 0%, rgba(var(--background-rgb, 255,255,255), 0.92) 50%, rgba(var(--background-rgb, 255,255,255), 0.95) 100%)",
        }}
      />
      <ClientRUMWrapper />
    </>
  );
}

export default ClientLayout;
