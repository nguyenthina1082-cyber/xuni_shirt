"use client";

import { useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

export function TiltCard({ children, className, maxTilt = 10 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]), {
    stiffness: 300,
    damping: 30,
  });

  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = (e.clientX - rect.left - width / 2) / (width / 2);
    const y = (e.clientY - rect.top - height / 2) / (height / 2);

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <div
      ref={ref}
      className={cn("perspective-1000", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div
        style={
            {
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            } as React.CSSProperties
          }
          className="relative"
        >
          <div
            className={cn(
              "relative z-10 transition-shadow duration-500",
              isHovered && "shadow-2xl"
            )}
            style={{ transform: "translateZ(20px)" } as React.CSSProperties}
          >
          {children}
        </div>

        <div
          className={cn(
            "absolute inset-0 rounded-2xl opacity-0 blur-xl transition-opacity duration-500",
            isHovered && "opacity-30"
          )}
          style={{
            background: "linear-gradient(135deg, rgba(221,123,187,0.5), rgba(215,159,30,0.5), rgba(90,146,44,0.5), rgba(76,120,148,0.5))",
            transform: "translateZ(-20px)",
          }}
        />
      </div>
    </div>
  );
}
