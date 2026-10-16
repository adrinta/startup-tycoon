"use client";

import { Maximize2, Monitor, ScanSearch, Smartphone, Tablet } from "lucide-react";
import { cn } from "@/lib/utils";
import { VIEWPORT_DIMENSIONS, type PreviewViewport } from "@/features/sandbox/viewport";

const VIEWPORT_BUTTONS: Array<{
  value: PreviewViewport;
  label: string;
  icon: typeof Monitor;
  title: string;
}> = [
  { value: "fit", label: "Fit", icon: Maximize2, title: "Ikuti ukuran panel" },
  { value: "desktop", label: "Desktop", icon: Monitor, title: "Preview desktop — 1280px" },
  { value: "tablet", label: "Tablet", icon: Tablet, title: "Preview tablet — 768px" },
  { value: "mobile", label: "Mobile", icon: Smartphone, title: "Preview mobile — 390px" },
];

const LEGEND: Array<{ label: string; color: string }> = [
  { label: "Content", color: "rgba(111, 168, 220, 0.85)" },
  { label: "Padding", color: "rgba(147, 196, 125, 0.85)" },
  { label: "Border", color: "rgba(255, 229, 153, 0.95)" },
  { label: "Margin", color: "rgba(246, 178, 107, 0.9)" },
];

export interface PreviewToolbarProps {
  viewport: PreviewViewport;
  onViewportChange: (viewport: PreviewViewport) => void;
  xray: boolean;
  onXrayChange: (enabled: boolean) => void;
}

export function PreviewToolbar({
  viewport,
  onViewportChange,
  xray,
  onXrayChange,
}: PreviewToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b border-border/70 bg-muted/30 px-2 py-1">
      <div className="flex items-center gap-0.5">
        {VIEWPORT_BUTTONS.map(({ value, label, icon: Icon, title }) => (
          <button
            key={value}
            type="button"
            title={title}
            aria-pressed={viewport === value}
            onClick={() => onViewportChange(value)}
            className={cn(
              "flex items-center gap-1 rounded px-1.5 py-1 font-mono text-[10px] transition-colors",
              viewport === value
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{label}</span>
            {value !== "fit" && (
              <span className="hidden text-[9px] opacity-70 xl:inline">
                {VIEWPORT_DIMENSIONS[value].width}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {xray && (
          <span className="hidden items-center gap-2 md:flex">
            {LEGEND.map((entry) => (
              <span
                key={entry.label}
                className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground"
              >
                <span
                  className="h-2.5 w-2.5 rounded-[3px] border border-black/20"
                  style={{ background: entry.color }}
                />
                {entry.label}
              </span>
            ))}
          </span>
        )}
        <button
          type="button"
          title="X-Ray Box Model — tampilkan area margin/padding/border/content"
          aria-pressed={xray}
          onClick={() => onXrayChange(!xray)}
          className={cn(
            "flex items-center gap-1 rounded px-1.5 py-1 font-mono text-[10px] transition-colors",
            xray
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
          )}
        >
          <ScanSearch className="h-3.5 w-3.5" />
          X-Ray
        </button>
      </div>
    </div>
  );
}
