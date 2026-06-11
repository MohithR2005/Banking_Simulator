import type React from "react";
import { cn } from "@/lib/utils";

type PaperShaderBackgroundProps = React.ComponentProps<"div"> & {
  intensity?: number;
  speed?: number;
};

export function PaperShaderBackground({
  intensity = 1,
  speed = 1,
  className,
}: PaperShaderBackgroundProps) {
  return (
    <div
      className={cn("paper-shader-bg", className)}
      style={{
        "--shader-intensity": intensity,
        "--shader-speed": `${18 / speed}s`,
      } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className="paper-shader-bg__mesh" />
      <div className="paper-shader-bg__orbit paper-shader-bg__orbit--one" />
      <div className="paper-shader-bg__orbit paper-shader-bg__orbit--two" />
      <div className="paper-shader-bg__grain" />
    </div>
  );
}
