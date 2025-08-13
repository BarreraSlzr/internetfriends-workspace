import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Sun } from "lucide-react";
import React from "react";
import content from "../content.json";

export default function HeaderSimple() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b">
      <div className="flex items-center justify-between p-4 sm:p-6 md:p-8">
        <Link href="/">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center h-10 w-32 rounded overflow-hidden bg-gray-100 border shadow-sm">
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
            className="p-2 rounded border hover:bg-gray-50 transition-colors"
            title="Toggle theme"
          >
            <Sun className="h-4 w-4" />
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
    </header>
  );
}
