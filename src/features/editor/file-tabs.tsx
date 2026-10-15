"use client";

import { FileCode2 } from "lucide-react";
import { cn } from "@/lib/utils";

const LANGUAGE_BADGES: Record<string, string> = {
  "index.html": "HTML",
  "style.css": "CSS",
  "app.js": "JS",
  "index.php": "PHP",
};

export interface FileTabsProps {
  files: string[];
  active: string;
  onSelect: (file: string) => void;
}

export function FileTabs({ files, active, onSelect }: FileTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-border/70 bg-muted/50 px-2 py-1.5">
      {files.map((file) => {
        const isActive = file === active;
        return (
          <button
            key={file}
            type="button"
            onClick={() => onSelect(file)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors",
              isActive
                ? "bg-primary/12 text-primary shadow-[inset_0_0_0_1px] shadow-primary/35"
                : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
            )}
          >
            <FileCode2 className="h-3.5 w-3.5" />
            {file}
            <span className="rounded bg-foreground/10 px-1 text-[9px] uppercase tracking-wider">
              {LANGUAGE_BADGES[file] ?? "TXT"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
