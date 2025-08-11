"use client";
/**
 * client-layout.tsx - Client-side wrapper for layout components
 *
 * Handles client-only components that can't be imported directly in Server Components:
 * - GlooClient (WebGL background)
 * - ClientRUMWrapper (performance monitoring)
 * - Other client-side features
 */

import { GlooClient } from "@/app/(internetfriends)/components/gloo-client";
import { ClientRUMWrapper } from "@/components/perf/client-rum-wrapper";

export function ClientLayout() {
  return (
    <>
      <GlooClient />
      <ClientRUMWrapper />
    </>
  );
}

export default ClientLayout;
