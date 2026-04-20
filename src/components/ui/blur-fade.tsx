"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface BlurFadeProps {
  children: React.ReactNode;
  delay?: number;
  inView?: boolean;
  className?: string;
}

export function BlurFade({ children, delay = 0, inView = true, className }: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!inView || hasInitialized.current) {
      setIsVisible(true);
      return;
    }

    hasInitialized.current = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [inView]);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? "opacity-100 blur-0 translate-y-0" : "opacity-0 blur-sm translate-y-4",
        className
      )}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}
