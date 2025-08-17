import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import content from "../content.json";

export default function Navigation() {
  return (
    <nav
      className="sm:px-6 px-2 md:px-8 flex flex-wrap gap-8 border-b bg-background border-border"
      aria-label="Main Navigation"
    >
      {content.navigation.map((item) => (
        <Link
          key={item}
          href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
          className="flex items-center gap-1 hover:opacity-70 transition-opacity text-foreground dark:text-gray-300"
        >
          <ArrowUpRight className="h-4 w-4 rotate-45" />
          {item}
        </Link>
      ))}
    </nav>
  );
}

