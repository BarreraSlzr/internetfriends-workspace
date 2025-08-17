"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface CardDescriptionToggleProps {
  description: string;
}

export function CardDescriptionToggle({
  description,
}: CardDescriptionToggleProps) {
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the 'md' breakpoint in Tailwind
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setIsDescriptionVisible(!isMobile);
  }, [isMobile]);

  // const handleTouch = () => {
  //   if (isMobile) {
  //     setIsDescriptionVisible(prev => !prev)
  //   }
  // }

  return (
    <div
    // onTouchStart={handleTouch}
    >
      <p
        className={cn(
          "text-lg text-muted-foreground transition-all duration-300 text-inherit",
          isDescriptionVisible ? "block" : "hidden",
        )}
      >
        {description}
      </p>
    </div>
  );
}
