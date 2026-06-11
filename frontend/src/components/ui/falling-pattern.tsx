import type React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type FallingPatternProps = React.ComponentProps<"div"> & {
  color?: string;
  backgroundColor?: string;
  duration?: number;
  blurIntensity?: string;
  density?: number;
};

export function FallingPattern({
  color = "rgba(88, 210, 176, .55)",
  backgroundColor = "#070b14",
  duration = 80,
  blurIntensity = "1em",
  density = 1,
  className,
}: FallingPatternProps) {
  const patterns = Array.from({ length: 12 }, (_, index) => {
    const x = index * 25;
    const y = 130 + ((index * 47) % 170);
    return [
      `radial-gradient(3px 90px at ${x}px ${y}px, ${color}, transparent)`,
      `radial-gradient(1.5px 1.5px at ${x + 150}px ${y / 2}px, ${color} 100%, transparent 150%)`,
    ];
  }).flat();
  const sizes = patterns.map((_, index) => `300px ${160 + (index % 7) * 19}px`).join(", ");
  const starts = patterns.map((_, index) => `${(index * 29) % 430}px ${(index * 113) % 380}px`).join(", ");
  const ends = patterns.map((_, index) => `${(index * 29) % 430}px ${7000 + index * 311}px`).join(", ");

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor, backgroundImage: patterns.join(", "), backgroundSize: sizes }}
        initial={{ opacity: 0, backgroundPosition: starts }}
        animate={{ opacity: 1, backgroundPosition: ends }}
        transition={{ opacity: { duration: 0.5 }, backgroundPosition: { duration, ease: "linear", repeat: Infinity } }}
      />
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: `blur(${blurIntensity})`,
          backgroundImage: `radial-gradient(circle, transparent 0, transparent 2px, ${backgroundColor} 2px)`,
          backgroundSize: `${8 * density}px ${8 * density}px`,
          opacity: 0.44,
        }}
      />
    </div>
  );
}
