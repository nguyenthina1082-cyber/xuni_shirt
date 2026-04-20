"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface GlowingEffectProps {
  blur?: number;
  variant?: "default" | "white";
  glow?: boolean;
  className?: string;
  disabled?: boolean;
}

const GRADIENT_COLORS = [
  "#dd7bbb",
  "#d79f1e",
  "#5a922c",
  "#4c7894",
  "#dd7bbb",
];

export const GlowingEffect = memo(
  ({
    blur = 40,
    variant = "default",
    glow = false,
    className,
    disabled = true,
  }: GlowingEffectProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const lastAngleRef = useRef(0);
    const animationRef = useRef<number | null>(null);

    const handleMove = useCallback((e: MouseEvent) => {
      if (!containerRef.current) return;

      const element = containerRef.current;
      const { left, top, width, height } = element.getBoundingClientRect();

      const centerX = left + width / 2;
      const centerY = top + height / 2;

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const inactiveRadius = 0.5 * Math.min(width, height) * 0.7;
      const distance = Math.hypot(mouseX - centerX, mouseY - centerY);

      if (distance < inactiveRadius) {
        setIsActive(false);
        return;
      }

      const isNearby =
        mouseX > left - 50 &&
        mouseX < left + width + 50 &&
        mouseY > top - 50 &&
        mouseY < top + height + 50;

      setIsActive(isNearby);

      if (isNearby) {
        const angle =
          (180 * Math.atan2(mouseY - centerY, mouseX - centerX)) / Math.PI +
          90;
        lastAngleRef.current = angle;
        setRotation(angle);
      }
    }, []);

    useEffect(() => {
      if (disabled) return;

      const handlePointerMove = (e: PointerEvent) => handleMove(e);

      document.body.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });

      return () => {
        document.body.removeEventListener("pointermove", handlePointerMove);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [handleMove, disabled]);

    if (disabled) return null;

    const gradientStyle =
      variant === "white"
        ? "white"
        : `conic-gradient(from ${rotation}deg at 50% 50%, ${GRADIENT_COLORS.join(", ")})`;

    return (
      <div
        ref={containerRef}
        className={cn(
          "pointer-events-none absolute -inset-2 overflow-hidden rounded-2xl",
          className
        )}
        style={{
          opacity: isActive ? 0.8 : 0.3,
          transition: "opacity 0.3s ease",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: gradientStyle,
            filter: `blur(${blur}px)`,
          }}
        />
        <div
          className="absolute inset-0 rounded-2xl border-2"
          style={{
            borderColor:
              variant === "white"
                ? "rgba(255,255,255,0.5)"
                : "rgba(255,255,255,0.2)",
          }}
        />
      </div>
    );
  }
);

GlowingEffect.displayName = "GlowingEffect";
