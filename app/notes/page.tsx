"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { NoteCard } from "@/components/NoteCard";
import { Skeleton } from "@/components/Skeleton";
import { useToast } from "@/components/ToastProvider";
import { useAppStore } from "@/lib/store";
import type { NoteType } from "@/lib/types";
import { buildComputed, matchQuery } from "@/lib/utils";

const DATE_OPTIONS = [
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "90 days", value: "90" },
  { label: "All", value: "all" },
] as const;

const TYPES: NoteType[] = ["Idea", "Quote", "Observation", "Project Note", "Journal"];

export default function NotesPage() {
  const { notes, loading, searchQuery, filters, setFilters, togglePin, toggleArchive } = useAppStore();
  const [sort, setSort] = useState("newest");
  const [collapsed, setCollapsed] = useState(false);
  const { push } = useToast();

  const tags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((note) => (note.tags ?? []).forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [notes]);

  const filtered = useMemo(() => {
    const now = Date.now();
    const ranges: Record<string, number> = { 7: 7, 30: 30, 90: 90 };
    const timeLimit = filters.dateRange === "all" ? 0 : now - ranges[filters.dateRange] * 24 * 60 * 60 * 1000;

    const base = buildComputed(notes)
      .filter((note) => (filters.archived ? note.archived : !note.archived))
      .filter((note) => filters.types.includes(note.type))
      .filter((note) => (filters.pinnedOnly ? note.pinned : true))
      .filter((note) => (filters.tags.length ? filters.tags.every((tag) => (note.tags ?? []).includes(tag)) : true))
      .filter((note) => (timeLimit ? note.createdAt >= timeLimit : true))
      .filter((note) => matchQuery(note, searchQuery));

    const sorted = [...base];
    switch (sort) {
      case "oldest":
        sorted.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case "linked":
        sorted.sort((a, b) => b.linkScore - a.linkScore);
        break;
      case "updated":
        sorted.sort((a, b) => b.updatedAt - a.updatedAt);
        break;
      default:
        sorted.sort((a, b) => b.createdAt - a.createdAt);
    }
    return sorted;
  }, [notes, filters, searchQuery, sort]);

  return (
    <AppShell title="Notes Library" subtitle="Filter, sort, and explore your entire knowledge system.">
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className={`w-full max-w-xs space-y-6 ${collapsed ? "lg:max-w-[72px]" : ""}`}>
          <button className="btn-ghost w-full" onClick={() => setCollapsed((prev) => !prev)}>
            {collapsed ? "Show filters" : "Hide filters"}
          </button>
          {!collapsed && (
            <>
              <div className="card p-4 space-y-4">
                <h3 className="text-sm font-semibold">Types</h3>
                <div className="space-y-2">
                  {TYPES.map((type) => (
                    <label key={type} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.types.includes(type)}
                        onChange={(event) => {
                          const next = event.target.checked
                            ? [...filters.types, type]
                            : filters.types.filter((item) => item !== type);
                          setFilters({ types: next });
                        }}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
              <div className="card p-4 space-y-3">
                <h3 className="text-sm font-semibold">Date range</h3>
                <div className="flex flex-wrap gap-2">
                  {DATE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilters({ dateRange: option.value })}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        filters.dateRange === option.value
                          ? "border-transparent bg-accent text-white"
                          : "border-border text-muted"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="card p-4 space-y-3">
                <h3 className="text-sm font-semibold">Flags</h3>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.pinnedOnly}
                    onChange={(event) => setFilters({ pinnedOnly: event.target.checked })}
                  />
                  Pinned only
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.archived}
                    onChange={(event) => setFilters({ archived: event.target.checked })}
                  />
                  Show archived
                </label>
              </div>
              <div className="card p-4 space-y-3">
                <h3 className="text-sm font-semibold">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        const exists = filters.tags.includes(tag);
                        setFilters({
                          tags: exists ? filters.tags.filter((item) => item !== tag) : [...filters.tags, tag],
                        });
                      }}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        filters.tags.includes(tag)
                          ? "border-transparent bg-accent text-white"
                          : "border-border text-muted"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                  {!tags.length && <span className="text-xs text-muted">No tags yet.</span>}
                </div>
              </div>
            </>
          )}
        </aside>

        <section className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-muted">{filtered.length} results</div>
            <select className="input max-w-[200px]" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="linked">Most linked</option>
              <option value="updated">Recently updated</option>
            </select>
          </div>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} className="h-32" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onPin={() => togglePin(note.id)}
                  onArchive={() => {
                    toggleArchive(note.id);
                    push(note.archived ? "Restored" : "Archived");
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
