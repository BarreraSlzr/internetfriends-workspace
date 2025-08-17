import Link from "next/link";
import { platformNames } from "@/lib/data/platform-urls";

export default function SocialLinks() {
  return (
    <div className="sm:px-6 px-2 md:px-8 flex flex-wrap gap-6 border-b bg-background border-border">
      {platformNames.map((platform) => (
        <Link
          key={platform}
          href={`/redirect/${platform.toLowerCase()}`}
          className="capitalize hover:opacity-70 transition-opacity text-foreground dark:text-gray-300"
          aria-label={`Follow us on ${platform}`}
        >
          {platform}
        </Link>
      ))}
    </div>
  );
}

