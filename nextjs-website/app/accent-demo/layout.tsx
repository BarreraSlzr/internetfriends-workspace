
// InternetFriends Accent Demo Layout
// Layout with required CSS imports for accent token system demonstration

import React from "react";
import "../../styles/design-tokens.css";
import "../../styles/accent-global.css";

export default function AccentDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="accent-demo-layout">
      {children}
    </div>
  );
}
