"use client";

import clsx from "clsx";
import type { NoteType } from "@/lib/types";

const TYPES: NoteType[] = ["Idea", "Quote", "Observation", "Project Note", "Journal"];

export const TypeSelector = ({ value, onChange }: { value: NoteType; onChange: (value: NoteType) => void }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {TYPES.map((type) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={clsx(
            "rounded-full border px-3 py-1 text-xs font-medium transition duration-200",
            value === type
              ? "border-transparent bg-accent text-white"
              : "border-border bg-surface text-muted hover:border-accent/40 hover:text-text"
          )}
        >
          {type}
        </button>
      ))}
    </div>
  );
};
