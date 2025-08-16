import React from "react";

// Force dynamic rendering to avoid SSR hook issues
export const dynamic = "force-dynamic";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-4 font-mono text-foreground">
          404 - Page Not Found
        </h1>
        <p className="text-lg mb-6 text-muted-foreground">
          This page doesn't exist... yet.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-1 hover:opacity-70 transition-opacity text-primary"
        >
          Go Home
        </a>
      </div>
    </main>
  );
}
