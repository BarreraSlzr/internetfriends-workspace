import { generateStamp } from "@/lib/utils/timestamp";
// InternetFriends Accent System Demo Page
// Test page to showcase the modernized SCSS design system with accent tokens

// Force dynamic rendering to bypass SSR hook issues
export const dynamic = "force-dynamic";

import React from "react";
import AccentDemo from "../../components/demo/accent-demo";

export default function AccentDemoPage() {
  return (
    <>
      <head>
        <title>Accent Token System Demo - InternetFriends</title>
        <meta
          name="description"
          content="Interactive demo of the InternetFriends design system accent token integration"
        />
      </head>
      <AccentDemo />
    </>
  );
}
