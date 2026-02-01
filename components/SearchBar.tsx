"use client";

import { Search } from "lucide-react";
import clsx from "clsx";
import { useAppStore } from "@/lib/store";
import { useEffect, useRef } from "react";

const isTypingTarget = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null;
  if (!target) return false;
  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || target.isContentEditable;
};

export const SearchBar = ({ className }: { className?: string }) => {
  const { searchQuery, setSearch } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (isTypingTarget(event)) return;
      if (event.key === "/") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className={clsx("relative w-full max-w-xl", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        ref={inputRef}
        value={searchQuery}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search notes, tags, sources..."
        className="input pl-9"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">/</span>
    </div>
  );
};
